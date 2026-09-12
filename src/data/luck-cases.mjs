// Luck directory — ordinary-person cases of luck, not the outliers in the
// 3,578-path archive. Every figure is sourced. Voice: numbers first, no
// formula, no causal claim.
//
// Each case maps to one of the four luck forms used across the site
// (structural, encounter, event, variance).
//
// Types live in luck-cases.d.ts so this plain JS module is importable by
// both Astro/Vite and standalone Node scripts.

export const LUCK_FORM_LABELS = {
  structural: "Structural luck",
  encounter: "Encounter luck",
  event: "Event luck",
  variance: "Outcome variance",
};

export const LUCK_FORM_SUMMARIES = {
  structural: "Birthplace, era, family, geography, institutions, and being near the right frontier.",
  encounter: "Meeting a collaborator, mentor, coach, investor, selector, or first customer.",
  event: "A market shock, algorithm boost, competitor failure, injury avoided, or unexpected opening.",
  variance: "Similar visible inputs still produce different results for reasons the record cannot recover.",
};

export const LUCK_FORM_ORDER = ["structural", "encounter", "event", "variance"];

export const luckCases = [
  {
    id: "shenzhen-special-zone",
    title: "Shenzhen's accidental landlords",
    subtitle: "Fishing villagers whose land sat inside a 1980 special economic zone.",
    form: "structural",
    period: "1980–2021",
    category: "Place",
    figure: "$30bn+",
    figureLabel: "combined fortune of original villagers",
    summary:
      "China declared Shenzhen its first special economic zone in 1980. About 300,000 original villagers whose ancestral land sat inside that line now command a combined fortune of more than $30 billion, roughly one-fifth of a city of 17 million.",
    theSetup:
      "The villagers of Huanggang and Futian had farmed and fished for centuries. Before the 1980s, many swam for British Hong Kong. Those who remained stayed because they did not leave, not because they expected a boom.",
    theLuck:
      "The state redrew the map around their farmland. Foreign investment arrived. The fishing village became a city of 17 million. Clan elders put holdings into nearly a thousand village corporations. Business Day later called their heirs this city's equivalent of Manhattan trust-fund babies. Relatives who swam the other way lived different lives on the other side of a border that did not yet exist.",
    theNumbers: [
      "Shenzhen special economic zone declared in 1980.",
      "Original villagers: about 300,000 people, combined fortune above $30 billion (Business Day, 2021).",
      "Those families own roughly one-fifth of Shenzhen, a city of about 17 million.",
    ],
    boundary:
      "Staying in a village is not a forecast of a $30 billion fortune. The same families, a few miles away, did not receive the line. Geography here is an unchosen condition, not a method for picking land.",
    sources: [
      {
        label: "Business Day — From rags to riches in Shenzhen",
        url: "https://www.businessday.co.za/bd/world/asia/2021-10-19-from-rags-to-riches-in-shenzhen-chinas-silicon-valley/",
      },
    ],
  },
  {
    id: "bangalore-it-boom",
    title: "Bangalore's IT generation",
    subtitle: "Software work paid ten times the national average because outsourcing landed there.",
    form: "structural",
    period: "1990s–2000s",
    category: "Place",
    figure: "10×",
    figureLabel: "a two-year engineer's pay vs national average income",
    summary:
      "India's software industry grew more than 40% a year in the late 1990s, almost all from exports. A Bangalore graduate with two years of experience earned about ten times average Indian income because global outsourcing happened to concentrate in that city.",
    theSetup:
      "Young engineers studied software, graduated, and took jobs in Bangalore. Many were the first in their families to enter the global labour market.",
    theLuck:
      "English-language education, a large engineering pool, low wages, and export policy made Bangalore the landing zone. The Independent reported that a graduate with two years' experience earned 20,000–24,000 rupees a month against a national average of about 10,070 rupees a year. The same training in a city without the export boom produced a different life.",
    theNumbers: [
      "India software industry growth, 1994–1999: over 40% a year, against 6.6% for the whole economy (Stanford King Center).",
      "Bangalore graduate with two years' experience: Rs 20,000–24,000 a month, about 10× the national average (The Independent).",
      "The city created an estimated 500 dollar millionaires through stock options (The Independent).",
      "Bangalore's population grew from 1.5 million to 5 million in six years during the boom.",
    ],
    boundary:
      "Studying software is a choice. Being born where a country's language and export policy made one city the outsourcing capital is not. This records a frontier arriving where people already lived.",
    sources: [
      {
        label: "The Independent — Bangalore, Silicon Valley of the sub-continent",
        url: "https://www.independent.co.uk/news/business/dateline-bangalore-silicon-valley-of-the-subcontinent-1082556.html",
      },
      {
        label: "Stanford King Center — Bangalore: The Silicon Valley of Asia",
        url: "https://kingcenter.stanford.edu/sites/g/files/sbiybj16611/files/media/file/91wp_0.pdf",
      },
      {
        label: "LA Times — Indian city rides tech euphoria (2004)",
        url: "https://www.latimes.com/archives/la-xpm-2004-jun-30-fi-bang30-story.html",
      },
    ],
  },
  {
    id: "quant-hiring-lottery",
    title: "The quant offer",
    subtitle: "First-year pay above $400,000, funded by a bonus pool the graduate has not yet earned.",
    form: "structural",
    period: "2024–2026",
    category: "Frontier pay",
    figure: "$400k–$650k",
    figureLabel: "reported first-year total at a top quant firm",
    summary:
      "Top quantitative trading firms pay new graduates about $400,000–$650,000 in the first year. One IIT Madras graduate was reportedly offered about $508,000 to join Jane Street in Hong Kong. Year-one pay is set by firm revenue, not by the graduate's trading.",
    theSetup:
      "The candidate studied a quantitative field, passed a multi-stage interview, and accepted an offer. Jane Street and Citadel hire at the start of careers and train internally.",
    theLuck:
      "Jane Street's roughly 2,631 employees generated average revenues of about $3.2 million per head in the first half of 2024. A new graduate's package is paid from that pool. Target school, a year of record firm revenue, and a city with a posting are each conditions the candidate did not set.",
    theNumbers: [
      "Jane Street new-grad total compensation: about $400,000–$650,000 in year one (levels.fyi, Wall Street Oasis, firm postings).",
      "Posted New York base for quantitative traders: $300,000.",
      "One IIT Madras graduate: about $508,000 for Hong Kong (eFinancialCareers / Bloomberg).",
      "Jane Street average revenue per head: about $3.2 million in H1 2024.",
    ],
    boundary:
      "Passing the interview is earned. The size of the bonus pool is not. The same candidate, in a weaker year or at a firm without a shared pool, receives a different package.",
    sources: [
      {
        label: "eFinancialCareers — Jane Street hires student on $500k",
        url: "https://www.efinancialcareers.co.uk/news/jane-street-student-salaries",
      },
      {
        label: "QuantVault — Jane Street salary 2026",
        url: "https://quantvault.org/jane-street-salary.html",
      },
      {
        label: "Young & Calculated — How HFT hiring works in 2026",
        url: "https://youngandcalculated.substack.com/p/how-hft-hiring-works-in-2026-compensation",
      },
    ],
  },
  {
    id: "layoff-redirection",
    title: "The layoff that redirected",
    subtitle: "Won a 3,000-person hackathon, was laid off hours later, then founded a company.",
    form: "encounter",
    period: "2024–2025",
    category: "Forced door",
    figure: "hours",
    figureLabel: "between first prize and the layoff call",
    summary:
      "Donald King, 25, won first place in a PwC AI hackathon with more than 3,000 contestants. Hours later he was laid off. He founded a marketing startup and later told Business Insider the layoff was the best thing that had happened to him.",
    theSetup:
      "King had been a technology consultant at PwC since 2021, building AI agents for enterprises. He entered a firm-wide hackathon and won it.",
    theLuck:
      "The cut was a restructuring, not a verdict on the win. The same skill, on a different schedule, keeps him at PwC. The forced exit opened a door he had not planned to walk through. Many other laid-off workers do not found companies: John Huân Vũ applied to more than 6,000 jobs after a PayPal layoff and relied on a food pantry.",
    theNumbers: [
      "Donald King, 25, technology consultant at PwC since 2021 (Business Insider, June 2025).",
      "First place in a PwC AI hackathon with 3,000+ contestants; laid off hours later.",
      "Founded AMDK, a marketing startup, after the layoff.",
    ],
    boundary:
      "Winning the hackathon is earned. Being laid off hours later is not. The same event is a redirect for some people and a crisis for others. A forced transition is not a method for finding work.",
    sources: [
      {
        label: "Business Insider — Laid off from PwC, then founded a startup",
        url: "https://www.businessinsider.com/consultant-laid-off-pwc-founded-startup-2025-6",
      },
      {
        label: "Business Insider — Applied to 6,000 jobs after a PayPal layoff",
        url: "https://www.businessinsider.com/applied-thousands-jobs-looking-for-work-layoff-food-pantry-visa-2026-7",
      },
    ],
  },
  {
    id: "nvidia-ai-run",
    title: "Nvidia's 3,776% run",
    subtitle: "An engineer joined a gaming-chip company. Most of his pay later sat in unvested shares.",
    form: "event",
    period: "2019–2024",
    category: "Equity",
    figure: "3,776%",
    figureLabel: "share-price rise, early 2019 to mid-2024",
    summary:
      "Nvidia stock rose about 3,776% from early 2019 to mid-2024. A late-20s engineer told New York Magazine his unvested shares were worth $1.6 million. He had assumed he would never get lucky in the market.",
    theSetup:
      "He took a job at Nvidia. Cash salary was just over $200,000; most compensation was equity that vested over four years. He thought of Nvidia as a gaming company.",
    theLuck:
      "Generative AI made Nvidia's GPUs the bottleneck hardware for the industry. He did not choose the timing of that wave. He told the magazine: 'I could not believe my luck. I still feel that way every quarter.'",
    theNumbers: [
      "Nvidia returned +233.6% in 2023 and +172.8% in 2024 (StatMuse, S&P data).",
      "Share price rose about 3,776% from early 2019 to September 2024 (Forbes / Tom's Hardware).",
      "One engineer in his late 20s held $1.6 million in unvested shares, about $800,000 after tax on the next 18 months of vesting (New York Magazine).",
    ],
    boundary:
      "Accepting the job and keeping the equity were decisions. The 3,776% multiplier was not. The same grant at another company, or at Nvidia in a year the wave did not arrive, is a different outcome.",
    sources: [
      {
        label: "StatMuse — Nvidia returns by year",
        url: "https://www.statmuse.com/money/ask/nvidia-stock-returns-by-year-2017-to-2024",
      },
      {
        label: "New York Magazine — A newly rich Nvidia engineer",
        url: "https://nymag.com/intelligencer/article/what-its-like-to-be-a-newly-rich-nvidia-engineer.html",
      },
      {
        label: "Forbes — Nvidia employees become multi-millionaires",
        url: "https://www.forbes.com/sites/jackkelly/2024/09/04/nvidia-employees-become-multi-millionaires-but-at-what-price/",
      },
    ],
  },
  {
    id: "2008-housing-crash-buyers",
    title: "Buying a house in 2009",
    subtitle: "The same $200,000 purchase, different cities, $362,000 to $728,000 of later equity.",
    form: "event",
    period: "2008–2025",
    category: "Timing",
    figure: "$362k–$728k",
    figureLabel: "later equity on the same $200,000 purchase, by city",
    summary:
      "National home prices fell about 30% from the 2006 peak to the 2009 trough. A $200,000 home bought near the bottom later held $362,000 to $728,000 of equity. The range is almost entirely which city the buyer was in.",
    theSetup:
      "A buyer had a deposit, qualifying income, and the willingness to purchase while prices were falling.",
    theLuck:
      "The same $200,000 purchase in San Jose later held $728,000 of equity (264%). Seattle: $642,000. Phoenix: $470,000. Atlanta: $362,000. A Wharton study found that borrowers who simply stayed in their homes through the trough accumulated about $83,000 more in capital gains than those who did not. Staying was a decision. The size of the rebound was not.",
    theNumbers: [
      "National home prices fell about 30% from the 2006 peak to the 2009 trough (Federal Reserve).",
      "San Jose: $200,000 home → $728,000 equity by 2025 (264%, GOBankingRates / Realtor.com).",
      "Seattle: $642,000 equity (212%). Phoenix: $470,000 (135%). Atlanta: $362,000 (81%).",
      "Wharton: assisted borrowers who kept their homes accumulated about $83,000 more in capital gains (Ferreira et al.).",
    ],
    boundary:
      "Buying at the bottom requires capital and nerve. The multiplier is geographic. The same decision in a slower city returns a fraction of San Jose. This is not a method for timing housing.",
    sources: [
      {
        label: "GOBankingRates — A $200,000 home bought during the 2008 crash",
        url: "https://www.gobankingrates.com/investing/real-estate/if-you-bought-200k-home-during-2008-crash-heres-how-much-equity-youd-have-now/",
      },
      {
        label: "Wharton — How homeownership helps build wealth (Ferreira)",
        url: "https://knowledge.wharton.upenn.edu/article/how-homeownership-helps-build-wealth/",
      },
    ],
  },
  {
    id: "pandemic-remote-work-migration",
    title: "The remote-work move",
    subtitle: "Same salary, cheaper ZIP code, a door that opened in March 2020.",
    form: "event",
    period: "2020–2022",
    category: "Timing",
    figure: "$1,100/mo",
    figureLabel: "one worker's extra savings after leaving the DC area",
    summary:
      "Upwork estimated 14–23 million Americans planned to relocate once remote work became ordinary. One worker who moved from Falls Church, Virginia to New Wilmington, Pennsylvania saved $1,100 a month: same job, same pay, different rent.",
    theSetup:
      "People in software, consulting, writing, and finance already had jobs that could move. That depends on field and employer.",
    theLuck:
      "The pandemic made keeping a big-city salary while leaving a big-city rent possible almost overnight. The option did not exist in January 2020 for most of those workers, and it never arrived for hospitality, retail, or healthcare. One writer saved $550 a month on rent and $460 on commuting and lunches. NPR reported that a third of people who moved to Vermont said they were likely to stay.",
    theNumbers: [
      "14–23 million Americans planned to relocate because of telework (Upwork survey, October 2020, via NPR).",
      "One worker saved $1,100 a month moving from Falls Church, VA to New Wilmington, PA (Ready to Roth).",
      "A third of movers to Vermont said they were likely or very likely to stay (University of Vermont survey, NPR).",
      "2020 movers ended in ZIP codes with home values about $27,000 lower, on average (Zillow, AP).",
    ],
    boundary:
      "Having a movable job depends on field and training. The sudden permission to keep the salary while changing the rent was a timing event. The door opened for some roles and not others, in a month nobody scheduled.",
    sources: [
      {
        label: "NPR — Now that more Americans can work anywhere, many plan to move",
        url: "https://www.npr.org/sections/coronavirus-live-updates/2020/10/30/929667563/now-that-more-americans-can-work-from-anywhere-many-are-planning-to-move-away",
      },
      {
        label: "Ready to Roth — Geoarbitrage, by accident",
        url: "https://www.readytoroth.com/geoarbitrage-and-how-i-accidentally-did-it/",
      },
      {
        label: "AP News — Many Americans moved to cheaper housing markets in 2020",
        url: "https://apnews.com/article/lifestyle-health-coronavirus-pandemic-business-67fdcc71ce55d9222e6c1daf32392180",
      },
    ],
  },
  {
    id: "h1b-visa-lottery",
    title: "The H-1B visa lottery",
    subtitle: "Same job offer, same degree. A random draw decides whether the worker can stay.",
    form: "variance",
    period: "2020–2025",
    category: "Draw",
    figure: "12–15%",
    figureLabel: "selection odds in the 2024 lottery",
    summary:
      "The H-1B work visa is capped at 85,000 a year. In 2024 more than 758,000 people registered; an individual's chance of selection was about 12–15%. In 2025 the odds rose to about 25%. Same qualification, same offer, different year, different draw.",
    theSetup:
      "A foreign worker has a U.S. job offer, meets the skill rules, and the employer registers them. Many already hold U.S. degrees and years of experience.",
    theLuck:
      "Congress set the cap in 1990 at 65,000, plus 20,000 for advanced degrees from 2004, and has not raised it. Registrations grew from about 274,000 in 2021 to 780,000 in 2024. Selection is random. A worker in 2025 had roughly double the 2024 odds. Those not selected leave, wait another year, or watch the employer move the role abroad.",
    theNumbers: [
      "Annual cap: 65,000 regular plus 20,000 master's cap (1990 / 2004).",
      "2024: 758,994 registrations, about 12–15% selected (USCIS / American Visa Law Group).",
      "2025: about 479,953 registrations, about 25.13% selected (Nadia Yakoob & Associates / USCIS).",
      "2021: about 274,237 registrations, about 44–46% selected. The same person had roughly three times the chance four years earlier.",
    ],
    boundary:
      "Qualifying is earned. Being drawn is not. Preparation does not control the draw, and the draw compounds across a working life.",
    sources: [
      {
        label: "Nadia Yakoob & Associates — FY2025 H-1B registration numbers",
        url: "https://nadiayakooblaw.com/blog/2024/5/6/nearly-500000-h-1b-lottery-registrations-submitted-in-march-2024",
      },
      {
        label: "American Visa Law Group — How the H-1B lottery works",
        url: "https://www.usavisalaw.com/immigration-blog/how-the-h1b-visa-lottery-works-and-tips-to-increase-your-chances-american-visa-law-group",
      },
      {
        label: "VisaVerge — H-1B lottery odds and quotas",
        url: "https://www.visaverge.com/h1b/h-1b-visa-lottery-odds-and-immigration-quotas-for-work-visas/",
      },
    ],
  },
  {
    id: "bitcoin-early-adopters",
    title: "The pizza coins",
    subtitle: "10,000 bitcoin for two pizzas. One side held. The other spent them within months.",
    form: "variance",
    period: "2010–2024",
    category: "Draw",
    figure: "10,000 BTC",
    figureLabel: "paid for two pizzas in May 2010, about $41 then",
    summary:
      "In May 2010, 10,000 bitcoin bought two Papa John's pizzas, about $41 at the time. At later peaks those coins would have been worth around $1.1 billion. Jeremy Sturdivant, who received them, spent most of them long before the price moved.",
    theSetup:
      "Laszlo Hanyecz, a Florida programmer, offered 10,000 BTC on Bitcointalk for pizza. Jeremy 'jercos' Sturdivant, 19, paid with a credit card and received the coins. Both were early users of an obscure protocol.",
    theLuck:
      "Curiosity in 2010 was not a forecast of $100,000. Sturdivant treated the coins as spending money and cycled them back into the small Bitcoin economy as the price crept toward $1. The same 10,000 coins produced a fortune for a holder and two pizzas for a spender.",
    theNumbers: [
      "10,000 BTC ≈ $41 in May 2010 (Fortune).",
      "At the November 2021 peak near $69,000, 10,000 BTC ≈ $690 million (crypto.news).",
      "At later prices near $110,000, the same coins would be worth about $1.1 billion (Fortune).",
      "Sturdivant spent most coins on travel and goods well before $1 (crypto.news interview).",
    ],
    boundary:
      "Early curiosity was shared. The outcome was not. Same coins, same moment, two finishes. This is not an argument to buy bitcoin.",
    sources: [
      {
        label: "Fortune — Two pizzas for 10,000 bitcoin",
        url: "https://fortune.com/article/pizza-bitcoin-day-story-laszlo-hanyecz-papa-johns-pizzas-value/",
      },
      {
        label: "crypto.news — How Jeremy Sturdivant spent the pizza fortune",
        url: "https://crypto.news/how-jeremy-sturdivant-spent-the-10000-bitcoin-pizza-fortune/",
      },
    ],
  },
];

export const luckCaseById = Object.fromEntries(luckCases.map((c) => [c.id, c]));
