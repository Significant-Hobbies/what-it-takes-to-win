# Starting Advantage Framework

You are scoring the **starting advantages** of notable people who achieved significant milestones by age 26. For each person, research their background and score 3 advantage dimensions on a 0-3 scale, plus write structured summaries.

## The 3 Advantage Dimensions

Score each 0, 1, 2, or 3. Use **−1** only for an active disadvantage (e.g., poverty, discrimination, lack of access).

This measures **starting advantage**, not eventual success:
> Outcome ≈ starting advantages × agency × sustained effort × timing

### 1. personal_endowment_score — Learning speed, reasoning, creativity, energy, temperament, domain aptitude

Did they show exceptional cognitive capacity, curiosity, creativity, or domain aptitude from a young age?

- **−1** = Active disadvantage (learning difficulty, health issues affecting cognition)
- **0** = No meaningful advantage — average ability
- **1** = Modest advantage — smart, capable, above average
- **2** = Significant advantage — exceptional early achievement (e.g., coding at 10, math competition winner, published research as teen, self-taught multiple domains by 15)
- **3** = Rare, trajectory-changing — prodigy-level ability (e.g., IMO gold medal, IOI winner, published at NeurIPS in high school, chess master at 12, university at 14)

Evidence to look for: Olympiad medals, early coding/reading/math, prodigy labels, published research before 18, skipping grades, university at young age, competitive programming rankings, creative output at young age, energy/drive indicators.

### 2. inherited_leverage_score — Family wealth, stability, knowledge, reputation, networks, and access

Did their family provide significant advantages through wealth, domain knowledge, reputation, or networks?

- **−1** = Active disadvantage (poverty, refugee, orphan, abusive family, no stability)
- **0** = No meaningful advantage — working class, no domain overlap, no connections
- **1** = Modest advantage — middle class, stable family, general professional exposure, supportive parents
- **2** = Significant advantage — upper-middle class, parents in related field, private schools, notable connections, family business
- **3** = Rare, trajectory-changing — wealthy family, parents are industry leaders, direct access to investors/customers/powerful networks, family name opens doors (e.g., Bill Gates' mother on United Way board with IBM CEO)

Evidence to look for: Parents' professions, family wealth indicators, private school attendance, family business in same domain, parent connections to industry, trust fund/inheritance, family name recognition, stability of upbringing.

### 3. catalytic_ecosystem_score — Peers, mentors, institutions, tools, culture, geography, and timing

Did they have exceptional peers, mentors, institutional access, tools, or were they in the right place at the right time?

- **−1** = Active disadvantage (isolation, no access to education, war zone, no tools/internet)
- **0** = No meaningful advantage — normal school, no notable peers or mentors
- **1** = Modest advantage — good school, some guidance, normal peer group
- **2** = Significant advantage — elite institution, strong cofounder duo, notable mentor, frontier geography, early access to tools, right timing
- **3** = Rare, trajectory-changing — once-in-a-generation peer environment (e.g., Lakeside School with Paul Allen, PayPal mafia, Homebrew Computer Club, Bell Labs), legendary mentor, perfect timing for their domain

Evidence to look for: Cofounder relationships, mentor names, school peer group, sibling collaborations, institutional access (Stanford, MIT, YC), geographic location (SF, tech hub), tool access (computers at young age, lab equipment), timing (entered market at perfect moment), cultural context (entrepreneurial family/community).

## Structured Text Fields

For each person, write these 3 fields:

### endowment_summary
1-2 sentences about early ability, curiosity, and domain aptitude.
Example: "Read entire World Book Encyclopedia by age 10. Wrote first program at 13. National merit scholar. Exceptional curiosity and drive from young age, though not a traditional prodigy."

### inherited_summary
1-2 sentences about family background, parents' professions, wealth, and access.
Example: "Father was a prominent corporate lawyer (K&L Gates). Mother served on United Way board alongside IBM CEO. Upper-middle class Seattle family with significant professional connections."

### ecosystem_summary
1-2 sentences about peers, mentors, institutions, geography, and timing.
Example: "Met Paul Allen at Lakeside School — Allen introduced him to computing. Teletype Club peer group. Early access to mainframe computer time — rare for a high schooler in 1968. Right place (Seattle), right time (dawn of personal computing)."

## Output Format

Write a JSON array to the output file. Each entry must include:

```json
{
  "person_id": "john-doe",
  "personal_endowment_score": 2,
  "inherited_leverage_score": 1,
  "catalytic_ecosystem_score": 3,
  "endowment_summary": "Started coding at 12, won state programming competition at 16. Above-average ability with strong curiosity.",
  "inherited_summary": "Father was a software engineer at IBM. Middle-class family in suburban New York.",
  "ecosystem_summary": "Met cofounder at Stanford CS. Strong peer group in CS department. Mentored by professor who connected them to YC. Silicon Valley at the right time.",
  "scoring_confidence": "Medium"
}
```

## Instructions

1. Read the batch file for the list of people to score
2. For each person, use web_search and webfetch to research their family background, education, early life, peers, mentors, and ecosystem
3. Score all 3 dimensions based on the evidence you find
4. Write the structured summaries
5. Write the JSON array to the output file
6. Be conservative — only score 3 if there's clear, strong evidence of a rare, trajectory-changing advantage
7. Use −1 only for active disadvantages (poverty, isolation, war, abuse)
8. If you can't find information, score based on what's available and set confidence to "Low"
9. Remember: this measures STARTING advantage, not eventual success
