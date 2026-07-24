import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://paths.significanthobbies.com";
const people = JSON.parse(
  await readFile(path.join(root, "src", "data", "people.json"), "utf8"),
);

const advantageFields = [
  "early_family_financial_platform_support_score",
  "parent_family_domain_advantage_score",
  "inherited_audience_business_network_score",
  "elite_institution_performance_pipeline_score",
  "frontier_geography_ecosystem_score",
  "rare_early_tools_facilities_score",
  "dedicated_mentor_coach_tutor_score",
  "exceptional_peer_cofounder_sibling_score",
  "early_online_platform_community_score",
  "direct_customer_domain_exposure_score",
  "prodigy_physical_edge_score",
  "adversity_constraint_catalyst_score",
];

const coreSurfaces = [
  {
    id: "home",
    htmlPath: "/",
    mdPath: "/index.md",
    title: "What It Takes to Win",
    summary:
      "An evidence-bounded model of how starting advantages, built or converted leverage, compounding trajectories, observed standing, and luck relate without forming a success recipe.",
  },
  {
    id: "insights",
    htmlPath: "/insights/",
    mdPath: "/insights.md",
    title: "How extraordinary outcomes happen",
    summary:
      "The one-minute answer, four-stage model, leverage provenance, luck, outcome tiers, overlap, and counterexamples that make direct comparison incomplete.",
  },
  {
    id: "explore",
    htmlPath: "/explore/",
    mdPath: "/explore.md",
    title: "Explore 2,585 documented paths",
    summary:
      "Search and filter founders, creators, athletes, and researchers by milestone age, cohort, engine, starting pattern, and observed career tier.",
  },
  {
    id: "compare",
    htmlPath: "/compare/",
    mdPath: "/compare.md",
    title: "Am I the next...?",
    summary:
      "Choose a documented person and compare visible ingredients, then inspect why resemblance cannot reproduce origins, timing, sequence, luck, or outcomes.",
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
    title: "About What It Takes to Win",
    summary:
      "An independent educational research exhibit based on a purposive sample of early-breakthrough paths, not a prediction engine or leaderboard.",
  },
];

function comparisonIsIndexable(person) {
  return Number(person.source_count || 0) >= 2
    && String(person.leverage_evidence_confidence || "").toLowerCase() !== "low"
    && Boolean(person.milestone_by_age_26?.trim())
    && Array.isArray(person.trajectory)
    && person.trajectory.length > 0;
}

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

function advantageTotal(person) {
  return advantageFields.reduce((sum, field) => sum + Number(person[field] || 0), 0);
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
  const title = comparison ? `Am I the next ${person.name}?` : person.name;
  const lines = [
    `# ${title}`,
    "",
    comparison
      ? `A visible resemblance to ${person.name} is not a prediction. This page compares documented ingredients so the limits of the comparison become explicit.`
      : `A documented path profile from [What It Takes to Win](${origin}/).`,
    "",
    "## Key facts",
    "",
    `- Cohort: ${person.cohort_group}`,
    `- Field: ${person.category}`,
    `- Included milestone age: ${person.age_at_milestone}`,
    `- Observed career standing: T${person.success_tier}`,
    `- Starting-advantage score: ${advantageTotal(person)}/24`,
    `- Built or converted leverage: ${Number(person.total_leverage_score || 0)}/25`,
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

function staticMarkdown(surface) {
  return [
    `# ${surface.title}`,
    "",
    surface.summary,
    "",
    "## The explanatory model",
    "",
    "1. Starting advantages shape the first available moves.",
    "2. Built or converted leverage changes how effectively effort can compound.",
    "3. Repeated work, feedback, relationships, and decisions form a trajectory.",
    "4. Observed career standing describes documented recognition; it is not calculated from the scores.",
    "",
    "Luck acts across every transition through era, geography, encounters, gatekeepers, shocks, timing, and outcome variance. It remains explicit and unscored.",
    "",
    "## Use this project for",
    "",
    "- Inspecting mechanisms and evidence behind unusual paths.",
    "- Separating starting position from later multiplying capacity.",
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
const canonicalRoutes = [
  ...coreSurfaces.map((surface) => surface.htmlPath),
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
    "# What It Takes to Win",
    "",
    "> An independent, evidence-bounded research exhibit explaining how starting advantages, built or converted leverage, trajectory, observed standing, and luck relate without forming a success recipe.",
    "",
    "## Start here",
    "",
    `- [Overview](${absolute("/index.md")}): the four-stage model and interpretation boundary`,
    `- [Insights](${absolute("/insights.md")}): the one-minute answer, tiers, overlap, luck, and counterexamples`,
    `- [Methodology](${absolute("/methodology.md")}): inclusion, scoring, evidence gates, and limitations`,
    `- [Explore](${absolute("/explore/")}): ${people.length.toLocaleString("en-US")} person profiles`,
    `- [API catalog](${absolute("/api/ai")}): machine-readable discovery contract`,
    `- [Sitemap](${absolute("/sitemap.xml")}): canonical indexable HTML`,
    "",
    "## Collections",
    "",
    `- Person HTML: ${origin}/person/{id}/`,
    `- Person Markdown: ${origin}/person/{id}.md`,
    `- Evidence-gated comparison HTML: ${origin}/am-i-the-next/{id}/`,
    `- Comparison Markdown: ${origin}/am-i-the-next/{id}.md`,
    "",
    "## Important limitation",
    "",
    "The dataset is a purposive successful-outlier sample with interpretive annotations. It cannot estimate causal effects, base rates, counterfactual outcomes, or an individual's probability of success.",
    "",
  ].join("\n"),
);

const catalog = {
  name: "What It Takes to Win",
  version: "1",
  url: origin,
  llms: absolute("/llms.txt"),
  llmsFull: null,
  sitemap: absolute("/sitemap.xml"),
  markdown: {
    suffix: ".md",
    negotiation: false,
    home: "/index.md",
  },
  surfaces: [
    ...coreSurfaces.map((surface) => ({
      id: surface.id,
      url: surface.htmlPath,
      md: surface.mdPath,
      kind: "static",
    })),
    {
      id: "people",
      url: "/person/{id}/",
      md: "/person/{id}.md",
      kind: "collection",
      count: people.length,
    },
    {
      id: "comparisons",
      url: "/am-i-the-next/{id}/",
      md: "/am-i-the-next/{id}.md",
      kind: "evidence-gated-collection",
      count: indexableComparisons.length,
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

await emit(
  "_headers",
  [
    "/api/ai",
    "  Content-Type: application/json; charset=utf-8",
    "  X-Robots-Tag: noindex",
    "/llms.txt",
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
    "",
  ].join("\n"),
);

console.log(
  `Generated discovery surfaces: ${canonicalRoutes.length} canonical URLs, ${people.length + indexableComparisons.length + coreSurfaces.length} Markdown mirrors, ${indexableComparisons.length} indexable comparisons`,
);
