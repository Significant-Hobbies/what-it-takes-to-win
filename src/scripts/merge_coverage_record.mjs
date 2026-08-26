import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { evaluateCandidateGates, parseCsv } from "../lib/candidate-coverage.mjs";

const root = process.cwd();
const inputPath = process.argv[2];
if (!inputPath) throw new Error("Usage: node src/scripts/merge_coverage_record.mjs <record.json>");

const csvPath = path.join(root, "src", "data", "people.csv");
const csvText = await readFile(csvPath, "utf8");
const [headerLine] = csvText.split("\n");
const headers = parseCsv(`${headerLine}\n${headerLine}\n`)[0];
const fieldNames = Object.keys(headers);
const existing = parseCsv(csvText);
const record = JSON.parse(await readFile(path.resolve(root, inputPath), "utf8"));
const [gateRegistry, signals, sourceRegistry] = await Promise.all([
  readFile(path.join(root, "data/research/coverage/gate-registry.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "data/research/coverage/signals.json"), "utf8").then(JSON.parse),
  readFile(path.join(root, "data/research/coverage/source-registry.json"), "utf8").then(JSON.parse),
]);
const signal = signals.find((candidate) => candidate.signal_id === record.coverage_signal_id);
if (!signal) {
  throw new Error(`${record.person_id}: coverage_signal_id does not match a registered signal`);
}
const gateVerdict = evaluateCandidateGates(
  signal,
  record,
  gateRegistry,
  sourceRegistry.as_of,
);
if (!gateVerdict.publication.pass) {
  throw new Error(
    `${record.person_id}: publication gate ${gateRegistry.version} failed: ${gateVerdict.publication.reasons.join(", ")}`,
  );
}

if (existing.some((person) => person.person_id === record.person_id)) {
  console.log(`${record.person_id} already exists; publication gate reproduced; no change`);
  process.exit(0);
}
const urls = record.source_urls || [];

const derived = {
  ...record,
  source_urls_pipe: urls.join(" | "),
  trajectory_json: JSON.stringify(record.trajectory || []),
  is_living: record.is_living === true ? "true" : record.is_living === false ? "false" : "",
};

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const row = fieldNames.map((field) => escapeCsv(derived[field])).join(",");
await appendFile(csvPath, `${csvText.endsWith("\n") ? "" : "\n"}${row}\n`);
console.log(`Appended ${record.person_id} to src/data/people.csv`);
