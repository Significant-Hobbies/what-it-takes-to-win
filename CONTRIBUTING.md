# Contributing

Thank you for helping make the record better. There are three ways to
contribute, and each has its own path.

## Suggest a person or correct a profile

Use [/contribute/](https://paths.significanthobbies.com/contribute/) on the
site. The form validates your input, shows exactly what GitHub will receive,
and opens a pre-filled issue. You can also open an issue directly with the
"Suggest a person" or "Propose a profile edit" template.

A suggestion needs a dated, age-relative public outcome and public sources. An
edit needs the current claim, the correction, and the evidence. Suggestions and
edits are public, so do not include private, confidential, or sensitive
personal information.

A contribution opens a research question. It does not guarantee publication,
and it does not bypass the discovery, research, and publication gates described
in [docs/research-pipeline.md](docs/research-pipeline.md).

## Report a problem or propose a change

Open a GitHub issue. Open work is tracked only in
[GitHub Issues](https://github.com/Significant-Hobbies/what-it-takes-to-win/issues).
An open issue is a to-do, an issue with a linked pull request is in progress,
and a merged pull request plus a closed issue is done.

Non-trivial feature work starts with a tracking issue that holds the proposal,
design notes, requirements, and task list. There are no local spec files.

## Change the code

```bash
pnpm install
pnpm run dev       # http://localhost:4321
pnpm run check     # rebuild data, evaluate coverage gates, typecheck
pnpm test          # model tests
pnpm run quality   # the complete gate CI runs
```

Node 22 and pnpm 10 are the tested versions. Python 3 is only needed for the
research pipeline scripts under `src/scripts/`.

Before opening a pull request:

- Run `pnpm run quality` and make sure it passes. CI runs the same command.
- If you changed the dataset, run `pnpm run sync:stats` so the figures quoted
  in `README.md` and `PROJECT_STATUS.md` match the corpus.
- If you changed a public surface, keep the clarity contract: the three
  condition factors are shown side by side and never summed, pending evidence
  is marked as pending, and no page claims a percentile or a prediction.
- If you changed visual language, layout, or navigation, follow
  [DESIGN.md](DESIGN.md) and capture screenshots at 390, 768, and 1440 pixels.
- Keep diffs small and scoped. One concern per pull request.

Read [AGENTS.md](AGENTS.md) for the operating rules, [PRODUCT.md](PRODUCT.md)
for the voice, and [docs/quality-gates.md](docs/quality-gates.md) for what each
check in the gate does.

## Research contributions

If you want to research a batch of candidates, read
[data/research/RESEARCH_INSTRUCTIONS.md](data/research/RESEARCH_INSTRUCTIONS.md)
first. The rules that matter most: eligibility before anything else, two sources
for the milestone date, never invent family background, and record a row for
every candidate including the ineligible ones.

## Licence

Release terms for the original annotations and scripts are still under review,
so the repository does not yet grant a licence. By contributing you agree that
your contribution may be released under the terms the project eventually
adopts, which are expected to be CC BY 4.0 for annotations and MIT for code as
suggested in [src/data/LICENSE_DATA.md](src/data/LICENSE_DATA.md).
