---
title: "Designing a Public Research Exhibit About Life Outcomes"
slug: "designing-a-public-research-exhibit-about-life-outcomes"
target_query: "designing a public research exhibit about life outcomes"
search_intent: "Researchers, writers, designers, or educators looking for methodological, structural, and editorial guidance on how to present complex life outcome data without reducing it to a deterministic score or ranking."
meta_title: "Designing a Public Research Exhibit: Evidence Over Rankings"
meta_description: "How to design a public research exhibit about life outcomes. Learn why 3,578 paths are presented through condition factors, luck, and evidence instead of comparative scores."
---

## Outline

1. **Introduction:** The moment of comparison and the purpose of the exhibit.
2. **Structuring the Evidence:** The three condition factors instead of a single metric.
3. **Handling Perseverance and Luck:** Making the unquantifiable visible.
4. **Editorial Guardrails against Determinism:** Why rankings, predictions, and scores are omitted.
5. **The Kinetic Essay and Surface System:** Visualizing paths without reducing them to numbers.
6. **The Architecture of Disclosure:** Progressive detail across 3,578 paths.
7. **Broadening the Definition of Success:** From extreme outliers to distinctive paths.
8. **Interactive Models Without Data Extraction:** The local-only Expected Value & ROI Lab.
9. **Independent Operation and Data Integrity:** Ensuring the exhibit remains a verifiable tool.
10. **Next Action:** Exploring the atlas and rethinking data presentation.

---

## The Moment of Comparison

Most investigations into success start with a desire to replicate it. Readers arrive after turning another person's visible outcome into a judgment about their own pace, ability, or worth. They seek a formula, a set of habits, or a comparative benchmark to tell them if they are ahead or behind.

When designing Look Sideways—a public research exhibit detailing 3,578 early-breakthrough paths—the primary design constraint was to interrupt this judgment. The exhibit exists to explain why that comparison deletes conditions, perseverance, sequence, luck, and the unobserved paths that did not survive. It is designed as an independent public research exhibit, not a dashboard, coaching product, ranking, or prediction engine.

The brand voice is direct, humane, and evidence-bounded. It relies on specific numbers before adjectives, and short statements followed by inspectable evidence. It avoids deterministic, motivational, or status-seeking language. By treating the project as a museum or research exhibit rather than a startup-growth dashboard, the design forces the reader to look sideways for information, never for a verdict. The exhibit focuses on an evidence-led journey, addressing an audience caught in unhelpful comparison, as well as researchers, writers, and curious readers who want the evidence behind the argument.

## Structuring the Evidence: Three Condition Factors

If you refuse to score a person's worth, how do you categorize their path? The exhibit organizes 3,578 source-linked paths—spanning 1,390 founders and operators, 1,079 athletes, 811 creators and artists, and 298 researchers and independent engineers—around three condition factors. Every public explanation of advantage uses this three-source structure:

1. What they brought
2. What they were handed
3. What surrounded them

These condition factors are evaluated on a scale of −1 to 3. This scale deliberately includes negative values so that the 458 documented headwind readings are visible rather than collapsed into zero. In total, all 3,578 paths are scored for what they brought (with 3 headwinds recorded), what they were handed (with 458 headwinds recorded), and what surrounded them (with 5 headwinds recorded).

The fundamental rule of this data model is that these three factors are never added into a single score. Summing them would create just another number to rank people by. Instead, they remain separate vectors of context. A reader looking at a profile sees what advantages a person started with, what leverage they built or converted, and what environmental factors influenced their trajectory. Distinct starting-advantage and built-or-converted-leverage score families are presented with separate visual treatments, scales, and an explicit self-built, advantage-enabled, earned, external, or mixed provenance boundary.

## Handling Perseverance and Luck

Perseverance and luck are the two elements most often flattened in biographical summaries. In Look Sideways, they are treated as documented path evidence that crosses the three condition sources.

Perseverance appears only where sources explicitly document it. It is not assumed, and its absence in the record does not imply a lack of effort. Neither perseverance nor luck is summed into a person score.

Luck is kept visible and explicitly unscored. Attempting to quantify luck mathematically often leads to flawed deterministic models. Instead, the exhibit presents luck qualitatively. For example, the project features a luck directory of nine sourced ordinary-person cases. These cases are grouped into four forms of luck: structural, encounter, event, and variance. Documented instances include the luck of place, timing, a forced door, or a visa draw. By presenting specific, sourced examples of luck, the exhibit normalizes its role in outcomes without turning it into a mathematical variable.

## Editorial Guardrails against Determinism

The project’s editorial guidelines strictly prohibit causal claims about advantages producing success, predicting individual outcomes, or claiming complete capture of a population.

This is reflected in how paths and outcomes are categorized. The exhibit deliberately separates the age-26 milestone used for dataset inclusion from the career-recognition tier used for comparison. The dataset includes a defined T1–T4 editorial outcome ladder, recording observed averages, ranges, overlap, and correlation context. The current distribution includes 653 individuals in T1, 1,254 in T2, 1,498 in T3, and 173 in T4.

To ensure reliability, a reproducible secondary-coding reliability audit was conducted using a blinded 16-record artifact. This audit published weighted tier agreement, dimension-level score agreement, and rubric corrections without changing source-audit status. This methodical approach anchors the exhibit in observable fact rather than subjective ranking.

## The Kinetic Essay and Surface System

Designing a public research exhibit requires an interface that supports the argument rather than distracting from it. The primary action is completing the guided comparison-futility journey. The homepage is built as a continuous paper-and-ink composition featuring a Kinetic Essay: a scroll-driven SVG marble course where three marbles trade the lead as the terrain changes. It relies on prominent essays, a compact mobile race register, and specifically avoids a WebGL dependency on the story surface.

The visual design completed a pass across all 15 product surfaces, replacing ornamental color-coded container borders with a neutral publication system while retaining semantic color for data and state. It incorporates a light, editorial, scannable visualization UI, avoiding the generic gradient-heavy aesthetics of AI landing pages, personality tests, or celebrity fan pages.

## The Architecture of Disclosure

Balancing an initial narrative with deep, accessible evidence requires a thoughtful technical foundation. Look Sideways uses a static Astro and ECharts architecture hosted on Cloudflare Pages to deliver this progressively. The repository is independently operable and enforces a strict lint contract using Ultracite and Biome, maintaining zero findings across 35 applicable source and configuration files.

For readers who want the evidence behind the argument, the site provides multiple layers of disclosure:
- **Person Profiles:** Detail pages for all 3,578 paths, led by the three-factor model, with deeper provenance and a 22-field progressive research detail.
- **The Explore Atlas:** A filterable and searchable evidence atlas with qualitative outcome-reach filtering. It lazy-loads data client-side to maintain performance.
- **Comparison Breakers:** Person-specific static pages replacing traditional resemblance questionnaires. They show conditions, sequence, and luck instead of a resemblance score, and they use evidence gates to explain why resemblance is not destiny.
- **Evidence Ledger:** A public, build-derived ledger whose coverage values are updated directly from the dataset, explicitly separating completeness from verification.
- **Agent and Search Surfaces:** The build derives 6,180 canonical sitemap URLs, matching Markdown mirrors for every canonical URL, `llms.txt`, `/api/ai` with seven concrete surfaces, and a verified `/openapi.json`.

To optimize performance, the chart runtime is split by visualization family. The system registers only the ECharts modules each surface uses and loads them behind a viewport activation. This removes oversized production chunk warnings and improves the weighted lab Largest Contentful Paint (LCP) to 2.13 seconds with zero Cumulative Layout Shift (CLS) and zero Total Blocking Time (TBT).

## Broadening the Definition of Success

Initial iterations of outcome datasets often bias heavily toward extreme outliers. To counter this, Look Sideways includes three qualitative reach bands. This includes 1,670 professionally distinctive paths, providing broader coverage toward the 0.1% range without making a universal percentile claim.

Numeric percentile claims require a field-specific, sourced denominator. Without that, outcome reach stays qualitative. This prevents the exhibit from making unsupported universal claims and maintains its credibility as an evidence-bounded research surface. It is a necessary boundary to avoid generating a predictable, repeatable identity or causal formula.

The project also features a signature survivor-path exhibit showing repeated consequential uncertainty and peak selection. It explicitly demonstrates why a visible surviving streak is not a fair personal benchmark, contextualizing the 64-to-1 thought experiment with a repeated-luck explanation.

## Interactive Models Without Data Extraction

Many modern dashboards rely heavily on extracting user data to compute personalized forecasts. The Look Sideways exhibit takes the exact opposite approach. The site features an input-based Expected Value & ROI Lab with no runtime AI or data transmission.

The worksheet is entirely local. It uses only user-supplied investments, outcomes, probabilities, valuations, and stage classifications. It features visible formulas, a synthetic example, probability reconciliation, downside and break-even context, and local stage allocation. It provides an equal-effort/different-distance exhibit explaining how starting position can change where effort lands without judging effort intensity, merit, or another person's path. Because it keeps user-supplied inputs strictly local, it is explicitly excluded from session replay tools, completely preserving user privacy.

## Independent Operation and Data Integrity

A research exhibit must prioritize data integrity. The dataset relies on 12,686 listed source URLs. The trajectory coverage, recording at least three events per path (including starting point, current position, and milestones), stands at 92.0% (3,291 out of 3,578 paths). Furthermore, 87.6% of the paths feature two or more listed sources, and 71.7% pass the strict comparison/search evidence gate.

Source-integrity normalization is deeply built into the workflow. It deduplicates URLs, derives source counts from published arrays, and blocks malformed or inconsistent source records. The repository uses build-derived dataset validation to ensure unique IDs, scores remain in range, and no key fields are missing. The explicit evidence limits are documented directly within the dataset stats, ensuring that the 838 paths added since the last pass are transparently flagged as unaudited for source reachability.

## Next Action

Internal-link suggestions:
- Link to the Explore atlas to inspect the 3,578 paths.
- Link to the Methodology page for details on the secondary-coding reliability audit.
- Link to the Luck directory to read the nine ordinary-person cases.

Practical Next Action: Before attempting to quantify human outcomes in your own research or design work, isolate the condition factors. Build your dataset to record what was brought, handed, and surrounding, without summing them into a total score. Use Look Sideways’ methodology as a reference for structuring qualitative evidence, ensuring that luck and perseverance are documented explicitly without being mathematically reduced.

---

## Source Notes (Non-Publishable)

**Evidence used from repository files:**
- **3,578 early-breakthrough paths:** Supported by `PROJECT_STATUS.md` and `README.md` (Dataset Stats).
- **Cohort distribution (1,390 founders, 1,079 athletes, 811 creators, 298 researchers):** Supported by `PROJECT_STATUS.md` (Dataset Stats).
- **Three condition factors (what they brought, were handed, surrounded by):** Supported by `PRODUCT.md` and `README.md`.
- **458 documented headwind readings, −1 to 3 scale:** Supported by `PROJECT_STATUS.md` (2026-08-22 changelog entry and Dataset Stats).
- **Nine sourced ordinary-person luck cases (four forms):** Supported by `PROJECT_STATUS.md` (2026-09-12 changelog entry).
- **1,670 professionally distinctive paths:** Supported by `PROJECT_STATUS.md` (2026-08-26 changelog entry).
- **Blinded 16-record sample for secondary coding:** Supported by `PROJECT_STATUS.md` (2026-07-31 changelog entry and Dataset Stats).
- **Tier distribution (T1 653, T2 1,254, T3 1,498, T4 173):** Supported by `PROJECT_STATUS.md` (Dataset Stats).
- **Astro + ECharts architecture & Kinetic Essay:** Supported by `README.md` and `PROJECT_STATUS.md`.
- **Performance metrics (LCP 2.13s, zero CLS/TBT):** Supported by `PROJECT_STATUS.md` (2026-07-24 changelog entry).
- **Data integrity metrics (12,686 source URLs, 92.0% trajectory coverage, 71.7% evidence gate):** Supported by `PROJECT_STATUS.md` (Dataset Stats).
- **Editorial guardrails (no summation, no prediction, no ranking):** Supported by `PRODUCT.md` and `README.md`.
- **Expected Value & ROI Lab:** Supported by `PROJECT_STATUS.md` (2026-08-14 changelog entry).

**Important Limitations:**
- The exhibit makes no causal claims.
- The sample is not a population forecast.
- Numeric percentile claims require a field-specific denominator; otherwise, reach is qualitative.
- 838 paths added since the last pass are unaudited for source reachability (`PROJECT_STATUS.md`).
- Independent content audit is pending (`PROJECT_STATUS.md`).
