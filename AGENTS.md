## Shared Fleet Standard

Also read and follow the shared fleet-level agent standard at `../AGENTS.md`. Treat this repository as owned product code: protect production stability, keep changes scoped, verify work, and record durable follow-up tasks when something remains incomplete or blocked.

## Project

- **Stack**: Astro + ECharts + Cloudflare Pages
- **Local dev**: `npm run dev`
- **Build/check**: `npm run check` then `npm run build`
- **Deploy**: `npm run deploy` to Cloudflare Pages project `success-by-26`
  (the internal infrastructure name; the product is **What It Takes to Win**)

## Work tracking

- Use [GitHub Issues](https://github.com/Significant-Hobbies/what-it-takes-to-win/issues)
  as the only operational work queue.
- An open issue is a to-do; an issue with a linked pull request is in progress;
  a merged pull request plus a closed issue is done.
- Keep `PROJECT_STATUS.md` limited to current and shipped product truth. Do not
  duplicate future tasks there.
