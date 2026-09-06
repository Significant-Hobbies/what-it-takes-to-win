# Dataset

The archive is a research corpus of documented early-breakthrough paths. This
page covers its files, its two evidence layers, how it is validated, and its
licence status. The methodology that governs what a record means is in
[src/data/methodology.md](../src/data/methodology.md).

## Files

| File | Role |
|---|---|
| `src/data/people.csv` | The research corpus. CRLF-delimited, produced by the merge pipeline. The source of truth. |
| `src/data/people.jsonl` | Line-delimited export of the corpus used by research merges |
| `src/data/people.json` | Normalised, validated array built from the CSV. Generated, but committed so the site builds without the pipeline. |
| `src/data/data_dictionary.csv` | Every field, its layer, and its description |
| `src/data/tier_taxonomy.csv` | The four outcome-reach bands and their interpretation boundary |
| `src/data/advantage_taxonomy.csv` | The 22-field starting-advantage and leverage rubric |
| `src/data/archetypes.json` | Early-advantage archetype definitions |
| `src/data/sources_long.csv` | Long-form source ledger |
| `src/data/candidate-coverage.json` | Generated candidate funnel counts for `/coverage/` |
| `src/data/methodology.md` | Published methodology |
| `src/data/LICENSE_DATA.md` | Suggested release terms, not yet granted |
| `public/data/` | Build outputs published for download: `people.json`, `people.csv`, `search-index.json` |

The current figures, including cohort and tier distributions, coverage shares,
and audit status, are generated into the dataset-stats block of
[PROJECT_STATUS.md](../PROJECT_STATUS.md).

## Two evidence layers

Every record carries fields from both layers, and the data dictionary labels
each field with its layer.

The biographical layer is intended to summarise public evidence: name, cohort,
category, birth year, the selected milestone and age at milestone, early
history and family context summaries, the trajectory, and source URLs.

The annotation layer is analyst interpretation through a shared rubric: the
three condition factors, the 22 starting-advantage and leverage scores, the
primary leverage engine, the archetype, confidence labels, and the outcome
tier. These are hypotheses about acceleration mechanisms, not measurements.

## The public model fields

| Field | Scale | Meaning |
|---|---|---|
| `personal_endowment_score` | -1 to 3 | What the person brought |
| `inherited_leverage_score` | -1 to 3 | What they were handed |
| `catalytic_ecosystem_score` | -1 to 3 | What surrounded them |
| `endowment_summary`, `inherited_summary`, `ecosystem_summary` | text | Sourced justification for each factor |
| `scoring_confidence` | label | Confidence in the factor scoring |
| `success_tier` | 1 to 4 | Editorial outcome reach, not derived from any score |
| `trajectory` | array | Dated career events with title and description |
| `source_urls`, `primary_source_url`, `source_count` | list | Sources; count is derived from the array at build time |
| `source_audit_status`, `source_audit_date` | label | Reachability audit result per record |
| `data_version` | label | The release the record shipped in |

Zero on a condition factor means no clear evidence in the reviewed sources. It
is not a claim that the advantage was absent. The three are never summed
anywhere in the product, and the clarity audit checks that no surface does so.

## Validation at build time

`build_dataset.mjs` rejects a corpus that has duplicate IDs, out-of-range
scores, missing key fields, or malformed source records. It deduplicates source
URLs and derives `source_count` from the array, so the published count cannot
disagree with the list. `build_candidate_coverage.mjs` evaluates the coverage
gates and fails if the gold set of five known people does not resolve to the
expected state.

## Selection and eligibility

A person enters only with a specific, dated, material milestone at or before
the target age, supported by at least two sources. The original cut-off was 26
and the stored field keeps that name for compatibility; the target is now 30
under the age-banded rules in `data/research/coverage/gate-registry.json`.

The corpus intentionally contains successful outliers and is not representative
of any population. There is no control group. The site says this on every
surface that could be misread otherwise.

## Provenance releases

`data_version` records which release a record shipped in. At the current build
the releases are the 0.1.0 beta, the 0.2.0 subagent beta, the 0.3.0 trajectory
beta, the 2026-08-08 expansion, the 2026-08-19 founder expansion of 837
records, and a single 2026-08-26 age-outlier coverage record. The founder
expansion was stamped after the fact when it was found carrying the oldest
version label; see [lessons](lessons.md).

## Audits on the data

Two research audits are complete and one is pending. Their reports and raw
data live in [quality/](../quality/README.md).

- Secondary coding: a blinded second annotator re-scored a deterministic
  16-record sample, one per cohort and milestone-age cell.
- Source reachability: every cited URL was fetched and its status stored on the
  record. New URLs are audited incrementally by `audit_sources.mjs`.
- Independent content audit: pending. Reachability does not verify that a
  source supports the claim, and the coverage page says so.

## Licence status

The repository does not yet grant a licence for the annotations or scripts.
`LICENSE_DATA.md` suggests CC BY 4.0 for original annotations and MIT for
scripts, with attribution to the compiler and version. Source facts, URLs, and
underlying datasets such as Pantheon, Wikidata, and Wikipedia keep their own
terms, and the corpus contains no copied article text.

## Related pages

- [Research pipeline](research-pipeline.md) for how records are produced
- [Glossary](glossary.md) for the terms used above
