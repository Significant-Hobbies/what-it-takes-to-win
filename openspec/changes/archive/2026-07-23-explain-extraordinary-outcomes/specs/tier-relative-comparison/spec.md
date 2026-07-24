## ADDED Requirements

### Requirement: Cohort-aware tier benchmarks
The comparison experience SHALL calculate advantage and leverage benchmarks from the visitor’s selected cohort, falling back to the full dataset when no cohort is selected.

#### Scenario: Visitor selects founders and operators
- **WHEN** comparison results are calculated
- **THEN** tier averages and gaps use only founder and operator records

### Requirement: Tier-profile resemblance
The comparison experience SHALL identify the nearest observed tier profile by transparent score distance and SHALL label it as resemblance rather than a predicted outcome.

#### Scenario: Visitor receives a nearest profile
- **WHEN** their answers are compared with tier aggregates
- **THEN** the result displays the closest observed profile and a colocated statement that it is not a forecast or tier assignment

### Requirement: Actionable leverage gaps
The comparison experience SHALL prioritize buildable leverage dimensions when showing distance from a reference tier.

#### Scenario: Visitor is below the selected reference profile
- **WHEN** one or more leverage dimensions have a material gap
- **THEN** the largest gaps are shown with the visitor value, reference value, and a plain-language next lever

### Requirement: No unsupported encouragement
The comparison experience MUST NOT assert that a specific dimension separated tier-1 achievers unless the displayed dataset analysis supports that statement.

#### Scenario: Visitor has a medium advantage score
- **WHEN** the result banner is rendered
- **THEN** it explains positioning and uncertainty without inventing a causal separator
