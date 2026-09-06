# Documentation index

Look Sideways is a public research exhibit about why comparing yourself to
another person's visible success fails as a verdict. These pages explain the
project to someone meeting it for the first time, and record how it was built.

Each topic has one home. Where a page overlaps with a product surface or a
top-level file, it points there instead of repeating it.

## Start here

| Page | Read it when |
|---|---|
| [Project brief](brief.md) | You want the whole project in five minutes, no code required |
| [FAQ](faq.md) | You have a specific question about the claims, the data, or the site |
| [Glossary](glossary.md) | A term such as "outcome reach" or "comparison breaker" is unclear |

## How it works

| Page | Covers |
|---|---|
| [Architecture](architecture.md) | Stack, build pipeline, and how a corpus becomes a static site |
| [Public surfaces](surfaces.md) | Every route the site publishes and what each one is for |
| [Dataset](dataset.md) | Files, schema layers, evidence gates, and licence status |
| [Research pipeline](research-pipeline.md) | How a candidate becomes a published profile |
| [Quality gates](quality-gates.md) | What `pnpm run quality` checks and why each check exists |
| [Repository map](repo-map.md) | Folder-by-folder guide, including the large research trees |

## The journey

| Page | Covers |
|---|---|
| [Decision log](decision-log.md) | The choices that shaped the product, with the reasoning at the time |
| [Lessons](lessons.md) | What went wrong, what it cost, and the guard that now prevents it |

## Canonical files outside this folder

- [PRODUCT.md](../PRODUCT.md) states the audience, register, and voice.
- [DESIGN.md](../DESIGN.md) is the visual system, called Kinetic Essay.
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) holds shipped product truth, the
  dated timeline, and the generated dataset statistics.
- [AGENTS.md](../AGENTS.md) sets the operating rules for agents and people.
- [src/data/methodology.md](../src/data/methodology.md) is the full published
  methodology, rendered at `/methodology/`.
- [quality/](../quality/) holds the reliability and source-audit reports.

## Conventions for this folder

Pages stay between roughly 150 and 300 lines. A concept is explained once and
linked from everywhere else. Dates are absolute. Nothing is deleted during a
consolidation; superseded material moves to `docs/archive/`.
