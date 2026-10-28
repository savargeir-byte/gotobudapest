import { toSearchParams } from "./query";
import type { CategoryKey, MarketplaceProduct, MarketplaceQuery } from "./types";

// Which live products genuinely belong on an editorial page. Every context is a normal
// marketplace query (so it goes through the same Budapest-only providers and filters), plus
// an optional title guard: when `require` is set a product must mention one of the tokens.
// Nothing falls back to unrelated results: no relevant product, no row.
export type TourContext = {
  q?: string;
  category?: CategoryKey;
  require?: string[];
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
]);

// An attraction page asks for tours that mention the place itself: its name is the search
// text and its most distinctive word (longest non-generic token) must appear in a product's
// title or summary. Attractions without such a word get no row rather than a loose match.
export function attractionContext(name: string): TourContext | undefined {
  const tokens = norm(name)
    .split(" ")
    .filter((t) => t.length >= 4 && !GENERIC.has(t));
  if (!tokens.length) return undefined;
  const distinctive = [...tokens].sort((a, b) => b.length - a.length)[0];
  return { q: name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 60), require: [distinctive] };
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
  const seen = new Set<string>();
  const out: MarketplaceProduct[] = [];
  for (const p of items) {
    if (seen.has(p.id)) continue;
    if (need.length) {
      const hay = norm(`${p.title} ${p.summary ?? ""}`);
      if (!need.some((t) => hay.includes(t))) continue;
    }
    seen.add(p.id);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}
