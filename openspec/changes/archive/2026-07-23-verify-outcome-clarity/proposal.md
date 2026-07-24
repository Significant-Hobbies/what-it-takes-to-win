## Why

The explanatory model is implemented, but “10/10 clarity” is not a credible release claim until it has explicit comprehension, visual, and tier-consistency gates. This change turns subjective confidence into reproducible evidence and makes the core answer impossible to miss.

## What Changes

- Add a one-minute explanation that directly answers how advantages, leverage, trajectory, and tiers relate.
- Add a five-question comprehension contract covering the distinctions a first-time visitor must retain.
- Add automated clarity checks that fail when the required explanation, caveats, tier definitions, or next-step guidance disappear.
- Add a deterministic, stratified tier-consistency audit and publish its current result and limitations.
- Run responsive visual QA across the homepage, Insights, a person profile, Explore, and Compare; fix any material hierarchy, overflow, or interaction defects.
- Add a durable clarity scorecard separating verified product gates from research-validity and real-user gates.

## Capabilities

### New Capabilities

- `clarity-release-gate`: Reproducible comprehension, visual, interaction, and tier-consistency criteria for claiming product clarity.

### Modified Capabilities

- `outcome-model`: Add a concise one-minute answer and an explicit self-check that covers the model’s essential distinctions.

## Impact

- Updates the homepage and Insights hierarchy and copy.
- Adds local audit scripts and durable QA evidence without a new production dependency.
- May adjust tier copy or individual tier assignments only when the audit finds a high-confidence internal inconsistency.
- Does not deploy, add a backend, or claim independent source validation.
