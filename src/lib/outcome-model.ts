export type OutcomePerson = {
  person_id: string;
  name: string;
  cohort_group: string;
  category: string;
  success_tier: number;
  total_leverage_score: number;
  age_at_milestone: number;
  milestone_by_age_26: string;
  early_history_summary?: string;
  starting_point?: string;
  current_position?: string;
  current_position_year?: number;
  is_living?: boolean;
  trajectory?: Array<{ year: number; age: number; title?: string; description?: string }>;
  primary_leverage_engine?: string;
  normalized_primary_engine?: string;
  secondary_engine?: string;
  leverage_evidence_confidence?: string;
  family_context_summary?: string;
  parent_family_domain_summary?: string;
  primary_early_advantage_archetype?: string;
  primary_early_advantage_tags_list: string[];
  evidence_summary?: string;
  early_advantage_evidence_confidence?: string;
  source_count?: number;
  source_audit_status?: string;
  annotation_status?: string;
  source_urls: string[];
  [key: string]: unknown;
};

export type ScoreField = {
  key: string;
  label: string;
  max: number;
  action?: string;
};

export const ADVANTAGE_FIELDS: ScoreField[] = [
  { key: "early_family_financial_platform_support_score", label: "Family financial platform", max: 2 },
  { key: "parent_family_domain_advantage_score", label: "Parent / family domain", max: 2 },
  { key: "inherited_audience_business_network_score", label: "Inherited audience / network", max: 2 },
  { key: "elite_institution_performance_pipeline_score", label: "Elite institution pipeline", max: 2 },
  { key: "frontier_geography_ecosystem_score", label: "Frontier geography", max: 2 },
  { key: "rare_early_tools_facilities_score", label: "Rare early tools", max: 2 },
  { key: "dedicated_mentor_coach_tutor_score", label: "Dedicated mentor / coach", max: 2 },
  { key: "exceptional_peer_cofounder_sibling_score", label: "Exceptional peer / cofounder", max: 2 },
  { key: "early_online_platform_community_score", label: "Early online platform", max: 2 },
  { key: "direct_customer_domain_exposure_score", label: "Direct domain exposure", max: 2 },
  { key: "prodigy_physical_edge_score", label: "Prodigy / innate ability", max: 2 },
  { key: "adversity_constraint_catalyst_score", label: "Adversity / constraint catalyst", max: 2 },
];

export const LEVERAGE_FIELDS: ScoreField[] = [
  {
    key: "started_serious_reps_before_20_score",
    label: "Started serious reps before 20",
    max: 1,
    action: "Protect a recurring deliberate-practice block and begin accumulating evidence of work.",
  },
  {
    key: "prior_reps_score",
    label: "Prior reps",
    max: 3,
    action: "Increase the volume and feedback quality of relevant practice.",
  },
  {
    key: "scarce_skill_depth_score",
    label: "Scarce skill depth",
    max: 3,
    action: "Choose a difficult, valuable skill and build proof that your market can recognize.",
  },
  {
    key: "native_distribution_score",
    label: "Native distribution",
    max: 3,
    action: "Build a repeatable channel to users, readers, customers, or selectors.",
  },
  {
    key: "elite_ecosystem_network_score",
    label: "Elite ecosystem network",
    max: 3,
    action: "Move closer to a dense community where strong work, feedback, and opportunity circulate.",
  },
  {
    key: "complementary_team_score",
    label: "Complementary team",
    max: 2,
    action: "Find a durable collaborator whose strengths cover your recurring bottleneck.",
  },
  {
    key: "structural_wave_score",
    label: "Structural wave / timing",
    max: 3,
    action: "Look for a growing platform, market, or cultural shift where effort can compound.",
  },
  {
    key: "concentration_intensity_score",
    label: "Concentration intensity",
    max: 3,
    action: "Reduce competing commitments and create longer uninterrupted work cycles.",
  },
  {
    key: "capital_safety_score",
    label: "Capital safety",
    max: 2,
    action: "Extend runway through savings, income, grants, or a lower-cost way to keep practicing.",
  },
  {
    key: "domain_proximity_score",
    label: "Domain proximity",
    max: 2,
    action: "Spend more time with the real users, operators, problems, and constraints of the field.",
  },
];

export const SCORE_FAMILIES = {
  advantage: {
    label: "Starting advantages",
    shortLabel: "Starting advantage",
    max: ADVANTAGE_FIELDS.reduce((sum, field) => sum + field.max, 0),
    definition: "Access or conditions documented near the beginning of the path.",
    boundary: "Describes the starting position, not what the person later made of it.",
  },
  leverage: {
    label: "Built or converted leverage",
    shortLabel: "Capability leverage",
    max: LEVERAGE_FIELDS.reduce((sum, field) => sum + field.max, 0),
    definition: "Multiplying capacity documented later in the path.",
    boundary: "Measures what was present, not whether it was inherited, earned, self-built, external, or mixed.",
  },
} as const;

export const LEVERAGE_ORIGINS = [
  { key: "self-built", label: "Self-built", summary: "Practice, skill, focus, or distribution accumulated directly." },
  { key: "advantage-enabled", label: "Advantage-enabled", summary: "A starting resource made the capability easier to develop." },
  { key: "earned", label: "Earned access", summary: "Earlier work unlocked institutions, collaborators, capital, or reach." },
  { key: "external", label: "External", summary: "Timing, a platform shift, or another structural wave multiplied the work." },
  { key: "mixed", label: "Mixed", summary: "Several origins combined and cannot be cleanly separated." },
  { key: "unresolved", label: "Unresolved", summary: "The current evidence cannot distinguish how the capability arose." },
] as const;

export const LUCK_FORMS = [
  {
    key: "structural",
    label: "Structural luck",
    summary: "Birthplace, era, family, geography, institutions, and being near the right frontier.",
  },
  {
    key: "encounter",
    label: "Encounter luck",
    summary: "Meeting a collaborator, mentor, coach, investor, selector, or first customer.",
  },
  {
    key: "event",
    label: "Event luck",
    summary: "An algorithm boost, market shock, competitor failure, injury avoided, or unexpected opening.",
  },
  {
    key: "variance",
    label: "Outcome variance",
    summary: "Similar visible inputs can still produce different results for reasons the record cannot recover.",
  },
] as const;

export type LeverageOriginKey = (typeof LEVERAGE_ORIGINS)[number]["key"];

export type LeverageProvenance = {
  field: ScoreField;
  value: number;
  origin: LeverageOriginKey;
  originLabel: string;
  confidence: "low" | "medium";
  signals: string[];
  rationale: string;
};

const PROVENANCE_LINKS: Record<string, string[]> = {
  started_serious_reps_before_20_score: [
    "parent_family_domain_advantage_score",
    "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "elite_institution_performance_pipeline_score",
    "early_online_platform_community_score",
  ],
  prior_reps_score: [
    "parent_family_domain_advantage_score",
    "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "elite_institution_performance_pipeline_score",
    "early_online_platform_community_score",
  ],
  scarce_skill_depth_score: [
    "parent_family_domain_advantage_score",
    "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "elite_institution_performance_pipeline_score",
    "early_online_platform_community_score",
  ],
  native_distribution_score: [
    "inherited_audience_business_network_score",
    "early_online_platform_community_score",
    "elite_institution_performance_pipeline_score",
  ],
  elite_ecosystem_network_score: [
    "inherited_audience_business_network_score",
    "parent_family_domain_advantage_score",
    "elite_institution_performance_pipeline_score",
    "frontier_geography_ecosystem_score",
    "exceptional_peer_cofounder_sibling_score",
  ],
  complementary_team_score: [
    "exceptional_peer_cofounder_sibling_score",
    "elite_institution_performance_pipeline_score",
    "early_online_platform_community_score",
  ],
  structural_wave_score: [
    "frontier_geography_ecosystem_score",
    "early_online_platform_community_score",
  ],
  concentration_intensity_score: [
    "early_family_financial_platform_support_score",
    "dedicated_mentor_coach_tutor_score",
    "adversity_constraint_catalyst_score",
  ],
  capital_safety_score: [
    "early_family_financial_platform_support_score",
    "elite_institution_performance_pipeline_score",
  ],
  domain_proximity_score: [
    "direct_customer_domain_exposure_score",
    "parent_family_domain_advantage_score",
    "frontier_geography_ecosystem_score",
    "elite_institution_performance_pipeline_score",
  ],
};

export const TIER_DEFINITIONS = [
  {
    tier: 1,
    name: "Global icon",
    short: "Legendary or globally iconic career standing",
    description:
      "The documented career became a durable global reference point, shaped a field, or reached iconic recognition well beyond its immediate domain.",
  },
  {
    tier: 2,
    name: "Field-leading",
    short: "Dominant figure at the top of a field",
    description:
      "The documented career reached the top level of its field through major prizes, championships, commercial impact, or sustained elite recognition.",
  },
  {
    tier: 3,
    name: "Domain-recognized",
    short: "Notable and widely recognized within the domain",
    description:
      "The documented career established substantial credibility and recognition among people who follow the field.",
  },
  {
    tier: 4,
    name: "Specialist-known",
    short: "Notable, but primarily known within a niche",
    description:
      "The documented career is notable and the early milestone is unusual, but recognition remains narrower or concentrated among specialists.",
  },
] as const;

export const OUTCOME_STAGES = [
  {
    number: "01",
    name: "Starting advantages",
    summary: "Access, family context, institutions, geography, mentors, peers, tools, ability, and constraints shape the first available moves.",
  },
  {
    number: "02",
    name: "Built or converted leverage",
    summary: "Reps, scarce skill, distribution, teams, timing, focus, runway, and domain proximity create multiplying capacity. Its origin may be built, enabled, earned, external, or mixed.",
  },
  {
    number: "03",
    name: "Compounding trajectory",
    summary: "Repeated work, feedback, relationships, and well-timed decisions accumulate into a path that becomes difficult to copy quickly.",
  },
  {
    number: "04",
    name: "Observed career standing",
    summary: "The tier summarizes documented career recognition through the data cutoff. It is editorial, not calculated from advantage scores or a forecast.",
  },
] as const;

function numeric(person: OutcomePerson, key: string): number {
  const value = person[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function sumScoreFields(person: OutcomePerson, fields: ScoreField[]): number {
  return fields.reduce((sum, field) => sum + numeric(person, field.key), 0);
}

export function getAdvantageTotal(person: OutcomePerson): number {
  return sumScoreFields(person, ADVANTAGE_FIELDS);
}

export function getLeverageTotal(person: OutcomePerson): number {
  return typeof person.total_leverage_score === "number"
    ? person.total_leverage_score
    : sumScoreFields(person, LEVERAGE_FIELDS);
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function quantile(values: number[], fraction: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

function pearson(valuesA: number[], valuesB: number[]): number {
  if (valuesA.length !== valuesB.length || valuesA.length < 2) return 0;
  const meanA = mean(valuesA);
  const meanB = mean(valuesB);
  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;
  for (let index = 0; index < valuesA.length; index += 1) {
    const deltaA = valuesA[index] - meanA;
    const deltaB = valuesB[index] - meanB;
    numerator += deltaA * deltaB;
    denominatorA += deltaA * deltaA;
    denominatorB += deltaB * deltaB;
  }
  return denominatorA && denominatorB
    ? numerator / Math.sqrt(denominatorA * denominatorB)
    : 0;
}

export function percentileRank(values: number[], value: number): number {
  if (!values.length) return 0;
  const atOrBelow = values.filter((candidate) => candidate <= value).length;
  return Math.round((atOrBelow / values.length) * 100);
}

export function getTierDefinition(tier: number) {
  return TIER_DEFINITIONS.find((definition) => definition.tier === tier) ?? TIER_DEFINITIONS[3];
}

export function summarizeOutcomes(people: OutcomePerson[]) {
  let higherOutcomeCount = 0;
  const tiers = TIER_DEFINITIONS.map((definition) => {
    const members = people.filter((person) => person.success_tier === definition.tier);
    const advantages = members.map(getAdvantageTotal);
    const leverage = members.map(getLeverageTotal);
    const count = members.length;
    const rankStart = higherOutcomeCount + 1;
    const rankEnd = higherOutcomeCount + count;
    const lowerOutcomeCount = Math.max(people.length - rankEnd, 0);
    const tierSummary = {
      ...definition,
      count,
      share: people.length ? (count / people.length) * 100 : 0,
      rankStart,
      rankEnd,
      topBandStart: people.length ? (higherOutcomeCount / people.length) * 100 : 0,
      topBandEnd: people.length ? (rankEnd / people.length) * 100 : 0,
      lowerOutcomeCount,
      lowerPerMember: count ? lowerOutcomeCount / count : 0,
      advantage: {
        mean: mean(advantages),
        p25: quantile(advantages, 0.25),
        median: quantile(advantages, 0.5),
        p75: quantile(advantages, 0.75),
        min: advantages.length ? Math.min(...advantages) : 0,
        max: advantages.length ? Math.max(...advantages) : 0,
      },
      leverage: {
        mean: mean(leverage),
        p25: quantile(leverage, 0.25),
        median: quantile(leverage, 0.5),
        p75: quantile(leverage, 0.75),
        min: leverage.length ? Math.min(...leverage) : 0,
        max: leverage.length ? Math.max(...leverage) : 0,
      },
    };
    higherOutcomeCount = rankEnd;
    return tierSummary;
  });

  const advantageTotals = people.map(getAdvantageTotal);
  const leverageTotals = people.map(getLeverageTotal);
  const betterTier = people.map((person) => 5 - person.success_tier);

  return {
    tiers,
    advantageCorrelation: pearson(advantageTotals, betterTier),
    leverageCorrelation: pearson(leverageTotals, betterTier),
    advantageMean: mean(advantageTotals),
    leverageMean: mean(leverageTotals),
  };
}

export function getStrongestFields(person: OutcomePerson, fields: ScoreField[], limit = 3) {
  return fields
    .map((field) => ({ ...field, value: numeric(person, field.key) }))
    .filter((field) => field.value > 0)
    .sort((a, b) => (b.value / b.max) - (a.value / a.max) || b.value - a.value)
    .slice(0, limit);
}

function originDefinition(origin: LeverageOriginKey) {
  return LEVERAGE_ORIGINS.find((candidate) => candidate.key === origin) ?? LEVERAGE_ORIGINS[5];
}

export function inferLeverageProvenance(
  person: OutcomePerson,
  field: ScoreField,
): LeverageProvenance {
  const linkedFields = (PROVENANCE_LINKS[field.key] || [])
    .map((key) => ADVANTAGE_FIELDS.find((candidate) => candidate.key === key))
    .filter((candidate): candidate is ScoreField => Boolean(candidate));
  const positiveSignals = linkedFields
    .map((candidate) => ({ field: candidate, value: numeric(person, candidate.key) }))
    .filter((candidate) => candidate.value > 0)
    .map((candidate) => `${candidate.field.label} (${candidate.value}/${candidate.field.max})`);
  const narrative = [
    person.early_history_summary,
    person.evidence_summary,
    person.starting_point,
  ].filter(Boolean).join(" ").toLowerCase();
  const selfDirected = /self[- ]taught|taught (himself|herself|themselves)|on (his|her|their) own|independently (built|learned|trained)|began (coding|building|training|practicing)|started (coding|building|training|practicing)/.test(narrative);
  const earnedAccess = /scholarship|fellowship|selected for|accepted into|admitted to|earned (a|an|the)|won (a|the)/.test(narrative);
  const canBeSelfDirected = [
    "started_serious_reps_before_20_score",
    "prior_reps_score",
    "scarce_skill_depth_score",
    "native_distribution_score",
    "concentration_intensity_score",
  ].includes(field.key);
  const canBeEarnedAccess = [
    "native_distribution_score",
    "elite_ecosystem_network_score",
    "complementary_team_score",
    "capital_safety_score",
    "domain_proximity_score",
  ].includes(field.key);

  let origin: LeverageOriginKey = "unresolved";
  let confidence: "low" | "medium" = "low";
  let rationale = "No current annotation distinguishes self-built, enabled, or earned origins for this lever.";

  if (field.key === "structural_wave_score") {
    origin = "external";
    confidence = "medium";
    rationale = "A structural wave is external to the person, even when their position improved access to it.";
  } else if (positiveSignals.length && selfDirected && canBeSelfDirected) {
    origin = "mixed";
    confidence = "medium";
    rationale = "Mapped starting advantages and self-directed-building language are both documented.";
  } else if (positiveSignals.length) {
    origin = "advantage-enabled";
    confidence = "medium";
    rationale = "One or more documented starting advantages plausibly enabled this lever.";
  } else if (selfDirected && canBeSelfDirected) {
    origin = "self-built";
    confidence = "low";
    rationale = "The biography uses self-directed-building language, but the origin was not independently annotated.";
  } else if (earnedAccess && canBeEarnedAccess) {
    origin = "earned";
    confidence = "low";
    rationale = "The biography describes selection or earned access, but does not isolate this lever’s origin.";
  }

  const definition = originDefinition(origin);
  return {
    field,
    value: numeric(person, field.key),
    origin,
    originLabel: definition.label,
    confidence,
    signals: positiveSignals,
    rationale,
  };
}

export function getPersonLeverageProvenance(person: OutcomePerson): LeverageProvenance[] {
  return LEVERAGE_FIELDS
    .filter((field) => numeric(person, field.key) > 0)
    .map((field) => inferLeverageProvenance(person, field))
    .sort((a, b) => (b.value / b.field.max) - (a.value / a.field.max));
}

export function isComparisonPageIndexable(person: OutcomePerson): boolean {
  return Number(person.source_count || 0) >= 2
    && String(person.leverage_evidence_confidence || "").toLowerCase() !== "low"
    && Boolean(person.milestone_by_age_26?.trim())
    && Array.isArray(person.trajectory)
    && person.trajectory.length > 0;
}

type CounterexamplePair = {
  kind: "same-totals" | "same-leverage" | "same-start";
  title: string;
  explanation: string;
  first: OutcomePerson;
  second: OutcomePerson;
  sharedValue: string;
};

function groupedPairs(
  people: OutcomePerson[],
  keyFor: (person: OutcomePerson) => string,
  scorePair: (first: OutcomePerson, second: OutcomePerson) => number,
) {
  const groups = new Map<string, OutcomePerson[]>();
  for (const person of people) {
    const key = keyFor(person);
    groups.set(key, [...(groups.get(key) || []), person]);
  }
  let best: { first: OutcomePerson; second: OutcomePerson; score: number; key: string } | null = null;
  for (const [key, members] of groups) {
    const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));
    for (let left = 0; left < sorted.length; left += 1) {
      for (let right = left + 1; right < sorted.length; right += 1) {
        const score = scorePair(sorted[left], sorted[right]);
        if (!best || score > best.score) best = { first: sorted[left], second: sorted[right], score, key };
      }
    }
  }
  return best;
}

export function getPathCounterexamples(people: OutcomePerson[]): CounterexamplePair[] {
  const pool = people.filter(isComparisonPageIndexable);
  const sameTotals = groupedPairs(
    pool,
    (person) => `${getAdvantageTotal(person)}:${getLeverageTotal(person)}`,
    (first, second) =>
      Math.abs(first.success_tier - second.success_tier) * 100
      + (first.cohort_group !== second.cohort_group ? 20 : 0)
      + Math.abs((first.trajectory?.length || 0) - (second.trajectory?.length || 0)),
  );
  const sameLeverage = groupedPairs(
    pool,
    (person) => String(getLeverageTotal(person)),
    (first, second) =>
      Math.abs(getAdvantageTotal(first) - getAdvantageTotal(second)) * 10
      + Math.abs(first.success_tier - second.success_tier),
  );
  const sameStart = groupedPairs(
    pool,
    (person) => String(getAdvantageTotal(person)),
    (first, second) =>
      Math.abs(getLeverageTotal(first) - getLeverageTotal(second)) * 10
      + Math.abs(first.success_tier - second.success_tier),
  );

  return [
    sameTotals && {
      kind: "same-totals" as const,
      title: "Same totals, different observed standing",
      explanation: "Identical aggregate scores can conceal different fields, timing, trajectories, and career recognition.",
      first: sameTotals.first,
      second: sameTotals.second,
      sharedValue: `${getAdvantageTotal(sameTotals.first)}/24 start · ${getLeverageTotal(sameTotals.first)}/25 leverage`,
    },
    sameLeverage && {
      kind: "same-leverage" as const,
      title: "Same leverage, different starting position",
      explanation: "The same capability total does not reveal how much access preceded it or where each lever came from.",
      first: sameLeverage.first,
      second: sameLeverage.second,
      sharedValue: `${getLeverageTotal(sameLeverage.first)}/25 leverage`,
    },
    sameStart && {
      kind: "same-start" as const,
      title: "Same starting total, different later capacity",
      explanation: "A similar head start does not determine which capabilities are later built, converted, earned, or encountered.",
      first: sameStart.first,
      second: sameStart.second,
      sharedValue: `${getAdvantageTotal(sameStart.first)}/24 starting advantage`,
    },
  ].filter((pair): pair is CounterexamplePair => Boolean(pair));
}

export function buildPersonPath(person: OutcomePerson, people: OutcomePerson[]) {
  const cohort = people.filter((candidate) => candidate.cohort_group === person.cohort_group);
  const tier = people.filter((candidate) => candidate.success_tier === person.success_tier);
  const advantageTotal = getAdvantageTotal(person);
  const leverageTotal = getLeverageTotal(person);
  const cohortAdvantages = cohort.map(getAdvantageTotal);
  const cohortLeverage = cohort.map(getLeverageTotal);
  const tierAdvantages = tier.map(getAdvantageTotal);
  const tierLeverage = tier.map(getLeverageTotal);

  return {
    advantageTotal,
    leverageTotal,
    strongestAdvantages: getStrongestFields(person, ADVANTAGE_FIELDS),
    strongestLeverage: getStrongestFields(person, LEVERAGE_FIELDS),
    cohortAdvantagePercentile: percentileRank(cohortAdvantages, advantageTotal),
    cohortLeveragePercentile: percentileRank(cohortLeverage, leverageTotal),
    tierAdvantageMean: mean(tierAdvantages),
    tierLeverageMean: mean(tierLeverage),
    tierDefinition: getTierDefinition(person.success_tier),
  };
}
