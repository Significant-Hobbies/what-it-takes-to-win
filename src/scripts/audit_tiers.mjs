import fs from "node:fs";

const people = JSON.parse(fs.readFileSync(new URL("../data/people.json", import.meta.url), "utf8"));
const tiers = [1, 2, 3, 4];
const cohorts = [...new Set(people.map((person) => person.cohort_group))].sort();

const advantageFields = [
  "early_family_financial_platform_support_score",
  "parent_family_domain_advantage_score",
  "inherited_audience_business_network_score",
  "elite_institution_performance_pipeline_score",
  "frontier_geography_ecosystem_score",
  "rare_early_tools_facilities_score",
  "dedicated_mentor_coach_tutor_score",
  "exceptional_peer_cofounder_sibling_score",
  "early_online_platform_community_score",
  "direct_customer_domain_exposure_score",
  "prodigy_physical_edge_score",
  "adversity_constraint_catalyst_score",
];

function advantageTotal(person) {
  return advantageFields.reduce((sum, field) => sum + (person[field] || 0), 0);
}

function combinedScore(person) {
  return advantageTotal(person) + (person.total_leverage_score || 0);
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function selectBoundarySample(members) {
  const sorted = [...members].sort((a, b) => combinedScore(a) - combinedScore(b) || a.person_id.localeCompare(b.person_id));
  const candidates = [
    { role: "low-score boundary", person: sorted[0] },
    { role: "median profile", person: sorted[Math.floor((sorted.length - 1) / 2)] },
    { role: "high-score boundary", person: sorted[sorted.length - 1] },
    { role: "seeded representative", person: [...members].sort((a, b) => stableHash(a.person_id) - stableHash(b.person_id))[0] },
  ];
  const used = new Set();
  return candidates.filter(({ person }) => {
    if (!person || used.has(person.person_id)) return false;
    used.add(person.person_id);
    return true;
  });
}

const cells = [];
const failures = [];
for (const cohort of cohorts) {
  for (const tier of tiers) {
    const members = people.filter((person) => person.cohort_group === cohort && person.success_tier === tier);
    if (!members.length) {
      failures.push(`Empty cohort-tier cell: ${cohort} / T${tier}`);
      continue;
    }
    const sample = selectBoundarySample(members);
    for (const { role, person } of sample) {
      const required = [
        person.milestone_by_age_26,
        person.evidence_summary,
        person.source_urls?.length,
        person.trajectory?.length,
      ];
      if (required.some((value) => !value)) {
        failures.push(`Incomplete sampled record: ${person.person_id}`);
      }
      if (person.age_at_milestone > 30) {
        failures.push(`Milestone age outside study window: ${person.person_id}`);
      }
    }
    cells.push({
      cohort,
      tier,
      population: members.length,
      sample: sample.map(({ role, person }) => ({
        role,
        person_id: person.person_id,
        name: person.name,
        age: person.age_at_milestone,
        advantage: advantageTotal(person),
        leverage: person.total_leverage_score,
        earlyMilestone: person.milestone_by_age_26,
        currentPosition: person.current_position,
        currentPositionYear: person.current_position_year,
      })),
    });
  }
}

const sampledIds = new Set(cells.flatMap((cell) => cell.sample.map((person) => person.person_id)));
console.log(JSON.stringify({
  status: failures.length ? "fail" : "structural-pass-manual-review-required",
  population: people.length,
  populatedCells: cells.length,
  sampledPeople: sampledIds.size,
  selection: "low-score boundary, median profile, high-score boundary, seeded representative per cohort-tier cell",
  tierMeaning: "Editorial career recognition through the data cutoff: T1 global icon, T2 field-leading, T3 domain-recognized, T4 specialist-known. The early milestone determines dataset eligibility but does not determine the tier.",
  limitation: "This checks stratification and evidence completeness. Editorial career-tier fit still requires human review; source facts remain not independently audited.",
  failures,
  cells,
}, null, 2));

if (failures.length) process.exitCode = 1;
