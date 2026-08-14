## ADDED Requirements

### Requirement: The ROI lab participates in public discovery

The canonical `/roi/` route SHALL be linked from site navigation and SHALL
appear in the sitemap, Markdown mirrors, `llms.txt`, and machine-readable
surface catalog. Its non-JavaScript representations SHALL describe the same
formulas, user-supplied assumption boundary, and no-runtime-AI constraint as the
visible worksheet.

#### Scenario: Human or agent discovers the ROI lab

- **WHEN** a visitor uses site navigation or an agent reads `/api/ai`, `/llms.txt`, or `/sitemap.xml`
- **THEN** `/roi/` is represented as a canonical expected-value and ROI tool with a truthful summary and `/roi.md` alternate

