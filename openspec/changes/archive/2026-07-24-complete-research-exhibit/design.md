# Design: Complete the research exhibit

## Product register

Independent editorial research exhibit. The page should feel closer to a
museum label or data-journalism feature than a dashboard or success quiz.

## Homepage composition

The hero becomes a two-column editorial composition:

- left: question, concise answer, one primary action, and one quiet secondary
  link;
- right: a compact "visible outcome / unseen branches" exhibit that previews
  the survivor-path model with real dataset scale and an explicit uncertainty
  boundary.

The full 64-to-1 thought experiment remains below as the signature explanation.
Repeated dataset stat cards are removed. A compact evidence strip bridges the
model and the detailed charts.

## Coverage surface

`/coverage/` computes all displayed values from the imported published dataset
at build time. It contains:

1. a plain-language verdict;
2. source, trajectory, and indexability coverage;
3. evidence-confidence distributions;
4. cohort and outcome-tier composition;
5. explicit unknowns and selection boundaries;
6. the external work required for an independently audited v1.0.

Metrics must never imply representativeness. The page must distinguish
"field present", "two sources listed", "passes indexability gate", and
"independently verified".

## Visual refinement

- Preserve the restrained dark palette and semantic mint/blue accents.
- Increase hierarchy through scale, whitespace, rule lines, and typographic
  contrast rather than shadows or decorative gradients.
- Use a subtle editorial grid only inside signature exhibits.
- Give sections clear beginnings and endings; avoid a wall of same-weight cards.
- Keep controls at least 44px high and text readable at 390px.

## Implementation

- Add `src/lib/coverage.ts` for pure summary calculations.
- Add `src/pages/coverage/index.astro`.
- Add coverage to primary navigation and footer metadata.
- Update `src/pages/index.astro` and append scoped styles in
  `src/styles/global.css`.
- Extend `src/scripts/audit_clarity.mjs` with coverage-route and semantic-marker
  checks.
- No runtime data fetch or additional client JavaScript is required for the new
  coverage surface.

## Risks and mitigations

- **Trust metrics become self-congratulatory** — pair every completion number
  with the unresolved audit boundary.
- **Hero becomes ornamental** — require its branch labels and conclusion to be
  semantic text without JavaScript.
- **Navigation becomes crowded** — use the concise label "Evidence" and retain
  horizontal scrolling on narrow screens.
- **Homepage remains too long** — remove duplicated stat tiles and group charts
  into one clearly labelled evidence section.

