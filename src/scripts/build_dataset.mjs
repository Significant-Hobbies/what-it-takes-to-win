// Build a compact JSON dataset from people.csv for the visualization site.
// Outputs: src/data/people.json (array of normalized person objects)
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const csvText = readFileSync(join(root, "src", "data", "people.csv"), "utf8");

function parseCSV(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const [header, ...dataRows] = parseCSV(csvText);
const people = dataRows
  .filter((r) => r.length === header.length && r[0])
  .map((row) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });

const numericFields = [
  "age_at_milestone",
  "started_serious_reps_before_20_score",
  "prior_reps_score",
  "scarce_skill_depth_score",
  "native_distribution_score",
  "elite_ecosystem_network_score",
  "complementary_team_score",
  "structural_wave_score",
  "concentration_intensity_score",
  "capital_safety_score",
  "domain_proximity_score",
  "total_leverage_score",
  "success_tier",
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
  "inherited_access_stack_count",
  "exceptional_inherited_access_count",
  "all_documented_early_condition_count",
  "source_count",
  "current_position_year",
];

const out = people.map((p) => {
  const o = { ...p };
  for (const f of numericFields) {
    o[f] = o[f] === "" ? null : Number(o[f]);
  }
  o.source_urls = (o.source_urls_pipe || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  o.primary_early_advantage_tags_list = (o.primary_early_advantage_tags || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Parse trajectory_json -> trajectory array
  try {
    o.trajectory = o.trajectory_json ? JSON.parse(o.trajectory_json) : [];
  } catch {
    o.trajectory = [];
  }
  delete o.trajectory_json;
  // is_living string -> boolean
  if (o.is_living === "true") o.is_living = true;
  else if (o.is_living === "false") o.is_living = false;
  else o.is_living = null;
  delete o.source_urls_pipe;
  delete o.primary_early_advantage_tags;
  return o;
});

writeFileSync(join(root, "src", "data", "people.json"), JSON.stringify(out));
console.log(`Wrote ${out.length} people to src/data/people.json`);
