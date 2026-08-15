// Shared discovery-surface context for the audit and generation scripts.
// Both audit_discovery.mjs and generate_discovery_surfaces.mjs load the same
// dataset, origin, and dist root, and apply the same indexability gate.
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://paths.significanthobbies.com";
const people = JSON.parse(
  await readFile(path.join(root, "src", "data", "people.json"), "utf8"),
);

function comparisonIsIndexable(person) {
  return Number(person.source_count || 0) >= 2
    && String(person.leverage_evidence_confidence || "").toLowerCase() !== "low"
    && Boolean(person.milestone_by_age_26?.trim())
    && Array.isArray(person.trajectory)
    && person.trajectory.length > 0;
}

export { root, dist, origin, people, comparisonIsIndexable };
