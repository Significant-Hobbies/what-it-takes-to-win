import type { OutcomePerson } from "./outcome-model";

type ReachBandKey = "extreme-outlier" | "field-leading" | "professionally-distinctive";

type ReachBand = {
  key: ReachBandKey;
  label: string;
  description: string;
  percentileLabel: string | null;
};

const REACH_BANDS: Record<ReachBandKey, ReachBand> = {
  "extreme-outlier": {
    key: "extreme-outlier",
    label: "Extreme public outlier",
    description: "Globally visible outcomes that dominate remembered success stories.",
    percentileLabel: null,
  },
  "field-leading": {
    key: "field-leading",
    label: "Field-leading",
    description: "Sustained recognition near the front of a documented field.",
    percentileLabel: null,
  },
  "professionally-distinctive": {
    key: "professionally-distinctive",
    label: "Professionally distinctive",
    description:
      "The broader success band often described informally as the top 0.1%; no universal percentile is claimed without a field denominator.",
    percentileLabel: "Toward the 0.1% band",
  },
};

export function getReachBand(person: Pick<OutcomePerson, "success_tier">): ReachBand {
  if (person.success_tier === 1) return REACH_BANDS["extreme-outlier"];
  if (person.success_tier === 2) return REACH_BANDS["field-leading"];
  return REACH_BANDS["professionally-distinctive"];
}

export function summarizeReachBands(people: Pick<OutcomePerson, "success_tier">[]) {
  const total = people.length;
  return Object.values(REACH_BANDS).map((band) => {
    const count = people.filter((person) => getReachBand(person).key === band.key).length;
    return {
      ...band,
      count,
      share: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
    };
  });
}

export type PathEvidence = {
  label: string;
  summary: string;
  boundary: string;
  sourceUrls: string[];
};

const PERSEVERANCE_CUES = [
  /\bpractic(?:e|ed|ing)\b/i,
  /\btrain(?:ed|ing)\b/i,
  /\bcontinued\b/i,
  /\bkept\b/i,
  /\bpersist(?:ed|ence|ent)\b/i,
  /\breject(?:ed|ion|ions)\b/i,
  /\bfail(?:ed|ure|ures)\b/i,
  /\brecover(?:ed|y)\b/i,
  /\bsetback(?:s)?\b/i,
  /\bfor \w+ years\b/i,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten) years\b/i,
  /\b\d+ years\b/i,
  /\bhours? (?:a|per) day\b/i,
  /\bworking multiple jobs\b/i,
];

const LUCK_CUES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Encounter luck", pattern: /\b(discovered|spotted|scout|introduced|met|recruited|selected|invited)\b/i },
  { label: "Event luck", pattern: /\b(viral|algorithm|unexpected|shock|accident|injury|competitor failure)\b/i },
  { label: "Structural luck", pattern: /\b(wave|timing|emerged|frontier|hub|platform change|market shift)\b/i },
];

function evidenceSentences(person: OutcomePerson) {
  const trajectoryText = (person.trajectory ?? []).flatMap((step) => [step.title ?? "", step.description ?? ""]);
  return [
    person.early_history_summary ?? "",
    person.evidence_summary ?? "",
    person.endowment_summary ?? "",
    person.ecosystem_summary ?? "",
    ...trajectoryText,
  ]
    .flatMap((text) => text.split(/(?<=[.!?])\s+/))
    .map((text) => text.trim())
    .filter(Boolean);
}

function trajectorySentences(person: OutcomePerson) {
  return (person.trajectory ?? [])
    .flatMap((step) => [step.title ?? "", step.description ?? ""])
    .flatMap((text) => text.split(/(?<=[.!?])\s+/))
    .map((text) => text.trim())
    .filter(Boolean);
}

function firstMatchingSentence(sentences: string[], patterns: RegExp[]) {
  return sentences.find((sentence) => patterns.some((pattern) => pattern.test(sentence))) ?? "";
}

export function getPerseveranceEvidence(person: OutcomePerson): PathEvidence {
  const summary = firstMatchingSentence(evidenceSentences(person), PERSEVERANCE_CUES);
  return {
    label: "Documented perseverance",
    summary: summary || "Not documented in the reviewed biographical summaries.",
    boundary: summary
      ? "This records repeated behaviour or recovery described by sources; it is not a grit or merit score."
      : "Silence in a biography is not evidence that perseverance was absent.",
    sourceUrls: summary ? person.source_urls.slice(0, 3) : [],
  };
}

export function getLuckEvidence(person: OutcomePerson): PathEvidence {
  // Prefer a dated trajectory event over a broad biographical sentence that
  // may describe both repeated work and the encounter it eventually met.
  const sentences = [...trajectorySentences(person), ...evidenceSentences(person)];
  const match = LUCK_CUES.map((cue) => ({
    ...cue,
    summary: sentences.find((sentence) => cue.pattern.test(sentence)) ?? "",
  })).find((cue) => cue.summary);

  return {
    label: match?.label ?? "Luck and unobserved variance",
    summary: match?.summary || "No discrete luck event is documented in the reviewed biographical summaries.",
    boundary: match
      ? "This is an unchosen opening or condition in the record, not an estimate of how much luck caused the outcome."
      : "A successful-only archive cannot recover all encounters, avoided setbacks, or alternative outcomes.",
    sourceUrls: match ? person.source_urls.slice(0, 3) : [],
  };
}
