import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import home from '../content/home.json' with { type: 'json' };
import { markdownPathFor } from '../lib/agent-surfaces/http.mjs';
import { identity, robots } from '../lib/readability.mjs';
import { createAgentSurfaceManifest } from '../lib/agent-surfaces/manifest.mjs';
import { buildAiTxt, buildFullMarkdown, buildMarkdownIndex } from '../lib/agent-surfaces/documents.mjs';
import { absoluteMarkdownLinks } from '../lib/agent-surfaces/format.mjs';
import { createSourceRenderer } from './readability-source.mjs';
import { templateMarkdown } from './template-markdown.mjs';

/** Explicit public registry: source templates/data, never rendered HTML or user state. */
export async function generatePublicReadability({ root, dist, paths, people, turningPoints, publishedFirstProofRecords }) {
  const renderer = await createSourceRenderer(root, identity.url);
  const pages = {};
  const routes = [];
  const aliases = Object.fromEntries(paths.map((path) => [markdownPathFor(path), path]));
  const defaultDescription = `Look sideways for information, never for a verdict. ${people.length.toLocaleString()} documented paths showing what people brought, were handed, and were surrounded by, with perseverance and luck held apart.`;
  const emit = async (path, body) => { const file = join(dist, decodeURIComponent(path).replace(/^\//, '')); await mkdir(dirname(file), { recursive: true }); await writeFile(file, body); };
  try {
    for (const path of paths) {
      let result;
      if (path === '/') result = { title: home.page.title, description: home.page.description, body: templateMarkdown(home) };
      else if (/^\/essays\/[^/]+\/$/.test(path)) {
        const name = decodeURIComponent(path.split('/')[2]) + '.md';
        const source = (await readFile(join(root, 'src/pages/essays', name), 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
        result = await renderer.render('src/layouts/Essay.astro', path, { frontmatter: renderer.essayMetadata(name) }, source);
      } else {
        const [group, id] = path.split('/').filter(Boolean);
        const props = group === 'turning-points' ? { point: turningPoints.find((row) => row.id === id) } : group === 'first-proof' && id ? { record: publishedFirstProofRecords.find((row) => row.id === id) } : {};
        const file = id ? `src/pages/${group}/[id].astro` : `src/pages/${group}/index.astro`;
        result = await renderer.render(file, path, props);
      }
      if (result.robots?.includes('noindex')) throw new Error(`Noindex route registered: ${path}`);
      const canonical = new URL(result.canonicalPath || path, identity.url).href;
      if (new URL(canonical).pathname !== path) throw new Error(`Canonical mismatch: ${path}`);
      const title = (result.title || identity.name).replaceAll('Look Sideways', identity.name);
      const description = result.description || defaultDescription;
      let body = result.body;
      if (path === '/explore/') body += initialAtlas(people);
      body = `# ${title}\n\n> ${description}\n\nCanonical: ${canonical}\n\n${body}`;
      pages[path] = absoluteMarkdownLinks(body, canonical, { htmlPathsByMarkdown: aliases });
      const md = new URL(markdownPathFor(path), identity.url).href;
      routes.push({ path, url: canonical, md, title, description });
      await emit(markdownPathFor(path), pages[path]);
      if (routes.length % 500 === 0) console.log(`Public Markdown: ${routes.length}/${paths.length}`);
    }
  } finally { await renderer.close(); }
  const manifest = createAgentSurfaceManifest({ ...identity, pages: {} });
  await emit('/api/md/_catalog', JSON.stringify(routes));
  await emit('/api/md/_identity', JSON.stringify(identity));
  await emit('/llms.txt', buildMarkdownIndex(manifest, routes));
  await emit('/llms-full.txt', await buildFullMarkdown(manifest, routes, (path) => pages[path]));
  await emit('/ai.txt', buildAiTxt(manifest, routes));
  await emit('/robots.txt', robots());
  const xml = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  await emit('/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `<url><loc>${xml(route.url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log(`Generated ${routes.length} source-backed public Markdown routes.`);
}

function initialAtlas(people) {
  const rows = [...people].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 48);
  const factor = (value) => typeof value === 'number' ? value > 0 ? `+${value}` : String(value) : '—';
  return '\n\n## Initial unfiltered atlas\n\n' + rows.map((person) => `### [${person.name}](/person/${encodeURIComponent(person.person_id)}/)\n\n${person.category || ''} · age ${person.age_at_milestone ?? '?'}\n\n${person.milestone_by_age_26 || ''}\n\nWhat they brought: ${factor(person.personal_endowment_score)}; what they were handed: ${factor(person.inherited_leverage_score)}; what surrounded them: ${factor(person.catalytic_ecosystem_score)}; outcome reach: ${person.success_tier === 1 ? 'Extreme public outlier' : person.success_tier === 2 ? 'Field-leading' : 'Professionally distinctive'}.\n`).join('\n') + `\nShowing the initial 48 of ${people.length} public profiles; the [catalog](/api/md/_catalog) lists every profile. Filters and worksheet inputs remain local browser state.\n`;
}
