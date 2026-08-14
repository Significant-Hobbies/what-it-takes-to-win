---
target: Expected value and ROI lab
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-14T15-09-24Z
slug: src-pages-roi-index-astro
---
Method: dual-agent (A: roi_design_assessment · B: roi_detector_assessment)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 4 | Live probability, proof, and reconciliation states are explicit. |
| 2 | Match system / real world | 4 | Valued investment and conceptual effort are now clearly separated. |
| 3 | User control and freedom | 3 | Rows are editable/removable and clear-all is confirmed; no undo or persistence. |
| 4 | Consistency and standards | 4 | Units, stage language, formulas, and contribution encodings now agree. |
| 5 | Error prevention | 4 | Stage selection is explicit and probabilities never normalize silently. |
| 6 | Recognition rather than recall | 3 | Unit and stage guidance repeat locally, but the populated mobile path is long. |
| 7 | Flexibility and efficiency | 3 | Synthetic example and live calculation help; there is no bulk entry or persistence. |
| 8 | Aesthetic and minimalist design | 4 | The evidence-led ledger/proof composition is cohesive and product-specific. |
| 9 | Error recognition and recovery | 2 | Touched controls are marked invalid, but field-level messages are not associated inline. |
| 10 | Help and documentation | 4 | Formula, stage, provenance, limitation, and local-only guidance are unusually explicit. |
| **Total** |  | **35/40** | **Good** |

## Design Specificity Verdict

The result is strongly authored for What It Takes to Win. The reconciled ledger/proof composition, local arithmetic framing, structural-allocation exhibit, and methodological boundaries would not transfer unchanged to a generic finance calculator. The automated detector returned zero findings for `src/pages/roi/index.astro`; browser inspection found no console errors. No overlay was injected because the exposed browser evaluation surface was read-only.

## Overall Impression

A sober assumption-audit instrument, not a prediction machine. Its strongest move is making the arithmetic and ethical limits visible together. The biggest remaining opportunity is shortening the distance between entry and proof on mobile.

## What's Working

- Inputs, subtotals, probabilities, formulas, and results visibly reconcile.
- The UI distinguishes valued investment allocation from the separate conceptual 100-effort-unit exhibit.
- Blank-first entry, a fictional example, local-only behavior, and explicit boundaries preserve user agency.

## Priority Issues

1. **[P2] Mobile entry and proof are far apart.** A populated example creates a long scroll before the full proof. Add a compact mobile summary tray if this becomes a frequent mobile workflow.
2. **[P2] Field recovery is summarized rather than inline.** Touched invalid controls get `aria-invalid`, but no adjacent `aria-describedby` error. Add concise field-specific recovery text in a later hardening pass.
3. **[P3] Some controls are 42px high.** Increase small-screen controls to the 44px touch-target target.
4. **[P3] The active ROI nav item may begin outside the initial mobile scroll position.** Auto-scroll the active item into view or revisit the global mobile nav pattern.

## Persona Red Flags

- **Jordan (first-timer):** the stage and unit language is now explained at the point of use; the remaining risk is interpreting a positive ROI as a recommendation rather than arithmetic, despite the boundary copy.
- **Sam (accessibility-dependent):** labels, landmarks, focus, native controls, and live status are strong; invalid controls still lack associated inline recovery text.
- **Casey (distracted mobile):** no network dependency helps, but a long worksheet and no local persistence make interruption costly.

## Minor Observations

- Signed EV-contribution bars now reconcile their label and encoding around a midpoint.
- The optional example remains clearly fictional and fully editable.
- Reduced-motion behavior and two-step clear confirmation are appropriate.

## Questions to Consider

- Should a later version frame this even more explicitly as an assumption audit rather than a calculator?
- Would a compact mobile proof tray materially improve real use, or add distracting duplication?
- Is on-device persistence desirable enough to justify the privacy and clear-state explanation it needs?
