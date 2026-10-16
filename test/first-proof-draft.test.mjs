import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AUDIT_DOMAINS, firstProofRecords, publishedFirstProofRecords } from "../src/data/first-proof.mjs";

const draft = JSON.parse(readFileSync(new URL("../docs/research/issue-83-public-source-draft/claim-ledger.json", import.meta.url), "utf8"));
const schema = JSON.parse(readFileSync(new URL("../docs/research/issue-83-public-source-draft/claim-ledger.schema.json", import.meta.url), "utf8"));

// Validate the draft's deliberately small schema vocabulary without a runtime dependency.
function shape(value, rule) {
  if (Object.hasOwn(rule, "const")) assert.deepEqual(value, rule.const);
  if (rule.enum) assert.ok(rule.enum.includes(value), `Unsupported enum: ${value}`);
  const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (rule.type) assert.ok([rule.type].flat().includes(type), `Expected ${rule.type}, got ${type}`);
  if (rule.minLength) assert.ok(value.length >= rule.minLength);
  if (rule.format === "date") assert.equal(new Date(value).toISOString().slice(0, 10), value);
  if (rule.items) {
    for (const item of value) shape(item, rule.items);
    if (rule.uniqueItems) assert.equal(new Set(value.map((item) => JSON.stringify(item))).size, value.length);
  }
  if (rule.properties) {
    for (const key of rule.required) assert.ok(Object.hasOwn(value, key), `Missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      assert.ok(Object.hasOwn(rule.properties, key), `Unexpected ${key}`);
      shape(item, rule.properties[key]);
    }
  }
}

function validate(data) {
  shape(data, schema);
  const sources = new Map(data.sources.map((source) => [source.id, source]));
  const claims = new Map(data.claims.map((claim) => [claim.id, claim]));
  assert.equal(sources.size, data.sources.length);
  assert.equal(claims.size, data.claims.length);
  assert.equal(new Set(data.cases.map((entry) => entry.personId)).size, data.cases.length);
  for (const source of sources.values()) assert.ok(["http:", "https:"].includes(new URL(source.url).protocol));
  for (const claim of claims.values()) {
    assert.ok(claim.sourceIds.length > 0);
    for (const id of claim.sourceIds) assert.equal(sources.get(id)?.access, "retrieved", `Unretrieved evidence: ${id}`);
    assert.equal(claim.date === null, claim.datePrecision === "unknown");
    assert.ok(data.cases.some((entry) => entry.personId === claim.personId));
  }
  function links(value, personId) {
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (key === "claimIds") for (const id of item) assert.equal(claims.get(id)?.personId, personId, `Wrong case: ${id}`);
      else links(item, personId);
    }
  }
  for (const entry of data.cases) {
    if (entry.intakeId === null) {
      assert.ok(entry.personId.startsWith("draft-"));
      assert.ok(!firstProofRecords.some((record) => record.id === entry.personId || record.name === entry.name));
      assert.ok(entry.researchContext);
      assert.ok(entry.milestoneAssessment?.claimIds.length > 0);
    } else {
      assert.equal(entry.personId, entry.intakeId);
      assert.equal(firstProofRecords.find((record) => record.id === entry.intakeId)?.name, entry.name);
    }
    assert.equal(entry.earlierQualifyingProof === true, entry.classification === "earlier-excellence-contrast");
    for (const event of [...entry.timeline.capability, ...entry.timeline.proof, ...entry.subsequentOutcomes]) {
      assert.equal(event.date === null, event.datePrecision === "unknown");
      assert.ok(event.claimIds.length > 0);
    }
    assert.deepEqual(entry.earlyHistory.map((domain) => domain.domain), AUDIT_DOMAINS);
    assert.ok(entry.holdReasons.length > 0);
    assert.ok(entry.nextChecks.length > 0);
    assert.ok(entry.timeline.proof.length > 0);
    links(entry, entry.personId);
  }
}

test("priority claim ledger preserves traceability and remains outside publication inputs", () => {
  validate(draft);
  assert.deepEqual(draft.cases.filter((entry) => entry.intakeId !== null).map((entry) => entry.personId), ["001", "004", "014", "016", "034"]);
  assert.deepEqual(draft.cases.filter((entry) => entry.intakeId === null).map((entry) => entry.personId), ["draft-mansukhbhai-jagani", "draft-chintakindi-mallesham", "draft-remya-jose"]);
  assert.equal(publishedFirstProofRecords.length, 0);
  assert.ok(firstProofRecords.every((record) => !record.review));
});

test("draft validation rejects unread evidence, cross-person claims and invented clearance", () => {
  for (const mutate of [
    (data) => { data.sources[0].access = "search-extract-only"; },
    (data) => { data.cases[0].timeline.proof[0].claimIds = ["NS1"]; },
    (data) => { data.cases[0].earlierQualifyingProof = false; },
    (data) => { data.cases[0].review.approved = true; },
    (data) => { data.claims[0].sourceIds = []; },
    (data) => { data.sources[0].url = "javascript:alert(1)"; },
  ]) {
    const changed = structuredClone(draft);
    mutate(changed);
    assert.throws(() => validate(changed));
  }
});

test("earlier-result and date conflicts cannot silently become the intake milestone", () => {
  const cases = new Map(draft.cases.map((entry) => [entry.personId, entry]));
  assert.equal(cases.get("016").timeline.proof[0].kind, "chapter-commission");
  assert.equal(cases.get("016").timeline.proof[0].date, null);
  assert.equal(cases.get("014").timeline.proof[0].kind, "magazine-acceptance");
  assert.equal(cases.get("014").timeline.proof[0].date, null);
  const spinks = cases.get("004");
  assert.equal(spinks.contradictions.length, 2);
  assert.equal(spinks.timeline.proof[0].date, "2003-03-31");
  assert.equal(spinks.timeline.proof[0].kind, "category-win-threshold-unresolved");
  assert.equal(spinks.birthEvidence.date, "1967-04-22");
  assert.match(spinks.birthEvidence.note, /not an independently authenticated civil birth record/);
  assert.equal(spinks.status, "held");
  assert.equal(cases.get("034").timeline.proof[0].kind, "school-selection");
});

test("unregistered research leads cannot impersonate intake or lose contrast exclusion", () => {
  for (const mutate of [
    (data) => { data.cases[5].intakeId = "001"; },
    (data) => { data.cases[5].personId = "001"; },
    (data) => { delete data.cases[5].milestoneAssessment; },
    (data) => { data.cases[7].classification = "unresolved"; },
    (data) => { data.cases[7].earlierQualifyingProof = null; },
    (data) => { data.cases[6].timeline.proof[0].datePrecision = "unknown"; },
  ]) {
    const changed = structuredClone(draft);
    mutate(changed);
    assert.throws(() => validate(changed));
  }
});

test("new lead evidence retains cohort-changing uncertainty and source dependence", () => {
  const jagani = draft.cases.find((entry) => entry.personId === "draft-mansukhbhai-jagani");
  const mallesham = draft.cases.find((entry) => entry.personId === "draft-chintakindi-mallesham");
  const remya = draft.cases.find((entry) => entry.personId === "draft-remya-jose");
  assert.equal(jagani.timeline.capability[0].kind, "farmer-requested-design");
  assert.ok(!jagani.timeline.proof.some((event) => event.date === "1994"));
  assert.equal(mallesham.timeline.capability[1].kind, "first-machine-made");
  assert.ok(!mallesham.timeline.proof.some((event) => event.date === "1999"));
  assert.equal(mallesham.birthEvidence.date, null);
  assert.ok(mallesham.contradictions.some((conflict) => conflict.id === "CM-age" && conflict.status === "unresolved"));
  assert.equal(mallesham.earlierQualifyingProof, null);
  assert.equal(remya.earlierQualifyingProof, true);
  assert.equal(remya.status, "held");
  assert.equal(remya.review.decision, "pending");
  assert.equal(remya.strongestAt25, null);
  assert.match(draft.sources.find((source) => source.id === "R27").origin, /same origin/);
  assert.match(draft.sources.find((source) => source.id === "R28").location, /caption only/);
});
