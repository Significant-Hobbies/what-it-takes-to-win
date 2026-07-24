## ADDED Requirements

### Requirement: Deterministic provenance inference
The product SHALL use one shared deterministic mapping from leverage dimensions to relevant documented starting-condition signals and origin categories.

#### Scenario: Same record is built twice
- **WHEN** provenance is generated from unchanged source data
- **THEN** origin, supporting signals, and confidence remain identical

### Requirement: Conservative unresolved default
The inference SHALL default to unresolved when no positive origin evidence exists and SHALL never infer self-built solely from missing advantage evidence.

#### Scenario: Skilled person has no mapped advantage score
- **WHEN** scarce skill or prior reps are non-zero but relevant starting-condition fields are zero
- **THEN** the origin remains unresolved with low confidence

### Requirement: External timing classification
Structural wave leverage SHALL be classified as external, while mixed evidence MAY add an advantage-enabled qualification.

#### Scenario: Structural wave is documented
- **WHEN** structural wave leverage is non-zero
- **THEN** the product identifies external timing as an origin without claiming the person created the wave
