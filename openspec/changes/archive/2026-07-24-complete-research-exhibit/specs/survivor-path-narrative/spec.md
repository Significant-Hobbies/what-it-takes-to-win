# survivor-path-narrative Specification

## MODIFIED Requirements

### Requirement: Signature survivor-path visual

The homepage SHALL preview many plausible starts narrowing toward one visible
outcome in the initial viewport and SHALL present the full repeated-gate
explanation before detailed charts and profile grids.

#### Scenario: First-time visitor scans the homepage

- **WHEN** the initial viewport renders and they move into the first exhibit
- **THEN** they can see that a famous outcome is framed as the end of a selected
  branching sequence rather than a normal benchmark

### Requirement: Accessible static rendering

The hero preview and full survivor-path narrative SHALL remain understandable
without animation, pointer interaction, color perception, or client-side
JavaScript.

#### Scenario: Visitor uses assistive technology or reduced motion

- **WHEN** either survivor-path component is encountered
- **THEN** its labels, sequence, uncertainty boundary, and conclusion remain
  available in semantic text

