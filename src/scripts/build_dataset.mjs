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

// Compute birth_year, normalize categories, filter to born >= 1950
function normalizeCategory(cat) {
  if (!cat) return "Other";
  const c = cat.toLowerCase();
  if (/(soccer|footballer|football \(soccer\)|football \(soccer\) player)/.test(c)) return "Soccer";
  if (/tennis/.test(c)) return "Tennis";
  if (/chess/.test(c)) return "Chess";
  if (/(racing driver|formula one|formula 1|rally|motorsport|motorcycle|grand prix)/.test(c)) return "Motorsport";
  if (/gymnast/.test(c)) return "Gymnastics";
  if (/(swimmer|swimming)/.test(c)) return "Other Sports";
  if (/(boxer|boxing)/.test(c)) return "Boxing";
  if (/(fencer|fencing)/.test(c)) return "Fencing";
  if (/(cyclist|cycling|bicycle)/.test(c)) return "Cycling";
  if (/(ski|snowboard)/.test(c)) return "Other Sports";
  if (/(skater|skating|figure skate)/.test(c)) return "Other Sports";
  if (/basketball/.test(c)) return "Basketball";
  if (/(ice hockey|hockey)/.test(c)) return "Hockey";
  if (/golf/.test(c)) return "Other Sports";
  if (/handball/.test(c)) return "Handball";
  if (/volleyball/.test(c)) return "Other Sports";
  if (/badminton/.test(c)) return "Other Sports";
  if (/cricket/.test(c)) return "Other Sports";
  if (/(martial|mma|judo|karate|taekwondo|wrestler|wrestling|kickbox)/.test(c)) return "Combat Sports";
  if (/(runner|running|sprint|marathon|track|javelin|jump|throw|triple|hammer|hurdle|pentathlon|decathlon)/.test(c)) return "Other Sports";
  if (/(weightlift|bodybuild|powerlift)/.test(c)) return "Other Sports";
  if (/(rower|rowing)/.test(c)) return "Other Sports";
  if (/(mountain|climb|alpinist|explorer)/.test(c)) return "Other Sports";
  if (/baseball/.test(c)) return "Other Sports";
  if (/(singer|songwriter|musician|rapper|composer|conductor|pianist|guitarist|drummer|cellist|violinist|opera|dj |music|band|vocalist|reggae|blues|jazz|folk|disco|soul|gospel|qawwali|fado|sitar|sarangi|rock|pop)/.test(c)) return "Music";
  if (/(actor|actress|film |director|screenwriter|television|tv |comedian|theater|theatre|stage|performer|illusionist|magician)/.test(c)) return "Film/TV/Entertainment";
  if (/(artist|painter|sculptor|architect|designer|fashion|model|photographer|photojournalist|comic|manga|illustrator|visual)/.test(c)) return "Art/Design";
  if (/(writer|novelist|poet|author|playwright|journalist|blogger|essayist|semiotician)/.test(c)) return "Writing";
  if (/(founder|entrepreneur|startup|ceo|cto|executive|business|commerce|investor|venture|magnate|industrialist|financier|banker|trade)/.test(c)) return "Founder/Entrepreneur";
  if (/(software|programmer|developer|engineer|computer|open-source|open source|linux|git|web|javascript|python|php|compiler|systems|crypto|blockchain|database|ai |ai researcher|ml |machine learning|deep learning|nlp|algorithm|security|hacker|network|protocol|browser|app|frontend|backend|infrastructure|docker|cloud|devops|coding|tech)/.test(c)) return "Software/Tech";
  if (/(mathematician|physicist|scientist|researcher|chemist|biologist|astronomer|astrophysicist|neurosci|molecular|planetary|sociologist|economist|logician|cybernetics|statistician|game theorist|computational|astronaut|cosmonaut|aerospace|space)/.test(c)) return "Science/Research";
  if (/(esports|gaming|gamer|streamer|twitch|youtube|content creator|youtuber|tiktok|vine|podcast|media|influencer|digital creator|beauty|minecraft|fortnite|dota|league of legends|valorant|csgo|cs2|rocket league|smash bros|starcraft|gaming content)/.test(c)) return "Content/Esports";
  if (/(game designer|game developer|game programmer|video game|game engine|indie game|game industry)/.test(c)) return "Game Design";
  if (/(military|politician|political|police|general|officer|revolutionary|activist|social activist|religious|mafia|government|diplomat|jurist|referee)/.test(c)) return "Other";
  return "Other";
}

function estimateBirthYear(p) {
  // Method 1: trajectory first entry year - age_at_milestone
  if (p.trajectory && p.trajectory.length > 0 && p.trajectory[0].year) {
    return p.trajectory[0].year - (p.age_at_milestone || 26);
  }
  // Method 2: milestone text year - age_at_milestone
  // Only match years up to current year to avoid matching game names like "2048"
  const m = p.milestone_by_age_26 || "";
  const found = m.match(/\b(18\d{2}|19\d{2}|20[0-2]\d)\b/);
  if (found && p.age_at_milestone) {
    return parseInt(found[0]) - p.age_at_milestone;
  }
  // Method 3: starting_point year
  const sp = p.starting_point || "";
  const spFound = sp.match(/\b(18\d{2}|19\d{2}|20[0-2]\d)\b/);
  if (spFound && p.age_at_milestone) {
    return parseInt(spFound[0]) - p.age_at_milestone;
  }
  return null;
}

const withBirthYear = out.map((p) => {
  const by = estimateBirthYear(p);
  return { ...p, birth_year: by, category: normalizeCategory(p.category) };
});

// Filter to born >= 1950
const filtered = withBirthYear.filter((p) => p.birth_year && p.birth_year >= 1950);

writeFileSync(join(root, "src", "data", "people.json"), JSON.stringify(filtered));
console.log(`Wrote ${filtered.length} people to src/data/people.json (born >= 1950, from ${withBirthYear.length} total)`);
