# What It Takes to Win — PROJECT STATUS

Last updated: 2026-07-29

## Why / What

Explanatory visualization of 2,585 early-breakthrough paths — how documented
starting conditions, leverage provenance, luck, and compounding trajectories
relate to the significance of an observed milestone without claiming a causal
formula or a repeatable identity.

**Users:** researchers, writers, curious general public

**IN scope:**
- Static Astro + ECharts visualization site
- Per-person detail pages with full score breakdowns, trajectories, and sources
- Explore page with filters/search/sort
- Person-specific “Am I the next…?” questionnaires with evidence gates
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
- Astro (static site framework, MIT)
- Cloudflare Pages (hosting)
- `significanthobbies.com` Cloudflare zone (production hostname)

### Internal
- Published dataset: full research set (no downsampling)
- Archive of prior rebalance experiment: `data/archive/people_full_*.csv`

## Timeline

- 2026-07-29 — added an owned `/changelog` with verified release outcomes and
  direct GitHub Roadmap and Source links
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
- 2026-07-22 — trajectory deepening batches 19-21 + final: 100% coverage (2542/2542)
- 2026-07-22 — migrated 1,818 trajectories from event key to title/description format
- 2026-07-22 — removed 6 duplicate IDs, capped 2,393 leverage scores at 0-2 range
- 2026-07-22 — researchers cohort expanded 214 → 254 (batches 05-06)
- 2026-07-22 — researchers cohort expanded 254 → 297 (batch 07)
- 2026-07-22 — split 10,000+ trajectory entries into proper title + description (85.9% have both)
- 2026-07-23 — local release pass fixed homepage charts and compare flow, restored static preview, and added build-time dataset validation
- 2026-07-23 — added four-stage outcome model, defined editorial tiers, tier-gradient/overlap analysis, connected person paths, and cohort-aware tier-relative comparison
- 2026-07-23 — completed clarity release gate: one-minute answer, five-question contract, corrected career-tier semantics, deterministic 64-record tier review, desktop/mobile QA, and automated link/clarity audits
- 2026-07-23 — separated starting advantages from built or converted leverage across overview, Insights, person paths, Compare, methodology, and clarity audits; documented that leverage presence does not establish its origin
- 2026-07-23 — replaced nearest-tier comparison with person-specific path questionnaires; added per-lever provenance inference, non-scored luck, divergent-path counterexamples, and evidence-gated SEO pages
- 2026-07-24 — shipped the production site to Cloudflare Pages at `https://paths.significanthobbies.com`
- 2026-07-24 — completed Fleet UI conformance pass: design context, clearer hero demonstration, accessible navigation/search/charts, social metadata, and custom share artwork
- 2026-07-24 — completed search and agent-discovery hardening: real 404s, robots, 4,994-URL sitemap, matching Markdown mirrors, llms.txt, machine-readable catalog, and structured data
- 2026-07-24 — removed render-blocking remote fonts and moved ECharts behind viewport activation; weighted lab LCP improved from 4.10s to 2.13s with zero CLS and zero TBT
- 2026-07-24 — added dataset-relative tier bands, lower-tier denominators, and an evidence-bounded power-law explanation across Insights and every person profile
- 2026-07-24 — renamed the repository to `what-it-takes-to-win` and transferred it to the `Significant-Hobbies` GitHub organization
- 2026-07-24 — added the survivor-path narrative: a bounded 64-to-1 thought experiment, repeated-luck explanation, comparison release, and agency-focused homepage close
- 2026-07-25 — completed the research-exhibit finish: above-fold survivor-path preview, public build-derived Evidence ledger, source-integrity normalization, calmer editorial hierarchy, and desktop/mobile visual audit

## Products

- **Website** — `https://paths.significanthobbies.com` (Astro static site, Cloudflare Pages project `success-by-26`)
  - `/` — overview with charts (age distribution, cohort, leverage engine, archetype, early-advantage averages)
  - `/insights/` — one-minute answer, comparison-redundancy explanation, luck model, divergent-path counterexamples, tier definitions, overlap, and five-question clarity contract
  - `/explore/` — filterable/searchable grid of all people, including outcome-tier filtering (lazy-loads data client-side)
  - `/person/[id]/` — connected path with per-lever origin, evidence signals, confidence, luck boundary, trajectory, and named-person comparison entry
  - `/compare/` — chooser for familiar person-specific comparisons; explicitly not a ranking or forecast
  - `/am-i-the-next/[id]/` — evidence-first questionnaire showing starting overlap, leverage overlap, provenance differences, sequence, luck, and why resemblance is not destiny
  - `/coverage/` — live source depth, domain diversity, trajectory completeness, confidence, sample composition, indexability, and independent-audit boundaries
  - `/methodology/` — full methodology and limitations
  - `/about/` — project description

## Features (shipped)

- Owned editorial product changelog at `/changelog`
- Dark, dense, scannable visualization UI
- Fleet-aligned design context, visible keyboard focus, skip navigation, active-page state, reduced-motion handling, accessible search/chart labels, and responsive CTA hierarchy
- Custom Open Graph share surface and complete Open Graph/Twitter metadata
- Search-ready discovery surfaces: real 404 responses, public robots.txt, 4,994 canonical sitemap URLs, and evidence-gated comparison indexing
- Agent-ready discovery surfaces: llms.txt, `/api/ai`, and a noindex Markdown mirror for every canonical URL
- Homepage Organization/WebSite/Dataset JSON-LD plus WebPage/Person JSON-LD on every person profile
- Evidence-bounded explanatory model: starting advantages → built or converted leverage → compounding trajectory → observed career standing
- Distinct starting-advantage and built-or-converted-leverage score families, including separate visual treatments, scales, and an explicit self-built / advantage-enabled / earned / external / mixed provenance boundary
- Defined T1–T4 editorial outcome ladder with observed averages, ranges, overlap, and correlation context
- Dataset-relative outcome bands with cumulative rank ranges, lower-tier counts and ratios, selected-sample boundaries, and power-law limits
- Signature survivor-path exhibit showing repeated consequential uncertainty, peak selection, and why a visible surviving streak is not a fair personal benchmark
- Above-fold static branch preview that demonstrates survivor selection before the detailed explanation
- Public Evidence ledger whose coverage values are derived from the published dataset at build time and explicitly separate completeness from verification
- Source-integrity normalization that deduplicates URLs, derives source counts from published arrays, and blocks malformed or inconsistent source records
- Explicitly separated the age-26 milestone used for inclusion from the career-recognition tier used for comparison
- One-minute explanatory answer and five-question comprehension contract covering comparison, named-person queries, luck, provenance, and divergence
- Repeatable clarity and internal-link audit plus deterministic cohort-tier review sample
- Responsive visual QA across the six primary routes and complete Compare/Explore interaction checks
- 5 overview charts on homepage (ECharts) with click-through detail panels
- Viewport-activated chart loading so ECharts does not block the initial page render
- Explore page with search + cohort, category, engine, archetype, outcome-tier, and sort controls
- Per-person detail pages with connected path synthesis, per-lever provenance, confidence, evidence signals, and cohort-relative context
- Lazy-loaded nav search (fetches slim search index on first focus)
- Lazy-loaded explore data (fetches people.json client-side)
- Person-specific questionnaire pages with required answers, visible source evidence, search-index quality gates, and a non-predictive resemblance breakdown
- Trajectory data on 100% of people — starting point, current position, career milestones
- Dataset validation: unique IDs; scores in range; no missing key fields
- Static build and preview suitable for Cloudflare Pages without a runtime adapter
- Subagent research pipeline (instructions, batch CSVs, JSONL output, merge scripts)
- Merge report with eligibility stats and error tracking

## Dataset Stats

- **Total people:** 2585 (born 1950+)
- **Trajectory coverage:** 100% (2585/2585)
- **Cohort distribution:** Athletes 922, Creators/artists 809, Founders/operators 557, Researchers 297
- **Tier distribution:** T1 574, T2 1087, T3 752, T4 172
- **Three-event trajectory coverage:** 100%
- **Two or more listed sources:** 95.8%
- **Two or more source domains:** 95.0%
- **Pass comparison/search evidence gate:** 92.8%
- **Independently audited records:** 0 (external research gate remains pending)

## Work queue

Open work is tracked only in
[GitHub Issues](https://github.com/Significant-Hobbies/what-it-takes-to-win/issues).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
