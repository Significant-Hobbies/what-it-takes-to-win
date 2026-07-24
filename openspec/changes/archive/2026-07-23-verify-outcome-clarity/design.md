## Context

The site now contains the right explanatory components, but they have not been held to a repeatable release standard. “Clarity” needs observable gates: the essential answer must appear in one scan, required distinctions must be mechanically testable, representative tier assignments need a consistency sample, and responsive surfaces must be visually inspected.

## Goals / Non-Goals

**Goals:**

- Make the answer understandable without reading every chart or methodology section.
- Detect regressions in the five essential comprehension outcomes.
- Produce a deterministic stratified sample for internal tier-consistency review.
- Verify responsive hierarchy and core interactions on real rendered pages.
- Publish a scorecard that distinguishes product verification from independent research validation.

**Non-Goals:**

- Fabricating real-user evidence or treating automated checks as human comprehension.
- Independently fact-checking all 2,585 biographies.
- Replacing the existing tier system with a text classifier.
- Adding analytics, accounts, or production dependencies.

## Decisions

### Add a one-minute answer and self-check to Insights

The page will state the conclusion in a compact sequence and follow it with five expandable questions and answers. This gives a visitor both the model and a way to confirm the intended interpretation.

### Test semantic contracts, not exact prose

A Node script will build the site and verify that required routes expose the model stages, tier meanings, overlap, non-prediction boundary, profile synthesis, and actionable comparison. Tests will look for stable identifiers and content contracts rather than brittle full-string snapshots.

### Audit tier consistency with a deterministic stratified sample

The audit script will select boundary-aware records from every cohort-tier cell: low-score, median-score, high-score, and seeded representative records. The resulting report supports internal editorial review but is explicitly not a source-veracity audit.

### Preserve the original tier annotation contract

The sample showed that tier assignments describe documented career recognition, while the selected
age-26 milestone determines dataset eligibility. Product copy had incorrectly collapsed those into
one label. The product and methodology will preserve the original career-recognition rubric and make
the two concepts explicit instead of re-tiering records against the wrong interpretation.

### Separate verified and unverified gates

The scorecard will mark automated, visual, and internal-consistency checks independently. “Real-user comprehension” can only pass after outside participants complete the protocol; it cannot be inferred from an agent review.

## Risks / Trade-offs

- **A self-check can teach the answer rather than measure unaided understanding** → Label it a comprehension contract, not user-research evidence.
- **Tier sampling can miss inconsistent records** → Cover every cohort-tier cell and include score-boundary examples.
- **Visual QA may be blocked by browser availability** → Keep the gate failed rather than substituting a claim.
- **More explanation can add page density** → Use a compact summary and collapsible questions.

## Migration Plan

Add the explanation and scripts, run audits, fix surfaced defects, update the scorecard and project status, then archive. All changes are static and reversible.

## Open Questions

Real-user testing remains an external gate unless participants are explicitly recruited.
