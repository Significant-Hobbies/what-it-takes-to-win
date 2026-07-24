## Why

Visitors can see an editorial outcome tier but cannot tell how common that tier is, where it sits within the curated dataset, or how many lower-tier paths appear beside it. Without that denominator, a famous profile can look representative rather than like one point in a highly selected upper tail.

## What Changes

- Add a shared distribution summary for every outcome tier: count, share, rank band, number of lower-tier profiles, and lower-tier profiles per member of the selected tier.
- Show a compact “standing in this dataset” explanation on every person page.
- Add an Insights section explaining heavy-tailed or power-law-like outcomes in plain language.
- State the denominator boundary prominently: the 2,585 records are early-breakthrough paths, not a population or control group, so the product cannot estimate how many people never reached the inclusion threshold.
- Avoid claiming that the four editorial tiers form a fitted power law or that the tier band supplies an exact within-tier percentile.

## Capabilities

### New Capabilities

- `outcome-distribution-context`: Dataset-relative tier bands, lower-tier ratios, power-law explanation, and denominator limitations across aggregate and person surfaces.

### Modified Capabilities

- `clarity-release-gate`: The automated and human comprehension contracts now cover dataset-relative outcome bands, the missing population denominator, and power-law limits.

## Impact

- Extends `src/lib/outcome-model.ts` with deterministic distribution-context helpers.
- Updates `/insights/` and every `/person/[id]/` page.
- Adds focused styling and clarity-audit coverage.
- Updates methodology and project status.
- Uses the existing static dataset and build pipeline; no dependency, backend, data migration, or Cloudflare configuration change is required.
