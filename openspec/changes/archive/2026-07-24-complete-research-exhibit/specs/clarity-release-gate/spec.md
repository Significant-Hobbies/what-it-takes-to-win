# clarity-release-gate Specification

## MODIFIED Requirements

### Requirement: Automated comprehension contract

The project SHALL provide a local check that verifies the required model,
distinct score families, person-level provenance with uncertainty, comparison
redundancy, person-specific questionnaire, luck and variance boundary,
divergent-path counterexamples, tier meaning, dataset-relative outcome bands,
missing population denominator, power-law limits, non-prediction, person-path
concepts, and public evidence-coverage boundary remain present.

#### Scenario: Essential explanation disappears

- **WHEN** a required unanswered-question resolution, coverage boundary, or
  stable surface identifier is removed
- **THEN** the clarity check exits unsuccessfully and names the missing contract

