#!/usr/bin/env python3
"""
Merge expansion research batches into people.csv, deduplicating against existing
people and within the new batches themselves. Also applies deepen updates.
"""
import json, csv, os, sys, re

RESULTS_DIR = 'data/research/results'
CSV_PATH = 'src/data/people.csv'

def load_existing_names():
    names = set()
    with open(CSV_PATH) as f:
        reader = csv.DictReader(f)
        for row in reader:
            names.add(row.get('name', '').lower().strip())
    return names

def load_expansion_batches():
    """Load all batch_exp_*.jsonl files, dedup within batches."""
    people = {}
    skipped_dups = 0
    
    for f in sorted(os.listdir(RESULTS_DIR)):
        if not f.startswith('batch_exp_') or not f.endswith('.jsonl'):
            continue
        path = os.path.join(RESULTS_DIR, f)
        if os.path.getsize(path) == 0:
            continue
        
        with open(path) as fh:
            for line in fh:
                line = line.strip()
                if not line: continue
                try:
                    p = json.loads(line)
                except:
                    continue
                
                if p.get('eligibility_status') not in {'age_30_eligible', 'age_26_eligible'}:
                    continue
                
                name = p.get('name', '').strip()
                key = name.lower()
                
                if key in people:
                    skipped_dups += 1
                    # Keep the one with more data (longer evidence_summary)
                    if len(p.get('evidence_summary', '')) > len(people[key].get('evidence_summary', '')):
                        people[key] = p
                    continue
                
                people[key] = p
    
    return list(people.values()), skipped_dups

def load_deepen_batches():
    """Load batch_deepen_*.jsonl files as updates keyed by person_id."""
    updates = {}
    
    for f in sorted(os.listdir(RESULTS_DIR)):
        if not f.startswith('batch_deepen_') or not f.endswith('.jsonl'):
            continue
        path = os.path.join(RESULTS_DIR, f)
        if os.path.getsize(path) == 0:
            continue
        
        with open(path) as fh:
            for line in fh:
                line = line.strip()
                if not line: continue
                try:
                    p = json.loads(line)
                except:
                    continue
                pid = p.get('person_id', '')
                if pid:
                    updates[pid] = p
    
    return updates

def person_to_csv_row(p):
    """Convert a person JSON object to a CSV row matching people.csv schema."""
    row = {}
    
    # Copy all fields that exist in the CSV header
    with open(CSV_PATH) as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
    
    for h in headers:
        if h in p:
            val = p[h]
            if h == 'trajectory_json':
                # Serialize trajectory array as JSON string
                if isinstance(val, list):
                    row[h] = json.dumps(val, ensure_ascii=False)
                else:
                    row[h] = val or ''
            elif h == 'source_urls_pipe':
                if isinstance(p.get('source_urls'), list):
                    row[h] = '|'.join(p['source_urls'])
                else:
                    row[h] = val or ''
            elif h == 'primary_early_advantage_tags':
                if isinstance(p.get('primary_early_advantage_tags_list'), list):
                    row[h] = ','.join(p['primary_early_advantage_tags_list'])
                else:
                    row[h] = val or ''
            elif isinstance(val, bool):
                row[h] = 'true' if val else 'false'
            elif val is None:
                row[h] = ''
            else:
                row[h] = str(val)
        else:
            row[h] = ''
    
    # Generate person_id if missing
    if not row.get('person_id'):
        name = p.get('name', '')
        pid = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        row['person_id'] = pid
    
    return row

def main():
    existing_names = load_existing_names()
    print(f"Existing people in CSV: {len(existing_names)}")
    
    new_people, skipped_dups = load_expansion_batches()
    print(f"New eligible people (after intra-batch dedup): {len(new_people)} (skipped {skipped_dups} intra-batch dups)")
    
    # Filter out people already in the CSV
    truly_new = []
    already_exists = 0
    for p in new_people:
        name_key = p.get('name', '').lower().strip()
        if name_key in existing_names:
            already_exists += 1
        else:
            truly_new.append(p)
    
    print(f"Already in CSV: {already_exists}")
    print(f"Truly new people to add: {len(truly_new)}")
    
    # Load deepen updates
    deepen_updates = load_deepen_batches()
    print(f"Deepen updates: {len(deepen_updates)}")
    
    # Read existing CSV
    with open(CSV_PATH) as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        existing_rows = list(reader)
    
    print(f"Existing CSV rows: {len(existing_rows)}")
    
    # Apply deepen updates to existing rows
    updated_count = 0
    for row in existing_rows:
        pid = row.get('person_id', '')
        if pid in deepen_updates:
            update = deepen_updates[pid]
            row_updated = False
            for h in headers:
                if h not in update:
                    continue
                val = update[h]
                if h == 'trajectory_json':
                    # For trajectory, check if the update has a list with entries
                    traj = val
                    if isinstance(traj, str):
                        try:
                            traj = json.loads(traj) if traj else []
                        except:
                            traj = []
                    if isinstance(traj, list) and len(traj) > 0:
                        old_traj_str = row.get(h, '').strip()
                        try:
                            old_traj = json.loads(old_traj_str) if old_traj_str else []
                        except:
                            old_traj = []
                        if len(traj) > len(old_traj):
                            row[h] = json.dumps(traj, ensure_ascii=False)
                            row_updated = True
                elif h == 'source_urls_pipe':
                    urls = update.get('source_urls', val if isinstance(val, list) else [])
                    if isinstance(urls, list) and len(urls) > 0:
                        old_urls = row.get(h, '').strip()
                        if len('|'.join(urls)) > len(old_urls):
                            row[h] = '|'.join(urls)
                            row_updated = True
                elif h == 'primary_early_advantage_tags':
                    tags = update.get('primary_early_advantage_tags_list', val if isinstance(val, list) else [])
                    if isinstance(tags, list) and len(tags) > 0:
                        row[h] = ','.join(tags)
                        row_updated = True
                elif val is not None and str(val).strip():
                    old_val = row.get(h, '').strip()
                    new_val = str(val).strip()
                    if h.endswith('_score') or h in ('age_at_milestone', 'success_tier', 'birth_year', 'current_position_year'):
                        # For numeric fields, update if old is empty/0 and new is non-zero
                        try:
                            old_num = int(float(old_val)) if old_val else 0
                            new_num = int(float(new_val)) if new_val else 0
                            if new_num > old_num:
                                row[h] = new_val
                                row_updated = True
                        except:
                            pass
                    elif h in ('is_living',):
                        row[h] = new_val
                        row_updated = True
                    elif len(new_val) > len(old_val):
                        row[h] = new_val
                        row_updated = True
            if row_updated:
                updated_count += 1
    
    print(f"Updated {updated_count} existing rows with trajectory data")
    
    # Add new people
    new_rows = [person_to_csv_row(p) for p in truly_new]
    
    # Write merged CSV
    all_rows = existing_rows + new_rows
    with open(CSV_PATH, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(all_rows)
    
    print(f"Wrote {len(all_rows)} total rows to {CSV_PATH} ({len(new_rows)} new + {len(existing_rows)} existing)")

if __name__ == '__main__':
    main()
