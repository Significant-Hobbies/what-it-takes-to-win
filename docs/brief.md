# Project brief

A five-minute introduction to Look Sideways for someone who has not seen it
before. No code, no build steps. The site itself is at
[paths.significanthobbies.com](https://paths.significanthobbies.com).

## The problem it answers

People read a biography, a launch announcement, or a prize list and turn it into
a judgement about themselves: I am behind, I am not capable, I should have done
this by now. That judgement uses the one thing the story kept, the visible
finish, and throws away almost everything that produced it.

Look Sideways is built for that moment. It guides the reader through why the
comparison cannot become a verdict, and then hands them the evidence so they can
check the argument rather than take it on trust.

## The argument

The homepage is a five-chapter essay drawn as a marble course. Three marbles run
the same track and trade the lead as the terrain changes. The chapters are:

1. Biography starts at the end. Everyone in the archive is here because a
   documented breakthrough already happened, so the sample is selected after
   the outcome. The paths that did not survive are not in any biography.
2. Ask three questions and keep them separate. What did the person bring? What
   were they handed? What surrounded them? These are three sources of
   advantage, and the project never adds them into one score.
3. Effort changes a path but does not make paths equivalent. Perseverance is
   shown only where sources document it, and the same effort lands differently
   on different terrain.
4. Some doors are encountered, not authored. Luck stays visible and unscored.
5. The outcome is not portable. Compare mechanisms for information. Never
   compare identities for a verdict.

## The evidence behind it

The archive holds 3,578 documented early-breakthrough paths, all people born in
1950 or later, across four cohorts: founders and operators, athletes, creators
and artists, and researchers and independent engineers. Every profile links its
sources, records the selected milestone and the person's age at the time, and
carries a career trajectory.

Each profile opens with the three condition factors on a scale from -1 to 3,
where -1 is a documented headwind such as poverty or displacement. About 458
profiles record a headwind in what the person was handed. That figure is
visible instead of being collapsed into zero.

Outcome reach is an editorial band, not a calculation. It describes how far the
documented career travelled, from global icon to specialist-known, and 1,671
profiles sit in the professionally distinctive band. The archive is not only
famous people.

## What the project refuses to do

- It does not claim an advantage causes success. The data shows which
  conditions repeatedly accompany early breakthroughs, not that they produced
  them.
- It does not predict anyone's outcome or rank human worth.
- It does not sum the condition factors, produce a resemblance score, or offer
  a personality-test style result.
- It does not claim complete coverage. Private and poorly indexed outcomes are
  hard to discover, and the live coverage page says so.

## What you can inspect

- The evidence room at `/insights/` shows the three-factor model, the broader
  success band, luck, and divergent paths across the whole archive.
- The atlas at `/explore/` filters and searches every profile.
- Each `/person/` page shows the factors, perseverance and luck evidence, the
  trajectory, and the source ledger.
- The coverage ledger at `/coverage/` reports source depth, trajectory
  completeness, and which audits are complete or pending.
- The methodology at `/methodology/` states what the project can and cannot
  say, including the pending independent content audit.
- Two essays: "Who Filled the King's Jug?" on privilege as prepared access, and
  "Everyone Has Lost Their Marbles" on comparison and bounded agency.

## How it was built

One person built it between July and September 2026 with heavy use of coding
agents for research batches, scoring, and implementation. Research ran as
hundreds of small batches, each producing one JSON record per candidate with a
strict rule: if a dated milestone by the target age could not be sourced, the
person was marked ineligible rather than forced in. Every published figure on
the site is derived at build time from the corpus, so the prose cannot drift
behind the data.

Two research gates are complete: a blinded second coding of 16 records, and a
reachability check of every source URL. Two remain deliberately open because
they need people who did not build the product: first-time comprehension and a
matched comparison study with an unsuccessful control group.

## Where to look next

- [FAQ](faq.md) for the common questions and objections
- [Glossary](glossary.md) for the vocabulary
- [Dataset](dataset.md) for how the data is structured
- The full [methodology](../src/data/methodology.md)
