#!/usr/bin/env python3
"""Merge trajectory data from deepen_trajectory batch files into existing people.csv.

Updates existing records' trajectory_json, starting_point, current_position,
current_position_year, and is_living fields. Does NOT add new people.
"""
from __future__ import annotations
import csv
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
RESULTS_DIR = ROOT / "data" / "research" / "results"
CSV_PATH = ROOT / "src" / "data" / "people.csv"

def main() -> int:
    # Load existing CSV
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    by_id = {r["person_id"]: r for r in rows}
    by_name = {r["name"].casefold(): r for r in rows}

    updated = 0
    not_found = 0
    errors = 0

    # Process all deepen_trajectory files
    for jf in sorted(RESULTS_DIR.glob("batch_deepen_trajectory_*.jsonl")):
        for lineno, line in enumerate(jf.open(encoding="utf-8"), 1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"  ERROR {jf.name}:{lineno}: {e}")
                errors += 1
                continue

            pid = obj.get("person_id", "")
            name = obj.get("name", "")
            row = by_id.get(pid) or by_name.get(name.casefold())

            if not row:
                not_found += 1
                print(f"  NOT FOUND: {name} ({pid})")
                continue

            # Update trajectory
            traj = obj.get("trajectory")
            if traj and isinstance(traj, list) and len(traj) >= 3:
                row["trajectory_json"] = json.dumps(traj, ensure_ascii=False)

            # Update other fields if present
            for field in ["starting_point", "current_position", "current_position_year"]:
                val = obj.get(field)
                if val is not None:
                    row[field] = str(val)

            il = obj.get("is_living")
            if il is True:
                row["is_living"] = "true"
            elif il is False:
                row["is_living"] = "false"

            updated += 1

    # Write back
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})

    print(f"Updated: {updated}")
    print(f"Not found: {not_found}")
    print(f"Errors: {errors}")
    print(f"Total rows: {len(rows)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
