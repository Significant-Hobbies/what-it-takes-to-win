---
target: homepage Field Atlas second iteration
total_score: 17
max_score: 28
na_heuristics: 5,7,9
p0_count: 0
p1_count: 2
timestamp: 2026-08-23T14-21-54Z
slug: src-pages-index-astro
---
# Homepage Field Atlas critique — second iteration

Method: dual-agent (A: critique_design · B: critique_detector)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | Desktop rail communicates state; mobile reduces this to an unlabeled line. |
| 2 | Match with the real world | 3/4 | Evidence-bounded language is strong; the missing visual key weakens score terminology. |
| 3 | User control and freedom | 3/4 | Anchor navigation and opt-in sound exist; local chapter navigation disappears on mobile. |
| 4 | Consistency and standards | 2/4 | Field Atlas materials coexist with legacy marble-world state and mismatched grids. |
| 5 | Error prevention | n/a | No meaningful input or destructive workflow. |
| 6 | Recognition rather than recall | 2/4 | Route meanings and chapter relationships are not kept visible. |
| 7 | Flexibility and efficiency | n/a | Not material to this Persuade surface. |
| 8 | Aesthetic and minimalist design | 2/4 | Terrain consumes space without carrying enough explanation. |
| 9 | Error recovery | n/a | No error-producing workflow on this surface. |
| 10 | Help and documentation | 3/4 | Reading contract and methodology links are strong; the visual legend is missing. |
| **Total** | | **17/28** | **Acceptable foundation; not release-level polish.** |

## Design Specificity Verdict

The mineral paper, survey ink, route colors, ruled evidence, and limitation-first
copy belong to Look Sideways. The composition does not yet express the unique
mechanism. The approved probe makes routes, nodes, legend, and interpretation
boundary the main event; the implementation makes a large headline the main
event and treats terrain as pale scenery.

The deterministic detector returned zero source findings, but browser evidence
found the decisive runtime failure: Three.js initializes on a CSS-hidden canvas,
adds `story-webgl-ready`, and causes every authored `.stage-scene` to compute to
`visibility:hidden`. The overlay scan also reported 80 advisory flags dominated
by undersized UI text and low contrast; flags on hidden stage elements are false
positives until the stage is restored.

## Overall Impression

The spacing correction succeeded, but the page is still a styled essay rather
than an authored route survey. The biggest opportunity is to make the route
system carry the explanation instead of decorating it.

## What's Working

- The opening copy, CTA, and reading contract now fit naturally at all target widths.
- Typography, mineral palette, ruled ledgers, and square geometry reject the old dashboard language.
- Counts, thought-experiment labels, and evidence limitations are disciplined and trustworthy.

## Priority Issues

### P1 — The first viewport does not prove the product thesis

The visible route is one pale diagonal trace with no competing alternatives,
nodes, or line-language legend. Restore a real survey figure with unequal routes,
endpoints, and the four-part path key.

### P1 — The authored chapter figures are hidden at runtime

The hidden canvas still mounts the obsolete marble world, whose readiness class
hides the five HTML Field Atlas scenes. Make the HTML stage canonical, stop the
obsolete mount, and expose the figures at responsive widths.

### P2 — The folio grid is fractured

Header brand, story rail, copy, and stage use unrelated seams. Introduce one
desktop atlas-index width and register all major regions to it.

### P2 — Legacy cinematic motion flattens the journey

Repeated word blur and identical entrance treatment make every chapter feel the
same. Keep headings legible and move authored motion into routes, nodes, and
field-note registration.

### P2 — Mobile loses the defining system

Mobile hides the chapter figures and reduces sound to a floating icon. Preserve
a compact figure/key and move a labeled sound control into the reading contract.

## Persona Red Flags

- **Jordan, first-time reader:** understands the headline but cannot decode the route as evidence.
- **Riley, skeptical researcher:** sees an unchanged figure across chapters, weakening trust.
- **Casey, mobile reader:** loses route diagrams and local orientation; the floating sound control can obscure evidence.

## Minor Observations

- Tiny figure metadata approaches illegibility.
- `LS` reads like internal shorthand rather than a public folio mark.
- The hidden Three.js initialization wastes runtime work.
- The footer is considerably denser than the story ending above it.

## Questions to Consider

- Can the opening demonstrate route inequivalence without relying on its prose?
- Can each chapter be identified from its survey figure alone?
- If the terrain layer disappeared, would comprehension materially decline?
