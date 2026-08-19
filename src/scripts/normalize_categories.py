#!/usr/bin/env python3
"""Normalize all category labels to a clean, consistent taxonomy."""
import csv, re, sys
from collections import Counter

CSV_PATH = 'src/data/people.csv'

# Canonical taxonomy with keyword-based matching (order matters — first match wins)
RULES = [
    # --- Athletes ---
    ('Soccer player', r'soccer|footballer|football player'),
    ('Basketball player', r'basketball'),
    ('Tennis player', r'tennis player|tennis\b'),
    ('Table tennis player', r'table tennis|tabletennis'),
    ('Gymnast', r'gymnast|artistic gymnast'),
    ('Swimmer', r'swimmer|swimming'),
    ('Racing driver', r'racing driver|formula one|formula 1|f1 racing|motorsport|rally|motorcycle racer|motorcycle road racer'),
    ('Ice hockey player', r'ice hockey|hockey player|hockey\b'),
    ('Handball player', r'handball'),
    ('Combat sports athlete', r'boxer|boxing|kickboxer|martial artist|mma fighter|mixed martial|wrestler|wrestling|judo|judoka|taekwondo|karate'),
    ('Cyclist', r'cyclist|cycling|road cyclist'),
    ('Track and field athlete', r'track and field|sprint|athletics|\bathlete\b'),
    ('Chess player', r'chess'),
    ('Fencer', r'fencer|fencing'),
    ('Volleyball player', r'volleyball'),
    ('Badminton player', r'badminton'),
    ('Baseball player', r'baseball'),
    ('Snooker/Pool player', r'snooker|pool player|billiards'),
    ('Winter sports athlete', r'skier|skiing|snowboard|snowboarding|alpine skier'),
    ('Rower', r'rower|rowing'),
    ('Golfer', r'golfer|\bgolf\b'),
    ('Surfer', r'surfer|surfing'),
    ('Skater', r'skater|skating|figure skating|speed skating'),
    ('Weightlifter', r'weightlifter|weightlifting|powerlifter'),
    ('Equestrian athlete', r'equestrian'),
    ('Cricket player', r'cricket'),
    ('Rugby player', r'rugby'),
    ('Archer', r'archer|archery'),
    ('Sport shooter', r'shooter|shooting sport|sport shooter'),
    ('Sailor', r'sailor|sailing'),
    ('Climber', r'climber|climbing|mountaineer'),
    ('Diver', r'\bdiver\b|diving'),
    ('Water polo player', r'water polo'),
    ('Field hockey player', r'field hockey'),
    ('Esports player', r'esports|valorant|csgo|counter-strike|overwatch|league of legends|dota|starcraft|fortnite.*pro|gaming.*pro'),

    # --- Music ---
    ('Musician', r'musician|singer|songwriter|vocalist|rapper|hip-hop artist|pop.*artist|rock.*musician|guitarist|bassist|drummer|pianist|composer|conduct|orchestral|jazz|blues.*musician|reggae|folk.*musician|bedroom.pop|indie.pop|electropop|lo-fi|qawwali|singer-songwriter|soul.trap|emo-rap|soundcloud|drill rapper|cloud rap|hyperpop|trap artist|record producer|music producer|music\b(?!.*founder)'),
    ('DJ/Producer', r'\bdj\b|electronic.*music|\bedm\b'),

    # --- Film/TV/Entertainment ---
    ('Film/TV/Entertainment', r'actor|actress|film director|film producer|screenwriter|filmmaker|theatre|theater|comedian|entertainer|tv personality|television.*host|\bhost\b|presenter|reality.*tv|digital.*native.*celebrity|film/tv|film & tv'),
    ('Animator', r'animator|animation'),

    # --- Content creation ---
    ('Content creator', r'content creator|youtuber|youtube.*creator|youtube.*content|twitch.*streamer|twitch.*content|tiktok.*creator|tiktok.*content|vine|influencer|internet personality|social media|streamer|gaming.*content|gaming.*youtuber|minecraft.*youtube|beauty.*youtuber|beauty.*tiktok|fashion.*tiktok|lifestyle.*content|dancer.*tiktok|choreographer.*content|hip-hop dancer'),

    # --- Fashion/Modeling ---
    ('Model', r'model(?!.*theory).*|beauty queen|supermodel|fashion model|pageant titleholder|pageant winner'),
    ('Fashion designer', r'fashion designer|fashion.*design'),

    # --- Art/Photography ---
    ('Visual artist', r'painter|sculptor|visual artist|artist(?!.*architect)|photographer|installation artist|digital.*artist|nft artist'),
    ('Designer', r'\bdesigner\b|design\b(?!.*theorist)'),

    # --- Writing/Literature ---
    ('Writer/Author', r'writer|author|novelist|poet|journalist|blogger|essayist|columnist|biographer|playwright|cartoonist'),

    # --- Science/Academia ---
    ('Mathematician', r'mathematician|math.*researcher'),
    ('Computer scientist', r'computer scientist|computer.*science'),
    ('Scientist', r'scientist|researcher|physicist|chemist|biologist|biochemist|neuroscientist|geneticist|molecular biologist|astronomer|astrophysicist|geologist|oceanographer|ecologist|zoologist|botanist|epidemiologist|virologist|immunologist|pharmacologist|biophysicist|crystallographer|cosmologist|paleontologist|archaeologist|anthropologist'),
    ('Academic', r'professor|academic|scholar|philosopher|historian|linguist|sociologist|psychologist|economist|political scientist|theologian'),
    ('Engineer', r'engineer|inventor|robotics|aerospace.*engineer|mechanical.*engineer|electrical.*engineer|civil.*engineer|chemical.*engineer|biomedical.*engineer|software.*engineer|industrial.*engineer'),
    ('Astronaut', r'astronaut|cosmonaut'),

    # --- Medicine ---
    ('Physician', r'physician|doctor|surgeon|pediatrician|cardiologist|neurologist|psychiatrist|oncologist|radiologist|anesthesiologist|dermatologist|endocrinologist|gastroenterologist|nephrologist|ophthalmologist|orthopedic|otolaryngologist|pathologist|pediatric|pulmonologist|rheumatologist|urologist|nephrologist|\bmd\b|medical'),

    # --- Business/Founders ---
    ('Technology founder', r'technology founder|tech founder|software founder|ai.*founder|saas.*founder|fintech.*founder|crypto.*founder|web3.*founder|robotics.*founder|drone.*founder|gaming.*founder|social.*founder|platform.*founder|app.*founder|internet.*founder|cybersecurity.*founder|dev.*tools.*founder|data.*founder'),
    ('Founder/Entrepreneur', r'founder|entrepreneur|ceo|cofounder|co-founder|startup|business.*owner|businessperson|industrialist'),
    ('Investor', r'investor|venture capitalist|angel investor|trader|hedge fund|private equity|investment'),

    # --- Aviation/Military ---
    ('Aviator', r'aviator|pilot|fighter pilot|military pilot'),
    ('Military', r'military|army|navy|air force|general|admiral|colonel|soldier|officer'),

    # --- Religion/Spirituality ---
    ('Religious figure', r'priest|pastor|bishop|cardinal|monk|saint|theologian|spiritual|guru|rabbi|imam|cleric'),

    # --- Politics/Government ---
    ('Politician', r'politician|president|prime minister|senator|congress|parliament|governor|mayor|diplomat|ambassador|minister|cabinet|secretary of state|civil servant|government'),

    # --- Law ---
    ('Lawyer', r'lawyer|attorney|judge|legal|jurist|barrister|solicitor'),

    # --- Architecture ---
    ('Architect', r'architect(?!.*software)(?!.*computer)(?!.*programming)'),

    # --- Game development ---
    ('Game developer', r'game developer|game designer|video game|indie game|game.*studio'),

    # --- More athlete sub-sports ---
    ('Track and field athlete', r'long-distance runner|middle-distance runner|distance runner|marathon|steeplechase|triple jumper|long jumper|shot put|pole vault|decathlete|hurdler|jump'),
    ('Track and field athlete', r'running|runner'),
    ('Soccer player', r'football goalkeeper|football midfielder|football defender|football.*position'),
    ('Winter sports athlete', r'alpine ski|biathlete|ski racer|ice dancer|sumo'),
    ('Racing driver', r'motogp|motor racing|motorcycle'),
    ('Esports player', r'csgo|cs2|counter-strike|fighting game|competitive programmer|professional poker'),
    ('Combat sports athlete', r'combat sports|martial arts|mma|bodybuilder|bullfighter'),

    # --- Dance ---
    ('Dancer', r'dancer|choreographer|ballerina|ballet|breakdanc|b-boy|flamenco|bharatanatyam|kathak|contemporary dance|disco performer'),

    # --- Activism ---
    ('Activist', r'activist|revolutionary|militant|guerrilla|civil rights|anti-apartheid|climate.*activist|environmental.*activist|water.*activist|water.*justice|indigenous.*activist|political.*activist|student activist|child rights|social activist'),

    # --- Politics/Crime ---
    ('Politician', r'political leadership|politics|diplomacy|empress|consort'),
    ('Criminal', r'mafia|drug lord|warlord|arms dealer'),

    # --- Media ---
    ('Film/TV/Entertainment', r'television|media|televangelism|evangelist|motivational speaker|podcaster|media proprietor|newspaper|magnate|performer|illusionist|performance art|entertainment|comedy|geisha|performing arts'),
    ('Journalist', r'journalism|photojournal|sports journalism'),

    # --- Music instruments ---
    ('Musician', r'cellist|violinist|operatic soprano|quran reciter|qari|rock keyboardist|classical violin'),

    # --- Literature ---
    ('Writer/Author', r'literature|writing|comic books|manga|blogger|essayist|columnist|biographer|playwright|cartoonist|culinary|cookbook'),

    # --- Science sub-fields ---
    ('Scientist', r'science/research|biophysics|biology|immunology|physics|cosmology|quantum computing|nematolog|physiolog|exploration|explorer|adventurer'),
    ('Mathematician', r'mathematics|logician|statistician|cryptographer|cryptanalyst'),
    ('Computer scientist', r'computer programmer|computer architect|computer graphics|computer hacker|open-source|open source|linux kernel|programming language|python|node\.js|software developer|software executive|software security|firefox|tumblr|discord|game industry|app developer|indie developer|indie app|systems programmer|front-end framework|data tools|ai/ml|ai app|thiel fellow|developer advocate|diy maker|internet standards|digital media|whistleblower|intelligence analyst|chrome vp|bitcoin|early facebook|product executive|tech executive|technology executive|consumer social|game creator|spacewar|compression|virtualization|vs code|vue|nuxt|vite|go / terminal|ractive|svelte|rollup|zig|hping|redis|ggplot2|tidyverse|pandas|apache arrow|flask|requests|python core|babel|cms creator|php creator|eniac|binac|univac|minicomputer|quantum computing theorist'),

    # --- Business ---
    ('Founder/Entrepreneur', r'real estate|automotive executive|steel industry|shipping|business|sports agent|luxury.*broker|financier|stock broker|vc|investor'),
    ('Investor', r'venture capitalist|20vc|hedge fund|private equity|investment'),

    # --- Art ---
    ('Visual artist', r'video art|contemporary art|painting|surrealism|new media art|fine art|photography'),
    ('Designer', r'fashion / film|fashion.*brand|real estate / fashion'),

    # --- Education ---
    ('Academic', r'education|self-improvement'),

    # --- Other ---
    ('Religious figure', r'religious figure|quran|faith healing|evangelist|saint|monk|priest|pastor|bishop|cardinal|guru|rabbi|imam|cleric'),
    ('Aviator', r'firefighter|chernobyl|first responder'),
    ('Explorer', r'polar explorer|explorer|adventurer|guinness world record'),

    # --- Sports competition / Academic competition ---
    ('Academic competitor', r'olympiad|science competition|math.*competition|spelling bee|quiz|academic.*competitor|regeneron|intel sts|siemens competition|google science fair'),
]

def normalize_category(cat):
    if not cat:
        return 'Other'
    cat_lower = cat.lower().strip()
    for canonical, pattern in RULES:
        if re.search(pattern, cat_lower, re.IGNORECASE):
            return canonical
    return cat  # Keep original if no rule matches

def main():
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        rows = list(reader)

    print(f'Records: {len(rows)}')

    # Show current category count
    before = Counter(r.get('category', '') for r in rows)
    print(f'Unique categories before: {len(before)}')

    # Normalize
    changes = 0
    for r in rows:
        old = r.get('category', '')
        new = normalize_category(old)
        if new != old:
            changes += 1
            r['category'] = new

    after = Counter(r.get('category', '') for r in rows)
    print(f'Unique categories after: {len(after)}')
    print(f'Categories changed: {changes}')

    print(f'\nTop 30 categories after normalization:')
    for cat, count in after.most_common(30):
        print(f'  {cat}: {count}')

    # Show categories with < 5 records (potential remaining issues)
    small = [(c, n) for c, n in after.most_common() if n < 5 and c != 'Other']
    if small:
        print(f'\nCategories with < 5 records ({len(small)}):')
        for cat, count in small[:30]:
            print(f'  {cat}: {count}')

    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    print(f'\nWritten to {CSV_PATH}')

if __name__ == '__main__':
    main()
