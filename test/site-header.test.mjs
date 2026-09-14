import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync(new URL("../src/components/SiteHeader.astro", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/layouts/Base.astro", import.meta.url), "utf8");

test("shared masthead retains native navigation and the Paths wordmark", () => {
  assert.match(header, /aria-label="Paths home">Paths<\/a>/);
  assert.match(header, /aria-label="Primary navigation"/);
  assert.match(header, /aria-current=\{link.active \? "page" : undefined\}/);
  assert.match(layout, /<SiteHeader links=/);
  for (const href of ["/", "/insights/", "/essays/", "/explore/"]) assert.ok(layout.includes(`href: "${href}"`));
  assert.doesNotMatch(header, /brand-mark|brand-subtitle|link.index|<script/);
});

test("masthead is scoped, keyboard accessible and can reflow without a menu script", () => {
  assert.match(header, /:focus-visible/);
  assert.match(header, /min-height: 44px/);
  assert.match(header, /flex-wrap: wrap/);
  assert.doesNotMatch(header, /position: fixed|backdrop-filter|overflow: hidden/);
});
