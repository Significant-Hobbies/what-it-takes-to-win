# what-it-takes-to-win SEO sprint roadmap

Satellite playbook (see `saas-maker/tooling/skills/seo-sprint`). Baseline
(28d ending 2026-09-18): **5,988 imp · 62 clicks · pos 15 · 8 indexed / 6,188
pending** — the fleet's best click earner; person-path pages already win.

## Evidence

Person-name queries at pos 2–31 ("neo wang ut austin" pos 7, "ashley mo liva
ai" pos 2–3, "tamish pulappadi" pos 31). The `/am-i-the-next/<person>` model
works — people search ambitious people's origins. 6.2k person pages pending
indexing = the pipeline is already loaded.

## Phases

- [ ] **Phase 1 — expand coverage in the earning niches.** The clicks cluster
  on tech/startup/research people — prioritize indexing + page depth for
  those cohorts over entertainment/sports (which inflate impressions but not
  clicks). Sort the 6.2k backlog by niche when the daily agent churns.
- [ ] **Phase 2 — page depth.** Winning pages need the real path story:
  education, first job, inflection points — sourced, not template filler.
  Audit the 10 highest-impression pages; fix the template where it's thin.
- [ ] **Phase 3 — cluster/essay pages.** "how did X get into Y" pattern pages
  + the `/essays/*` series targeting cross-person queries
  ("how do founders start", "paths into AI research").
- [ ] **Phase 4 — indexing.** The 6.2k backlog is the constraint — daily
  agent at ~2k/property/day means ~4 days to clear; then the data tells us
  which niches Google wants.

## Rules

- Person pages must be sourced — a fabricated life-path claim on a named
  individual is the worst possible page.
- Register each phase: `seo-scoreboard.mjs register --project
  what-it-takes-to-win --lane programmatic --summary "…"`.
