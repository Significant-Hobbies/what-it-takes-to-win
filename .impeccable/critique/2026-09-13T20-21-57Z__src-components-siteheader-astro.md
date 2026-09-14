---
target: Paths shared masthead
total_score: 27
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 0
timestamp: 2026-09-13T20-21-57Z
slug: src-components-siteheader-astro
---
Method: dual-agent (A: /root/header_review_a · B: /root/header_review_b)

# Shared masthead review

The header preserves the existing four destinations while replacing the boxed
folio styling with a serif Paths wordmark and quiet ink navigation. It aligns
with the documentary reading width. A visually inspected the desktop homepage;
B independently tested keyboard navigation to Articles and its active state.
Root inspected 320/390/768/1440px, with no horizontal overflow.

## Nielsen assessment A

| Heuristic | Score |
| --- | ---: |
| Status | 4 |
| Real-world match | 4 |
| Control | 4 |
| Consistency | 3 |
| Prevention | 4 |
| Recognition | 4 |
| Efficiency | n/a |
| Aesthetics | 4 |
| Recovery | n/a |
| Help | n/a |
| Total | 27/28 |

Efficiency, recovery and help add no applicable header-specific workflow here.
These scores cover the header only, not the entire product.

## Specificity, cognitive load, and personas

The masthead shares the page's paper, ink and book typography; no unrelated
component-gallery styling is introduced. The wordmark leads, and navigation
supports it. Four visible links keep cognitive load low. First-time readers
retain familiar destinations. Keyboard readers have a visible 2px ink focus
outline and native tab order. Phone users retain every link in a compact row
and get 44px minimum targets; narrower layouts can reflow without JavaScript.

## Issues and disposition

No P0/P1 found. The reviewed browser title still used the legacy brand; that P2
was fixed centrally in Base after review. Mobile labels were raised from 12px
to 13px and rechecked. Desktop Atlas has a narrower-than-44px link box but ample
separation and 44px height; no AA failure confirmed. Scoped color roles are
intentional, with the new green focus treatment documented in DESIGN.md.

## Technical audit B

Accessibility 4/4; performance 4/4; theming 3/4; responsive 3/4; implementation
integrity 4/4. Total 18/20. Responsive score reflects B's desktop-only review;
root supplied the additional viewport evidence. A single detector run over
SiteHeader.astro and Base.astro returned zero findings. No overlay injection:
the browser evaluation surface is read-only. No additional runtime dependency.

## Next decision

Questions skipped: the owner explicitly asked for visual improvement while
preserving options. The requested scope is complete; no additional navigation
feature or wider redesign is necessary. Articles remain unchanged.
