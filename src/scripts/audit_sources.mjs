// Source URL reachability audit.
// Reuses results for unchanged URLs and fetches only newly introduced URLs.
// Pass --refresh to re-fetch the complete published set. Records HTTP status,
// final URL after redirects, and retrieval date; writes results to
// quality/source-audit/audit-v1.json and updates source_audit_status in
// src/data/people.json.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const people = JSON.parse(
  await readFile(path.join(root, "src", "data", "people.json"), "utf8"),
);
const auditDir = path.join(root, "quality", "source-audit");
const auditPath = path.join(auditDir, "audit-v1.json");
const refreshAll = process.argv.includes("--refresh");

let previousResults = {};
if (!refreshAll) {
  try {
    const previousAudit = JSON.parse(await readFile(auditPath, "utf8"));
    previousResults = previousAudit.results || {};
  } catch {
    // First audit: every URL will be fetched.
  }
}

// Collect all unique (person_id, url) pairs
const allPairs = [];
const urlSet = new Set();
for (const person of people) {
  for (const url of person.source_urls || []) {
    const key = `${person.person_id}\t${url}`;
    if (!urlSet.has(key)) {
      urlSet.add(key);
      allPairs.push({ person_id: person.person_id, url });
    }
  }
}

const previousByKey = new Map();
for (const [personId, personResults] of Object.entries(previousResults)) {
  for (const result of personResults) {
    previousByKey.set(`${personId}\t${result.url}`, result);
  }
}
const pairsToCheck = refreshAll
  ? allPairs
  : allPairs.filter((pair) => !previousByKey.has(`${pair.person_id}\t${pair.url}`));
const reusedCount = allPairs.length - pairsToCheck.length;

console.log(`Auditing ${allPairs.length} source URLs across ${people.length} people…`);
console.log(`  Reusing ${reusedCount} existing URL results; fetching ${pairsToCheck.length} new URLs.`);

const CONCURRENCY = 25;
const TIMEOUT_MS = 8000;
const retrievalDate = new Date().toISOString().split("T")[0];

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Try HEAD first (lighter), fall back to GET if not supported
    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "WITTW-SourceAudit/1.0 (research exhibit source verification)" },
    });
    if (response.status === 405 || response.status === 403) {
      // Some servers reject HEAD — retry with GET
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), TIMEOUT_MS);
      try {
        response = await fetch(url, {
          method: "GET",
          signal: controller2.signal,
          redirect: "follow",
          headers: { "User-Agent": "WITTW-SourceAudit/1.0 (research exhibit source verification)" },
        });
      } finally {
        clearTimeout(timeout2);
      }
    }
    clearTimeout(timeout);
    return {
      status: response.status,
      ok: response.ok,
      finalUrl: response.url !== url ? response.url : undefined,
      reachable: response.status >= 200 && response.status < 400,
    };
  } catch (error) {
    clearTimeout(timeout);
    const reason = error.name === "AbortError" ? "timeout" : error.message;
    return { status: null, ok: false, reachable: false, error: reason };
  }
}

// Process in batches
const results = {};
for (const pair of allPairs) {
  const previous = previousByKey.get(`${pair.person_id}\t${pair.url}`);
  if (!previous || refreshAll) continue;
  if (!results[pair.person_id]) results[pair.person_id] = [];
  results[pair.person_id].push(previous);
}
let completed = 0;
const startTime = Date.now();

for (let i = 0; i < pairsToCheck.length; i += CONCURRENCY) {
  const batch = pairsToCheck.slice(i, i + CONCURRENCY);
  const batchResults = await Promise.all(
    batch.map(async (pair) => {
      const result = await checkUrl(pair.url);
      return { ...pair, ...result };
    }),
  );
  for (const result of batchResults) {
    if (!results[result.person_id]) results[result.person_id] = [];
    results[result.person_id].push({
      url: result.url,
      status: result.status,
      reachable: result.reachable,
      finalUrl: result.finalUrl,
      error: result.error,
      checked: retrievalDate,
    });
  }
  completed += batchResults.length;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const rate = (completed / (elapsed || 1)).toFixed(1);
  process.stdout.write(`\r  ${completed}/${pairsToCheck.length} new URLs (${rate}/s, ${elapsed}s)`);
}
if (pairsToCheck.length > 0) console.log("");

// Summarize per person
let allReachable = 0;
let partialReachable = 0;
let noneReachable = 0;
let totalReachable = 0;
let totalUrls = 0;

for (const person of people) {
  const personResults = results[person.person_id] || [];
  const reachableCount = personResults.filter((r) => r.reachable).length;
  const personTotal = personResults.length;
  totalUrls += personTotal;
  totalReachable += reachableCount;

  if (personTotal > 0) {
    if (reachableCount === personTotal) allReachable++;
    else if (reachableCount > 0) partialReachable++;
    else noneReachable++;
  }
}

// Determine new source_audit_status for each person
const updatedPeople = people.map((person) => {
  const personResults = results[person.person_id] || [];
  const reachableCount = personResults.filter((r) => r.reachable).length;
  const personTotal = personResults.length;

  let auditStatus = person.source_audit_status || "not_independently_audited";
  if (personTotal > 0) {
    if (reachableCount === personTotal) {
      auditStatus = "source_verified";
    } else if (reachableCount > 0) {
      auditStatus = "partial_source_verification";
    } else {
      auditStatus = "source_verification_failed";
    }
  }

  const checkedDates = personResults
    .map((result) => result.checked)
    .filter(Boolean)
    .sort();

  return {
    ...person,
    source_audit_status: auditStatus,
    source_audit_date: checkedDates.at(-1) || retrievalDate,
  };
});

// Write audit results
await mkdir(auditDir, { recursive: true });

const auditReport = {
  audit_date: retrievalDate,
  total_people: people.length,
  total_urls: totalUrls,
  urls_reused: reusedCount,
  urls_checked_this_run: pairsToCheck.length,
  urls_reachable: totalReachable,
  urls_unreachable: totalUrls - totalReachable,
  people_all_sources_reachable: allReachable,
  people_partial_sources_reachable: partialReachable,
  people_no_sources_reachable: noneReachable,
  url_reachability_rate: ((totalReachable / totalUrls) * 100).toFixed(1) + "%",
  person_pass_rate: ((allReachable / people.length) * 100).toFixed(1) + "%",
  results: results,
};

await writeFile(
  path.join(auditDir, "audit-v1.json"),
  JSON.stringify(auditReport, null, 2),
);

// Write a human-readable report
const reportLines = [
  `# Source URL reachability audit — ${retrievalDate}`,
  "",
  "## Result",
  "",
  `The audit covers ${totalUrls.toLocaleString()} source URLs across ${people.length.toLocaleString()} people.`,
  `${reusedCount.toLocaleString()} unchanged URL results were retained and ${pairsToCheck.length.toLocaleString()} new URLs were fetched in this run.`,
  `${totalReachable.toLocaleString()} URLs (${((totalReachable / totalUrls) * 100).toFixed(1)}%) were reachable.`,
  `${(totalUrls - totalReachable).toLocaleString()} URLs (${(((totalUrls - totalReachable) / totalUrls) * 100).toFixed(1)}%) were not reachable (dead links, timeouts, or access blocked).`,
  "",
  "| Metric | Count | Share |",
  "|---|---:|---:|",
  `| All sources reachable | ${allReachable.toLocaleString()} | ${((allReachable / people.length) * 100).toFixed(1)}% |`,
  `| Partial sources reachable | ${partialReachable.toLocaleString()} | ${((partialReachable / people.length) * 100).toFixed(1)}% |`,
  `| No sources reachable | ${noneReachable.toLocaleString()} | ${((noneReachable / people.length) * 100).toFixed(1)}% |`,
  "",
  "## What this audit checks",
  "",
  "Each source URL was fetched with a HEAD request (falling back to GET for servers",
  "that reject HEAD). A URL is marked reachable if the HTTP response status is 200–399.",
  "This verifies that the source still exists at the cited location. It does not verify",
  "that the source content supports the specific biographical claims in the dataset.",
  "",
  "## Limitations",
  "",
  "- Some sites block automated requests (HTTP 403) even when the page is live for humans.",
  "- Wikipedia URLs are stable but some personal sites, news articles, and archived pages may have moved.",
  "- Timeout threshold is 8 seconds; slow servers may be marked unreachable.",
  "- This is a reachability audit, not a content verification audit.",
  "",
  `## Data`,
  "",
  `Full results: \`quality/source-audit/audit-v1.json\``,
  "",
];

await writeFile(
  path.join(auditDir, "REPORT.md"),
  reportLines.join("\n"),
);

// Write updated dataset with new source_audit_status values
await writeFile(
  path.join(root, "src", "data", "people.json"),
  JSON.stringify(updatedPeople),
);

console.log(`\nAudit complete:`);
console.log(`  URLs reachable: ${totalReachable}/${totalUrls} (${((totalReachable / totalUrls) * 100).toFixed(1)}%)`);
console.log(`  People all-reachable: ${allReachable}/${people.length} (${((allReachable / people.length) * 100).toFixed(1)}%)`);
console.log(`  People partial: ${partialReachable}/${people.length}`);
console.log(`  People none: ${noneReachable}/${people.length}`);
console.log(`  Report: quality/source-audit/REPORT.md`);
