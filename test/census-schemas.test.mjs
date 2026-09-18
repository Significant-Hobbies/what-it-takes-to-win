import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AGE_CONFIDENCE,
  RESEARCH_STATES,
  validateAgeConfidence,
  validateCalibrationGate,
  validateCandidateRecord,
  validateCensusEvent,
  validateIdentityRecord,
  validateResearchState,
  validateSourceRecord,
} from "../src/lib/census-schemas.mjs";

const candidate = {
  name: "Neil Movva",
  birth_year: 1997,
  country: "United States",
  field: "Founders / operators",
  aliases: [],
  source_ids: ["yc-directory"],
  state: "queued",
};

const identity = {
  identity_key: "neil movva",
  name: "Neil Movva",
  aliases: ["N. Movva"],
  source_records: [{ source_id: "yc-directory", candidate_id: "sail-research" }],
  birth_date: "1997-03-01",
};

const event = {
  signal_id: "sail-2026-funding-neil-movva",
  event_type: "founding_funding",
  event_date: "2026-02-14",
  person_name: "Neil Movva",
  age_at_event: 28,
  outcome_strength: 92,
  sources: [
    { origin: "techcrunch.com", url: "https://techcrunch.com/example", retrieved_at: "2026-02-15" },
  ],
};

test("candidate records validate required and optional bounded fields", () => {
  assert.equal(validateCandidateRecord(candidate).valid, true);
  assert.equal(validateCandidateRecord({ ...candidate, name: "" }).valid, false);
  assert.equal(validateCandidateRecord({ ...candidate, birth_year: 174 }).valid, false);
  assert.equal(validateCandidateRecord({ ...candidate, state: "bogus" }).valid, false);
  assert.equal(validateCandidateRecord({ ...candidate, aliases: "neil" }).valid, false);
  assert.equal(validateCandidateRecord(null).valid, false);
});

test("identity records require a normalized key and shaped source records", () => {
  assert.equal(validateIdentityRecord(identity).valid, true);
  assert.equal(
    validateIdentityRecord({ ...identity, identity_key: "Neil Movva" }).valid,
    false,
  );
  assert.equal(
    validateIdentityRecord({ ...identity, source_records: [{}] }).valid,
    false,
  );
  assert.equal(validateIdentityRecord({ ...identity, birth_date: "1997" }).valid, false);
});

test("events require identity, a real date, and at least one shaped source", () => {
  assert.equal(validateCensusEvent(event).valid, true);
  assert.equal(validateCensusEvent({ ...event, sources: [] }).valid, false);
  assert.equal(validateCensusEvent({ ...event, event_date: "2026" }).valid, false);
  assert.equal(
    validateCensusEvent({ ...event, sources: [{ url: "http://insecure.example" }] }).valid,
    false,
  );
  assert.equal(validateCensusEvent({ ...event, age_at_event: 140 }).valid, false);
  assert.equal(validateCensusEvent({ ...event, outcome_strength: 101 }).valid, false);
});

test("sources are provenance only — https URLs from named origins", () => {
  assert.equal(
    validateSourceRecord({ origin: "example.com", url: "https://example.com/a" }).valid,
    true,
  );
  assert.equal(validateSourceRecord({ origin: "x", url: "ftp://x" }).valid, false);
  assert.equal(validateSourceRecord({ url: "https://x.com" }).valid, false);
});

test("age confidence and research states are closed enums", () => {
  for (const value of AGE_CONFIDENCE) assert.equal(validateAgeConfidence(value).valid, true);
  assert.equal(validateAgeConfidence("precise-ish").valid, false);
  for (const value of RESEARCH_STATES) assert.equal(validateResearchState(value).valid, true);
  assert.equal(validateResearchState("done").valid, false);
});

test("calibration gates must decide from a denominator or abstain with a reason", () => {
  assert.equal(
    validateCalibrationGate({
      field: "Founders / operators",
      state: "pass",
      denominator: 80_000_000,
      denominator_source: "UN World Population Prospects, exact-age cohort",
    }).valid,
    true,
  );
  assert.equal(
    validateCalibrationGate({ field: "Founders / operators", state: "pass" }).valid,
    false,
  );
  assert.equal(
    validateCalibrationGate({ field: "Poets", state: "uncalibrated" }).valid,
    false,
  );
  assert.equal(
    validateCalibrationGate({ field: "Poets", state: "uncalibrated", reason: "No authoritative exact-age denominator" }).valid,
    true,
  );
});
