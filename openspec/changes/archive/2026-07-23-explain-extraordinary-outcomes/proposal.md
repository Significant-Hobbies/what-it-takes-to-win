## Why

The product currently exposes profiles, scores, and tiers without explaining how they relate. A visitor can inspect the ingredients of an early breakthrough, but cannot tell what a tier means, how advantage differs from built leverage, or whether their profile is genuinely close to the observed profiles in a tier.

## What Changes

- Add a first-class “How extraordinary outcomes happen” insight surface.
- Define the four outcome tiers in plain language and make clear that tiers describe milestone significance rather than human potential.
- Show the observed advantage and leverage gradient across tiers, including the substantial overlap that prevents the scores from predicting an outcome.
- Reframe the homepage around a four-stage model: starting conditions, converted leverage, sustained trajectory, and observed outcome.
- Turn each person page into an explanatory path from documented advantages through built leverage to milestone and outcome tier.
- Add tier-relative comparison results that show profile distance and actionable leverage gaps without assigning or predicting a future tier.
- Remove unsupported causal language and consistently distinguish observed association from explanation or prediction.

## Capabilities

### New Capabilities

- `outcome-model`: A shared, evidence-bounded model explaining the relationship between advantages, leverage, trajectory, and outcome tiers.
- `tier-relative-comparison`: Cohort-aware comparison against observed tier profiles, including overlap and non-prediction guidance.
- `person-path-explanation`: Per-person synthesis connecting documented starting conditions, built leverage, trajectory, and milestone.

### Modified Capabilities

None. The project has no existing OpenSpec capabilities.

## Impact

- Adds a new static `/insights/` route and shared analysis utilities.
- Updates the homepage, navigation, comparison results, person detail pages, methodology, and product status.
- Uses the existing dataset and ECharts dependency; no new production dependency or backend is required.
- Remains a fully static Cloudflare Pages build.
