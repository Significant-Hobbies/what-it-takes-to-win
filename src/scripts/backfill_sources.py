#!/usr/bin/env python3
"""Backfill source_urls_pipe and primary_source_url for existing CSV records from JSONL files."""
from __future__ import annotations
import csv
import json
import pathlib

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

    # Build lookup from all JSONL files
    sources_by_id: dict[str, dict] = {}
    for jf in sorted(RESULTS_DIR.glob("batch_*.jsonl")):
        for line in jf.open(encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            pid = obj.get("person_id", "")
            name = obj.get("name", "")
            urls = obj.get("source_urls") or []
            primary = obj.get("primary_source_url", "")
            if urls or primary:
                sources_by_id[pid] = {"urls": urls, "primary": primary}
                sources_by_id[name.casefold()] = {"urls": urls, "primary": primary}

    updated = 0
    for row in rows:
        if row.get("source_urls_pipe", "").strip():
            continue  # Already has sources
        pid = row["person_id"]
        name_key = row["name"].casefold()
        info = sources_by_id.get(pid) or sources_by_id.get(name_key)
        if info:
            row["source_urls_pipe"] = " | ".join(info["urls"])
            if not row.get("primary_source_url", "").strip() and info["primary"]:
                row["primary_source_url"] = info["primary"]
            updated += 1

    # Write back
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})

    print(f"Backfilled source URLs for {updated} records")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
