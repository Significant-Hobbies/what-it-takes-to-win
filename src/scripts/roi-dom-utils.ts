export function escapeAttribute(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export function numberValue(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

export function parseNumber(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

export function selected(value: string, current: string) {
  return value === current ? " selected" : "";
}
