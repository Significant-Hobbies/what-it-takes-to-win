import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { handleReadability, identity } from '../lib/readability.mjs';
const dist = join(process.cwd(), 'dist');
const routes = JSON.parse(await readFile(join(dist, 'api/md/_catalog'), 'utf8'));
const assets = { async fetch(request) {
  const path = new URL(request.url).pathname;
  try { return new Response(await readFile(join(dist, decodeURIComponent(path))), { headers: { 'content-type': path.endsWith('.md') ? 'text/markdown' : path.endsWith('.txt') ? 'text/plain' : 'application/json' } }); }
  catch { return new Response('missing', { status: 404 }); }
} };
async function htmlFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await htmlFiles(file));
    else if (entry.name.endsWith('.html')) result.push(file);
  }
  return result;
}

test('every indexable HTML page has one canonical public Markdown registration', async () => {
  const urls = new Set(routes.map((route) => route.url));
  assert.equal(urls.size, routes.length);
  let indexable = 0, noindex = 0, redirects = 0;
  for (const file of await htmlFiles(dist)) {
    const html = await readFile(file, 'utf8');
    if (/http-equiv="refresh"/i.test(html)) { redirects++; continue; }
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    if (!canonical) { assert.match(file, /404\.html$/); continue; }
    if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html)) {
      assert.ok(!urls.has(canonical), `noindex excluded: ${canonical}`);
      assert.ok(!html.includes('name="ai-summary"'), canonical);
      assert.ok(!html.includes('type="text/markdown"'), canonical);
      noindex++; continue;
    }
    assert.ok(urls.has(canonical), `public registration: ${canonical}`);
    const row = routes.find((route) => route.url === canonical);
    assert.ok(html.includes(`href="${row.md}"`), `absolute alternate: ${canonical}`);
    assert.match(html, /name="ai-summary"/);
    indexable++;
  }
  assert.equal(indexable, routes.length);
  console.log(JSON.stringify({ registered: routes.length, indexable, noindex, redirects }));
});

test('every registered mirror is source content with canonical headers and absolute links', async () => {
  for (const route of routes) {
    const response = await handleReadability(new Request(route.md), assets);
    assert.equal(response.status, 200, route.path);
    assert.equal(response.headers.get('content-location'), route.url);
    assert.match(response.headers.get('content-type'), /text\/markdown/);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    const body = await response.text();
    assert.ok(body.includes(`Canonical: ${route.url}`), route.path);
    assert.ok(body.length > 200, route.path);
    const withoutCode = body.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`]*`/g, '');
    assert.ok(!/\]\((?:\/[^/]|#|\.\.\/)/.test(withoutCode), `absolute links: ${route.path}`);
  }
});

test('full export bounded, private and research paths absent, training policy consistent', async () => {
  const full = await handleReadability(new Request(identity.url + '/llms-full.txt'), assets);
  assert.equal(full.status, 200);
  const body = await full.text();
  assert.ok(body.length <= 500000);
  assert.match(body, /Included \d+ of \d+ registered public pages/);
  for (const path of ['/admin/secret.md', '/auth/secret.md', '/api/md/first-proof/research/private', '/api/md/dashboard/private']) {
    const response = await handleReadability(new Request(identity.url + path), assets);
    assert.ok(response === null || response.status === 404, path);
  }
  assert.ok(!routes.some((row) => /\/research\//.test(row.path)));
  await assert.rejects(access(join(dist, 'first-proof/research.md')));
  await assert.rejects(access(join(dist, 'first-proof/research/001.md')));
  const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
  for (const bot of ['GPTBot','ClaudeBot','Google-Extended','Applebot-Extended','CCBot','Bytespider']) assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /\n`));
  console.log(JSON.stringify({ fullCharacters: body.length, routes: routes.length }));
});


test('authored worksheet and interpretation constraints survive full source rendering', async () => {
  const roi = await readFile(join(dist, 'roi.md'), 'utf8');
  for (const phrase of ['## Formulas', 'Expected gross value', 'Foundation work is real work', 'sends no entered data', 'calls no AI model']) assert.ok(roi.includes(phrase), phrase);
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const guide = await (await handleReadability(new Request(identity.url + '/' + name), assets)).text();
    for (const phrase of ['cannot estimate causal effects', "individual's probability of success", '/person/{id}.md', '/am-i-the-next/{id}.md']) assert.ok(guide.includes(phrase), `${name}: ${phrase}`);
  }
  const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
  for (const group of robots.split('\n\n').filter((value) => value.startsWith('User-agent:'))) {
    const training = /^User-agent: (GPTBot|ClaudeBot|Google-Extended|Applebot-Extended|CCBot|Bytespider)\n/.test(group);
    assert.equal(group.includes('Disallow: /first-proof/research'), training);
  }
});
