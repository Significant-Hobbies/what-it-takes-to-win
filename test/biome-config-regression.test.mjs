import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const biomeCli = path.join(root, 'node_modules/@biomejs/biome/bin/biome');
const tempDir = mkdtempSync(path.join(root, 'test', 'biome-config-fixture-'));
const configPath = path.join(root, 'biome.json');

function runBiomeCheck(file) {
  return spawnSync(
    process.execPath,
    [
      biomeCli,
      'check',
      '--reporter=json',
      '--no-errors-on-unmatched',
      '--config-path',
      configPath,
      file,
    ],
    { cwd: root, encoding: 'utf8', timeout: 30_000 }
  );
}

function reportedCategories(result) {
  assert.ifError(result.error);
  const report = JSON.parse(result.stdout);
  return report.diagnostics.map((diagnostic) => diagnostic.category);
}

test.after(() => rmSync(tempDir, { recursive: true }));

test('effective core preset still reports a configured TypeScript rule', () => {
  const fixture = path.join(tempDir, 'core.ts');
  writeFileSync(fixture, 'debugger;\n');

  const result = runBiomeCheck(fixture);

  assert.equal(result.status, 1, result.stderr);
  assert.ok(reportedCategories(result).includes('lint/suspicious/noDebugger'));
});

test('effective Astro preset enables HTML parsing with inherited a11y rules', () => {
  const fixture = path.join(tempDir, 'astro.astro');
  writeFileSync(fixture, '<img src="/fixture.png" />\n');

  const result = runBiomeCheck(fixture);

  assert.equal(result.status, 1, result.stderr);
  assert.ok(reportedCategories(result).includes('lint/a11y/useAltText'));
});

test('check keeps the delegated no-errors-on-unmatched behavior', () => {
  const fixture = path.join(tempDir, 'unknown.fixture');
  writeFileSync(fixture, 'intentionally not a supported source file\n');

  const result = runBiomeCheck(fixture);

  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).diagnostics, []);
});
