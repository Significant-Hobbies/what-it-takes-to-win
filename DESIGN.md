# Visual system

## Principles

1. **Evidence first.** Numbers, definitions, and limitations carry more visual
   weight than decoration.
2. **One question per section.** Each fold should answer one part of the model.
3. **Different concepts look different.** Starting advantage and built leverage
   retain distinct labels, colors, scales, and provenance language.
4. **Dense, not cramped.** The interface should reward scanning while preserving
   readable line lengths and touch targets.

## Tokens

- Background: `#0b0d12`
- Elevated/card surfaces: `#131722` / `#161b27`
- Primary text: `#e6e9ef`
- Muted text: `#9aa3b2`
- Primary action: `#7c9cff`
- Concept accents: mint for advantages, orange/pink only where semantic
- Radius: `6px` controls, `10px` cards
- Type: Inter for reading, JetBrains Mono for evidence labels and measures

## Components

- Primary actions use the blue accent; secondary actions remain text or outline.
- Cards use one-pixel borders and no decorative shadows.
- Eyebrows are uppercase mono labels that orient, not decorate.
- Charts always include a visible title and an accessible text label.
- Focus rings use the primary accent and must never be removed.
- Navigation marks the current page and remains horizontally scrollable on
  narrow screens.

## Motion and responsive behavior

- Motion is limited to hover/focus feedback and must respect reduced-motion.
- Four-column explanatory structures collapse to two columns, then one.
- Mobile prioritizes the brand, primary navigation, single CTA, and readable
  cards; header search is intentionally deferred to the Explore page.

## Share surface

The Open Graph image uses the same dark editorial system and communicates the
core claim at thumbnail size: 2,585 paths, four layers, no success formula.
