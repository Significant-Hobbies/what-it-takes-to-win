import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const people = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/people.json"), "utf8"));
const coding = JSON.parse(
  fs.readFileSync(path.join(ROOT, "quality/reliability/secondary-coding-v1.json"), "utf8"),
);

const advantageFields = [
  ["early_family_financial_platform_support_score", 2],
  ["parent_family_domain_advantage_score", 2],
  ["inherited_audience_business_network_score", 2],
  ["elite_institution_performance_pipeline_score", 2],
  ["frontier_geography_ecosystem_score", 2],
  ["rare_early_tools_facilities_score", 2],
  ["dedicated_mentor_coach_tutor_score", 2],
  ["exceptional_peer_cofounder_sibling_score", 2],
  ["early_online_platform_community_score", 2],
  ["direct_customer_domain_exposure_score", 2],
  ["prodigy_physical_edge_score", 2],
  ["adversity_constraint_catalyst_score", 2],
];

const leverageFields = [
  ["started_serious_reps_before_20_score", 1],
  ["prior_reps_score", 3],
  ["scarce_skill_depth_score", 3],
  ["native_distribution_score", 3],
  ["elite_ecosystem_network_score", 3],
  ["complementary_team_score", 2],
  ["structural_wave_score", 3],
  ["concentration_intensity_score", 3],
  ["capital_safety_score", 2],
  ["domain_proximity_score", 2],
];

const ageBands = coding.protocol.milestone_age_bands;
const cohorts = coding.protocol.cohorts;
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const expectedSample = [];

for (const cohort of cohorts) {
  for (const [minimumAge, maximumAge] of ageBands) {
    const candidates = people
      .filter(
        (person) =>
          person.cohort_group === cohort &&
          person.age_at_milestone >= minimumAge &&
          person.age_at_milestone <= maximumAge,
      )
      .sort((left, right) => hash(left.person_id).localeCompare(hash(right.person_id)));
    if (!candidates.length) {
      throw new Error(`No candidate for ${cohort}, ages ${minimumAge}-${maximumAge}`);
    }
    expectedSample.push(candidates[0].person_id);
  }
}

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(coding.schema_version === 1, "Unsupported coding schema version");
assert(coding.protocol.sample_size === coding.records.length, "Sample-size metadata mismatch");
assert(
  JSON.stringify(coding.advantage_fields) ===
    JSON.stringify(advantageFields.map(([field]) => field)),
  "Advantage-field order mismatch",
);
assert(
  JSON.stringify(coding.leverage_fields) ===
    JSON.stringify(leverageFields.map(([field]) => field)),
  "Leverage-field order mismatch",
);
assert(
  JSON.stringify(coding.records.map((record) => record.person_id).sort()) ===
    JSON.stringify([...expectedSample].sort()),
  "Coded records do not match the deterministic stratified sample",
);

const byId = new Map(people.map((person) => [person.person_id, person]));
const pairs = [];

for (const record of coding.records) {
  const published = byId.get(record.person_id);
  assert(Boolean(published), `Missing published record: ${record.person_id}`);
  assert(Number.isInteger(record.success_tier) && record.success_tier >= 1 && record.success_tier <= 4,
    `Invalid secondary tier: ${record.person_id}`);
  assert(record.advantage_scores.length === advantageFields.length,
    `Advantage score count mismatch: ${record.person_id}`);
  assert(record.leverage_scores.length === leverageFields.length,
    `Leverage score count mismatch: ${record.person_id}`);

  for (const [index, [field, maximum]] of advantageFields.entries()) {
    const score = record.advantage_scores[index];
    assert(Number.isInteger(score) && score >= 0 && score <= maximum,
      `Invalid ${field} for ${record.person_id}: ${score}`);
  }
  for (const [index, [field, maximum]] of leverageFields.entries()) {
    const score = record.leverage_scores[index];
    assert(Number.isInteger(score) && score >= 0 && score <= maximum,
      `Invalid ${field} for ${record.person_id}: ${score}`);
  }

  if (published) pairs.push({ record, published });
}

if (failures.length) {
  throw new Error(`Reliability audit input failed:\n- ${failures.join("\n- ")}`);
}

const round = (value, digits = 3) => Number(value.toFixed(digits));
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const percent = (count, total) => round((count / total) * 100, 1);

function scorePairs(fields, scoreKey) {
  return pairs.flatMap(({ record, published }) =>
    fields.map(([field], index) => ({
      person_id: record.person_id,
      field,
      published: published[field],
      secondary: record[scoreKey][index],
    })),
  );
}

function summarizeScorePairs(values) {
  const signedDifferences = values.map(({ published, secondary }) => secondary - published);
  const differences = signedDifferences.map(Math.abs);
  return {
    observations: values.length,
    exact_agreement_percent: percent(differences.filter((difference) => difference === 0).length, values.length),
    within_one_percent: percent(differences.filter((difference) => difference <= 1).length, values.length),
    mean_absolute_difference: round(mean(differences)),
    mean_signed_difference: round(mean(signedDifferences)),
  };
}

function weightedKappa(tierPairs) {
  const categories = [1, 2, 3, 4];
  const denominator = (categories.length - 1) ** 2;
  const weight = (left, right) => ((left - right) ** 2) / denominator;
  const observed = mean(tierPairs.map(({ published, secondary }) => weight(published, secondary)));
  const publishedCounts = new Map(categories.map((tier) => [tier, 0]));
  const secondaryCounts = new Map(categories.map((tier) => [tier, 0]));
  for (const pair of tierPairs) {
    publishedCounts.set(pair.published, publishedCounts.get(pair.published) + 1);
    secondaryCounts.set(pair.secondary, secondaryCounts.get(pair.secondary) + 1);
  }
  let expected = 0;
  for (const published of categories) {
    for (const secondary of categories) {
      expected +=
        (publishedCounts.get(published) / tierPairs.length) *
        (secondaryCounts.get(secondary) / tierPairs.length) *
        weight(published, secondary);
    }
  }
  return expected === 0 ? 1 : round(1 - observed / expected);
}

function dimensionSummaries(values) {
  return Object.fromEntries(
    [...new Set(values.map(({ field }) => field))].map((field) => [
      field,
      summarizeScorePairs(values.filter((value) => value.field === field)),
    ]),
  );
}

const tierPairs = pairs.map(({ record, published }) => ({
  person_id: record.person_id,
  published: published.success_tier,
  secondary: record.success_tier,
}));
const advantagePairs = scorePairs(advantageFields, "advantage_scores");
const leveragePairs = scorePairs(leverageFields, "leverage_scores");
const recordComparisons = pairs.map(({ record, published }) => {
  const publishedAdvantage = sum(advantageFields.map(([field]) => published[field]));
  const secondaryAdvantage = sum(record.advantage_scores);
  const publishedLeverage = sum(leverageFields.map(([field]) => published[field]));
  const secondaryLeverage = sum(record.leverage_scores);
  const dimensionDisagreements = [
    ...advantageFields.map(([field], index) => ({
      field,
      difference: record.advantage_scores[index] - published[field],
    })),
    ...leverageFields.map(([field], index) => ({
      field,
      difference: record.leverage_scores[index] - published[field],
    })),
  ].filter(({ difference }) => Math.abs(difference) > 1);

  return {
    person_id: record.person_id,
    published_tier: published.success_tier,
    secondary_tier: record.success_tier,
    published_advantage_total: publishedAdvantage,
    secondary_advantage_total: secondaryAdvantage,
    advantage_total_difference: secondaryAdvantage - publishedAdvantage,
    published_leverage_total: publishedLeverage,
    secondary_leverage_total: secondaryLeverage,
    leverage_total_difference: secondaryLeverage - publishedLeverage,
    material_dimension_disagreements: dimensionDisagreements,
  };
});

const materialDisagreements = recordComparisons.filter(
  (comparison) =>
    comparison.published_tier !== comparison.secondary_tier ||
    Math.abs(comparison.advantage_total_difference) >= 4 ||
    Math.abs(comparison.leverage_total_difference) >= 4 ||
    comparison.material_dimension_disagreements.length > 0,
);

const result = {
  protocol: {
    name: coding.protocol.name,
    sample_size: coding.records.length,
    strata: `${cohorts.length} cohorts x ${ageBands.length} milestone-age bands`,
    source_fact_audit: false,
  },
  tier: {
    exact_agreement_percent: percent(
      tierPairs.filter(({ published, secondary }) => published === secondary).length,
      tierPairs.length,
    ),
    within_one_percent: percent(
      tierPairs.filter(({ published, secondary }) => Math.abs(published - secondary) <= 1).length,
      tierPairs.length,
    ),
    quadratic_weighted_kappa: weightedKappa(tierPairs),
    disagreements: tierPairs.filter(({ published, secondary }) => published !== secondary),
  },
  advantage: {
    ...summarizeScorePairs(advantagePairs),
    mean_absolute_total_difference: round(
      mean(recordComparisons.map(({ advantage_total_difference }) => Math.abs(advantage_total_difference))),
    ),
    mean_signed_total_difference: round(
      mean(recordComparisons.map(({ advantage_total_difference }) => advantage_total_difference)),
    ),
    by_dimension: dimensionSummaries(advantagePairs),
  },
  leverage: {
    ...summarizeScorePairs(leveragePairs),
    mean_absolute_total_difference: round(
      mean(recordComparisons.map(({ leverage_total_difference }) => Math.abs(leverage_total_difference))),
    ),
    mean_signed_total_difference: round(
      mean(recordComparisons.map(({ leverage_total_difference }) => leverage_total_difference)),
    ),
    by_dimension: dimensionSummaries(leveragePairs),
  },
  material_disagreements: materialDisagreements,
  record_comparisons: recordComparisons,
};

console.log(JSON.stringify(result, null, 2));
