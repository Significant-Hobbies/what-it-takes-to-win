## Context

The current static Astro product contains enough data to describe starting conditions, capability leverage, career trajectories, and milestone significance, but each concept is presented independently. `success_tier` is displayed as an unexplained number, comparison results use overall averages, and several statements imply causal conclusions that a successful-only sample cannot support.

The implementation must remain static, reuse the existing dataset, preserve methodological warnings, and avoid adding a predictive model that the evidence cannot validate.

## Goals / Non-Goals

**Goals:**

- Give a first-time visitor a coherent mental model within the homepage.
- Define outcome tiers consistently wherever they appear.
- Quantify both the observed tier gradient and the overlap between tiers.
- Show how each profile’s documented advantages were accompanied by built leverage and a trajectory.
- Give comparison users an honest measure of resemblance to observed tier profiles and specific buildable gaps.
- Centralize analysis definitions so homepage, insights, profiles, and comparison do not drift.

**Non-Goals:**

- Predicting whether a visitor will succeed or assigning them a future tier.
- Claiming that an advantage or leverage dimension caused an outcome.
- Re-auditing or re-tiering all 2,585 records.
- Adding a backend, user accounts, persistence, or a new charting dependency.

## Decisions

### Use a shared static outcome-model module

A typed module in `src/lib/outcome-model.ts` will own tier labels, score-field metadata, aggregate calculations, percentile helpers, correlations, and deterministic profile summaries. Astro pages will calculate their content during the static build.

This is preferred to duplicating page-local calculations because the current duplication already allows definitions and totals to drift. A runtime API was rejected because all source data is available at build time.

### Treat tiers as outcome descriptions, not score bands

Tier labels will describe the editorial significance of the selected milestone. The UI will explicitly state that neither advantage nor leverage totals determine a tier. Tier comparison will show observed averages, interquartile ranges, and profile distance.

Deriving tiers from score thresholds was rejected because score ranges overlap heavily and the dataset provides no validated predictive boundary.

### Explain a four-stage path

The primary explanatory model will be:

1. Starting conditions — inherited or encountered access.
2. Converted leverage — reps, skill, network, timing, team, and focus.
3. Trajectory — sustained actions and compounding events.
4. Observed outcome — the selected milestone and editorial tier.

The path uses “documented,” “associated,” and “observed” language. It does not use “caused” or “guaranteed.”

### Compare within the selected cohort

When a visitor selects a cohort, tier benchmarks and gaps will use that cohort. Results will show the nearest observed tier profile by aggregate score distance, but label it as resemblance rather than prediction. The most important output will be buildable leverage dimensions relative to the selected reference profile.

### Prefer robust HTML over additional chart complexity

The insight surface will use semantic tables, compact bars, callouts, and links. Existing ECharts charts remain on the homepage, but core explanations must be readable without chart interaction.

## Risks / Trade-offs

- **Tier definitions can appear more objective than the annotations are** → Label them editorial outcome tiers and link directly to methodology.
- **Visitors may read resemblance as prediction** → Repeat a short non-prediction statement beside every tier-relative result.
- **Aggregate cross-domain comparisons can hide domain differences** → Show cohort-aware comparison and state when all-cohort aggregates are used.
- **Generated profile narratives may overstate evidence** → Describe high-scoring dimensions as “most strongly documented,” not causal.
- **The homepage could become dense** → Lead with the model and one decisive finding, then move deeper analysis to `/insights/`.

## Migration Plan

1. Add the shared model and insight route.
2. Update navigation and homepage framing.
3. Add person-path synthesis and tier definitions.
4. Replace comparison claims and add tier-relative results.
5. Update methodology/status and run check, build, link validation, and browser smoke tests.

Rollback is a normal source revert because the site remains static and no data migration is involved.

## Open Questions

None blocking. A later research release can revisit tier assignments after independent auditing, but this feature will describe the current editorial tier field honestly.
