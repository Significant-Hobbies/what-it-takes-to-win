# Look Sideways — PROJECT STATUS

Last updated: 2026-08-26

## Why / What

<!-- dataset-summary:start -->
Guided explanatory journey through 3,578 early-breakthrough paths — how what
people brought, were handed, and were surrounded by interacted with
perseverance, sequence, and luck without becoming a causal formula, percentile,
or repeatable identity.
<!-- dataset-summary:end -->

**Users:** people caught in unhelpful comparison, plus researchers, writers,
and curious readers who want the evidence behind the argument

**IN scope:**
- Static Astro + ECharts visualization site
- A five-chapter journey explaining why comparison is futile as a verdict
- Per-person detail pages led by three condition factors, perseverance, luck,
  trajectories, and sources
- Explore page with filters/search/sort
- Person-specific comparison breakers with evidence gates
- Methodology and about pages
- Uncapped dataset extension governed by source coverage and evidence gates

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
- Ultracite/Biome (repository lint contract)

### Internal
- Published dataset: full research set (no downsampling)
- Archive of prior rebalance experiment: `data/archive/people_full_*.csv`

## Timeline

- 2026-08-26 — released a product refocus around a guided comparison-futility
  journey; made the three condition factors the public model across primary
  surfaces; added sourced perseverance and unscored luck; surfaced 1,670
  professionally distinctive paths as the first broader-success band; demoted
  the old 22-field and four-stage models to progressive research detail;
  replaced resemblance questionnaires with static comparison breakers; and
  integrated the Fleet product strip into the two-column footer
- 2026-08-23 — selected and completed the Kinetic Essay homepage: a continuous
  paper-and-ink composition with a scroll-driven SVG marble course, prominent
  essays, a compact mobile race register, and no WebGL dependency on the story
  surface
- 2026-08-23 — completed a public-surface design pass across all 15 product
  surfaces: consolidated navigation around Explore, Essays, Methodology, and
  Evidence; rebuilt Explore as a research atlas; strengthened profile,
  questionnaire, essay, methodology, ROI, and error-page hierarchy; and
  replaced ornamental color-coded container borders with a neutral publication
  system while retaining semantic color for data and state
- 2026-08-22 — surfaced the condition-factor decomposition (what they brought /
  were handed / were surrounded by) as the primary read on every profile; the
  annotation existed on all 3,577 records but had never shipped. Corrected the
  scale to −1..3 so the 458 documented headwind readings are visible rather than
  collapsed into zero, and locked the no-summing and headwind disclosures into
  the clarity contract
- 2026-08-22 — renamed the product from "What It Takes to Win" to "Look
  Sideways"; corrected the false source-audit completion claim on `/coverage/`
  and derived the release verdict, gate count, and rung state from the dataset;
  restored `data_version` provenance on the 837 founder-expansion records;
  published a verified `/openapi.json` and real Markdown content negotiation;
  and put the README/PROJECT_STATUS figures under a gated sync script
- 2026-08-14 — launched the input-based Expected Value & ROI Lab with local-only
  deterministic arithmetic, transparent probability reconciliation, staged
  investment allocation, and an equal-effort/different-distance explanation
- 2026-08-09 — split the chart runtime by visualization family and registered
  only the ECharts modules each surface uses, removing the oversized production
  chunk warning while preserving lazy chart loading
- 2026-08-09 — adopted the Fleet Ultracite/Biome contract, enforced it through
  the existing readiness gate, and reached zero findings across 35 applicable
  files without reformatting the research corpus
- 2026-08-09 — expanded the published dataset from 2,585 to 2,770 source-linked
  paths, audited all 553 new source URLs, and made user-facing denominators
  build-derived so future expansions cannot leave stale product claims
- 2026-07-31 — completed the first blinded secondary annotation pass across a
  deterministic 16-cell cohort × milestone-age sample; published tier, score,
  and rubric-agreement results without changing source-audit status
- 2026-07-31 — completed the source-level agent discovery catalog with
  `llms-full.txt`, seven concrete surfaces, two templated collections, and
  4,990/4,990 canonical Markdown mirrors; production remains unchanged
- 2026-07-30 — made the repository independently operable by removing its
  sibling Fleet release dependency while preserving the complete local
  readiness gate and manual Cloudflare Pages deploy contract
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
  - `/` — five-chapter guided argument through survivor selection, three condition factors, perseverance, luck, and release from identity comparison
  - `/overview/` — deeper research overview and charts behind the public model
  - `/insights/` — evidence room with the three-factor model, broader success band, luck, divergent paths, and progressive research detail
  - `/explore/` — filterable/searchable evidence atlas with qualitative outcome-reach filtering (lazy-loads data client-side)
  - `/person/[id]/` — three condition factors, perseverance and luck evidence, trajectory, sources, and progressive 22-field research detail
  - `/compare/` — chooser for familiar person-specific comparisons; explicitly not a ranking or forecast
  - `/roi/` — local expected-value and ROI worksheet using only user-supplied
    investments, outcomes, probabilities, valuations, and stage classifications
  - `/am-i-the-next/[id]/` — static comparison breaker showing conditions, perseverance, sequence, luck, and why resemblance is not destiny
  - `/coverage/` — live source depth, domain diversity, trajectory completeness, confidence, sample composition, indexability, and independent-audit boundaries
  - `/methodology/` — full methodology and limitations
  - `/about/` — project description

## Features (current source and production)

- Publication-grade surface system with neutral structural borders, semantic
  data color, a shared responsive shell, and documented visual QA across all 15
  public surface families
- Input-based Expected Value & ROI Lab with no runtime AI or data transmission,
  visible formulas, synthetic example, probability reconciliation, downside and
  break-even context, and local stage allocation
- Equal-effort/different-distance exhibit explaining how starting position can
  change where effort lands without judging effort intensity, merit, or another
  person's path
- Ultracite/Biome lint contract with zero findings across 35 applicable source
  and configuration files, enforced by `pnpm run ready`
- Owned editorial product changelog at `/changelog`
- Light, editorial, scannable visualization UI with a shared paper-and-ink
  surface system
- Fleet-aligned design context, visible keyboard focus, skip navigation, active-page state, reduced-motion handling, accessible search/chart labels, and responsive CTA hierarchy
- Custom Open Graph share surface and complete Open Graph/Twitter metadata
- Search-ready discovery surfaces: real 404 responses, public robots.txt, a build-derived canonical sitemap (see Dataset Stats), and evidence-gated comparison indexing
- Agent-ready discovery surfaces: llms.txt, llms-full.txt, `/api/ai` with seven
  concrete surfaces and two templated collections, and a noindex Markdown
  mirror for every canonical URL
- Homepage Organization/WebSite/Dataset JSON-LD plus WebPage/Person JSON-LD on every person profile
- One public explanatory model used across primary surfaces: what they brought, what they were handed, and what surrounded them; the factors are never summed
- Sourced perseverance evidence and explicit unscored luck on the journey, person pages, comparison breakers, and evidence room
- Three qualitative reach bands, including 1,670 professionally distinctive paths as broader coverage toward the 0.1% range without a universal percentile claim
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
- Reproducible secondary-coding reliability audit with a blinded 16-record
  artifact, weighted tier agreement, dimension-level score agreement, and
  published rubric corrections
- Responsive visual QA across the six primary routes and complete Compare/Explore interaction checks
- 5 overview charts on homepage (ECharts) with click-through detail panels
- Viewport-activated chart loading so ECharts does not block the initial page render
- Explore page with search + cohort, category, qualitative outcome reach, and sort controls
- Per-person detail pages led by the three-factor model, with deeper provenance and score detail available progressively
- Lazy-loaded nav search (fetches slim search index on first focus)
- Lazy-loaded explore data (fetches people.json client-side)
- Person-specific comparison-breaker pages with visible source evidence, search-index quality gates, and no resemblance score
- Trajectory data on every published path — starting point, current position, and career milestones; the three-or-more-event share is reported under Dataset Stats
- Dataset validation: unique IDs; scores in range; no missing key fields
- Static build and preview suitable for Cloudflare Pages without a runtime adapter
- Subagent research pipeline (instructions, batch CSVs, JSONL output, merge scripts)
- Merge report with eligibility stats and error tracking

## Dataset Stats

<!-- dataset-stats:start -->
<!-- Generated by src/scripts/sync_dataset_stats.mjs — run `pnpm run sync:stats` after a dataset change. -->

- **Total people:** 3,578 (born 1950+)
- **Cohort distribution:** Founders / operators 1,390, Athletes 1,079, Creators / artists 811, Researchers / independent engineers 298
- **Tier distribution:** T1 653, T2 1,254, T3 1,498, T4 173
- **Record provenance:** 0.3.0-trajectory-beta 2,224, 2026-08-19-founder-expansion 837, 0.2.0-subagent-beta 229, 2026-08-08-expansion 183, 0.1.0-beta 104, 2026-08-26-age-outlier-coverage 1
- **Three-event trajectory coverage:** 92.0% (3,291/3,578)
- **Two or more listed sources:** 87.6% (3,135/3,578)
- **Two or more source domains:** 87.1% (3,115/3,578)
- **Pass comparison/search evidence gate:** 71.7% (2,565/3,578)
- **Condition factors (−1 to 3, never summed):** brought 3,578 scored (3 headwind), handed 3,578 scored (458 headwind), surrounded 3,578 scored (5 headwind)
- **Listed source URLs:** 12,682
- **Canonical sitemap URLs:** 6,155
- **Secondary double-coded records:** 16
- **Source reachability audit:** 2,740/3,578 paths reviewed — 1,498 fully reachable, 1,234 partial, 8 failed. 838 paths added since the last pass are unaudited.
- **Independent content audit:** pending; URL reachability does not verify claim support
<!-- dataset-stats:end -->

## Work queue

Open work is tracked only in
[GitHub Issues](https://github.com/Significant-Hobbies/what-it-takes-to-win/issues).
An open issue is a to-do, a linked pull request is in progress, and merge plus
issue closure makes the work done.
