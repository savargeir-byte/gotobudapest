import {
  CATEGORIES,
  DURATIONS,
  PROVIDERS,
  SORTS,
  type CategoryKey,
  type DurationKey,
  type MarketplaceQuery,
  type Provider,
  type SortKey,
} from "./types";

// Every query parameter is whitelisted, length-limited and clamped before it can
// reach a provider request. Unknown parameters are ignored.
type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function get(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

const category = new Set<string>(CATEGORIES.map((c) => c.key));
const duration = new Set<string>(DURATIONS.map((d) => d.key));
const MAX_PRICE = 5000;

function money(v: string | undefined): number | undefined {
  if (!v || !/^\d{1,5}(\.\d{1,2})?$/.test(v)) return undefined;
  const n = Number(v);
  return n >= 0 && n <= MAX_PRICE ? n : undefined;
}

export function parseQuery(p: Params): MarketplaceQuery {
  const q = (get(p, "q") ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const cat = get(p, "category");
  const prov = get(p, "provider");
  const sort = get(p, "sort");
  const dur = get(p, "duration");
  const rating = Number(get(p, "rating"));
  const cursor = get(p, "cursor");
  let priceMin = money(get(p, "priceMin"));
  let priceMax = money(get(p, "priceMax"));
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax)
    [priceMin, priceMax] = [priceMax, priceMin];
  return {
    ...(q ? { q } : {}),
    ...(cat && category.has(cat) ? { category: cat as CategoryKey } : {}),
    ...(prov && (PROVIDERS as readonly string[]).includes(prov)
      ? { provider: prov as Provider }
      : {}),
    sort:
      sort && (SORTS as readonly string[]).includes(sort)
        ? (sort as SortKey)
        : "relevance",
    ...(priceMin !== undefined ? { priceMin } : {}),
    ...(priceMax !== undefined ? { priceMax } : {}),
    ...(dur && duration.has(dur) ? { duration: dur as DurationKey } : {}),
    ...(rating === 4 || rating === 4.5 ? { minRating: rating } : {}),
    ...(cursor && /^[A-Za-z0-9_-]{1,1600}$/.test(cursor) ? { cursor } : {}),
  };
}

// Canonical, shareable URL parameters (cursor only when asked for).
export function toSearchParams(
  query: MarketplaceQuery,
  withCursor = false,
): URLSearchParams {
  const p = new URLSearchParams();
  if (query.q) p.set("q", query.q);
  if (query.category) p.set("category", query.category);
  if (query.provider) p.set("provider", query.provider);
  if (query.sort !== "relevance") p.set("sort", query.sort);
  if (query.priceMin !== undefined) p.set("priceMin", String(query.priceMin));
  if (query.priceMax !== undefined) p.set("priceMax", String(query.priceMax));
  if (query.duration) p.set("duration", query.duration);
  if (query.minRating) p.set("rating", String(query.minRating));
  if (withCursor && query.cursor) p.set("cursor", query.cursor);
  return p;
}

export function hasFilters(query: MarketplaceQuery): boolean {
  return Boolean(
    query.q ||
      query.category ||
      query.provider ||
      query.priceMin !== undefined ||
      query.priceMax !== undefined ||
      query.duration ||
      query.minRating,
  );
}
