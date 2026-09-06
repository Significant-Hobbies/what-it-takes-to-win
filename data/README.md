# Research data

The working area for the research pipeline. The published corpus itself lives
in `src/data/`; this folder holds what produced it.

| Path | What it is |
|---|---|
| `research/RESEARCH_INSTRUCTIONS.md` | The rubric every research batch follows: eligibility first, two sources, never invent background, one row per candidate |
| `research/RESEARCH_INSTRUCTIONS_CREATORS.md` | Creator-specific variant of the rubric |
| `research/_fe_batch_prompt.md` | The founder and engineer batch prompt |
| `research/*.csv` | Candidate queues built from Pantheon 2025 and custom lists: filtered candidates, tech candidates, founder and engineer candidates, creator candidates, source backfill candidates |
| `research/batches*/` | Batch CSVs handed to agents, grouped by campaign |
| `research/results/` | 621 JSONL result files, one object per candidate, including ineligible ones |
| `research/merge_report.json` | Counts from the last merge: eligible, ineligible, duplicates, errors |
| `research/coverage/` | The coverage gates: `gate-registry.json`, `signals.json`, `source-registry.json`, and `gold-set.json` |
| `research/coverage-results/` | Per-candidate gate evaluations |
| `archive/` | The 2026-07-22 full corpus snapshot and its rebalance report |

The CSV files are CRLF-delimited because that is what the pipeline produces.
`.gitattributes` exempts them from whitespace checking.

How the pieces fit together is described in
[docs/research-pipeline.md](../docs/research-pipeline.md). The gates are
explained in the same page and in `src/data/methodology.md`.
