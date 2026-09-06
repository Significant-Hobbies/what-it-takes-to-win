# Frequently asked questions

Answers to the questions the exhibit is asked most. Each answer points to the
page that carries the evidence.

## About the claim

**Is this saying success is just luck?**
No. The project separates five things that comparison usually merges: what a
person brought, what they were handed, what surrounded them, documented
perseverance, and luck. Luck is kept visible because biographies tend to hide
it, but it is one factor among several and is never scored.

**Is this saying effort does not matter?**
No. Chapter three of the journey argues that effort changes a path. The claim
is narrower: the same effort lands on different terrain, so effort alone does
not make two paths equivalent. Perseverance evidence appears on every profile
where sources document it.

**Does the data show that advantages cause success?**
No, and the methodology says so directly. The archive contains only people who
succeeded early, so there is no control group. It can show which conditions
repeatedly accompany early breakthroughs. It cannot establish that a condition
made the outcome happen.

**Why not just add the three factors into one score?**
A total would be one more number to rank people by. Held apart, the three
explain why one path ran differently from another. That decision is recorded in
the [decision log](decision-log.md) and enforced by the clarity audit.

## About the people

**How does someone get into the archive?**
They need a specific, dated, material milestone at or before the target age,
supported by at least two sources. Newer admissions also pass three versioned
gates: discovery, research, and publication. See the
[research pipeline](research-pipeline.md).

**Why is the field called `milestone_by_age_26` when the target age is 30?**
The original cut-off was 26. It moved to 30 when the age-banded outcome rules
were introduced, and the column name was kept so the corpus stayed compatible
while the migration continues. The methodology and data dictionary both note
this.

**Are these only famous people?**
No. Outcome reach has four editorial bands, and 1,671 of the 3,578 profiles sit
in the professionally distinctive band rather than among global icons.

**Can I suggest a person or correct a profile?**
Yes, through `/contribute/` on the site or the GitHub issue templates. A
suggestion opens a research question. It does not guarantee publication.

## About the numbers

**What does the -1 to 3 scale mean?**
Each of the three condition factors is scored from -1 to 3. Zero means no clear
evidence in the reviewed sources, not that the advantage was absent. A -1 is a
documented headwind. The scores are interpretive annotations applied through a
shared rubric, not measurements.

**How reliable are the scores?**
A blinded second coder re-scored 16 records. Outcome tier agreed within one band
every time, with a weighted kappa of 0.723. Starting-advantage dimensions agreed
exactly 64 percent of the time. The older leverage rubric agreed exactly only 34
percent of the time, which is why it was demoted to secondary research detail.
Full results are in [quality/RELIABILITY_REPORT.md](../quality/RELIABILITY_REPORT.md).

**Have the sources been verified?**
Every source URL has been checked for reachability, and the result is stored on
each record. Reachability does not verify that the source supports the claim.
An independent content audit is still pending and is marked as such on
`/coverage/`.

**What percentile does a profile represent?**
The site does not publish one. A percentile needs a field-specific, sourced
denominator, and the archive does not have it. Outcome reach stays qualitative
until that calibration exists.

## About the site

**Why does it not have a login, a score, or a quiz?**
The product is an explanatory exhibit, not a coaching tool. Resemblance
questionnaires were removed in August 2026 and replaced with static comparison
breakers that show evidence instead of a match score.

**Is my ROI worksheet input sent anywhere?**
No. The `/roi/` page does all arithmetic locally and is excluded from session
analytics. Nothing entered there leaves the browser.

**Can an AI assistant read the site?**
Yes. Every page has a Markdown mirror, and the site publishes `llms.txt`,
`/api/ai`, and `/openapi.json`. The [architecture](architecture.md) page lists
the agent surfaces.

**What is still pending?**
First-time-user comprehension and a matched comparison study. Both need people
who did not build the product, so they cannot be closed by automated or agent
review. The coverage page reports them as open gates.
