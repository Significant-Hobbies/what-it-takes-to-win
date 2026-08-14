import assert from "node:assert/strict";
import test from "node:test";

import { calculateRoi } from "../src/lib/roi.ts";

const investments = [
  {
    label: "Access and setup",
    kind: "resource",
    stage: "foundation",
    quantity: 20,
    valuePerUnit: 2,
  },
  {
    label: "Skill building",
    kind: "time",
    stage: "capability",
    quantity: 10,
    valuePerUnit: 3,
  },
  {
    label: "Final execution",
    kind: "time",
    stage: "final-mile",
    quantity: 15,
    valuePerUnit: 2,
  },
];

test("ROI summary preserves formulas and effort allocation", () => {
  const summary = calculateRoi(investments, [
    { label: "No return", probability: 60, value: 0 },
    { label: "Useful return", probability: 30, value: 200 },
    { label: "Exceptional return", probability: 10, value: 1000 },
  ]);

  assert.equal(summary.issues.length, 0);
  assert.equal(summary.totalInvestment, 100);
  assert.deepEqual(
    summary.stageAllocations.map(({ key, value, share }) => ({ key, value, share })),
    [
      { key: "foundation", value: 40, share: 40 },
      { key: "capability", value: 30, share: 30 },
      { key: "final-mile", value: 30, share: 30 },
    ],
  );
  assert.equal(summary.result?.expectedGrossValue, 160);
  assert.equal(summary.result?.expectedNetReturn, 60);
  assert.equal(summary.result?.expectedRoi, 60);
  assert.equal(summary.result?.expectedMultiple, 1.6);
  assert.equal(summary.result?.downsideProbability, 60);
  assert.equal(summary.result?.breakEvenProbability, 40);
  assert.equal(summary.result?.worstOutcomeValue, 0);
  assert.equal(summary.result?.bestOutcomeValue, 1000);
});

test("decimal probabilities reconcile without rounding calculations", () => {
  const summary = calculateRoi(
    [
      {
        label: "Work",
        kind: "time",
        stage: "final-mile",
        quantity: 1,
        valuePerUnit: 1,
      },
    ],
    [
      { label: "A", probability: 33.33, value: 1 },
      { label: "B", probability: 33.33, value: 2 },
      { label: "C", probability: 33.34, value: 3 },
    ],
  );

  assert.equal(summary.probabilityComplete, true);
  assert.ok(Math.abs((summary.result?.expectedGrossValue ?? 0) - 2.0001) < 1e-10);
  assert.ok(Math.abs((summary.result?.expectedRoi ?? 0) - 100.01) < 1e-10);
});

test("negative outcome values remain part of the distribution", () => {
  const summary = calculateRoi(
    [
      {
        label: "Entry cost",
        kind: "money",
        stage: "foundation",
        quantity: 1,
        valuePerUnit: 50,
      },
    ],
    [
      { label: "Additional liability", probability: 20, value: -100 },
      { label: "Break even", probability: 40, value: 50 },
      { label: "Upside", probability: 40, value: 200 },
    ],
  );

  assert.equal(summary.result?.expectedGrossValue, 80);
  assert.equal(summary.result?.downsideProbability, 20);
  assert.equal(summary.result?.breakEvenProbability, 80);
});

test("zero investment and incomplete probabilities withhold ROI", () => {
  const summary = calculateRoi(
    [
      {
        label: "Free attempt",
        kind: "time",
        stage: "final-mile",
        quantity: 0,
        valuePerUnit: 10,
      },
    ],
    [{ label: "Possible return", probability: 80, value: 100 }],
  );

  assert.equal(summary.result, null);
  assert.equal(summary.probabilityGap, 20);
  assert.ok(summary.issues.some((issue) => issue.message.includes("greater than zero")));
  assert.ok(summary.issues.some((issue) => issue.message.includes("remaining 20.00%")));
});

test("invalid rows expose field-level issues", () => {
  const summary = calculateRoi(
    [
      {
        label: "",
        kind: "resource",
        stage: "",
        quantity: -1,
        valuePerUnit: Number.NaN,
      },
    ],
    [{ label: "", probability: 101, value: Number.POSITIVE_INFINITY }],
  );

  assert.equal(summary.result, null);
  assert.ok(summary.issues.some((issue) => issue.scope === "investment" && issue.field === "label"));
  assert.ok(summary.issues.some((issue) => issue.scope === "investment" && issue.field === "stage"));
  assert.ok(summary.issues.some((issue) => issue.scope === "investment" && issue.field === "quantity"));
  assert.ok(summary.issues.some((issue) => issue.scope === "outcome" && issue.field === "probability"));
  assert.ok(summary.issues.some((issue) => issue.scope === "outcome" && issue.field === "value"));
});

test("empty ledgers require at least one investment and outcome", () => {
  const summary = calculateRoi([], []);

  assert.equal(summary.result, null);
  assert.ok(summary.issues.some((issue) => issue.message === "Add at least one investment item."));
  assert.ok(summary.issues.some((issue) => issue.message === "Add at least one possible outcome."));
});
