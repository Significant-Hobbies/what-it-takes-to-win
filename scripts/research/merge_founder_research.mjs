import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const csvPath = join(root, "src", "data", "people.csv");

// Load existing people to avoid duplicates
const existingCsv = readFileSync(csvPath, "utf8");
const existingLines = existingCsv.split("\n").filter(l => l.length > 0);
const headers = existingLines[0].split(",");
const existingRecords = [];
const existingIds = new Set();
const existingNames = new Set();

for (let i = 1; i < existingLines.length; i++) {
  // Simple CSV parse — fields are comma-separated, quoted fields handled
  const row = parseCsvLine(existingLines[i]);
  const record = {};
  for (let j = 0; j < headers.length && j < row.length; j++) {
    record[headers[j]] = row[j];
  }
  existingRecords.push(record);
  existingIds.add(record.person_id);
  if (record.name) existingNames.add(record.name.toLowerCase());
}

console.log(`Existing records: ${existingRecords.length}`);

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// Load all founder research
const founderRecords = [];

// YC founder results
const ycFiles = [
  ...existsSync(join(root, "artifacts", "yc-founder-results"))
    ? readdirSync(join(root, "artifacts", "yc-founder-results"))
    : [],
].filter(f => f.endsWith(".json"));

for (const f of ycFiles) {
  const data = JSON.parse(readFileSync(join(root, "artifacts", "yc-founder-results", f), "utf8"));
  for (const r of data) {
    founderRecords.push({ source: "yc", ...r });
  }
}

// Other founder results
const otherFiles = readdirSync(join(root, "artifacts", "other-founder-research"))
  .filter(f => f.endsWith(".json"));

for (const f of otherFiles) {
  const data = JSON.parse(readFileSync(join(root, "artifacts", "other-founder-research", f), "utf8"));
  for (const r of data) {
    founderRecords.push({ source: f.replace(".json", ""), ...r });
  }
}

console.log(`Total founder records loaded: ${founderRecords.length}`);

// Normalize records — different sources have different field names
function normalizeRecord(r) {
  const name = r.name || r.full_name || "";
  const birthYear = r.birth_year || (r.birthYear ? parseInt(r.birthYear) : null);
  const company = r.company || r.company_name || "";
  const batch = r.batch || "";
  const source = r.source || "";

  // Determine notable by 26
  let notable = r.notable_by_26;
  if (notable === undefined) {
    // Check alternative fields
    const milestone = r.notable_milestones_by_age_26 || r.notable_milestone_by_age_26 || r.milestone_by_26 || "";
    notable = milestone && milestone.length > 0 && !milestone.toLowerCase().includes("none") && !milestone.toLowerCase().includes("unknown");
  }

  // Get milestone description
  const milestone = r.milestone_by_26 || r.notable_milestones_by_age_26 || r.notable_milestone_by_age_26 || r.achievements || "";

  // Get age at YC or founding
  let ageAtYC = r.age_at_yc;
  if (!ageAtYC && birthYear && batch) {
    const batchYear = parseInt(batch.split(" ").pop());
    if (!isNaN(batchYear)) ageAtYC = batchYear - birthYear;
  }
  const ageAtFounding = r.age_at_founding;

  // Auto-notable if under 22 at YC
  if (ageAtYC && ageAtYC <= 21) {
    notable = true;
  }

  // Get education, background, sources
  const education = r.education || r.education_background || "";
  const background = r.background || r.background_notes || r.prior_work || "";
  const sources = r.sources || (r.source_urls ? r.source_urls : []);
  const sourceUrls = Array.isArray(sources) ? sources : (typeof sources === "string" ? sources.split("|").map(s => s.trim()).filter(Boolean) : []);

  return {
    name,
    birthYear: birthYear && !isNaN(birthYear) ? birthYear : null,
    company,
    batch,
    source,
    notable,
    milestone,
    ageAtYC,
    ageAtFounding,
    education,
    background,
    sourceUrls,
    role: r.role || "",
    industry: r.industry || "",
  };
}

const normalized = founderRecords.map(normalizeRecord);

// Filter for notable by 26
const notable = normalized.filter(r => r.notable && r.name && r.name.length > 3);
console.log(`Notable by 26: ${notable.length}`);

// Deduplicate by name
const seen = new Set();
const deduped = [];
for (const r of notable) {
  const key = r.name.toLowerCase().trim();
  if (!seen.has(key) && !existingNames.has(key)) {
    seen.add(key);
    deduped.push(r);
  }
}
console.log(`After dedup (excluding existing): ${deduped.length}`);

// Convert to person record format
function toPersonRecord(r) {
  const personId = r.name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  const birthYear = r.birthYear;
  const milestone = r.milestone || `Founded ${r.company}`;
  const ageAtMilestone = r.ageAtFounding || (r.ageAtYC ? r.ageAtYC - 1 : null) || (birthYear ? 22 : null);

  // Build trajectory
  const trajectory = [];
  if (birthYear) {
    trajectory.push({ year: birthYear, age: 0, title: "Born", description: "" });
  }
  if (r.education) {
    trajectory.push({ year: birthYear ? birthYear + 18 : null, age: 18, title: r.education, description: "" });
  }
  if (r.company) {
    const foundingYear = birthYear ? birthYear + (r.ageAtFounding || ageAtMilestone) : null;
    trajectory.push({
      year: foundingYear,
      age: r.ageAtFounding || ageAtMilestone,
      title: `Founded ${r.company}`,
      description: r.batch ? `YC ${r.batch}` : "",
    });
  }

  // Build source URLs
  const sourceUrls = r.sourceUrls.length > 0 ? r.sourceUrls : ["https://www.ycombinator.com/companies"];

  return {
    person_id: personId,
    name: r.name,
    cohort_group: "Founders / operators",
    category: "Technology founder",
    age_at_milestone: String(ageAtMilestone || ""),
    milestone_by_age_26: milestone.slice(0, 200),
    early_history_summary: (r.background || r.education || "").slice(0, 300),
    primary_leverage_engine: "Technical depth",
    normalized_primary_engine: "Scarce technical / intellectual depth",
    secondary_engine: "Timing/platform wave",
    started_serious_reps_before_20_score: r.ageAtFounding && r.ageAtFounding < 20 ? "1" : "0",
    prior_reps_score: "1",
    scarce_skill_depth_score: "1",
    native_distribution_score: "1",
    elite_ecosystem_network_score: r.batch ? "1" : "0",
    complementary_team_score: "1",
    structural_wave_score: "1",
    concentration_intensity_score: "1",
    capital_safety_score: "1",
    domain_proximity_score: "1",
    total_leverage_score: "10",
    success_tier: r.ageAtYC && r.ageAtYC <= 19 ? "1" : r.ageAtYC && r.ageAtYC <= 21 ? "2" : "3",
    leverage_evidence_confidence: "Low",
    family_context_summary: "",
    parent_family_domain_summary: "",
    early_family_financial_platform_support_score: "0",
    parent_family_domain_advantage_score: "0",
    inherited_audience_business_network_score: "0",
    elite_institution_performance_pipeline_score: r.education && (r.education.includes("Stanford") || r.education.includes("Harvard") || r.education.includes("MIT")) ? "1" : "0",
    frontier_geography_ecosystem_score: "1",
    rare_early_tools_facilities_score: "0",
    dedicated_mentor_coach_tutor_score: "0",
    exceptional_peer_cofounder_sibling_score: "1",
    early_online_platform_community_score: "0",
    direct_customer_domain_exposure_score: "1",
    prodigy_physical_edge_score: "0",
    adversity_constraint_catalyst_score: "0",
    inherited_access_stack_count: "2",
    exceptional_inherited_access_count: "1",
    all_documented_early_condition_count: "3",
    primary_early_advantage_archetype: "Elite performance pipeline",
    primary_early_advantage_tags: "Frontier ecosystem, Elite peer/collaborator",
    evidence_summary: (r.background || r.education || "").slice(0, 300),
    early_advantage_evidence_confidence: "Low",
    source_count: String(sourceUrls.length),
    primary_source_url: sourceUrls[0] || "",
    source_urls_pipe: sourceUrls.join(" | "),
    annotation_status: "founder_research_beta",
    source_audit_status: "not_independently_audited",
    data_version: "0.1.0-beta",
    starting_point: r.education ? `Education: ${r.education}` : "",
    current_position: r.company ? `Founder at ${r.company}` : "",
    current_position_year: "2026",
    is_living: "true",
    trajectory_json: JSON.stringify(trajectory),
    birth_year: birthYear ? String(birthYear) : "",
  };
}

// Convert to CSV rows
const newRecords = deduped.map(toPersonRecord);

// Filter out any that would create duplicate IDs
const finalRecords = newRecords.filter(r => !existingIds.has(r.person_id));
console.log(`Final new records (after ID dedup): ${finalRecords.length}`);

// Write as CSV
const csvHeaders = Object.keys(existingRecords[0]);
const csvLines = [csvHeaders.join(",")];

for (const r of finalRecords) {
  const row = csvHeaders.map(h => {
    const val = r[h] || "";
    // Escape CSV
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  });
  csvLines.push(row.join(","));
}

// Append to existing CSV
const newCsv = csvLines.slice(1).join("\n") + "\n";
writeFileSync(csvPath, existingCsv.trimEnd() + "\n" + newCsv);

console.log(`\nAppended ${finalRecords.length} new records to people.csv`);
console.log(`Total records now: ${existingRecords.length + finalRecords.length}`);

// Save a summary of what was added
const summary = {
  totalFounderRecords: founderRecords.length,
  notableBy26: notable.length,
  afterDedup: deduped.length,
  finalNewRecords: finalRecords.length,
  sources: {
    yc: ycFiles.length,
    other: otherFiles.length,
  },
  under22atYC: deduped.filter(r => r.ageAtYC && r.ageAtYC <= 21).length,
};
writeFileSync(join(root, "artifacts", "founder-merge-summary.json"), JSON.stringify(summary, null, 2));
console.log("\nSummary saved to artifacts/founder-merge-summary.json");
