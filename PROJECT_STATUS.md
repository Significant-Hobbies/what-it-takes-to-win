# What It Takes to Win — PROJECT STATUS

Last updated: 2026-07-22

## Why / What

Visualization site for the early-advantage dataset — who reached
a material professional, commercial, creative, athletic, or research milestone
early in their careers, and what early conditions may have accelerated them.

**Users:** researchers, writers, curious general public

**IN scope:**
- Static Astro + ECharts visualization site
- Per-person detail pages with full score breakdowns, trajectories, and sources
- Explore page with filters/search/sort
- Compare-yourself questionnaire with percentile matching
- Methodology and about pages
- Dataset extension via subagent research (target 5K people, ceiling)

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
- Published dataset: full research set (no downsampling)
- Archive of prior rebalance experiment: `data/archive/people_full_*.csv`

## Timeline

- 2026-07-21 — project scaffolded via fleet-init
- 2026-07-21 — visualization site built (overview, explore, person detail, methodology, about)
- 2026-07-21 — rounds 1–8 subagent research: 506 people (112 → 506)
- 2026-07-21 — tech-focused expansion: 557 people
- 2026-07-21 — large-scale Pantheon expansion: 844 people
- 2026-07-21 — trajectory schema v0.3 added (starting_point, current_position, trajectory array)
- 2026-07-21 — compare page built (/compare) — 22-question questionnaire, percentile + matches + gap analysis
- 2026-07-22 — founder/engineer queue expansion: 3378 people
- 2026-07-22 — rebranded from "Trajectory" to "What It Takes to Win"
- 2026-07-22 — categories consolidated from 1692 → 22 broad buckets
- 2026-07-22 — global search added to nav bar
- 2026-07-22 — dataset expanded to 2499 people (born 1950+); trajectory coverage 83%
- 2026-07-22 — page size optimization: removed inline dataset embedding (25GB → 64MB total dist)
- 2026-07-22 — fixed success_tier misassignments (90 original records at tier 4 → proper tiers)
- 2026-07-22 — backfilled source URLs for 313 records missing them
- 2026-07-22 — trajectory rendering fixed to support both event and title/description formats
- 2026-07-22 — trajectory deepening batches 11-18: coverage 83% → 91.6% (2299/2509)
- 2026-07-22 — researchers cohort expanded 197 → 214

## Products

- **Website** (Astro static site, Cloudflare Pages)
  - `/` — overview with charts (age distribution, cohort, leverage engine, archetype, early-advantage averages)
  - `/explore/` — filterable/searchable grid of all people (lazy-loads data client-side)
  - `/person/[id]/` — per-person detail with score bars, trajectory, family context, sources, related people
  - `/compare/` — 22-question self-assessment with percentile matching, archetype matching, age snapshots
  - `/methodology/` — full methodology and limitations
  - `/about/` — project description

## Features (shipped)

- Dark, dense, scannable visualization UI
- 5 overview charts on homepage (ECharts) with click-through detail panels
- Explore page with search + 5 filters (cohort, category, engine, archetype, sort)
- Per-person detail pages prerendered on build for full published set
- Lazy-loaded nav search (fetches slim search index on first focus)
- Lazy-loaded explore and compare data (fetches people.json client-side)
- Compare page with 22-question questionnaire, feel-good results, archetype matching
- Trajectory data on 91.6% of people — starting point, current position, career milestones
- Dataset validation: unique IDs; scores in range; no missing key fields
- Subagent research pipeline (instructions, batch CSVs, JSONL output, merge scripts)
- Merge report with eligibility stats and error tracking

## Dataset Stats

- **Total people:** 2509 (born 1950+)
- **Trajectory coverage:** 91.6% (2299/2509)
- **Cohort distribution:** Athletes 925, Creators/artists 813, Founders/operators 557, Researchers 214
- **Tier distribution:** T1 513, T2 1072, T3 752, T4 172

## Todo / Planned / Deferred / Blocked

1. **In progress** — Deepen trajectories for remaining 210 people (8.4% of dataset)
2. **In progress** — Add more researchers to balance cohorts (currently 214, target ~300)
3. **Planned** — Cloudflare Pages deployment
4. **Planned** — Double-code stratified sample for reliability (per methodology)
5. **Deferred** — v1.0 with independently audited sources, retrieval dates, archived links
6. **Dropped** — 500K bulk Wikipedia layer (scope corrected to 5K gold-standard max)
