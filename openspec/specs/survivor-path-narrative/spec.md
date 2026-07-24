# survivor-path-narrative Specification

## Purpose
Make survivor selection and repeated consequential uncertainty intuitive before
redirecting comparison toward evidence, humility, and bounded agency.
## Requirements
### Requirement: Signature survivor-path visual

The homepage SHALL preview many plausible starts narrowing toward one visible
outcome in the initial viewport and SHALL present the full repeated-gate
explanation before detailed charts and profile grids.

#### Scenario: First-time visitor scans the homepage

- **WHEN** the initial viewport renders and they move into the first exhibit
- **THEN** they can see that a famous outcome is framed as the end of a selected
  branching sequence rather than a normal benchmark

### Requirement: Illustrative probability boundary
Any coin-toss sequence MUST be labelled as a thought experiment and MUST NOT be presented as an observed dataset rate, a career probability, or a count of failures.

#### Scenario: Visitor sees the 64-to-1 sequence
- **WHEN** the narrowing rows are rendered
- **THEN** the same component states that real careers are not fair independent coins and that the sequence is illustrative

### Requirement: Odds, attempts, and uncertainty
The narrative SHALL explain that starting advantages can alter available odds, built leverage can improve later odds, runway can allow more attempts, and luck can still redirect individual outcomes.

#### Scenario: Visitor interprets the coin metaphor
- **WHEN** they read the explanation beside the visual
- **THEN** they do not leave with the conclusion that outcomes are purely random or purely earned

### Requirement: Emotional comparison release
The homepage SHALL state that visitors are often comparing an unfinished branch with a publicly visible surviving streak, then redirect attention to evidence and the next controllable branch.

#### Scenario: Visitor reaches the narrative conclusion
- **WHEN** the survivor-path explanation ends
- **THEN** the emotional landing combines relief, humility, and bounded agency without promising an outcome

### Requirement: Accessible static rendering

The hero preview and full survivor-path narrative SHALL remain understandable
without animation, pointer interaction, color perception, or client-side
JavaScript.

#### Scenario: Visitor uses assistive technology or reduced motion

- **WHEN** either survivor-path component is encountered
- **THEN** its labels, sequence, uncertainty boundary, and conclusion remain
  available in semantic text
