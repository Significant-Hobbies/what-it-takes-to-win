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
- The homepage is a five-chapter marble run. Sixty-four marbles are released
  from one hopper down twelve lanes to a single finish, and scroll position
  drives the race. The lanes are deliberately unfair: that is the argument, not
  a flaw in the model. The former evidence overview lives at `/overview/`.
- Every lane is generated from one condition-factor triple, the same three the
  profiles publish. Inherited sets release height, endowment sets rolling
  efficiency, ecosystem shapes the middle. A −1 becomes a real uphill section.
- The five sections each do a different job to the marble, so the terrain under
  the reader changes as the copy does: one visible release; lanes separating to
  the heights inheritance bought; a leverage hall whose gain is proportional to
  the speed already carried; ordered gates that hang lower along the run; and a
  boundary of hash-derived deflection that must never look like it is rewarding
  anything.
- Marble liveries are jewel tones, not pastels, because the reader has to be
  able to follow one marble. Reflectivity stays low for the same reason: a
  mirror finish shows the environment instead of the colour.
- The three condition factors are never summed anywhere in the product, in the
  world or on a profile. A composite would be one more number to rank people by.
- Landmarks are read sequentially rather than all at once. The camera stays
  close and travels with the pack; framing the whole course makes the marbles
  too small to tell apart.
- The non-WebGL fallback is an inline SVG generated from the same lane shape,
  never an exported render. Raster plates drifted once already: they kept
  showing a stone observatory after the observatory was removed.
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
