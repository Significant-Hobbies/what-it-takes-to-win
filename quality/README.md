# Quality reports

Checked-in research audit reports with the raw data behind them. The automated
release gate is described in [docs/quality-gates.md](../docs/quality-gates.md);
this folder holds the audits that need a second annotator or external fetches.

| File | What it is |
|---|---|
| `RELIABILITY_REPORT.md` | Secondary annotation reliability, 2026-07-31. A blinded second coder re-scored a deterministic 16-record sample. Tier agreement within one band every time, weighted kappa 0.723. |
| `reliability/secondary-coding-v1.json` | The blinded artifact the report is computed from. `audit_reliability.mjs` recomputes the published figures from it. |
| `CLARITY_SCORECARD.md` | Release clarity gates as of 2026-08-08, the six-question external comprehension protocol, and the gates that remain pending |
| `source-audit/REPORT.md` | Source URL reachability audit, 2026-08-08: 10,025 URLs across 2,770 people, 84 percent reachable |
| `source-audit/audit-v1.json` | Per-URL status, final URL, and retrieval date. `audit_sources.mjs` extends it incrementally. |

Reachability does not verify that a source supports a claim. The independent
content audit, first-time-user comprehension, and the matched comparison study
remain open and are reported as pending on `/coverage/`.
