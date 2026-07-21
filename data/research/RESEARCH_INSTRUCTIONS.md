# Subagent Research Instructions — Success by 26

## Your task

You are researching **{N} candidate people** from a batch CSV file. For each person,
you must decide whether they had a **material, independently verifiable milestone
by age 26**, and if so, code their early-advantage scores per the rubric below.

## Critical rules

1. **Eligibility first.** If you cannot identify a specific, dated, material
   milestone that occurred at or before age 26, mark the person
   `age_26_ineligible` and move on. Do NOT force a milestone. Fame that arrived
   later does not count, even if the eventual achievement was extreme.

2. **Two sources minimum** for the milestone date. Wikipedia is acceptable as
   one source; try to find a second (official site, award body, reliable
   biography, news archive).

3. **Do not invent family background.** If you cannot find source-backed
   evidence of family financial status, parental domain expertise, inherited
   networks, etc., score them **0**. Zero means "no clear evidence in reviewed
   sources," NOT "advantage was absent."

4. **Scores are interpretive annotations, not measurements.** Use the rubric
   consistently. Be conservative — prefer 0 or 1 over 2 unless the evidence is
   clear and strong.

5. **Output one JSON object per person** in the output JSONL file. Even
   ineligible people get a row (with `eligibility_status` set accordingly and
   scores null).

## Output schema (JSONL, one object per line)

```json
{
  "person_id": "slug-from-name-lowercase-hyphenated",
  "name": "Full Name",
  "cohort_group": "Founders / operators | Creators / artists | Athletes | Researchers / independent engineers",
  "category": "short specific category, e.g. 'Tennis player', 'Chemist', 'Film director'",
  "birth_year": 1968,
  "age_at_milestone": 18,
  "milestone_by_age_26": "One-sentence original summary of the qualifying milestone.",
  "early_history_summary": "2-3 sentence original summary of early path to the milestone.",
  "primary_leverage_engine": "short label, e.g. 'Technical depth', 'Product/design taste', 'Distribution / audience', 'Physical talent', 'Early specialization'",
  "normalized_primary_engine": "one of: 'Scarce technical / intellectual depth' | 'Distribution / audience' | 'Product / domain insight' | 'Early specialization / prior reps' | 'Execution / operations' | 'Network / capital' | 'Physical / athletic talent'",
  "secondary_engine": "short label or empty string",
  "started_serious_reps_before_20_score": 0 or 1,
  "prior_reps_score": 0-3,
  "scarce_skill_depth_score": 0-3,
  "native_distribution_score": 0-3,
  "elite_ecosystem_network_score": 0-3,
  "complementary_team_score": 0-2,
  "structural_wave_score": 0-3,
  "concentration_intensity_score": 0-3,
  "capital_safety_score": 0-2,
  "domain_proximity_score": 0-2,
  "total_leverage_score": sum of the 10 leverage scores above,
  "success_tier": 1-4 (1=tier-1 legendary, 4=notable but not legendary),
  "leverage_evidence_confidence": "Low | Medium | High",
  "family_context_summary": "1-2 sentence original summary, or 'Not documented in reviewed sources.'",
  "parent_family_domain_summary": "1-2 sentence original summary, or 'Not documented in reviewed sources.'",
  "early_family_financial_platform_support_score": 0-2,
  "parent_family_domain_advantage_score": 0-2,
  "inherited_audience_business_network_score": 0-2,
  "elite_institution_performance_pipeline_score": 0-2,
  "frontier_geography_ecosystem_score": 0-2,
  "rare_early_tools_facilities_score": 0-2,
  "dedicated_mentor_coach_tutor_score": 0-2,
  "exceptional_peer_cofounder_sibling_score": 0-2,
  "early_online_platform_community_score": 0-2,
  "direct_customer_domain_exposure_score": 0-2,
  "prodigy_physical_edge_score": 0-2,
  "adversity_constraint_catalyst_score": 0-2,
  "inherited_access_stack_count": count of early-advantage scores >= 1,
  "exceptional_inherited_access_count": count of early-advantage scores == 2,
  "all_documented_early_condition_count": count of early-advantage scores >= 1,
  "primary_early_advantage_archetype": "one of: 'Institutional ecosystem acceleration' | 'High-trust peer team' | 'Platform-native compounding' | 'Family-domain apprenticeship' | 'Inherited distribution/capital' | 'Elite performance pipeline' | 'Constraint-driven self-creation' | 'Self-created domain repetition' | 'Frontier geography immersion' | 'Mentor-accelerated' | 'Prodigy / physical edge' | 'No dominant early advantage'",
  "primary_early_advantage_tags": "comma-separated short tags",
  "evidence_summary": "3-5 sentence original summary combining early history + family + advantage evidence.",
  "early_advantage_evidence_confidence": "Low | Medium | High",
  "source_count": integer,
  "primary_source_url": "URL",
  "source_urls": ["URL1", "URL2", ...],
  "annotation_status": "subagent_researched_beta",
  "source_audit_status": "not_independently_audited",
  "data_version": "0.2.0-subagent-beta",
  "eligibility_status": "age_26_eligible | age_26_ineligible | unverified_candidate"
}
```

## Score rubric (0-2 scale for early-advantage fields)

- **0:** No clear documentation in reviewed sources. NOT proof of absence.
- **1:** Meaningful documented advantage — present and plausibly relevant.
- **2:** Unusually strong, scarce, or directly catalytic advantage.

### Field definitions

| Field | What to look for |
|---|---|
| early_family_financial_platform_support_score | Family money, safety, business platform, or resource support that materially extended early experimentation. |
| parent_family_domain_advantage_score | Relevant knowledge, coaching, equipment access, or industry fluency transferred by parents/close family. |
| inherited_audience_business_network_score | Pre-existing audience, brand, corporate platform, investor network, or high-status access before personal market proof. |
| elite_institution_performance_pipeline_score | Selective school, university, lab, employer, accelerator, academy, or national pipeline that concentrated opportunity. |
| frontier_geography_ecosystem_score | Physical/social proximity to an emerging technological, cultural, commercial, or performance frontier. |
| rare_early_tools_facilities_score | Unusually early access to scarce computers, labs, studios, equipment, academies. Judge rarity relative to era/place. |
| dedicated_mentor_coach_tutor_score | A high-quality adult supplied sustained, individualized feedback or opportunity. One meeting is NOT sustained. |
| exceptional_peer_cofounder_sibling_score | A high-trust peer, sibling, cofounder, or collaborator multiplied learning and execution. |
| early_online_platform_community_score | Early use of an online platform/community for learning, feedback, reputation, or distribution. Distinguish casual use from a repeatable channel. |
| direct_customer_domain_exposure_score | Direct immersion in the customer problem, profession, or domain before the breakout. |
| prodigy_physical_edge_score | Unusually high early cognitive, creative, or physical ability that changed institutional response. Avoid retroactively labelling everyone a prodigy. |
| adversity_constraint_catalyst_score | Hardship, outsider status, health, language, or institutional friction that created urgency or a distinctive problem lens. Do NOT romanticize. |

## Leverage score rubric

| Field | Range | What to look for |
|---|---|---|
| started_serious_reps_before_20_score | 0-1 | Started serious, sustained practice in the domain before age 20. |
| prior_reps_score | 0-3 | Cumulative hours/years of relevant practice before the milestone. 0=none documented, 3=exceptional (e.g. 10k+ hours). |
| scarce_skill_depth_score | 0-3 | Depth in a skill that was scarce for the era/domain. |
| native_distribution_score | 0-3 | Owned or easily-reached audience/distribution before the milestone. |
| elite_ecosystem_network_score | 0-3 | Embeddedness in a high-signal network (founders, researchers, athletes, artists). |
| complementary_team_score | 0-2 | A durable complementary partner (cofounder, teammate, sibling, collaborator). |
| structural_wave_score | 0-3 | Rode a structural wave (tech platform, cultural shift, market opening). |
| concentration_intensity_score | 0-3 | Ability to concentrate intensely on the domain for long periods. |
| capital_safety_score | 0-2 | Financial safety net that permitted risk-taking or long practice. |
| domain_proximity_score | 0-2 | Direct lived/operational exposure to the problem domain. |

## success_tier guide

- **1:** Tier-1 legendary/global icon (e.g. Messi, Tiger Woods, Tarantino).
- **2:** Tier-2 dominant figure in their field (e.g. world champion, major prize winner).
- **3:** Tier-3 notable and widely recognized within their domain.
- **4:** Tier-4 notable but primarily known to specialists or within a niche.

## Workflow

1. Read the batch CSV at the path given to you.
2. For each candidate, use `web_search` and `webfetch` to research:
   - Their Wikipedia page (primary source).
   - At least one additional source for the milestone date.
   - Sources for family background if you can find them.
3. Decide eligibility (material milestone by age 26?).
4. If eligible, code all scores and write summaries.
5. If ineligible, write a row with `eligibility_status: "age_26_ineligible"`,
   null scores, and a brief `milestone_by_age_26` note explaining why they were
   excluded (e.g. "Fame arrived at age 32 with X; no material milestone by 26 found.").
6. Append each person's JSON object as one line to the output JSONL file at the
   path given to you.

## Quality bar

- Every eligible person needs at least 2 source URLs.
- Summaries must be original (do not copy-paste from Wikipedia).
- Be honest about missing evidence. A row full of 0s with "Not documented" is
  better than invented scores.
- When unsure between 0 and 1, prefer 0.
- When unsure between 1 and 2, prefer 1.
