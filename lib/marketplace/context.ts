import { toSearchParams } from "./query";
import type { CategoryKey, MarketplaceProduct, MarketplaceQuery } from "./types";

// Which live products genuinely belong on an editorial page. Every context is a normal
// marketplace query (so it goes through the same Budapest-only providers and filters), plus
// an optional title guard: when `require` is set a product must mention one of the tokens.
// Nothing falls back to unrelated results: no relevant product, no row.
export type TourContext = {
  q?: string;
  category?: CategoryKey;
  // A product must mention at least one of these (normalised, substring match).
  require?: string[];
  // A product must mention every one of these: used when a place name has several distinctive words,
  // so "Hungarian State Opera" never matches a Parliament tour that merely says "state".
  all?: string[];
  // Match the product TITLE only. Attraction pages use this: a generic sightseeing tour that merely lists the place
  // in its description ("... passes Heroes' Square") is not a ticket or tour for it. Editorial pages (guides,
  // experiences, neighbourhoods) keep matching title and summary because they ask about a theme, not a venue.
  titleOnly?: boolean;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const CASTLE: TourContext = {
  q: "Buda Castle",
  require: ["castle", "buda", "fisherman", "matthias", "funicular"],
};

const EXPERIENCES: Record<string, TourContext> = {
  danube: { category: "cruises" },
  "thermal-baths": { category: "baths" },
  "food-and-markets": { category: "food" },
};
const NEIGHBOURHOODS: Record<string, TourContext> = {
  "castle-district": CASTLE,
  "downtown-pest": { category: "walking" },
};
const GUIDES: Record<string, TourContext> = {
  "danube-cruises": { category: "cruises" },
  "budapest-thermal-baths": { category: "baths" },
  "buda-castle-district": CASTLE,
  "getting-around-budapest": { category: "transfers" },
  "budapest-bars-nightlife": { category: "nightlife" },
  "budapest-food-and-markets": { category: "food" },
  "downtown-pest-walking-guide": { category: "walking" },
  "budapest-in-3-days": { category: "sightseeing" },
};

export const experienceContext = (slug: string): TourContext | undefined => EXPERIENCES[slug];
export const neighbourhoodContext = (slug: string): TourContext | undefined => NEIGHBOURHOODS[slug];
export const guideContext = (slug: string): TourContext | undefined => GUIDES[slug];

// Words that never identify a place on their own.
const GENERIC = new Set([
  "budapest", "hungarian", "hungary", "buda", "pest", "great", "market", "hall", "museum",
  "street", "square", "island", "park", "house", "thermal", "bath", "baths", "garden",
  "gardens", "palace", "church", "national", "city", "old", "town", "memorial", "centre",
  "center", "library", "gallery", "theatre", "theater", "music", "history", "tower",
  "bridge", "hill", "cave", "square", "water", "open", "lake", "beach", "spa",
  // Common English words that match unrelated tours ("Dinner & Lights", "Jewish heritage", "folklore dance").
  "light", "heritage", "dance", "house", "culture", "cultural", "art",
]);

// Places whose name alone would pull in a different place's products (a hill tour for the bath at its
// foot, a Basilica ticket for St. Stephen's Hall). `null` means no ticket or tour is about this place,
// so the page shows no row at all rather than a loose match.
const ATTRACTION_OVERRIDES: Record<string, { require?: string[]; all?: string[] } | null> = {
  "gellert-thermal-bath": { require: ["gellert bath", "gellert baths", "gellert thermal", "gellert spa"] },
  "heroes-square": { require: ["heroes square", "heroes sq"] },
  // Opera tickets and tours are titled "Opera House" at least as often as "State Opera"; a Parliament tour never is.
  "hungarian-state-opera": { require: ["state opera", "opera house"] },
  "kazinczy-street-orthodox-synagogue": { require: ["kazinczy"] },
  "st-stephen-s-hall": null,
  "the-1956-monument": null,
  "city-park-ice-rink": null,
  // The museum sits in the Castle but no listed ticket or tour is about its collections.
  "budapest-history-museum": null,
  "margaret-island-water-tower": null,
  // Tours to Gödöllő name the town, rarely "Royal Palace" ("Sisi's Gödöllő Palace").
  "godollo-royal-palace": { require: ["godollo"] },
  // Ruin-bar tours rarely name one bar; the page shows the nightlife row instead (areaFallback).
  "szimpla-kert": null,
};

// An attraction page asks for tours whose TITLE names the place itself: its name is the search text.
// With one distinctive word (non-generic token) the title must contain it; with several, it must
// contain all of them (at most the three longest). Attractions without a distinctive word, or listed
// in ATTRACTION_OVERRIDES as null, get no row rather than a loose match.
export function attractionContext(name: string, slug?: string): TourContext | undefined {
  const q = name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (slug && slug in ATTRACTION_OVERRIDES) {
    const o = ATTRACTION_OVERRIDES[slug];
    return o ? { q, ...o, titleOnly: true } : undefined;
  }
  const tokens = [...new Set(norm(name).split(" ").filter((t) => t.length >= 4 && !GENERIC.has(t)))];
  if (!tokens.length) return undefined;
  const longest = [...tokens].sort((a, b) => b.length - a.length);
  if (longest.length === 1) return { q, require: [longest[0]], titleOnly: true };
  return { q, all: longest.slice(0, 3), titleOnly: true };
}

// When no product is about the place itself, an attraction page may still offer a row for what the place belongs to
// (thermal baths, walking tours, museum tickets, ...). It is a normal category query, labelled as such: the heading and
// the sentence under it say these are general products, not products of this place. Nothing is shown when the partners
// list none.
export type AreaFallback = { context: TourContext; heading: string; description: string };

const BY_CATEGORY: Record<string, { category: CategoryKey; heading: string }> = {
  "Baths & wellness": { category: "baths", heading: "Thermal baths and spa experiences" },
  Landmarks: { category: "walking", heading: "Guided walks and city tours" },
  "Sacred architecture": { category: "walking", heading: "Guided walks and city tours" },
  "Parks & outdoors": { category: "walking", heading: "Guided walks and city tours" },
  Museums: { category: "tickets", heading: "Museum and attraction tickets in Budapest" },
  "Arts & culture": { category: "tickets", heading: "Museum and attraction tickets in Budapest" },
  "Food & markets": { category: "food", heading: "Food and drink experiences" },
  Nightlife: { category: "nightlife", heading: "Ruin bars and nights out" },
};
// Places outside the city: day trips are the honest category.
const DAY_TRIP_PLACES = new Set(["memento-park", "godollo-royal-palace"]);

// A car-rental card is shown only where driving is part of the plan: the places that are day trips from the city, the
// transport and day-trip guides, and topic pages about getting out of town. Everywhere else it would be noise.
export const carRentalForAttraction = (slug: string): boolean => DAY_TRIP_PLACES.has(slug);
const CAR_RENTAL_SLUG = /(^|-)(getting-around|transport(ation)?|day-?trips?|driving|drive|car|cars|airport|transfers?|road-?trip|excursions?|countryside)(-|$)/;
export const carRentalForPage = (slug: string): boolean => CAR_RENTAL_SLUG.test(slug);

export function areaFallback(category: string, name: string, slug?: string): AreaFallback | undefined {
  const entry = slug && DAY_TRIP_PLACES.has(slug)
    ? { category: "daytrips" as CategoryKey, heading: "Day trips from Budapest" }
    : BY_CATEGORY[category];
  if (!entry) return undefined;
  return {
    context: { category: entry.category },
    heading: entry.heading,
    description: `Popular Budapest products in this category from our booking partners. They are general products, not tickets for ${name}: open one to see exactly what is included.`,
  };
}

export function contextQuery(ctx: TourContext): MarketplaceQuery {
  return {
    sort: "relevance",
    ...(ctx.q ? { q: ctx.q } : {}),
    ...(ctx.category ? { category: ctx.category } : {}),
  };
}

export function seeAllHref(ctx: TourContext): string {
  const s = toSearchParams(contextQuery(ctx)).toString();
  return s ? `/tours?${s}` : "/tours";
}

export function relevantProducts(
  items: MarketplaceProduct[],
  ctx: TourContext,
  max = 6,
): MarketplaceProduct[] {
  const need = (ctx.require ?? []).map(norm);
  const every = (ctx.all ?? []).map(norm);
  // Whole words only (a trailing plural s is fine): "light" must not match "Highlights" or "Lights".
  const has = (hay: string, t: string) => hay.includes(` ${t} `) || hay.includes(` ${t}s `);
  const seen = new Set<string>();
  const out: MarketplaceProduct[] = [];
  for (const p of items) {
    if (seen.has(p.id)) continue;
    if (need.length || every.length) {
      const hay = ` ${norm(ctx.titleOnly ? p.title : `${p.title} ${p.summary ?? ""}`)} `;
      if (need.length && !need.some((t) => has(hay, t))) continue;
      if (every.length && !every.every((t) => has(hay, t))) continue;
    }
    seen.add(p.id);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}
