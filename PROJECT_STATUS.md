# success-by-26 — PROJECT STATUS

Last updated: 2026-07-21

## Why / What

Visualization site for the Success by 26 early-advantage dataset — who reached
a material professional, commercial, creative, athletic, or research milestone
by age 26, and what early conditions may have accelerated them.

**Users:** researchers, writers, curious general public

**IN scope:**
- Static Astro + ECharts visualization site
- Per-person detail pages with full score breakdowns and sources
- Explore page with filters/search/sort
- Methodology and about pages
- Dataset extension via subagent research (target 500 people)

**OUT of scope:**
- Causal claims about advantages producing success
- Predicting individual outcomes
- Backend / database / user accounts

## Dependencies

### External
- Pantheon 2025 dataset (candidate discovery, CC BY)
- Wikipedia (primary biographical source)
- ECharts (visualization, Apache 2.0)
- Astro + @astrojs/cloudflare (site framework, MIT)
- Cloudflare Pages (hosting)

### Internal
- Source dataset: `success_by_26_public_release_v0_1` (v0.1.0-beta, 112 curated people)

## Timeline

- 2026-07-21 — project scaffolded via fleet-init
- 2026-07-21 — visualization site built (overview, explore, person detail, methodology, about)
- 2026-07-21 — 400-person candidate queue generated from Pantheon 2025
- 2026-07-21 — round 1 subagent research complete: 57 new eligible people (112 → 169)
- 2026-07-21 — round 2 subagent research complete: 59 new eligible people (169 → 228)
- 2026-07-21 — round 3 subagent research complete: 61 new eligible people (228 → 289)
- 2026-07-21 — round 4 subagent research complete: 60 new eligible people (289 → 349)
- 2026-07-21 — round 5 subagent research complete: 52 new eligible people (349 → 401)
- 2026-07-21 — round 6 subagent research complete: 37 new eligible people (401 → 438)

## Products

- **Website** (Astro static site, Cloudflare Pages)
  - `/` — overview with charts (age distribution, cohort, leverage engine, archetype, early-advantage averages)
  - `/explore/` — filterable/searchable grid of all people
  - `/person/[id]/` — per-person detail with score bars, family context, sources, related people
  - `/methodology/` — full methodology and limitations
  - `/about/` — project description

## Features (shipped)

- Dark, dense, scannable visualization UI
- 5 overview charts on homepage (ECharts)
- Explore page with search + 5 filters (cohort, category, engine, archetype, sort)
- 438 per-person detail pages (prerendered)
- Dataset validation passes (438 unique IDs, all scores in range)
- Candidate queue builder (Pantheon 2025, corrected for new schema)
- Subagent research pipeline (instructions, batch CSVs, JSONL output, merge script)
- Merge report with eligibility stats and error tracking

## Todo / Planned / Deferred / Blocked

1. **In progress** — Round 7 subagent research (batches 17-24, ~96 more candidates, target ~500)
2. **Planned** — Cloudflare Pages deployment
3. **Planned** — Double-code stratified sample for reliability (per methodology)
4. **Deferred** — v1.0 with independently audited sources, retrieval dates, archived links
5. **Deferred** — 3,000-person deeply coded dataset (per expansion protocol)
