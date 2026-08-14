## Why

People can describe a decision as an investment with several possible returns,
but they rarely have a transparent way to combine time, money, resources, and
uncertainty without treating a guess as a prediction. The product can make that
reasoning inspectable with a deterministic expected-value worksheet that runs
entirely in the browser.

## What Changes

- Add a public `/roi/` expected-value lab where the user names the action,
  defines investment line items in one common value unit, and supplies the
  complete probability distribution of possible outcomes.
- Classify each investment as foundation, capability-building, or final-mile
  effort and show how much of the total goes to each stage without treating any
  stage as lesser work.
- Calculate expected gross value, expected net return, expected ROI, downside
  probability, break-even probability, and best/worst cases with visible
  formulas and no runtime AI or network request.
- Keep invalid or incomplete distributions explicit: probabilities must total
  100%, investment must be greater than zero, and mixed resource types must be
  converted by the user into the chosen common unit.
- Start with a blank guided worksheet, provide an optional explicitly synthetic
  example, add/remove controls, accessible validation, responsive results, and
  a clear-all action.
- Link and describe the lab in human navigation and the site's sitemap,
  Markdown mirrors, `llms.txt`, and machine-readable surface catalog.

## Capabilities

### New Capabilities

- `expected-value-roi-calculator`: A deterministic, assumption-visible tool for
  valuing investment line items and probability-weighted outcome distributions.

### Modified Capabilities

- `public-discovery-readiness`: The new canonical ROI lab must participate in
  the same human, crawler, Markdown, and machine-readable discovery contracts as
  the other core public surfaces.

## Impact

- New Astro route and route-specific browser script/styles.
- Small navigation and discovery-generator updates.
- Focused calculation tests using the repository's existing Node test runner.
- No backend, account, database, runtime AI, external API, or new production
  dependency.
