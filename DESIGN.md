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
- The homepage is a marble run: **three marbles, one board, one clock.** Sixty-
  four read as a competition, which is the frame the essay dismantles. One
  compared nothing. Two on separate boards never met. Three on a shared board
  touch, jostle, and trade the lead.
- **The lead must change hands.** Each marble has a different speed profile — one
  dives hardest and bleeds most, one holds pace where the board stops helping —
  and the board deliberately alternates steep and shallow so the order turns over
  more than once. A reader who watches the lead trade cannot come away thinking
  the finishing order measured the marbles. The marble handed the most starting
  momentum currently finishes last, and that is the point, not a bug.
- Profiles come from the three condition factors the profiles publish: inherited
  sets starting momentum, endowment sets rolling retention, ecosystem sets how
  much of a slope converts to speed at all.
- "One of many" is carried by **ghost branches** that peel away at junctions and
  fade — alternatives that were available and did not happen.
- The board is a real obstacle course: a first hole the run *starts inside*, a
  shallow run-out, a descending helix, a long flat, a leverage drop, a gap
  crossed on momentum, switchbacks, gates hanging lower as they go, and a peg
  field. A reader should be able to name what is happening.
- Contact between marbles is a **pure function of the current frame**, with no
  accumulated state, so the whole scene still scrubs exactly in both directions.
- The peg field's amplitude is hash-derived, never score-derived. Luck must not
  look like it is rewarding anything.
- The run is already moving at scroll zero, and it starts *in* the first hole.
  Anything before the first drop is dead air the reader must scroll past.
- The channel barely clears three marbles abreast. Wider and the board becomes a
  pipe the camera looks down.
- The camera anchors to the pack's average position and **averages board
  geometry over a window of arc length**. Chasing the marbles directly threw the
  frame around every time the board turned, worst through the helix.
- Lateral framing is verified by projecting each marble to normalised device
  coordinates (`data-story-ndc`, `data-story-runners`), not by eye. An earlier
  version put the whole field at screen x ~520, under the copy column:
  rendering every frame, invisible.
- Each marble carries its own point light, so it is unmistakably the brightest
  thing present and lights the stretch of board it is on.
- The three condition factors are never summed anywhere in the product, in the
  world or on a profile. A composite would be one more number to rank people by.
- **Sound is opt-in and synthesised.** Off until pressed, no AudioContext
  constructed until then, no audio files. The roll follows scroll *speed*, not a
  clock: the marbles are only moving while the reader is.
- The non-WebGL fallback is an inline SVG generated from the same shape, never an
  exported render. Raster plates drifted once already.
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
