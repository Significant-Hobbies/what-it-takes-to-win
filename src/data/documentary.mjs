// Featured excerpts are curated separately from the full archive. Ages are not inferred from year subtraction.
export const featuredPaths = [
  {
    id: "bill-gates", name: "Bill Gates", field: "Computing", place: "Seattle, United States",
    opening: "A computer at school. Years before a company.",
    early: "13", earlyLabel: "early computer access",
    outcome: "1975 · Microsoft founded",
    source: "https://www.gatesfoundation.org/ideas/speeches/2005/09/bill-gates-lakeside-school",
    sourceLabel: "Gates's Lakeside speech, 2005",
    steps: [
      { when: "Before the terminal", label: "Family and institution", title: "Someone chose the school.", text: "His parents proposed Lakeside. He passed its entrance exam and joined a school that would give him unusual room to explore.", takeaway: "A child's options can begin with an adult's decision." },
      { when: "Age 13", label: "What surrounded him", title: "A rare door was open.", text: "Lakeside made a computer terminal available and allowed students to explore it. Access preceded the company." },
      { when: "School years", label: "A resource with a cost", title: "Access had to be paid for.", text: "The Mothers Club funded the terminal. Computer time was expensive; having access did not make it unlimited.", takeaway: "Behind the tool were money, permission, and people." },
      { when: "School years", label: "What he developed", title: "He kept returning to the manuals.", text: "He read programming manuals repeatedly and exchanged ideas with Paul Allen. Available time became practical experience.", takeaway: "An advantage can enable work. It does not do the work." },
      { when: "Before Microsoft", label: "A chance to be useful", title: "The school trusted him with a real job.", text: "Lakeside hired him to write its scheduling program instead of hiring an outside specialist.", takeaway: "A trusted first opportunity can create experience for the next one." },
      { when: "1975", label: "A visible milestone", title: "Microsoft began.", text: "Gates and Allen founded Microsoft after their early collaboration and programming experience.", source: "https://news.microsoft.com/facts-about-microsoft/", takeaway: "The company is the visible marker. The path was already years long." }
    ],
    reflection: "The terminal did not write the code. The code could not have been written on a terminal he could not access. Both belong in the story.",
    boundary: "School access, peers, and work are documented. This does not measure their individual causal contributions."
  },
  {
    id: "serena-williams", name: "Serena Williams", field: "Tennis", place: "Compton, United States",
    opening: "A childhood on public courts. A title at seventeen.",
    early: "≈3", earlyLabel: "family training began",
    outcome: "1999 · First Grand Slam",
    source: "https://www.womenshistory.org/education-resources/biographies/serena-williams",
    sourceLabel: "National Women's History Museum",
    steps: [
      { when: "Around age 3", label: "Family support", title: "Training started in childhood.", text: "She trained with her father and sister on public courts in Compton. Early support did not mean a life without obstacles." },
      { when: "1991", label: "A change of place", title: "The family moved for tennis.", text: "The Williams family moved to Florida, where Serena trained with Rick Macci. Her parents had learned coaching through books and videos.", takeaway: "Support can be knowledge, time, and a family reorganizing its life." },
      { when: "Age 14 · 1995", label: "An unsuccessful attempt", title: "Her professional debut was a loss.", text: "She lost to Annie Miller in qualifying in Quebec. The first professional result was not a forecast of the career.", takeaway: "A result describes an attempt. It cannot settle a future." },
      { when: "1997", label: "What she developed", title: "Years of practice met competition.", text: "After years of training, she finished 1997 ranked No. 99 in the world." },
      { when: "Age 17 · 1999", label: "A visible milestone", title: "The US Open breakthrough.", text: "She won her first Grand Slam singles title. The teenage result had a much longer beginning.", source: "https://www.wtatennis.com/news/1446016/too-exciting-to-compute-how-serena-williams-landed-the-first-of-her-23-slams-at-the-us-open-20-years-ago", takeaway: "Seventeen is the age at the title, not the age her preparation began." }
    ],
    reflection: "Family support and difficult conditions can coexist. Seeing the support does not erase what Serena had to do herself.",
    boundary: "Family coaching and elite-school access are different conditions, not interchangeable units of privilege."
  },
  {
    id: "bonnie-tyler", name: "Bonnie Tyler", field: "Music", place: "South Wales, United Kingdom",
    opening: "Local stages. Repeated work. Someone in the room.",
    early: "Teens", earlyLabel: "singing on local stages",
    outcome: "Mid-1970s · A scout noticed",
    source: "https://bonnietyler.com/bio/",
    sourceLabel: "Bonnie Tyler's official biography",
    steps: [
      { when: "Teenage years", label: "An early influence", title: "A voice taking shape.", text: "She drew inspiration from Tina Turner and Janis Joplin, then developed her singing on local stages." },
      { when: "The local circuit", label: "Perseverance", title: "Work without a famous audience.", text: "She performed in South Wales pubs and clubs with bands including Imagination. The work came before the discovery." },
      { when: "1974", label: "Encounter luck", title: "A scout was listening.", text: "Her official biography dates Roger Bell hearing a local performance to 1974. That encounter opened a recording route.", takeaway: "Performing put her in the room. She could not choose who would walk in." },
      { when: "1976", label: "Collaborators and opportunity", title: "A record found its audience.", text: "RCA launched her recording career. Lost in France, written by Ronnie Scott and Steve Wolfe, became her breakthrough hit.", takeaway: "An opening still needs work, collaborators, and an audience." },
      { when: "1983", label: "A later turning point", title: "Another collaboration changed the scale.", text: "Working with Jim Steinman brought Total Eclipse of the Heart and a UK No. 1 album. Discovery had not been the final turning point.", takeaway: "A career can change direction more than once." }
    ],
    reflection: "Repeated performances created occasions to be heard. The singers who kept performing without the same encounter are missing from this selected story.",
    boundary: "The discovery year is 1974 in her official biography; an earlier archive entry used 1975 and has been corrected. This account cannot tell us how many equally persistent singers were never discovered."
  }
];

export const worldEvents = [
  {
    id: "ai-wave", period: "2023–2024", name: "The AI wave", place: "An industry changes",
    title: "He joined for a job. The world changed its value.",
    text: "In a June 2024 interview, an engineer in his late twenties described joining NVIDIA in 2021 and later holding $1.6 million in unvested shares. He had not expected the surge.",
    scenes: [
      { when: "2021", title: "Accept the job", text: "He joined a company he thought of as a gaming business." },
      { when: "2022", title: "Watch the price fall", text: "He recalled lower morale as the stock declined." },
      { when: "June 2024", title: "A different possibility", text: "The AI boom lifted his equity's value. Homeownership began to feel possible." }
    ],
    leftTitle: "Work + equity + timing", left: "Skills and a hiring decision can put someone inside an opportunity. An equity grant connects compensation to a company's fortunes. Market demand can then change the scale.",
    rightTitle: "Similar effort, different exposure", right: "A salary-only role does not share that multiplier. This explains a mechanism; it does not establish that two employees did equal work or that one deserved more.",
    source: "https://nymag.com/intelligencer/article/what-its-like-to-be-a-newly-rich-nvidia-engineer.html",
    sourceLabel: "Read the reported employee account · June 2024",
    archive: "/luck/nvidia-ai-run/", archiveLabel: "Explore the NVIDIA case",
    boundary: "One anonymous, self-reported account—not an estimate of typical employee wealth. Unvested shares are conditional compensation, not cash in the bank; prices and taxes affect what can be realized."
  },
  {
    id: "housing-shock", period: "2007–2009", name: "The housing shock", place: "A shared event, unequal consequences",
    title: "The same falling price can mean different things.",
    text: "The US housing crisis brought falling home values, foreclosures, and a severe recession. Circumstances could deteriorate without an individual becoming less capable.",
    leftTitle: "For an exposed household", left: "Falling home value and lost income could reduce security and make recovery harder.",
    rightTitle: "For a potential buyer", right: "Lower prices could create an opening—but only if income, credit, and savings made buying possible. This is an illustrative contrast, not a matched study.",
    source: "https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath",
    sourceLabel: "Federal Reserve History",
    archive: "/luck/2008-housing-crash-buyers/", archiveLabel: "Explore the housing case",
    boundary: "This is not a claim that every buyer benefited, or that loss was inevitable for every homeowner."
  }
];

export const chapters = [
  ["the-survivor", "The comparison"],
  ["the-start", "The hidden work"],
  ["the-levers", "A real life"],
  ["the-sequence", "The world moves"],
  ["another-attempt", "Another attempt"],
  ["the-boundary", "Your next chapter"]
];
