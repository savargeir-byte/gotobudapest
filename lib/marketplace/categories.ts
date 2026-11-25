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
  // A bath is named by what it is (spa, thermal, bath, wellness, sauna, hot spring) or by one of the famous bath names
  // next to a bath-like word. A bare "Szechenyi" or "Gellert" is NOT enough: it is also the Chain Bridge, the hill and the
  // statue that river cruises and walking tours pass, and that used to put sightseeing cruises in the bath tab.
  baths:
    /\b(spa|spas|thermal|bath|baths|wellness|sauna|hot springs?)\b|\b(szechenyi|gellert|rudas|lukacs|veli bej)\s+(?:day\s+)?(?:pass|tickets?|entry|admission|pool|swimming)\b/,
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
  // Added by the UI. Matched on product titles/summaries only (no provider taxonomy).
  sightseeing:
    /\b(sightseeing|panoramic|hop[- ]on|bus tour|city tour|highlights|landmarks|grand tour|orientation)\b/,
  nightlife:
    /\b(nightlife|night tour|pub crawl|bar crawl|ruin bars?|club|party|cocktails?|rooftop bar|night cruise|evening cruise|by night)\b/,
  family:
    /\b(family|kids|children|child|family[- ]friendly|zoo|aquarium|playground|escape room|treehouse|toy|puppet)\b/,
};

const KEYS = Object.keys(RULES) as CategoryKey[];

// Categories that say what the product IS (the main activity). They are decided by the title. When the title already names
// one of them, the summary can no longer add another one: a cruise whose description mentions a thermal bath, a hill or a
// bridge is still a cruise, not a bath. A genuine combination says so in its title ("Danube cruise and thermal bath") and
// keeps both. When the title names none of them, the summary is read as before.
const MAIN_ACTIVITY: ReadonlySet<CategoryKey> = new Set<CategoryKey>(["cruises", "baths", "transfers", "daytrips"]);

const matching = (text: string): CategoryKey[] => {
  const t = norm(text);
  return KEYS.filter((k) => RULES[k].test(t));
};

export function classify(title: string, summary = ""): CategoryKey[] {
  const fromTitle = matching(title);
  const titleSetsMainActivity = fromTitle.some((k) => MAIN_ACTIVITY.has(k));
  const fromSummary = matching(summary).filter((k) => !titleSetsMainActivity || !MAIN_ACTIVITY.has(k));
  const all = new Set<CategoryKey>([...fromTitle, ...fromSummary]);
  return KEYS.filter((k) => all.has(k));
}

export function inCategory(title: string, category: CategoryKey, summary = ""): boolean {
  return classify(title, summary).includes(category);
}

// For results a provider already filtered by ITS OWN tags (Viator): drop a product only when its title clearly says it is
// a different main activity and does not mention this one. Provider tags are broad (a cruise can carry a "spa" tag), the
// title is what the traveller reads. A product the classifier cannot place is kept.
export function contradictsCategory(title: string, category: CategoryKey): boolean {
  if (!MAIN_ACTIVITY.has(category)) return false;
  const main = matching(title).filter((k) => MAIN_ACTIVITY.has(k));
  return main.length > 0 && !main.includes(category);
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
  sightseeing: "sightseeing tour",
  nightlife: "nightlife",
  family: "family",
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
  sightseeing: ["sightseeing", "hop-on", "hop on", "panoramic", "city tour"],
  nightlife: ["nightlife", "pub", "bar", "night tour"],
  family: ["family", "kids", "child"],
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
