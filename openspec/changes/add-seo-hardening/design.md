## Context

The site is a static Astro build deployed by direct upload to Cloudflare Pages.
It already emits 5,176 HTML pages and has no server runtime. The live release
uses Pages' HTML fallback for unknown assets, so crawler endpoints and missing
routes currently look like successful homepage responses. The homepage also
loads remote font CSS and the ECharts bundle before the lab LCP settles.

## Goals / Non-Goals

**Goals:**

- Keep discovery surfaces deterministic, public, source-derived, and compatible
  with direct-upload Pages.
- Give every canonical sitemap URL a Markdown alternate without adding a
  backend.
- Preserve editorial/noindex boundaries for weak comparison records.
- Return truthful content types and status codes.
- Bring mobile initial rendering materially closer to the Core Web Vitals gate.

**Non-Goals:**

- Search-rank guarantees, backlink acquisition, analytics, or automated Search
  Console ownership.
- Per-person bespoke social artwork.
- Changing the research rubric, dataset, or comparison product behavior.
- Adding a Pages Function solely for content negotiation.

## Decisions

### Generate discovery artifacts after Astro builds

A dependency-free Node script will write `robots.txt`, `sitemap.xml`,
`llms.txt`, `/api/ai`, `_headers`, and Markdown mirrors directly into `dist/`.
This avoids tracking thousands of generated files and avoids a runtime.

Alternative considered: add an Astro sitemap integration and Pages middleware.
That adds dependencies and a runtime despite the data already being available
at build time.

### Sitemap only canonical, indexable HTML

The sitemap will include core pages, every person page, and only comparison
pages that pass the existing evidence gate. Markdown alternates are discoverable
through `/api/ai` and `llms.txt`, but carry `X-Robots-Tag: noindex` to avoid
competing with canonical HTML.

### Curated Markdown for static pages; data-derived Markdown for people

Static route mirrors will summarize the visible product truth. Person and
comparison mirrors will be generated from the same normalized JSON as the HTML,
including sources and limitations. No HTML scraping is involved.

### Static 404 document

Astro will emit `404.html`; Cloudflare Pages will use it for unmatched paths and
return a `404` response instead of the homepage.

### Defer non-critical visualization JavaScript

Remote Google font requests will be removed in favor of the existing system
fallbacks, Astro will inline page CSS, and ECharts initialization will move
behind the window load/idle boundary. The charts remain available after first
render, but no longer compete with the text LCP.

## Risks / Trade-offs

- **Generated file count roughly doubles** → Keep below the Cloudflare Pages
  project file limit and verify the upload count before release.
- **Markdown mirrors can drift** → Generate them from the same dataset and
  central static-route definitions on every build; fail the discovery audit on
  missing mirrors.
- **Deferred charts appear later on slow devices** → Preserve chart containers
  and initialize immediately after load/idle rather than on manual interaction.
- **System fonts vary by platform** → Accept small typography differences in
  exchange for removing render-blocking third-party font CSS.
- **Lab performance remains network-sensitive** → Compare p75 across identical
  presets and treat the measured distribution, not a single run, as evidence.

## Migration Plan

1. Build and validate discovery artifacts locally.
2. Verify a real local 404, Markdown/API content, structured data, and canonical
   sitemap coverage.
3. Commit and push; wait for exact-HEAD CI.
4. Deploy through the existing guarded Pages command.
5. Re-run live SEO, agent-index, status-code, and performance checks.

Rollback is a direct redeploy of the previous clean Pages commit.

## Open Questions

Search Console ownership cannot be determined from repository or public HTML.
After the sitemap is live, the owner may still need to verify the domain and
submit the sitemap in Google Search Console.
