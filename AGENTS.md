## Repository operating rules

This repository is independently operable. Its tracked instructions and
commands are authoritative; no sibling Fleet checkout is required. Protect
production stability, keep changes scoped, verify work with repo-local checks,
and record durable follow-up in this repository's GitHub Issues.

## Project

- **Stack**: Astro + ECharts + Cloudflare Pages
- **Local dev**: `pnpm run dev`
- **Build/check**: `pnpm run check` then `pnpm run build`
- **Deploy**: `pnpm run deploy` to Cloudflare Pages project `success-by-26`
  (a legacy infrastructure name kept to avoid a redeploy; the product is
  **Look Sideways**)

## Work tracking

- Use [GitHub Issues](https://github.com/Significant-Hobbies/what-it-takes-to-win/issues)
  as the only operational work queue.
- An open issue is a to-do; an issue with a linked pull request is in progress;
  a merged pull request plus a closed issue is done.
- Keep `PROJECT_STATUS.md` limited to current and shipped product truth. Do not
  duplicate future tasks there.
