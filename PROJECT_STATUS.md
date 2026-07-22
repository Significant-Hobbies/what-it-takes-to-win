# trajectory — PROJECT STATUS

Last updated: 2026-07-22

## Why / What

Visualization site for the Trajectory early-advantage dataset — who reached
a material professional, commercial, creative, athletic, or research milestone
early in their careers, and what early conditions may have accelerated them.

**Users:** researchers, writers, curious general public

**IN scope:**
- Static Astro + ECharts visualization site
- Per-person detail pages with full score breakdowns and sources
- Explore page with filters/search/sort
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
- 2026-07-21 — 400-person candidate queue generated from Pantheon 2025
- 2026-07-21 — round 1 subagent research complete: 57 new eligible people (112 → 169)
- 2026-07-21 — round 2 subagent research complete: 59 new eligible people (169 → 228)
- 2026-07-21 — round 3 subagent research complete: 61 new eligible people (228 → 289)
- 2026-07-21 — round 4 subagent research complete: 60 new eligible people (289 → 349)
- 2026-07-21 — round 5 subagent research complete: 52 new eligible people (349 → 401)
- 2026-07-21 — round 6 subagent research complete: 37 new eligible people (401 → 438)
- 2026-07-21 — round 7 subagent research complete: 44 new eligible people (438 → 482)
- 2026-07-21 — round 8 subagent research complete: 24 new eligible people (482 → 506) — 500-person target reached
- 2026-07-21 — tech-focused expansion: 51 new eligible people (506 → 557) — added founders, programmers, engineers, mathematicians, physicists
- 2026-07-21 — large-scale expansion: 287 new eligible people (557 → 844) — 50 batches, 600 candidates from Pantheon 2025
- 2026-07-21 — trajectory schema v0.3 added (starting_point, current_position, trajectory array)
- 2026-07-21 — compare page built (/compare) — 22-question questionnaire, percentile + matches + gap analysis
- 2026-07-21 — compare results rewritten with feel-good framing (self-made stories, age >26 path, honesty disclaimer)
- 2026-07-21 — Pantheon expansion reached 3000 people (250-batch queue)
- 2026-07-22 — founder/engineer queue launched (1,072 candidates, 90 FE batches); goal rebalance founders from ~9% toward 25–35%
- 2026-07-22 — FE research wave 1 complete: batches 001–020 (240 candidates, 58 eligible); merged → 3058 people
- 2026-07-22 — FE full queue + high-yield 091–115 researched. Full coded set ~3318 people (~16% founders).
- 2026-07-22 — Rebalance-to-40% experiment **reverted** (do not drop people). Restored full set.
- 2026-07-22 — X high-follower engineer wave (batches 200–206): ~75 candidates; eligible merged (Chollet, Otwell, McKinney, Frazelle, Babel/React/Next earlys, etc.).
- 2026-07-22 — X young-builder wave 2 (batches 210–216): ~81 candidates; eligible merged (Bellard, Metasploit/Moore, Adafruit/Fried, Ola/Bhati, Wispr/Kothari, Jason Wei, ProfitWell, etc.).
- 2026-07-22 — Wave 3 (batches 220–224): ~54 candidates; +~17 unique eligibles (McKenzie/patio11, Isaacman/Shift4, JD/Liu, Bugha, N0tail, Fishkin/Moz, Dwarkesh, Product Hunt cofounder Baschez, etc.). Full set **3378**; founders **~16.4%**, founders+eng **~25.4%**. Addition only.

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
- Per-person detail pages prerendered on build for full published set
- Dataset validation: unique IDs; scores in range
- Candidate queue builder (Pantheon 2025 + founder/engineer queue)
- Subagent research pipeline (instructions, batch CSVs, JSONL output, merge script)
- Merge report with eligibility stats and error tracking
- Compare page (/compare) with 22-question questionnaire, feel-good results, age >26 path, honesty disclaimer
- Trajectory data (v0.3) on eligible researched people — starting point, current position, career milestones

## Todo / Planned / Deferred / Blocked

1. **In progress** — Full set ~3378; founders ~16.4%, founders+eng ~25.4%. Continue addition-only founder/eng research. ~1.3k more pure founders still needed for 40% by growth alone.
2. **Planned** — Cloudflare Pages deployment
3. **Planned** — Double-code stratified sample for reliability (per methodology)
4. **Deferred** — v1.0 with independently audited sources, retrieval dates, archived links
5. **Dropped** — 500K bulk Wikipedia layer (scope corrected to 5K gold-standard max)
