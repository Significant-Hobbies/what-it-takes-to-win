// Regenerate the dataset figures quoted in README.md and PROJECT_STATUS.md
// from the published dataset itself.
//
// These numbers drifted badly once: the docs advertised 2,770 paths with 100%
// trajectory coverage while the dataset held 3,577 at 92%. The site never lied,
// because its denominators are build-derived — only the prose did. This script
// puts the prose on the same footing.
//
//   node src/scripts/sync_dataset_stats.mjs          # rewrite the blocks
//   node src/scripts/sync_dataset_stats.mjs --check  # fail if they are stale
//
// The --check form runs inside `pnpm run quality`, so a dataset change that
// leaves the docs behind fails the gate instead of shipping.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { root, people, comparisonIsIndexable } from "../lib/discovery.mjs";

const checkOnly = process.argv.includes("--check");

const AUDIT_VERDICTS = new Set([
  "source_verified",
  "partial_source_verification",
  "source_verification_failed",
]);

const count = (predicate) => people.filter(predicate).length;
const share = (value) => `${((value / people.length) * 100).toFixed(1)}%`;
const number = (value) => value.toLocaleString("en-US");

const tally = (accessor) => {
  const groups = new Map();
  for (const person of people) {
    const key = accessor(person);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups.entries()].sort((a, b) => b[1] - a[1]);
};

const sourceDomains = (person) =>
  new Set(
    (Array.isArray(person.source_urls) ? person.source_urls : [])
      .map((source) => {
        try {
          return new URL(source).hostname.replace(/^www\./, "");
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  ).size;

const total = people.length;
const trajectories = count(
  (person) => Array.isArray(person.trajectory) && person.trajectory.length >= 3,
);
const twoSources = count(
  (person) => Array.isArray(person.source_urls) && person.source_urls.length >= 2,
);
const twoDomains = count((person) => sourceDomains(person) >= 2);
const indexable = count(comparisonIsIndexable);
const auditReviewed = count((person) => AUDIT_VERDICTS.has(String(person.source_audit_status)));
const auditVerified = count((person) => person.source_audit_status === "source_verified");
const auditPartial = count(
  (person) => person.source_audit_status === "partial_source_verification",
);
const auditFailed = count(
  (person) => person.source_audit_status === "source_verification_failed",
);
const auditPending = total - auditReviewed;
const sourceUrls = people.reduce(
  (sum, person) => sum + (Array.isArray(person.source_urls) ? person.source_urls.length : 0),
  0,
);

// Condition factors run -1..3, where -1 is a documented headwind. Reporting the
// headwind share keeps the paths that began behind visible in the summary.
const CONDITION_FACTOR_FIELDS = [
  ["personal_endowment_score", "brought"],
  ["inherited_leverage_score", "handed"],
  ["catalytic_ecosystem_score", "surrounded"],
];
const conditionFactorLine = CONDITION_FACTOR_FIELDS.map(([field, label]) => {
  const scored = people.filter((person) => typeof person[field] === "number");
  const headwind = scored.filter((person) => person[field] < 0).length;
  return `${label} ${number(scored.length)} scored (${number(headwind)} headwind)`;
}).join(", ");

const reliability = JSON.parse(
  await readFile(path.join(root, "quality", "reliability", "secondary-coding-v1.json"), "utf8"),
);

// Mirrors audit_discovery.mjs: nine core surfaces, the essays index plus each
// published essay, one URL per person, and one per evidence-gated comparison.
const CORE_SURFACES = 9;
const ESSAY_URLS = 3;
const sitemapUrls = CORE_SURFACES + ESSAY_URLS + total + indexable;

const cohortLine = tally((person) => person.cohort_group)
  .map(([label, value]) => `${label} ${number(value)}`)
  .join(", ");
const tierLine = [1, 2, 3, 4]
  .map((tier) => `T${tier} ${number(count((person) => person.success_tier === tier))}`)
  .join(", ");
const provenanceLine = tally((person) => person.data_version)
  .map(([label, value]) => `${label} ${number(value)}`)
  .join(", ");

const summary = `A guided, evidence-led journey through ${number(total)} early-breakthrough paths: what
people brought, were handed, and were surrounded by, with perseverance, luck,
and the limits of comparison kept visible.`;

const statusSummary = `Guided explanatory journey through ${number(total)} early-breakthrough paths — how what
people brought, were handed, and were surrounded by interacted with
perseverance, sequence, and luck without becoming a causal formula, percentile,
or repeatable identity.`;

const stats = [
  `- **Total people:** ${number(total)} (born 1950+)`,
  `- **Cohort distribution:** ${cohortLine}`,
  `- **Tier distribution:** ${tierLine}`,
  `- **Record provenance:** ${provenanceLine}`,
  `- **Three-event trajectory coverage:** ${share(trajectories)} (${number(trajectories)}/${number(total)})`,
  `- **Two or more listed sources:** ${share(twoSources)} (${number(twoSources)}/${number(total)})`,
  `- **Two or more source domains:** ${share(twoDomains)} (${number(twoDomains)}/${number(total)})`,
  `- **Pass comparison/search evidence gate:** ${share(indexable)} (${number(indexable)}/${number(total)})`,
  `- **Condition factors (−1 to 3, never summed):** ${conditionFactorLine}`,
  `- **Listed source URLs:** ${number(sourceUrls)}`,
  `- **Canonical sitemap URLs:** ${number(sitemapUrls)}`,
  `- **Secondary double-coded records:** ${number(reliability.records.length)}`,
  `- **Source reachability audit:** ${number(auditReviewed)}/${number(total)} paths reviewed — ${number(auditVerified)} fully reachable, ${number(auditPartial)} partial, ${number(auditFailed)} failed. ${number(auditPending)} paths added since the last pass are unaudited.`,
  `- **Independent content audit:** pending; URL reachability does not verify claim support`,
].join("\n");

const GENERATED_NOTE =
  "<!-- Generated by src/scripts/sync_dataset_stats.mjs — run `pnpm run sync:stats` after a dataset change. -->";

function replaceBlock(text, name, body, filePath) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`${filePath} is missing the ${name} block markers`);
  }
  const before = text.slice(0, startIndex + start.length);
  const after = text.slice(endIndex);
  return `${before}\n${body}\n${after}`;
}

const targets = [
  {
    file: "README.md",
    blocks: [["dataset-summary", summary]],
  },
  {
    file: "PROJECT_STATUS.md",
    blocks: [
      ["dataset-summary", statusSummary],
      ["dataset-stats", `${GENERATED_NOTE}\n\n${stats}`],
    ],
  },
];

const stale = [];
for (const target of targets) {
  const filePath = path.join(root, target.file);
  const original = await readFile(filePath, "utf8");
  let updated = original;
  for (const [name, body] of target.blocks) {
    updated = replaceBlock(updated, name, body, target.file);
  }
  if (updated === original) continue;
  if (checkOnly) stale.push(target.file);
  else await writeFile(filePath, updated);
}

if (checkOnly) {
  if (stale.length > 0) {
    console.error(
      `Dataset stats are stale in ${stale.join(", ")}. Run \`pnpm run sync:stats\`.`,
    );
    process.exit(1);
  }
  console.log(`Dataset stats current for ${number(total)} paths.`);
} else {
  console.log(`Synced dataset stats for ${number(total)} paths.`);
}
