#!/usr/bin/env python3
"""Build a filtered, balanced candidate queue from Pantheon 2025 for Success by 26.

Uses the actual Pantheon 2025 column names (l, bplace_country, wp_id, hpi, etc.).
Drops occupations that rarely produce verifiable age-26 milestones, caps per
occupation and per country for diversity, removes names already in the existing
dataset, and writes per-batch CSVs for subagent research.

Output is UNVERIFIED — discovery only, per the dataset methodology.
"""
from __future__ import annotations
import argparse
import bz2
import csv
import io
import math
import pathlib
import random
import urllib.request
from collections import defaultdict

PANTHEON_2025_URL = (
    "https://storage.googleapis.com/pantheon-public-data/"
    "person_2025_update.csv.bz2"
)

EXCLUDE_OCCUPATIONS = {
    "POLITICIAN", "NOBLEMAN", "RELIGIOUS FIGURE", "EXTREMIST", "COMPANION",
    "COACH", "JURIST", "DIPLOMAT", "HISTORIAN", "PHILOSOPHER", "ECONOMIST",
    "SOCILOGIST", "ANTHROPOLOGIST", "LINGUIST", "PSYCHOLOGIST", "PEDAGOGUE",
    "QUEEN", "KING", "EMPEROR", "EMPEROR", "SULTAN", "PRINCE", "PRINCESS",
}

PRIORITY_OCCUPATIONS = {
    "SOCCER PLAYER", "BASKETBALL PLAYER", "TENNIS PLAYER", "BOXER", "SWIMMER",
    "GYMNAST", "ATHLETE", "RACING DRIVER", "CHESS PLAYER", "FIGURE SKATER",
    "CYCLIST", "GOLFER", "MARTIAL ARTIST", "FENCER", "WRESTLER",
    "WEIGHTLIFTER", "ROWER", "SAILOR", "SKI JUMPER", "SKI RACER",
    "MUSICIAN", "SINGER", "COMPOSER", "CONDUCTOR", "DJ", "PRODUCER",
    "ACTOR", "ACTRESS", "DANCER", "MODEL", "PERFORMER",
    "WRITER", "POET", "NOVELIST", "JOURNALIST", "PLAYWRIGHT",
    "PAINTER", "SCULPTOR", "ARCHITECT", "DESIGNER", "PHOTOGRAPHER",
    "FILM DIRECTOR", "CINEMATOGRAPHER", "ANIMATOR", "CARTOONIST",
    "MATHEMATICIAN", "PHYSICIST", "CHEMIST", "BIOLOGIST", "ASTRONOMER",
    "COMPUTER SCIENTIST", "INVENTOR", "ENGINEER", "SCIENTIST",
    "BUSINESSPERSON", "ENTREPRENEUR",
    "MAGICIAN", "COMEDIAN",
}


def download(url: str, dest: pathlib.Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "success-by-26/0.1"})
    with urllib.request.urlopen(req, timeout=180) as resp, dest.open("wb") as out:
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            out.write(chunk)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--existing", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--batches-dir", required=True)
    parser.add_argument("--batch-size", type=int, default=12)
    parser.add_argument("--limit", type=int, default=400)
    parser.add_argument("--born-after", type=int, default=1940)
    parser.add_argument("--born-before", type=int, default=2008)
    parser.add_argument("--cap-per-occupation", type=int, default=30)
    parser.add_argument("--cap-per-country", type=int, default=40)
    parser.add_argument("--min-languages", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)

    existing_names: set[str] = set()
    with open(args.existing, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            existing_names.add(row["name"].casefold().strip())

    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        local = pathlib.Path(tmp) / "pantheon.csv.bz2"
        print(f"Downloading {PANTHEON_2025_URL}")
        download(PANTHEON_2025_URL, local)
        rows: list[dict] = []
        with bz2.open(local, "rt", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for raw in reader:
                try:
                    by = int(float(raw.get("birthyear") or ""))
                except (TypeError, ValueError):
                    continue
                if not (args.born_after <= by <= args.born_before):
                    continue
                name = (raw.get("name") or "").strip()
                if not name:
                    continue
                if name.casefold().strip() in existing_names:
                    continue
                occ = (raw.get("occupation") or "").upper().strip()
                if occ in EXCLUDE_OCCUPATIONS:
                    continue
                try:
                    langs = int(float(raw.get("l") or 0))
                except (TypeError, ValueError):
                    langs = 0
                if langs < args.min_languages:
                    continue
                try:
                    hpi = float(raw.get("hpi") or 0)
                except (TypeError, ValueError):
                    hpi = 0.0
                country = (raw.get("bplace_country") or "").strip()
                wp_id = raw.get("wp_id") or ""
                rows.append({
                    "name": name,
                    "birth_year": by,
                    "occupation": occ,
                    "country_name": country,
                    "gender": (raw.get("gender") or "").strip(),
                    "wikipedia_languages": langs,
                    "hpi": hpi,
                    "source_record_url": f"https://en.wikipedia.org/?curid={wp_id}" if wp_id else "",
                    "_priority": 1 if occ in PRIORITY_OCCUPATIONS else 0,
                })

    print(f"Raw eligible candidates after filters: {len(rows)}")

    # Cap per occupation
    by_occ: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_occ[r["occupation"]].append(r)
    capped: list[dict] = []
    for occ, group in by_occ.items():
        group.sort(key=lambda r: -r["hpi"])
        capped.extend(group[: args.cap_per_occupation])
    rows = capped

    # Cap per country
    by_country: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_country[r["country_name"] or "Unknown"].append(r)
    capped2: list[dict] = []
    for country, group in by_country.items():
        group.sort(key=lambda r: -r["hpi"])
        capped2.extend(group[: args.cap_per_country])
    rows = capped2

    # Sort: priority first, then HPI
    rows.sort(key=lambda r: (-r["_priority"], -r["hpi"]))
    selected = rows[: args.limit]

    out_fields = [
        "candidate_rank", "candidate_id", "name", "birth_year", "occupation",
        "country_name", "gender", "wikipedia_languages", "hpi",
        "source_record_url", "milestone_by_26_status", "research_status",
        "selection_note",
    ]
    out_path = pathlib.Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        for i, r in enumerate(selected, 1):
            slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in r["name"]).strip("-")
            slug = "-".join(p for p in slug.split("-") if p)
            writer.writerow({
                "candidate_rank": i,
                "candidate_id": f"candidate-{i:04d}-{slug}",
                "name": r["name"],
                "birth_year": r["birth_year"],
                "occupation": r["occupation"],
                "country_name": r["country_name"],
                "gender": r["gender"],
                "wikipedia_languages": r["wikipedia_languages"],
                "hpi": f"{r['hpi']:.2f}",
                "source_record_url": r["source_record_url"],
                "milestone_by_26_status": "unresearched",
                "research_status": "unverified_candidate",
                "selection_note": "Ranked for research discovery; HPI is not evidence of early success.",
            })

    # Write batches (shuffled for diversity)
    batches_dir = pathlib.Path(args.batches_dir)
    batches_dir.mkdir(parents=True, exist_ok=True)
    shuffled = selected[:]
    random.shuffle(shuffled)
    n_batches = (len(shuffled) + args.batch_size - 1) // args.batch_size
    for b in range(n_batches):
        chunk = shuffled[b * args.batch_size : (b + 1) * args.batch_size]
        batch_path = batches_dir / f"batch_{b+1:02d}.csv"
        with batch_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=out_fields)
            writer.writeheader()
            for r in chunk:
                slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in r["name"]).strip("-")
                slug = "-".join(p for p in slug.split("-") if p)
                rank = selected.index(r) + 1
                writer.writerow({
                    "candidate_rank": rank,
                    "candidate_id": f"candidate-{rank:04d}-{slug}",
                    "name": r["name"],
                    "birth_year": r["birth_year"],
                    "occupation": r["occupation"],
                    "country_name": r["country_name"],
                    "gender": r["gender"],
                    "wikipedia_languages": r["wikipedia_languages"],
                    "hpi": f"{r['hpi']:.2f}",
                    "source_record_url": r["source_record_url"],
                    "milestone_by_26_status": "unresearched",
                    "research_status": "unverified_candidate",
                    "selection_note": "Ranked for research discovery; HPI is not evidence of early success.",
                })

    from collections import Counter
    print(f"Selected {len(selected)} candidates across {n_batches} batches")
    print("Top occupations:")
    for k, v in Counter(r["occupation"] for r in selected).most_common(15):
        print(f"  {v:3d}  {k}")
    print("Top countries:")
    for k, v in Counter(r["country_name"] for r in selected).most_common(15):
        print(f"  {v:3d}  {k}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
