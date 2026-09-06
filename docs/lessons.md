# Lessons

What went wrong, what it cost, and the guard that now prevents it. Each lesson
names the incident so a reader can find it in the git history.

## Prose drifts behind data unless a script owns it

The README and PROJECT_STATUS quoted 2,770 paths and 100 percent trajectory
coverage while the corpus held 3,577 at 92 percent. The site never lied,
because its denominators were build-derived, but the documents did. The Open
Graph image had the same problem, hand-exported with "2,700+ paths" long after
the count moved.

Guard: `sync_dataset_stats.mjs` writes the quoted blocks and its `--check`
form runs in the quality gate. The share card no longer carries a count, and
`render_og_image.mjs` rasterises it from the SVG in one command. The card
itself went stale a second way, keeping the retired dark dashboard look and the
four-stage model for two weeks after the Kinetic Essay redesign, and was redrawn
on 2026-09-06.

## A completion claim needs a derived denominator

The coverage page said the source audit was complete. It had been complete for
2,740 records; 837 founder-expansion records had shipped since. The page was
asserting rather than computing.

Guard: the release verdict, gate count, and rung state on `/coverage/` are
derived from `source_audit_status` on each record. Pending records are counted
and named.

## Stamp provenance at merge time

The founder expansion merged 837 records carrying the oldest `data_version`
label instead of the release they shipped in. The cohort could not be audited
on its own until a script restored the stamp.

Guard: `stamp_data_version.py` exists, and the research instructions require
provenance on every record. The publication gate checks required fields.

## Zero is not absence

Early scoring collapsed documented headwinds into zero because the scale
started at zero. 458 records of poverty, displacement, or family instability
became invisible.

Guard: the condition-factor scale runs -1 to 3, headwind counts are reported
in the generated stats, and the clarity audit requires the headwind disclosure
on the surfaces that show the factors.

## A total invites a ranking

Any place that showed a combined advantage score was read as a leaderboard, no
matter the caveat beside it.

Guard: the three factors are never summed anywhere in the product, the clarity
audit checks for it, and the four-stage and 22-field models moved behind
progressive disclosure.

## Naming carries a promise

"What It Takes to Win" read as a recipe. Visitors expected a formula and the
site had to argue against its own title.

Guard: the product is Look Sideways. The repository and Pages project kept the
old names to avoid churn, and AGENTS.md explains the mismatch.

## Rubrics that cannot be reproduced should be demoted

The blinded second coding agreed exactly on only 34 percent of leverage
decisions, and every net leverage difference was upward. The rubric was too
interpretive to present as a primary read.

Guard: leverage scores are secondary research detail. The public model uses the
three condition factors, whose agreement was 64 percent exact and 97 percent
within one point.

## Do not embed the corpus in every page

The first build wrote the full dataset into each of thousands of pages and
produced a 25 GB output directory.

Guard: pages read the corpus at build time only. The client fetches
`public/data/people.json` and a slim search index on demand.

## Charts should not block the first paint

Loading ECharts eagerly put lab LCP at 4.1 seconds. Viewport-activated loading
and per-family module registration brought it to 2.1 seconds with zero layout
shift, and later to about 1 second on mid-range mobile.

Guard: the chart runtime is split by visualization family and initialises only
when a chart approaches the viewport.

## Research batches must be allowed to say no

Forcing a milestone for every candidate produced records that later failed
verification. The 427 thin-evidence records needed a separate pass.

Guard: the research instructions put eligibility first, require two sources for
the milestone date, and demand a row for ineligible people so the decision is
recorded. The coverage gates fail closed.

## The whitespace check and CRLF data do not mix

`git diff --check` counted every CR in the CSV corpus as trailing whitespace,
so any dataset edit failed the hygiene step even when clean.

Guard: `.gitattributes` exempts the CSV files from whitespace checking, with the
reason written beside the rule.

## `npx biome` is the wrong package

The bare `biome` name on npm is an unrelated tool that exits zero without
checking anything. In a repository without installed dependencies it silently
passes while CI fails.

Guard: run `pnpm exec biome` after install, or pin `@biomejs/biome@<version>`.
Recorded in the Fleet root instructions.

## Fleet coupling breaks standalone clones

The release gate once called scripts in a sibling checkout, so the repository
could not be verified on its own.

Guard: the gate is fully local, and AGENTS.md states that no sibling checkout
is required.

## Some gates cannot be closed by the builder

First-time comprehension, emotional resonance, and a matched comparison study
cannot be inferred from agent or automated review. Pretending otherwise would
be the same failure as the audit-completion claim.

Guard: the three are published as pending gates on `/coverage/` with the
protocol for closing them written in `quality/CLARITY_SCORECARD.md`.
