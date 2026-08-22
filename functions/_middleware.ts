/**
 * Cloudflare Pages Functions middleware — agent SEO surfaces for
 * paths.significanthobbies.com (Look Sideways).
 * Handles JSON error responses, Vary: Accept, and agent-friendly 404s.
 *
 * The machine-readable surfaces themselves — /api/ai, /openapi.json, /llms.txt,
 * /llms-full.txt, /sitemap.xml — are static files emitted by
 * generate_discovery_surfaces.mjs and served from dist/ by Pages, so
 * audit_discovery.mjs can verify them. This middleware must not shadow them.
 */

function wantsMarkdown(request: Request): boolean {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (!accept.includes("text/markdown")) return false;
  if (!accept.includes("text/html")) return true;
  return accept.indexOf("text/markdown") < accept.indexOf("text/html");
}

function jsonError(status: number, code: string, message: string, path: string): Response {
  return new Response(
    JSON.stringify({ error: { code, message, path } }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    },
  );
}

function markdown404(pathname: string, origin: string): Response {
  const body = `# 404 — Not Found

\`${pathname}\` does not exist on ${origin}.

## Where to look next

- [Home](${origin}/)
- [Sitemap](${origin}/sitemap.xml)
- [Agent index](${origin}/llms.txt)
- [Agent catalog (JSON)](${origin}/api/ai)
- [OpenAPI spec](${origin}/openapi.json)
`;
  return new Response(body, {
    status: 404,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

/** Canonical Markdown mirror for an HTML route, matching the emitted mirrors. */
function markdownMirror(pathname: string): string {
  if (pathname === "/") return "/index.md";
  return `${pathname.replace(/\/$/, "")}.md`;
}

export async function onRequest(context: {
  request: Request;
  next: (input?: Request) => Promise<Response>;
}): Promise<Response> {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // JSON error for unknown /api/* paths (excluding /api/ai which is a static file)
  if (pathname.startsWith("/api/") && pathname !== "/api/ai") {
    return jsonError(404, "not_found", `Unknown API path: ${pathname}`, pathname);
  }

  // Content negotiation: a client that prefers Markdown gets the canonical
  // mirror for this route rather than the HTML page. This is what the /api/ai
  // catalog's `markdown.negotiation: true` promises; without it that flag lies.
  if (wantsMarkdown(request) && !pathname.includes(".")) {
    const mirror = new URL(request.url);
    mirror.pathname = markdownMirror(pathname);
    const mirrored = await next(new Request(mirror, request));
    if (mirrored.ok) {
      const headers = new Headers(mirrored.headers);
      headers.set("content-type", "text/markdown; charset=utf-8");
      headers.set("vary", "Accept, Accept-Encoding");
      headers.set("content-location", markdownMirror(pathname));
      return new Response(mirrored.body, { status: 200, headers });
    }
    return markdown404(pathname, origin);
  }

  const response = await next();

  // Add Vary: Accept to HTML responses that have markdown alternates
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    const headers = new Headers(response.headers);
    const vary = headers.get("vary");
    headers.set("vary", vary ? `${vary}, Accept, Accept-Encoding` : "Accept, Accept-Encoding");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  return response;
}
