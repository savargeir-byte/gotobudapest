import type { Attraction, Photo } from "../types";
import { photos as verifiedPhotos } from "../attractions";

// Conservative match between a supplier product title and one of OUR attractions, used only to
// decide whether a correctly credited photograph of that exact place may illustrate a product that
// has no supplier imagery (Tiqets on this key tier). A match requires ALL of:
//   - the attraction's full name (or a reviewed alias, at least 8 characters once normalised)
//     appears at word boundaries in the product's SUBJECT: the first part of the title, ignoring a
//     bare "Budapest:" prefix. The name must start the subject or follow "in", "at", "inside", "of"
//     or "to", so "Walking Tour & Hospital in the Rock Visit" or "Castle District & Parliament Tour"
//     (a venue that is only one stop among several) never match;
//   - the product is not a multi-stop or logistics product (city card or pass, hop-on hop-off,
//     transfers, airport or from-Budapest trips);
//   - the attraction has a photograph that carries a credit (our verified lib/photos.json entry for
//     that exact place, or a credited photo on the attraction itself; never shared artwork);
//   - exactly one attraction matches (the longest name wins only over names it contains).
// Anything uncertain returns undefined and the card stays a text card.
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Names a product title may use for the same place. Reviewed against real Tiqets titles:
// "Széchenyi Spa: Full Day Entry Ticket" and "Lukács Spa: Thermal Bath Admission" are tickets to
// those baths. Nothing is added for places that are only visited as part of a tour.
const ALIASES: Record<string, string[]> = {
  "szechenyi-thermal-bath": ["Széchenyi Spa", "Széchenyi Thermal Spa"],
  "lukacs-thermal-bath": ["Lukács Spa"],
  "gellert-thermal-bath": ["Gellért Spa"],
};

const MULTI_STOP = /\b(hop on|hop off|transfers?|airport|card|pass|day trip|from budapest)\b/;
const LEADS = new Set(["in", "at", "inside", "of", "to"]);

export type CreditedPhoto = Photo & { credit: NonNullable<Photo["credit"]> };
export type VenueMatch = { attraction: Attraction; photo: CreditedPhoto; matchedName: string };

// The credited photograph of an attraction: its own, else our verified one for that slug.
export function creditedPhotoOf(a: Attraction): CreditedPhoto | undefined {
  if (a.photo?.credit) return a.photo as CreditedPhoto;
  const verified = verifiedPhotos[a.slug];
  return verified?.credit ? (verified as CreditedPhoto) : undefined;
}

function subjectOf(title: string): string {
  const parts = title
    .split(/[:|]|\s[–—-]\s/)
    .map(norm)
    .filter((p) => p && p !== "budapest");
  return parts[0] ?? norm(title);
}

export function matchVenue(
  title: string,
  attractions: Attraction[],
  photoOf: (a: Attraction) => CreditedPhoto | undefined = creditedPhotoOf,
): VenueMatch | undefined {
  if (MULTI_STOP.test(norm(title))) return undefined;
  const subject = ` ${subjectOf(title)} `;
  const found: { a: Attraction; name: string; photo: CreditedPhoto }[] = [];
  for (const a of attractions) {
    const photo = photoOf(a);
    if (!photo) continue;
    for (const raw of [a.name, ...(ALIASES[a.slug] ?? [])]) {
      const name = norm(raw);
      if (name.length < 8) continue;
      const at = subject.indexOf(` ${name} `);
      if (at < 0) continue;
      const before = subject.slice(0, at).trim().split(" ").filter(Boolean);
      if (before.length && !LEADS.has(before[before.length - 1])) continue;
      found.push({ a, name, photo });
      break;
    }
  }
  const kept = found.filter((x) => !found.some((y) => y !== x && y.name.length > x.name.length && y.name.includes(x.name)));
  if (kept.length !== 1) return undefined;
  return { attraction: kept[0].a, photo: kept[0].photo, matchedName: kept[0].name };
}
