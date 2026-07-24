# Methodology

## Research question

Which capability and early conditions repeatedly appear among people who reached a material milestone early in their careers?

## Unit of analysis

One person and one selected milestone that occurred at or before age 26. The milestone may be commercial, technical, creative, athletic, scientific, or institutional. The dataset does not claim that this was the person's final or most important achievement.

## Selection

The 2,585-person dataset is a purposive outlier sample assembled to cover founders, operators, creators, athletes, researchers, and independent engineers. It is not a census, representative sample, or estimate of the base rate of success.

## Explanatory model

The product organizes each record as an observed four-stage path:

1. **Starting conditions:** inherited or encountered access, institutions, geography, tools, mentors, peers, ability, and constraints.
2. **Built or converted leverage:** reps, scarce skill, distribution, networks, teams, timing, concentration, runway, and domain proximity that supplied multiplying capacity later in the path.
3. **Compounding trajectory:** the documented sequence of work, feedback, relationships, and transitions around the early milestone.
4. **Observed career standing:** the documented career-recognition band through the data cutoff.

This is a descriptive model, not a causal recipe. The dataset can show which
conditions and capabilities repeatedly accompany early breakthroughs. It cannot
establish that a condition made the outcome happen.

## Outcome tiers

The selected milestone determines eligibility for this early-breakthrough dataset. `success_tier` is a separate editorial summary of documented career recognition through the data cutoff:

- **T1 — Global icon:** legendary or globally iconic career standing; a durable reference point well beyond the immediate domain.
- **T2 — Field-leading:** a dominant figure at the top of a field through major prizes, championships, commercial impact, or sustained elite recognition.
- **T3 — Domain-recognized:** notable and widely recognized among people who follow the domain.
- **T4 — Specialist-known:** notable, but recognition remains primarily within a niche or among specialists.

The tier is not calculated from advantage or leverage scores, and it should not be read as the significance of only the selected early milestone. It does not measure human worth or predict future potential. The current assignments remain interpretive annotations pending an independent audit.

## Outcome distribution context

The product translates each tier into a count, share, and cumulative rank band
inside this 2,585-person dataset. It also shows how many lower-tier profiles are
present and the lower-tier-per-member ratio for the selected tier. These values
are rebuilt from the current dataset rather than stored as annotations.

The result is a **tier band**, not an exact individual percentile. For example,
T1 occupies ranks 1 through 574 from the top, but the tier does not order Bill
Gates against the other T1 profiles. The denominator is also highly selected:
every record already cleared the early-breakthrough inclusion threshold.
Population prevalence, ordinary attempts, near-misses, and people who never
reached a documented milestone are absent. Tier shares and lower-tier ratios
therefore are not success probabilities or estimates of how many people failed.

Career outcomes in many fields can be heavy-tailed or power-law-like: a small
minority can account for a disproportionate share of recognition, reach,
wealth, citations, or attention, and repeated compounding can widen outcome
gaps. This is an interpretive model, not a fitted power law from the tier counts.
The four editorial tiers compress continuous careers into broad bands; the
project does not estimate a Pareto exponent or claim the tier distribution is a
statistical power law.

In version 0.3, average starting advantage and built or converted leverage rise
from T4 to T1, but the score ranges overlap heavily. The correlation between
starting-advantage total and a better tier is approximately 0.32; leverage is
also approximately 0.32. These are descriptive associations, not predictive
thresholds.

## Two evidence layers

### Biographical layer

Names, milestones, age assignments, early-history summaries, family context, and source URLs are intended to summarize public biographical evidence.

### Annotation layer

Leverage engines and numeric scores are analyst interpretations applied through a common rubric. They are hypotheses about acceleration mechanisms.

## Starting-advantage score (0–24)

This score asks: **What access or conditions were documented near the beginning
of the path?** It sums twelve dimensions scored from 0 to 2:

- **0:** no clear documentation in reviewed sources
- **1:** meaningful documented advantage
- **2:** unusually strong, scarce, or directly catalytic advantage

Zero is not proof of absence. Biographies systematically under-report wealth, informal tutoring, introductions, family logistics, permission, and social capital.

## Built or converted leverage score (0–25)

This score asks: **What multiplying capacity was documented later in the path?**
It sums ten dimensions covering early serious reps, practice volume, scarce
skill, distribution, network, team, structural timing, concentration, capital
safety, and domain proximity.

The score records the presence of leverage, not its provenance. A lever may be:

- **Self-built:** accumulated directly through practice, skill, focus, or distribution.
- **Advantage-enabled:** easier to develop because of a starting resource.
- **Earned access:** unlocked by earlier work, selection, or proof.
- **External:** supplied by timing, a platform change, or a structural wave.
- **Mixed:** produced by several origins that cannot be cleanly separated.

The product now adds a **person-level provenance inference** for every non-zero
lever. It links each leverage field to relevant documented starting conditions,
then considers limited biographical language indicating repeated self-directed
work or earned access. Structural timing is classified as external. When
several signals coexist, the origin is mixed. When the record cannot distinguish
origins, the output is unresolved.

Each inference displays its evidence signals, rationale, and low or medium
confidence. Missing evidence never becomes “self-built.” This is a transparent,
deterministic reading of the current annotations—not a measurement of merit, a
self-made percentage, or a claim about private effort.

## Person-specific comparison

Every published profile has an `/am-i-the-next/<person>/` questionnaire. It uses
up to four of that person’s strongest documented starting conditions and up to
four of their strongest leverage fields. The visitor reports the presence of
those same ingredients and selects an origin for each reported lever.

The result has three descriptive outputs:

- **Starting overlap:** normalized closeness across the selected starting conditions.
- **Leverage overlap:** normalized closeness across the selected capabilities.
- **Surface resemblance:** the average of those two overlaps.

The result then identifies where comparison breaks: ingredient composition,
leverage provenance, sequence, and luck. It does not output the probability of
success, a predicted tier, a ceiling, or a claim that the visitor is “the next”
person. Direct comparison is an acquisition and reflection device, not the
product’s conclusion.

## Luck and outcome variance

Luck is treated as cross-cutting rather than as a residual score:

- **Structural luck:** birthplace, era, family, geography, institutions, and proximity to a frontier.
- **Encounter luck:** meeting a collaborator, mentor, coach, investor, selector, or first customer.
- **Event luck:** an algorithm boost, market shock, competitor failure, injury avoided, or unexpected opening.
- **Outcome variance:** similar visible inputs can still yield different outcomes for reasons the record cannot recover.

The dataset has no failed control group and cannot reconstruct counterfactuals.
A numeric luck score would therefore imply false precision. Luck remains
explicit in the explanatory model, comparison result, Insights page, and person
profiles, but unscored.

## Coin-toss thought experiment

The homepage includes a 64-to-1 thought experiment: 64 plausible starts narrow
to one visible peak after six hypothetical independent 50/50 gates. This is a
teaching device, not an observed attrition rate, career probability, fitted
model, or estimate of how many similar people failed.

Real careers are not fair independent coins. Starting advantage can change
which opportunities are available and their initial odds. Built or converted
leverage can improve later odds. Runway can create more attempts. Timing,
health, encounters, gatekeepers, shocks, and outcome variance can still redirect
an individual path. The illustration exists to make repeated consequential
uncertainty and survivor selection intuitive without converting luck into a
score.

## Programmatic page evidence gate

Person-specific pages are generated for all published records so internal
navigation remains complete. A page is indexable only when the record has at
least two listed sources, non-low leverage evidence confidence, a non-empty
milestone, and a trajectory. Records below that threshold receive `noindex`.
Pages expose the person-specific evidence before the questionnaire and never
claim affiliation or endorsement.

## Source standard

Version 0.3 retains the sources used in the original exercise, including encyclopedia pages and stronger supporting sources where available. The release is therefore labelled `not_independently_audited`.

For a stronger v1.0:

- Require two independent sources for the milestone date.
- Prefer primary or official evidence where practical.
- Require two strong sources for sensitive claims about family wealth, class, or parental influence.
- Record retrieval date and the exact evidence span.
- Mark disagreement rather than forcing a score.
- Use `unknown` in a redesigned schema where missingness must be separated from a confirmed zero.

## Survivor bias

The sample begins with successful people. It cannot estimate whether an advantage causes success, how many similarly advantaged people failed, or how frequently people without the coded advantages succeed.

## Early-bloomer bias

The dataset is restricted to people who had a notable milestone **early in their careers** (the study uses age 26 as its cutoff). This is a deliberate design choice — the project is about early breakthroughs — but it creates a structural bias:

- Late bloomers are underrepresented. Stan Lee published his first comic at 38, Vera Wang designed her first dress at 40, Samuel L. Jackson broke through at 43. None of them appear here.
- Person-specific resemblance only compares visible ingredients from early-breakthrough profiles. It cannot represent late-bloomer routes that fall outside the study window.

This bias is acceptable for the project's purpose (exploring early breakthroughs) but should be kept in mind when interpreting any score or comparison.

## Measurement concerns

- Wikipedia and English-language media create geographic, gender, class, and recency bias.
- Fame and page views are not equivalent to achievement.
- Family advantages are less visible than institutional affiliations.
- Later biographies often rewrite messy paths into coherent narratives.
- Several concepts overlap: an elite institution may supply tools, mentors, peers, credibility, and geography simultaneously.
- `direct_customer_domain_exposure_score` was coded broadly in v0.1 and should be re-audited before causal analysis.

## Appropriate use

- Exploratory pattern analysis
- Hypothesis generation
- Qualitative, person-specific path comparison
- Diagnosing buildable leverage gaps
- Building a better research protocol

## Inappropriate use

- Ranking human worth or talent
- Predicting individual success
- Claiming that resemblance makes someone “the next” named person
- Claiming causal effects
- Treating inferred family class as verified fact
- Publishing aggregate percentages without the survivor-bias and missing-data warnings
