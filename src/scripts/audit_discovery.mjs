import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://paths.significanthobbies.com";
const people = JSON.parse(
  await readFile(path.join(root, "src", "data", "people.json"), "utf8"),
);
const failures = [];
const passes = [];

function comparisonIsIndexable(person) {
  return Number(person.source_count || 0) >= 2
    && String(person.leverage_evidence_confidence || "").toLowerCase() !== "low"
    && Boolean(person.milestone_by_age_26?.trim())
    && Array.isArray(person.trajectory)
    && person.trajectory.length > 0;
}

async function read(relativePath) {
  try {
    return await readFile(path.join(dist, relativePath), "utf8");
  } catch {
    failures.push(`missing dist/${relativePath}`);
    return "";
  }
}

async function countFiles(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    total += entry.isDirectory() ? await countFiles(target) : 1;
  }
  return total;
}

const robots = await read("robots.txt");
if (
  robots.startsWith("User-agent: *")
  && robots.includes(`Sitemap: ${origin}/sitemap.xml`)
) {
  passes.push("robots.txt");
} else {
  failures.push("robots.txt lacks public crawler and sitemap directives");
}

const sitemap = await read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
const indexableComparisons = people.filter(comparisonIsIndexable);
const coreSurfaceCount = 9;
const essayCount = 2; // essays index + 1 published essay
const expectedSitemapCount = coreSurfaceCount + essayCount + people.length + indexableComparisons.length;
if (
  sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')
  && sitemapUrls.length === expectedSitemapCount
  && sitemapUrls.every((url) => url.startsWith(`${origin}/`))
) {
  passes.push(`${sitemapUrls.length} canonical sitemap URLs`);
} else {
  failures.push(
    `sitemap expected ${expectedSitemapCount} canonical URLs, found ${sitemapUrls.length}`,
  );
}

function markdownPathForUrl(url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return "index.md";
  return `${decodeURIComponent(pathname.replace(/\/$/, ""))}.md`.replace(/^\//, "");
}

let missingMarkdown = 0;
for (const url of sitemapUrls) {
  try {
    await stat(path.join(dist, markdownPathForUrl(url)));
  } catch {
    missingMarkdown += 1;
  }
}
if (missingMarkdown === 0) {
  passes.push("Markdown mirror for every sitemap URL");
} else {
  failures.push(`${missingMarkdown} sitemap URLs lack Markdown mirrors`);
}

const llms = await read("llms.txt");
if (
  llms.startsWith("# What It Takes to Win")
  && llms.includes(`${origin}/roi.md`)
  && !llms.includes("<!doctype")
) {
  passes.push("llms.txt");
} else {
  failures.push("llms.txt is missing or not plain text");
}

const roiMarkdown = await read("roi.md");
if (
  roiMarkdown.includes("## Formulas")
  && roiMarkdown.includes("Foundation work is real work")
  && roiMarkdown.includes("calls no AI model")
) {
  passes.push("ROI Markdown assumptions and effort boundary");
} else {
  failures.push("roi.md lacks formulas, local-computation, or effort-allocation boundaries");
}

const llmsFull = await read("llms-full.txt");
if (
  llmsFull.startsWith("# What It Takes to Win — full agent index")
  && llmsFull.includes("## Agent-readable collections")
  && !llmsFull.includes("<!doctype")
) {
  passes.push("llms-full.txt");
} else {
  failures.push("llms-full.txt is missing or incomplete");
}

const apiText = await read("api/ai");
try {
  const api = JSON.parse(apiText);
  if (
    api.name
    && api.llms === `${origin}/llms.txt`
    && api.llmsFull === `${origin}/llms-full.txt`
    && api.sitemap === `${origin}/sitemap.xml`
    && Array.isArray(api.surfaces)
    && api.surfaces.length === coreSurfaceCount
    && Array.isArray(api.collections)
    && api.collections.length === 2
    && api.collections.every(
      (collection) => collection.urlTemplate && collection.mdTemplate,
    )
  ) {
    passes.push("/api/ai catalog");
  } else {
    failures.push("/api/ai has an incomplete catalog shape");
  }
} catch {
  failures.push("/api/ai is not valid JSON");
}

const headers = await read("_headers");
if (
  headers.includes("Content-Type: application/json")
  && headers.includes("Content-Type: text/markdown")
  && headers.match(/Content-Type: text\/plain; charset=utf-8/g)?.length >= 2
  && headers.includes("X-Robots-Tag: noindex")
) {
  passes.push("agent content types and noindex headers");
} else {
  failures.push("_headers lacks agent content-type or noindex rules");
}

const notFound = await read("404.html");
if (notFound.includes("That path does not exist")) {
  passes.push("custom 404 document");
} else {
  failures.push("404.html lacks the expected error document");
}

const home = await read("index.html");
if (
  home.includes('"@graph"')
  && home.includes('"@type":"WebSite"')
  && home.includes('"@type":"Dataset"')
  && !home.includes("fonts.googleapis.com")
) {
  passes.push("homepage JSON-LD and local font stack");
} else {
  failures.push("homepage JSON-LD is incomplete or remote font CSS remains");
}

const person = await read("person/bill-gates/index.html");
if (
  person.includes('"@type":"WebPage"')
  && person.includes('"@type":"Person"')
  && person.includes('"name":"Bill Gates"')
) {
  passes.push("person-page JSON-LD");
} else {
  failures.push("person-page JSON-LD is incomplete");
}

const strongComparison = indexableComparisons[0];
const weakComparison = people.find((person) => !comparisonIsIndexable(person));
if (strongComparison) {
  const encoded = encodeURIComponent(strongComparison.person_id);
  const url = `${origin}/am-i-the-next/${encoded}/`;
  const html = await read(`am-i-the-next/${strongComparison.person_id}/index.html`);
  if (sitemapUrls.includes(url) && html.includes('content="index,follow"')) {
    passes.push("indexable comparison gate");
  } else {
    failures.push("indexable comparison is absent from sitemap or marked noindex");
  }
}
if (weakComparison) {
  const encoded = encodeURIComponent(weakComparison.person_id);
  const url = `${origin}/am-i-the-next/${encoded}/`;
  const html = await read(`am-i-the-next/${weakComparison.person_id}/index.html`);
  if (!sitemapUrls.includes(url) && html.includes('content="noindex,follow"')) {
    passes.push("noindex comparison gate");
  } else {
    failures.push("weak comparison is in sitemap or lacks noindex");
  }
}

const totalFiles = await countFiles(dist);
if (totalFiles < 20_000) {
  passes.push(`${totalFiles} files under Cloudflare Pages free-plan limit`);
} else {
  failures.push(`${totalFiles} files exceed Cloudflare Pages free-plan limit`);
}

console.log(JSON.stringify({
  status: failures.length ? "fail" : "pass",
  checksPassed: passes,
  failures,
}, null, 2));

if (failures.length) process.exit(1);
