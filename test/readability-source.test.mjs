import assert from 'node:assert/strict';
import test from 'node:test';
import { node, finishDocument, joinContent } from '../src/scripts/readability-format.mjs';
import { createSourceRenderer } from '../src/scripts/readability-source.mjs';
import { turningPoints } from '../src/data/turning-points.mjs';
import { luckCases } from '../src/data/luck-cases.mjs';

test('source formatter retains links, headings, code, zero and visible repeated text', async () => {
  assert.equal(await node('h2', {}, ['A\n heading']), '\n\n## A heading\n\n');
  assert.equal(await node('a', { href: '/about/' }, [' Read\nmore ']), '[Read more](/about/)');
  assert.equal(await node('div', { hidden: true }, ['Private']), '');
  assert.equal(await node('span', { 'aria-hidden': true }, ['Arrow']), '');
  assert.equal(await joinContent(['Same', 0, ['Same', false]]), 'Same0Same');
  assert.equal(finishDocument('\n  Text\n\n```\n  code\n    nested\n```\n'), 'Text\n\n```\n  code\n    nested\n```\n\n');
});

test('public Astro source renderer follows data, essay metadata, components and case props', async () => {
  const renderer = await createSourceRenderer(process.cwd(), 'https://paths.significanthobbies.com');
  try {
    const overview = await renderer.render('src/pages/overview/index.astro', '/overview/');
    assert.match(overview.body, /## Chart data/);
    assert.match(overview.body, /### Milestone ages/);
    const person = await renderer.render('src/pages/person/[id].astro', '/person/bill-gates/');
    assert.match(person.body, /A computer at school/);
    assert.match(person.body, /Explore the archive/);
    assert.match(person.body, /gatesfoundation\.org/);
    assert.match(person.body, /perseverance/i);
    const essays = await renderer.render('src/pages/essays/index.astro', '/essays/');
    assert.match(essays.body, /published pieces/);
    assert.match(essays.body, /a-three-source-framework/);
    const point = turningPoints[0];
    const turning = await renderer.render('src/pages/turning-points/[id].astro', `/turning-points/${point.id}/`, { point });
    assert.ok(turning.body.includes(point.limit));
    assert.ok(turning.body.includes(point.url));
    const luck = await renderer.render('src/pages/luck/[id].astro', `/luck/${luckCases[0].id}/`);
    assert.ok(luck.body.includes(luckCases[0].title));
    const essay = await renderer.render('src/layouts/Essay.astro', '/essays/fixture/', { frontmatter: { title: 'Fixture', description: 'Summary', subtitle: 'Subtitle', date: '2026-10-26', readingMinutes: 3 } }, '## Authored body\n\n```\n  sample\n```');
    assert.match(essay.body, /Subtitle/);
    assert.match(essay.body, /By Sarthak Agrawal/);
    assert.match(essay.body, /## Authored body/);
    assert.match(essay.body, /\n {2}sample\n/);
  } finally { await renderer.close(); }
});

test('unknown Markdown paths cannot advertise off-origin canonicals', async () => {
  const { createAgentSurfaceManifest } = await import('../src/lib/agent-surfaces/manifest.mjs');
  const { createAgentSurfaceHandler } = await import('../src/lib/agent-surfaces/handler.mjs');
  const fixtureOrigin = 'https://public.example';
  const manifest = createAgentSurfaceManifest({ name: 'Public fixture', url: fixtureOrigin, summary: 'Public fixture', pages: { '/': '# Public' } });
  const handler = createAgentSurfaceHandler({ manifest });
  for (const path of ['/api/md//evil.example/x', '//evil.example/x.md']) {
    const response = await handler(new Request(fixtureOrigin + path));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-location'), fixtureOrigin + '//evil.example/x');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
    assert.ok(response.headers.get('link').includes(fixtureOrigin + '/llms.txt'));
  }
});
