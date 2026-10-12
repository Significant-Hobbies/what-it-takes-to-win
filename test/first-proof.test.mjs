import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AUDIT_DOMAINS, firstProofRecords, firstProofSources, firstProofWorkbook, locatedAgeBand, publicationBlockers, publishedFirstProofRecords, recordSources, summarizeFirstProof } from "../src/data/first-proof.mjs";

function reviewedRecord() {
  const record = structuredClone(firstProofRecords[0]);
  record.review = {
    evidenceStatus: "corroborated-fit", trajectoryType: "adult-development",
    milestone: { result: "A selective regional result.", date: "2001-06-01", ageMin: 30, ageMax: 31, validator: "Regional jury", comparisonPool: "Regional entrants", selectionBasis: "Published selection standard", contribution: "Individual output" },
    hasEarlierQualifyingProof: false,
    earlyHistory: Object.fromEntries(AUDIT_DOMAINS.map((domain) => [domain, { state: "reviewed", note: "Specified source and interview review found no earlier qualifying result." }])),
    sources: record.sourceIds.slice(0, 2).map((id, index) => ({ id, accessedOn: "2026-10-12", claim: "Dated result and substantive starting history.", origin: `independent-origin-${index}`, verified: true, primary: index === 0, supports: [index === 0 ? "milestone" : "early-history", "age"] })),
    contradictions: [],
    publication: { approved: true, reviewer: "Editor A", secondReviewer: "Editor B", reviewedOn: "2026-10-12", coverageStatement: "Defined review and remaining limits.", takeaway: "A specific practice arrangement.", rightsReviewed: true, acceptedLimitations: [] },
    timeline: { capability: [{ when: "Age 27", detail: "Serious practice began." }], proof: [{ when: "Age 30–31", detail: "External selection." }] },
  };
  return record;
}

test("workbook import preserves all identities, counts and source associations", () => {
  assert.deepEqual(summarizeFirstProof(), { people: 136, candidates: 100, held: 36, priority: 5, recordOnly: 49, sources: 135, published: 0 });
  assert.equal(new Set(firstProofRecords.map((record) => record.id)).size, 136);
  assert.equal(new Set(firstProofRecords.map((record) => record.name)).size, 136);
  assert.equal(new Set(firstProofSources.map((source) => source.url)).size, 135);
  const sourceIds = new Set(firstProofSources.map((source) => source.id));
  for (const record of firstProofRecords) {
    assert.ok(record.sourceIds.length > 0);
    assert.ok(record.sourceIds.every((id) => sourceIds.has(id)));
    assert.equal(record.provenance.sheet, record.intakeStatus === "C" ? "Held back" : "Candidates");
  }
  const workbook = readFileSync(new URL("../data/research/first-proof/Paths_First_Proof_Research.xlsx", import.meta.url));
  assert.equal(createHash("sha256").update(workbook).digest("hex"), firstProofWorkbook.sha256);
});

test("all intake categories remain uncleared and priority never acts as verification", () => {
  assert.equal(publishedFirstProofRecords.length, 0);
  assert.ok(firstProofRecords.every((record) => publicationBlockers(record).length > 0));
  const record = reviewedRecord();
  record.review = null;
  for (const intakeStatus of ["A", "B", "C"]) assert.ok(publicationBlockers({ ...record, intakeStatus }).length > 0);
});

test("screening-age filters retain uncertainty instead of rounding attractive boundary cases", () => {
  assert.equal(locatedAgeBand("31–32"), "30-34");
  assert.equal(locatedAgeBand("38"), "35-39");
  assert.equal(locatedAgeBand("26"), "26-29");
  assert.equal(locatedAgeBand("24"), "outside");
  for (const value of ["25–26", "29–30", "39–40", "About 38–39", "Late twenties", "32–31"]) {
    assert.equal(locatedAgeBand(value), "unresolved");
  }
});

test("a defined independent review can clear either supported adult-development trajectory", () => {
  const record = reviewedRecord();
  assert.deepEqual(publicationBlockers(record), []);
  record.review.trajectoryType = "development-unclear";
  assert.deepEqual(publicationBlockers(record), []);
});

test("early regional sport, academic or professional distinction excludes the core", () => {
  const record = reviewedRecord();
  record.review.hasEarlierQualifyingProof = true;
  assert.match(publicationBlockers(record).join(" "), /Earlier qualifying proof/);
  record.review.hasEarlierQualifyingProof = null;
  assert.match(publicationBlockers(record).join(" "), /Earlier qualifying proof/);
  for (const trajectory of ["transfer", "delayed-recognition", "unresolved"]) {
    record.review.trajectoryType = trajectory;
    assert.match(publicationBlockers(record).join(" "), /Trajectory/);
  }
});

test("first contract at 24 excludes a book released at 27; unresolved age boundaries remain held", () => {
  for (const [ageMin, ageMax] of [[24, 24], [25, 26], [39, 40], [null, null], [31, 30]]) {
    const record = reviewedRecord();
    Object.assign(record.review.milestone, { ageMin, ageMax });
    assert.match(publicationBlockers(record).join(" "), /age must be resolved/);
  }
  for (const age of [26, 39]) {
    const record = reviewedRecord();
    Object.assign(record.review.milestone, { ageMin: age, ageMax: age });
    assert.deepEqual(publicationBlockers(record), []);
  }
});

test("missing history never counts as evidence of absence; limits need an explicit editorial decision", () => {
  for (const domain of AUDIT_DOMAINS) {
    const record = reviewedRecord();
    delete record.review.earlyHistory[domain];
    assert.ok(publicationBlockers(record).some((blocker) => blocker.startsWith(domain)));
    record.review.earlyHistory[domain] = { state: "limited", note: "A documented coverage gap." };
    assert.ok(publicationBlockers(record).some((blocker) => blocker.startsWith(domain)));
    record.review.publication.acceptedLimitations = [domain];
    assert.deepEqual(publicationBlockers(record), []);
    record.review.earlyHistory[domain] = { state: "not-applicable", note: "Specific justification." };
    assert.deepEqual(publicationBlockers(record), []);
    record.review.earlyHistory[domain].note = "";
    assert.ok(publicationBlockers(record).length > 0);
  }
});

test("syndicated sources, unchecked links and source-count totals cannot certify a case", () => {
  const record = reviewedRecord();
  record.review.sources[1].origin = record.review.sources[0].origin;
  assert.match(publicationBlockers(record).join(" "), /independent evidence origins/);
  record.review.sources[0].verified = false;
  assert.match(publicationBlockers(record).join(" "), /Primary milestone/);
  record.review.sources[1].supports = [];
  assert.match(publicationBlockers(record).join(" "), /earlier-history evidence/);
  record.review.sources = [{ ...reviewedRecord().review.sources[0], id: "unknown-source" }];
  assert.ok(publicationBlockers(record).length > 0);
});

test("unresolved contradictions and self-review block publication", () => {
  const record = reviewedRecord();
  record.review.contradictions = [{ resolved: false, resolution: "" }];
  assert.match(publicationBlockers(record).join(" "), /contradictions/);
  record.review.contradictions = [{ resolved: true, resolution: "Earlier publication was self-published and below the threshold." }];
  assert.deepEqual(publicationBlockers(record), []);
  record.review.publication.secondReviewer = record.review.publication.reviewer;
  assert.match(publicationBlockers(record).join(" "), /independent challenge/);
});

test("a milestone and fame date without the development timeline cannot clear a profile", () => {
  const record = reviewedRecord();
  record.review.timeline.capability = [];
  assert.match(publicationBlockers(record).join(" "), /Both development/);
  record.review.milestone.date = "unknown";
  assert.match(publicationBlockers(record).join(" "), /Milestone date/);
  record.review.evidenceStatus = "milestone-screened";
  assert.match(publicationBlockers(record).join(" "), /Evidence review/);
});

test("invalid calendar dates, unsupported ages and empty timeline steps fail closed", () => {
  const record = reviewedRecord();
  record.review.milestone.date = "2001-02-31";
  assert.match(publicationBlockers(record).join(" "), /Milestone date/);
  record.review.milestone.date = "2001";
  assert.deepEqual(publicationBlockers(record), []);
  for (const source of record.review.sources) source.supports = source.supports.filter((support) => support !== "age");
  assert.match(publicationBlockers(record).join(" "), /Age evidence/);
  record.review.timeline.capability = [{ when: "", detail: "" }];
  assert.match(publicationBlockers(record).join(" "), /Both development/);
});

test("later research can add evidence without changing intake provenance or accepting unsafe URLs", () => {
  const record = reviewedRecord();
  const intakeIds = [...record.sourceIds];
  record.review.sources[1] = { ...record.review.sources[1], id: "audit-new-source", url: "https://archive.example/history" };
  assert.deepEqual(publicationBlockers(record), []);
  assert.equal(recordSources(record).at(-1).url, "https://archive.example/history");
  assert.deepEqual(record.sourceIds, intakeIds);
  record.review.sources[1].url = "javascript:alert(1)";
  assert.ok(publicationBlockers(record).length > 0);
  assert.ok(recordSources(record).every((source) => !source.url.startsWith("javascript:")));
  record.review.sources[1] = { ...reviewedRecord().review.sources[1], url: "https://different.example/swapped-source" };
  assert.ok(publicationBlockers(record).length > 0);
});
