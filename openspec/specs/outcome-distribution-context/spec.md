# outcome-distribution-context Specification

## Purpose
TBD - created by archiving change explain-outcome-percentiles. Update Purpose after archive.
## Requirements
### Requirement: Dataset-relative outcome band
The product SHALL show each editorial tier’s count, share of the curated dataset, and cumulative rank band from the top. It MUST state that the tier does not rank people within that band.

#### Scenario: Visitor opens a person page
- **WHEN** a person’s outcome standing is displayed
- **THEN** the visitor sees the person’s dataset-relative tier band and a no-within-tier-ranking caveat

### Requirement: Observable lower-tier denominator
The product SHALL show how many lower-tier profiles exist in the curated dataset and the lower-tier-per-member ratio for the selected tier.

#### Scenario: Visitor inspects a T1 profile
- **WHEN** the selected person belongs to T1
- **THEN** the page reports the number of T2–T4 profiles and their ratio per T1 profile using values derived from the current dataset

### Requirement: Selected-sample boundary
The product MUST state beside the distribution context that the dataset contains documented early-breakthrough paths and excludes the general population, ordinary attempts, and unobserved near-misses. It MUST NOT present tier shares or ratios as success probabilities or population prevalence.

#### Scenario: Visitor asks how many people were far from a famous outcome
- **WHEN** the product presents a lower-tier count or ratio
- **THEN** it distinguishes the observable lower-tier sample from the unknowable population and failure denominator

### Requirement: Evidence-bounded power-law explanation
The product SHALL explain in plain language how heavy-tailed or power-law-like outcome distributions differ from bell-curve intuition and how compounding can widen outcome gaps. It MUST state that the four editorial tiers are not a fitted power law and that no Pareto exponent is estimated.

#### Scenario: Visitor reads the distribution explanation
- **WHEN** the visitor opens Insights
- **THEN** they can understand the long-tail intuition and the limits of the current data without encountering a fitted or predictive claim

### Requirement: Deterministic distribution context
All counts, shares, rank bands, and ratios SHALL be derived from the current built dataset through the shared outcome model.

#### Scenario: Dataset composition changes
- **WHEN** the static site is rebuilt after records or tier assignments change
- **THEN** every aggregate and person page renders mutually consistent distribution context without manually updated constants

