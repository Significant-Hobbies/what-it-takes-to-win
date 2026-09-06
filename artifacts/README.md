# Artifacts

Evidence and intermediate outputs from research and design passes. These files
are large and committed on purpose so that scoring, founder discovery, and
design decisions can be re-derived and audited. Nothing here is served by the
site.

| Path | What it is |
|---|---|
| `yc-companies-recent.json` | Scraped Y Combinator company directory used for the founder expansion |
| `yc-founders-recent.json`, `yc-founders-unique.json` | Founders extracted from it, before and after deduplication |
| `yc-founder-research-prompt.md` | The prompt agents followed when researching founders |
| `yc-founder-batches/`, `yc-founder-batches-recent/`, `yc-founder-batches-w25w26/` | Founder research batches by campaign |
| `yc-founder-results/` | Agent results for those batches |
| `other-founder-research/` | Forbes 30 Under 30, Thiel Fellows, unicorn founders, major tech founders, international young founders, and young athletes, creators, and researchers from the 1990s and 2000s |
| `founder-merge-summary.json` | Counts from the founder merge: 2,205 considered, 1,359 new after deduplication |
| `heuristic-scores.json` | Heuristic pre-scoring of the corpus before agent scoring |
| `needs-llm-scoring.json` | Records the heuristic could not score confidently |
| `scoring-prompt.md` | The condition-factor scoring rubric agents followed |
| `scoring-batches/`, `scoring-results/` | The scoring pass over the corpus, 105 batches in and 114 result files out including rescoring |
| `thin-batches/` | Verification batches for the 427 thin-evidence records |
| `verification-batches/` | A verification sample and its results |
| `rescore-batches/` | Rescoring after verification |
| `coverage/` | Candidate ledger and research priority list that feed `/coverage/` |
| `design/` | Screenshots and probes from every design pass, one folder per build |

The scripts that produced the founder and scoring artifacts are in
`scripts/research/`. The rest of the research pipeline is described in
[docs/research-pipeline.md](../docs/research-pipeline.md).

## `design/`

Each design pass has its own folder named for the build, such as
`kinetic-essay-build/` and `comparison-journey-build/`, with screenshots at
390, 768, and 1440 pixels. `marble-direction-probes/` holds the three homepage
direction probes compared on 2026-08-23 and its own README explaining them.
Loose files at the top of `design/` are earlier before-and-after captures. The
approved direction and scores are recorded in `.fleet/design-review.json`.
