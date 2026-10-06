# Local security patch provenance

The package patch in this directory applies a behavioral correction to the upstream http-cache-semantics 4.3.0 package. It is taken byte-for-byte from the already-tested Free AI patch at commit 91101be5ee37103dcfd405fa3fde2dc78bc7df31 (patch SHA-256 1bde1fe699a4c0f618ade5961734d1d414333292a27feacc6780a501009c0c74).

The regression suite is adapted from that same Free AI commit and resolves http-cache-semantics through this repository's Astro package, so it exercises the actual production consumer dependency path. The patch is applied via pnpm patchedDependencies and is not a version-only override. Keep the patch and consumer regression together; re-evaluate them when upstream publishes a fix.

The issue acceptance tracks GHSA-ch52-4w7c-c8xp / CVE-2026-93748. Advisory: https://github.com/advisories/GHSA-ch52-4w7c-c8xp
