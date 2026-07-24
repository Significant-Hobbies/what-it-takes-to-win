# Proposal: Complete the research exhibit

## Why

The public product already explains advantage, leverage, trajectory, luck,
survivor selection, and comparison redundancy. Its remaining product-controlled
gaps are presentation and trust:

- the signature survivor-path idea begins below the fold instead of being
  demonstrated in the hero;
- evidence coverage is numerically strong but buried in methodology;
- repeated summary statistics make the homepage longer without adding meaning;
- visitors cannot quickly distinguish record completeness from independent
  verification.

The next release should feel like one coherent editorial research exhibit and
make its evidence boundaries as inspectable as its claims.

## What changes

- Recompose the homepage hero around a visible path/branch demonstration and one
  primary action.
- Add a first-class `/coverage/` surface generated from the published dataset,
  covering source depth, trajectory completeness, confidence, cohort balance,
  indexability, and unresolved audit boundaries.
- Replace repeated homepage statistics with a compact evidence strip linking to
  the coverage surface.
- Refine shared spacing, typography, section framing, navigation, and footer
  treatment without adding a visual dependency or changing the core identity.
- Extend clarity and discovery audits so the coverage claims and route cannot
  silently disappear.

## Scope

### In

- Homepage, shared layout, global styling, coverage route, audits, methodology
  links, OpenSpec, and product status.
- Static build-time calculations derived from `src/data/people.json`.
- Desktop and mobile visual verification of primary routes.

### Out

- New people or scoring dimensions.
- Re-tiering or changing annotations.
- Claiming independent source verification or real-user emotional validation.
- Analytics, accounts, backend storage, or new production dependencies.

## Shipping boundary

This release can make every product-controlled quality gate pass. Independent
factual auditing and first-time-user validation remain external research gates
and must stay explicitly labelled rather than being cosmetically marked done.

