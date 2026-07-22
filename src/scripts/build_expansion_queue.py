#!/usr/bin/env python3
"""
Build a large candidate queue from Wikipedia categories focused on young achievers.
Targets people likely to have hit milestones by age 26, born after 1950.
"""
import json, csv, os, sys, time, re
import urllib.request, urllib.parse

WIKI_API = "https://en.wikipedia.org/w/api.php"

def wiki_request(params):
    params['format'] = 'json'
    params['action'] = 'query'
    url = WIKI_API + '?' + urllib.parse.urlencode(params)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'TrajectoryResearch/1.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode())
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
            else:
                print(f"  ERROR: {e}", file=sys.stderr)
                return None

def get_category_members(cat, depth=1, max_pages=500):
    """Get pages from a category (and subcategories up to depth)."""
    pages = []
    seen_cats = set()
    cats_to_process = [(cat, 0)]
    
    while cats_to_process and len(pages) < max_pages:
        current_cat, current_depth = cats_to_process.pop(0)
        if current_cat in seen_cats:
            continue
        seen_cats.add(current_cat)
        
        params = {
            'list': 'categorymembers',
            'cmtitle': f'Category:{current_cat}',
            'cmlimit': '200',
            'cmtype': 'page|subcat',
        }
        
        while True:
            data = wiki_request(params)
            if not data or 'query' not in data:
                break
            
            for member in data['query']['categorymembers']:
                ns = member.get('ns', 0)
                title = member['title']
                if ns == 0:  # Main namespace = page
                    if not any(x in title for x in ['List of', 'Category:', 'Template:', 'Wikipedia:', 'Help:', 'Portal:', 'Disambiguation']):
                        pages.append(title)
                elif ns == 14 and current_depth < depth:  # Category namespace
                    subcat = title.replace('Category:', '')
                    cats_to_process.append((subcat, current_depth + 1))
            
            if 'continue' in data:
                params['cmcontinue'] = data['continue']['cmcontinue']
            else:
                break
    
    return pages

# Categories likely to contain young achievers born after 1950
TARGET_CATEGORIES = [
    # Young entrepreneurs and founders
    "American technology company founders",
    "American Internet entrepreneurs",
    "British technology company founders",
    "Indian technology company founders",
    "Israeli technology company founders",
    "Canadian technology company founders",
    "German technology company founders",
    "French technology company founders",
    "Chinese technology company founders",
    "Brazilian technology company founders",
    
    # Forbes 30 Under 30
    "Forbes 30 Under 30 recipients",
    
    # Thiel Fellows (specifically young achievers)
    "Thiel Fellowship recipients",
    
    # Young musicians
    "American child singers",
    "British child singers",
    "American pop singers",
    "British pop singers",
    "American singer-songwriters",
    "British singer-songwriters",
    "Canadian singer-songwriters",
    "Australian singer-songwriters",
    "Irish singer-songwriters",
    
    # Young actors
    "American child actors",
    "British child actors",
    "American film actors",
    "American television actors",
    "British film actors",
    "British television actors",
    "Canadian film actors",
    "Australian film actors",
    
    # Young athletes
    "Olympic medalists in athletics",
    "Olympic swimmers",
    "Olympic gymnasts",
    "Olympic divers",
    "Olympic figure skaters",
    "Olympic alpine skiers",
    "Olympic tennis players",
    "Olympic table tennis players",
    "Olympic boxers",
    "Olympic judoka",
    "Olympic wrestlers",
    "Olympic fencers",
    "Olympic archers",
    "Olympic shooters",
    "Olympic cyclists",
    "Olympic rowers",
    "Olympic sailors",
    "Olympic equestrians",
    "Olympic weightlifters",
    "Olympic badminton players",
    
    # Chess prodigies
    "Chess grandmasters",
    "Chess prodigies",
    
    # Esports
    "Esports players",
    
    # YouTubers and content creators
    "American YouTubers",
    "British YouTubers",
    "Canadian YouTubers",
    "Australian YouTubers",
    "Indian YouTubers",
    
    # Young scientists
    "American computer scientists",
    "British computer scientists",
    "American mathematicians",
    "British mathematicians",
    
    # Fashion/design
    "American fashion designers",
    "British fashion designers",
    
    # Writers
    "American novelists",
    "British novelists",
    
    # Artists
    "American contemporary artists",
    "British contemporary artists",
    "Japanese contemporary artists",
    
    # Racing
    "Formula One drivers",
    "Grand Prix motorcycle riders",
    "Rally drivers",
    
    # Combat sports
    "Mixed martial artists",
    "Professional boxers",
    "Professional wrestlers",
    
    # Soccer
    "Association football forwards",
    "Association football midfielders",
    "Association football defenders",
    
    # Basketball
    "National Basketball Association players",
    
    # Hockey
    "National Hockey League players",
]

def main():
    # Load existing people to avoid duplicates
    existing = set()
    try:
        with open('src/data/people.json') as f:
            for p in json.load(f):
                existing.add(p.get('name', '').lower().strip())
    except:
        pass
    
    # Also load from CSV
    try:
        with open('src/data/people.csv') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing.add(row.get('name', '').lower().strip())
    except:
        pass
    
    print(f"Loaded {len(existing)} existing people for dedup")
    
    all_candidates = []
    seen = set()
    
    for cat in TARGET_CATEGORIES:
        print(f"Fetching: {cat}...")
        pages = get_category_members(cat, depth=1, max_pages=300)
        print(f"  Got {len(pages)} pages")
        
        for title in pages:
            key = title.lower().strip()
            if key in seen or key in existing:
                continue
            seen.add(key)
            all_candidates.append({
                'name': title,
                'source_category': cat,
                'wikipedia_url': f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}",
            })
        
        time.sleep(0.5)  # Rate limit
    
    print(f"\nTotal unique new candidates: {len(all_candidates)}")
    
    # Write to CSV
    out_path = 'data/research/expansion_candidates.csv'
    with open(out_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'source_category', 'wikipedia_url'])
        writer.writeheader()
        writer.writerows(all_candidates)
    
    print(f"Wrote {len(all_candidates)} candidates to {out_path}")
    
    # Create batches of 12
    batch_dir = 'data/research/batches_exp'
    os.makedirs(batch_dir, exist_ok=True)
    
    batch_size = 12
    num_batches = (len(all_candidates) + batch_size - 1) // batch_size
    
    for i in range(num_batches):
        start = i * batch_size
        end = min(start + batch_size, len(all_candidates))
        batch = all_candidates[start:end]
        
        batch_path = os.path.join(batch_dir, f'batch_exp_{i+1:03d}.csv')
        with open(batch_path, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=['name', 'source_category', 'wikipedia_url'])
            writer.writeheader()
            writer.writerows(batch)
    
    print(f"Created {num_batches} batches in {batch_dir}/")

if __name__ == '__main__':
    main()
