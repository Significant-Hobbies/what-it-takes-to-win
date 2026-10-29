import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
