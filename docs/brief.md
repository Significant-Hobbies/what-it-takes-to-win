# Project brief

A five-minute introduction to Paths for someone who has not seen it
before. No code, no build steps. The site itself is at
[paths.significanthobbies.com](https://paths.significanthobbies.com).

## The problem it answers

People read a biography, a launch announcement, or a prize list and turn it into
a judgement about themselves: I am behind, I am not capable, I should have done
this by now. That judgement uses the one thing the story kept, the visible
finish, and throws away almost everything that produced it.

Paths is built for that moment. It guides the reader through why the
comparison cannot become a verdict, and then hands them the evidence so they can
check the argument rather than take it on trust.

## The argument

The homepage opens with “Same age. Different starting lines.” It moves from
Bill Gates' early access to computing to a metaphor about prepared support,
three short life histories, and thirteen turning-point stories. A small random
draw illustrates why good attempts can still have different outcomes.

The argument is that work, support, constraints and chance interact. A visible
finish does not reveal everything that preceded it. The site invites readers
to learn from mechanisms without treating someone else's life as a verdict on
their own. Its examples and toy experiment are not forecasts or causal proof.

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
documented career travelled, from global icon to specialist-known, and the
professionally distinctive band includes people beyond global icons. The archive is not only
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
person was marked ineligible rather than forced in. Dataset totals on the main research surfaces are derived at build time.
Editorial examples and documentation still need review when the project changes.

A blinded second coding covered 16 records. Source reachability has been
reviewed for 2,740 of 3,578 profiles; 838 remain outside that pass. Reachability
does not establish that a source supports a claim. Independent content review,
external comprehension testing and a matched comparison with unsuccessful
paths remain open. Consult the [live coverage ledger](https://paths.significanthobbies.com/coverage/)
for current status.

## Podcast conversations

Sarthak Agrawal, the creator of Paths, is preparing a podcast pilot about the
work, people, constraints and unexpected turns behind a life. Guests are
invited to challenge the project's interpretation and explain what public
biographies miss. A polished success story is not required.

An initial reply only starts a conversation. Length, audio or video format,
recording permission and publication terms will be agreed before recording.
Guests can skip questions and review the quotes and claims drawn from their
conversation before publication. Their accounts will remain attributed
first-person testimony, separate from independently sourced biography and
interpretive scores.

If you received an invitation, reply to its sender to discuss taking part.
See [the participant introduction](https://paths.significanthobbies.com/about/#conversations).

## Where to look next

- [FAQ](faq.md) for the common questions and objections
- [Glossary](glossary.md) for the vocabulary
- [Dataset](dataset.md) for how the data is structured
- The full [methodology](../src/data/methodology.md)
