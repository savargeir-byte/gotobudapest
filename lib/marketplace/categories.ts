import type { CategoryKey } from "./types";

// Keyword classifier for the marketplace category tabs. Providers without a usable
// taxonomy (TourDesk, Tiqets, Viator free text) are matched on title + summary.
// A product may belong to several categories. Nothing is guessed from price or
// provider: only words that appear in the supplied text count.

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const RULES: Record<CategoryKey, RegExp> = {
  cruises:
    /\b(cruise|cruises|boat|river tour|danube river|sailing|yacht|catamaran|riverboat|dinner on the danube)\b/,
  baths:
    /\b(spa|spas|thermal|bath|baths|wellness|szechenyi|gellert|rudas|lukacs|veli bej|sauna|hot spring)\b/,
  walking:
    /\b(walking|walk|city tour|sightseeing|hop[- ]on|bike|cycling|segway|bus tour|old town|castle district|jewish quarter|ruin bar|pub crawl|private tour|guided tour)\b/,
  food:
    /\b(food|foodie|wine|tasting|culinary|cooking|goulash|gastronomy|dinner|lunch|brunch|beer|market hall|street food|chocolate|palinka)\b/,
  tickets:
    /\b(ticket|tickets|admission|entry|skip[- ]the[- ]line|fast[- ]track|museum|opera|parliament|basilica|synagogue|house of terror|zoo|aquarium|escape room|show|concert|attraction)\b/,
  daytrips:
    /\b(day trip|day tour|excursion|from budapest|vienna|bratislava|szentendre|visegrad|esztergom|eger|lake balaton|balaton|danube bend|puszta|hortobagy|memorial park|prague)\b/,
  transfers:
    /\b(airport transfer|airport transfers|transfer|transfers|shuttle|private transfer|pick[- ]?up from the airport|airport)\b/,
};

export function classify(text: string): CategoryKey[] {
  const t = norm(text);
  return (Object.keys(RULES) as CategoryKey[]).filter((k) => RULES[k].test(t));
}

export function inCategory(text: string, category: CategoryKey): boolean {
  return RULES[category].test(norm(text));
}

// Free-text term sent to providers that only offer text search when a category tab
// is chosen. Always prefixed with the destination by the caller.
export const CATEGORY_TERM: Record<CategoryKey, string> = {
  cruises: "Danube cruise",
  baths: "thermal bath spa",
  walking: "walking tour",
  food: "food tour",
  tickets: "tickets skip the line",
  daytrips: "day trip",
  transfers: "airport transfer",
};

// Viator tag-name patterns (lowercased substrings, resolved against the live
// /products/tags taxonomy at runtime: no numeric tag id is hard-coded).
export const CATEGORY_TAG_PATTERNS: Record<CategoryKey, string[]> = {
  cruises: ["cruise", "boat", "sailing", "yacht", "catamaran"],
  baths: ["spa", "thermal", "bath", "wellness", "hot spring"],
  walking: ["walking", "sightseeing", "city tour", "hop-on", "hop on", "bike", "segway"],
  food: ["food", "wine", "culinary", "tasting", "cooking", "dining", "beer"],
  tickets: ["skip-the-line", "skip the line", "admission", "attraction ticket", "tickets & passes", "entry ticket", "museum"],
  daytrips: ["day trip", "excursion", "full-day", "day tour"],
  transfers: ["airport transfer", "transfer", "shuttle"],
};

// Relevance guard for free-text results (goTene relevanceFilter idea): keep only
// products whose text mentions a significant (4+ letter) query token. The
// destination word itself never counts as relevance.
export function relevant(text: string, query?: string): boolean {
  if (!query) return true;
  const tokens = norm(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && t !== "budapest" && t !== "hungary");
  if (!tokens.length) return true;
  const hay = norm(text);
  return tokens.some((t) => hay.includes(t));
}
