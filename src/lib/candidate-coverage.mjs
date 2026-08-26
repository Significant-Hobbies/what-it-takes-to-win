const DAY_MS = 24 * 60 * 60 * 1000;

const RESEARCH_STATES = [
  "discovered",
  "enriched",
  "queued",
  "researched",
  "eligible",
  "ineligible",
  "published",
  "stale",
];

export function normalizePersonName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [headers = [], ...records] = rows;
  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])),
  );
}

export function normalizeEligibilityStatus(record) {
  const status = String(record.eligibility_status || record.research_status || "")
    .toLocaleLowerCase("en-US");
  if (["age_30_eligible", "age_26_eligible", "eligible", "eligible_background_unverified"].includes(status)) {
    return "eligible";
  }
  if (["age_30_ineligible", "age_26_ineligible", "ineligible"].includes(status)) {
    return "ineligible";
  }
  if (record.notable_by_26 === true || record.notable === true) return "eligible";
  if (record.notable_by_26 === false || record.notable === false) return "ineligible";
  return status && status !== "unverified_candidate" && status !== "unresearched"
    ? "researched"
    : "queued";
}

export function sourceFreshness(source, asOf) {
  const elapsed = new Date(`${asOf}T00:00:00Z`).getTime()
    - new Date(`${source.snapshot_date}T00:00:00Z`).getTime();
  const ageDays = Math.max(0, Math.floor(elapsed / DAY_MS));
  return {
    age_days: ageDays,
    stale: ageDays > source.freshness_days,
  };
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function urlOrigin(source) {
  try {
    return new URL(source.url).hostname.replace(/^www\./, "").toLocaleLowerCase("en-US");
  } catch {
    return "";
  }
}

function sourceOrigin(source) {
  return urlOrigin(source)
    || String(source.origin || "").replace(/^www\./, "").toLocaleLowerCase("en-US");
}

function result(pass, reasons, details = {}) {
  return { pass, reasons: [...new Set(reasons)].sort(), ...details };
}

export function conservativeAgeAtEvent(signal) {
  const eventDate = validDate(signal.event_date);
  if (!eventDate) return null;
  if (signal.birth_date) {
    const birthDate = validDate(signal.birth_date);
    if (!birthDate || birthDate > eventDate) return null;
    let age = eventDate.getUTCFullYear() - birthDate.getUTCFullYear();
    const eventMonthDay = (eventDate.getUTCMonth() * 100) + eventDate.getUTCDate();
    const birthMonthDay = (birthDate.getUTCMonth() * 100) + birthDate.getUTCDate();
    if (eventMonthDay < birthMonthDay) age -= 1;
    return age;
  }
  const birthYear = Number(signal.birth_year);
  return Number.isInteger(birthYear) ? eventDate.getUTCFullYear() - birthYear : null;
}

function outcomeVerdict(signal, eventGate, age) {
  if (!eventGate) return result(false, ["unsupported_event_type"]);
  const ageBand = eventGate.age_bands.find((band) => age <= band.max_age);
  if (!ageBand) return result(false, ["age_outside_event_gate"]);
  const checks = Object.entries(ageBand.thresholds).map(([metric, threshold]) => ({
    metric,
    threshold,
    actual: Number(signal.metrics?.[metric]),
    pass: Number(signal.metrics?.[metric]) >= threshold,
  }));
  const pass = eventGate.metric_mode === "all"
    ? checks.every((check) => check.pass)
    : checks.some((check) => check.pass);
  return result(pass, pass ? [] : ["outcome_threshold_not_met"], {
    age_band_max: ageBand.max_age,
    metric_mode: eventGate.metric_mode,
    metric_checks: checks,
  });
}

function sourceFacts(signal, registry) {
  const sources = Array.isArray(signal?.sources) ? signal.sources : [];
  const origins = new Set(sources.map(sourceOrigin).filter(Boolean));
  const evidenceOrigins = new Set(sources.map((source) =>
    String(source.evidence_origin || sourceOrigin(source)).toLocaleLowerCase("en-US"),
  ).filter(Boolean));
  const invalidSourceUrls = sources.filter((source) => !urlOrigin(source));
  const mismatchedOrigins = sources.filter((source) => {
    const declared = String(source.origin || "")
      .replace(/^www\./, "")
      .toLocaleLowerCase("en-US");
    return declared && declared !== urlOrigin(source);
  });
  const independentRoles = new Set(registry.research.independent_source_roles);
  const independentSources = sources.filter((source) => independentRoles.has(source.role));
  return { sources, origins, evidenceOrigins, invalidSourceUrls, mismatchedOrigins, independentSources };
}

function isFutureEvent(eventDate, cutoffDate) {
  return Boolean(eventDate && cutoffDate && eventDate > cutoffDate);
}

function discoveryIdentityReasons(context) {
  const { signal, registry, eventDate, cutoffDate, age } = context;
  const reasons = [];
  if (!normalizePersonName(signal?.person_name)) reasons.push("missing_identity");
  if (!eventDate) reasons.push("invalid_event_date");
  if (isFutureEvent(eventDate, cutoffDate)) reasons.push("future_event");
  if (age == null) reasons.push("missing_age_basis");
  if (age != null && (age < 0 || age > registry.target_age_max)) {
    reasons.push("age_outside_target");
  }
  if (age != null && Number(signal?.age_at_event) !== age) reasons.push("age_mismatch");
  if (!registry.discovery.allowed_age_confidence.includes(signal?.age_confidence)) {
    reasons.push("age_confidence_too_low");
  }
  if (!signal?.event_type) reasons.push("missing_event_type");
  const metricsPresent = Object.values(signal?.metrics || {}).some((value) =>
    Number.isFinite(Number(value)),
  );
  if (!metricsPresent) reasons.push("missing_typed_metric");
  return reasons;
}

function discoverySourceReasons(registry, facts) {
  const reasons = [];
  if (facts.invalidSourceUrls.length > 0) reasons.push("invalid_source_url");
  if (facts.mismatchedOrigins.length > 0) reasons.push("declared_origin_mismatch");
  if (facts.origins.size < registry.discovery.minimum_source_origins) {
    reasons.push("insufficient_source_origins");
  }
  return reasons;
}

function researchVerdict(context) {
  const { signal, registry, discovery, outcome, facts } = context;
  const reasons = [];
  if (!discovery.pass) reasons.push("discovery_gate_failed");
  if (!registry.research.allowed_age_confidence.includes(signal?.age_confidence)) {
    reasons.push("age_confidence_too_low");
  }
  if (facts.origins.size < registry.research.minimum_source_origins) {
    reasons.push("insufficient_source_origins");
  }
  if (facts.evidenceOrigins.size < registry.research.minimum_evidence_origins) {
    reasons.push("insufficient_evidence_origins");
  }
  if (facts.independentSources.length < registry.research.minimum_independent_sources) {
    reasons.push("missing_independent_source");
  }
  if (!outcome.pass) reasons.push(...outcome.reasons);
  return result(reasons.length === 0, reasons, {
    evidence_origins: facts.evidenceOrigins.size,
    independent_sources: facts.independentSources.length,
    outcome,
  });
}

function publicationRequiredFieldReasons(publicationRecord, requiredFields) {
  const reasons = [];
  for (const field of requiredFields) {
    const value = publicationRecord[field];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
      reasons.push(`missing_record_field:${field}`);
    }
  }
  return reasons;
}

function publicationIdentityReasons(publicationRecord, signal, eventGate, age) {
  const reasons = [];
  if (publicationRecord.coverage_signal_id !== signal.signal_id) reasons.push("signal_record_mismatch");
  if (normalizePersonName(publicationRecord.name) !== normalizePersonName(signal.person_name)) {
    reasons.push("identity_mismatch");
  }
  if (eventGate && publicationRecord.cohort_group !== eventGate.field) reasons.push("field_mismatch");
  if (publicationRecord.eligibility_status !== "age_30_eligible") {
    reasons.push("eligibility_status_not_approved");
  }
  if (Number(publicationRecord.age_at_milestone) !== age) reasons.push("milestone_age_mismatch");
  return reasons;
}

function publicationEvidenceReasons(publicationRecord, registry, sources) {
  const reasons = [];
  const recordUrls = Array.isArray(publicationRecord.source_urls)
    ? publicationRecord.source_urls
    : [];
  const recordDomains = new Set(recordUrls.map((url) => sourceOrigin({ url })).filter(Boolean));
  if (recordDomains.size < registry.publication.minimum_source_domains) {
    reasons.push("insufficient_publication_domains");
  }
  if (Number(publicationRecord.source_count) !== recordUrls.length) reasons.push("source_count_mismatch");
  if (!recordUrls.includes(publicationRecord.primary_source_url)) reasons.push("primary_source_not_listed");
  if (sources.some((source) => !recordUrls.includes(source.url))) {
    reasons.push("signal_source_not_preserved");
  }
  return reasons;
}

function publicationTrajectoryReasons(publicationRecord, registry, eventDate, age) {
  const reasons = [];
  const trajectory = Array.isArray(publicationRecord.trajectory) ? publicationRecord.trajectory : [];
  if (trajectory.length < registry.publication.minimum_trajectory_events) {
    reasons.push("trajectory_too_short");
  }
  const eventYear = eventDate?.getUTCFullYear();
  if (!trajectory.some((entry) => Number(entry.year) === eventYear && Number(entry.age) === age)) {
    reasons.push("qualifying_event_missing_from_trajectory");
  }
  return reasons;
}

function publicationVerdict(context) {
  const { publicationRecord, signal, registry, research, facts, eventGate, eventDate, age } = context;
  const reasons = research.pass ? [] : ["research_gate_failed"];
  if (!publicationRecord) return result(false, [...reasons, "missing_publication_record"]);
  reasons.push(
    ...publicationRequiredFieldReasons(publicationRecord, registry.publication.required_record_fields),
    ...publicationIdentityReasons(publicationRecord, signal, eventGate, age),
    ...publicationEvidenceReasons(publicationRecord, registry, facts.sources),
    ...publicationTrajectoryReasons(publicationRecord, registry, eventDate, age),
  );
  return result(reasons.length === 0, reasons);
}

export function evaluateCandidateGates(signal, publicationRecord, registry, asOf) {
  const eventDate = validDate(signal?.event_date);
  const cutoffDate = validDate(asOf);
  const age = conservativeAgeAtEvent(signal || {});
  const facts = sourceFacts(signal, registry);
  const eventGate = registry.event_types[signal?.event_type];
  const discoveryReasons = [
    ...discoveryIdentityReasons({ signal, registry, eventDate, cutoffDate, age }),
    ...discoverySourceReasons(registry, facts),
  ];
  const discovery = result(discoveryReasons.length === 0, discoveryReasons, {
    conservative_age: age,
    event_type_registered: Boolean(eventGate),
    source_origins: facts.origins.size,
  });

  const outcome = outcomeVerdict(signal || {}, eventGate, age ?? Number.POSITIVE_INFINITY);
  const research = researchVerdict({ signal, registry, discovery, outcome, facts });
  const publication = publicationVerdict({
    publicationRecord,
    signal,
    registry,
    research,
    facts,
    eventGate,
    eventDate,
    age,
  });

  return {
    version: registry.version,
    calibration_status: registry.calibration_status,
    discovery,
    research,
    publication,
  };
}

function coverageGapBoost(record, sourceStats) {
  const batch = record.batch || "unknown";
  const stats = sourceStats.get(batch);
  if (!stats || stats.discovered === 0) return 10;
  const completion = stats.researched / stats.discovered;
  return Math.round((1 - completion) * 20);
}

export function researchPriority(record, sourceStats = new Map()) {
  if (record.state === "published" || record.state === "ineligible") return 0;
  const strongestSignal = Math.max(
    0,
    ...(record.signals || []).map((signal) => Number(signal.outcome_strength || 0)),
  );
  const independentOrigins = new Set(
    (record.signals || []).flatMap((signal) =>
      (signal.sources || []).map((source) => source.origin).filter(Boolean),
    ),
  ).size;
  const signalScore = Math.round(strongestSignal * 0.55);
  const evidenceScore = Math.min(15, independentOrigins * 5);
  const gateScore = record.gates?.research?.pass
    ? 30
    : record.gates?.discovery?.pass
      ? 20
      : 0;
  const stateScore = record.state === "eligible" ? 10 : record.state === "researched" ? 5 : 10;
  return Math.min(
    100,
    signalScore + evidenceScore + gateScore + stateScore + coverageGapBoost(record, sourceStats),
  );
}

export function summarizeLedger(records, sources, goldSet) {
  const byState = Object.fromEntries(RESEARCH_STATES.map((state) => [state, 0]));
  const byField = {};
  for (const record of records) {
    byState[record.state] = (byState[record.state] || 0) + 1;
    const field = record.field || "Unknown";
    byField[field] = (byField[field] || 0) + 1;
  }
  const goldResults = goldSet.map((entry) => {
    const record = records.find(
      (candidate) => candidate.identity_key === normalizePersonName(entry.person_name),
    );
    const sourceFound = !entry.expected_source || record?.source_ids.includes(entry.expected_source);
    const signalFound = !entry.expected_signal || record?.signals.some(
      (signal) => signal.signal_id === entry.expected_signal,
    );
    const stateMatches = record?.state === entry.expected_state;
    return {
      person_name: entry.person_name,
      pass: Boolean(record && sourceFound && signalFound && stateMatches),
      actual_state: record?.state || "missing",
    };
  });
  return {
    total_candidates: records.length,
    lifecycle: byState,
    fields: Object.entries(byField)
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count),
    queued_backlog: records.filter((record) => ["queued", "eligible", "researched"].includes(record.state)).length,
    high_priority_backlog: records.filter(
      (record) => record.state !== "published" && record.priority >= 70,
    ).length,
    sources,
    gold_set: {
      passed: goldResults.filter((result) => result.pass).length,
      total: goldResults.length,
      results: goldResults,
    },
  };
}
