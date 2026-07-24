## Context

The dataset already stores two independent score families: twelve documented
early-advantage fields (0–24) and ten capability-leverage fields (0–25). The
site calculates them separately, but similar cards, labels, and nearby totals
make them appear interchangeable. The data records the presence of leverage,
not a reliable per-dimension account of whether that leverage was inherited,
self-built, earned, externally supplied, or mixed.

The implementation must remain static, preserve the current score schema, avoid
causal claims, and work with incomplete biographical evidence.

## Goals / Non-Goals

**Goals:**

- Make the two score families visually and semantically distinguishable at a
  glance.
- Explain that leverage can be built, converted from advantage, earned through
  prior work, supplied by external timing, or mixed.
- Infer per-person leverage provenance only where current score and biographical
  signals support an evidence-bounded explanation.
- Use named-person comparison as an acquisition hook, then make its
  non-predictive boundary the primary result.
- Show luck and variance as cross-cutting unknowns rather than another score.
- Generate useful, unique static pages with conservative indexing rules.
- Preserve the ordered relationship between starting conditions, leverage,
  trajectory, and observed career standing.
- Keep overview, named-person, and individual-path language consistent.

**Non-Goals:**

- Re-score or re-annotate the 2,585 profiles.
- Claim individual capability provenance as biographical fact.
- Split the leverage total into speculative inherited and self-built subtotals.
- Assign a numeric luck score or probability of becoming another person.
- Change the tier taxonomy or calculate tiers from either score.
- Register domains or deploy the site.

## Decisions

### Use two named visual systems

Starting advantages will use a warm amber treatment and the plain-language
definition “access or conditions present near the start.” Built or converted
leverage will use the existing cool cyan/violet treatment and the definition
“multiplying capacity later present in the path.” Totals will always retain
their denominators (`/24` and `/25`).

A single shared color was rejected because it reproduces the present ambiguity.
Renaming leverage to “self-built capability” was rejected because some leverage
clearly depends on prior access, institutional selection, collaborators, or
timing.

### Describe provenance categories without assigning unsupported labels

The interface will explain six origin states—self-built, advantage-enabled,
earned access, external, mixed, and unresolved. A deterministic helper may
infer a best-supported state from mapped early-advantage signals and the lever’s
nature, but every output will include supporting signals and low/medium
confidence. Absence of a mapped advantage will resolve to “unresolved,” not
“self-built.”

Automatically deriving provenance from field names was rejected because, for
example, a network or financial runway can be inherited, earned, or both.

### Use comparison as the hook, not the conclusion

Each `/am-i-the-next/<person>/` page will contain a short questionnaire selected
from that person’s strongest documented starting advantages and leverage
dimensions. The output will calculate transparent surface overlap, then
decompose the differences in composition, origin, timing, trajectory, and
unknown luck. It will never output a probability or predicted tier.

The generic 22-question nearest-tier experience will be replaced because it
makes benchmarking the product payoff. Named-person pages are both a clearer
search intent and a better vehicle for showing why the comparison breaks.

### Treat luck as a cross-cutting boundary

Luck will be presented in four forms: structural luck, encounter luck, event
luck, and outcome variance. It spans the arrows between stages. No numeric luck
score will be calculated because the successful-only dataset cannot identify
the counterfactual probability of an event or outcome.

### Generate one useful URL hierarchy

Use one public brand and `/am-i-the-next/<person>/` routes. Do not create one
domain per person. A page is indexable only when it has at least two sources,
non-low leverage evidence confidence, a documented milestone, and a trajectory;
other generated pages remain accessible but carry `noindex`.

Every indexable page will have a unique title, description, person-specific
evidence, questionnaire, result logic, source links, breadcrumb, and
self-canonical URL once a production site origin is configured.

### Reuse the four-stage model

The current sequence remains:

1. Starting conditions and advantages.
2. Building and conversion into capability leverage.
3. Compounding trajectory.
4. Observed career standing.

This is a terminology and presentation correction, not a new predictive model.

### Centralize labels and explanatory copy

Shared constants in the outcome-model module will own score-family labels,
definitions, maxima, and provenance guidance. Pages may choose compact or
expanded presentation, but must consume the shared terms to limit drift.

## Risks / Trade-offs

- **“Built or converted” is longer than “leverage”** → Use a short technical
  subtitle where space is constrained and reserve the full definition for
  nearby help text.
- **Distinct colors may imply causal sequence** → Pair colors with explicit
  labels and repeat that the dataset shows documented association, not causal
  conversion.
- **Visitors may still assume individual provenance** → State that the current
  dataset measures presence, not origin, beside the provenance explanation.
- **Existing inline Compare markup may drift** → Move only the shared wording
  into shared helpers, replace the generic result surface, and add
  clarity-audit contracts for rendered output.
- **Programmatic pages may look like scaled search content** → Index only
  evidence-qualified profiles and require useful person-specific analysis above
  the questionnaire.
- **Celebrity-name URLs may imply endorsement** → Use a generic domain, plain
  informational language, no likeness assets, and an explicit no-affiliation
  statement.
- **Provenance inference may appear factual** → Show “best-supported origin,”
  evidence signals, confidence, and an unresolved state.

## Migration Plan

1. Keep the shared score-family presentation metadata already implemented.
2. Add provenance, luck, counterexample, indexability, and questionnaire helpers.
3. Add named-person routes and replace the generic Compare-first funnel.
4. Update overview, Insights, person, Explore, methodology, audits, and status.
5. Run type checking, static build, audits, and desktop/mobile visual checks.

Rollback is a normal source revert; there is no data or runtime migration.

## Open Questions

The public domain remains an owner decision. `amithenext.com` and
`notthenext.com` were likely available during the 2026-07-23 check, but
availability must be verified at a registrar before purchase.
