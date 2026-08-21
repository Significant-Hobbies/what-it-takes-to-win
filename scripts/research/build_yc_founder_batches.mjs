import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const founders = JSON.parse(
  readFileSync(join(process.cwd(), "artifacts", "yc-founders-unique.json"), "utf8")
);

const batchDir = join(process.cwd(), "artifacts", "yc-founder-batches");
if (!existsSync(batchDir)) mkdirSync(batchDir, { recursive: true });

const BATCH_SIZE = 25;
const batches = [];

for (let i = 0; i < founders.length; i += BATCH_SIZE) {
  const batch = founders.slice(i, i + BATCH_SIZE);
  const batchNum = String(Math.floor(i / BATCH_SIZE) + 1).padStart(3, "0");
  const batchPath = join(batchDir, `batch_${batchNum}.json`);
  writeFileSync(batchPath, JSON.stringify(batch, null, 2));
  batches.push(batchNum);
}

console.log(`Created ${batches.length} batches of ${BATCH_SIZE} founders each`);
console.log(`Total founders: ${founders.length}`);
console.log(`Batch files: ${batches[0]} to ${batches[batches.length - 1]}`);
