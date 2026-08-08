# Source URL reachability audit — 2026-08-08

## Result

Audited 9,472 source URLs across 2,585 people.
7,951 URLs (83.9%) were reachable.
1,521 URLs (16.1%) were not reachable (dead links, timeouts, or access blocked).

| Metric | Count | Share |
|---|---:|---:|
| All sources reachable | 1,410 | 54.5% |
| Partial sources reachable | 1,166 | 45.1% |
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
