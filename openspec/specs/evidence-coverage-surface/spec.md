# evidence-coverage-surface Specification

## Purpose
Make structural completeness, source depth, confidence, sample composition,
indexability, and unresolved independent verification publicly inspectable.
## Requirements
### Requirement: Public coverage summary

The product SHALL provide a public coverage surface whose headline metrics are
calculated from the currently published dataset at build time.

#### Scenario: Published dataset changes

- **WHEN** records, sources, trajectories, or evidence confidence change
- **THEN** the next build updates the coverage metrics without manual copy edits

### Requirement: Completeness and verification remain distinct

The coverage surface MUST distinguish field completeness, listed-source depth,
indexability, evidence confidence, and independent factual verification.

#### Scenario: Visitor sees high numerical coverage

- **WHEN** the page reports complete trajectories or two-source coverage
- **THEN** it also states that these facts do not establish independent
  verification, representativeness, or causal validity

### Requirement: Composition is inspectable

The coverage surface SHALL show cohort and outcome-tier composition and SHALL
state the early-breakthrough, successful-outlier, and missing-control-group
boundaries.

#### Scenario: Visitor interprets the sample

- **WHEN** they inspect the distribution
- **THEN** they can identify which groups dominate the dataset and why the
  displayed shares are not population prevalence

### Requirement: External quality gates remain honest

The coverage surface SHALL list the work needed for an independently audited
v1.0 and SHALL NOT mark first-time-user validation or independent source review
as complete without external evidence.

#### Scenario: Product-controlled checks pass

- **WHEN** automated and visual release checks succeed
- **THEN** the page may report release completeness while keeping the external
  research gates pending
