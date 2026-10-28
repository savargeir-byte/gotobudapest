import type { Attraction } from "../types";

// Conservative match between a supplier product title and one of OUR attractions, used
// only to decide whether a correctly credited photo of that exact place may illustrate a
// product page that has no supplier imagery. A match requires:
//   - the attraction's full name (normalised, at least 8 characters) to appear in the
//     product title at word boundaries,
//   - the attraction to have a photo that carries a credit (no uncredited artwork),
// and the LONGEST matching name wins. Anything uncertain returns undefined.
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function matchAttractionPhoto(
  title: string,
  attractions: Attraction[],
): Attraction | undefined {
  const hay = ` ${norm(title)} `;
  let best: { a: Attraction; len: number } | undefined;
  for (const a of attractions) {
    if (!a.photo?.credit) continue;
    const name = norm(a.name);
    if (name.length < 8) continue;
    if (!hay.includes(` ${name} `)) continue;
    if (!best || name.length > best.len) best = { a, len: name.length };
  }
  return best?.a;
}
