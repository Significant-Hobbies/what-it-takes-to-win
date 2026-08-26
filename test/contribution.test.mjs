import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEditIssue,
  buildSuggestionIssue,
  isValidPublicUrl,
  validateEdit,
  validateSuggestion,
} from "../src/lib/contribution.ts";

function suggestion(overrides = {}) {
  return {
    name: "Example Person",
    outcome: "Won an independently recorded world title.",
    eventDate: "2026-04-12",
    age: "24",
    sourceOne: "https://official.example/result",
    sourceTwo: "https://news.example/report",
    relationship: "No personal relationship",
    notes: "",
    publicConfirmation: true,
    ...overrides,
  };
}

function edit(overrides = {}) {
  return {
    person: "Example Person",
    profileUrl: "https://paths.significanthobbies.com/person/example-person/",
    currentClaim: "The profile says the event occurred in 2025.",
    proposedCorrection: "Change the event year to 2024.",
    reason: "The official result is dated 2024.",
    sourceOne: "https://official.example/result",
    sourceTwo: "",
    relationship: "No personal relationship",
    publicConfirmation: true,
    ...overrides,
  };
}

test("public URL validation accepts only http and https URLs", () => {
  assert.equal(isValidPublicUrl("https://example.com/evidence"), true);
  assert.equal(isValidPublicUrl(" http://example.com/evidence "), true);
  assert.equal(isValidPublicUrl("javascript:alert(1)"), false);
  assert.equal(isValidPublicUrl("ftp://example.com/evidence"), false);
  assert.equal(isValidPublicUrl("not a url"), false);
});

test("person suggestions require two distinct evidence domains", () => {
  assert.deepEqual(validateSuggestion(suggestion()), {});
  const errors = validateSuggestion(suggestion({
    sourceTwo: "https://official.example/second-page",
  }));
  assert.match(errors.sourceTwo, /second evidence domain/i);
});

test("person suggestions require an explicit age", () => {
  const errors = validateSuggestion(suggestion({ age: "" }));
  assert.equal(errors.age, "Enter an age from 0 through 30.");
});

test("person suggestions report every required field and age boundary", () => {
  const errors = validateSuggestion(suggestion({
    name: " ",
    outcome: "",
    eventDate: "April 12",
    age: "not-a-number",
    sourceOne: "",
    sourceTwo: "not-a-url",
    publicConfirmation: false,
  }));

  assert.deepEqual(Object.keys(errors).sort(), [
    "age",
    "eventDate",
    "name",
    "outcome",
    "publicConfirmation",
    "sourceOne",
    "sourceTwo",
  ]);
  assert.ok(validateSuggestion(suggestion({ age: "-1" })).age);
  assert.ok(validateSuggestion(suggestion({ age: "31" })).age);
  assert.ok(validateSuggestion(suggestion({ age: "24.5" })).age);
  assert.ok(validateSuggestion(suggestion({ sourceTwo: "" })).sourceTwo);
});

test("suggestion drafts preserve the evidence and public boundary", () => {
  const draft = buildSuggestionIssue(suggestion());
  assert.equal(draft.title, "[Person suggestion] Example Person");
  assert.match(draft.body, /Event date: 2026-04-12/);
  assert.match(draft.body, /issue is public/);
  assert.match(draft.url, /^https:\/\/github\.com\/Significant-Hobbies\//);
});

test("suggestion drafts preserve notes and disclose a missing relationship", () => {
  const draft = buildSuggestionIssue(suggestion({
    relationship: "",
    notes: "  Check the official result archive.  ",
  }));
  assert.match(draft.body, /Relationship: No relationship disclosed/);
  assert.match(draft.body, /Additional notes: Check the official result archive\./);
});

test("profile edits require a claim, correction, reason, and source", () => {
  assert.deepEqual(validateEdit(edit()), {});
  const errors = validateEdit(edit({ currentClaim: "", sourceOne: "" }));
  assert.ok(errors.currentClaim);
  assert.ok(errors.sourceOne);
});

test("profile edits report invalid optional URLs and public confirmation", () => {
  const errors = validateEdit(edit({
    person: "",
    profileUrl: "not-a-url",
    currentClaim: "",
    proposedCorrection: "",
    reason: "",
    sourceOne: "not-a-url",
    sourceTwo: "ftp://example.com/evidence",
    publicConfirmation: false,
  }));

  assert.deepEqual(Object.keys(errors).sort(), [
    "currentClaim",
    "person",
    "profileUrl",
    "proposedCorrection",
    "publicConfirmation",
    "reason",
    "sourceOne",
    "sourceTwo",
  ]);
  assert.deepEqual(validateEdit(edit({ profileUrl: "", sourceTwo: "https://news.example/report" })), {});
});

test("edit drafts include profile prefill and do not imply acceptance", () => {
  const draft = buildEditIssue(edit());
  assert.equal(draft.title, "[Profile edit] Example Person");
  assert.match(draft.body, /paths\.significanthobbies\.com\/person\/example-person/);
  assert.match(draft.body, /existing evidence and publication gates still apply/);
});

test("edit drafts work without an optional profile URL or relationship", () => {
  const draft = buildEditIssue(edit({
    profileUrl: "",
    relationship: "",
    sourceTwo: "https://news.example/report",
  }));
  assert.match(draft.body, /## Profile\n\nExample Person/);
  assert.match(draft.body, /Relationship: No relationship disclosed/);
  assert.match(draft.body, /https:\/\/news\.example\/report/);
});
