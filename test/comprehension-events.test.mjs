import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../public/comprehension-events.js", import.meta.url), "utf8");

function setup({ tracker = true, detailsCount = 6 } = {}) {
  const listeners = new Map();
  const details = Array.from({ length: detailsCount }, () => ({
    open: false,
    addEventListener(name, callback) { listeners.set(this, callback); },
  }));
  const section = { querySelectorAll: () => details };
  let ready;
  let observerCallback;
  let observed;
  let disconnected = false;
  const events = [];
  const context = {
    document: {
      addEventListener(name, callback) { assert.equal(name, "DOMContentLoaded"); ready = callback; },
      querySelector(selector) {
        assert.equal(selector, '[data-clarity-contract="comprehension-check"]');
        return section;
      },
    },
    window: tracker ? { appHealth: { track: (...args) => events.push(args) } } : {},
    IntersectionObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe(element) { observed = element; }
      disconnect() { disconnected = true; }
    },
    Array,
    Set,
  };
  runInNewContext(source, context);
  ready();
  return {
    details, events,
    fireVisibility(isIntersecting) { observerCallback([{ isIntersecting }]); },
    toggle(index, open) {
      details[index].open = open;
      listeners.get(details[index])();
    },
    get observed() { return observed; },
    get disconnected() { return disconnected; },
  };
}

test("tracks section reach once and only after it intersects", () => {
  const b = setup();
  assert.ok(b.observed);
  b.fireVisibility(false);
  assert.deepEqual(b.events, []);
  b.fireVisibility(true);
  b.fireVisibility(true);
  assert.deepEqual(b.events, [["comprehension_reached"]]);
  assert.equal(b.disconnected, true);
});

test("reports all six explanations opened once, not partial exposure or comprehension", () => {
  const b = setup();
  for (let index = 0; index < 5; index++) b.toggle(index, true);
  assert.deepEqual(b.events, []);
  b.toggle(0, false);
  b.toggle(0, true);
  assert.deepEqual(b.events, []);
  b.toggle(5, true);
  b.toggle(5, false);
  b.toggle(5, true);
  assert.deepEqual(b.events, [["comprehension_explanations_opened"]]);
  assert.ok(b.events.every((event) => event.length === 1));
});

test("remains optional when tracker is unavailable and has no section to measure", () => {
  const withoutTracker = setup({ tracker: false });
  withoutTracker.fireVisibility(true);
  for (let index = 0; index < 6; index++) withoutTracker.toggle(index, true);
  assert.deepEqual(withoutTracker.events, []);

  let callback;
  const context = {
    document: {
      addEventListener(_name, fn) { callback = fn; },
      querySelector: () => null,
    },
    window: {},
  };
  runInNewContext(source, context);
  assert.doesNotThrow(callback);
});
