#!/usr/bin/env python3
"""Build a tech-focused candidate queue from Pantheon 2025 for Success by 26.

Prioritizes tech occupations: computer scientists, inventors, engineers,
businesspeople, entrepreneurs, mathematicians, physicists, scientists.
Uses relaxed language thresholds to capture more tech figures.
"""
from __future__ import annotations
import argparse, bz2, csv, io, pathlib, random, urllib.request
from collections import defaultdict, Counter

PANTHEON_2025_URL = (
    "https://storage.googleapis.com/pantheon-public-data/"
    "person_2025_update.csv.bz2"
)

TECH_OCCUPATIONS = {
    "COMPUTER SCIENTIST", "INVENTOR", "ENGINEER", "BUSINESSPERSON",
    "ENTREPRENEUR", "MATHEMATICIAN", "PHYSICIST", "SCIENTIST",
    "CHEMIST", "BIOLOGIST", "ASTRONOMER",
}

# Exclude occupations already well-represented (athletes, musicians, actors)
NON_TECH_EXCLUDE = {
    "SOCCER PLAYER", "BASKETBALL PLAYER", "TENNIS PLAYER", "BOXER", "SWIMMER",
    "GYMNAST", "ATHLETE", "RACING DRIVER", "CHESS PLAYER", "FIGURE SKATER",
    "CYCLIST", "GOLFER", "MARTIAL ARTIST", "FENCER", "WRESTLER",
    "WEIGHTLIFTER", "ROWER", "SAILOR", "SKI JUMPER", "SKI RACER",
    "MUSICIAN", "SINGER", "COMPOSER", "CONDUCTOR", "DJ", "PRODUCER",
    "ACTOR", "ACTRESS", "DANCER", "MODEL", "PERFORMER",
    "PAINTER", "SCULPTOR", "DESIGNER", "PHOTOGRAPHER",
    "POLITICIAN", "NOBLEMAN", "RELIGIOUS FIGURE", "EXTREMIST", "COMPANION",
    "COACH", "JURIST", "DIPLOMAT", "HISTORIAN", "PHILOSOPHER", "ECONOMIST",
    "QUEEN", "KING", "EMPEROR", "SULTAN", "PRINCE", "PRINCESS",
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
    parser.add_argument("--limit", type=int, default=150)
    parser.add_argument("--born-after", type=int, default=1930)
    parser.add_argument("--born-before", type=int, default=2008)
    parser.add_argument("--cap-per-occupation", type=int, default=60)
    parser.add_argument("--cap-per-country", type=int, default=50)
    parser.add_argument("--min-languages", type=int, default=5)
    parser.add_argument("--seed", type=int, default=77)
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
        print("Decompressing...")
        with bz2.open(local, "rt", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows: list[dict] = []
            for raw in reader:
                try:
                    by = int(raw.get("birthyear") or raw.get("birth_year") or 0)
                except (TypeError, ValueError):
                    continue
                if not (args.born_after <= by <= args.born_before):
                    continue
                name = (raw.get("name") or "").strip()
                if not name or name.casefold().strip() in existing_names:
                    continue
                occ = (raw.get("occupation") or "").upper().strip()
                # Only include tech occupations
                if occ not in TECH_OCCUPATIONS:
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
                })

    print(f"Tech candidates after filters: {len(rows)}")

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

    # Sort by HPI (higher notability first)
    rows.sort(key=lambda r: -r["hpi"])
    selected = rows[: args.limit]

    print(f"Selected: {len(selected)}")
    print("Top occupations:")
    for k, v in Counter(r["occupation"] for r in selected).most_common(15):
        print(f"  {v:4d}  {k}")
    print("Top countries:")
    for k, v in Counter(r["country_name"] for r in selected).most_common(15):
        print(f"  {v:4d}  {k}")

    # Write full CSV
    output = pathlib.Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "candidate_rank", "candidate_id", "name", "birth_year", "occupation",
        "country_name", "gender", "wikipedia_languages", "hpi",
        "source_record_url", "milestone_by_26_status", "research_status",
        "selection_note",
    ]
    with output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i, r in enumerate(selected, 1):
            cid = f"candidate-{i:04d}-{r['name'].lower().replace(' ', '-').replace('--', '-')}"
            writer.writerow({
                "candidate_rank": i,
                "candidate_id": cid,
                "name": r["name"],
                "birth_year": r["birth_year"],
                "occupation": r["occupation"],
                "country_name": r["country_name"],
                "gender": r["gender"],
                "wikipedia_languages": r["wikipedia_languages"],
                "hpi": r["hpi"],
                "source_record_url": r["source_record_url"],
                "milestone_by_26_status": "unresearched",
                "research_status": "unverified_candidate",
                "selection_note": "Tech-focused queue; HPI is not evidence of early success.",
            })

    # Write batches
    batches_dir = pathlib.Path(args.batches_dir)
    batches_dir.mkdir(parents=True, exist_ok=True)
    shuffled = selected[:]
    random.shuffle(shuffled)
    n_batches = (len(shuffled) + args.batch_size - 1) // args.batch_size
    for b in range(n_batches):
        chunk = shuffled[b * args.batch_size : (b + 1) * args.batch_size]
        bp = batches_dir / f"batch_{b + 1:02d}.csv"
        with bp.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for i, r in enumerate(chunk, 1):
                cid = f"candidate-{b + 1:02d}-{i:02d}-{r['name'].lower().replace(' ', '-')}"
                writer.writerow({
                    "candidate_rank": i,
                    "candidate_id": cid,
                    "name": r["name"],
                    "birth_year": r["birth_year"],
                    "occupation": r["occupation"],
                    "country_name": r["country_name"],
                    "gender": r["gender"],
                    "wikipedia_languages": r["wikipedia_languages"],
                    "hpi": r["hpi"],
                    "source_record_url": r["source_record_url"],
                    "milestone_by_26_status": "unresearched",
                    "research_status": "unverified_candidate",
                    "selection_note": "Tech-focused queue; HPI is not evidence of early success.",
                })
    print(f"Wrote {n_batches} batches to {batches_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
