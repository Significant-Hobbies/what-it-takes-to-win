import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync } from "node:fs";

const root = process.cwd();
const csvPath = join(root, "src", "data", "people.csv");

// Load CSV
const existingCsv = readFileSync(csvPath, "utf8");
const existingLines = existingCsv.split("\n").filter(l => l.length > 0);
const headers = existingLines[0].split(",");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { result.push(current); current = ""; }
      else { current += char; }
    }
  }
  result.push(current);
  return result;
}

function escapeCsv(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const records = [];
for (let i = 1; i < existingLines.length; i++) {
  const row = parseCsvLine(existingLines[i]);
  const record = {};
  for (let j = 0; j < headers.length && j < row.length; j++) {
    record[headers[j]] = row[j];
  }
  records.push(record);
}

console.log(`Loaded ${records.length} records from CSV`);

// Load all scoring results
const scoringFiles = readdirSync(join(root, "artifacts", "scoring-results")).filter(f => f.endsWith(".json"));
const scores = new Map();

for (const f of scoringFiles) {
  const data = JSON.parse(readFileSync(join(root, "artifacts", "scoring-results", f), "utf8"));
  for (const s of data) {
    if (s.person_id) {
      scores.set(s.person_id, s);
    }
  }
}

console.log(`Loaded ${scores.size} scoring records`);

// Apply scores to CSV records
const scoreFields = [
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
  "total_leverage_score",
];

const summaryFields = [
  "family_context_summary",
  "parent_family_domain_summary",
  "evidence_summary",
  "primary_early_advantage_archetype",
  "primary_early_advantage_tags",
  "leverage_evidence_confidence",
];

let applied = 0;
let notFound = 0;

for (const r of records) {
  const s = scores.get(r.person_id);
  if (s) {
    for (const f of scoreFields) {
      if (s[f] !== undefined && s[f] !== null) {
        r[f] = String(s[f]);
      }
    }
    for (const f of summaryFields) {
      if (s[f]) {
        r[f] = String(s[f]);
      }
    }
    // Update annotation status to reflect scoring
    if (r.annotation_status === "founder_research_beta") {
      r.annotation_status = "founder_scored_beta";
    }
    applied++;
  } else {
    notFound++;
  }
}

console.log(`Applied scores to ${applied} records`);
console.log(`No scores found for ${notFound} records`);

// Write updated CSV
const csvLines = [headers.join(",")];
for (const r of records) {
  const row = headers.map(h => escapeCsv(r[h] || ""));
  csvLines.push(row.join(","));
}

writeFileSync(csvPath, csvLines.join("\n") + "\n");
console.log(`Wrote ${records.length} records to CSV`);
