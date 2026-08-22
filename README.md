# Look Sideways

<!-- dataset-summary:start -->
An evidence-led visualization of 3,577 early-breakthrough paths: documented
starting conditions, leverage provenance, luck, compounding trajectories, and
the significance of observed milestones.
<!-- dataset-summary:end -->

Explore the public project at
[paths.significanthobbies.com](https://paths.significanthobbies.com).

## What it does

- Visualizes a source-linked dataset across athletes, creators, founders, and
  researchers
- Explores starting advantages separately from built or converted leverage
- Provides per-person trajectories, cohort comparisons, and evidence-gated
  questionnaires
- Publishes methodology, coverage, sitemap, structured data, Markdown mirrors,
  `llms.txt`, and `/api/ai`

This is an explanatory research exhibit, not a causal formula or a tool for
predicting individual outcomes.

## Development

```bash
pnpm install
pnpm run check
pnpm run build
pnpm run audit:discovery
pnpm run audit:clarity
pnpm run audit:tiers
pnpm run audit:stats
```

After changing the dataset, refresh the figures quoted in this file and
`PROJECT_STATUS.md`:

```bash
pnpm run sync:stats
```

Created and maintained by [Sarthak Agrawal](https://sarthakagrawal.dev) under
the [Significant Hobbies](https://significanthobbies.com) organization.
