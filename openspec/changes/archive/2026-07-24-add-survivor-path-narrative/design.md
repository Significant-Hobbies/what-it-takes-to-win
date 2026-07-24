## Context

The homepage currently leads with a four-stage model, an aggregate callout, and analytical cards. It is clear but emotionally flat: the visitor learns what the variables mean without experiencing the selection process that makes a famous outcome an unreasonable personal benchmark. The new narrative must retain the independent-research-exhibit register and avoid fabricating a failed control group.

## Goals / Non-Goals

**Goals:**

- Make repeated uncertainty and survivor selection understandable before detailed analysis.
- Create one distinctive visual moment that remains legible without animation or interaction.
- Move the visitor through awe, distance, relief, humility, and bounded agency.
- Keep every numerical element explicitly illustrative unless derived from the dataset.

**Non-Goals:**

- Estimating a real person’s probability of success or luck.
- Claiming every career gate is independent or has 50% odds.
- Simulating an empirical control group.
- Turning the site into motivational coaching, a personality test, or a cinematic landing page.
- Adding a visualization dependency or client-side runtime.

## Decisions

### Use a 64-to-1 thought experiment

Seven rows—64 plausible starts followed by six hypothetical 50/50 gates—make repeated selection immediately visible. The component will state that real careers are not fair coins: advantage can alter odds, capability can improve them, persistence can create more attempts, and events remain uncertain.

A probabilistic simulator was rejected because interactivity would imply more empirical precision than the data supports.

### Render the field as semantic HTML and CSS

Each row will contain a label, a field of dots, and a surviving count. The accessible label will explain the complete thought experiment; decorative dots will be hidden from assistive technology. CSS will handle progressive narrowing, the peak treatment, and responsive wrapping.

Canvas and ECharts were rejected because the idea should remain readable in source HTML, fast on first load, and visible before chart code activates.

### Place the emotional hinge immediately after the hero

The visitor encounters the survivor-path narrative before aggregate findings and score families. This changes the order from “understand the model, then infer the meaning” to “feel why comparison fails, then inspect the evidence.”

### Keep the language restrained

The key line will be “You were comparing your unfinished branch with someone else’s surviving streak.” It will be followed by a methodological boundary and a concrete next question, not inspiration or reassurance unsupported by evidence.

### End with bounded agency

The homepage ending will replace a generic Explore button with: “The useful question is not whether you are the next X. It is which part of the next branch is controllable.” Actions will lead to path inspection and the diagnostic comparison flow.

## Risks / Trade-offs

- **The coin metaphor may imply careers are random** → Explain how advantage, capability, and runway alter exposure and odds.
- **Exact halving may look empirical** → Label the component “thought experiment” in its heading, caption, accessible name, and audit contract.
- **Emotional language may feel manipulative** → Use one direct line, surround it with methodological boundaries, and avoid animation or dramatic claims.
- **Many dots may become noisy on mobile** → Reduce dot size and spacing while preserving row counts and textual labels.

## Migration Plan

1. Add the static survivor-path component and homepage emotional close.
2. Add responsive visual treatment and reduced-motion-safe behavior.
3. Extend clarity audit and product documentation.
4. Run checks, build, browser review, and archive the change.
5. Publish only the exact green commit.

Rollback is a normal source revert.

## Open Questions

None blocking.
