import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const contracts = [
  {
    name: "Overview central finding",
    file: "overview/index.html",
    markers: [
      'data-clarity-contract="central-finding"',
      'data-clarity-contract="four-stage-model"',
      "The data shows a gradient, not a formula",
    ],
  },
  {
    name: "Overview survivor-path narrative",
    file: "overview/index.html",
    markers: [
      "Extraordinary outcomes are surviving paths",
      "Visible outcome / unseen alternatives",
      "Biography hides the branches",
      'data-clarity-contract="survivor-path-narrative"',
      "You are looking at the surviving branch",
      "Six hypothetical 50/50 gates",
      "Illustration only",
      "Real careers are neither independent nor fair coins",
      "Advantage changes the first tosses",
      "Capability can improve the coin",
      "Runway buys more tosses",
      "A streak is still a streak",
      "your unfinished branch with someone else’s surviving streak",
      "Do not inherit the comparison",
    ],
  },
  {
    name: "Canonical story landing",
    file: "index.html",
    markers: [
      "The path you remember is one of many.",
      "Thought experiment · not a measured probability",
      "64 plausible starts → 1 remembered finish",
      "Selected successful outliers. No control group. No forecast.",
      "Starting advantage changes the available moves.",
      "Study the conditions. Inspect what was built. Respect what cannot be replayed.",
      "Then return to your own unfinished branch.",
      "Who Filled the King's Jug?",
    ],
  },
  {
    name: "Public evidence coverage",
    file: "coverage/index.html",
    markers: [
      'data-clarity-contract="public-evidence-coverage"',
      "Complete enough to inspect",
      "Not complete enough to predict",
      "Coverage is a ladder—not one percentage",
      "Two source domains",
      "Source reachability verified",
      "A selected atlas—not a miniature population",
      "This project cannot count every promising path that disappeared",
      "how many failed for every Bill Gates",
      // The gate tally and the reachability sentences are derived from the
      // audit status of the published records, so this contract pins only what
      // must hold in either state: a stated gate count, a path-denominated
      // reachability figure, and the two pending gates. Pinning a fixed tally
      // is what let "Two gates done" survive as a false claim after 837
      // unaudited paths were published.
      "gate done.",
      "paths have every listed source verified reachable",
      "Content verification and user comprehension remain pending",
      "User comprehension and matched comparison remain pending",
    ],
  },
  {
    name: "One-minute outcome answer",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="one-minute-answer"',
      "Starting advantages shape the first available moves",
      "Leverage can be built, converted, earned, or encountered",
      "Tier describes observed career recognition",
    ],
  },
  {
    name: "Separated score families and provenance",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="score-family-distinction"',
      "Starting advantages",
      "Built or converted leverage",
      "Five possible origins of leverage",
      "best-supported origin for every non-zero lever",
    ],
  },
  {
    name: "Tier definitions and overlap",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="tier-definitions"',
      'data-clarity-contract="gradient-and-overlap"',
      "A real gradient—and no clean dividing line",
      "A high score is positioning, not proof",
    ],
  },
  {
    name: "Outcome distribution and denominator",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="outcome-distribution-context"',
      "How rare is a Bill Gates-level tier in this dataset?",
      "lower-tier paths per T1 profile",
      "This is the power-law lesson—not a fitted power law",
      "The true population denominator is absent",
    ],
  },
  {
    name: "Six-question comprehension check",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="comprehension-check"',
      "Why is direct comparison incomplete?",
      "Can I ask “Am I the next X?” for a specific person?",
      "Where does luck fit?",
      "Was each capability inherited, enabled, earned, external, or built?",
      "Why do superficially similar profiles diverge?",
      "What percentile is this person—and how many people were far from them?",
    ],
  },
  {
    name: "Connected person path",
    file: "person/bill-gates/index.html",
    markers: [
      'data-clarity-contract="person-path"',
      "Starting advantages",
      "Built or converted leverage",
      "Compounding trajectory",
      "Observed career standing",
      'data-clarity-contract="leverage-provenance"',
      "leverage provenance",
      "best-supported origin",
      'data-clarity-contract="luck-and-variance"',
      "Am I the next Bill Gates?",
      'data-clarity-contract="outcome-distribution-context"',
      "lower-tier paths in this dataset",
      "not Bill Gates",
    ],
  },
  {
    name: "Comparison redundancy, luck, and counterexamples",
    file: "insights/index.html",
    markers: [
      'data-clarity-contract="comparison-redundancy"',
      "A matching profile is not a matching path",
      'data-clarity-contract="luck-and-variance"',
      "Luck changes the path without becoming a score",
      'data-clarity-contract="path-counterexamples"',
      "Similar numbers, visibly different lives",
    ],
  },
  {
    name: "Person-specific comparison",
    file: "am-i-the-next/bill-gates/index.html",
    markers: [
      'data-clarity-contract="person-specific-questionnaire"',
      "Which visible ingredients do you share?",
      'data-clarity-contract="comparison-redundancy"',
      "surface resemblance",
      "not the probability that you become",
      'data-clarity-contract="luck-and-variance"',
    ],
  },
  {
    name: "Comparison chooser",
    file: "compare/index.html",
    markers: [
      'data-clarity-contract="comparison-redundancy"',
      "Comparison is the doorway—not the answer",
      "Choose a person",
      "What no comparison can reveal",
    ],
  },
  {
    name: "Methodological boundary",
    file: "methodology/index.html",
    markers: [
      "This is a descriptive model, not a causal recipe",
      "The tier is not calculated from advantage or leverage scores",
      "should not be read as the significance of only the selected early milestone",
      "descriptive associations",
      "The score records the presence of leverage, not its provenance",
      "Person-specific comparison",
      "Luck and outcome variance",
      "Programmatic page evidence gate",
      "Outcome distribution context",
      "not a fitted power law",
      "Coin-toss thought experiment",
      "not an observed attrition rate",
    ],
  },
];

const failures = [];
const passes = [];

if (!fs.existsSync(dist)) {
  failures.push("dist/ does not exist; run npm run build first");
} else {
  for (const contract of contracts) {
    const file = path.join(dist, contract.file);
    if (!fs.existsSync(file)) {
      failures.push(`${contract.name}: missing ${contract.file}`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    const missing = contract.markers.filter((marker) => !html.includes(marker));
    if (missing.length) {
      failures.push(`${contract.name}: missing ${missing.join(" | ")}`);
    } else {
      passes.push(contract.name);
    }
  }

  const htmlFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name.endsWith(".html")) htmlFiles.push(target);
    }
  }
  walk(dist);

  let checkedLinks = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g)) {
      const url = match[1];
      if (!url.startsWith("/") || url.startsWith("//") || url.includes("${")) continue;
      checkedLinks += 1;
      let target = path.join(dist, decodeURIComponent(url));
      if (url.endsWith("/")) target = path.join(target, "index.html");
      else if (!path.extname(target)) target = path.join(target, "index.html");
      if (!fs.existsSync(target)) {
        failures.push(`Broken internal link: ${path.relative(dist, file)} -> ${url}`);
      }
    }
  }
  passes.push(`${htmlFiles.length} rendered HTML files`);
  passes.push(`${checkedLinks} concrete internal links`);
}

console.log(JSON.stringify({
  status: failures.length ? "fail" : "pass",
  contractsPassed: passes,
  failures,
}, null, 2));

if (failures.length) process.exitCode = 1;
