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
- The homepage is a marble run: **three marbles, one open channel, one clock.**
  Sixty-four read as a competition, which is the frame the essay dismantles. One
  compared nothing. Two on separate boards never met.
- **The lead must change hands.** Each marble has a different speed profile and
  the channel alternates steep and shallow, so the order turns over more than
  once. The marble handed the most starting momentum currently finishes last.
  That is the argument, not a bug.
- **The running surface must be visible.** The track is an open channel swept
  from a U profile with a bright lip along both edges. It was a `TubeGeometry`
  with `side: BackSide` — the inside far wall of a pipe — and rendered as grey
  sausages that no amount of lighting could rescue.
- **Marbles are excluded from tone mapping** (`toneMapped: false`) but still lit.
  ACES desaturated them to near-white three separate times, through clearcoat,
  then emissive, then the palette. Excluding them fixes the cause; keeping the
  material lit keeps them reading as spheres rather than flat discs.
- **Marbles must be large in frame.** The camera sits low and close alongside the
  channel, the way this footage is actually shot. An aerial vantage put them at
  5% of frame height, which is why nobody could tell what was happening.
- **The scene renders on demand.** Once the damped scroll progress settles there
  is nothing new to draw. It used to run rAF forever, competing with the reader's
  own scrolling for the main thread.
- **No shadow maps and no point lights.** A moving caster regenerated a 2048 map
  every frame, and eight point lights each cost a full per-fragment pass. Marbles
  get a contact disc; lighting is hemisphere plus two directional.
- Pixel ratio is capped at 1.25. Above that the scene gains nothing visible.
- Motion is read from receding trail ghosts, not a blur pass.
- Contact between marbles is a **pure function of the current frame**, so the
  whole scene still scrubs exactly in both directions.
- The peg field's amplitude is hash-derived, never score-derived. Luck must not
  look like it is rewarding anything.
- The run starts *inside* the first hole at scroll zero.
- "One of many" is carried by ghost branches that peel away and fade.
- Lateral framing is verified by projecting each marble to normalised device
  coordinates (`data-story-runners`), not by eye.
- The three condition factors are never summed anywhere in the product.
- **Sound is opt-in and synthesised.** Off until pressed, no AudioContext until
  then, no audio files. The roll follows scroll speed, not a clock.
- The non-WebGL fallback is a generated inline SVG, never an exported render.
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
