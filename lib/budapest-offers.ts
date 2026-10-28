/**
 * Server-only booking catalogue adapters.
 *
 * TourDesk / Viator / Tiqets credentials are never exported to the browser.
 * Only actual Budapest listings and URLs supplied by their respective APIs
 * are displayed. No booking, payment or personal-data endpoints exist here.
 *
 * Official contracts:
 *   TourDesk: https://api.tourdesk.io/swagger/index.html (TourSearch)
 *   Viator:  https://docs.viator.com/partner-api/technical/ (2.0)
 *   Tiqets:  https://developers.tiqets.dev/basics/openapi/content-api/products/search-and-filter-products
 */
import { getAttraction } from "./attractions";
import { buildSrcSet, normalizeVariants, pickVariant } from "./marketplace/images";
import { safeTourdeskUrl } from "./booking/checkout";
import { getGuide } from "./guides";
import { DiscoveryAuthError, guardRow } from "./tourdesk/discovery";
import { getBudapestCatalogue } from "./tourdesk/discovery-cache";
import { experiences, neighbourhoods } from "./topics";

export type OfferProvider = "TourDesk" | "Viator" | "Tiqets";
export type Offer = {
  id: string;
  provider: OfferProvider;
  title: string;
  description?: string;
  photo?: string;
  // Viator only: "url 480w, url 720w, ..." built from the API's own renditions.
  photoSrcSet?: string;
  amount?: number;
  priceLabel?: string;
  currency?: string;
  bookingUrl: string;
  detailUrl?: string;
};

export type OfferContext = "popular" | "attraction" | "guide" | "experience" | "neighbourhood";
type SearchContext = { term: string; keywords: string[]; broad: boolean };

const contextTerms: Record<string, { term: string; keywords: string[] }> = {
  "danube": { term: "Danube cruise", keywords: ["danube", "river", "cruise", "boat", "sightseeing"] },
  "thermal-baths": { term: "thermal baths", keywords: ["bath", "spa", "thermal", "szechenyi", "rudas", "gellert"] },
  "food-and-markets": { term: "food tour", keywords: ["food", "market", "culinary", "gastronomy", "tasting", "cooking"] },
  "castle-district": { term: "Buda Castle", keywords: ["buda", "castle", "fisherman", "matthias", "walking"] },
  "downtown-pest": { term: "Budapest sightseeing", keywords: ["budapest", "pest", "parliament", "city", "sightseeing"] },
  "budapest-in-3-days": { term: "Budapest city tour", keywords: ["budapest", "city", "sightseeing"] },
  "budapest-thermal-baths": { term: "thermal bath", keywords: ["bath", "thermal", "spa"] },
  "getting-around-budapest": { term: "Budapest city tour", keywords: ["budapest", "city", "sightseeing"] },
  "buda-castle-district": { term: "Buda Castle", keywords: ["castle", "buda", "fisherman", "matthias"] },
  "danube-cruises": { term: "Danube cruise", keywords: ["danube", "cruise", "boat", "river"] },
  "budapest-bars-nightlife": { term: "Budapest nightlife", keywords: ["nightlife", "bar", "ruin", "pub", "evening"] },
};

export function word(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
export function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}
export function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
export function price(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}
export function safeHttps(value: unknown, domains?: string[]): string | undefined {
  const raw = word(value);
  if (!raw || raw.length > 2048) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    if (domains && !domains.some((domain) =>
      url.hostname === domain || url.hostname.endsWith("." + domain)
    )) return undefined;
    return raw; // Preserve API-supplied affiliate URL and its tracking parameters exactly.
  } catch { return undefined; }
}
export function queryText(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function matchesContext(title: string, context: SearchContext) {
  if (context.broad) return true;
  const text = queryText(title);
  return context.keywords.some((keyword) => text.includes(queryText(keyword)));
}
export function isBudapestText(value: string) {
  const text = queryText(value);
  return /budapest|hungar|magyar|buda\b|pest\b/.test(text);
}
export function label(value: string, size = 180) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, size);
}

export function resolveOfferContext(kind: string, slug: string): SearchContext | undefined {
  if (kind === "popular" && slug === "") {
    return { term: "Budapest", keywords: [], broad: true };
  }
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return undefined;
  if (kind === "attraction") {
    const place = getAttraction(slug);
    if (!place) return undefined;
    const significant = queryText(place.name)
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length >= 4 && !["budapest", "hungary", "museum", "street", "square"].includes(p));
    return { term: place.name.slice(0, 90), keywords: significant, broad: false };
  }
  if (kind === "guide" && !getGuide(slug)) return undefined;
  if (kind === "experience" && !experiences.some((p) => p.slug === slug)) return undefined;
  if (kind === "neighbourhood" && !neighbourhoods.some((p) => p.slug === slug)) return undefined;
  const terms = contextTerms[slug];
  if (!terms) return undefined;
  return { ...terms, broad: false };
}

async function jsonFetch(url: string, opts: RequestInit, revalidate: number) {
  const response = await fetch(url, {
    ...opts,
    signal: AbortSignal.timeout(8500),
    next: { revalidate },
  });
  if (!response.ok) { console.warn("[booking-catalogue]", new URL(url).hostname, response.status); return undefined; }
  const length = Number(response.headers.get("content-length") || "0");
  if (length > 2_000_000) return undefined;
  try { return await response.json() as unknown; } catch { return undefined; }
}

function sortedUnique(items: Offer[], limit: number): Offer[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id) || !item.title || !item.bookingUrl) return false;
    seen.add(item.id);
    return true;
  }).slice(0, limit);
}

async function tourdesk(context: SearchContext): Promise<Offer[]> {
  const apiKey = process.env.TOURDESK_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[offers] tourdesk skipped: TOURDESK_API_KEY is not configured for this deployment");
    return [];
  }
  // Discovery (geolocation search, then a bounded scan) is cached; see lib/tourdesk/discovery.ts.
  let cat;
  try {
    cat = await getBudapestCatalogue();
  } catch (e) {
    console.warn(
      `[offers] tourdesk discovery unavailable: ${e instanceof DiscoveryAuthError ? "credentials rejected" : "no definite answer"}`,
    );
    return [];
  }
  const rows = cat.rows;
  const geo = cat.strategy === "geo";
  return sortedUnique(rows.flatMap((row): Offer[] => {
    const r = object(row);
    const title = word(r.title);
    const detail = label(word(r.description));
    const url = safeTourdeskUrl(r.tourUrl);
    const id = word(r.uniqueKey);
    // TourDesk catalogue can be limited to an affiliate's other destinations.
    // Do not mislabel an Iceland/Tenerife product as a Budapest tour.
    // Every offer must have an internal GoToBudapest product page: no valid id, no offer.
    if (!id || !/^\d{1,12}-\d{1,8}$/.test(id) || !title || !url ||
      !(geo ? guardRow(r, "geo") === "admit" : isBudapestText(`${title} ${detail}`)) ||
      !matchesContext(title, context)) return [];
    return [{
      id: `tourdesk:${id}`, provider: "TourDesk", detailUrl: `/tours/tourdesk/${id}`, title: label(title, 130),
      description: detail || undefined,
      photo: safeHttps(r.photoUrl),
      amount: price(r.price),
      priceLabel: label(word(r.formattedPrice), 36) || undefined,
      currency: /^[A-Z]{3}$/.test(word(r.currency)) ? word(r.currency) : undefined,
      bookingUrl: url,
    }];
  }), 5);
}

export function viatorBaseUrl() {
  // Never fetch arbitrary hosts supplied through environment variables.
  return process.env.VIATOR_API_BASE_URL?.trim() === "https://api.sandbox.viator.com/partner"
    ? "https://api.sandbox.viator.com/partner"
    : "https://api.viator.com/partner";
}

export async function viatorDestinationId(key: string): Promise<string | undefined> {
  // Optional operator override (PORTED from goTene destinations.ts: env id first).
  // Digits only; anything else is ignored and the live /destinations lookup is used.
  const override = process.env.VIATOR_BUDAPEST_DEST_ID?.trim();
  if (override && /^\d{1,10}$/.test(override)) return override;
  const payload = await jsonFetch(viatorBaseUrl() + "/destinations", {
    headers: {
      "exp-api-key": key,
      "Accept": "application/json;version=2.0",
      "Accept-Language": "en-US",
    },
  }, 604800);
  const row = list(object(payload).destinations).map(object).find((d) =>
    /^budapest(?:$|,|\s)/.test(queryText(word(d.name))) && word(d.type).toUpperCase() === "CITY"
  );
  return row && (typeof row.destinationId === "number" || word(row.destinationId))
    ? String(row.destinationId) : undefined;
}

async function viator(context: SearchContext): Promise<Offer[]> {
  const key = process.env.VIATOR_API_KEY?.trim();
  if (!key) return [];
  const destination = await viatorDestinationId(key);
  if (!destination) return []; // Never query every country without a Budapest destination filter.
  const campaign = (process.env.VIATOR_CAMPAIGN_VALUE || "gotobudapest").trim().slice(0, 80);
  const url = new URL(viatorBaseUrl() + (context.broad ? "/products/search" : "/search/freetext"));
  if (campaign) url.searchParams.set("campaign-value", campaign);
  const searchBody = context.broad
    ? {
        filtering: { destination },
        sorting: { sort: "DEFAULT", order: "DESCENDING" },
        pagination: { start: 1, count: 20 },
        currency: "EUR",
      }
    : {
        searchTerm: `Budapest ${context.term}`,
        searchTypes: [{ searchType: "PRODUCTS", pagination: { start: 1, count: 20 } }],
        currency: "EUR",
        productFiltering: { destination },
        productSorting: { sort: "DEFAULT", order: "DESCENDING" },
      };
  const payload = await jsonFetch(url.href, {
    method: "POST",
    headers: {
      "exp-api-key": key,
      "Accept": "application/json;version=2.0",
      "Accept-Language": "en-US",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchBody),
  }, 1200);
  // Viator's destination-filtered /products/search is the correct way to
  // retrieve popular city products; freetext requires a specific search term.
  const results = context.broad
    ? list(object(payload).products)
    : list(object(object(payload).products).results);
  return sortedUnique(results.flatMap((row): Offer[] => {
    const r = object(row);
    const code = word(r.productCode);
    const title = word(r.title);
    // The Viator Product API returns affiliate-ready productUrl. NEVER construct one.
    const bookingUrl = safeHttps(r.productUrl, ["viator.com"]);
    // Do not trust search filtering alone: exclude an unrelated destination even
    // if the upstream response contains it (or a search index mixes results).
    const destinations = list(r.destinations).map(object);
    const matchesCity = destinations.some((d) => String(d.ref) === destination) ||
      isBudapestText(`${title} ${word(r.description)}`);
    if (!code || !/^[A-Za-z0-9]{3,50}$/.test(code) || !title || !bookingUrl || !matchesCity || !matchesContext(title, context)) return [];
    const images = list(r.images).map(object);
    const cover = images.find((i) => i.isCover === true) || images[0];
    // Real renditions only (issue #11): never a 100x100 thumbnail; the rendition that covers
    // a ~480 CSS px card at 2x (else the widest usable one); srcset for responsive clients.
    const variants = normalizeVariants(list(cover?.variants), (u) => safeHttps(u));
    const photo = pickVariant(variants, 480, 2).variant?.src;
    const photoSrcSet = buildSrcSet(variants)?.srcSet;
    const cost = object(object(r.pricing).summary);
    return [{
      id: `viator:${code}`, provider: "Viator", detailUrl: `/tours/viator/${code}`, title: label(title, 130),
      description: label(word(r.description)) || undefined,
      photo, ...(photo && photoSrcSet ? { photoSrcSet } : {}), amount: price(cost.fromPrice),
      currency: /^[A-Z]{3}$/.test(word(object(r.pricing).currency))
        ? word(object(r.pricing).currency) : "EUR",
      bookingUrl,
    }];
  }), 5);
}

async function tiqets(context: SearchContext): Promise<Offer[]> {
  const key = process.env.TIQETS_API_KEY?.trim();
  if (!key) return [];
  const url = new URL("https://api.tiqets.com/v2/products");
  url.searchParams.set("city_name", "Budapest");
  url.searchParams.set("lang", "en");
  url.searchParams.set("currency", "EUR");
  url.searchParams.set("page_size", "25");
  url.searchParams.set("page", "1");
  if (!context.broad) url.searchParams.set("query", context.term);
  const payload = await jsonFetch(url.href, {
    headers: { "Authorization": `Token ${key}`, "Accept": "application/json", "User-Agent": "GoToBudapest/1.0" },
  }, 3600);
  const rows = list(object(payload).products);
  return sortedUnique(rows.flatMap((row): Offer[] => {
    const r = object(row);
    const title = word(r.title);
    const id = typeof r.id === "string" || typeof r.id === "number" ? String(r.id) : "";
    const bookingUrl = safeHttps(r.product_url, ["tiqets.com"]);
    if (!id || !/^\d{1,12}$/.test(id) || !title || !bookingUrl || r.sale_status !== "available" ||
      !isBudapestText(word(r.city_name)) || !matchesContext(title, context)) return [];
    return [{
      id: `tiqets:${id}`, provider: "Tiqets", detailUrl: `/tours/tiqets/${id}`, title: label(title, 130),
      description: label(word(r.tagline)) || undefined,
      // Tiqets Essential API does not license image access by default.
      amount: price(r.price), currency: word(r.currency) || "EUR",
      bookingUrl, // Affiliate code is included by Tiqets. Keep URL unchanged.
    }];
  }), 5);
}

/** One fixed-budget read-only request per partner. Cached by Next.js fetch. */
export async function getBudapestOffers(kind: string, slug: string): Promise<Offer[] | undefined> {
  const context = resolveOfferContext(kind, slug);
  if (!context) return undefined;
  const providers = await Promise.allSettled([tourdesk(context), viator(context), tiqets(context)]);
  const groups = providers.map((r) => r.status === "fulfilled" ? r.value : []);
  // Interleave partners; don't allow one provider to fill the entire screen.
  const offers: Offer[] = [];
  for (let i = 0; i < 5; i++) {
    for (const group of groups) {
      if (group[i]) offers.push(group[i]);
    }
  }
  return sortedUnique(offers, 12);
}
