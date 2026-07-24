# person-specific-comparison Specification

## Purpose
TBD - created by archiving change distinguish-advantage-from-capability. Update Purpose after archive.
## Requirements
### Requirement: Person-specific acquisition page
The product SHALL generate an “Am I the next?” page for each published person using unique milestone, advantage, leverage, trajectory, tier, and source evidence.

#### Scenario: Search visitor opens a named-person page
- **WHEN** the route `/am-i-the-next/<person>/` is rendered
- **THEN** it identifies the named person, disclaims affiliation, explains the comparison boundary, and presents useful person-specific evidence before the questionnaire

### Requirement: Short evidence-derived questionnaire
The page SHALL build a short questionnaire from the named person’s strongest documented starting advantages and leverage dimensions rather than asking the same generic questions for every person.

#### Scenario: Visitor completes the questionnaire
- **WHEN** all required person-specific questions are answered
- **THEN** the product calculates transparent surface overlap across starting position and leverage composition

### Requirement: Comparison redundancy result
The result SHALL show resemblance as a descriptive hook and then explain why it cannot establish that the visitor is “the next” person: score composition, leverage origin, timing, trajectory, luck, and outcome variance differ.

#### Scenario: Visitor receives a high resemblance score
- **WHEN** their visible answers closely match the named profile
- **THEN** the product explicitly refuses to convert resemblance into a probability, predicted tier, or identity claim

### Requirement: Programmatic SEO quality gate
Generated pages SHALL be indexable only when the person has at least two sources, non-low leverage evidence confidence, a documented milestone, and a trajectory. Every indexable page SHALL contain self-canonical metadata when a site origin is configured and unique person-specific evidence.

#### Scenario: Profile does not meet the evidence threshold
- **WHEN** its named-person page is generated
- **THEN** the page remains usable but includes a `noindex` robots directive

