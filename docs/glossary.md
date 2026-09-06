# Glossary

The project's vocabulary, in the sense the site uses it. Where a term has a
fuller treatment, the entry links there.

## The model

**Condition factors**
The three sources of advantage read on every profile: what the person brought,
what they were handed, and what surrounded them. Each is scored from -1 to 3
and they are never summed. Stored as `personal_endowment_score`,
`inherited_leverage_score`, and `catalytic_ecosystem_score`.

**Brought**
Documented capability, drive, health, or early skill located in the person.
Evidence includes olympiad medals, early coding or publication, and prodigy
labels.

**Handed**
Money, family standing, network, permission, tools, or safety already in place
before the person's own market proof. A -1 records poverty, displacement, or
family instability that worked against the path.

**Surrounded**
Place, era, institutions, mentors, peers, platforms, and timing that made later
moves available.

**Headwind**
A -1 reading on any condition factor. It marks a documented disadvantage rather
than an absence of evidence. 458 profiles record a headwind in what they were
handed.

**Perseverance**
Repeated work, setbacks, recovery, or sustained practice that sources describe.
Shown as path evidence, never as a grit or merit score. A biography that does
not mention it is missing evidence, not documenting its absence.

**Luck**
Documented structural timing, encounters, shocks, and the outcome variance the
archive cannot recover. Kept visible and unscored.

**Sequence**
The order in which conditions, work, and openings arrived on a path. The
journey treats sequence as a reason two similar-looking paths diverge.

**Survivor selection**
The archive contains only people whose breakthrough happened and was
documented. Paths with similar ability and effort that met different
obligations, health, or gatekeepers are not in any biography.

## Outcomes

**Selected milestone**
The single dated achievement that qualifies a person for the archive. It sets
eligibility and is stored with the person's age at the time. It is not claimed
to be their most important achievement.

**Outcome reach / success tier**
An editorial summary of documented career recognition through the data cutoff,
separate from the milestone. Four bands: T1 global icon, T2 field-leading,
T3 domain-recognized, T4 specialist-known. Not calculated from any score.

**Reach bands (public)**
The three qualitative bands readers see: extreme public outlier, field leading,
and professionally distinctive. The last holds 1,671 profiles and is the
project's first step toward broader coverage without a universal percentile.

**Denominator**
The population count a percentile would need. The archive does not have a
field-specific, sourced denominator, so outcome reach stays qualitative.

## Evidence and research

**Biographical layer**
Names, milestones, ages, summaries, family context, and source URLs. Intended
to summarise public biographical evidence.

**Annotation layer**
Leverage engines, archetypes, and numeric scores. Analyst interpretations
applied through a shared rubric. Hypotheses about acceleration mechanisms, not
measurements.

**22-field rubric**
The original detailed starting-advantage and leverage scoring, now secondary
research detail behind the three condition factors. Documented in
`src/data/advantage_taxonomy.csv`.

**Evidence gate**
A profile passes when it has enough sourced evidence to be indexed as a
comparison and search surface. 2,565 of 3,578 profiles pass.

**Discovery, research, and publication gates**
Three versioned, fail-closed verdicts in
`data/research/coverage/gate-registry.json` that govern new admissions. See
[research pipeline](research-pipeline.md).

**Signal**
A dated, typed, age-relative outcome event registered in
`data/research/coverage/signals.json` that can promote a candidate into
research.

**Candidate coverage**
The funnel from discovered candidates through research backlog to published
profiles, reported live at `/coverage/`.

**Source reachability audit**
A check that every cited URL still resolves. Stored per record in
`source_audit_status`. It does not verify that the source supports the claim.

**Independent content audit**
A pending review by people outside the project of whether sources support the
published claims.

**Double coding**
A blinded second annotator re-scoring a sample to measure agreement. Done once
on 16 records; see [quality/RELIABILITY_REPORT.md](../quality/RELIABILITY_REPORT.md).

**Data version**
The release a record shipped in, stored as `data_version`. Lets a cohort such as
the 837 founder-expansion records be audited on its own.

## Product surfaces

**Journey**
The five-chapter homepage essay and its marble course.

**Kinetic Essay**
The visual system selected on 2026-08-23: a continuous paper-and-ink page with
the course drawn into it. Defined in [DESIGN.md](../DESIGN.md).

**Marble course**
The scroll-driven inline SVG on the homepage. Position is a pure function of
scroll progress, branch amplitude is hash-derived, and there is no winner,
timer, or score.

**Atlas**
The `/explore/` page: a filterable, searchable index of every profile.

**Comparison breaker**
A static `/am-i-the-next/[id]/` page that shows a person's conditions,
perseverance, sequence, and luck, and explains why resemblance is not destiny.
It replaced the earlier resemblance questionnaire.

**Evidence room**
The `/insights/` page with archive-wide charts and the progressive research
detail.

**Coverage ledger**
The `/coverage/` page reporting source depth, completeness, confidence, and
audit status from the published dataset.

**ROI Lab**
The `/roi/` worksheet computing expected value and ROI from user-supplied
inputs, locally, with no transmission.

**Interpretation boundary**
The dark field note on a surface that states what the adjacent evidence cannot
support.

**Agent surfaces**
`llms.txt`, `llms-full.txt`, `/api/ai`, `/openapi.json`, Markdown mirrors, and
JSON-LD, all generated at build time.

## Repository terms

**Fleet**
The owner's container of independent project repositories. This repository is
independently operable and needs no sibling checkout.

**Readiness gate**
`pnpm run quality`, the complete check CI runs. See [quality gates](quality-gates.md).

**Dataset stats sync**
`pnpm run sync:stats`, which regenerates the figures quoted in README and
PROJECT_STATUS from the corpus.

**success-by-26**
The legacy Cloudflare Pages project name, kept to avoid a redeploy. The product
is Look Sideways.
