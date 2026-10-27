import { markdownResponse } from '../src/lib/agent-surfaces/http.mjs';
import { handleReadability, advertisePublic, identity, preservedMarkdownPaths } from '../src/lib/readability.mjs';

type Assets = { fetch: (request: Request) => Promise<Response> };
export async function onRequest(context: {
  request: Request;
  env?: { ASSETS?: Assets };
  next: (input?: Request) => Promise<Response>;
}): Promise<Response> {
  const { request } = context;
  const path = new URL(request.url).pathname;
  const assets = context.env?.ASSETS ?? { fetch: (input: Request) => context.next(input) };
  const readable = await handleReadability(request, assets);
  if (readable) return readable;

  // Keep the existing static public API contract and JSON error behavior.
  if (path.startsWith('/api/') && path !== '/api/ai') {
    return Response.json({ error: { code: 'not_found', message: `Unknown API path: ${path}`, path } }, {
      status: 404,
      headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
    });
  }
  if (path.endsWith('.md') && !preservedMarkdownPaths.includes(path) && !path.startsWith('/.well-known/') && !['/agents.md', '/AGENTS.md', '/skill.md', '/SKILL.md'].includes(path)) {
    const canonical = identity.url + path.replace(/\.md$/, '');
    const response = markdownResponse('# Not found\n\nNo public Markdown page exists at this path.\n', request, {
      'Cache-Control': 'no-store', 'Content-Location': canonical, Link: `<${canonical}>; rel="canonical"`,
    });
    return new Response(response.body, { status: 404, headers: response.headers });
  }
  const response = await advertisePublic(request, await context.next(), assets);
  return request.method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
}
