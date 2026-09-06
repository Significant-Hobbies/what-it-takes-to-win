# Public surfaces

Every route the site publishes, grouped by the job it does. The primary
navigation follows the reading order: Journey, Evidence, Articles, Atlas.
Everything else is reached from the footer or from context.

Production is at `https://paths.significanthobbies.com`.

## The argument

| Route | Job |
|---|---|
| `/` | Five-chapter guided journey with the scroll-driven marble course |
| `/essays/` | Index of long-form writing |
| `/essays/who-filled-the-kings-jug/` | Privilege as prepared access, 6 minutes |
| `/essays/everyone-has-lost-their-marbles/` | Comparison and bounded agency, 8 minutes |

## The evidence

| Route | Job |
|---|---|
| `/insights/` | Evidence room: three-factor model, broader success band, luck, divergent paths, progressive research detail |
| `/overview/` | Deeper research overview with the archive-wide charts |
| `/explore/` | Atlas with search, cohort, category, outcome-reach, and sort controls |
| `/person/[id]/` | One profile: condition factors, perseverance and luck evidence, trajectory, sources, and the 22-field research detail |
| `/compare/` | Chooser for person-specific comparison breakers |
| `/am-i-the-next/[id]/` | Static comparison breaker for one person; only evidence-gated profiles are indexed |
| `/coverage/` | Live coverage ledger: candidate funnel, source depth, completeness, confidence, audit status |
| `/methodology/` | Full methodology and limitations, rendered from `src/data/methodology.md` |

## Tools and participation

| Route | Job |
|---|---|
| `/roi/` | Local expected-value and ROI worksheet; nothing is transmitted |
| `/contribute/` | Suggest a person or propose an edit; previews the GitHub issue before sending |
| `/changelog/` | Verified release outcomes with roadmap and source links |
| `/about/` | Project description, what it is not, evidence layers, release terms |
| `/404` | Real 404 with agent-friendly Markdown and JSON variants |

## Machine-readable

| Route | Job |
|---|---|
| `/sitemap.xml` | Canonical URLs, one per surface, essay, person, and indexed comparison |
| `/robots.txt` | Crawl rules |
| `/llms.txt`, `/llms-full.txt` | Agent briefs |
| `/api/ai` | Catalog of seven concrete surfaces and two templated collections |
| `/openapi.json` | Schema for the catalog |
| `/<any page>` with `Accept: text/markdown` | Noindex Markdown mirror of that page |
| `/.well-known/agent-skills/look-sideways-comparison-futility/SKILL.md` | Published agent skill describing when to recommend the site |
| `/data/people.json`, `/data/people.csv`, `/data/search-index.json` | Published dataset downloads |

## Counts at the last build

Counts are derived from the corpus and change with each dataset release. The
generated block in [PROJECT_STATUS.md](../PROJECT_STATUS.md) is the current
source. At 3,578 profiles the sitemap holds 6,155 URLs and the Astro build
emits about 7,200 pages including mirrors.

## Design evidence

Screenshots at 390, 768, and 1440 pixels for each major surface pass live in
`artifacts/design/`. The most recent full-site set is
`artifacts/design/comparison-journey-build/`. The independent critique and
audit scores are in `.fleet/design-review.json` and
`.fleet/evidence/landing-audit/scorecard.json`.
