import { drawAttempts } from "../lib/chance";

const journey = document.querySelector<HTMLElement>("[data-journey]");
if (journey) {
  const panels = [...journey.querySelectorAll<HTMLElement>("[data-life]")];
  const links = [...journey.querySelectorAll<HTMLAnchorElement>("[data-pick]")];
  const selectLife = (id: string) => {
    const selected = panels.find(panel => panel.dataset.life === id);
    if (!selected) return;
    for (const panel of panels) panel.hidden = panel !== selected;
    for (const link of links) {
      if (link.dataset.pick === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };
  const fromHash = () => selectLife(location.hash.slice(6));
  selectLife("serena-williams");
  if (location.hash.startsWith("#life-")) fromHash();
  for (const link of links) link.addEventListener("click", () => selectLife(link.dataset.pick ?? ""));
  window.addEventListener("hashchange", fromHash);

  const tools = journey.querySelector<HTMLElement>("[data-story-tools]");
  const situation = journey.querySelector<HTMLSelectElement>("#situation");
  const cards = [...journey.querySelectorAll<HTMLElement>("[data-story]")];
  const count = journey.querySelector<HTMLElement>("[data-story-count]");
  const more = journey.querySelector<HTMLButtonElement>("[data-all-stories]");
  if (tools && situation && count && more) {
    let restoredExpanded = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem("paths-story-view") ?? "null");
      if (saved && [...situation.options].some(option => option.value === saved.situation)) {
        situation.value = saved.situation;
        restoredExpanded = saved.expanded === true;
      }
    } catch { /* Browsing remains available when storage is unavailable. */ }
    const renderStories = (expanded = false) => {
      const matches = cards.filter(card => situation.value === "all" || card.dataset.situations?.split(" ").includes(situation.value));
      const shown = expanded || situation.value !== "all" ? matches : matches.slice(0, 6);
      for (const card of cards) card.hidden = !shown.includes(card);
      count.textContent = `Showing ${shown.length} of ${matches.length} stories`;
      more.hidden = shown.length === matches.length;
      try {
        sessionStorage.setItem("paths-story-view", JSON.stringify({ situation: situation.value, expanded }));
      } catch { /* This preference is optional, not required for the journey. */ }
    };
    tools.hidden = false;
    situation.addEventListener("change", () => renderStories());
    more.addEventListener("click", () => {
      renderStories(true);
      cards[6]?.querySelector<HTMLElement>("h3")?.scrollIntoView({block:"nearest"});
      cards[6]?.focus({preventScroll:true});
    });
    renderStories(restoredExpanded);
  }

  const drawButton = journey.querySelector<HTMLButtonElement>("[data-draw-again]");
  if (drawButton) {
    drawButton.hidden = false;
    drawButton.addEventListener("click", () => {
      const results = [4, 12].map(size => {
        const draws = drawAttempts(size);
        const openings = draws.filter(Boolean).length;
        journey.querySelectorAll<HTMLElement>(`[data-draw="${size}"] span`).forEach((dot, index) => dot.classList.toggle("is-opening", draws[index]));
        const result = journey.querySelector<HTMLElement>(`[data-draw-result="${size}"]`);
        if (result) result.textContent = `${openings} ${openings === 1 ? "opening" : "openings"} in ${size} attempts`;
        return openings;
      });
      drawButton.firstChild!.textContent = "Draw again ";
      const status = journey.querySelector<HTMLElement>("[data-draw-status]");
      if (status) status.textContent = `Openings this draw: ${results[0]} from 4 attempts; ${results[1]} from 12. Same rules, uncertain outcomes. These are not personal odds.`;
    });
  }
}
