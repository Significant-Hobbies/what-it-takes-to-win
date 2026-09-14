import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { chapters, featuredPaths, worldEvents } from "../src/data/documentary.mjs";
import { luckCases } from "../src/data/luck-cases.mjs";

const page = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const people = JSON.parse(readFileSync(new URL("../src/data/people.json", import.meta.url), "utf8"));
const archiveIds = new Set(people.map(person => person.person_id));

test("featured paths resolve to preserved profiles with evidence for every step", () => {
  assert.equal(new Set(featuredPaths.map(person => person.id)).size, featuredPaths.length);
  for (const person of featuredPaths) {
    assert.ok(archiveIds.has(person.id), `Missing archive profile: ${person.id}`);
    assert.ok(person.steps.length >= 5);
    assert.ok(person.boundary.length > 20);
    for (const step of person.steps) {
      assert.equal(new URL(step.source ?? person.source).protocol, "https:");
      for (const key of ["when", "label", "title", "text"]) assert.ok(step[key]?.trim());
    }
  }
});

test("dated excerpts retain precise and explicitly uncertain age evidence", () => {
  const serena = featuredPaths.find(person => person.id === "serena-williams");
  assert.equal(serena.early, "≈3");
  assert.equal(serena.steps.at(-1).when, "Age 17 · 1999");
  const bonnie = featuredPaths.find(person => person.id === "bonnie-tyler");
  assert.equal(bonnie.steps.find(step => step.label === "Encounter luck").when, "1974");
  assert.match(bonnie.boundary, /1974.*1975/);
  const serenaRecord = people.find(person => person.person_id === "serena-williams");
  assert.equal(serenaRecord.trajectory.find(step => step.year === 1999).age, 17);
  const bonnieRecord = people.find(person => person.person_id === "bonnie-tyler");
  assert.match(bonnieRecord.early_history_summary, /1974/);
  assert.ok(bonnieRecord.trajectory.some(step => step.year === 1974));
});

test("all six chapters and previous shared chapter hashes still resolve", () => {
  assert.doesNotMatch(page, /doc-chapter-nav|data-chapter-link|Journey chapters/);
  assert.equal(chapters.length, 6);
  assert.equal(new Set(chapters.map(([id]) => id)).size, 6);
  for (const [id] of chapters) assert.ok(page.includes(`id="${id}"`), `Missing chapter ${id}`);
  for (const id of ["the-survivor", "the-start", "the-levers", "the-sequence", "the-boundary"]) {
    assert.ok(chapters.some(([chapterId]) => chapterId === id));
  }
});

test("world events preserve sources and separate documented events from explanations", () => {
  assert.deepEqual(worldEvents.map(event => event.id), ["ai-wave", "housing-shock"]);
  for (const event of worldEvents) {
    assert.equal(new URL(event.source).protocol, "https:");
    assert.ok(luckCases.some(item => event.archive === `/luck/${item.id}/`), `Unresolved case: ${event.archive}`);
    assert.ok(event.left && event.right && event.boundary);
  }
  assert.match(worldEvents[0].boundary, /not an estimate/);
  assert.match(worldEvents[0].boundary, /not cash in the bank/);
  assert.equal(worldEvents[0].scenes.length, 3);
  assert.match(worldEvents[1].right, /illustrative contrast, not a matched study/);
});

test("homepage excerpts link to preserved full profile chronologies", () => {
  const profile = readFileSync(new URL("../src/pages/person/[id].astro", import.meta.url), "utf8");
  const component = readFileSync(new URL("../src/components/LifeStory.astro", import.meta.url), "utf8");
  assert.match(page, /class="life-excerpt"/);
  assert.match(page, /The full life & its sources/);
  assert.match(profile, /<LifeStory person=\{featured\}/);
  assert.match(profile, /class="archive-record" open=\{!featured\}/);
  assert.match(component, /<ol class="life-timeline"/);
  assert.match(component, /person.steps.map/);
  assert.match(component, /\{step.text\}/);
  assert.match(component, /step.source \?\? person.source/);
  assert.doesNotMatch(component, /<details|<summary|<button|<script|What to notice|Then what happened/);
});

test("the metaphor compares both routes and labels its limits", () => {
  assert.match(page, /The king/);
  assert.match(page, /The peasant/);
  assert.match(page, /Carried by others/);
  assert.match(page, /not a measured historical comparison/);
  assert.doesNotMatch(page, /\/luck\/#/);
});

test("the journey renders before JavaScript and never asks for a personal score", () => {
  assert.match(page, /class="jug-routes"/);
  assert.match(page, /data-life=\{person.id\} tabindex="-1"/);
  assert.doesNotMatch(page, /<section[^>]*data-life[^>]*\shidden/);
  assert.doesNotMatch(page, /<(?:input|textarea)\b/);
  assert.doesNotMatch(page, /doc-shot-open|one success in twelve/);
  assert.match(page, /who-filled-the-kings-jug/);
  assert.match(page, /everyone-has-lost-their-marbles/);
  assert.match(page, /structuredData=\{structuredData\}/);
});
