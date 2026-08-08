# Source URL reachability audit — 2026-08-08

## Result

The audit covers 10,025 source URLs across 2,770 people.
9,472 unchanged URL results were retained and 553 new URLs were fetched in this run.
8,419 URLs (84.0%) were reachable.
1,606 URLs (16.0%) were not reachable (dead links, timeouts, or access blocked).

| Metric | Count | Share |
|---|---:|---:|
| All sources reachable | 1,520 | 54.9% |
| Partial sources reachable | 1,241 | 44.8% |
| No sources reachable | 9 | 0.3% |

## What this audit checks

Each source URL was fetched with a HEAD request (falling back to GET for servers
that reject HEAD). A URL is marked reachable if the HTTP response status is 200–399.
This verifies that the source still exists at the cited location. It does not verify
that the source content supports the specific biographical claims in the dataset.

## Limitations

- Some sites block automated requests (HTTP 403) even when the page is live for humans.
- Wikipedia URLs are stable but some personal sites, news articles, and archived pages may have moved.
- Timeout threshold is 8 seconds; slow servers may be marked unreachable.
- This is a reachability audit, not a content verification audit.

## Data

Full results: `quality/source-audit/audit-v1.json`
