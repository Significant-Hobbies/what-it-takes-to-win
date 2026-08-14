## ADDED Requirements

### Requirement: Story mode participates in public discovery

The canonical `/` story landing route SHALL be linked from site navigation and
SHALL appear in the sitemap, Markdown mirrors, and machine-readable surface
catalog. The legacy `/story/` route SHALL redirect to `/`.

#### Scenario: Human or agent discovers core routes

- **WHEN** a visitor uses site navigation or an agent reads `/api/ai`,
  `/llms.txt`, or `/sitemap.xml`
- **THEN** `/` is represented as the canonical Story surface with a truthful
  title, summary, and `/index.md` alternate, while `/story/` redirects to it
