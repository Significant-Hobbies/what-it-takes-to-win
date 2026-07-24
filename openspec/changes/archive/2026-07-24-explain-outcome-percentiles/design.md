## Context

The product already calculates tier counts and score percentiles, but it only exposes cohort-relative advantage and leverage percentiles on person pages. It does not translate an outcome tier into a dataset-relative rank band or show the lower-tier denominator around a standout profile. The dataset is selected for documented early breakthroughs, so any distribution explanation must avoid presenting its tier counts as population odds.

## Goals / Non-Goals

**Goals:**

- Give every tier a deterministic count, share, rank band from the top, lower-tier count, and lower-tier-per-member ratio.
- Explain the selected-sample denominator beside the numbers.
- Explain why extraordinary outcomes can be heavy-tailed without claiming the current tier counts fit a statistical power law.
- Keep the explanation readable in static HTML and consistent across Insights and person pages.

**Non-Goals:**

- Estimating the prevalence of extraordinary outcomes in the general population.
- Estimating how many similar people tried and failed.
- Ranking people within an editorial tier.
- Fitting a Pareto exponent or claiming that advantage and leverage scores follow a power law.
- Changing tier assignments or the source dataset.

## Decisions

### Derive context from the existing tier field at build time

`summarizeOutcomes` will add cumulative rank-band and lower-tier fields from the current `success_tier` values. Person pages will select the matching tier summary. This keeps all displayed counts deterministic and prevents page-local arithmetic from drifting.

The alternative—storing percentile fields in the dataset—was rejected because the values are derived, change whenever the dataset changes, and do not belong in the source annotations.

### Use tier bands rather than exact outcome percentiles

The UI will say “top 22.2% tier” or “ranks 1–574 from the top,” not “Bill Gates is at the 99th percentile.” The editorial tier does not order members within its band, so an exact percentile would be false precision.

### Show both observable and missing denominators

For each tier, the product will report lower-tier profiles in the curated sample and their ratio per member of the selected tier. Beside it, the product will state that profiles without an early breakthrough are outside the data, making population or failure odds unknowable here.

### Explain power laws conceptually, not as a fitted claim

Insights will describe a heavy tail as a distribution where a small minority can account for a disproportionate share of recognition, reach, wealth, citations, or attention. It will explain that compounding can magnify initially modest differences. It will also state that the four editorial tiers compress continuous outcomes and that the selected dataset cannot validate a Pareto curve.

### Prefer semantic cards and a cumulative bar

The distribution explanation will use accessible HTML, numeric cards, and a CSS-only tier bar. A new chart is unnecessary and would add loading and interpretation cost.

## Risks / Trade-offs

- **“Top tier” may still be read as a precise individual rank** → Pair the share with a rank band and explicitly state that people are not ordered within a tier.
- **The lower-tier ratio may be mistaken for population odds** → Place the selected-sample limitation in the same component, not only in methodology.
- **Power-law language can sound more proven than it is** → Use “heavy-tailed or power-law-like outcomes” and explicitly say no exponent is fitted.
- **Tier counts can change as records change** → Compute all values from the built dataset rather than hard-coding them.

## Migration Plan

1. Extend the shared outcome summary.
2. Add aggregate context to Insights and person-specific context to every profile.
3. Update methodology, clarity audit, and project status.
4. Run the focused audit, Astro check, build, and browser QA.
5. Archive the OpenSpec change and deploy the exact green commit.

Rollback is a normal source revert; there is no data or infrastructure migration.

## Open Questions

None blocking.
