## MODIFIED Requirements

### Requirement: Four-stage outcome model
The product SHALL explain early extraordinary outcomes as an observed path from documented starting advantages through building or conversion into capability leverage, compounding trajectory, and documented career standing. It SHALL present starting advantages and built or converted leverage as separate score families with distinct names, definitions, visual treatments, and scales. It SHALL distinguish the selected early milestone used for dataset eligibility from the editorial career-recognition tier. It SHALL also provide a one-minute answer and a five-question self-check that preserve the distinctions between positioning, conversion, recognition, overlap, and prediction.

#### Scenario: First-time homepage visitor
- **WHEN** a visitor opens the homepage
- **THEN** the four stages and the concise central answer are visible in plain language before the detailed charts, and starting advantages cannot be mistaken for capability leverage

#### Scenario: Visitor checks their interpretation
- **WHEN** the visitor opens the Insights comprehension check
- **THEN** they can verify the five essential conclusions without reading the complete methodology

## ADDED Requirements

### Requirement: Honest leverage provenance
The product SHALL explain that capability leverage can be self-built, advantage-enabled, earned, external, mixed, or unresolved. A person-level origin SHALL be labelled as a best-supported inference, include the signals supporting it and its confidence, and MUST NOT treat missing advantage evidence as proof that the lever was self-built.

#### Scenario: Visitor asks where capability came from
- **WHEN** leverage is explained on an overview or individual surface
- **THEN** the product distinguishes possible origins, evidence-bounded inference, and established biographical fact and states that the score measures presence rather than origin

### Requirement: Luck is not a score
The product SHALL explain structural luck, encounter luck, event luck, and outcome variance as cross-cutting influences and MUST NOT calculate a luck score or success probability from this dataset.

#### Scenario: Visitor interprets an outcome path
- **WHEN** the four-stage model or a comparison result is presented
- **THEN** luck and unobserved variance are shown as acting across stages rather than as a fifth deterministic input
