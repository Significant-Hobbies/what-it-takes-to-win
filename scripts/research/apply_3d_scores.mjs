import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync, existsSync } from "node:fs";

const root = process.cwd();
const csvPath = join(root, "src", "data", "people.csv");

// Load all LLM scoring results
// Load rescore batches last so they override original batches
const scoringDir = join(root, "artifacts", "scoring-results");
const llmScores = new Map();
if (existsSync(scoringDir)) {
  const files = readdirSync(scoringDir).filter(f => f.endsWith(".json"));
  // Sort: original batches first, rescore batches last
  files.sort((a, b) => {
    const aRescore = a.startsWith("rescore_");
    const bRescore = b.startsWith("rescore_");
    if (aRescore && !bRescore) return 1;
    if (!aRescore && bRescore) return -1;
    return a.localeCompare(b);
  });
  for (const f of files) {
    try {
      const data = JSON.parse(readFileSync(join(scoringDir, f), "utf8"));
      for (const s of data) {
        llmScores.set(s.person_id, s);
      }
    } catch (e) {
      console.error(`Error reading ${f}: ${e.message}`);
    }
  }
}
console.log(`Loaded ${llmScores.size} LLM scores`);

// Load heuristic scores
const heuristicPath = join(root, "artifacts", "heuristic-scores.json");
const heuristicScores = JSON.parse(readFileSync(heuristicPath, "utf8"));
const heuristicMap = new Map();
for (const s of heuristicScores) {
  heuristicMap.set(s.person_id, s);
}
console.log(`Loaded ${heuristicMap.size} heuristic scores`);

// Parse CSV properly (handle quoted fields with commas and newlines)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += char; i++; continue;
    }
    if (char === '"') { inQuotes = true; i++; continue; }
    if (char === ',') { row.push(field); field = ""; i++; continue; }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = ""; i++; continue;
    }
    field += char; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function escapeCsv(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

// Load CSV
const csvText = readFileSync(csvPath, "utf8");
const csvRows = parseCSV(csvText);
const headers = csvRows[0];
const records = [];
for (let i = 1; i < csvRows.length; i++) {
  if (csvRows[i].length === 1 && csvRows[i][0] === "") continue; // skip empty lines
  const record = {};
  for (let j = 0; j < headers.length; j++) {
    record[headers[j]] = csvRows[i][j] || "";
  }
  records.push(record);
}
console.log(`Loaded ${records.length} records from CSV`);

// Add new columns if they don't exist
const newCols = [
  "personal_endowment_score",
  "inherited_leverage_score",
  "catalytic_ecosystem_score",
  "endowment_summary",
  "inherited_summary",
  "ecosystem_summary",
  "scoring_confidence",
];
for (const col of newCols) {
  if (!headers.includes(col)) {
    headers.push(col);
  }
}

// Apply scores
let llmApplied = 0;
let heuristicApplied = 0;
for (const r of records) {
  const llm = llmScores.get(r.person_id);
  if (llm) {
    r.personal_endowment_score = String(llm.personal_endowment_score ?? "");
    r.inherited_leverage_score = String(llm.inherited_leverage_score ?? "");
    r.catalytic_ecosystem_score = String(llm.catalytic_ecosystem_score ?? "");
    r.endowment_summary = llm.endowment_summary || "";
    r.inherited_summary = llm.inherited_summary || "";
    r.ecosystem_summary = llm.ecosystem_summary || "";
    r.scoring_confidence = llm.scoring_confidence || "Medium";
    llmApplied++;
  } else {
    const h = heuristicMap.get(r.person_id);
    if (h) {
      r.personal_endowment_score = String(h.personal_endowment_score);
      r.inherited_leverage_score = String(h.inherited_leverage_score);
      r.catalytic_ecosystem_score = String(h.catalytic_ecosystem_score);
      r.endowment_summary = h.endowment_summary || "";
      r.inherited_summary = h.inherited_summary || "";
      r.ecosystem_summary = h.ecosystem_summary || "";
      r.scoring_confidence = h.scoring_confidence || "Low";
      heuristicApplied++;
    }
  }
}

console.log(`LLM scores applied: ${llmApplied}`);
console.log(`Heuristic scores applied: ${heuristicApplied}`);

// Write CSV
const csvLines = [headers.map(escapeCsv).join(",")];
for (const r of records) {
  csvLines.push(headers.map(h => escapeCsv(r[h] || "")).join(","));
}
writeFileSync(csvPath, csvLines.join("\n") + "\n");
console.log(`\nWrote ${records.length} records to people.csv with ${headers.length} columns`);
