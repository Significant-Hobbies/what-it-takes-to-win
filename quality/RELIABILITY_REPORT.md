# Secondary annotation reliability — 2026-07-31

## Result

The first double-coding pass found usable ordinal agreement for the four
career-recognition bands, moderate agreement for starting-advantage dimensions,
and insufficient exact agreement for the built-or-converted-leverage rubric.
The result supports continuing to show the scores as interpretive annotations,
but it does not support treating the current numeric values as precise
measurements.

| Layer | Sample | Exact agreement | Within one point/band | Mean absolute difference | Directional bias |
|---|---:|---:|---:|---:|---:|
| Recognition tier | 16 records | 50.0% | 100.0% | — | No consistent direction |
| Starting-advantage dimensions | 192 decisions | 64.1% | 97.4% | 0.385 per field | Secondary coder +0.302 per field |
| Leverage dimensions | 160 decisions | 33.8% | 91.9% | 0.750 per field | Secondary coder +0.688 per field |

Tier agreement had a quadratic-weighted Cohen's kappa of **0.723**. The two
codings never differed by more than one tier, but only 8 of 16 tiers matched
exactly. Starting-advantage totals differed by 3.875 points on average. Leverage
totals differed by 6.875 points on average, and every net leverage-total
difference was upward in the secondary pass.

This is an annotation-reliability result. It is not an independent check that
the biographical statements or linked sources are correct.

## Protocol

The sample contains one deterministic record from each of 16 cells:

- Four cohorts: athletes; creators/artists; founders/operators; and
  researchers/independent engineers.
- Four selected-milestone age bands: 0–17, 18–20, 21–23, and 24–26.
- Inside each cell, the record with the lexicographically smallest SHA-256
  digest of `person_id` was selected.

The secondary coder received name, cohort, category, selected milestone,
biographical summaries, current standing, trajectory, and source URLs. All
published tiers, dimension scores, totals, archetypes, confidence labels, and
annotation-status fields were withheld until the secondary artifact was
complete.

The immutable coding input is
[`quality/reliability/secondary-coding-v1.json`](reliability/secondary-coding-v1.json).
`pnpm run audit:reliability` reselects the sample, validates every score and
range, and compares the secondary pass with the published annotations.

## Where the rubric disagreed

The tier disagreements were all adjacent. The current descriptions preserve
ordinal direction reasonably well, but the T1/T2 and T2/T3 boundaries do not
specify enough observable thresholds. Wealth, one major title, domain
influence, and recognition outside a field were applied inconsistently.

The weakest starting-advantage dimensions were:

| Dimension | Exact | Within one | Mean absolute difference |
|---|---:|---:|---:|
| Direct customer/domain exposure | 43.8% | 81.3% | 0.750 |
| Prodigy/physical edge | 43.8% | 93.8% | 0.625 |
| Exceptional peer/cofounder/sibling | 43.8% | 100.0% | 0.563 |
| Rare early tools/facilities | 50.0% | 100.0% | 0.500 |

The weakest leverage dimensions were:

| Dimension | Exact | Within one | Mean absolute difference |
|---|---:|---:|---:|
| Concentration intensity | 12.5% | 68.8% | 1.188 |
| Elite ecosystem network | 18.8% | 81.3% | 1.000 |
| Scarce skill depth | 6.3% | 100.0% | 0.938 |
| Prior reps | 18.8% | 100.0% | 0.813 |
| Capital safety | 25.0% | 93.8% | 0.813 |

The leverage pattern is systematic rather than random: the published
methodology names the dimensions and their ranges but does not define
field-level anchors for 1, 2, and 3. A second coder therefore treated strong
biographical language as evidence of high intensity much more often than the
published coding did.

## Rubric corrections

These rules now govern future annotation and adjudication:

1. **Call the tier what it measures.** `success_tier` remains the stored field
   for compatibility, but the public methodology calls it a
   career-recognition tier. Recognition is not merit, virtue, wealth, or
   endorsement. T1 requires a durable reference point beyond the immediate
   domain; T2 requires sustained standing at the field's apex; T3 requires
   substantial domain recognition; T4 remains specialist-known.
2. **Respect the selected-milestone cutoff.** Advantage and leverage scores may
   use only conditions documented by the selected milestone. Later career
   evidence can set recognition tier, but cannot backfill early score intensity.
3. **Require explicit evidence for intensity.** For 0–2 dimensions, 1 means a
   documented meaningful presence and 2 requires explicit evidence that it was
   unusually scarce, sustained, or catalytic. For 0–3 leverage dimensions, 1
   means present, 2 means repeated or strong, and 3 requires exceptional,
   path-dominant evidence.
4. **Do not infer mechanisms from outcomes.** Achievement alone does not prove
   prodigy status, concentration, a strong network, capital safety, or
   distribution. Each mechanism needs its own evidence in the packet.
5. **Tighten commonly conflated dimensions.** Distribution means repeatable
   access to an audience, users, customers, or selectors—not publicity after a
   win. Network means documented relationships that moved information or
   opportunity—not membership in an elite organization alone. Domain proximity
   means repeated contact with real problems, users, or operating constraints,
   not expertise by itself.
6. **Preserve missingness.** Under the current numeric schema, zero continues to
   mean no clear documentation, not confirmed absence. Coders must record
   uncertainty instead of converting a plausible inference into a positive
   score. A future schema should represent `unknown` separately.
7. **Adjudicate dependent evidence.** One fact may legitimately inform more
   than one dimension, but aggregate interpretation must disclose overlap
   rather than treating geography, institution, tools, mentors, and domain
   exposure as independent causes.

## Decision and next gate

No published scores were changed in this pass. The disagreement is evidence
about rubric precision, not proof that either coder's value is correct.

Before a v1.0 measurement claim:

- Recode a larger sample with at least two independent secondary coders.
- Adjudicate every tier mismatch and every dimension difference greater than
  one.
- Apply the anchored leverage rubric prospectively, then repeat this audit.
- Independently verify source facts and evidence spans; that audit remains at
  zero records.
