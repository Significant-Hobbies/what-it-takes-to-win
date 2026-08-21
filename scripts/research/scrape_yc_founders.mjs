import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const companies = JSON.parse(
  readFileSync(join(process.cwd(), "artifacts", "yc-companies-recent.json"), "utf8")
);

const outPath = join(process.cwd(), "artifacts", "yc-founders-recent.json");
const existing = existsSync(outPath)
  ? JSON.parse(readFileSync(outPath, "utf8"))
  : {};
const done = new Set(Object.keys(existing));

console.log(`Total companies: ${companies.length}`);
console.log(`Already scraped: ${done.size}`);
console.log(`Remaining: ${companies.length - done.size}`);

const CONCURRENCY = 5;
const BATCH_SAVE = 20;
const RETRY_MAX = 3;
const RETRY_DELAY = 2000;

async function scrapeCompany(company) {
  const url = `https://www.ycombinator.com/companies/${company.slug}`;
  for (let attempt = 0; attempt < RETRY_MAX; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const html = await res.text();

    // Find the founders section (second occurrence of "Founders" — first is in nav)
    const allFounders = [];
    const seenLinkedIn = new Set();

    // Names are in <div class="text-xl font-bold">Name</div>
    // LinkedIn links are nearby
    // Roles are in <div class="text-sm...">Role</div>

    // Find all founder name divs in the page
    const nameRegex = /class="text-xl font-bold">([^<]+)<\/div>/g;
    const linkedInRegex = /linkedin\.com\/in\/([^"&\s]+)/g;

    // Get all LinkedIn slugs (deduplicated, in order)
    const linkedinSlugs = [];
    for (const match of html.matchAll(linkedInRegex)) {
      const slug = match[1].replace(/\/$/, "");
      if (!seenLinkedIn.has(slug)) {
        seenLinkedIn.add(slug);
        linkedinSlugs.push(slug);
      }
    }

    // Get all names
    const names = [];
    for (const match of html.matchAll(nameRegex)) {
      const name = match[1].trim();
      if (name && name.length > 2 && !names.includes(name)) {
        names.push(name);
      }
    }

    // Get all roles (text-sm class, but filter for role-like text)
    const roleRegex = /class="text-sm[^"]*"[^>]*>([^<]{2,60})<\/div>/g;
    const roles = [];
    for (const match of html.matchAll(roleRegex)) {
      const role = match[1].trim();
      if (role && role.length > 2 && !roles.includes(role)) {
        roles.push(role);
      }
    }

    // Pair names with LinkedIn slugs and roles
    // The number of names should match the number of unique LinkedIn slugs
    const count = Math.min(names.length, linkedinSlugs.length);
    for (let i = 0; i < count; i++) {
      allFounders.push({
        name: names[i],
        role: roles[i] || "Founder",
        linkedin: linkedinSlugs[i],
      });
    }

    // If no LinkedIn links but we have names, use names only
    if (allFounders.length === 0 && names.length > 0) {
      for (const name of names) {
        allFounders.push({ name, role: "Founder", linkedin: "" });
      }
    }

    return { ...company, founders: allFounders };
    } catch (e) {
      if (attempt < RETRY_MAX - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        continue;
      }
      console.error(`  Error scraping ${company.slug}: ${e.message}`);
      return null;
    }
  }
  return null;
}

async function main() {
  const toScrape = companies.filter(c => !done.has(c.slug));
  let scraped = 0;
  let totalFounders = 0;

  for (let i = 0; i < toScrape.length; i += CONCURRENCY) {
    const batch = toScrape.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(scrapeCompany));

    for (const result of results) {
      if (result) {
        existing[result.slug] = result;
        scraped++;
        totalFounders += result.founders.length;
      }
    }

    // Save periodically
    if (scraped % BATCH_SAVE < CONCURRENCY || i + CONCURRENCY >= toScrape.length) {
      writeFileSync(outPath, JSON.stringify(existing, null, 2));
    }

    console.log(
      `Progress: ${scraped}/${toScrape.length} scraped, ${totalFounders} founders found`
    );
  }

  // Final save
  writeFileSync(outPath, JSON.stringify(existing, null, 2));

  // Summary
  const allFounders = [];
  for (const slug of Object.keys(existing)) {
    const company = existing[slug];
    for (const f of company.founders) {
      allFounders.push({
        name: f.name,
        role: f.role,
        company: company.name,
        batch: company.batch,
        industry: company.industry,
        slug: company.slug,
      });
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Companies scraped: ${Object.keys(existing).length}`);
  console.log(`Total founders: ${allFounders.length}`);
  console.log(`Unique founder names: ${new Set(allFounders.map(f => f.name)).size}`);

  // Group by batch
  const byBatch = {};
  for (const f of allFounders) {
    byBatch[f.batch] = (byBatch[f.batch] || 0) + 1;
  }
  console.log("Founders by batch:", byBatch);

  // Save deduplicated founder list
  const seen = new Set();
  const unique = [];
  for (const f of allFounders) {
    const key = f.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }
  writeFileSync(
    join(process.cwd(), "artifacts", "yc-founders-unique.json"),
    JSON.stringify(unique, null, 2)
  );
  console.log(`\nSaved ${unique.length} unique founders to yc-founders-unique.json`);
}

main().catch(console.error);
