// Rasterize public/og-image.svg to public/og-image.png at exactly 1200x630.
//
// The share card was previously hand-exported, which is how it kept advertising
// "2,700+ EARLY BREAKTHROUGH PATHS" long after the dataset passed 3,500. The
// card no longer carries a count — the live figure sits in the build-derived
// og:image:alt — but editing the SVG still needs a matching PNG, so make that
// one command instead of a manual export.
//
//   pnpm run render:og
import { access, copyFile, mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const svg = path.join(root, "public", "og-image.svg");
const png = path.join(root, "public", "og-image.png");

// Any Chromium build can do this; these are the common macOS/Linux locations.
const CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function findBrowser() {
  for (const candidate of [process.env.CHROME_PATH, ...CANDIDATES].filter(Boolean)) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const browser = await findBrowser();
if (!browser) {
  console.error(
    "No Chrome or Chromium found. Set CHROME_PATH to a browser binary, or export"
      + " public/og-image.svg to public/og-image.png at 1200x630 by hand.",
  );
  process.exit(1);
}

// Chrome screenshots the file:// URL it is given, so stage the SVG in a temp
// directory and copy the result back rather than writing into public/ mid-render.
const workspace = await mkdtemp(path.join(tmpdir(), "og-render-"));
try {
  const stagedSvg = path.join(workspace, "og-image.svg");
  const stagedPng = path.join(workspace, "og-image.png");
  await copyFile(svg, stagedSvg);
  const result = spawnSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      `--screenshot=${stagedPng}`,
      `file://${stagedSvg}`,
    ],
    { encoding: "utf8" },
  );
  await access(stagedPng).catch(() => {
    throw new Error(`Chrome produced no screenshot.\n${result.stderr ?? ""}`);
  });
  await copyFile(stagedPng, png);
  console.log("Rendered public/og-image.png at 1200x630.");
} finally {
  await rm(workspace, { force: true, recursive: true });
}
