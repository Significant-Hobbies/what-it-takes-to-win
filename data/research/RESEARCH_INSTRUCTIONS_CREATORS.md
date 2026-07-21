# Research Instructions — Creator Track

These instructions extend `RESEARCH_INSTRUCTIONS.md` for researching digitally-native creators, indie hackers, esports pros, streamers, and AI builders who may NOT have Wikipedia pages.

## Key differences from the Pantheon track

1. **Sources:** Use X/Twitter profiles, LinkedIn, GitHub, YouTube/Twitch about pages, podcast interviews, blog posts, IndieHackers, Acquire.com, Forbes 30U30 lists, press coverage, company websites, and any public interviews. Wikipedia is a bonus, not a requirement.

2. **Background info rule:** If you cannot find meaningful info about the person's early life (family background, education, where they grew up, how they got started), set `eligibility_status` to `"eligible_background_unverified"` and add a `background_disclaimer` field explaining what's missing. DO NOT exclude them — include them with the disclaimer. Score advantage dimensions as 0 where unknown (not 2).

3. **Milestone definition for creators:** A "material milestone" is one of:
   - Reaching a major audience threshold (100K+ followers/subs, or 50K+ with revenue)
   - Demonstrable revenue ($10K+ MRR, major brand deal, acquisition offer)
   - Winning a major esports tournament (tier 1/2 event)
   - Building an OSS project with 10K+ stars
   - Getting into YC or raising funding
   - Cultural impact (viral moment, press coverage, award)

4. **Scoring:** Same 12 advantage dimensions and 10 leverage dimensions as the main rubric. Be conservative. For digitally-native people, `early_online_platform_community_score` and `direct_customer_domain_exposure_score` are often relevant. `prodigy_physical_edge_score` is relevant for esports (reaction time, mechanical skill).

5. **Trajectory fields:** Same as main rubric — `starting_point`, `current_position`, `current_position_year`, `is_living`, `trajectory` (array of {year, event} objects).

6. **Source URLs:** Include all sources you used. At least 1 source is required. 2+ is ideal. For people without Wikipedia, sources might be X profiles, LinkedIn, GitHub, podcast interviews, press articles, etc.

## Output format

Same JSONL format as the main rubric. One JSON object per line. Use `eligibility_status` of:
- `"eligible"` — milestone by 26, background info available
- `"eligible_background_unverified"` — milestone by 26, but early life/background is sparse
- `"ineligible"` — no milestone by 26
- `"duplicate"` — already in dataset (check name)

Include a `background_disclaimer` field for `eligible_background_unverified` entries, explaining what background info is missing.
