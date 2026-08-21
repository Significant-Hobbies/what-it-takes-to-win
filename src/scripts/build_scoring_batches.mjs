import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const needsLLM = JSON.parse(readFileSync(join(root, "artifacts", "needs-llm-scoring.json"), "utf8"));
const peopleCsv = readFileSync(join(root, "src", "data", "people.csv"), "utf8");

// Parse CSV to get full records for people needing LLM scoring
const lines = peopleCsv.split("\n").filter(l => l.length > 0);
const headers = parseCsvLine(lines[0]);
const allRecords = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  const record = {};
  for (let j = 0; j < headers.length && j < row.length; j++) {
    record[headers[j]] = row[j];
  }
  allRecords.push(record);
}

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

// Build a lookup
const recordMap = new Map();
for (const r of allRecords) {
  recordMap.set(r.person_id, r);
}

// Build batches of 50 people each
const batchSize = 50;
const batches = [];
for (let i = 0; i < needsLLM.length; i += batchSize) {
  const batch = needsLLM.slice(i, i + batchSize);
  const batchData = batch.map(item => {
    const r = recordMap.get(item.person_id);
    if (!r) return null;
    return {
      person_id: r.person_id,
      name: r.name,
      category: r.category || "",
      birth_year: r.birth_year || "",
      milestone_by_age_26: (r.milestone_by_age_26 || "").substring(0, 200),
      early_history_summary: (r.early_history_summary || "").substring(0, 300),
      evidence_summary: (r.evidence_summary || "").substring(0, 300),
      primary_early_advantage_archetype: r.primary_early_advantage_archetype || "",
      primary_early_advantage_tags: r.primary_early_advantage_tags || "",
      heuristic_innate: item.heuristic_innate,
      heuristic_parents: item.heuristic_parents,
      heuristic_peers: item.heuristic_peers,
    };
  }).filter(Boolean);
  batches.push(batchData);
}

// Write batch files
const batchDir = join(root, "artifacts", "scoring-batches");
mkdirSync(batchDir, { recursive: true });

for (let i = 0; i < batches.length; i++) {
  const num = String(i + 1).padStart(3, "0");
  writeFileSync(join(batchDir, `batch_${num}.json`), JSON.stringify(batches[i], null, 2));
}

console.log(`Created ${batches.length} batch files with ${needsLLM.length} people total`);
console.log(`Batch size: ${batchSize}`);
