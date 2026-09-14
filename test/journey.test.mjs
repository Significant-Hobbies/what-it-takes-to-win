import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { drawAttempts } from "../src/lib/chance.ts";
import { turningPoints, situations } from "../src/data/turning-points.mjs";
import { luckCases } from "../src/data/luck-cases.mjs";

test("turning points cover all life situations and resolve their source destinations", () => {
  assert.equal(turningPoints.length, 13);
  assert.equal(new Set(turningPoints.map(event => event.id)).size, 13);
  for (const situation of situations.filter(item => item.id !== "all")) {
    assert.ok(turningPoints.some(event => event.categories.includes(situation.id)));
  }
  for (const event of turningPoints) {
    for (const field of ["situation", "name", "story", "choice", "chance", "other", "limit", "url", "kind", "caption", "sourceLabel", "tag"]) assert.ok(event[field].trim(), event.id + ": " + field);
    for (const category of event.categories) assert.ok(situations.some(item => item.id === category));
    if (event.url.startsWith("/luck/")) assert.ok(luckCases.some(item => event.url === `/luck/${item.id}/`));
    else assert.equal(new URL(event.url).protocol, "https:");
    assert.doesNotMatch(event.url, /localhost|127\.0\.0\.1/);
  }
});

test("funding, IPO and spin-off events stay distinct from personal liquid wealth", () => {
  assert.match(turningPoints.find(event => event.id === "cursor").limit, /not its current valuation/);
  assert.match(turningPoints.find(event => event.id === "airbnb").limit, /does not mean everyone can sell/);
  assert.match(turningPoints.find(event => event.id === "sandisk").limit, /does not establish an employee windfall/);
  assert.match(turningPoints.find(event => event.id === "nvidia").limit, /not cash/);
});

test("the illustrative random draw permits no openings, all openings and unequal outcomes", () => {
  assert.deepEqual(drawAttempts(4, () => 0), [true,true,true,true]);
  assert.deepEqual(drawAttempts(12, () => 0.99), new Array(12).fill(false));
  let index = 0;
  assert.deepEqual(drawAttempts(4, () => [0, 1 / 6, 0.1, 0.9][index++]), [true,false,true,false]);
  assert.equal(drawAttempts(12).length, 12);
  for (const size of [0,-1,5,100,NaN]) assert.throws(() => drawAttempts(size), RangeError);
});

test("randomness assumptions, unequal capacity and no-JS explanation are visible in markup", () => {
  const lab = readFileSync(new URL("../src/components/ChanceLab.astro", import.meta.url), "utf8");
  assert.match(lab, /made-up one-in-six/);
  assert.match(lab, /Not your odds in life/);
  assert.match(lab, /<noscript>/);
  assert.match(lab, /Who can afford to try again/);
  assert.match(lab, /aria-live="polite"/);
  const page = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
  assert.match(page, /What supports this/);
  assert.match(page, /survivorship bias/);
  assert.match(page, /No answer to submit. No score to improve/);
  assert.doesNotMatch(page, /doc-chapter-nav|data-chapter-link/);
});
