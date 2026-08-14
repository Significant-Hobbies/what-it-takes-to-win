## Purpose

Story mode gives readers a guided, chaptered route through the research model
while preserving the evidence, limitations, and agency-focused conclusion.

## ADDED Requirements

### Requirement: Readers can follow the model as a five-chapter story

The site SHALL provide the public `/` landing route that presents survivor
selection, starting position, built or converted leverage, compounding
trajectory, and luck or interpretation boundaries as five ordered chapters.

#### Scenario: Reader enters story mode

- **WHEN** a reader opens `/`
- **THEN** the route identifies the five chapters, presents them in a coherent
  reading order, and offers a next action into the existing evidence surfaces

#### Scenario: Reader navigates directly to a chapter

- **WHEN** a reader follows a story chapter anchor
- **THEN** the corresponding chapter receives focus or scroll position without
  hiding its heading beneath persistent navigation

#### Scenario: Reader follows an older Story link

- **WHEN** a reader opens `/story/`
- **THEN** the route redirects to the canonical `/` landing experience

### Requirement: Story claims remain evidence-bounded

The story SHALL derive its dataset counts and score summaries from the
published data and SHALL label illustrative mechanisms as explanations rather
than measured career probabilities or causal estimates.

#### Scenario: Published dataset changes

- **WHEN** the dataset is rebuilt with a different number of people or score
  distribution
- **THEN** story totals and averages update from the same build-time source
  without hard-coded denominators

#### Scenario: Reader reaches an illustrative sequence

- **WHEN** the story visualizes branching, compounding, or luck
- **THEN** adjacent copy states the relevant interpretation boundary and links
  to methodology or evidence

### Requirement: Cinematic behavior is progressive enhancement

The story SHALL preserve complete semantic content and working navigation on
small screens, without client-side enhancement, and when the visitor requests
reduced motion.

#### Scenario: Motion is allowed

- **WHEN** a capable browser scrolls through the route without a reduced-motion
  preference
- **THEN** a continuous Three.js evidence world, scroll-driven camera, active
  chapter, progress indicator, and chapter navigation update as one coordinated
  transition

#### Scenario: The three-dimensional world is available

- **WHEN** WebGL initializes successfully
- **THEN** five distinct compositions inside the Impossible Observatory
  represent survivor selection, starting conditions, leverage, compounding
  sequence, and the luck boundary without fetching remote visual assets

#### Scenario: WebGL is unavailable

- **WHEN** the renderer cannot initialize or loses its context
- **THEN** the static environmental composition remains visible and the complete
  story remains usable

#### Scenario: Reduced motion is requested

- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** all chapters remain visible and readable without pinned or continuous
  motion effects

#### Scenario: Client-side enhancement is unavailable

- **WHEN** the route is rendered without executing JavaScript
- **THEN** chapter content, anchor links, evidence links, and the final action
  remain available in document order
