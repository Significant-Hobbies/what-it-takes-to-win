// Dated excerpts, not live prices, individual wealth estimates or typical outcomes.
export const situations = [{id:"all",label:"Every situation"},{id:"work",label:"Work & making things"},{id:"money",label:"Investing & ownership"},{id:"place",label:"Place & moving"},{id:"chance",label:"Encounters & disruptions"}];
export const turningPoints = [
  {
    "id": "nvidia",
    "name": "NVIDIA",
    "kind": "Equity · 2021–2024",
    "tag": "A job meets a wave.",
    "mark": "2021 → 2024",
    "caption": "An engineer’s share grant meets the AI boom.",
    "story": "An engineer joined NVIDIA in 2021. In a June 2024 interview, he reported $1.6 million in unvested shares after the AI surge.",
    "limit": "One reported account. Unvested shares are not cash, and other employees’ outcomes differ.",
    "url": "/luck/nvidia-ai-run/",
    "situation": "Taking a job",
    "categories": [
      "work",
      "money"
    ],
    "choice": "Develop skills and accept a role that includes equity.",
    "chance": "The timing and scale of demand for AI hardware.",
    "other": "A salary-only worker does not hold the same company exposure.",
    "archive": "nvidia-ai-run",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "housing",
    "name": "The housing crash",
    "kind": "Market shock · 2008",
    "tag": "A bargain. A loss.",
    "mark": "2008",
    "caption": "An opening for a buyer can be a crisis for an owner.",
    "story": "The US housing crisis brought falling home values, foreclosures and a severe recession. Security could deteriorate without a person becoming less capable.",
    "limit": "This contrast explains exposure; it is not a matched study of two households or a recommendation to time a market.",
    "url": "https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath",
    "situation": "Buying a home",
    "categories": [
      "money",
      "place"
    ],
    "choice": "Whether, where and how much to borrow—within the options available.",
    "chance": "A recession, falling prices and income shocks.",
    "other": "Lower prices can help a cash-ready buyer while hurting an indebted owner.",
    "archive": "2008-housing-crash-buyers",
    "sourceLabel": "Federal Reserve History"
  },
  {
    "id": "bangalore",
    "name": "Bangalore",
    "kind": "Industry wave · 1990s",
    "tag": "A frontier arrives nearby.",
    "mark": "IT",
    "caption": "Engineering skills meet the outsourcing boom.",
    "story": "The archive follows Bangalore’s software generation as export-led work concentrated in the city.",
    "limit": "A regional opportunity does not reach everyone equally. Training, language, family resources and hiring access still matter.",
    "url": "/luck/bangalore-it-boom/",
    "situation": "Where you grow up",
    "categories": [
      "place",
      "work"
    ],
    "choice": "Study, seek work and develop skills where possible.",
    "chance": "An export industry concentrates near where you already live.",
    "other": "The same training elsewhere may meet a different local job market.",
    "archive": "bangalore-it-boom",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "visa",
    "name": "The visa draw",
    "kind": "Migration · Archive case",
    "tag": "Qualified. Still waiting.",
    "mark": "H–1B",
    "caption": "An offer and preparation do not control a lottery.",
    "story": "The archive explores how a visa selection process can alter a career despite a person’s qualifications and job offer.",
    "limit": "This preview makes no current eligibility or probability claim. Consult the case sources for their reporting period.",
    "url": "/luck/h1b-visa-lottery/",
    "situation": "Moving countries",
    "categories": [
      "place",
      "chance"
    ],
    "choice": "Prepare, seek eligible work and apply through the relevant process.",
    "chance": "Selection in a constrained visa process.",
    "other": "An unsuccessful draw is not evidence of less skill or effort.",
    "archive": "h1b-visa-lottery",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "bonnie",
    "name": "Bonnie Tyler",
    "kind": "Encounter · 1974",
    "tag": "Someone was listening.",
    "mark": "1974",
    "caption": "Years of local performances. Then a scout in the room.",
    "situation": "Putting your work out there",
    "categories": [
      "work",
      "chance"
    ],
    "story": "Bonnie Tyler's official biography dates Roger Bell hearing a local performance to 1974. Performing had created an occasion to be heard; the encounter opened a recording route.",
    "choice": "Practice and keep performing on local stages.",
    "chance": "Who happened to hear a performance, and what they could offer.",
    "other": "Other equally persistent performers may never have met that scout.",
    "limit": "This is a selected successful life, not a measured success rate for performers.",
    "url": "https://bonnietyler.com/bio/",
    "sourceLabel": "Official biography",
    "profile": "bonnie-tyler"
  },
  {
    "id": "layoff",
    "name": "The layoff",
    "kind": "Setback · 2024–2025",
    "tag": "A door closes.",
    "mark": "25",
    "caption": "A hackathon winner loses his job. The story continues.",
    "story": "Donald King, 25, was laid off after winning a PwC AI hackathon. The existing case follows his subsequent move into a startup.",
    "limit": "His reported redirection does not make layoffs beneficial. For others, job loss creates prolonged hardship.",
    "url": "/luck/layoff-redirection/",
    "situation": "Starting over",
    "categories": [
      "work",
      "chance"
    ],
    "choice": "How to respond, seek support and test another direction.",
    "chance": "A layoff interrupts the plan.",
    "other": "One person's eventual redirection does not make job loss harmless for others.",
    "archive": "layoff-redirection",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "kind": "Private funding · June 2025",
    "tag": "A market starts moving.",
    "mark": "$9.9B",
    "caption": "Company valuation at its Series C. Not personal wealth.",
    "story": "Cursor announced $900 million in new funding at a $9.9 billion company valuation on June 6, 2025.",
    "limit": "This is a dated funding event, not its current valuation. Private company valuation does not establish a founder’s or employee’s liquid wealth.",
    "url": "https://cursor.com/blog/series-c",
    "situation": "Building something",
    "categories": [
      "work",
      "money"
    ],
    "choice": "Build a product, assemble a team and seek customers.",
    "chance": "A fast-changing AI market and investors' appetite for it.",
    "other": "A headline company valuation is not an employee's bank balance.",
    "sourceLabel": "Primary event announcement"
  },
  {
    "id": "airbnb",
    "name": "Airbnb",
    "kind": "IPO · December 2020",
    "tag": "The company goes public.",
    "mark": "$68",
    "caption": "IPO offer price per share. Not an employee’s gain.",
    "story": "Airbnb priced its IPO at $68 per share on December 9, 2020. The offering included shares sold by the company and certain selling stockholders.",
    "limit": "An IPO does not mean everyone can sell immediately. Individual outcomes depend on ownership, acquisition price, restrictions and taxes.",
    "url": "https://investors.airbnb.com/press-releases/news-details/2020/Airbnb-Announces-Pricing-of-Initial-Public-Offering/default.aspx",
    "situation": "Holding company shares",
    "categories": [
      "money",
      "work"
    ],
    "choice": "Join or invest, subject to access, grant terms and risk.",
    "chance": "The market and timing in which the business becomes public.",
    "other": "The same IPO means different things to a founder, employee and new buyer.",
    "sourceLabel": "Primary event announcement"
  },
  {
    "id": "sandisk",
    "name": "Sandisk",
    "kind": "Spin-off · February 2025",
    "tag": "One company becomes two.",
    "mark": "SNDK",
    "caption": "Trading independently after the Western Digital separation.",
    "story": "Sandisk completed its separation from Western Digital and began trading independently on Nasdaq on February 24, 2025.",
    "limit": "The separation is documented. It does not establish an employee windfall or an individual investment return; those depend on ownership, prices and timing.",
    "url": "https://www.sandisk.com/sandisk-separation-faqs",
    "situation": "Owning part of a company",
    "categories": [
      "money"
    ],
    "choice": "Whether to hold an investment, within the choices available.",
    "chance": "A corporate separation changes what is traded.",
    "other": "A corporate event alone cannot tell us a particular investor's return.",
    "sourceLabel": "Primary event announcement"
  },
  {
    "id": "remote",
    "name": "The remote move",
    "kind": "Work · 2020–2022",
    "tag": "Same salary. New city.",
    "mark": "2020",
    "caption": "Location becomes a choice for some kinds of work.",
    "story": "The archive follows workers who could retain their jobs while moving to lower-cost locations when remote work expanded.",
    "limit": "The option was not available to every occupation or household. A lower rent is not a universal outcome.",
    "url": "/luck/pandemic-remote-work-migration/",
    "situation": "Moving somewhere cheaper",
    "categories": [
      "place",
      "work"
    ],
    "choice": "Whether to move, if work and family circumstances allow.",
    "chance": "Remote-work permission expands during the pandemic.",
    "other": "A movable job offers a choice that many other jobs cannot.",
    "archive": "pandemic-remote-work-migration",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "shenzhen",
    "name": "Shenzhen",
    "kind": "Geography · 1980",
    "tag": "The map changes.",
    "mark": "1980",
    "caption": "A special economic zone surrounds existing villages.",
    "story": "Shenzhen’s designation as a special economic zone changed the economic setting around existing village land.",
    "limit": "Ancestral land ownership and location mattered. This account does not imply that every resident shared the gains.",
    "url": "/luck/shenzhen-special-zone/",
    "situation": "Where your family lives",
    "categories": [
      "place",
      "money"
    ],
    "choice": "How people live and work within their existing circumstances.",
    "chance": "A policy boundary is drawn around existing village land.",
    "other": "Residents with ancestral land and residents without it have different exposure.",
    "archive": "shenzhen-special-zone",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "bitcoin",
    "name": "The pizza coins",
    "kind": "Early adoption · 2010",
    "tag": "Nobody knew the ending.",
    "mark": "10,000",
    "caption": "Bitcoin exchanged for two pizzas, before the later prices.",
    "story": "In 2010, 10,000 bitcoin were exchanged for two pizzas. The recipient spent the coins long before later price increases.",
    "limit": "A hindsight valuation is not money someone actually received, and the story is not investment advice.",
    "url": "/luck/bitcoin-early-adopters/",
    "situation": "Investing early",
    "categories": [
      "money",
      "chance"
    ],
    "choice": "Whether to buy, use, hold or sell an asset.",
    "chance": "An uncertain future market moves in ways participants did not know.",
    "other": "A later hypothetical value is not a return someone actually received.",
    "archive": "bitcoin-early-adopters",
    "sourceLabel": "Sources in the existing case"
  },
  {
    "id": "quant",
    "name": "The quant offer",
    "kind": "Hiring · Archive case",
    "tag": "A different pay scale.",
    "mark": "First job",
    "caption": "The firm and hiring year shape an early-career offer.",
    "story": "The archive examines unusually high reported entry-level compensation at quantitative trading firms.",
    "limit": "Reported offers are not universal pay. Selection, location, the employer and the compensation period all matter.",
    "url": "/luck/quant-hiring-lottery/",
    "situation": "Your first offer",
    "categories": [
      "work"
    ],
    "choice": "Develop relevant skills, prepare and apply.",
    "chance": "The employer's market, hiring year and compensation pool.",
    "other": "Pay differences do not provide a universal ranking of ability.",
    "archive": "quant-hiring-lottery",
    "sourceLabel": "Sources in the existing case"
  }
];
