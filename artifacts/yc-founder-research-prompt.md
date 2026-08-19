# YC Founder Research Task

You are studying Y Combinator founders from recent batches (W22-W26). For each founder, you need to determine:

## What to research for each founder

1. **Full name** and **birth year** (if findable)
2. **Education** — university, degree, dropout?
3. **Work history before YC** — any notable companies, roles, achievements
4. **Age at YC batch** — how old were they when they did YC?
5. **Age at company founding** — how old when they started the company?
6. **Notable milestones by age 26** — did they achieve anything notable before turning 26?
   - Founded a company that raised significant funding
   - Built something with substantial users/revenue
   - Won a major competition or award
   - Had a viral product or project
   - Published notable research
   - Any other significant achievement
7. **Background factors** — family background, geography, access to resources
8. **Company outcome** — current status (active, acquired, public, inactive)

## Output format

Write a JSON array to the output file. For each founder, include:

```json
{
  "name": "Full Name",
  "company": "Company Name",
  "batch": "Winter 2023",
  "industry": "B2B",
  "birth_year": 1998,
  "age_at_founding": 23,
  "age_at_yc": 24,
  "education": "Stanford University (dropped out)",
  "prior_work": "Intern at Google, built a mobile app with 100k downloads",
  "notable_by_26": true,
  "milestone_by_26": "Founded company that raised $5M seed round at age 24",
  "company_status": "Active",
  "company_outcome": "Raised Series A, 50 employees",
  "background_notes": "Grew up in SF, parents in tech",
  "sources": ["https://...", "https://..."],
  "researched": true
}
```

If you cannot find information about a founder, still include them with `"researched": false` and note what you tried.

## Important notes

- Use web_search and webfetch to research each founder
- Search for their name + company name, their LinkedIn, any press coverage
- Be conservative — only mark `notable_by_26: true` if there's clear evidence
- "Notable" means the milestone would be impressive to an objective observer
- Founding a YC company itself is NOT automatically notable — look for something beyond just being accepted to YC
- Focus on finding birth year/age — this is the most important data point
