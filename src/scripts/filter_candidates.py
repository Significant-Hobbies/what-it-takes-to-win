#!/usr/bin/env python3
"""Filter the Pantheon candidate queue to prioritize people likely to have
had a material milestone by age 26, and produce balanced batches for subagent
research.

Heuristics:
- Drop occupations that rarely produce age-26 milestones (politicians, nobles,
  religious figures, extremists, companions, coaches, jurists).
- Prioritize occupations with historically early peaks: athletes, musicians,
  singers, actors, dancers, writers, poets, painters, sculptors, architects,
  mathematicians, physicists, chemists, biologists, computer scientists,
  inventors, businesspeople, designers, photographers, directors, animators,
  models, magicians, chess players, racing drivers, gymnasts, swimmers, etc.
- Cap per-occupation to avoid domination by any single field.
- Remove names already in the existing 112-person dataset.
- Output N batches of ~12 candidates each for subagent research.
"""
from __future__ import annotations
import argparse
import csv
import pathlib
import random
from collections import defaultdict, deque

# Occupations to exclude entirely (rarely have notable age-26 milestones, or
# milestones are hard to verify independently).
EXCLUDE_OCCUPATIONS = {
    "POLITICIAN", "NOBLEMAN", "RELIGIOUS FIGURE", "EXTREMIST", "COMPANION",
    "COACH", "JURIST", "DIPLOMAT", "HISTORIAN", "PHILOSOPHER", "ECONOMIST",
    "SOCILOGIST", "ANTHROPOLOGIST", "LINGUIST", "PSYCHOLOGIST", "PEDAGOGUE",
}

# Occupations to prioritize (historically early peaks or clear early milestones).
PRIORITY_OCCUPATIONS = {
    "SOCCER PLAYER", "BASKETBALL PLAYER", "TENNIS PLAYER", "BOXER", "SWIMMER",
    "GYMNAST", "ATHLETE", "RACING DRIVER", "CHESS PLAYER", "FIGURE SKATER",
    "SKI JUMPER", "SKI RACER", "CYCLIST", "GOLFER", "MARTIAL ARTIST",
    "FENCER", "WRESTLER", "WEIGHTLIFTER", "ROWER", "SAILOR",
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

CAP_PER_OCCUPATION = 25  # max candidates from any single occupation


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", required=True, help="candidates CSV from build_candidate_queue.py")
    parser.add_argument("--existing", required=True, help="existing people CSV (people_112.csv)")
    parser.add_argument("--output", required=True, help="output filtered CSV")
    parser.add_argument("--batches-dir", required=True, help="directory for per-batch CSVs")
    parser.add_argument("--batch-size", type=int, default=12)
    parser.add_argument("--limit", type=int, default=400)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)

    existing_names: set[str] = set()
    with open(args.existing, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            existing_names.add(row["name"].casefold().strip())

    candidates: list[dict] = []
    with open(args.candidates, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row["name"].casefold().strip()
            if name in existing_names:
                continue
            occ = row["occupation"].upper().strip()
            if occ in EXCLUDE_OCCUPATIONS:
                continue
            # Skip candidates with no Wikipedia languages (very low signal)
            try:
                if int(row.get("wikipedia_languages", 0) or 0) < 5:
                    continue
            except ValueError:
                pass
            row["_priority"] = 1 if occ in PRIORITY_OCCUPATIONS else 0
            row["_occupation_upper"] = occ
            candidates.append(row)

    # Cap per occupation
    by_occ: dict[str, list[dict]] = defaultdict(list)
    for c in candidates:
        by_occ[c["_occupation_upper"]].append(c)
    capped: list[dict] = []
    for occ, rows in by_occ.items():
        rows.sort(key=lambda r: -(r.get("hpi") and float(r["hpi"]) or 0))
        capped.extend(rows[:CAP_PER_OCCUPATION])
    candidates = capped

    # Sort: priority first, then by HPI (a fame measure — useful for sourcing)
    candidates.sort(key=lambda r: (-r["_priority"], -(float(r.get("hpi") or 0))))

    selected = candidates[: args.limit]

    out_fields = [
        "candidate_rank", "candidate_id", "name", "birth_year", "occupation",
        "domain", "industry", "country_name", "gender", "wikipedia_languages",
        "hpi", "pageviews", "source_dataset", "source_record_url",
        "milestone_by_26_status", "research_status", "selection_note",
    ]
    out_path = pathlib.Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_fields)
        writer.writeheader()
        for i, row in enumerate(selected, 1):
            writer.writerow({k: row.get(k, "") for k in out_fields})

    # Write batches
    batches_dir = pathlib.Path(args.batches_dir)
    batches_dir.mkdir(parents=True, exist_ok=True)
    # Shuffle for diversity within batches, then slice
    shuffled = selected[:]
    random.shuffle(shuffled)
    n_batches = (len(shuffled) + args.batch_size - 1) // args.batch_size
    for b in range(n_batches):
        chunk = shuffled[b * args.batch_size : (b + 1) * args.batch_size]
        batch_path = batches_dir / f"batch_{b+1:02d}.csv"
        with batch_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=out_fields)
            writer.writeheader()
            for row in chunk:
                writer.writerow({k: row.get(k, "") for k in out_fields})

    print(f"Filtered {len(selected)} candidates from {len(candidates)} post-cap pool")
    print(f"Wrote {n_batches} batches of ~{args.batch_size} to {batches_dir}")
    from collections import Counter
    occ_counts = Counter(r["_occupation_upper"] for r in selected)
    print("Top occupations in filtered set:")
    for k, v in occ_counts.most_common(15):
        print(f"  {v:3d}  {k}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
