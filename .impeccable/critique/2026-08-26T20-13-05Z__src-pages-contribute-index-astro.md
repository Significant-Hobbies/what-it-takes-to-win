---
target: Public suggest-person and propose-edit workflow
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-26T20-13-05Z
slug: src-pages-contribute-index-astro
---
Method: dual-agent (A: coverage_design_review · B: coverage_detector_review)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | The active task is clear, but the pre-polish review introduction could land behind sticky chrome. |
| 2 | Match system / real world | 3 | Direct copy; “dated age-relative outcome” still benefits from an example. |
| 3 | User control and freedom | 4 | Task switching preserves entries, review has a return action, and GitHub never auto-submits. |
| 4 | Consistency and standards | 2 | Pre-polish primary and review actions fell back to browser defaults. |
| 5 | Error prevention | 3 | Date, age, evidence-domain, privacy, length, and preview gates are present. |
| 6 | Recognition rather than recall | 3 | Labels and hints are visible; the protocol is hidden on mobile. |
| 7 | Flexibility and efficiency | 3 | Query-prefilled edits, preserved task entries, copy, and GitHub handoff support alternate paths. |
| 8 | Aesthetic and minimalist design | 3 | Focused, ruled, card-free composition with some long-form density. |
| 9 | Error recognition and recovery | 3 | Specific summaries and inline errors preserve work. |
| 10 | Help and documentation | 3 | Protocol, source hints, privacy boundary, and editorial close explain the workflow. |
| **Total** | | **29/40** | **Good before same-turn polish.** |

## Design Specificity Verdict

Strongly authored and faithful to the preserve-lane Kinetic Essay contract. The ruled task sheet, dark public-issue boundary, evidence protocol, and one-task switch translate Look Sideways research ethics into interaction design. It avoids cards and gradients and keeps the workflow on one paper plane.

The deterministic detector returned zero findings across the contribution page and its profile and Explore entry points. Browser evidence found no console errors or page overflow at 390, 768, or 1440 pixels. Mutable overlay injection was unavailable, so the browser assessment used DOM snapshots, screenshots, responsive metrics, and interaction state.

## Overall Impression

The flow is trustworthy and product-specific. The main opportunity was to make the final review handoff as deliberate as the editorial writing around it.

## What's Working

- Suggest and Edit are explicit, URL-addressable tasks, with only one visible at a time.
- Public visibility, sensitive-information limits, and the non-publication guarantee appear before data entry.
- The exact GitHub issue is reviewed locally before any external handoff.

## Priority Issues

1. **[P1] Primary actions were browser-default controls.** This weakened hierarchy and left touch targets below 44 pixels. Fixed in the same turn with local primary and secondary button states and verified 44-pixel mobile height.
2. **[P1] The final-review introduction could land under sticky chrome.** This hid the most important GitHub reassurance. Fixed in the same turn with review scroll margin and focus on the review heading.
3. **[P2] Mobile hides the four-step protocol.** The privacy and submission boundaries remain visible, but the supporting progress model is desktop-only.
4. **[P2] The long form could use stronger internal chapters.** Outcome, evidence, and disclosure are separated by rules but not explicit subsection headings.

## Persona Red Flags

- **Jordan, first-timer:** “Dated age-relative outcome” has no completed example.
- **Sam, accessibility-dependent contributor:** Inline errors are visible but are not individually connected through `aria-describedby`.
- **Casey, distracted mobile contributor:** A refresh loses a half-completed draft, although ordinary task switching preserves it.

## Minor Observations

- “Issue #29” is internal provenance and could be linked or removed later.
- The fixed AI footer is inherited product chrome and competes slightly with the contribution close on mobile.
- Shared palette tokens remain greener than the mineral-white Kinetic Essay direction.

## Questions to Consider

- Should a half-completed evidence draft survive a refresh?
- Would one concrete qualifying-outcome example reduce first-time uncertainty?
- Is the mobile protocol worth keeping as a compact ruled folio?
