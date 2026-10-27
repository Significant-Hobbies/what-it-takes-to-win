import home from '../content/home.json' with { type: 'json' };
import { createStaticAssetHandler, advertiseMarkdown } from './agent-surfaces/adapters/static-assets.mjs';
export const identity = {
  name: home.product,
  url: home.url.replace(/\/$/, ''),
  summary: home.page.description,
  contact: home.url + 'about/#conversations',
  sitemap: home.url + 'sitemap.xml',
  openapi: home.url + 'openapi.json',
  trainingAllowed: true,
  updatedAt: '2026-10-26',
  excludedPaths: ['/admin', '/auth', '/dashboard', '/api', '/data', '/first-proof/research'],
};
export const preservedMarkdownPaths = ['/assets/story/README.md', '/fonts/fleet-footer-precise-v1/README.md'];
export const handleReadability = createStaticAssetHandler({ origin: identity.url, preserveMarkdownPaths: preservedMarkdownPaths, prebuiltFullPath: '/llms-full.txt' });
export function robots() {
  const bots = ['*', 'GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
  return bots.map((bot) => `User-agent: ${bot}\nAllow: /\n${identity.excludedPaths.filter((path) => path !== '/first-proof/research').map((path) => `Disallow: ${path}`).join('\n')}\nAllow: /api/ai$\nAllow: /api/md$\nAllow: /api/md/`).join('\n\n') + `\n\nSitemap: ${identity.sitemap}\n# Keep in sync with ai.txt and llms.txt.\n`;
}
const catalogs = new WeakMap();
export async function advertisePublic(request, response, assets) {
  if (!assets || !response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
  let pending = catalogs.get(assets);
  if (!pending) {
    pending = assets.fetch(new Request(identity.url + '/api/md/_catalog')).then(async (value) => {
      if (!value.ok || value.headers.get('content-type')?.includes('text/html')) throw new Error('Public catalog unavailable');
      const rows = await value.json();
      if (!Array.isArray(rows)) throw new Error('Invalid public catalog');
      return new Map(rows.map((row) => [row.path.replace(/\/$/, '') || '/', row]));
    });
    catalogs.set(assets, pending);
  }
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';
    const row = (await pending).get(path);
    return row ? advertiseMarkdown(response, identity.url, new URL(row.md).pathname) : response;
  } catch { catalogs.delete(assets); return response; }
}
