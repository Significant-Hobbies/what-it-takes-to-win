# Clarity release scorecard

Last evaluated: 2026-08-08

## Verdict

All product-controlled clarity, trust-surface, and visual gates pass. The site gives a one-minute answer,
separates early-milestone eligibility from career-recognition tiers, explains the
advantage-to-leverage-to-trajectory model, and shows why score resemblance is not
a predicted outcome. Every profile also shows its dataset-relative outcome band
and observable lower-tier denominator without turning the selected sample into
population odds. The homepage now makes the emotional implication visible through
an above-fold branch preview and explicitly illustrative survivor-path sequence:
comparison begins at the wrong end of a selected story. A public Evidence surface
now separates structural completeness, source diversity, indexability, confidence,
and independent verification using values rebuilt from the published dataset.

Two research gates have been completed: annotation double-coding (2026-07-31) and
source URL reachability audit (2026-08-08). Two remain deliberately pending:
first-time-user comprehension and a matched comparison study. Neither can be
inferred from automated or agent review.

## Release gates

| Gate | Status | Evidence |
|---|---|---|
| Automated comprehension contract | PASS | Semantic surfaces pass in `pnpm run audit:clarity`, including outcome bands, the missing population denominator, and power-law limits. |
| Public evidence coverage | PASS | `/coverage/` reports live structural, source-domain, confidence, indexability, composition, and independent-audit boundaries. Dataset normalization now deduplicates source URLs, derives `source_count` from the published array, and rejects malformed source records. |
| Tier structure and internal consistency | PASS | All 16 cohort-tier cells populated; 64 deterministic boundary/representative records reviewed. The audit exposed a documentation mismatch: existing tiers encode documented career recognition, while the selected early milestone controls dataset eligibility. Product copy, taxonomy, and methodology were corrected to match the original annotation rubric. No high-confidence re-tiering was justified without a deeper source audit. |
| Desktop rendered experience | PASS | `/`, `/coverage/`, `/insights/`, `/person/bill-gates/`, `/compare/`, and `/methodology/` inspected at 1728×907. The new hero, coverage ledger, and footer were visually reviewed; no horizontal overflow remained. |
| Mobile rendered experience | PASS | `/`, `/coverage/`, `/insights/`, `/explore/`, `/person/bill-gates/`, `/compare/`, `/am-i-the-next/bill-gates/`, and `/methodology/` inspected at 390×844. Navigation, touch targets, branch exhibit, coverage cards, and core content fit without horizontal overflow. |
| Core interactions | PASS | Explore T4 filter returned 172/2,585 records with no non-T4 cards. The complete 22-question Compare flow produced four career-tier profiles, leverage gaps, archetypes, and age-relative results. |
| Build and internal links | PASS | Astro built 5,181 static pages. The clarity audit checked all concrete internal links with no missing target. |
| Annotation double-coding | PASS | 16-record stratified sample across cohort-tier cells. Quadratic-weighted kappa 0.723 for tier. Leverage exact agreement 33.8% (within-one 91.9%). See `quality/RELIABILITY_REPORT.md`. |
| Source URL reachability audit | PASS | All 9,472 source URLs fetched and verified reachable. Results in `quality/source-audit/audit-v1.json`. |
| First-time-user comprehension | PENDING | Requires people who did not build or review the product. |
| First-time emotional resonance | PENDING | The intended arc is awe → distance → relief → humility → bounded agency. Whether unprompted visitors actually feel that requires external observation rather than agent review. |
| Matched comparison study | PENDING | No unsuccessful control group exists. Population odds and counterfactual claims cannot be investigated without one. |

## Six-question external comprehension protocol

Give a first-time participant the homepage and Insights page without coaching.
After no more than two minutes, ask:

1. What is the difference between a starting advantage and capability leverage?
2. Do either of those scores determine a person's tier?
3. What determines entry into this dataset, and what does the tier summarize?
4. What does being far from the observed T1 profile mean?
5. What is one useful action a visitor can take from this project?
6. What does the displayed percentile band measure, and what denominator is missing?

Pass when every participant answers at least five of six correctly, at least 80%
of all answers are correct, and nobody says the scores calculate or guarantee a
tier. Record participant count, raw answers, and observed confusion before changing
this gate.

## Known non-blocking release notes

- The ECharts client chunk remains above Vite's 500 kB advisory threshold. Charts
  load correctly in the rendered release candidate; code splitting is a performance
  optimization, not a clarity blocker.
- This is a purposive successful-outlier sample with no unsuccessful control group.
  Associations and profile distances are descriptive, not causal or predictive.
