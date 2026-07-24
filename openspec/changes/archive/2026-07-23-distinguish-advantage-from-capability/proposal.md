## Why

The product has enough evidence to attract visitors with “Am I the next X?” but
currently stops at generic benchmarking. It must use that comparison as a hook,
then answer why the analogy is non-predictive: totals hide composition,
capability origins differ, trajectories are path-dependent, and luck or
unobserved variance acts throughout.

## What Changes

- Keep **Starting advantages** and **Built or converted leverage** as visibly
  different score families with separate definitions and scales.
- Add evidence-bounded per-person leverage provenance: self-built,
  advantage-enabled, earned access, external, mixed, or unresolved. Every
  inference SHALL show its supporting signals and uncertainty; the product will
  not invent a “self-made percentage.”
- Add a luck and variance layer spanning starting conditions, leverage,
  trajectory, and outcome rather than treating luck as a fake numeric score.
- Add static, person-specific `/am-i-the-next/<person>/` questionnaire pages.
  Results SHALL show surface resemblance first, then explain why it is not a
  forecast or identity claim.
- Show data-backed counterexamples where similar totals conceal different
  compositions, origins, trajectories, or outcomes.
- Use one generic public brand/domain and a browseable route hierarchy rather
  than one celebrity-name domain per person.
- Apply SEO quality gates: unique evidence, self-canonical metadata, source
  links, and `noindex` for profiles with insufficient evidence.
- Align homepage, Insights, person pages, Explore, methodology, navigation,
  automated audits, and project status around the complete question set.

## Capabilities

### New Capabilities

- `person-specific-comparison`: Person-specific acquisition pages and
  questionnaires that reveal why direct comparison is incomplete.
- `leverage-provenance`: Evidence-bounded inference about how each documented
  lever may have arisen.
- `luck-and-variance`: An explicit non-scored account of structural luck,
  encounters, shocks, timing, and unexplained outcome variance.

### Modified Capabilities

- `outcome-model`: Separate starting position, later multiplying capacity,
  provenance, luck, trajectory, and observed standing without creating a
  predictive formula.
- `person-path-explanation`: Show leverage origin evidence and link each profile
  to its person-specific comparison breakdown.
- `tier-relative-comparison`: Replace generic nearest-tier positioning with
  named-person surface resemblance followed by a comparison-redundancy result.
- `clarity-release-gate`: Verify that all five previously missing questions have
  explicit, evidence-bounded answers.

## Impact

- Adds one static route family generated from the existing dataset and replaces
  the generic Compare-first funnel.
- Extends `src/lib/outcome-model.ts` with deterministic provenance and
  counterexample helpers.
- Updates core Astro pages, metadata, styling, methodology, audits, and status.
- Adds no backend or production dependency. Domain registration and deployment
  remain separate owner-authorized actions.
