import assert from "node:assert/strict";
import test from "node:test";

import { summarizeCoverage } from "../src/lib/coverage.ts";
import {
  getLuckEvidence,
  getPerseveranceEvidence,
  getReachBand,
  summarizeReachBands,
} from "../src/lib/journey-model.ts";
import {
  ADVANTAGE_FIELDS,
  getAdvantageTotal,
  getLeverageTotal,
  getPathCounterexamples,
  getPersonLeverageProvenance,
  getConditionFactorBand,
  getConditionFactorCoverage,
  getConditionFactors,
  getStrongestFields,
  getTierDefinition,
  isComparisonPageIndexable,
  CONDITION_FACTORS,
  CONDITION_FACTOR_MAX,
  CONDITION_FACTOR_MIN,
  LEVERAGE_FIELDS,
  SCORE_FAMILIES,
  summarizeOutcomes,
  buildPersonPath,
} from "../src/lib/outcome-model.ts";

const completeNarrative = {
  milestone_by_age_26: "Built a meaningful early milestone",
  early_history_summary: "Started practicing independently.",
  family_context_summary: "A documented family context.",
  evidence_summary: "Evidence summary.",
  current_position: "Current position.",
};

function person(overrides = {}) {
  return {
    person_id: "person",
    name: "Person",
    cohort_group: "Researchers",
    category: "Science/Research",
    success_tier: 2,
    total_leverage_score: 4,
    age_at_milestone: 24,
    milestone_by_age_26: "Published an early result",
    primary_early_advantage_tags_list: [],
    source_count: 2,
    source_urls: ["https://example.com/a", "https://research.example.org/b"],
    leverage_evidence_confidence: "Medium",
    trajectory: [{ year: 2020, age: 24, title: "Milestone" }],
    ...overrides,
  };
}

test("coverage summary keeps empty and populated denominators honest", () => {
  const empty = summarizeCoverage([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.sourcesTwoPlus.share, 0);
  assert.equal(empty.auditDate, undefined);

  const summary = summarizeCoverage([
    {
      ...completeNarrative,
      source_urls: ["https://www.example.com/a", "https://docs.example.com/b"],
      trajectory: [1, 2, 3],
      leverage_evidence_confidence: "High",
      early_advantage_evidence_confidence: "Medium",
      source_audit_status: "source_verified",
      source_audit_date: "2026-08-01",
      cohort_group: "Researchers",
      success_tier: 1,
    },
    {
      ...completeNarrative,
      source_urls: ["not a URL", "https://another.example/a"],
      trajectory: [1],
      leverage_evidence_confidence: "Low",
      early_advantage_evidence_confidence: "Low",
      source_audit_status: "partial_source_verification",
      source_audit_date: "2026-08-12",
      cohort_group: "Creators",
      success_tier: 3,
    },
    {
      source_urls: "not-an-array",
      trajectory: [],
      leverage_evidence_confidence: "Medium",
      early_advantage_evidence_confidence: "High",
      cohort_group: "Researchers",
      success_tier: 4,
    },
  ]);

  assert.equal(summary.total, 3);
  assert.deepEqual(summary.sourcesTwoPlus, { count: 2, share: 66.67 });
  assert.deepEqual(summary.trajectoriesComplete, { count: 1, share: 33.33 });
  assert.deepEqual(summary.narrativeComplete, { count: 2, share: 66.67 });
  assert.deepEqual(summary.indexable, { count: 1, share: 33.33 });
  assert.equal(summary.independentlyAudited.count, 1);
  assert.equal(summary.partialVerified.count, 1);
  assert.equal(summary.totalSourceUrls, 4);
  assert.equal(summary.auditDate, "2026-08-12");
  assert.equal(summary.twoDistinctSourceDomains.count, 1);
  assert.deepEqual(summary.cohorts.map(({ label, count }) => ({ label, count })), [
    { label: "Researchers", count: 2 },
    { label: "Creators", count: 1 },
  ]);
  assert.deepEqual(summary.tiers.map(({ label, count }) => ({ label, count })), [
    { label: "T1", count: 1 },
    { label: "T2", count: 0 },
    { label: "T3", count: 1 },
    { label: "T4", count: 1 },
  ]);
});

test("score totals use valid numeric values and the documented maxima", () => {
  const sample = person({
    total_leverage_score: undefined,
    early_family_financial_platform_support_score: 2,
    parent_family_domain_advantage_score: Number.NaN,
    prior_reps_score: 3,
    scarce_skill_depth_score: 2,
  });

  assert.equal(SCORE_FAMILIES.advantage.max, 24);
  assert.equal(SCORE_FAMILIES.leverage.max, 25);
  assert.equal(getAdvantageTotal(sample), 2);
  assert.equal(getLeverageTotal(sample), 5);
  assert.equal(getLeverageTotal(person({ total_leverage_score: 9 })), 9);
});

test("outcome summaries preserve tier ranks, distributions, and correlations", () => {
  const people = [
    person({ name: "A", success_tier: 1, total_leverage_score: 10, early_family_financial_platform_support_score: 2 }),
    person({ name: "B", success_tier: 2, total_leverage_score: 8, early_family_financial_platform_support_score: 1 }),
    person({ name: "C", success_tier: 3, total_leverage_score: 4, early_family_financial_platform_support_score: 0 }),
    person({ name: "D", success_tier: 4, total_leverage_score: 2, early_family_financial_platform_support_score: 0 }),
  ];
  const summary = summarizeOutcomes(people);

  assert.equal(summary.tiers[0].rankStart, 1);
  assert.equal(summary.tiers[0].rankEnd, 1);
  assert.equal(summary.tiers[0].lowerOutcomeCount, 3);
  assert.equal(summary.tiers[3].rankEnd, 4);
  assert.equal(summary.leverageMean, 6);
  assert.ok(summary.leverageCorrelation > 0.9);
  assert.ok(summary.advantageCorrelation > 0.8);
  assert.equal(summarizeOutcomes([]).advantageCorrelation, 0);
  assert.equal(getTierDefinition(99).tier, 4);
});

test("strongest fields are normalized, sorted, and bounded", () => {
  const strongest = getStrongestFields(
    person({
      early_family_financial_platform_support_score: 1,
      parent_family_domain_advantage_score: 2,
      rare_early_tools_facilities_score: 1,
    }),
    ADVANTAGE_FIELDS,
    2,
  );

  assert.deepEqual(strongest.map((field) => field.key), [
    "parent_family_domain_advantage_score",
    "early_family_financial_platform_support_score",
  ]);
});

test("provenance distinguishes external, enabled, mixed, self-built, earned, and unresolved paths", () => {
  const provenance = getPersonLeverageProvenance(person({
    total_leverage_score: undefined,
    structural_wave_score: 3,
    prior_reps_score: 2,
    scarce_skill_depth_score: 1,
    capital_safety_score: 1,
    domain_proximity_score: 1,
    early_online_platform_community_score: 2,
    direct_customer_domain_exposure_score: 2,
    early_history_summary: "Self-taught and independently built projects before being selected for a fellowship.",
  }));
  const origins = new Map(provenance.map((entry) => [entry.field.key, entry.origin]));

  assert.equal(origins.get("structural_wave_score"), "external");
  assert.equal(origins.get("prior_reps_score"), "mixed");
  assert.equal(origins.get("scarce_skill_depth_score"), "mixed");
  assert.equal(origins.get("capital_safety_score"), "earned");
  assert.equal(origins.get("domain_proximity_score"), "advantage-enabled");

  const selfBuilt = getPersonLeverageProvenance(person({
    total_leverage_score: undefined,
    prior_reps_score: 1,
    early_history_summary: "Self-taught and practiced on their own.",
  }));
  assert.equal(selfBuilt[0].origin, "self-built");

  const unresolved = getPersonLeverageProvenance(person({
    total_leverage_score: undefined,
    complementary_team_score: 1,
    early_history_summary: "No origin evidence.",
  }));
  assert.equal(unresolved[0].origin, "unresolved");
});

test("comparison indexing rejects each missing evidence boundary", () => {
  assert.equal(isComparisonPageIndexable(person()), true);
  assert.equal(isComparisonPageIndexable(person({ source_count: 1 })), false);
  assert.equal(isComparisonPageIndexable(person({ leverage_evidence_confidence: "low" })), false);
  assert.equal(isComparisonPageIndexable(person({ milestone_by_age_26: " " })), false);
  assert.equal(isComparisonPageIndexable(person({ trajectory: [] })), false);
});

test("path comparisons and person summaries remain deterministic", () => {
  const people = [
    person({ person_id: "a", name: "Alpha", success_tier: 1, total_leverage_score: 8, early_family_financial_platform_support_score: 1 }),
    person({ person_id: "b", name: "Beta", success_tier: 4, total_leverage_score: 8, early_family_financial_platform_support_score: 1, cohort_group: "Creators" }),
    person({ person_id: "c", name: "Gamma", success_tier: 2, total_leverage_score: 8, early_family_financial_platform_support_score: 2 }),
    person({ person_id: "d", name: "Delta", success_tier: 3, total_leverage_score: 4, early_family_financial_platform_support_score: 1 }),
  ];
  const pairs = getPathCounterexamples(people);
  const path = buildPersonPath(people[0], people);

  assert.deepEqual(pairs.map((pair) => pair.kind), ["same-totals", "same-leverage", "same-start"]);
  assert.equal(path.advantageTotal, 1);
  assert.equal(path.leverageTotal, 8);
  assert.equal(path.cohortAdvantagePercentile, 67);
  assert.equal(path.tierDefinition.tier, 1);
  assert.equal(getPathCounterexamples([person({ source_count: 0 })]).length, 0);
  assert.equal(getStrongestFields(person(), LEVERAGE_FIELDS).length, 0);
});

test("condition factors distinguish headwind, neutral, and tailwind", () => {
  const readings = getConditionFactors(
    person({
      personal_endowment_score: 2,
      endowment_summary: "  Documented early skill.  ",
      inherited_leverage_score: 0,
      inherited_summary: "Working class, supportive, nothing notable either way.",
      catalytic_ecosystem_score: -1,
      ecosystem_summary: "No mentors, no institutions, no tools.",
    }),
  );

  assert.equal(readings.length, CONDITION_FACTORS.length);
  assert.deepEqual(readings.map((r) => r.score), [2, 0, -1]);
  // A -1 is a recorded finding, not a gap: all three are assessed here.
  assert.deepEqual(readings.map((r) => r.assessed), [true, true, true]);
  assert.deepEqual(readings.map((r) => r.band), ["tailwind", "neutral", "headwind"]);
  assert.equal(readings[2].bandLabel, "Active headwind");
  assert.equal(readings[0].summary, "Documented early skill.");
  assert.equal(readings[0].label, "What they brought");
  assert.equal(readings[2].gloss, "The shape of the track");
  assert.ok(readings[1].question.length > 0);
});

test("condition factor bands split at zero", () => {
  assert.equal(getConditionFactorBand(-1), "headwind");
  assert.equal(getConditionFactorBand(0), "neutral");
  assert.equal(getConditionFactorBand(1), "tailwind");
  assert.equal(getConditionFactorBand(CONDITION_FACTOR_MAX), "tailwind");
});

test("condition factors clamp overflow and reject non-numeric input", () => {
  const readings = getConditionFactors(
    person({
      personal_endowment_score: -9,
      inherited_leverage_score: 9,
      catalytic_ecosystem_score: "2",
      endowment_summary: 42,
    }),
  );

  assert.equal(readings[0].score, CONDITION_FACTOR_MIN, "scores clamp to the documented minimum");
  assert.equal(readings[0].summary, "", "a non-string summary is dropped");
  assert.equal(readings[1].score, CONDITION_FACTOR_MAX, "scores clamp to the documented maximum");
  assert.equal(readings[2].score, null, "an unparsed string is not treated as a number");
  assert.equal(readings[2].assessed, false);
  assert.equal(readings[2].bandLabel, "Not assessed");
});

test("condition factor coverage counts each band separately", () => {
  const people = [
    person({ personal_endowment_score: 2, inherited_leverage_score: -1, catalytic_ecosystem_score: 3 }),
    person({ personal_endowment_score: 0, inherited_leverage_score: null, catalytic_ecosystem_score: 2 }),
    person({ personal_endowment_score: 1, inherited_leverage_score: -1, catalytic_ecosystem_score: 0 }),
    person({ personal_endowment_score: 3, inherited_leverage_score: 2, catalytic_ecosystem_score: 1 }),
  ];
  const coverage = getConditionFactorCoverage(people);

  assert.deepEqual(coverage.map((c) => c.assessed), [4, 3, 4]);
  assert.deepEqual(coverage.map((c) => c.unassessed), [0, 1, 0]);
  assert.deepEqual(coverage.map((c) => c.headwind), [0, 2, 0]);
  assert.deepEqual(coverage.map((c) => c.neutral), [1, 0, 1]);
  assert.deepEqual(coverage.map((c) => c.tailwind), [3, 1, 3]);
  assert.deepEqual(coverage.map((c) => c.share), [100, 75, 100]);
  assert.deepEqual(getConditionFactorCoverage([]).map((c) => c.share), [0, 0, 0]);
});

test("reach bands broaden the corpus without inventing a universal percentile", () => {
  assert.equal(getReachBand(person({ success_tier: 1 })).label, "Extreme public outlier");
  assert.equal(getReachBand(person({ success_tier: 2 })).label, "Field-leading");
  assert.equal(getReachBand(person({ success_tier: 3 })).percentileLabel, "Toward the 0.1% band");
  assert.equal(getReachBand(person({ success_tier: 4 })).key, "professionally-distinctive");

  const bands = summarizeReachBands([
    person({ success_tier: 1 }),
    person({ success_tier: 2 }),
    person({ success_tier: 3 }),
    person({ success_tier: 4 }),
  ]);
  assert.deepEqual(bands.map(({ count, share }) => ({ count, share })), [
    { count: 1, share: 25 },
    { count: 1, share: 25 },
    { count: 2, share: 50 },
  ]);
  assert.equal(summarizeReachBands([]).every((band) => band.share === 0), true);
});

test("path forces expose sourced evidence without scoring silence", () => {
  const documented = person({
    early_history_summary:
      "She spent seven years performing in clubs before being discovered by a talent scout.",
    source_urls: ["https://example.com/biography"],
    trajectory: [
      {
        age: 24,
        description: "Spotted by a talent scout during a club performance.",
        title: "The encounter",
        year: 1975,
      },
    ],
  });
  const perseverance = getPerseveranceEvidence(documented);
  const luck = getLuckEvidence(documented);

  assert.match(perseverance.summary, /seven years/i);
  assert.match(perseverance.boundary, /not a grit or merit score/i);
  assert.equal(perseverance.sourceUrls.length, 1);
  assert.equal(luck.label, "Encounter luck");
  assert.match(luck.summary, /spotted/i);
  assert.doesNotMatch(luck.summary, /seven years/i);
  assert.match(luck.boundary, /not an estimate/i);

  const silent = person({ early_history_summary: "A short biography.", source_urls: [] });
  assert.match(getPerseveranceEvidence(silent).summary, /Not documented/i);
  assert.match(getPerseveranceEvidence(silent).boundary, /not evidence/i);
  assert.match(getLuckEvidence(silent).summary, /No discrete luck event/i);
});
