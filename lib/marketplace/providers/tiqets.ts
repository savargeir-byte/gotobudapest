// Tiqets catalogue search for the Budapest marketplace. READ-ONLY (GET /v2/cities and
// GET /v2/products only); affiliate-only: product_url is returned unchanged.
//
// PORTED from goTene src/lib/providers/tiqets/{destinations.ts city lookup + env override +
// memo, adapter.ts search params (sort=popularity, page/page_size, hasMore from the RAW page
// length), normalization.ts host guard}. ADAPTED: Budapest, no coordinates guard (city check),
// and NO images: the Tiqets key tier returns none and none are shown.
import { tiqetsRequest } from "../http";
import {
  isBudapestText,
  label,
  list,
  object,
  price,
  safeHttps,
  word,
} from "../../budapest-offers";
import { CATEGORY_TERM, classify, inCategory } from "../categories";
import { MARKETPLACE_CURRENCY, type MarketplaceProduct, type MarketplaceQuery } from "../types";
import { formatMoney, inDurationBucket, parseDurationMinutes } from "../util";
import { disabledPage, type ProviderArgs, type ProviderPage } from "./types";

const SEARCH_TTL = 900;
const CITIES_TTL = 604800; // 7 days

let memoCityId: string | null | undefined;
export function __resetTiqetsMemo() {
  memoCityId = undefined;
}

export async function resolveBudapestCityId(): Promise<string | null> {
  const override = process.env.TIQETS_BUDAPEST_CITY_ID?.trim();
  if (override && /^\d{1,10}$/.test(override)) return override;
  if (memoCityId !== undefined) return memoCityId;
  try {
    const data = object(await tiqetsRequest("/v2/cities", CITIES_TTL));
    const cities = list(data.cities).map(object);
    const exact = cities.find((c) => word(c.name).toLowerCase() === "budapest");
    const found = exact ?? cities.find((c) => word(c.name).toLowerCase().startsWith("budapest"));
    memoCityId =
      found && (typeof found.id === "number" || /^\d+$/.test(word(found.id))) ? String(found.id) : null;
  } catch {
    memoCityId = null; // taxonomy unavailable: fall back to the existing city_name param
  }
  return memoCityId;
}

export function mapTiqetsProduct(row: unknown): MarketplaceProduct | undefined {
  const r = object(row);
  const id = typeof r.id === "string" || typeof r.id === "number" ? String(r.id) : "";
  const title = word(r.title);
  // Affiliate partner code is included by Tiqets: keep the URL unchanged.
  const bookingUrl = safeHttps(r.product_url, ["tiqets.com"]);
  if (!id || !title || !bookingUrl || r.sale_status !== "available" || !isBudapestText(word(r.city_name)))
    return undefined;

  const amount = price(r.price);
  const currency = /^[A-Z]{3}$/.test(word(r.currency)) ? word(r.currency) : MARKETPLACE_CURRENCY;
  const ratings = object(r.ratings);
  const rating =
    typeof ratings.average === "number" && ratings.average > 0 && ratings.average <= 5 &&
    typeof ratings.total === "number" && ratings.total > 0
      ? { value: Math.round(ratings.average * 10) / 10, count: Math.round(ratings.total) }
      : undefined;
  const durationMinutes = parseDurationMinutes(r.duration);
  const durationLabel = word(r.duration).slice(0, 40) || undefined;
  const cancel = object(r.cancellation);
  const policy = word(cancel.policy).toLowerCase();
  const summary = label(word(r.tagline) || word(r.summary), 220) || undefined;
  return {
    id: `tiqets:${id}`,
    provider: "tiqets",
    providerKey: id,
    title: label(title, 130),
    ...(summary ? { summary } : {}),
    // No image: the Tiqets key tier does not license image access.
    ...(amount !== undefined
      ? { price: { amount, currency, label: `From ${formatMoney(amount, currency)}` } }
      : {}),
    ...(rating ? { rating } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(durationLabel ? { durationLabel } : {}),
    ...(/flex|refund/.test(policy) ? { freeCancellation: true } : {}),
    categories: classify(`${title} ${summary ?? ""}`),
    bookingUrl,
  };
}

function localFilter(items: MarketplaceProduct[], q: MarketplaceQuery): MarketplaceProduct[] {
  return items.filter((p) => {
    if (q.priceMin !== undefined || q.priceMax !== undefined) {
      if (!p.price || p.price.currency !== MARKETPLACE_CURRENCY) return false;
      if (q.priceMin !== undefined && p.price.amount < q.priceMin) return false;
      if (q.priceMax !== undefined && p.price.amount > q.priceMax) return false;
    }
    if (q.duration && !inDurationBucket(p.durationMinutes, q.duration)) return false;
    if (q.minRating && (!p.rating || p.rating.value < q.minRating)) return false;
    if (q.category && !inCategory(`${p.title} ${p.summary ?? ""}`, q.category)) return false;
    return true;
  });
}

export async function searchTiqets({ query, position, size }: ProviderArgs): Promise<ProviderPage> {
  if (!process.env.TIQETS_API_KEY?.trim()) return disabledPage("Not configured on this deployment");
  try {
    const cityId = await resolveBudapestCityId();
    const params = new URLSearchParams();
    if (cityId) params.set("city_id", cityId);
    else params.set("city_name", "Budapest");
    params.set("lang", "en");
    params.set("currency", MARKETPLACE_CURRENCY);
    params.set("page_size", String(size));
    params.set("page", String(position));
    // Tiqets only sorts by popularity; other sorts are applied to the returned page.
    params.set("sort", "popularity");
    const term = [query.q, !query.q && query.category ? CATEGORY_TERM[query.category] : ""]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (term) params.set("query", term);

    const data = object(await tiqetsRequest(`/v2/products?${params.toString()}`, SEARCH_TTL));
    const rows = list(data.products);
    const total = typeof object(data.pagination).total === "number" ? (object(data.pagination).total as number) : undefined;
    const mapped = rows.map(mapTiqetsProduct).filter((p): p is MarketplaceProduct => Boolean(p));
    const items = localFilter(mapped, query);
    // hasMore is decided by the RAW page (goTene): local filtering never ends paging.
    const more = typeof total === "number" ? position * size < total : rows.length === size;
    const filtered = query.priceMin !== undefined || query.priceMax !== undefined || query.duration || query.minRating;
    return {
      items,
      status: {
        status: items.length ? "ok" : "empty",
        count: items.length,
        ...(total !== undefined ? { total } : {}),
        ...(filtered ? { note: "Price, duration and rating filters are applied to the returned page" } : {}),
      },
      next: more ? position + 1 : undefined,
      rawCount: rows.length,
    };
  } catch {
    return { items: [], status: { status: "error", count: 0, note: "Tiqets is temporarily unavailable" }, rawCount: 0 };
  }
}
