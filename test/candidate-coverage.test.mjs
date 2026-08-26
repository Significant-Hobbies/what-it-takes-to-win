import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  conservativeAgeAtEvent,
  evaluateCandidateGates,
  normalizeEligibilityStatus,
  normalizePersonName,
  parseCsv,
  researchPriority,
  sourceFreshness,
  summarizeLedger,
} from "../src/lib/candidate-coverage.mjs";

const gateRegistry = JSON.parse(
  await readFile(new URL("../data/research/coverage/gate-registry.json", import.meta.url), "utf8"),
);

function validSignal() {
  return {
    signal_id: "candidate-event",
    person_name: "Candidate Person",
    field: "Founders / operators",
    event_date: "2026-06-25",
    birth_year: 1998,
    age_basis: "year_only_conservative",
    age_at_event: 28,
    age_confidence: "high",
    event_type: "company_funding_and_valuation",
    outcome_strength: 90,
    metrics: { capital_raised_usd: 80000000, valuation_usd: 450000000 },
    sources: [
      {
        url: "https://company.example/event",
        origin: "company.example",
        evidence_origin: "company-announcement",
        role: "first_party_event",
      },
      {
        url: "https://news.example/report",
        origin: "news.example",
        evidence_origin: "news-original-reporting",
        role: "independent_age_and_event",
      },
    ],
  };
}

function validPublicationRecord() {
  return {
    person_id: "candidate-person",
    coverage_signal_id: "candidate-event",
    name: "Candidate Person",
    cohort_group: "Founders / operators",
    category: "Technology founder",
    birth_year: 1998,
    age_at_milestone: 28,
    milestone_by_age_26: "Raised a large institutional round at age 28.",
    evidence_summary: "Independent reporting confirms the dated company outcome.",
    primary_source_url: "https://company.example/event",
    source_urls: ["https://company.example/event", "https://news.example/report"],
    source_count: 2,
    eligibility_status: "age_30_eligible",
    trajectory: [
      { year: 2020, age: 22, event: "Started relevant work." },
      { year: 2024, age: 26, event: "Started the company." },
      { year: 2026, age: 28, event: "Raised the qualifying round." },
    ],
  };
}

test("candidate identities normalize aliases deterministically", () => {
  assert.equal(normalizePersonName("  Neil Movva  "), "neil movva");
  assert.equal(normalizePersonName("José Valim"), "jose valim");
});

test("candidate CSV parsing preserves quoted fields", () => {
  const [record] = parseCsv('name,notes\n"Movva, Neil","Raised ""a lot"""\n');
  assert.deepEqual(record, { name: "Movva, Neil", notes: 'Raised "a lot"' });
});

test("research statuses retain eligible, ineligible, and queued boundaries", () => {
  assert.equal(normalizeEligibilityStatus({ eligibility_status: "age_30_eligible" }), "eligible");
  assert.equal(normalizeEligibilityStatus({ eligibility_status: "age_26_ineligible" }), "ineligible");
  assert.equal(normalizeEligibilityStatus({ research_status: "unverified_candidate" }), "queued");
  assert.equal(normalizeEligibilityStatus({ notable_by_26: true }), "eligible");
});

test("priority responds to outcome evidence and uncovered batches", () => {
  const batches = new Map([["Winter 2023", { discovered: 500, researched: 5 }]]);
  const priority = researchPriority({
    state: "eligible",
    batch: "Winter 2023",
    gates: { research: { pass: true }, discovery: { pass: true } },
    signals: [{
      outcome_strength: 95,
      sources: [{ origin: "example.com" }, { origin: "independent.example" }],
    }],
  }, batches);
  assert.equal(priority, 100);
  assert.equal(researchPriority({ state: "published", signals: [] }, batches), 0);
});

test("conservative event age uses the least favorable year-only age", () => {
  assert.equal(conservativeAgeAtEvent(validSignal()), 28);
  assert.equal(conservativeAgeAtEvent({
    ...validSignal(),
    birth_year: undefined,
    birth_date: "1998-12-01",
  }), 27);
});

test("a typed age-relative outcome reproduces all three gates", () => {
  const verdict = evaluateCandidateGates(
    validSignal(),
    validPublicationRecord(),
    gateRegistry,
    "2026-08-26",
  );
  assert.equal(verdict.calibration_status, "provisional_research_screen");
  assert.equal(verdict.discovery.pass, true);
  assert.equal(verdict.research.pass, true);
  assert.equal(verdict.publication.pass, true);
});

test("future and age-mismatched signals fail discovery closed", () => {
  const signal = {
    ...validSignal(),
    event_date: "2027-01-01",
    event_type: "unregistered_vanity_metric",
    age_at_event: 27,
  };
  const verdict = evaluateCandidateGates(signal, null, gateRegistry, "2026-08-26");
  assert.equal(verdict.discovery.pass, false);
  assert.deepEqual(
    verdict.discovery.reasons,
    ["age_mismatch", "future_event"],
  );
});

test("a new event type reaches research without bypassing its missing field gate", () => {
  const signal = { ...validSignal(), event_type: "new_authoritative_outcome" };
  const verdict = evaluateCandidateGates(signal, null, gateRegistry, "2026-08-26");
  assert.equal(verdict.discovery.pass, true);
  assert.equal(verdict.discovery.event_type_registered, false);
  assert.equal(verdict.research.pass, false);
  assert.ok(verdict.research.reasons.includes("unsupported_event_type"));
});

test("affiliated sources cannot satisfy the independent research gate", () => {
  const signal = validSignal();
  signal.sources[1].role = "investor_team_background";
  const verdict = evaluateCandidateGates(signal, null, gateRegistry, "2026-08-26");
  assert.equal(verdict.discovery.pass, true);
  assert.equal(verdict.research.pass, false);
  assert.ok(verdict.research.reasons.includes("missing_independent_source"));
});

test("two domains repeating one evidence origin do not become independent", () => {
  const signal = validSignal();
  signal.sources[1].evidence_origin = signal.sources[0].evidence_origin;
  const verdict = evaluateCandidateGates(signal, null, gateRegistry, "2026-08-26");
  assert.equal(verdict.discovery.pass, true);
  assert.equal(verdict.research.pass, false);
  assert.ok(verdict.research.reasons.includes("insufficient_evidence_origins"));
});

test("below-band outcomes stay in research rather than becoming publishable", () => {
  const signal = validSignal();
  signal.metrics = { capital_raised_usd: 1000000, valuation_usd: 10000000 };
  const verdict = evaluateCandidateGates(signal, null, gateRegistry, "2026-08-26");
  assert.equal(verdict.discovery.pass, true);
  assert.equal(verdict.research.pass, false);
  assert.ok(verdict.research.reasons.includes("outcome_threshold_not_met"));
});

test("an incomplete record cannot bypass a passing research verdict", () => {
  const record = validPublicationRecord();
  record.evidence_summary = "";
  record.trajectory = record.trajectory.slice(0, 2);
  const verdict = evaluateCandidateGates(validSignal(), record, gateRegistry, "2026-08-26");
  assert.equal(verdict.research.pass, true);
  assert.equal(verdict.publication.pass, false);
  assert.ok(verdict.publication.reasons.includes("missing_record_field:evidence_summary"));
  assert.ok(verdict.publication.reasons.includes("trajectory_too_short"));
});

test("source freshness uses the declared evidence date", () => {
  assert.deepEqual(
    sourceFreshness({ snapshot_date: "2026-08-01", freshness_days: 30 }, "2026-08-26"),
    { age_days: 25, stale: false },
  );
  assert.equal(
    sourceFreshness({ snapshot_date: "2026-06-01", freshness_days: 30 }, "2026-08-26").stale,
    true,
  );
});

test("coverage summary measures lifecycle and gold-set recall", () => {
  const records = [
    {
      identity_key: "neil movva",
      name: "Neil Movva",
      state: "published",
      field: "Founders / operators",
      source_ids: ["yc-directory"],
      signals: [{ signal_id: "sail" }],
      priority: 0,
    },
    {
      identity_key: "queued person",
      name: "Queued Person",
      state: "queued",
      field: "Researchers / independent engineers",
      source_ids: ["research"],
      signals: [],
      priority: 80,
    },
  ];
  const summary = summarizeLedger(records, [], [{
    person_name: "Neil Movva",
    expected_source: "yc-directory",
    expected_signal: "sail",
    expected_state: "published",
  }]);
  assert.equal(summary.lifecycle.published, 1);
  assert.equal(summary.queued_backlog, 1);
  assert.equal(summary.high_priority_backlog, 1);
  assert.equal(summary.gold_set.passed, 1);
});
