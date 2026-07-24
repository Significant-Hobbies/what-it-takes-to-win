## ADDED Requirements

### Requirement: Connected person path
Each person page SHALL connect the person’s most strongly documented starting advantages, strongest leverage dimensions, trajectory, selected milestone, and outcome tier in one ordered explanation.

#### Scenario: Visitor opens a person profile
- **WHEN** the profile has valid scores and a trajectory
- **THEN** an ordered path summary appears before the full score breakdown

### Requirement: Relative profile context
Each person page SHALL show how the person’s aggregate advantage and leverage compare with their cohort and their outcome tier.

#### Scenario: Visitor evaluates whether a person was unusually advantaged
- **WHEN** the profile is rendered
- **THEN** cohort-relative totals or percentiles are shown with enough context to avoid treating raw scores as universal

### Requirement: Honest missing evidence
Generated person-path explanations SHALL distinguish a zero score from evidence that an advantage was absent.

#### Scenario: Person has no documented score for a dimension
- **WHEN** the explanation identifies weak or absent signals
- **THEN** it says “not documented” rather than claiming the advantage did not exist
