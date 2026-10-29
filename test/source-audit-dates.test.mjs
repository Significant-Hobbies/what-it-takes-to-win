import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseCsv } from "../src/lib/candidate-coverage.mjs";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

test("published audit dates reflect each profile's URL checks, not a later scoped refresh", () => {
  const audit = readJson("../quality/source-audit/audit-v1.json");
  const people = readJson("../src/data/people.json");
  const publicPeople = readJson("../public/data/people.json");
  assert.equal(people.find((person) => person.person_id === "bill-gates").source_audit_date, "2026-08-08");
  assert.equal(people.find((person) => person.person_id === "michael-truell").source_audit_date, "2026-10-27");
  for (const person of people) {
    const results = audit.results[person.person_id] || [];
    if (results.length === 0) continue;
    const dates = results.map((result) => result.checked).filter(Boolean).sort();
    assert.equal(person.source_audit_date, dates.at(-1) || audit.audit_date, person.person_id);
  }
  assert.deepEqual(
    publicPeople.map(({ person_id, source_audit_date }) => ({ person_id, source_audit_date })),
    people.map(({ person_id, source_audit_date }) => ({ person_id, source_audit_date })),
  );
});

test("Cursor founders retain the same tier and evidence in both CSV downloads and published JSON", () => {
  const source = parseCsv(readFileSync(new URL("../src/data/people.csv", import.meta.url), "utf8"));
  const download = parseCsv(readFileSync(new URL("../public/data/people.csv", import.meta.url), "utf8"));
  const people = readJson("../public/data/people.json");
  for (const id of ["michael-truell", "aman-sanger", "sualeh-asif", "arvid-lunnemark"]) {
    const record = source.find((person) => person.person_id === id);
    const csv = download.find((person) => person.person_id === id);
    const json = people.find((person) => person.person_id === id);
    assert.equal(csv.success_tier, "2", id);
    assert.equal(csv.success_tier, record.success_tier, id);
    assert.equal(Number(csv.success_tier), json.success_tier, id);
    assert.equal(csv.evidence_summary, record.evidence_summary, id);
    assert.equal(csv.evidence_summary, json.evidence_summary, id);
  }
});
