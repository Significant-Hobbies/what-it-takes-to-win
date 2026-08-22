# Visual system

## Principles

1. **Evidence first.** Numbers, definitions, and limitations carry more visual
   weight than decoration.
2. **One question per section.** Each fold should answer one part of the model.
3. **Different concepts look different.** Starting advantage and built leverage
   retain distinct labels, colors, scales, and provenance language.
4. **Dense, not cramped.** The interface should reward scanning while preserving
   readable line lengths and touch targets.
5. **Evidence becomes mechanism.** The canonical landing turns starting
   position, leverage, sequence, and luck into a machine the reader can watch
   run, without implying that the illustrative course is measured data.

## Tokens

- Landing atmosphere: deep ink `#0b0d12`, lane steel `#27324a`, mint `#5fd3bc`
  for a track that helps, amber `#f0a36b` for a track that fights
- Evidence surfaces: `#0b0d12`, elevated `#131722` / `#161b27`
- Primary text on the landing: `#f7f4ec`; muted text `#bdc9d6`
- Primary action and trajectory light: `#4f7dff`
- Concept accents: mint for advantages, orange/pink only where semantic
- Radius: `6px` controls, `10px` cards
- Type: Inter for reading, JetBrains Mono for evidence labels and measures

## Components

- Primary actions use the blue accent; secondary actions remain text or outline.
- Cards use one-pixel borders and no decorative shadows.
- Eyebrows are uppercase mono labels that orient, not decorate.
- The homepage is a five-chapter marble run with **one** marble. A field of
  marbles reads as a race, and a race is a competition — the exact frame the
  essay spends its length dismantling. One marble is a journey, and it is the
  only thing a reader can actually follow.
- "One of many" is carried by **ghost branches**: at each junction a translucent
  path peels away and fades. Those are the alternatives that were available and
  did not happen. Biography hides the branches; it does not line up rivals.
- The course is a real obstacle course, not a slope: a release drop through a
  funnel ring, a fast chute, a descending helix, a trussed leverage hall, a gap
  crossed on momentum alone, gates that hang lower along the run, and a peg field
  that deflects for no reason. A reader should be able to name what is happening.
- The marble is generated from one condition-factor triple, the same three the
  profiles publish. Inherited sets the height of the opening drop, endowment sets
  rolling efficiency, ecosystem decides whether the middle helps or fights.
- The peg field's amplitude is hash-derived, never score-derived. Luck must not
  look like it is rewarding anything.
- The run is already moving at scroll position zero. A static opening frame is
  the least interesting moment in the sequence.
- The channel barely clears the marble. Much wider and the track reads as a pipe.
- The camera chases in the course's own frame — behind, above, off to one side —
  and aims far enough ahead that the next obstacle is in shot. Framing the whole
  course makes the marble too small to follow; framing only the marble loses the
  course.
- Lateral framing is verified by projecting the marble to normalised device
  coordinates (`data-story-ndc`), not by eye. An earlier version put it at screen
  x ~520, underneath the copy column: rendering every frame, invisible.
- The three condition factors are never summed anywhere in the product, in the
  world or on a profile. A composite would be one more number to rank people by.
- The non-WebGL fallback is an inline SVG generated from the same shape — one
  path, ghost branches, one marble — never an exported render. Raster plates
  drifted once already: they kept showing a stone observatory after it was gone.
- Evidence coverage uses ruled ledgers, confidence bars, and explicit pending
  states; completeness and verification must never share one badge.
- Charts always include a visible title and an accessible text label.
- Focus rings use the primary accent and must never be removed.
- Navigation marks the current page and remains horizontally scrollable on
  narrow screens.

## Motion and responsive behavior

- Landing motion is one scroll-driven race. Marble position is a pure function
  of scroll progress, so it scrubs cleanly in both directions; a physics
  simulation cannot be run backwards. Operational and evidence surfaces retain
  hover/focus-only motion. Every route respects reduced-motion.
- Four-column explanatory structures collapse to two columns, then one.
- Signature branch fields retain labelled counts and conclusions when their
  visual dots compress or wrap.
- Mobile prioritizes the brand, primary navigation, single CTA, and readable
  cards; header search is intentionally deferred to the Explore page.

## Share surface

The Open Graph image uses the same dark editorial system and communicates the
core claim at thumbnail size: thousands of paths, four layers, no success formula.
