## Why

The public site has strong indexable content, but its live crawler endpoints are
HTML fallbacks, nonexistent routes return soft `200` responses, most pages lack
structured data, and mobile lab LCP is poor. These gaps prevent the site from
being a trustworthy, low-maintenance search and agent-discovery surface.

## What Changes

- Emit a real `robots.txt`, XML sitemap, `llms.txt`, homepage Markdown mirror,
  and `/api/ai` discovery catalog.
- Return a real `404` document for unknown static routes.
- Add homepage dataset/site structured data and person-page `Person` data.
- Preserve the comparison-page evidence gate so weak records remain `noindex`.
- Remove render-blocking remote fonts, inline page CSS, and defer the heavy
  homepage chart bundle until after initial rendering.
- Add build and release checks that verify crawler content types, canonical
  coverage, agent surfaces, and performance.

## Capabilities

### New Capabilities

- `public-discovery-readiness`: Search engines and AI agents can discover,
  classify, and read the public research surface through truthful static
  contracts with correct status codes and acceptable initial rendering.

### Modified Capabilities

None.

## Impact

- Affects Astro configuration, the shared layout, homepage/person templates,
  static crawler assets, build scripts, and the generated Pages output.
- Changes Cloudflare Pages routing for unknown URLs by adding `404.html`.
- Does not add a production dependency, backend, account, or private data.
