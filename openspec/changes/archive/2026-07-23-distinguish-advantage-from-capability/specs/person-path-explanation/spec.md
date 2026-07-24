## MODIFIED Requirements

### Requirement: Connected person path
Each person page SHALL connect the person’s most strongly documented starting advantages, strongest built or converted leverage dimensions, trajectory, selected milestone, and outcome tier in one ordered explanation. Starting advantages and leverage SHALL appear as separate stages with distinct labels, definitions, visual treatments, and score denominators.

#### Scenario: Visitor opens a person profile
- **WHEN** the profile has valid scores and a trajectory
- **THEN** an ordered path summary appears before the full score breakdown and clearly separates what was available near the start from the multiplying capacity later present

### Requirement: Relative profile context
Each person page SHALL show how the person’s aggregate starting advantage and built or converted leverage compare with their cohort and their outcome tier without presenting the two totals as equivalent measures.

#### Scenario: Visitor evaluates whether a person was unusually advantaged
- **WHEN** the profile is rendered
- **THEN** cohort-relative totals or percentiles are shown in separate score-family treatments with enough context to avoid treating raw scores as universal

## ADDED Requirements

### Requirement: Person-level leverage provenance
Each person page SHALL show a best-supported origin for every non-zero leverage dimension, including supporting starting-condition signals, confidence, and an unresolved state where the current evidence cannot distinguish origins.

#### Scenario: Lever has mapped starting-condition evidence
- **WHEN** a non-zero leverage field is associated with one or more documented advantage signals
- **THEN** the page labels it advantage-enabled or mixed, names those signals, and presents the result as inference rather than fact

#### Scenario: Lever lacks origin evidence
- **WHEN** a non-zero leverage field has no mapped supporting advantage signal and is not inherently external
- **THEN** the page labels the origin unresolved rather than self-built

### Requirement: Named-person comparison entry
Each person page SHALL link to that person’s “Am I the next?” breakdown without implying affiliation, endorsement, or predictive validity.

#### Scenario: Visitor wants to compare themselves
- **WHEN** they follow the comparison entry from a person profile
- **THEN** they reach the person-specific questionnaire and see that its result measures surface overlap rather than future identity
