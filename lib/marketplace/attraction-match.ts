import type { Attraction, Photo } from "../types";
import { photos as verifiedPhotos } from "../attractions";
import { EXTRA_VENUES } from "./extra-venues";

// Conservative match between a supplier product title and a place we hold a CREDITED photograph of
// (one of our attractions, or one of the few extra venues in extra-venues.ts). Used only to decide
// whether a correctly credited photograph of that exact place may illustrate a product that has no
// supplier imagery (Tiqets on this key tier). Two relations, both labelled on the card:
//
//   "venue"     the product IS about the place: the place's name (or a reviewed alias, at least 8
//               characters once normalised) starts the title's subject (the first part of the title,
//               ignoring a bare "Budapest:" prefix) or directly follows "in", "at", "inside", "of" or
//               "to"; e.g. "St. Stephen's Basilica: Entry Ticket", "Organ Concert in St. Stephen's
//               Basilica".
//   "featured"  the place is named elsewhere in the title and is the ONLY place named there, e.g.
//               "Castle District Walking Tour + Matthias Church Entry". The card then says the place
//               is a featured stop, never that the photo shows the product.
//
// In both cases: the product is not a card/pass, hop-on hop-off, transfer or airport product; the
// place has a credited photograph (never shared artwork); and exactly ONE place is named anywhere in
// the title (a name only wins over names it contains), so "Matthias Church and Chain Bridge Walking
// Tour" gets no photo. Anything uncertain returns undefined and the card stays a text card.
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Names a product title may use for the same place, reviewed against real Tiqets titles. Nothing is
// added for places that are only visited as part of a longer tour.
const ALIASES: Record<string, string[]> = {
  "szechenyi-thermal-bath": ["Széchenyi Spa", "Széchenyi Thermal Spa"],
  "lukacs-thermal-bath": ["Lukács Spa"],
  "gellert-thermal-bath": ["Gellért Spa"],
  // The Great Synagogue and the Dohány Synagogue complex (with the Jewish Museum) are this building.
  "dohany-street-synagogue": ["Dohány Synagogue", "Great Synagogue"],
};

const MULTI_STOP = /\b(hop on|hop off|transfers?|airport|card|pass)\b/;
const LEADS = new Set(["in", "at", "inside", "of", "to"]);

export type CreditedPhoto = Photo & { credit: NonNullable<Photo["credit"]> };
export type VenueRelation = "venue" | "featured";
export type VenueMatch = {
  slug: string;
  name: string;
  photo: CreditedPhoto;
  relation: VenueRelation;
  matchedName: string;
};

type Candidate = { slug: string; name: string; names: string[]; photo: CreditedPhoto };

// The credited photograph of an attraction: its own, else our verified one for that slug.
export function creditedPhotoOf(a: Attraction): CreditedPhoto | undefined {
  if (a.photo?.credit) return a.photo as CreditedPhoto;
  const verified = verifiedPhotos[a.slug];
  return verified?.credit ? (verified as CreditedPhoto) : undefined;
}

function candidates(attractions: Attraction[], photoOf: (a: Attraction) => CreditedPhoto | undefined): Candidate[] {
  const out: Candidate[] = [];
  for (const a of attractions) {
    const photo = photoOf(a);
    if (photo) out.push({ slug: a.slug, name: a.name, names: [a.name, ...(ALIASES[a.slug] ?? [])], photo });
  }
  for (const v of EXTRA_VENUES) {
    const photo = verifiedPhotos[v.slug];
    if (photo?.credit) out.push({ slug: v.slug, name: v.name, names: [v.name, ...v.aliases], photo: photo as CreditedPhoto });
  }
  return out;
}

function subjectOf(title: string): string {
  const parts = title
    .split(/[:|]|\s[–—-]\s/)
    .map(norm)
    .filter((p) => p && p !== "budapest");
  return parts[0] ?? norm(title);
}

function find(text: string, list: Candidate[], lead: boolean) {
  const found: { c: Candidate; name: string }[] = [];
  for (const c of list) {
    for (const raw of c.names) {
      const name = norm(raw);
      if (name.length < 8) continue;
      const at = text.indexOf(` ${name} `);
      if (at < 0) continue;
      if (lead) {
        const before = text.slice(0, at).trim().split(" ").filter(Boolean);
        if (before.length && !LEADS.has(before[before.length - 1])) continue;
      }
      found.push({ c, name });
      break;
    }
  }
  // A name only wins over names it contains ("Hungarian Jewish Museum" inside a longer name).
  return found.filter((x) => !found.some((y) => y !== x && y.name.length > x.name.length && y.name.includes(x.name)));
}

export function matchVenue(
  title: string,
  attractions: Attraction[],
  photoOf: (a: Attraction) => CreditedPhoto | undefined = creditedPhotoOf,
): VenueMatch | undefined {
  const whole = ` ${norm(title)} `;
  if (MULTI_STOP.test(whole)) return undefined;
  const list = candidates(attractions, photoOf);
  // Two different places named anywhere in the title: no photo can claim to represent the product.
  const anywhere = find(whole, list, false);
  if (anywhere.length !== 1) return undefined;
  const lead = find(` ${subjectOf(title)} `, list, true);
  const { c, name } = anywhere[0];
  return {
    slug: c.slug,
    name: c.name,
    photo: c.photo,
    relation: lead.length === 1 && lead[0].c === c ? "venue" : "featured",
    matchedName: name,
  };
}
