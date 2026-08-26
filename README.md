# Look Sideways

<!-- dataset-summary:start -->
A guided, evidence-led journey through 3,578 early-breakthrough paths: what
people brought, were handed, and were surrounded by, with perseverance, luck,
and the limits of comparison kept visible.
<!-- dataset-summary:end -->

Explore the public project at
[paths.significanthobbies.com](https://paths.significanthobbies.com).

## What it does

- Visualizes a source-linked dataset across athletes, creators, founders, and
  researchers
- Uses the same three condition factors everywhere: what a person brought, was
  handed, and was surrounded by
- Keeps sourced perseverance and unscored luck visible on individual paths
- Includes 1,670 professionally distinctive paths beyond the most famous
  outliers, without inventing a universal percentile
- Breaks person-to-person comparisons instead of producing resemblance scores
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
