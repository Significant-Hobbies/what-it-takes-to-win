#!/usr/bin/env python3
"""Rebalance published people.csv so Founders / operators hit a target share.

Keeps ALL founders. Fills remaining slots preferring researchers, then
highest-leverage creators/athletes. Archives full dataset before overwrite.
"""
from __future__ import annotations
import argparse, csv, json, pathlib, random
from collections import defaultdict
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[2]


def num(v, default=0):
    try:
        return float(v) if v not in (None, "") else default
    except ValueError:
        return default


def score_row(r: dict) -> float:
    # Prefer higher leverage + better tier (tier 1 is best → invert)
    lev = num(r.get("total_leverage_score"))
    tier = num(r.get("success_tier"), 4)
    conf = {"High": 2, "Medium": 1, "Low": 0}.get(r.get("leverage_evidence_confidence") or "", 0)
    return lev * 10 + (5 - tier) * 3 + conf


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", type=float, default=0.40)
    ap.add_argument("--input", default="src/data/people.csv")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    random.seed(args.seed)

    inp = ROOT / args.input
    with inp.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fields = list(rows[0].keys())

    by_cohort = defaultdict(list)
    for r in rows:
        by_cohort[r.get("cohort_group") or "Other"].append(r)

    founders = list(by_cohort.get("Founders / operators", []))
    f = len(founders)
    if f == 0:
        raise SystemExit("no founders")

    # total T such that f/T = target → T = f/target
    target_total = int(round(f / args.target))
    # ensure at least all founders
    target_total = max(target_total, f)
    slots = target_total - f

    # Keep researchers first (engineers adjacent), sorted by score
    researchers = sorted(by_cohort.get("Researchers / independent engineers", []), key=score_row, reverse=True)
    keep_res = researchers[: min(len(researchers), slots)]
    slots_left = slots - len(keep_res)

    # Remaining from creators + athletes + other, by score
    pool = []
    for c in ("Creators / artists", "Athletes", "Other / military"):
        pool.extend(by_cohort.get(c, []))
    pool.sort(key=score_row, reverse=True)
    # mild randomness among similar scores for diversity
    keep_rest = pool[:slots_left]

    selected = founders + keep_res + keep_rest
    # Sort for stable output: founders first, then by name
    selected.sort(key=lambda r: (0 if r["cohort_group"] == "Founders / operators" else 1, r.get("name") or ""))

    archive_dir = ROOT / "data" / "archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    archive_path = archive_dir / f"people_full_{date.today().isoformat()}.csv"
    with archive_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    out_csv = ROOT / "src" / "data" / "people.csv"
    with out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(selected)

    # people.jsonl
    jl = ROOT / "src" / "data" / "people.jsonl"
    with jl.open("w", encoding="utf-8") as f:
        for r in selected:
            obj = dict(r)
            # light type coercion for known numeric fields
            for k, v in list(obj.items()):
                if k.endswith("_score") or k in ("age_at_milestone", "success_tier", "source_count", "current_position_year",
                    "inherited_access_stack_count", "exceptional_inherited_access_count", "all_documented_early_condition_count",
                    "total_leverage_score"):
                    if v != "" and v is not None:
                        try:
                            obj[k] = int(float(v))
                        except ValueError:
                            pass
            urls = [u.strip() for u in (r.get("source_urls_pipe") or "").split("|") if u.strip()]
            obj["source_urls"] = urls
            tags = [t.strip() for t in (r.get("primary_early_advantage_tags") or "").split(",") if t.strip()]
            obj["primary_early_advantage_tags_list"] = tags
            tj = r.get("trajectory_json") or ""
            try:
                obj["trajectory"] = json.loads(tj) if tj else []
            except json.JSONDecodeError:
                obj["trajectory"] = []
            il = (r.get("is_living") or "").lower()
            obj["is_living"] = True if il == "true" else False if il == "false" else None
            f.write(json.dumps(obj, ensure_ascii=False) + "\n")

    from collections import Counter
    c = Counter(r["cohort_group"] for r in selected)
    n = len(selected)
    report = {
        "archive": str(archive_path.relative_to(ROOT)),
        "full_count": len(rows),
        "published_count": n,
        "target_founder_share": args.target,
        "actual_founder_share": c.get("Founders / operators", 0) / n,
        "cohorts": dict(c),
        "kept_all_founders": f,
        "kept_researchers": len(keep_res),
        "kept_other": len(keep_rest),
    }
    report_path = archive_dir / f"rebalance_report_{date.today().isoformat()}.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    print(f"Founders: {c.get('Founders / operators',0)}/{n} = {100*c.get('Founders / operators',0)/n:.1f}%")
    print(f"Archive: {archive_path}")
    print(f"Report: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
