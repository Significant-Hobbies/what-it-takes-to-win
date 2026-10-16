export type AuditDomain = string;
export type FirstProofSource = { id: string; domain: string; url: string; people: string };
export type FirstProofScreening = { milestoneAge: string; locatedProof: string; background: string; unresolvedIssue: string; researchDepth: string };
export type FirstProofResearch = {
  screeningCorrection?: FirstProofScreening;
  sources?: { id: string; url: string; accessedOn: string; claim: string; origin: string; verified: boolean; primary: boolean; supports: string[] }[];
};
export type FirstProofReview = {
  evidenceStatus: string;
  trajectoryType: string;
  milestone: { result: string; date: string; ageMin: number; ageMax: number; validator: string; selectionBasis: string; comparisonPool: string; contribution: string };
  hasEarlierQualifyingProof: boolean | null;
  earlyHistory: Record<AuditDomain, { state: string; note: string }>;
  sources: { id: string; url?: string; accessedOn: string; claim: string; origin: string; verified: boolean; primary: boolean; supports: string[] }[];
  contradictions: { resolved: boolean; resolution: string }[];
  publication: { approved: boolean; reviewer: string; secondReviewer: string; reviewedOn: string; coverageStatement: string; takeaway: string; rightsReviewed: boolean; acceptedLimitations: string[] };
  timeline: { capability: { when: string; detail: string }[]; proof: { when: string; detail: string }[] };
};
export type FirstProofRecord = {
  id: string; name: string; domain: string; intakeStatus: "A" | "B" | "C";
  milestoneAge: string; locatedProof: string; background: string; unresolvedIssue: string;
  researchDepth: string; sourceIds: string[]; publicationStatus: string;
  provenance: { sheet: string; row: number }; intake: FirstProofScreening | null;
  research: FirstProofResearch | null; review: FirstProofReview | null;
};
export type FirstProofIntakeRecord = Omit<FirstProofRecord, "intake" | "research" | "review">;
export declare const AUDIT_DOMAINS: AuditDomain[];
export declare const INTAKE_LABELS: Record<FirstProofRecord["intakeStatus"], string>;
export declare const TRAJECTORY_LABELS: Record<string, string>;
export declare const firstProofSources: FirstProofSource[];
export declare const firstProofIntakeRecords: FirstProofIntakeRecord[];
export declare const firstProofSnapshot: string;
export declare const firstProofWorkbook: { name: string; sha256: string };
export declare const firstProofRecords: FirstProofRecord[];
export declare const publishedFirstProofRecords: FirstProofRecord[];
export declare function publicationBlockers(record: FirstProofRecord): string[];
export declare function recordSources(record: FirstProofRecord): FirstProofSource[];
export declare function locatedAgeBand(value: string): string;
export declare function summarizeFirstProof(): { people: number; candidates: number; held: number; priority: number; recordOnly: number; sources: number; published: number };
