# FE batch research task

You research one founder/engineer candidate batch for Trajectory (success-by-26).

## Inputs
- Batch CSV: `{BATCH_CSV}`
- Output JSONL: `{OUTPUT_JSONL}`
- Full rubric: `/Users/sarthak/Desktop/fleet/success-by-26/data/research/RESEARCH_INSTRUCTIONS.md`

## Rules (strict)
1. Eligibility first: only `age_26_eligible` if a specific, dated, material milestone occurred at age ≤26. Else `age_26_ineligible`. Do not force.
2. Two sources min for eligible milestones. Wikipedia + one other.
3. Do not invent family background — score 0 if unknown.
4. Conservative scores. Prefer 0 over 1 when unsure.
5. One JSON object per candidate (exactly as many lines as data rows in CSV). Even ineligible get a row.
6. `annotation_status`: "subagent_researched_beta"; `source_audit_status`: "not_independently_audited"; `data_version`: "0.3.0-trajectory-beta"
7. person_id: lowercase hyphenated name slug (not the candidate_id unless name is ambiguous)
8. Prefer cohort_group `Founders / operators` or `Researchers / independent engineers` for this FE queue when eligible.
9. For eligible only: fill starting_point, current_position, current_position_year, is_living, trajectory (3–8 {year,age,event}, include the ≤26 milestone, sort by year).
10. For ineligible: null scores, empty trajectory, short note in milestone_by_age_26 explaining why.

## Workflow
1. Read the batch CSV.
2. For each person: web_search + open Wikipedia URL if present; find birth year + dated milestones.
3. Code full schema from RESEARCH_INSTRUCTIONS.md.
4. Write the complete JSONL file (overwrite if exists). Validate: valid JSON per line, correct line count, every row has eligibility_status.

## Done
Return: eligible count, ineligible count, eligible names list. File must exist with correct line count.
