#!/usr/bin/env python3
"""Restore provenance on the founder-expansion records.

The records added by the founder research pass (annotation_status
``founder_research_beta``) were written with ``data_version`` ``0.1.0-beta`` —
the label belonging to the original 104 curated records. That made
``data_version`` useless as a provenance field: the newest quarter of the
dataset claimed to be the oldest.

This stamps those records with the release they actually shipped in
(``2026-08-19-founder-expansion``, commit 8d29fb8) so the cohort can be
isolated for auditing.

The rewrite is byte-surgical: it replaces only the ``data_version`` field spans
that need changing and leaves every other byte — quoting style, CRLF line
endings, field order — exactly as found, so the diff shows the stamped records
and nothing else. Idempotent: safe to re-run.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PEOPLE_CSV = ROOT / "src" / "data" / "people.csv"

ANNOTATION = "founder_research_beta"
STALE_VERSION = "0.1.0-beta"
TARGET_VERSION = "2026-08-19-founder-expansion"


def scan_records(text):
    """Yield records as lists of (value, start, end) field spans.

    Implements the same quote-aware pass as ``build_dataset.mjs`` so this script
    and the site build agree on where one record ends and the next begins.
    """
    record = []
    start = 0
    value = []
    in_quotes = False
    index = 0
    length = len(text)
    while index < length:
        char = text[index]
        if in_quotes:
            if char == '"':
                if index + 1 < length and text[index + 1] == '"':
                    value.append('"')
                    index += 2
                    continue
                in_quotes = False
            else:
                value.append(char)
        elif char == '"':
            in_quotes = True
        elif char == ",":
            record.append(("".join(value), start, index))
            value = []
            start = index + 1
        elif char == "\n":
            record.append(("".join(value), start, index))
            yield record
            record = []
            value = []
            start = index + 1
        elif char != "\r":
            value.append(char)
        index += 1
    if value or record:
        record.append(("".join(value), start, length))
        yield record


def main() -> int:
    with PEOPLE_CSV.open("r", encoding="utf-8", newline="") as handle:
        text = handle.read()
    records = list(scan_records(text))
    if not records:
        print("people.csv is empty", file=sys.stderr)
        return 1

    header = [field[0] for field in records[0]]
    for column in ("annotation_status", "data_version"):
        if column not in header:
            print(f"people.csv lacks a {column} column", file=sys.stderr)
            return 1
    annotation_index = header.index("annotation_status")
    version_index = header.index("data_version")

    # Collect edits first, then apply back-to-front so earlier spans stay valid.
    edits = []
    for record in records[1:]:
        if len(record) != len(header):
            continue
        if record[annotation_index][0] != ANNOTATION:
            continue
        value, start, end = record[version_index]
        if value != STALE_VERSION:
            continue
        edits.append((start, end))

    if not edits:
        print(f"no rows to stamp; {TARGET_VERSION} already applied")
        return 0

    updated = text
    for start, end in reversed(edits):
        updated = updated[:start] + TARGET_VERSION + updated[end:]

    with PEOPLE_CSV.open("w", encoding="utf-8", newline="") as handle:
        handle.write(updated)
    print(f"stamped {len(edits)} rows {STALE_VERSION} -> {TARGET_VERSION}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
