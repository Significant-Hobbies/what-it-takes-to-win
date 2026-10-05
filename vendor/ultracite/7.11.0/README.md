# Vendored Ultracite Biome presets

These two static configuration artifacts are copied without modification from the published MIT-licensed Ultracite package 7.11.0:

- config/biome/astro/biome.jsonc — SHA-256 881766a2c76027bf6ffe20815fac0c777f88baa8d7fb0681140d345b4e3ee13a
- config/biome/core/biome.jsonc — SHA-256 13ecfbfc8cda3a885d28c523a4053fcbf28321232f898326e9d33d2f56f98527

Upstream source: https://github.com/haydenbleasel/ultracite/tree/e8ba72fbc09499d98b4941ee3c29149993286c43/packages/cli/config/biome

The source version is verified by the npm registry metadata for ultracite@7.11.0: gitHead e8ba72fbc09499d98b4941ee3c29149993286c43 and tarball integrity sha512-HJByeIoO4Lhcing1k2sabI7BCHRqeMztXGYZm4Zcir7NXvidXLwDgLNZgSR4w3oPKPgx7CRTqzJitt/oPR34NA==.

The full upstream MIT license is in LICENSE. Keep the notices and exact files together if these presets are updated or removed. The project biome.json extends these checked-in files; they contain the same upstream rule and ignore settings as the prior package imports.

## CLI behavior retained

Ultracite 7.11.0's `packages/cli/src/commands/check.ts` at the source commit above builds the Biome argv as `check --no-errors-on-unmatched`, appends the caller's passthrough flags and file arguments, invokes Biome with `stdio: "inherit"`, and propagates its failure status (`runBiomeCheck`, lines 10–29). The original project scripts invoked `ultracite check .` for both `lint` and `format:check`, so both now invoke `biome check --no-errors-on-unmatched .` with the same file scope, visible CLI output, and failure status. The root config disables formatter and assist, matching the old check-only behavior.

Immutable upstream source: https://raw.githubusercontent.com/haydenbleasel/ultracite/e8ba72fbc09499d98b4941ee3c29149993286c43/packages/cli/src/commands/check.ts
