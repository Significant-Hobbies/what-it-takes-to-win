# Methodology

## Research question

Which capability and early conditions repeatedly appear among people who reached a material milestone by age 26?

## Unit of analysis

One person and one selected milestone that occurred at or before age 26. The milestone may be commercial, technical, creative, athletic, scientific, or institutional. The dataset does not claim that this was the person's final or most important achievement.

## Selection

The 112-person release is a purposive outlier sample assembled to cover founders, operators, creators, athletes, researchers, and independent engineers. It is not a census, representative sample, or estimate of the base rate of success.

## Two evidence layers

### Biographical layer

Names, milestones, age assignments, early-history summaries, family context, and source URLs are intended to summarize public biographical evidence.

### Annotation layer

Leverage engines and numeric scores are analyst interpretations applied through a common rubric. They are hypotheses about acceleration mechanisms.

## Early-advantage score

- **0:** no clear documentation in reviewed sources
- **1:** meaningful documented advantage
- **2:** unusually strong, scarce, or directly catalytic advantage

Zero is not proof of absence. Biographies systematically under-report wealth, informal tutoring, introductions, family logistics, permission, and social capital.

## Source standard

Version 0.1 retains the sources used in the original exercise, including encyclopedia pages and stronger supporting sources where available. The release is therefore labelled `not_independently_audited`.

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

The dataset is restricted to people who had a notable milestone **by age 26**. This is a deliberate design choice — the project is about early breakthroughs — but it creates a structural bias:

- Late bloomers are underrepresented. Stan Lee published his first comic at 38, Vera Wang designed her first dress at 40, Samuel L. Jackson broke through at 43. None of them appear here.
- The "not yet — but will" bucket on the compare page only includes people who did break through later *within the 0-26 window*. It does not include people who broke through after 26.
- Percentiles and averages are computed against early bloomers, not against all successful people. A visitor at the 30th percentile of this dataset is not at the 30th percentile of all achievers — they may be above average among the broader population of successful people.

This bias is acceptable for the project's purpose (exploring early breakthroughs) but should be kept in mind when interpreting any score or comparison.

## Measurement concerns

- Wikipedia and English-language media create geographic, gender, class, and recency bias.
- Fame and page views are not equivalent to achievement.
- Family advantages are less visible than institutional affiliations.
- Later biographies often rewrite messy paths into coherent narratives.
- Several concepts overlap: an elite institution may supply tools, mentors, peers, credibility, and geography simultaneously.
- `direct_customer_domain_exposure_score` was coded broadly in v0.1 and should be re-audited before causal analysis.

## Personal comparison correction

Sarthak self-reports growing up lower middle class. The optional comparison profile now codes early family financial/platform advantage as 0. Current financial safety is kept separate because it arrived later.

## Appropriate use

- Exploratory pattern analysis
- Hypothesis generation
- Qualitative comparison
- Building a better research protocol

## Inappropriate use

- Ranking human worth or talent
- Predicting individual success
- Claiming causal effects
- Treating inferred family class as verified fact
- Publishing aggregate percentages without the survivor-bias and missing-data warnings
