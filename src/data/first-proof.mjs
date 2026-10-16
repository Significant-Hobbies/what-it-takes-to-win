import register from "./first-proof-register.json" with { type: "json" };
import reviews from "./first-proof-reviews.json" with { type: "json" };

export const AUDIT_DOMAINS = [
  "School and university", "Sport", "Arts, music and writing",
  "Work and business", "Technical and scientific activity", "Other competitive or community pursuits",
];

export const INTAKE_LABELS = { A: "Priority audit lead", B: "Open audit lead", C: "Held back" };
export const TRAJECTORY_LABELS = {
  unresolved: "Unresolved",
  "adult-development": "First adult proof with documented adult development",
  "development-unclear": "First adult proof with development timing unclear",
  "delayed-recognition": "Delayed recognition of earlier excellence",
  transfer: "Transfer of earlier excellence",
};

export const firstProofSources = register.sources;
export const firstProofSnapshot = register.snapshotDate;
export const firstProofWorkbook = { name: register.workbook, sha256: register.workbookSha256 };
export const firstProofIntakeRecords = register.records;
export const firstProofRecords = firstProofIntakeRecords.map((record) => {
  const research = reviews[record.id] ?? null;
  const correction = research?.screeningCorrection ?? null;
  return {
    ...record,
    ...(correction ? {
      milestoneAge: correction.milestoneAge,
      locatedProof: correction.locatedProof,
      background: correction.background,
      unresolvedIssue: correction.unresolvedIssue,
      researchDepth: correction.researchDepth,
    } : {}),
    intake: correction ? {
      milestoneAge: record.milestoneAge,
      locatedProof: record.locatedProof,
      background: record.background,
      unresolvedIssue: record.unresolvedIssue,
      researchDepth: record.researchDepth,
    } : null,
    research: correction || research?.sources ? research : null,
    review: research?.evidenceStatus ? research : null,
  };
});

// Keep workbook intake immutable while showing bounded corrections and later sources.
export function recordSources(record) {
  const sources = record.sourceIds.map((id) => firstProofSources.find((source) => source.id === id));
  for (const evidence of [...(record.research?.sources ?? []), ...(record.review?.sources ?? [])]) {
    if (sources.some((source) => source.id === evidence.id)) continue;
    const registered = firstProofSources.find((source) => source.id === evidence.id);
    if (registered) sources.push(registered);
    else if (evidence.url && evidence.id) {
      try {
        const url = new URL(evidence.url);
        if (["http:", "https:"].includes(url.protocol)) sources.push({ id: evidence.id, domain: url.hostname, url: evidence.url, people: record.name });
      } catch { /* Invalid sources cannot become public evidence links. */ }
    }
  }
  return sources;
}

// Screening age labels are not certified dates. Approximate or cross-band
// intervals stay unresolved rather than being rounded into a desired cohort.
export function locatedAgeBand(value) {
  const match = value.match(/^(\d{2})(?:[–-](\d{2}))?$/);
  if (!match) return "unresolved";
  const low = Number(match[1]);
  const high = Number(match[2] ?? match[1]);
  for (const [min, max] of [[26, 29], [30, 34], [35, 39]]) {
    if (low >= min && high <= max && low <= high) return `${min}-${max}`;
  }
  if (high < 26 || low > 39) return "outside";
  return "unresolved";
}

// A/B/C are intake priorities. Only an explicit, independently challenged
// editorial review can unlock a core profile; absent fields fail closed.
function validDate(value) {
  if (!/^\d{4}(-\d{2})?(-\d{2})?$/.test(value ?? "")) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
}

function milestoneBlockers(review) {
  const blockers = [];
  const milestone = review.milestone;
  if (!milestone || !Number.isInteger(milestone.ageMin) || !Number.isInteger(milestone.ageMax)
    || milestone.ageMin < 26 || milestone.ageMax > 39 || milestone.ageMin > milestone.ageMax) {
    blockers.push("First-proof age must be resolved within 26–39.");
  }
  if (!validDate(milestone?.date) || !milestone?.result
    || !milestone.validator || !milestone.selectionBasis || !milestone.comparisonPool || !milestone.contribution) {
    blockers.push("Milestone date, validator, selection and personal contribution need evidence.");
  }
  return blockers;
}

function historyBlockers(review) {
  const blockers = [];
  if (review.hasEarlierQualifyingProof !== false) blockers.push("Earlier qualifying proof is present or unresolved.");
  for (const domain of AUDIT_DOMAINS) {
    const audit = review.earlyHistory?.[domain];
    if (!audit?.note || !["reviewed", "not-applicable", "limited"].includes(audit.state)
      || (audit.state === "limited" && !review.publication?.acceptedLimitations?.includes(domain))) {
      blockers.push(`${domain}: coverage is incomplete or its limitation is unaccepted.`);
    }
  }
  return blockers;
}

function evidenceBlockers(record) {
  const review = record.review;
  const blockers = [];
  const associated = recordSources(record);
  const evidence = (review.sources ?? []).filter((source) => associated.some((item) => item.id === source.id
    && (!source.url || source.url === item.url))
    && validDate(source.accessedOn) && source.claim && source.origin && source.verified === true);
  if (!evidence.some((source) => source.primary && source.supports?.includes("milestone"))) blockers.push("Primary milestone evidence is missing.");
  if (!evidence.some((source) => source.supports?.includes("early-history"))) blockers.push("Substantive earlier-history evidence is missing.");
  if (!evidence.some((source) => source.supports?.includes("age"))) blockers.push("Age evidence is missing.");
  if (new Set(evidence.map((source) => source.origin)).size < 2) blockers.push("Two independent evidence origins are required.");
  if (!Array.isArray(review.contradictions) || review.contradictions.some((item) => item.resolved !== true || !item.resolution)) {
    blockers.push("Cohort-changing contradictions remain unresolved.");
  }
  return blockers;
}

function editorialBlockers(review) {
  const blockers = [];
  const publication = review.publication;
  if (!publication?.approved || !publication.reviewer || !publication.secondReviewer
    || publication.reviewer === publication.secondReviewer || !validDate(publication.reviewedOn)
    || !publication.coverageStatement || !publication.takeaway || !publication.rightsReviewed) {
    blockers.push("Publication approval, independent challenge, rights and reader-facing limits are required.");
  }
  if (![review.timeline?.capability, review.timeline?.proof].every((lane) => lane?.length
    && lane.every((step) => step.when?.trim() && step.detail?.trim()))) {
    blockers.push("Both development and external-proof timelines are required.");
  }
  return blockers;
}

export function publicationBlockers(record) {
  const review = record.review;
  if (!review) return ["Earlier-history audit and editorial review not completed."];
  const blockers = [];
  if (!["probable-fit", "corroborated-fit"].includes(review.evidenceStatus)) blockers.push("Evidence review has not established a fit.");
  if (!["adult-development", "development-unclear"].includes(review.trajectoryType)) blockers.push("Trajectory is outside the core collection or unresolved.");
  return [...blockers, ...milestoneBlockers(review), ...historyBlockers(review), ...evidenceBlockers(record), ...editorialBlockers(review)];
}

export const publishedFirstProofRecords = firstProofRecords.filter((record) => publicationBlockers(record).length === 0);

export function summarizeFirstProof() {
  return {
    people: firstProofRecords.length,
    candidates: firstProofRecords.filter((record) => record.intakeStatus !== "C").length,
    held: firstProofRecords.filter((record) => record.intakeStatus === "C").length,
    priority: firstProofRecords.filter((record) => record.intakeStatus === "A").length,
    recordOnly: firstProofRecords.filter((record) => record.researchDepth.startsWith("Competition record:")).length,
    sources: new Set([...firstProofSources.map((source) => source.url), ...firstProofRecords.flatMap((record) => recordSources(record).map((source) => source.url))]).size,
    published: publishedFirstProofRecords.length,
  };
}
