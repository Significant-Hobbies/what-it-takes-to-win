## ADDED Requirements

### Requirement: Separated comparison channels
The comparison experience SHALL present starting-advantage resemblance separately from built or converted leverage gaps, using distinct labels, definitions, scales, and visual treatments.

#### Scenario: Visitor reviews comparison results
- **WHEN** both advantage and leverage results are available
- **THEN** the visitor can tell which result describes documented starting access and which describes multiplying capacity that may have been built or converted

#### Scenario: Visitor interprets leverage provenance
- **WHEN** a leverage gap is displayed
- **THEN** the product describes a buildable next lever without claiming that the reference person built that leverage entirely from scratch

## MODIFIED Requirements

### Requirement: Tier-profile resemblance
The comparison experience SHALL calculate surface resemblance to a visitor-selected named person from transparent starting-advantage and leverage answers. It SHALL label the result as descriptive overlap rather than a predicted outcome, future tier, or claim that the visitor is “the next” person.

#### Scenario: Visitor receives a resemblance result
- **WHEN** their answers are compared with the named person’s documented fields
- **THEN** the result displays overlap by score family and a colocated explanation of composition, provenance, timing, trajectory, luck, and variance

#### Scenario: Visitor receives a nearest profile
- **WHEN** the legacy nearest-tier comparison entry point is requested
- **THEN** the product routes the visitor to named-person comparisons and does not present a nearest tier as a forecast or assignment

### Requirement: No unsupported encouragement
The comparison experience MUST NOT assert that resemblance to a named person, tier, advantage pattern, or leverage pattern implies a similar future outcome.

#### Scenario: Visitor has high surface resemblance
- **WHEN** the result banner is rendered
- **THEN** it explains why the match is non-predictive instead of offering destiny language or an unsupported probability

#### Scenario: Visitor has a medium advantage score
- **WHEN** a named-person result is rendered
- **THEN** it explains positioning and uncertainty without inventing a causal separator or future tier

## REMOVED Requirements

### Requirement: Cohort-aware tier benchmarks

**Reason**: Generic tier benchmarking makes ranking the product payoff and conflicts with the person-specific comparison-redundancy thesis.

**Migration**: Named-person pages use the selected person’s documented fields and explain why the resulting overlap is not a forecast.

### Requirement: Actionable leverage gaps

**Reason**: A gap from a tier average is not inherently relevant to the visitor’s context and may treat an observed association as a prescription.

**Migration**: Results identify visitor-selected levers worth investigating without presenting distance from a tier as a requirement.
