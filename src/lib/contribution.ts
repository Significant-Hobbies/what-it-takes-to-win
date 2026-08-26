export const CONTRIBUTION_ISSUES_URL =
  "https://github.com/Significant-Hobbies/what-it-takes-to-win/issues/new";

export type SuggestPersonInput = {
  name: string;
  outcome: string;
  eventDate: string;
  age: string;
  sourceOne: string;
  sourceTwo: string;
  relationship: string;
  notes: string;
  publicConfirmation: boolean;
};

export type ProposeEditInput = {
  person: string;
  profileUrl: string;
  currentClaim: string;
  proposedCorrection: string;
  reason: string;
  sourceOne: string;
  sourceTwo: string;
  relationship: string;
  publicConfirmation: boolean;
};

export type IssueDraft = {
  title: string;
  body: string;
  url: string;
};

export type ValidationErrors = Record<string, string>;

export function isValidPublicUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function required(value: string) {
  return Boolean(value.trim());
}

function issueUrl(title: string, body: string) {
  const params = new URLSearchParams({ title, body });
  return `${CONTRIBUTION_ISSUES_URL}?${params.toString()}`;
}

function evidenceLines(...sources: string[]) {
  return sources.filter(required).map((source) => `- ${source.trim()}`).join("\n");
}

export function validateSuggestion(input: SuggestPersonInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!required(input.name)) errors.name = "Enter the person's public name.";
  if (!required(input.outcome)) {
    errors.outcome = "Describe the dated outcome that may make this person an age-relative outlier.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate)) {
    errors.eventDate = "Choose the event date.";
  }
  const age = Number(input.age);
  if (!required(input.age) || !Number.isInteger(age) || age < 0 || age > 30) {
    errors.age = "Enter an age from 0 through 30.";
  }
  if (!isValidPublicUrl(input.sourceOne)) {
    errors.sourceOne = "Add the first public http or https evidence URL.";
  }
  if (!isValidPublicUrl(input.sourceTwo)) {
    errors.sourceTwo = "Add a second independently useful evidence URL.";
  }
  if (
    isValidPublicUrl(input.sourceOne)
    && isValidPublicUrl(input.sourceTwo)
    && new URL(input.sourceOne).hostname.replace(/^www\./, "")
      === new URL(input.sourceTwo).hostname.replace(/^www\./, "")
  ) {
    errors.sourceTwo = "Use a second evidence domain; two pages from one site are not enough.";
  }
  if (!input.publicConfirmation) {
    errors.publicConfirmation = "Confirm that this draft is suitable for a public issue.";
  }
  return errors;
}

export function validateEdit(input: ProposeEditInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!required(input.person)) errors.person = "Identify the profile this edit concerns.";
  if (input.profileUrl && !isValidPublicUrl(input.profileUrl)) {
    errors.profileUrl = "Use a public http or https profile URL.";
  }
  if (!required(input.currentClaim)) errors.currentClaim = "Quote or summarize the current claim.";
  if (!required(input.proposedCorrection)) {
    errors.proposedCorrection = "State the correction you want the record to make.";
  }
  if (!required(input.reason)) errors.reason = "Explain why the current record should change.";
  if (!isValidPublicUrl(input.sourceOne)) {
    errors.sourceOne = "Add a public authoritative source for the correction.";
  }
  if (input.sourceTwo && !isValidPublicUrl(input.sourceTwo)) {
    errors.sourceTwo = "Use a public http or https evidence URL.";
  }
  if (!input.publicConfirmation) {
    errors.publicConfirmation = "Confirm that this draft is suitable for a public issue.";
  }
  return errors;
}

export function buildSuggestionIssue(input: SuggestPersonInput): IssueDraft {
  const title = `[Person suggestion] ${input.name.trim()}`;
  const body = [
    "## Person",
    "",
    input.name.trim(),
    "",
    "## Dated age-relative outcome",
    "",
    `- Event date: ${input.eventDate}`,
    `- Age at event: ${input.age}`,
    `- Outcome: ${input.outcome.trim()}`,
    "",
    "## Evidence",
    "",
    evidenceLines(input.sourceOne, input.sourceTwo),
    "",
    "## Contributor context",
    "",
    `- Relationship: ${input.relationship || "No relationship disclosed"}`,
    `- Additional notes: ${input.notes.trim() || "None"}`,
    "",
    "## Public-submission confirmation",
    "",
    "- [x] I understand this issue is public and contains no private, confidential, or sensitive personal information.",
    "- [x] I understand that suggestion does not guarantee research, qualification, or publication.",
  ].join("\n");
  return { title, body, url: issueUrl(title, body) };
}

export function buildEditIssue(input: ProposeEditInput): IssueDraft {
  const title = `[Profile edit] ${input.person.trim()}`;
  const body = [
    "## Profile",
    "",
    input.profileUrl.trim()
      ? `[${input.person.trim()}](${input.profileUrl.trim()})`
      : input.person.trim(),
    "",
    "## Current claim",
    "",
    input.currentClaim.trim(),
    "",
    "## Proposed correction",
    "",
    input.proposedCorrection.trim(),
    "",
    "## Why it should change",
    "",
    input.reason.trim(),
    "",
    "## Evidence",
    "",
    evidenceLines(input.sourceOne, input.sourceTwo),
    "",
    "## Contributor context",
    "",
    `- Relationship: ${input.relationship || "No relationship disclosed"}`,
    "",
    "## Public-submission confirmation",
    "",
    "- [x] I understand this issue is public and contains no private, confidential, or sensitive personal information.",
    "- [x] I understand that the existing evidence and publication gates still apply.",
  ].join("\n");
  return { title, body, url: issueUrl(title, body) };
}
