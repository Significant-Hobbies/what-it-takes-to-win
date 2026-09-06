# Repository map

A folder-by-folder guide. The repository holds a small product and a large
research record, so most of its weight is data and evidence rather than code.

## Top level

| Path | Purpose |
|---|---|
| `README.md` | Front page for the repository |
| `PRODUCT.md` | Audience, register, voice, and the Fleet checklist applicability |
| `DESIGN.md` | The Kinetic Essay visual system |
| `PROJECT_STATUS.md` | Shipped product truth, dated timeline, generated dataset stats |
| `AGENTS.md` | Operating rules for agents and contributors |
| `CONTRIBUTING.md` | How to propose people, edits, and code changes |
| `docs/` | This documentation set |
| `package.json` | Scripts, including the quality gate and deploy |
| `astro.config.mjs`, `wrangler.jsonc` | Framework and Pages configuration |
| `biome.json`, `knip.json` | Lint and unused-code configuration |
| `.github/` | CI workflow and the two issue templates |
| `.fleet/` | Design-review receipt and landing-audit scorecard |
| `.impeccable/` | Critique transcripts and direction options from design passes |
| `.codex/skills/` | OpenSpec skills kept for Codex sessions; specs themselves live in GitHub Issues |
| `.agents/skills/`, `.claude/skills/` | Symlinks to shared Fleet skills; absent in a standalone clone |

## `src/`

| Path | Purpose |
|---|---|
| `pages/` | One folder per route. See [surfaces](surfaces.md). |
| `layouts/` | `Base.astro` shell and `Essay.astro` |
| `lib/` | Tested model code: `outcome-model.ts`, `journey-model.ts`, `coverage.ts`, `roi.ts`, `contribution.ts`, `discovery.mjs`, `candidate-coverage.mjs` |
| `scripts/` | Build (`build_dataset`, `build_candidate_coverage`, `generate_discovery_surfaces`), audits (`audit_*`), sync (`sync_dataset_stats`), render (`render_og_image`), health (`check-code-health`), chart runtime, and the Python research tooling |
| `styles/` | Global stylesheet plus one per surface family |
| `data/` | The corpus and its documentation. See [dataset](dataset.md). |

## `data/`

The research working area. Nothing here is served by the site.

| Path | Contents |
|---|---|
| `research/RESEARCH_INSTRUCTIONS.md` | The rubric every research batch follows |
| `research/RESEARCH_INSTRUCTIONS_CREATORS.md` | Creator-specific variant |
| `research/*.csv` | Candidate queues: Pantheon filters, tech, founder and engineer, creators, source backfill |
| `research/batches*/` | Batch CSVs handed to agents, grouped by campaign (`batches`, `batches2`, `batches_fe`, `batches_creators`, `batches_tech`, `batches_tech2`, `batches_tech_custom`, `batches_new` through `batches_new_5`) |
| `research/results/` | 621 JSONL result files, one per batch |
| `research/merge_report.json` | Counts from the last merge |
| `research/coverage/` | Gate registry, signals, source registry, and gold set for the coverage gates |
| `research/coverage-results/` | Per-candidate gate evaluations |
| `archive/` | The 2026-07-22 full corpus snapshot and its rebalance report, kept for comparison |

## `artifacts/`

Evidence and intermediate outputs from research and design passes. Large and
committed on purpose so results can be re-derived and audited.

| Path | Contents |
|---|---|
| `yc-companies-recent.json`, `yc-founders-*.json` | Scraped Y Combinator directory data for the founder expansion |
| `yc-founder-batches*/`, `yc-founder-results/` | Founder research batches and agent results |
| `yc-founder-research-prompt.md` | The prompt used for founder research |
| `other-founder-research/` | Forbes 30 Under 30, Thiel Fellows, unicorn founders, and young athletes, creators, and researchers lists |
| `founder-merge-summary.json` | 2,205 founder records considered, 1,359 new after dedupe |
| `heuristic-scores.json`, `needs-llm-scoring.json` | Pre-scoring pass and the records it sent to full research |
| `scoring-prompt.md`, `scoring-batches/`, `scoring-results/` | The condition-factor scoring pass over the corpus |
| `thin-batches/`, `verification-batches/`, `rescore-batches/` | Verification of 427 thin-evidence records and their rescoring |
| `coverage/` | Candidate ledger and research priority list feeding `/coverage/` |
| `design/` | Screenshots and probes from every design pass, by build name |

## `quality/`

Checked-in research audit reports with their raw data. See
[quality/README.md](../quality/README.md).

## `scripts/research/`

Node scripts for the founder expansion and condition-factor scoring: fetching
and scraping the YC directory, building batches, heuristic pre-scoring,
applying scores, and merging founder research. Kept outside `src/scripts/` so
the app quality checks do not apply to one-off research tooling.

## `test/`

Four Node test files covering the outcome model, coverage summary, ROI
arithmetic, contribution validation, and candidate-coverage gates.

## `public/`

Static assets served as-is: favicon, Open Graph image and its SVG source, the
App Health browser log script, the IndexNow ownership key, the published agent
skill under `.well-known/`, and the dataset downloads under `data/` that the
build writes.

## `functions/`

The single Cloudflare Pages Function for content negotiation and agent 404s.

## Generated and ignored

`dist/`, `node_modules/`, `.astro/`, `.wrangler/`, and log output are ignored.
`.playwright-mcp/` holds browser console logs from design passes and is ignored
through the log pattern.
