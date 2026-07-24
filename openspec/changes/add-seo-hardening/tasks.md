## 1. Discovery surfaces

- [x] 1.1 Generate robots, sitemap, agent catalog, and curated llms files after every build
- [x] 1.2 Generate noindex Markdown mirrors for every canonical sitemap URL
- [x] 1.3 Add a build audit that fails on missing or inconsistent discovery artifacts

## 2. Search semantics

- [x] 2.1 Add a custom static 404 document and verify unknown-route status
- [x] 2.2 Add homepage publisher/site/dataset JSON-LD
- [x] 2.3 Add WebPage and Person JSON-LD to every person detail page
- [x] 2.4 Preserve and audit comparison-page noindex and sitemap gates

## 3. Initial rendering

- [x] 3.1 Remove render-blocking remote font requests and use local system stacks
- [x] 3.2 Inline Astro page styles and defer homepage chart loading until after initial render
- [ ] 3.3 Verify chart behavior and repeat the distributional performance audit

## 4. Release

- [ ] 4.1 Run OpenSpec, build, clarity, tier, SEO, and agent-index checks
- [ ] 4.2 Archive the completed OpenSpec change and update PROJECT_STATUS.md
- [ ] 4.3 Commit, push, wait for exact-HEAD CI, and deploy through the Fleet guard
- [ ] 4.4 Smoke-test production status codes, crawler files, metadata, and core routes
