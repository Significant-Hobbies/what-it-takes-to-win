# Quality gates

`pnpm run quality` is the release gate. CI runs it on every push and pull
request, and `pnpm run deploy` refuses to publish unless it passes. This page
explains each step and the failure it exists to catch.

## The gate in order

| Step | Command | Catches |
|---|---|---|
| Format | `format:check` | Ultracite formatting drift across source and config |
| Lint | `lint` | Biome rule violations under the Fleet lint contract |
| Check | `check` | A corpus that fails validation, a coverage gate regression, or a type error |
| Tests | `test:coverage` | Model regressions in `src/lib/`, with 100 percent line coverage required |
| Build | `build` | Any page that fails to render, plus stale discovery surfaces |
| Discovery audit | `audit:discovery` | A sitemap, mirror, catalog, or OpenAPI entry that the build did not produce |
| Clarity audit | `audit:clarity` | A surface that breaks the comprehension contract, sums the factors, or drops a required disclosure; also every internal link |
| Tier audit | `audit:tiers` | An empty cohort-tier cell, or a change to the deterministic sample of boundary and representative records that was reviewed by hand |
| Reliability audit | `audit:reliability` | A change to the published double-coding figures without the artifact changing |
| Stats audit | `audit:stats` | README or PROJECT_STATUS figures that disagree with the corpus |
| Unused | `quality:unused` | Dead files, exports, or dependencies, via Knip |
| Complexity | `quality:complexity` | Functions above the recorded complexity baseline |
| Duplication | `quality:duplication` | Copy-pasted blocks, via jscpd |
| Cycles | `quality:cycles` | Import cycles |
| Dependencies | `quality:dependencies` | Critical or unaccepted high-severity advisories from `pnpm audit` |
| Suppressions | `quality:suppressions` | New lint suppressions above the baseline |
| Hygiene | `quality:hygiene` | Trailing whitespace and conflict markers in tracked source |

The code-health steps compare against baselines recorded in
`src/scripts/check-code-health.mjs`. A baseline moves only in a commit that
explains why, such as the complexity baseline moving to 19 on 2026-09-05.

## The two audits that define the product

The clarity audit is a comprehension contract. It renders the built pages and
checks that the one-minute answer is present, that eligibility is separated
from outcome tier, that the condition factors appear side by side and are never
summed, that headwinds are disclosed, that the missing population denominator
is stated, and that no page claims a percentile or a prediction. It also
follows every concrete internal link.

The discovery audit is a contract with search engines and agents. It reads the
catalog the build advertises and confirms that every URL exists in `dist/`,
that every sitemap URL has a Markdown mirror, and that the noindex boundaries
and content types are right. It fails if the catalog promises a page the build
did not make.

## Research audits outside the gate

Two audits are run by hand because they depend on external fetches or a second
annotator, and their results are checked in:

- `audit:sources` fetches unseen source URLs and updates each record's audit
  status. Full results are in `quality/source-audit/`.
- `audit:reliability` recomputes agreement figures from the double-coding
  artifact in `quality/reliability/` and is included in the gate so the
  published numbers cannot drift from the data.

## Design gates

Meaningful visual work follows the Fleet design workflow. Its receipt in
`.fleet/design-review.json` records the selected direction, screenshots at
390, 768, and 1440 pixels, a critique score of 38 out of 40, an audit score of
19 out of 20, and zero unresolved P0 or P1 findings. The landing audit in
`.fleet/evidence/landing-audit/scorecard.json` adds purpose, SEO, agent
discovery, and performance scores, each at 97 or above on 2026-08-29.

## Running parts of the gate

```bash
pnpm run check            # fast: rebuild data, coverage, typecheck
pnpm test                 # model tests only
pnpm run audit:clarity    # needs a completed build in dist/
pnpm run audit:stats      # fails if quoted figures are stale
pnpm run sync:stats       # rewrites them from the corpus
```

## Things the gate does not check

First-time-user comprehension and the matched comparison study are open
research gates that require people outside the project. Independent content
verification of sources is also pending. All three are reported as pending on
`/coverage/` and in [quality/CLARITY_SCORECARD.md](../quality/CLARITY_SCORECARD.md).
