import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const csvPath = join(root, "src", "data", "people.csv");

// Load CSV
const csvText = readFileSync(csvPath, "utf8");
const lines = csvText.split("\n").filter(l => l.length > 0);
const headers = parseCsvLine(lines[0]);
const records = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i]);
  const record = {};
  for (let j = 0; j < headers.length && j < row.length; j++) {
    record[headers[j]] = row[j];
  }
  records.push(record);
}

console.log(`Loaded ${records.length} records`);

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else { current += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { result.push(current); current = ""; }
      else { current += char; }
    }
  }
  result.push(current);
  return result;
}

// Heuristic scoring based on existing data
function heuristicScore(r) {
  const name = r.name || "";
  const evidence = (r.evidence_summary || "").toLowerCase();
  const earlyHistory = (r.early_history_summary || "").toLowerCase();
  const milestone = (r.milestone_by_age_26 || "").toLowerCase();
  const archetype = (r.primary_early_advantage_archetype || "").toLowerCase();
  const tags = (r.primary_early_advantage_tags || "").toLowerCase();
  const category = (r.category || "").toLowerCase();
  const combined = `${evidence} ${earlyHistory} ${milestone} ${tags} ${category}`;

  // --- PERSONAL ENDOWMENT ---
  let endowment = 1; // default: modest advantage (they're notable after all)
  let endowmentConfidence = "Low";

  // Prodigy indicators → 3
  const endowment3 = [
    "imo", "gold medal", "ioi", "iphO", "icho", "international olympiad",
    "prodigy", "youngest ever", "youngest to", "chess master", "grandmaster",
    "phd at", "bachelor at", "university at", "started coding at 8", "started coding at 9",
    "started coding at 10", "started programming at 8", "started programming at 9",
    "started programming at 10", "published at", "neurips", "icml", "iclr",
    "nature ", "science ", "perfect score", "5 gold", "4 gold", "3 gold",
    "youngest phd", "graduated at", "enrolled at", "math olympiad", "usamo",
    "usaco platinum", "usaco gold", "putnam", "morgan prize", "regeneron sts",
    "intel sts", "isef", "google science fair", "young researcher",
    "national champion", "world champion", "world record",
  ];
  if (endowment3.some(k => combined.includes(k))) {
    endowment = 3;
    endowmentConfidence = "Medium";
  }

  // Significant indicators → 2
  const endowment2 = [
    "coding at", "programming at", "started coding", "started programming",
    "hackathon", "competition", "award", "patent", "published",
    "research", "stanford", "mit", "harvard", "caltech", "princeton",
    "waterloo", "berkeley", "iit", "oxbridge", "oxford", "cambridge",
    "rhodes", "marshall", "fulbright", "truman", "goldwater",
    "forbes 30", "forbes under 30", "30 under 30",
    "dropped out", "drop out", "left university", "left college",
    "valedictorian", "salutatorian", "national merit",
    "first author", "peer-reviewed", "ieee", "acl", "emnlp",
    "chess", "fide", "piano", "violin", "concert",
  ];
  if (endowment < 3 && endowment2.some(k => combined.includes(k))) {
    endowment = 2;
    endowmentConfidence = "Low";
  }

  // Athletes/creators with early achievement → 2
  if (category.includes("athlete") || category.includes("sport")) {
    if (combined.includes("olympic") || combined.includes("world champion") || combined.includes("medal")) {
      endowment = 2;
      endowmentConfidence = "Medium";
    }
  }
  if (category.includes("music") || category.includes("actor") || category.includes("artist") || category.includes("creator")) {
    if (combined.includes("prodigy") || combined.includes("youngest") || combined.includes("at age") || combined.includes("at 14") || combined.includes("at 15") || combined.includes("at 16")) {
      endowment = 2;
      endowmentConfidence = "Medium";
    }
  }

  // Active disadvantage → -1
  const endowmentNeg1 = ["learning disability", "dyslexia", "adhd", "autism", "speech impediment"];
  // Note: many successful people overcame these, so only use -1 if explicitly framed as disadvantage

  // --- INHERITED LEVERAGE ---
  let inherited = 1; // default: modest advantage
  let inheritedConfidence = "Low";

  // Rare, trajectory-changing → 3
  const inherited3 = [
    "father was ceo", "mother was ceo", "father was founder", "mother was founder",
    "father was vp", "mother was vp", "father was president", "mother was president",
    "family business", "trust fund", "inherited", "billionaire family",
    "father was a professor", "mother was a professor",
    "father was minister", "mother was minister",
    "father was ambassador", "father was senator", "mother was senator",
    "father was governor", "royal family", "nepotism", "family dynasty",
    "father was ibm", "mother was ibm", "father was goldman", "mother was goldman",
    "father was partner at", "mother was partner at",
    "father was cfo", "mother was cfo", "father was cto", "mother was cto",
    "father was director", "mother was director",
    "family fortune", "wealthy family", "upper class",
    "private school", "boarding school", "prep school",
    "eton college", "harrow", "phillips exeter", "phillips andover",
    "deerfield", "hotchkiss", "lawrenceville", "groton",
  ];
  if (inherited3.some(k => combined.includes(k))) {
    inherited = 3;
    inheritedConfidence = "Medium";
  }

  // Significant advantage → 2
  const inherited2 = [
    "father was", "mother was", "parents were",
    "father is", "mother is",
    "engineer", "doctor", "lawyer", "architect",
    "university professor", "college professor",
    "manager", "executive", "business owner",
    "entrepreneur", "startup", "tech",
    "upper-middle", "upper middle",
    "selective school",
    "family restaurant", "family business",
    "father worked at", "mother worked at",
    "immigrant parents", "parents immigrated",
  ];
  if (inherited < 3 && inherited2.some(k => combined.includes(k))) {
    inherited = 2;
    inheritedConfidence = "Low";
  }

  // Active disadvantage → -1
  const inheritedNeg1 = [
    "poverty", "grew up poor", "working class", "low income",
    "single mother", "single parent", "welfare",
    "refugee", "displaced", "homeless",
    "father abandoned", "father left", "orphan",
    "could not afford", "couldn't afford",
    "village", "rural farming", "sharecropper",
  ];
  if (inheritedNeg1.some(k => combined.includes(k))) {
    inherited = -1;
    inheritedConfidence = "Medium";
  }

  // Archetype-based adjustments
  if (archetype.includes("family") || archetype.includes("inherited")) {
    inherited = Math.max(inherited, 2);
  }
  if (archetype.includes("adversity") || archetype.includes("constraint")) {
    if (inheritedNeg1.some(k => combined.includes(k))) inherited = -1;
    else inherited = Math.min(inherited, 1);
  }

  // --- CATALYTIC ECOSYSTEM ---
  let ecosystem = 1; // default: modest advantage
  let ecosystemConfidence = "Low";

  // Rare, trajectory-changing → 3
  const ecosystem3 = [
    "lakeside", "paypal mafia", "homebrew computer club", "bell labs",
    "fairchild", "traitorous eight", "shockley",
    "y combinator", "yc batch", "paul graham", "paul allen",
    "steve jobs", "steve wozniak", "bill gates",
    "mark zuckerberg", "dustin moskovitz",
    "elon musk", "peter thiel", "max levchin",
    "warren buffett",
    "fei-fei li", "yann lecun", "geoffrey hinton", "yoshua bengio",
    "andrew ng", "daphne koller",
  ];
  if (ecosystem3.some(k => combined.includes(k))) {
    ecosystem = 3;
    ecosystemConfidence = "Medium";
  }

  // Significant advantage → 2
  const ecosystem2 = [
    "cofounder", "co-founder", "founded with", "team",
    "stanford", "mit", "harvard", "caltech", "princeton",
    "berkeley", "waterloo", "iit", "oxford", "cambridge",
    "research lab", "research group", "phd advisor",
    "sibling", "brother", "sister", "twin",
    "met at", "joined forces",
    "mentor", "advisor", "coach", "tutor",
    "hackathon team", "competition team",
    "yc", "y combinator", "accelerator",
    "dorm", "roommate",
    "silicon valley", "san francisco", "tech hub",
    "early access", "mainframe", "computer time",
  ];
  if (ecosystem < 3 && ecosystem2.some(k => combined.includes(k))) {
    ecosystem = 2;
    ecosystemConfidence = "Low";
  }

  // Active disadvantage → -1
  const ecosystemNeg1 = ["no access to education", "war zone", "no internet", "no computer", "isolated", "rural village"];
  if (ecosystemNeg1.some(k => combined.includes(k))) {
    ecosystem = -1;
    ecosystemConfidence = "Medium";
  }

  // Solo → 0
  const ecosystem0 = ["solo founder", "solo", "self-taught", "autodidact", "alone", "no mentor"];
  if (ecosystem < 2 && ecosystem0.some(k => combined.includes(k))) {
    ecosystem = 0;
    ecosystemConfidence = "Low";
  }

  // Archetype-based
  if (archetype.includes("peer") || archetype.includes("mentor") || archetype.includes("high-trust")) {
    ecosystem = Math.max(ecosystem, 2);
  }
  if (archetype.includes("frontier") || archetype.includes("ecosystem")) {
    ecosystem = Math.max(ecosystem, 2);
  }

  // --- CONFIDENCE ---
  // All heuristic scores are Low confidence — they're keyword-matched, not researched
  const confidence = "Low";
  const needsLLM = true;

  return {
    person_id: r.person_id,
    name,
    personal_endowment_score: endowment,
    inherited_leverage_score: inherited,
    catalytic_ecosystem_score: ecosystem,
    endowment_summary: extractEndowmentSummary(r),
    inherited_summary: extractInheritedSummary(r),
    ecosystem_summary: extractEcosystemSummary(r),
    scoring_confidence: confidence,
    needs_llm: needsLLM,
  };
}

function extractEndowmentSummary(r) {
  const evidence = r.evidence_summary || "";
  const early = r.early_history_summary || "";
  // Prefer early_history for endowment, fall back to evidence
  const source = early.length > 20 ? early : evidence;
  if (source.length > 20) return source.substring(0, 200);
  const milestone = r.milestone_by_age_26 || "";
  if (milestone.length > 20) return milestone.substring(0, 200);
  return "Early ability indicators not documented.";
}

function extractInheritedSummary(r) {
  const evidence = r.evidence_summary || "";
  const early = r.early_history_summary || "";
  const familyContext = r.family_context_summary || "";
  const parentDomain = r.parent_family_domain_summary || "";
  // Prefer family-specific fields, then keyword-matched sentences
  if (familyContext.length > 20) return familyContext.substring(0, 200);
  if (parentDomain.length > 20) return parentDomain.substring(0, 200);
  const parentKeywords = ["father", "mother", "parents", "family", "parents'", "dad", "mom"];
  const sentences = (evidence + " " + early).split(/\.(?=[A-Z])/);
  const parentSentences = sentences.filter(s => parentKeywords.some(k => s.toLowerCase().includes(k)));
  if (parentSentences.length > 0) {
    return parentSentences.slice(0, 2).join(". ").trim() + ".";
  }
  return "Family background not well documented.";
}

function extractEcosystemSummary(r) {
  const evidence = r.evidence_summary || "";
  const early = r.early_history_summary || "";
  const peerKeywords = ["cofounder", "co-founder", "mentor", "peer", "team", "met at", "brother", "sister", "sibling", "roommate", "dorm", "school", "university", "stanford", "mit", "harvard"];
  const sentences = (evidence + " " + early).split(/\.(?=[A-Z])/);
  const peerSentences = sentences.filter(s => peerKeywords.some(k => s.toLowerCase().includes(k)));
  if (peerSentences.length > 0) {
    return peerSentences.slice(0, 2).join(". ").trim() + ".";
  }
  return "Ecosystem and peer relationships not well documented.";
}

// Score all records
const scored = records.map(heuristicScore);

// Stats
const needsLLM = scored.filter(s => s.needs_llm);
const highConfidence = scored.filter(s => s.scoring_confidence !== "Low");

console.log(`\nHeuristic scoring complete:`);
console.log(`  Total scored: ${scored.length}`);
console.log(`  Needs LLM review: ${needsLLM.length}`);
console.log(`  Medium+ confidence: ${highConfidence.length}`);

// Score distribution
const endowmentDist = { "-1": 0, 0: 0, 1: 0, 2: 0, 3: 0 };
const inheritedDist = { "-1": 0, 0: 0, 1: 0, 2: 0, 3: 0 };
const ecosystemDist = { "-1": 0, 0: 0, 1: 0, 2: 0, 3: 0 };
for (const s of scored) {
  endowmentDist[String(s.personal_endowment_score)]++;
  inheritedDist[String(s.inherited_leverage_score)]++;
  ecosystemDist[String(s.catalytic_ecosystem_score)]++;
}
console.log(`\nPersonal endowment: -1=${endowmentDist["-1"]}, 0=${endowmentDist["0"]}, 1=${endowmentDist["1"]}, 2=${endowmentDist["2"]}, 3=${endowmentDist["3"]}`);
console.log(`Inherited leverage: -1=${inheritedDist["-1"]}, 0=${inheritedDist["0"]}, 1=${inheritedDist["1"]}, 2=${inheritedDist["2"]}, 3=${inheritedDist["3"]}`);
console.log(`Catalytic ecosystem: -1=${ecosystemDist["-1"]}, 0=${ecosystemDist["0"]}, 1=${ecosystemDist["1"]}, 2=${ecosystemDist["2"]}, 3=${ecosystemDist["3"]}`);

// Write all scores
writeFileSync(join(root, "artifacts", "heuristic-scores.json"), JSON.stringify(scored, null, 2));

// Write list of IDs needing LLM review
writeFileSync(join(root, "artifacts", "needs-llm-scoring.json"), JSON.stringify(needsLLM.map(s => ({
  person_id: s.person_id,
  name: s.name,
  heuristic_endowment: s.personal_endowment_score,
  heuristic_inherited: s.inherited_leverage_score,
  heuristic_ecosystem: s.catalytic_ecosystem_score,
})), null, 2));

console.log(`\nWrote artifacts/heuristic-scores.json and artifacts/needs-llm-scoring.json`);
