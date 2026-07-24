export interface CoveragePerson {
  source_urls?: unknown[];
  trajectory?: unknown[];
  milestone_by_age_26?: string;
  early_history_summary?: string;
  family_context_summary?: string;
  evidence_summary?: string;
  current_position?: string;
  leverage_evidence_confidence?: string;
  early_advantage_evidence_confidence?: string;
  source_audit_status?: string;
  cohort_group?: string;
  success_tier?: number;
}

export interface CoverageBand {
  label: string;
  count: number;
  share: number;
}

const percent = (count: number, total: number) =>
  total === 0 ? 0 : Math.round((count / total) * 10000) / 100;

const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

const confidenceBands = (
  people: CoveragePerson[],
  field: "leverage_evidence_confidence" | "early_advantage_evidence_confidence",
): CoverageBand[] =>
  ["High", "Medium", "Low"].map((label) => {
    const count = people.filter((person) => person[field] === label).length;
    return { label, count, share: percent(count, people.length) };
  });

const sourceDomainCount = (person: CoveragePerson) => {
  if (!Array.isArray(person.source_urls)) return 0;
  return new Set(
    person.source_urls
      .map((source) => {
        try {
          return typeof source === "string"
            ? new URL(source).hostname.replace(/^www\./, "")
            : "";
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  ).size;
};

export function summarizeCoverage(people: CoveragePerson[]) {
  const total = people.length;
  const sourcesTwoPlus = people.filter(
    (person) => Array.isArray(person.source_urls) && person.source_urls.length >= 2,
  ).length;
  const trajectoriesComplete = people.filter(
    (person) => Array.isArray(person.trajectory) && person.trajectory.length >= 3,
  ).length;
  const narrativeComplete = people.filter(
    (person) =>
      hasText(person.milestone_by_age_26) &&
      hasText(person.early_history_summary) &&
      hasText(person.family_context_summary) &&
      hasText(person.evidence_summary) &&
      hasText(person.current_position),
  ).length;
  const indexable = people.filter(
    (person) =>
      Array.isArray(person.source_urls) &&
      person.source_urls.length >= 2 &&
      person.leverage_evidence_confidence !== "Low" &&
      hasText(person.milestone_by_age_26) &&
      Array.isArray(person.trajectory) &&
      person.trajectory.length > 0,
  ).length;
  const independentlyAudited = people.filter(
    (person) => person.source_audit_status === "independently_audited",
  ).length;
  const twoDistinctSourceDomains = people.filter(
    (person) => sourceDomainCount(person) >= 2,
  ).length;

  const cohorts = [...new Set(people.map((person) => person.cohort_group).filter(Boolean))]
    .map((label) => {
      const count = people.filter((person) => person.cohort_group === label).length;
      return { label: String(label), count, share: percent(count, total) };
    })
    .sort((a, b) => b.count - a.count);

  const tiers = [1, 2, 3, 4].map((tier) => {
    const count = people.filter((person) => person.success_tier === tier).length;
    return { label: `T${tier}`, count, share: percent(count, total) };
  });

  return {
    total,
    sourcesTwoPlus: {
      count: sourcesTwoPlus,
      share: percent(sourcesTwoPlus, total),
    },
    trajectoriesComplete: {
      count: trajectoriesComplete,
      share: percent(trajectoriesComplete, total),
    },
    narrativeComplete: {
      count: narrativeComplete,
      share: percent(narrativeComplete, total),
    },
    indexable: {
      count: indexable,
      share: percent(indexable, total),
    },
    independentlyAudited: {
      count: independentlyAudited,
      share: percent(independentlyAudited, total),
    },
    twoDistinctSourceDomains: {
      count: twoDistinctSourceDomains,
      share: percent(twoDistinctSourceDomains, total),
    },
    leverageConfidence: confidenceBands(people, "leverage_evidence_confidence"),
    advantageConfidence: confidenceBands(people, "early_advantage_evidence_confidence"),
    cohorts,
    tiers,
  };
}
