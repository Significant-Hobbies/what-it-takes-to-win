## ADDED Requirements

### Requirement: Search crawlers receive truthful discovery contracts

The production site SHALL serve a parseable `robots.txt`, XML sitemap, and real
`404` response. The sitemap MUST contain canonical indexable HTML URLs only.

#### Scenario: Crawler requests discovery files

- **WHEN** a crawler requests `/robots.txt` and `/sitemap.xml`
- **THEN** each response has the correct non-HTML content and `robots.txt`
  references the canonical sitemap

#### Scenario: Crawler requests an unknown route

- **WHEN** a crawler requests a route that was not generated
- **THEN** Cloudflare Pages returns the custom error document with HTTP `404`

### Requirement: Agents can read public truth without JavaScript

The production site SHALL serve real text at `/llms.txt`, JSON at `/api/ai`,
and a Markdown alternate for every canonical URL listed in the sitemap.

#### Scenario: Agent discovers the site

- **WHEN** an agent requests `/llms.txt`, `/api/ai`, or `/index.md`
- **THEN** the response is truthful text, JSON, or Markdown rather than an HTML
  fallback shell

#### Scenario: Agent follows a sitemap URL

- **WHEN** an agent converts a canonical sitemap URL to its documented Markdown
  alternate
- **THEN** the generated Markdown contains the corresponding route's source
  truth and the response is excluded from classic search indexing

### Requirement: Structured metadata describes the research surface

The homepage SHALL emit a valid `@graph` containing publisher and website or
dataset nodes, and person pages SHALL emit a WebPage whose main entity is the
documented person.

#### Scenario: Structured-data consumer reads a core page

- **WHEN** a consumer parses homepage or person-page JSON-LD
- **THEN** it receives valid Schema.org objects whose URLs and claims match the
  visible page

### Requirement: Comparison indexing preserves evidence quality

Person-specific comparison pages SHALL remain indexable only when the existing
source-count, evidence-confidence, milestone, and trajectory gates pass.

#### Scenario: Weak comparison record is built

- **WHEN** a comparison record fails any evidence gate
- **THEN** its HTML carries `noindex,follow` and it is absent from the sitemap

### Requirement: Initial rendering does not wait on non-critical charts

The homepage SHALL render its primary text without remote font CSS or eager
ECharts execution, while preserving the interactive charts after page load.

#### Scenario: Visitor loads the homepage on a constrained mobile profile

- **WHEN** the browser renders the initial viewport
- **THEN** the headline and explanatory text render before visualization code
  is requested or initialized

#### Scenario: Visitor reaches the charts

- **WHEN** the page has loaded and chart initialization completes
- **THEN** all existing charts and click-through interactions remain available
