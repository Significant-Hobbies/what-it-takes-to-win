// Deterministic census schema validators (issue #32 task 3).
// Each validator is a pure function returning { valid, problems }; nothing
// reads files, fetches, or depends on the clock. These contracts formalize
// the shapes the candidate-coverage ledger already computes, so every
// ingestion, entity-resolution, and gate decision validates against one
// canonical definition.

export const CENSUS_SCHEMA_VERSION = "fleet.census-schemas.v1";

export const RESEARCH_STATES = [
  "discovered",
  "enriched",
  "queued",
  "researched",
  "eligible",
  "ineligible",
  "published",
  "stale",
];

export const AGE_CONFIDENCE = [
  // Exact date of birth from an authoritative record.
  "verified",
  // Year (or partial date) documented; event-age may be off by one.
  "documented_year",
  // Age reported by a secondary source without a birth date.
  "reported",
  // No defensible age basis; the candidate cannot clear the age gate.
  "unknown",
];

export const CALIBRATION_GATE_STATES = [
  "pass",
  "fail",
  // Denominator or outcome threshold is not defensible for this field —
  // the gate abstains rather than inventing a verdict.
  "uncalibrated",
];

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const nonEmptyString = (value, max = 400) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

const optionalString = (value, max = 400) =>
  value === undefined || value === null || nonEmptyString(value, max);

const isYear = (value) =>
  Number.isInteger(value) && value >= 1800 && value <= 2100;

const isIsoDate = (value) =>
  typeof value === "string"
  && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const isHttpsUrl = (value) =>
  typeof value === "string" && /^https:\/\/[^\s]+$/.test(value);

// A person as first observed in a source: identity plus whatever the source
// recorded, before enrichment or resolution.
export function validateCandidateRecord(record) {
  const problems = [];
  if (!isPlainObject(record)) return { valid: false, problems: ["candidate must be an object"] };
  if (!nonEmptyString(record.name)) problems.push("candidate.name is required");
  if (record.birth_year !== null && record.birth_year !== undefined && !isYear(Number(record.birth_year))) {
    problems.push("candidate.birth_year must be a four-digit year or absent");
  }
  if (!optionalString(record.country)) problems.push("candidate.country must be a string");
  if (!optionalString(record.field)) problems.push("candidate.field must be a string");
  if (record.aliases !== undefined && (!Array.isArray(record.aliases) || !record.aliases.every((a) => nonEmptyString(a)))) {
    problems.push("candidate.aliases must be an array of names");
  }
  if (record.source_ids !== undefined && (!Array.isArray(record.source_ids) || !record.source_ids.every((s) => nonEmptyString(s, 120)))) {
    problems.push("candidate.source_ids must be an array of source ids");
  }
  if (record.state !== undefined && !RESEARCH_STATES.includes(record.state)) {
    problems.push(`candidate.state must be one of ${RESEARCH_STATES.join("/")}`);
  }
  return { valid: problems.length === 0, problems };
}

// The resolved person: one identity key plus every alias and source record
// that provably names the same human.
export function validateIdentityRecord(record) {
  const problems = [];
  if (!isPlainObject(record)) return { valid: false, problems: ["identity must be an object"] };
  if (!nonEmptyString(record.identity_key, 200)) problems.push("identity.identity_key is required");
  if (!nonEmptyString(record.name)) problems.push("identity.name is required");
  if (record.identity_key !== record.identity_key?.toLowerCase()) {
    problems.push("identity.identity_key must be normalized lowercase");
  }
  if (!Array.isArray(record.aliases)) {
    problems.push("identity.aliases must be an array");
  } else if (!record.aliases.every((a) => nonEmptyString(a))) {
    problems.push("identity.aliases must contain names only");
  }
  if (!Array.isArray(record.source_records)) {
    problems.push("identity.source_records must be an array");
  } else {
    record.source_records.forEach((entry, index) => {
      if (!isPlainObject(entry) || !nonEmptyString(entry.source_id, 120)) {
        problems.push(`identity.source_records[${index}] requires a source_id`);
      }
    });
  }
  if (record.birth_date !== undefined && record.birth_date !== null && !isIsoDate(record.birth_date)) {
    problems.push("identity.birth_date must be an ISO date");
  }
  return { valid: problems.length === 0, problems };
}

// A documented outcome: what happened, when, and where it was reported.
export function validateCensusEvent(record) {
  const problems = [];
  if (!isPlainObject(record)) return { valid: false, problems: ["event must be an object"] };
  if (!nonEmptyString(record.signal_id, 160)) problems.push("event.signal_id is required");
  if (!nonEmptyString(record.event_type, 80)) problems.push("event.event_type is required");
  if (!isIsoDate(record.event_date)) problems.push("event.event_date must be an ISO date");
  if (!nonEmptyString(record.person_name)) problems.push("event.person_name is required");
  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    problems.push("event.sources must list at least one source");
  } else {
    record.sources.forEach((source, index) => {
      const check = validateSourceRecord(source);
      if (!check.valid) problems.push(`event.sources[${index}]: ${check.problems.join("; ")}`);
    });
  }
  if (record.age_at_event !== undefined && record.age_at_event !== null) {
    const age = Number(record.age_at_event);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      problems.push("event.age_at_event must be an integer age");
    }
  }
  if (record.outcome_strength !== undefined) {
    const strength = Number(record.outcome_strength);
    if (!Number.isFinite(strength) || strength < 0 || strength > 100) {
      problems.push("event.outcome_strength must be a number in [0, 100]");
    }
  }
  return { valid: problems.length === 0, problems };
}

// One evidence pointer: an https URL from a named origin. Sources never carry
// quoted content — only provenance.
export function validateSourceRecord(record) {
  const problems = [];
  if (!isPlainObject(record)) return { valid: false, problems: ["source must be an object"] };
  if (!nonEmptyString(record.origin, 253)) problems.push("source.origin is required");
  if (!isHttpsUrl(record.url)) problems.push("source.url must be an https URL");
  if (record.retrieved_at !== undefined && !isIsoDate(record.retrieved_at)) {
    problems.push("source.retrieved_at must be an ISO date");
  }
  return { valid: problems.length === 0, problems };
}

// The exact-age confidence attached to a candidate or signal.
export function validateAgeConfidence(value) {
  const valid = AGE_CONFIDENCE.includes(value);
  return {
    valid,
    problems: valid ? [] : [`age_confidence must be one of ${AGE_CONFIDENCE.join("/")}`],
  };
}

// A calibration-gate verdict for a field: the outcome threshold, the
// authoritative denominator it is measured against, and an explicit state so
// missing denominators abstain instead of passing silently.
export function validateCalibrationGate(record) {
  const problems = [];
  if (!isPlainObject(record)) return { valid: false, problems: ["gate must be an object"] };
  if (!nonEmptyString(record.field)) problems.push("gate.field is required");
  if (!CALIBRATION_GATE_STATES.includes(record.state)) {
    problems.push(`gate.state must be one of ${CALIBRATION_GATE_STATES.join("/")}`);
  }
  if (record.state === "pass" || record.state === "fail") {
    if (record.denominator !== undefined && record.denominator !== null) {
      const denominator = Number(record.denominator);
      if (!Number.isFinite(denominator) || denominator <= 0) {
        problems.push("gate.denominator must be a positive number");
      }
    }
    if (record.denominator === undefined || record.denominator === null) {
      problems.push("a decided gate requires an authoritative denominator");
    }
    if (!nonEmptyString(record.denominator_source)) {
      problems.push("a decided gate requires a denominator_source");
    }
  }
  if (record.state === "uncalibrated" && !nonEmptyString(record.reason)) {
    problems.push("an uncalibrated gate requires a reason");
  }
  return { valid: problems.length === 0, problems };
}

// The research-lifecycle state of a ledger candidate.
export function validateResearchState(value) {
  const valid = RESEARCH_STATES.includes(value);
  return {
    valid,
    problems: valid ? [] : [`research state must be one of ${RESEARCH_STATES.join("/")}`],
  };
}
