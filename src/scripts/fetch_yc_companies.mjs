import { writeFileSync } from "fs";
import { join } from "path";

const APP_ID = "45BWZJ1SGC";
const API_KEY = "NzllNTY5MzJiZGM2OTY2ZTQwMDEzOTNhYWZiZGRjODlhYzVkNjBmOGRjNzJiMWM4ZTU0ZDlhYTZjOTJiMjlhMWFuYWx5dGljc1RhZ3M9eWNkYyZyZXN0cmljdEluZGljZXM9WUNDb21wYW55X3Byb2R1Y3Rpb24lMkNZQ0NvbXBhbnlfQnlfTGF1bmNoX0RhdGVfcHJvZHVjdGlvbiZ0YWdGaWx0ZXJzPSU1QiUyMnljZGNfcHVibGljJTIyJTVE";
const INDEX = "YCCompany_production";

// Recent batches we care about
const recentBatches = [
  "Winter 2022", "Summer 2022",
  "Winter 2023", "Summer 2023",
  "Winter 2024", "Summer 2024",
  "Winter 2025", "Summer 2025",
  "Winter 2026",
];

async function fetchBatch(batchName) {
  const url = `https://${APP_ID}-dsn.algolia.net/1/indexes/${INDEX}/query`;
  const allHits = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Algolia-Application-Id": APP_ID,
        "X-Algolia-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        params: `hitsPerPage=1000&page=${page}&tagFilters=["ycdc_public"]&facetFilters=[["batch:${batchName}"]]`,
      }),
    });
    const data = await res.json();
    totalPages = data.nbPages;
    console.log(`  ${batchName} page ${page + 1}/${totalPages}: ${data.hits.length} hits`);
    allHits.push(...data.hits);
    page++;
  }
  return allHits;
}

async function main() {
  const allCompanies = [];

  for (const batch of recentBatches) {
    console.log(`Fetching ${batch}...`);
    const hits = await fetchBatch(batch);
    allCompanies.push(...hits);
  }

  console.log(`\nTotal recent companies: ${allCompanies.length}`);

  // Group by batch
  const byBatch = {};
  for (const c of allCompanies) {
    byBatch[c.batch] = (byBatch[c.batch] || 0) + 1;
  }
  console.log("By batch:", byBatch);

  // Save minimal data for each company
  const minimal = allCompanies.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    batch: c.batch,
    status: c.status,
    industry: c.industry,
    subindustry: c.subindustry,
    one_liner: c.one_liner,
    long_description: c.long_description,
    website: c.website,
    location: c.all_locations,
    team_size: c.team_size,
    launched_at: c.launched_at,
    top_company: c.top_company,
    tags: c.tags,
  }));

  const outPath = join(process.cwd(), "artifacts", "yc-companies-recent.json");
  writeFileSync(outPath, JSON.stringify(minimal, null, 2));
  console.log(`\nSaved ${minimal.length} companies to ${outPath}`);
}

main().catch(console.error);
