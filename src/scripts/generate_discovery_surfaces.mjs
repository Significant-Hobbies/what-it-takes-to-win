import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { root, dist, origin, people, comparisonIsIndexable } from "../lib/discovery.mjs";

const coreSurfaces = [
  {
    id: "home",
    htmlPath: "/",
    mdPath: "/index.md",
    title: "The path you remember is one of many",
    summary:
      "A five-chapter guided argument through the visible finish, three sources of advantage, perseverance, luck, and release from identity comparison.",
  },
  {
    id: "overview",
    htmlPath: "/overview/",
    mdPath: "/overview.md",
    title: "Look Sideways — research overview",
    summary:
      "A deeper research overview behind the three-source public model and its detailed annotations.",
  },
  {
    id: "insights",
    htmlPath: "/insights/",
    mdPath: "/insights.md",
    title: "Evidence room",
    summary:
      "The three-source model, perseverance, luck, broader professionally distinctive paths, overlap, and counterexamples that make direct comparison incomplete.",
  },
  {
    id: "explore",
    htmlPath: "/explore/",
    mdPath: "/explore.md",
    title: `Explore ${people.length.toLocaleString("en-US")} documented paths`,
    summary:
      "Search and filter documented paths by milestone age, cohort, field, and qualitative outcome reach, then inspect the same three sources on every profile.",
  },
  {
    id: "compare",
    htmlPath: "/compare/",
    mdPath: "/compare.md",
    title: "Break a comparison",
    summary:
      "Choose a documented person and dismantle the identity comparison through conditions, perseverance, sequence, and luck.",
  },
  {
    id: "roi",
    htmlPath: "/roi/",
    mdPath: "/roi.md",
    title: "Expected Value & ROI Lab",
    summary:
      "A local, input-based worksheet for valuing time, money, and resources; allocating effort across foundation, capability-building, and final-mile work; and calculating expected ROI from user-supplied outcomes and probabilities.",
  },
  {
    id: "coverage",
    htmlPath: "/coverage/",
    mdPath: "/coverage.md",
    title: "Evidence coverage",
    summary:
      "Live source depth, trajectory completeness, confidence, sample composition, indexability, and unresolved independent-audit boundaries.",
  },
  {
    id: "methodology",
    htmlPath: "/methodology/",
    mdPath: "/methodology.md",
    title: "Methodology and limitations",
    summary:
      "Definitions, inclusion rules, score boundaries, tier semantics, evidence gates, limitations, and the non-causal interpretation contract.",
  },
  {
    id: "about",
    htmlPath: "/about/",
    mdPath: "/about.md",
    title: "About Look Sideways",
    summary:
      "An independent educational research exhibit based on a purposive sample of early-breakthrough paths, not a prediction engine or leaderboard.",
  },
];

function safeId(person) {
  const id = String(person.person_id || "");
  if (!id || id.includes("/") || id.includes("\\") || id === "." || id === "..") {
    throw new Error(`Unsafe person_id for static output: ${id || "(empty)"}`);
  }
  return id;
}

function absolute(route) {
  return new URL(route, origin).toString();
}

function clean(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownLink(url) {
  return url.replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function personMarkdown(person, comparison = false) {
  const id = safeId(person);
  const title = comparison ? `Why you are not the next ${person.name}` : person.name;
  const lines = [
    `# ${title}`,
    "",
    comparison
      ? `Study ${person.name}'s mechanisms, then drop the identity comparison: conditions, sequence, and luck cannot be reproduced as a forecast.`
      : `A documented path profile from [Look Sideways](${origin}/).`,
    "",
    "## Key facts",
    "",
    `- Cohort: ${person.cohort_group}`,
    `- Field: ${person.category}`,
    `- Included milestone age: ${person.age_at_milestone}`,
    `- Outcome reach annotation: T${person.success_tier}`,
    `- What they brought: ${person.personal_endowment_score ?? "not assessed"}`,
    `- What they were handed: ${person.inherited_leverage_score ?? "not assessed"}`,
    `- What surrounded them: ${person.catalytic_ecosystem_score ?? "not assessed"}`,
    "",
    "## Documented milestone",
    "",
    clean(person.milestone_by_age_26),
    "",
  ];

  if (clean(person.starting_point)) {
    lines.push("## Starting point", "", clean(person.starting_point), "");
  }
  if (clean(person.early_history_summary)) {
    lines.push("## Early path", "", clean(person.early_history_summary), "");
  }
  if (clean(person.current_position)) {
    lines.push(
      "## Current documented position",
      "",
      `${clean(person.current_position)}${person.current_position_year ? ` (record year: ${person.current_position_year})` : ""}`,
      "",
    );
  }
  if (Array.isArray(person.trajectory) && person.trajectory.length) {
    lines.push("## Trajectory", "");
    for (const step of person.trajectory) {
      const label = [step.year, step.age != null ? `age ${step.age}` : null]
        .filter(Boolean)
        .join(" · ");
      const titleText = clean(step.title || step.event);
      const description = clean(step.description);
      lines.push(`- **${label || "Documented step"}:** ${titleText}${description ? ` — ${description}` : ""}`);
    }
    lines.push("");
  }

  lines.push(
    "## Interpretation boundary",
    "",
    "These scores are analyst-applied descriptions of documented evidence. They are not causal estimates, talent scores, forecasts, or proof that an undocumented condition was absent. Luck, timing, gatekeepers, and outcome variance remain visible but unscored.",
    "",
    "## Sources",
    "",
  );
  for (const source of person.source_urls || []) {
    lines.push(`- <${markdownLink(source)}>`);
  }
  lines.push(
    "",
    `- [Read the HTML profile](${absolute(`/person/${encodeURIComponent(id)}/`)})`,
    `- [Read the methodology](${absolute("/methodology/")})`,
    "",
  );
  return lines.join("\n");
}

function coverageMarkdown(surface) {
  const total = people.length;
  const share = (count) => `${((count / total) * 100).toFixed(1)}%`;
  const trajectories = people.filter(
    (person) => Array.isArray(person.trajectory) && person.trajectory.length >= 3,
  ).length;
  const twoSources = people.filter(
    (person) => Array.isArray(person.source_urls) && person.source_urls.length >= 2,
  ).length;
  const twoSourceDomains = people.filter((person) => {
    const domains = new Set(
      (person.source_urls || []).map((source) => {
        try {
          return new URL(source).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      }).filter(Boolean),
    );
    return domains.size >= 2;
  }).length;
  const indexable = people.filter(comparisonIsIndexable).length;
  const audited = people.filter(
    (person) => person.source_audit_status === "source_verified",
  ).length;

  return [
    `# ${surface.title}`,
    "",
    surface.summary,
    "",
    "## Current published coverage",
    "",
    `- Published paths: ${total.toLocaleString("en-US")}`,
    `- Three-event trajectories: ${trajectories.toLocaleString("en-US")} (${share(trajectories)})`,
    `- Two or more listed sources: ${twoSources.toLocaleString("en-US")} (${share(twoSources)})`,
    `- Two or more source domains: ${twoSourceDomains.toLocaleString("en-US")} (${share(twoSourceDomains)})`,
    `- Pass the search evidence gate: ${indexable.toLocaleString("en-US")} (${share(indexable)})`,
    `- Source reachability verified: ${audited.toLocaleString("en-US")} (${share(audited)})`,
    "",
    "## Interpretation boundary",
    "",
    "Structural completeness is not independent verification. This is a selected early-breakthrough atlas with no matched unsuccessful control group. It cannot estimate success probabilities, causal effects, population prevalence, or how many similar-background people failed for each visible outlier.",
    "",
    "## External gates still pending",
    "",
    "- Independent double-coding across cohort-tier cells.",
    "- Factual and annotation source auditing with retrieval dates and evidence spans.",
    "- First-time-user comprehension and emotional-resonance observation.",
    "- A matched comparison study before population or counterfactual claims.",
    "",
    `- [Open the evidence coverage page](${absolute("/coverage/")})`,
    `- [Read the methodology](${absolute("/methodology/")})`,
    "",
  ].join("\n");
}

function roiMarkdown(surface) {
  return [
    `# ${surface.title}`,
    "",
    surface.summary,
    "",
    "## What the worksheet asks you to enter",
    "",
    "1. Name the action or decision.",
    "2. Convert every time, money, and resource investment into one user-chosen common value unit.",
    "3. Classify each investment as foundation, capability-building, or final-mile effort.",
    "4. Name each possible outcome, assign its total value, and supply its probability.",
    "5. Reconcile the probabilities to 100%.",
    "",
    "The worksheet starts blank. An optional fictional example demonstrates the interaction, but the product does not assign values or probabilities to real decisions.",
    "",
    "## Formulas",
    "",
    "- Expected gross value = sum of each outcome probability multiplied by its total outcome value.",
    "- Expected net return = expected gross value minus total investment.",
    "- Expected ROI = expected net return divided by total investment.",
    "- Downside probability = the probabilities of outcomes worth less than total investment.",
    "- Break-even-or-better probability = the probabilities of outcomes worth at least total investment.",
    "",
    "## Effort allocation boundary",
    "",
    "Foundation work is real work. A person who must build access, runway, tools, or prerequisites may spend more of the same total effort reaching the outcome-producing frontier. Someone who begins closer to that frontier may direct more effort to final-mile execution. The allocation view does not infer another person's effort, merit, or starting position.",
    "",
    "## Interpretation boundary",
    "",
    "The probabilities and valuations are user assumptions. Expected value describes an average across repeated comparable decisions, not the most likely single result. The worksheet uses local deterministic arithmetic, sends no entered data, calls no AI model, and does not recommend whether to proceed.",
    "",
    `- [Open the interactive worksheet](${absolute("/roi/")})`,
    `- [Read the outcome-model limitations](${absolute("/methodology/")})`,
    "",
  ].join("\n");
}

function staticMarkdown(surface) {
  if (surface.id === "coverage") return coverageMarkdown(surface);
  if (surface.id === "roi") return roiMarkdown(surface);
  return [
    `# ${surface.title}`,
    "",
    surface.summary,
    "",
    "## The explanatory model",
    "",
    "1. What they brought: documented capability, drive, health, or early skill.",
    "2. What they were handed: money, family standing, access, tools, or safety already in place.",
    "3. What surrounded them: place, era, institutions, peers, platforms, and timing.",
    "",
    "Perseverance is shown only through sourced repeated behaviour, setbacks, recovery, or sustained practice. Luck acts across every transition. Both remain explicit and unscored.",
    "",
    "## Use this project for",
    "",
    "- Inspecting mechanisms and evidence behind unusual paths.",
    "- Separating what people brought, were handed, and were surrounded by.",
    "- Seeing why similar totals can conceal different origins and sequences.",
    "",
    "Do not use it to rank human worth, forecast an individual outcome, or treat a famous person's path as a reproducible identity.",
    "",
    "## Public surfaces",
    "",
    ...coreSurfaces.map((item) => `- [${item.title}](${absolute(item.htmlPath)})`),
    "",
    `- [Explore every person](${absolute("/explore/")})`,
    `- [Machine-readable catalog](${absolute("/api/ai")})`,
    `- [Sitemap](${absolute("/sitemap.xml")})`,
    "",
  ].join("\n");
}

async function emit(relativePath, contents) {
  const target = path.join(dist, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

const indexableComparisons = people.filter(comparisonIsIndexable);
const essays = [
  {
    id: "everyone-has-lost-their-marbles",
    htmlPath: "/essays/everyone-has-lost-their-marbles/",
    mdPath: "/essays/everyone-has-lost-their-marbles.md",
    title: "Everyone Has Lost Their Marbles",
    summary:
      "A visual argument about survivor selection, perseverance, luck, and why another person's visible finish cannot become your forecast.",
  },
  {
    id: "who-filled-the-kings-jug",
    htmlPath: "/essays/who-filled-the-kings-jug/",
    mdPath: "/essays/who-filled-the-kings-jug.md",
    title: "Who Filled the King's Jug?",
    summary:
      "Privilege is having more of life prepared for you in advance — a private, high-level interface to the world that lets some people begin near the final step.",
  },
];
const canonicalRoutes = [
  ...coreSurfaces.map((surface) => surface.htmlPath),
  "/essays/",
  ...essays.map((essay) => essay.htmlPath),
  ...people.map((person) => `/person/${encodeURIComponent(safeId(person))}/`),
  ...indexableComparisons.map(
    (person) => `/am-i-the-next/${encodeURIComponent(safeId(person))}/`,
  ),
];

await emit(
  "robots.txt",
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /data/",
    "",
    `Sitemap: ${absolute("/sitemap.xml")}`,
    "",
  ].join("\n"),
);

await emit(
  "sitemap.xml",
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...canonicalRoutes.map((route) => `  <url><loc>${absolute(route)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n"),
);

await emit(
  "llms.txt",
  [
    "# Look Sideways",
    "",
    "> A guided, evidence-bounded argument showing why another person's outcome cannot become your forecast.",
    "",
    "## When to use this",
    "",
    "- Answering questions about what people brought, were handed, and were surrounded by, plus documented perseverance and unscored luck",
    "- Providing evidence-bounded analysis of documented early-breakthrough paths without claiming causality or predicting individual success",
    `- Browsing ${people.length.toLocaleString("en-US")} profiles spanning extreme outliers, field leaders, and professionally distinctive paths in a purposeful success sample`,
    "- Explaining the three-source model and why perseverance, sequence, and luck prevent identity comparison from becoming a forecast",
    "- Directing users to ROI lab, methodology, coverage, and long-form essays on advantage and abstraction",
    "",
    "## Start here",
    "",
    `- [Story](${absolute("/index.md")}): a five-chapter journey from the visible survivor to the limits of comparison`,
    `- [Research overview](${absolute("/overview.md")}): the deeper annotation model and interpretation boundary`,
    `- [Evidence room](${absolute("/insights.md")}): three sources, broader success, overlap, perseverance, luck, and counterexamples`,
    `- [ROI lab](${absolute("/roi.md")}): user-valued investment, effort allocation, expected value, and ROI calculated locally`,
    `- [Evidence coverage](${absolute("/coverage.md")}): source depth, confidence, composition, and unresolved audit boundaries`,
    `- [Methodology](${absolute("/methodology.md")}): inclusion, scoring, evidence gates, and limitations`,
    `- [Essays](${absolute("/essays/")}): long-form writing on advantage and abstraction`,
    `- [Explore](${absolute("/explore/")}): ${people.length.toLocaleString("en-US")} person profiles`,
    `- [API catalog](${absolute("/api/ai")}): machine-readable discovery contract`,
    `- [OpenAPI spec](${absolute("/openapi.json")}): machine-readable API contract`,
    `- [Sitemap](${absolute("/sitemap.xml")}): canonical indexable HTML`,
    "",
    "## Collections",
    "",
    `- Person HTML: ${origin}/person/{id}/`,
    `- Person Markdown: ${origin}/person/{id}.md`,
    `- Comparison-breaker HTML: ${origin}/am-i-the-next/{id}/`,
    `- Comparison-breaker Markdown: ${origin}/am-i-the-next/{id}.md`,
    "",
    "## Important limitation",
    "",
    "The dataset is a purposive successful-outlier sample with interpretive annotations. It cannot estimate causal effects, base rates, counterfactual outcomes, or an individual's probability of success.",
    "",
  ].join("\n"),
);

await emit(
  "llms-full.txt",
  [
    "# Look Sideways — full agent index",
    "",
    "Look Sideways is a guided argument over a purposeful sample of documented early-breakthrough paths. It separates what people brought, were handed, and were surrounded by, then keeps perseverance, sequence, and luck visible. It is not a prediction engine, causal model, or ranking of human worth.",
    "",
    "## Explanatory model",
    "",
    "1. What they brought: documented capability, drive, health, or early skill.",
    "2. What they were handed: money, family standing, access, tools, or safety already in place.",
    "3. What surrounded them: place, era, institutions, peers, platforms, and timing.",
    "",
    "Perseverance is shown only through sourced repeated behaviour. Luck acts across every transition. Neither becomes a moral or causal score.",
    "",
    "## Public guide",
    "",
    ...coreSurfaces.map(
      (surface) => `- [${surface.title}](${absolute(surface.mdPath)}): ${surface.summary}`,
    ),
    "",
    "## Agent-readable collections",
    "",
    `- ${people.length.toLocaleString("en-US")} person profiles: ${origin}/person/{id}.md`,
    `- ${indexableComparisons.length.toLocaleString("en-US")} comparison-breakers: ${origin}/am-i-the-next/{id}.md`,
    `- [Machine-readable catalog](${absolute("/api/ai")})`,
    `- [Canonical sitemap](${absolute("/sitemap.xml")})`,
    "",
    "## Interpretation boundary",
    "",
    "The dataset is a purposive successful-outlier sample with interpretive annotations. Structural completeness is not independent verification. The project cannot estimate causal effects, population base rates, counterfactual outcomes, or an individual's probability of success.",
    "",
    "Current external research gates include independent double-coding, factual and annotation source audits, first-time-user comprehension observation, and a matched comparison study before any population or counterfactual claim.",
    "",
  ].join("\n"),
);

const catalog = {
  name: "Look Sideways",
  version: "1",
  url: origin,
  llms: absolute("/llms.txt"),
  llmsFull: absolute("/llms-full.txt"),
  sitemap: absolute("/sitemap.xml"),
  openapi: absolute("/openapi.json"),
  markdown: {
    suffix: ".md",
    negotiation: true,
    home: "/index.md",
  },
  surfaces: coreSurfaces.map((surface) => ({
    id: surface.id,
    url: surface.htmlPath,
    md: surface.mdPath,
    kind: "static",
  })),
  collections: [
    {
      id: "people",
      count: people.length,
      urlTemplate: "/person/{id}/",
      mdTemplate: "/person/{id}.md",
      kind: "person",
    },
    {
      id: "comparisons",
      count: indexableComparisons.length,
      urlTemplate: "/am-i-the-next/{id}/",
      mdTemplate: "/am-i-the-next/{id}.md",
      kind: "evidence-gated-comparison",
    },
  ],
  auth: {
    public: true,
    notes: "All listed surfaces are public and require no account.",
  },
  limitations: [
    "Purposive successful-outlier sample",
    "Interpretive annotations, not causal estimates",
    "No prediction of individual outcomes",
  ],
};
await emit("api/ai", `${JSON.stringify(catalog, null, 2)}\n`);

// The OpenAPI document is emitted as a static file so `pnpm run audit:discovery`
// can verify every surface the catalog advertises. Cloudflare Pages serves it
// directly; the Pages Function deliberately does not carry a second copy.
const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Look Sideways public API",
    version: "1.0.0",
    description:
      "An independent, evidence-bounded research exhibit explaining how what people brought, were handed, and were surrounded by interacted with perseverance, sequence, and luck without forming a success recipe.",
    contact: { name: "Look Sideways", url: origin },
  },
  servers: [{ url: origin }],
  tags: [{ description: "Machine-readable public surfaces", name: "agent-surfaces" }],
  paths: Object.fromEntries(
    [
      {
        contentType: "application/json",
        operationId: "getAgentCatalog",
        route: "/api/ai",
        summary: "Agent catalog",
      },
      {
        contentType: "text/plain",
        operationId: "getLlmsTxt",
        route: "/llms.txt",
        summary: "llms.txt index",
      },
      {
        contentType: "text/plain",
        operationId: "getLlmsFullTxt",
        route: "/llms-full.txt",
        summary: "Full agent index",
      },
      {
        contentType: "application/xml",
        operationId: "getSitemap",
        route: "/sitemap.xml",
        summary: "Canonical sitemap",
      },
      {
        contentType: "application/json",
        operationId: "getOpenApiSpec",
        route: "/openapi.json",
        summary: "OpenAPI specification",
      },
    ].map((surface) => [
      surface.route,
      {
        get: {
          operationId: surface.operationId,
          responses: {
            200: {
              content: { [surface.contentType]: {} },
              description: surface.summary,
            },
          },
          summary: surface.summary,
          tags: ["agent-surfaces"],
        },
      },
    ]),
  ),
};
await emit("openapi.json", `${JSON.stringify(openapi, null, 2)}\n`);

for (const surface of coreSurfaces) {
  await emit(surface.mdPath.replace(/^\//, ""), staticMarkdown(surface));
}
for (const person of people) {
  const id = safeId(person);
  await emit(path.join("person", `${id}.md`), personMarkdown(person));
}
for (const person of indexableComparisons) {
  const id = safeId(person);
  await emit(
    path.join("am-i-the-next", `${id}.md`),
    personMarkdown(person, true),
  );
}
for (const essay of essays) {
  const sourcePath = path.join(root, "src", "pages", "essays", `${essay.id}.md`);
  let body = await readFile(sourcePath, "utf8");
  const fmEnd = body.indexOf("\n---\n", body.indexOf("---\n") + 4);
  body = fmEnd >= 0 ? body.slice(fmEnd + 5) : body;
  const essayMd = [
    `# ${essay.title}`,
    "",
    essay.summary,
    "",
    `- [Read the HTML essay](${absolute(essay.htmlPath)})`,
    `- [Read the methodology](${absolute("/methodology/")})`,
    "",
    body.trim(),
    "",
  ].join("\n");
  await emit(essay.mdPath.replace(/^\//, ""), essayMd);
}
const essaysIndexMd = [
  "# Essays — Look Sideways",
  "",
  "Long-form writing that sits alongside the dataset — on advantage, abstraction, and the invisible infrastructure of achievement.",
  "",
  ...essays.map(
    (essay) =>
      `- [${essay.title}](${absolute(essay.mdPath)}): ${essay.summary}`,
  ),
  "",
  `- [Read all essays](${absolute("/essays/")})`,
  "",
].join("\n");
await emit("essays.md", essaysIndexMd);

await emit(
  "_headers",
  [
    "/api/ai",
    "  Content-Type: application/json; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/openapi.json",
    "  Content-Type: application/json; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/llms.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/llms-full.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/robots.txt",
    "  Content-Type: text/plain; charset=utf-8",
    "/sitemap.xml",
    "  Content-Type: application/xml; charset=utf-8",
    "/*.md",
    "  Content-Type: text/markdown; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/person/*.md",
    "  Content-Type: text/markdown; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/am-i-the-next/*.md",
    "  Content-Type: text/markdown; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/essays/*.md",
    "  Content-Type: text/markdown; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "",
  ].join("\n"),
);

console.log(
  `Generated discovery surfaces: ${canonicalRoutes.length} canonical URLs, ${people.length + indexableComparisons.length + coreSurfaces.length + essays.length} Markdown mirrors, ${indexableComparisons.length} indexable comparisons`,
);
