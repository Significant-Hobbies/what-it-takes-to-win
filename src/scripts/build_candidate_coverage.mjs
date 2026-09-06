import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  evaluateCandidateGates,
  normalizeEligibilityStatus,
  normalizePersonName,
  parseCsv,
  researchPriority,
  sourceFreshness,
  summarizeLedger,
} from "../lib/candidate-coverage.mjs";

const root = process.cwd();
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"));

async function loadResearchRecords(registry) {
  const records = [];
  for (const source of registry.research_sources) {
    const directory = path.join(root, source.path);
    const files = (await readdir(directory)).filter((file) =>
      source.format === "json" ? file.endsWith(".json") : file.endsWith(".jsonl"),
    );
    for (const file of files.sort()) {
      const text = await readFile(path.join(directory, file), "utf8");
      const parsed = source.format === "json"
        ? JSON.parse(text)
        : text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
      for (const record of parsed) {
        if (!record.name && !record.full_name) continue;
        records.push({ ...record, _research_source: source.id });
      }
    }
  }
  return records;
}

async function loadJsonDirectory(relativePath) {
  const directory = path.join(root, relativePath);
  const files = (await readdir(directory)).filter((file) => file.endsWith(".json"));
  return Promise.all(files.sort().map(async (file) =>
    JSON.parse(await readFile(path.join(directory, file), "utf8")),
  ));
}

function fieldFor(candidate, sourceId) {
  const text = `${candidate.cohort_group || ""} ${candidate.category || ""} ${candidate.occupation || ""}`.toLowerCase();
  if (/athlet|sport|player|swim|tennis|boxing|football|soccer|gymnast/.test(text)) return "Athletes";
  if (/creator|artist|music|actor|writer|youtube|tiktok|film/.test(text)) return "Creators / artists";
  if (/research|scient|engineer|software|computer|math/.test(text)) return "Researchers / independent engineers";
  if (/founder|operator|entrepreneur|business/.test(text) || sourceId.includes("yc") || sourceId.includes("founder")) {
    return "Founders / operators";
  }
  return "Other documented fields";
}

const registry = await readJson("data/research/coverage/source-registry.json");
const gateRegistry = await readJson("data/research/coverage/gate-registry.json");
const signals = await readJson("data/research/coverage/signals.json");
const goldSet = await readJson("data/research/coverage/gold-set.json");
const coverageResults = await loadJsonDirectory("data/research/coverage-results");
const coverageResultsBySignal = new Map(
  coverageResults.map((record) => [record.coverage_signal_id, record]),
);
const gateErrors = [];
const publishedRecords = await readJson("src/data/people.json");
const publishedIds = new Set(publishedRecords.map((record) => record.person_id));
const managedIds = new Set(coverageResults.map((record) => record.person_id));
const legacyIds = publishedRecords
  .filter((record) => !managedIds.has(record.person_id))
  .map((record) => record.person_id)
  .sort();
const legacyIdentityHash = createHash("sha256")
  .update(`${legacyIds.join("\n")}\n`)
  .digest("hex");
if (
  legacyIds.length !== gateRegistry.publication.legacy_baseline.people
  || legacyIdentityHash !== gateRegistry.publication.legacy_baseline.identity_sha256
) {
  gateErrors.push(
    `published identity set changed outside gate-managed coverage results (expected ${gateRegistry.publication.legacy_baseline.people}/${gateRegistry.publication.legacy_baseline.identity_sha256}, received ${legacyIds.length}/${legacyIdentityHash})`,
  );
}
for (const record of coverageResults) {
  if (!publishedIds.has(record.person_id)) {
    gateErrors.push(`${record.person_id}: coverage result is not present in the published corpus`);
  }
}
const researchRecords = await loadResearchRecords(registry);
const researchByName = new Map();
for (const record of researchRecords) {
  researchByName.set(normalizePersonName(record.name || record.full_name), record);
}

const ledger = new Map();

function candidateIdentityKey(candidate, source, normalizedName) {
  const existing = ledger.get(normalizedName);
  const publishedCollision = source.kind === "published"
    && existing?.state === "published"
    && existing.source_records.some((entry) =>
      entry.candidate_id && entry.candidate_id !== candidate.person_id,
    );
  return publishedCollision ? `${normalizedName}::${candidate.person_id}` : normalizedName;
}

function newCandidateRecord(candidate, source, identityKey, name) {
  return {
    identity_key: identityKey,
    name,
    aliases: [],
    source_ids: [],
    source_records: [],
    signals: [],
    field: fieldFor(candidate, source.id),
    state: "discovered",
  };
}

function mergeCandidateMetadata(current, candidate, source) {
  if (!current.source_ids.includes(source.id)) current.source_ids.push(source.id);
  current.source_records.push({
    source_id: source.id,
    candidate_id: candidate.candidate_id || candidate.person_id || candidate.slug || "",
    batch: candidate.batch || "",
  });
  current.batch ||= candidate.batch || "";
  current.birth_year ||= Number(candidate.birth_year) || null;
  if (current.field === "Other documented fields") current.field = fieldFor(candidate, source.id);
}

function ensureCandidate(candidate, source) {
  const name = candidate.name || candidate.full_name;
  const normalizedName = normalizePersonName(name);
  if (!normalizedName) return;
  const identityKey = candidateIdentityKey(candidate, source, normalizedName);
  const current = ledger.get(identityKey)
    || newCandidateRecord(candidate, source, identityKey, name);
  mergeCandidateMetadata(current, candidate, source);
  ledger.set(identityKey, current);
  return current;
}

for (const source of registry.sources) {
  if (source.kind === "candidate-json" || source.kind === "published") {
    const candidates = await readJson(source.path);
    for (const candidate of candidates) {
      const record = ensureCandidate(candidate, source);
      if (record && source.kind === "published") record.state = "published";
    }
  } else if (source.kind === "candidate-csv") {
    const candidates = parseCsv(await readFile(path.join(root, source.path), "utf8"));
    for (const candidate of candidates) ensureCandidate(candidate, source);
  }
}

for (const [identityKey, research] of researchByName) {
  const record = ledger.get(identityKey);
  if (!record || record.state === "published") continue;
  record.state = normalizeEligibilityStatus(research);
  record.research_source = research._research_source;
}

const gateVerdictsBySignal = new Map();
for (const signal of signals) {
  const publicationRecord = coverageResultsBySignal.get(signal.signal_id);
  const gateVerdict = evaluateCandidateGates(
    signal,
    publicationRecord,
    gateRegistry,
    registry.as_of,
  );
  gateVerdictsBySignal.set(signal.signal_id, gateVerdict);
  const gatedSignal = { ...signal, gate_verdict: gateVerdict };
  const identityKey = normalizePersonName(signal.person_name);
  const record = ledger.get(identityKey) || ensureCandidate(
    { name: signal.person_name, cohort_group: signal.field },
    { id: "event-signals" },
  );
  record.signals.push(gatedSignal);
  record.gates = gateVerdict;
  record.aliases = [...new Set([...record.aliases, ...(signal.aliases || [])])];
  record.field = signal.field || record.field;
  record.age_at_latest_signal = signal.age_at_event;
  record.age_confidence = signal.age_confidence;
  if (record.state !== "published") {
    record.state = gateVerdict.research.pass ? "eligible" : "queued";
  }
  if (publicationRecord && !gateVerdict.publication.pass) {
    gateErrors.push(`${publicationRecord.person_id}: ${gateVerdict.publication.reasons.join(", ")}`);
  }
}

for (const record of coverageResults) {
  if (!record.coverage_signal_id || !signals.some((signal) =>
    signal.signal_id === record.coverage_signal_id,
  )) {
    gateErrors.push(`${record.person_id}: missing matching coverage signal`);
  }
}

if (gateErrors.length > 0) {
  throw new Error(`Coverage publication gate failed:\n${gateErrors.join("\n")}`);
}

const batchStats = new Map();
for (const record of ledger.values()) {
  if (!record.batch) continue;
  const stats = batchStats.get(record.batch) || { discovered: 0, researched: 0 };
  stats.discovered += 1;
  if (!["discovered", "queued"].includes(record.state)) stats.researched += 1;
  batchStats.set(record.batch, stats);
}

const records = [...ledger.values()].map((record) => {
  if (record.state === "discovered") record.state = "queued";
  record.source_ids.sort();
  record.priority = researchPriority(record, batchStats);
  return record;
}).sort((left, right) => right.priority - left.priority || left.name.localeCompare(right.name));

const sourceCoverage = registry.sources.map((source) => {
  const freshness = sourceFreshness(source, registry.as_of);
  return {
    id: source.id,
    label: source.label,
    candidates: records.filter((record) => record.source_ids.includes(source.id)).length,
    snapshot_date: source.snapshot_date,
    ...freshness,
  };
});
const summary = {
  as_of: registry.as_of,
  objective: "uncapped_public_evidence_coverage",
  target_age_max: 30,
  birth_year_min: 1950,
  gate_registry: {
    version: gateRegistry.version,
    calibration_status: gateRegistry.calibration_status,
  },
  gate_funnel: {
    signals: signals.length,
    discovery_passed: signals.filter((signal) =>
      gateVerdictsBySignal.get(signal.signal_id).discovery.pass,
    ).length,
    research_passed: signals.filter((signal) =>
      gateVerdictsBySignal.get(signal.signal_id).research.pass,
    ).length,
    publication_passed: signals.filter((signal) =>
      gateVerdictsBySignal.get(signal.signal_id).publication.pass,
    ).length,
  },
  ...summarizeLedger(records, sourceCoverage, goldSet),
};

await mkdir(path.join(root, "artifacts", "coverage"), { recursive: true });
await writeFile(
  path.join(root, "artifacts", "coverage", "candidate-ledger.jsonl"),
  `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
);
await writeFile(
  path.join(root, "artifacts", "coverage", "research-priority.json"),
  `${JSON.stringify(records.filter((record) => record.priority > 0).slice(0, 500), null, 2)}\n`,
);
await writeFile(
  path.join(root, "src", "data", "candidate-coverage.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
await writeFile(
  path.join(root, "public", "data", "candidate-coverage.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(JSON.stringify({
  candidates: summary.total_candidates,
  queued: summary.queued_backlog,
  highPriority: summary.high_priority_backlog,
  goldSet: `${summary.gold_set.passed}/${summary.gold_set.total}`,
}, null, 2));
