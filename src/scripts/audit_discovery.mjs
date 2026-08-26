import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { dist, origin, people, comparisonIsIndexable } from "../lib/discovery.mjs";

const failures = [];
const passes = [];

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
const essayCount = 3; // essays index + 2 published essays
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
  llms.startsWith("# Look Sideways")
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
  llmsFull.startsWith("# Look Sideways — full agent index")
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
    && api.openapi === `${origin}/openapi.json`
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

// Every machine-readable URL the catalog advertises must exist in the build.
// The catalog previously pointed at /openapi.json while only an uncommitted
// Pages Function could serve it, which no local check could see.
const openapiText = await read("openapi.json");
try {
  const openapi = JSON.parse(openapiText);
  const advertised = Object.keys(openapi.paths ?? {});
  const missing = [];
  for (const route of advertised) {
    try {
      await stat(path.join(dist, route.replace(/^\//, "")));
    } catch {
      missing.push(route);
    }
  }
  if (
    openapi.openapi === "3.1.0"
    && openapi.servers?.[0]?.url === origin
    && advertised.includes("/openapi.json")
    && advertised.includes("/api/ai")
    && advertised.every((route) => openapi.paths[route].get?.operationId)
    && missing.length === 0
  ) {
    passes.push(`/openapi.json describing ${advertised.length} agent surfaces`);
  } else if (missing.length > 0) {
    failures.push(`/openapi.json advertises unbuilt surfaces: ${missing.join(", ")}`);
  } else {
    failures.push("/openapi.json is missing required spec fields");
  }
} catch {
  failures.push("/openapi.json is not valid JSON");
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
