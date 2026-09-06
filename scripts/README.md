# Research scripts

One-off Node tooling for the founder expansion and the condition-factor
scoring pass. Kept outside `src/scripts/` so the application quality checks do
not apply to research tooling that ran once against a snapshot.

| Script | What it does |
|---|---|
| `research/fetch_yc_companies.mjs` | Fetches the Y Combinator company directory |
| `research/scrape_yc_founders.mjs` | Extracts founders from the company records |
| `research/build_yc_founder_batches.mjs` | Splits founders into research batches |
| `research/merge_founder_research.mjs` | Merges founder research results into the corpus |
| `research/heuristic_score.mjs` | Pre-scores records heuristically and flags the ones needing full research |
| `research/build_scoring_batches.mjs` | Splits the corpus into condition-factor scoring batches |
| `research/apply_scoring.mjs`, `research/apply_3d_scores.mjs` | Write agent scoring results back onto the records |

Inputs and outputs live in `artifacts/`. The build, audit, and sync scripts the
site depends on are in `src/scripts/` and are described in
[docs/architecture.md](../docs/architecture.md).
