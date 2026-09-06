# Decision log

The choices that shaped the product, in date order, with the reasoning at the
time. Each entry says what was decided, why, and what it replaced. The dated
timeline of shipped work is in [PROJECT_STATUS.md](../PROJECT_STATUS.md); this
page only records the forks.

## 2026-07-21: Static Astro site, no backend

The product is an explanatory exhibit over a fixed corpus. A static build makes
every figure derivable at build time, removes accounts and databases from
scope, and lets Cloudflare Pages serve thousands of pages for free. The
trade-off is that the explore atlas fetches a 19 MB dataset client-side; that
was accepted and later mitigated with lazy loading.

## 2026-07-22: Remove inline dataset embedding

Early builds embedded the corpus in every page, producing a 25 GB `dist/`.
Moving the data behind client fetches brought the output to 64 MB. This is
the reason `people.json` and `search-index.json` live in `public/data/`.

## 2026-07-22: Rename from Trajectory to What It Takes to Win

The first working name described the data structure rather than the question.
The second described the question but promised a recipe, which later became a
problem.

## 2026-07-23: Separate starting advantage from built leverage

An early rubric mixed what a person started with and what they built. The two
were split into separate score families with separate visual treatment, and the
methodology added an explicit provenance boundary: self-built, advantage
enabled, earned, external, or mixed. Leverage presence does not establish its
origin.

## 2026-07-23: Replace nearest-tier comparison with person-specific pages

A generic "which tier are you closest to" result invited exactly the ranking
the project argues against. It was replaced with per-person questionnaires that
showed provenance, sequence, luck, and counterexamples for one documented path.

## 2026-07-24: Separate the age milestone from the outcome tier

A review found that tiers encoded documented career recognition while the
selected milestone controlled eligibility, and product copy had blurred them.
Copy, taxonomy, and methodology were corrected to match the original annotation
rubric rather than re-tiering records without a deeper source audit.

## 2026-07-29: GitHub Issues as the only work queue

Local OpenSpec files and a PROJECT_STATUS backlog had started to duplicate each
other. Specs, proposals, and tasks moved into GitHub Issues, and
PROJECT_STATUS was limited to current and shipped truth. The local OpenSpec
directory was removed on 2026-08-20.

## 2026-07-30: Make the repository independently operable

The release gate previously depended on scripts in a sibling Fleet checkout.
The gate was made standalone so anyone can clone, build, and verify without the
owner's workspace.

## 2026-08-02: Migrate from npm to pnpm

Adopted for lockfile determinism and the Fleet standard. The
`packageManager` field was added after CI failed to find pnpm.

## 2026-08-09: Adopt the Ultracite lint contract

The Fleet-wide Biome configuration was applied and enforced in the readiness
gate. The research corpus and audit data were excluded from formatting so the
CRLF CSV output of the pipeline stayed untouched.

## 2026-08-14: Ship the ROI Lab as local-only

An expected-value worksheet needed user-supplied numbers about a person's own
situation. The decision was to run all arithmetic in the browser, transmit
nothing, and later exclude the page from session replay.

## 2026-08-14 to 2026-08-23: Choose the Kinetic Essay direction

Three homepage directions were probed: a cinematic 3D marble theatre, a
chapter-led counterfactual broadcast, and an annotated research essay with the
course drawn into the page. The essay was selected because the argument and the
demonstration share one plane and there is no WebGL dependency. The earlier dark
dashboard and Field Atlas compositions became anti-references. Recorded in
[DESIGN.md](../DESIGN.md) and `.fleet/design-review.json`.

## 2026-08-22: Rename to Look Sideways

The name What It Takes to Win promised a recipe, which is the premise the
project dismantles. Look Sideways names the behaviour the site argues for: look
sideways for information, never for a verdict. The repository and the Pages
project kept their names to avoid churn.

## 2026-08-22: Correct the false audit-completion claim

The coverage page said the source audit was complete when 837 records had been
published after the last pass. The claim was replaced with derived counts, and
the release verdict and gate state were made data-driven so the page cannot
assert something the corpus does not support.

## 2026-08-22: Generate quoted figures from the corpus

README and PROJECT_STATUS advertised 2,770 paths at 100 percent trajectory
coverage while the dataset held 3,577 at 92 percent. A sync script now writes
the blocks and a check in the quality gate fails when they are stale.

## 2026-08-22: Surface the three condition factors, never summed

The decomposition existed on every record but had never shipped. It became the
primary read on every profile, side by side, with the scale corrected to -1 to
3 so 458 documented headwinds became visible. No summing and headwind
disclosure were added to the clarity contract.

## 2026-08-26: Refocus the product on comparison futility

The journey became the front door. The three factors became the public model
across every primary surface. Perseverance and unscored luck were added as path
evidence. The 22-field and four-stage models were demoted to progressive
research detail. Resemblance questionnaires were replaced with static
comparison breakers. The professionally distinctive band of 1,671 profiles was
surfaced so the archive stopped reading as a list of icons.

## 2026-08-26: Fail-closed coverage gates for new admissions

Researcher-written eligibility was no longer sufficient. Three versioned
verdicts, a gold set, and a candidate ledger were introduced so the funnel from
discovered to published is reproducible and the thresholds are labelled
provisional until independently calibrated.

## 2026-08-31: Disclose the analytics boundary

A dedicated Clarity project was wired through the shared layout, the PostHog
and Clarity boundary was disclosed in the footer, and the ROI worksheet was
excluded from replay.

## Standing decisions

- The three condition factors are never summed anywhere in the product.
- No percentile claim without a field-specific, sourced denominator.
- Pending evidence is marked with a dash pattern and written status, never a
  completion badge.
- Deploys are manual, from a clean `main`, after the full gate.
- Release terms are undecided; the repository grants no licence until they are.
