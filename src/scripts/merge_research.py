#!/usr/bin/env python3
"""Merge subagent research JSONL results into the main people dataset.

Reads:
  - src/data/people.csv (existing 112 curated people)
  - data/research/results/batch_*.jsonl (subagent output)

Writes:
  - src/data/people.csv (extended with eligible new people)
  - src/data/people.jsonl (same, in JSONL)
  - data/research/merge_report.json (stats on eligibility, duplicates, errors)

Only people with eligibility_status == "age_26_eligible" are added to the main
dataset. Ineligible and unverified candidates are kept in the research directory
for transparency but not merged into the published dataset.
"""
from __future__ import annotations
import argparse
import csv
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]

EXISTING_CSV_FIELDS = [
    "person_id", "name", "cohort_group", "category", "age_at_milestone",
    "milestone_by_age_26", "early_history_summary", "primary_leverage_engine",
    "normalized_primary_engine", "secondary_engine",
    "started_serious_reps_before_20_score", "prior_reps_score",
    "scarce_skill_depth_score", "native_distribution_score",
    "elite_ecosystem_network_score", "complementary_team_score",
    "structural_wave_score", "concentration_intensity_score",
    "capital_safety_score", "domain_proximity_score", "total_leverage_score",
    "success_tier", "leverage_evidence_confidence", "family_context_summary",
    "parent_family_domain_summary",
    "early_family_financial_platform_support_score",
    "parent_family_domain_advantage_score",
    "inherited_audience_business_network_score",
    "elite_institution_performance_pipeline_score",
    "frontier_geography_ecosystem_score", "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "exceptional_peer_cofounder_sibling_score",
    "early_online_platform_community_score",
    "direct_customer_domain_exposure_score", "prodigy_physical_edge_score",
    "adversity_constraint_catalyst_score", "inherited_access_stack_count",
    "exceptional_inherited_access_count", "all_documented_early_condition_count",
    "primary_early_advantage_archetype", "primary_early_advantage_tags",
    "evidence_summary", "early_advantage_evidence_confidence", "source_count",
    "primary_source_url", "source_urls_pipe", "annotation_status",
    "source_audit_status", "data_version",
    "starting_point", "current_position", "current_position_year", "is_living",
    "trajectory_json",
]

NUMERIC_FIELDS = {
    "age_at_milestone", "started_serious_reps_before_20_score", "prior_reps_score",
    "scarce_skill_depth_score", "native_distribution_score",
    "elite_ecosystem_network_score", "complementary_team_score",
    "structural_wave_score", "concentration_intensity_score",
    "capital_safety_score", "domain_proximity_score", "total_leverage_score",
    "success_tier", "early_family_financial_platform_support_score",
    "parent_family_domain_advantage_score",
    "inherited_audience_business_network_score",
    "elite_institution_performance_pipeline_score",
    "frontier_geography_ecosystem_score", "rare_early_tools_facilities_score",
    "dedicated_mentor_coach_tutor_score",
    "exceptional_peer_cofounder_sibling_score",
    "early_online_platform_community_score",
    "direct_customer_domain_exposure_score", "prodigy_physical_edge_score",
    "adversity_constraint_catalyst_score", "inherited_access_stack_count",
    "exceptional_inherited_access_count", "all_documented_early_condition_count",
    "source_count", "current_position_year",
}

REQUIRED_FIELDS = {
    "person_id", "name", "age_at_milestone", "milestone_by_age_26",
    "primary_source_url", "annotation_status", "data_version",
}


def slug(name: str) -> str:
    s = "".join(ch.lower() if ch.isalnum() else "-" for ch in name).strip("-")
    return "-".join(p for p in s.split("-") if p)


def to_csv_row(obj: dict) -> dict:
    """Convert a subagent JSON object to a CSV row matching EXISTING_CSV_FIELDS."""
    row = {}
    for f in EXISTING_CSV_FIELDS:
        v = obj.get(f)
        if f == "source_urls_pipe":
            urls = obj.get("source_urls") or []
            v = " | ".join(urls)
        elif f == "primary_early_advantage_tags":
            tags = obj.get("primary_early_advantage_tags")
            if isinstance(tags, list):
                v = ", ".join(tags)
        elif f == "trajectory_json":
            traj = obj.get("trajectory")
            v = json.dumps(traj, ensure_ascii=False) if traj else ""
        elif f == "is_living":
            il = obj.get("is_living")
            if il is True:
                v = "true"
            elif il is False:
                v = "false"
            else:
                v = ""
        if v is None:
            v = ""
        row[f] = v
    return row


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--results-dir", default="data/research/results")
    parser.add_argument("--existing-csv", default="src/data/people.csv")
    parser.add_argument("--output-csv", default="src/data/people.csv")
    parser.add_argument("--output-jsonl", default="src/data/people.jsonl")
    parser.add_argument("--report", default="data/research/merge_report.json")
    args = parser.parse_args()

    results_dir = ROOT / args.results_dir
    existing_csv = ROOT / args.existing_csv
    output_csv = ROOT / args.output_csv
    output_jsonl = ROOT / args.output_jsonl
    report_path = ROOT / args.report

    # Load existing
    existing: list[dict] = []
    with existing_csv.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            existing.append(row)
    existing_ids = {r["person_id"] for r in existing}
    existing_names = {r["name"].casefold() for r in existing}

    # Load subagent results
    eligible: list[dict] = []
    ineligible: list[dict] = []
    errors: list[str] = []
    seen_ids: set[str] = set()
    duplicates: list[str] = []

    jsonl_files = sorted(results_dir.glob("batch_*.jsonl"))
    for jf in jsonl_files:
        for lineno, line in enumerate(jf.open(encoding="utf-8"), 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                errors.append(f"{jf.name}:{lineno}: invalid JSON: {e}")
                continue

            # Validate required fields for eligible rows
            status = obj.get("eligibility_status", "unverified_candidate")
            if status == "age_26_eligible":
                missing = REQUIRED_FIELDS - set(obj.keys())
                if missing:
                    errors.append(f"{jf.name}:{lineno}: {obj.get('name','?')} missing fields: {missing}")
                    continue
                pid = obj.get("person_id") or ""
                # If person_id is a candidate_id like "candidate-0279-rafael-nadal",
                # replace with a clean slug from the name.
                if pid.startswith("candidate-") or not pid:
                    pid = slug(obj.get("name", ""))
                obj["person_id"] = pid
                if pid in existing_ids or pid in seen_ids:
                    duplicates.append(f"{pid} ({obj.get('name')})")
                    continue
                if obj.get("name", "").casefold() in existing_names:
                    duplicates.append(f"{obj.get('name')} (name match)")
                    continue
                seen_ids.add(pid)

                # Validate numeric ranges roughly
                ok = True
                for f, (lo, hi) in [
                    ("age_at_milestone", (0, 26)),
                    ("success_tier", (1, 4)),
                ]:
                    v = obj.get(f)
                    if v is not None and isinstance(v, (int, float)):
                        if not lo <= v <= hi:
                            errors.append(f"{jf.name}:{lineno}: {obj.get('name')} {f}={v} out of range {lo}..{hi}")
                            ok = False
                if not ok:
                    continue

                eligible.append(obj)
            elif status == "age_26_ineligible":
                ineligible.append(obj)
            else:
                errors.append(f"{jf.name}:{lineno}: unknown eligibility_status {status!r} for {obj.get('name','?')}")

    # Merge: existing + eligible new
    new_rows = [to_csv_row(obj) for obj in eligible]
    all_rows = existing + new_rows

    # Write CSV
    with output_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=EXISTING_CSV_FIELDS)
        writer.writeheader()
        for row in all_rows:
            writer.writerow({k: row.get(k, "") for k in EXISTING_CSV_FIELDS})

    # Write JSONL (existing rows converted + new objects)
    with output_jsonl.open("w", encoding="utf-8") as f:
        for row in existing:
            obj = {}
            for k, v in row.items():
                if k in NUMERIC_FIELDS and v != "":
                    try:
                        obj[k] = int(v)
                    except ValueError:
                        obj[k] = v
                else:
                    obj[k] = v
            obj["source_urls"] = [u.strip() for u in (row.get("source_urls_pipe") or "").split("|") if u.strip()]
            obj["primary_early_advantage_tags_list"] = [t.strip() for t in (row.get("primary_early_advantage_tags") or "").split(",") if t.strip()]
            # trajectory_json -> trajectory
            tj = row.get("trajectory_json") or ""
            if tj:
                try:
                    obj["trajectory"] = json.loads(tj)
                except json.JSONDecodeError:
                    obj["trajectory"] = []
            else:
                obj["trajectory"] = []
            # is_living
            il = row.get("is_living") or ""
            if il == "true":
                obj["is_living"] = True
            elif il == "false":
                obj["is_living"] = False
            else:
                obj["is_living"] = None
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        for obj in eligible:
            out = {k: v for k, v in obj.items() if k != "eligibility_status"}
            tags = obj.get("primary_early_advantage_tags")
            if isinstance(tags, str):
                out["primary_early_advantage_tags_list"] = [t.strip() for t in tags.split(",") if t.strip()]
            elif isinstance(tags, list):
                out["primary_early_advantage_tags_list"] = tags
            f.write(json.dumps(out, ensure_ascii=False) + "\n")

    # Report
    report = {
        "existing_people": len(existing),
        "eligible_new": len(eligible),
        "ineligible": len(ineligible),
        "total_after_merge": len(all_rows),
        "duplicates_skipped": len(duplicates),
        "errors": len(errors),
        "duplicate_list": duplicates[:50],
        "error_list": errors[:50],
        "ineligible_names": [o.get("name") for o in ineligible[:100]],
        "eligible_new_names": [o.get("name") for o in eligible],
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    print(f"Existing: {len(existing)}")
    print(f"Eligible new: {len(eligible)}")
    print(f"Ineligible: {len(ineligible)}")
    print(f"Duplicates skipped: {len(duplicates)}")
    print(f"Errors: {len(errors)}")
    print(f"Total after merge: {len(all_rows)}")
    print(f"Report: {report_path}")
    if errors:
        print("\nFirst 10 errors:")
        for e in errors[:10]:
            print(f"  - {e}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
