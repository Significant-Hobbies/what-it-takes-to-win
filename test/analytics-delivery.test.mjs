import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const events = ["pointerdown", "keydown", "touchstart", "scroll"];
function browser() {
  const listeners = new Map();
  const scripts = [];
  const timers = new Map();
  const window = {
    addEventListener(event, callback, options) {
      assert.equal(options.passive, true);
      assert.equal(options.once, true);
      listeners.set(event, callback);
    },
    removeEventListener(event) { listeners.delete(event); },
  };
  return {
    scripts, listeners, timers,
    context: {
      window,
      document: {
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: (script) => scripts.push(script) } }],
      },
      addEventListener: window.addEventListener,
      removeEventListener: window.removeEventListener,
      setTimeout(callback, delay) { assert.equal(delay, 90000); timers.set(1, callback); return 1; },
      clearTimeout(id) { timers.delete(id); },
    },
  };
}
const clarity = readFileSync(new URL("../src/components/Clarity.astro", import.meta.url), "utf8")
  .replace("<script is:inline>", "").replace("</script>", "");
const posthog = readFileSync(new URL("../public/scripts/posthog.js", import.meta.url), "utf8");
for (const [name, source] of [["Clarity", clarity], ["PostHog", posthog]]) {
  for (const trigger of [...events, "timer"]) {
    test(`${name} queues immediately and loads once on ${trigger}`, () => {
      const b = browser();
      runInNewContext(source, b.context);
      assert.equal(b.scripts.length, 0);
      assert.equal(b.listeners.size, 4);
      if (name === "Clarity") {
        b.context.window.clarity("set", "queued", "value");
        assert.equal(b.context.window.clarity.q[0][1], "queued");
      } else {
        b.context.window.posthog.capture("queued");
        assert.equal(b.context.window.posthog[0][1], "queued");
        assert.equal(b.context.window.posthog._i.length, 1);
      }
      const timer = b.timers.get(1);
      (trigger === "timer" ? timer : b.listeners.get(trigger))();
      timer();
      assert.equal(b.scripts.length, 1);
      assert.equal(b.scripts[0].async, true);
      assert.equal(b.listeners.size, 0);
      assert.equal(b.timers.size, 0);
      if (name === "Clarity") {
        assert.equal(b.scripts[0].src, "https://www.clarity.ms/tag/y6bw72v6ih");
        b.scripts[0].onload();
        assert.equal(b.context.window.clarity.q[1][1], "project_id");
        assert.equal(b.context.window.clarity.q[1][2], "what-it-takes-to-win");
      } else {
        assert.equal(b.scripts[0].src, "https://us-assets.i.posthog.com/static/array.js");
      }
    });
  }
}
