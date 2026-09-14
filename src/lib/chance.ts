/** Educational toy only: independent attempts with an invented one-in-six chance. */
export function drawAttempts(count: number, random: () => number = Math.random): boolean[] {
  if (count !== 4 && count !== 12) throw new RangeError("Choose 4 or 12 illustrative attempts.");
  return Array.from({ length: count }, () => random() < 1 / 6);
}
