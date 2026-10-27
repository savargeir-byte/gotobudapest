// TourDesk catalogue search for the Budapest marketplace. READ-ONLY: POST /TourSearch only.
//
// PORTED from GoIceTravel src/lib/tourdesk/search.ts (searchTours, page 1.., pageSize 20 because
// larger sizes make paging unstable) and goTene catalog.ts (never trust an incomplete
// totalCount). ADAPTED: Budapest text discovery with the Budapest-text guard. A TourDesk account
// is scoped to its own inventory; if the account has no Budapest products the status is "empty"
// and nothing from other destinations is ever shown.
//
// API limits (swagger + both references): no ratings, no sorting, and the price/tags/region
// filters are not reliable, so price and duration are applied locally on the supplied values.
import { tdRequest } from "../../booking/products";
import { safeTourdeskUrl } from "../../booking/checkout";
import { isBudapestText, label, list, object, price, safeHttps, word } from "../../budapest-offers";
import { CATEGORY_TERM, classify, inCategory, relevant } from "../categories";
import { MARKETPLACE_CURRENCY, type MarketplaceProduct, type MarketplaceQuery } from "../types";
import { formatMoney, inDurationBucket } from "../util";
import { disabledPage, type ProviderArgs, type ProviderPage } from "./types";

const SEARCH_TTL = 900;

export function tourdeskTerm(query: MarketplaceQuery): string {
  const extra = query.q || (query.category ? CATEGORY_TERM[query.category] : "");
  return extra ? `Budapest ${extra}` : "Budapest";
}

export function mapTourdeskItem(row: unknown): MarketplaceProduct | undefined {
  const r = object(row);
  const title = word(r.title);
  const summary = label(word(r.description), 220);
  const bookingUrl = safeTourdeskUrl(r.tourUrl);
  const key = word(r.uniqueKey);
  // The account catalogue can contain other destinations: never mislabel them as Budapest.
  if (!key || !title || !bookingUrl || !isBudapestText(`${title} ${summary}`)) return undefined;
  const amount = price(r.price);
  const currency = /^[A-Z]{3}$/.test(word(r.currency)) ? word(r.currency) : undefined;
  const minutes = typeof r.duration === "number" && r.duration > 0 ? Math.round(r.duration) : undefined;
  const photo = safeHttps(r.photoUrl);
  const priceLabel = label(word(r.formattedPrice), 36);
  return {
    id: `tourdesk:${key}`,
    provider: "tourdesk",
    providerKey: key,
    title: label(title, 130),
    ...(summary ? { summary } : {}),
    ...(photo ? { image: { src: photo, alt: label(title, 130) } } : {}),
    ...(amount !== undefined && currency
      ? { price: { amount, currency, label: priceLabel || `From ${formatMoney(amount, currency)}` } }
      : {}),
    ...(minutes !== undefined ? { durationMinutes: minutes } : {}),
    ...(word(r.durationFormatted) ? { durationLabel: word(r.durationFormatted).slice(0, 40) } : {}),
    categories: classify(`${title} ${summary}`),
    ...(/^\d{1,12}-\d{1,8}$/.test(key) ? { detailUrl: `/tours/tourdesk/${key}` } : {}),
    bookingUrl,
  };
}

export async function searchTourdesk({ query, position, size }: ProviderArgs): Promise<ProviderPage> {
  if (!process.env.TOURDESK_API_KEY?.trim()) {
    console.warn("[offers] tourdesk skipped: TOURDESK_API_KEY is not configured for this deployment");
    return disabledPage("Not configured on this deployment");
  }
  // TourDesk has no rating data: while a rating filter is active it cannot contribute.
  if (query.minRating)
    return {
      items: [],
      status: { status: "unsupported", count: 0, note: "TourDesk supplies no ratings, so it is excluded while a rating filter is active" },
      rawCount: 0,
    };
  const term = tourdeskTerm(query);
  try {
    const data = object(
      await tdRequest(
        "/TourSearch",
        { method: "POST", body: JSON.stringify({ searchParameter: term, page: position, pageSize: size }) },
        SEARCH_TTL,
        8500,
      ),
    );
    const rows = list(data.activities);
    const total = typeof data.totalCount === "number" ? data.totalCount : undefined;
    const budapestRows = rows.filter((row) => {
      const r = object(row);
      return isBudapestText(`${word(r.title)} ${label(word(r.description))}`);
    }).length;
    console.info(
      `[offers] tourdesk response=ok rows=${rows.length} budapestRows=${budapestRows} term="${term}" page=${position}`,
    );
    // A positive totalCount with an empty first page is not a result set: report it.
    if (position === 1 && rows.length === 0 && (total ?? 0) > 0)
      return { items: [], status: { status: "error", count: 0, total, note: "TourDesk reported results but returned none" }, rawCount: 0 };

    const seen = new Set<string>();
    let items = rows
      .map(mapTourdeskItem)
      .filter((p): p is MarketplaceProduct => Boolean(p))
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .filter((p) => relevant(`${p.title} ${p.summary ?? ""}`, query.q));
    if (query.category) items = items.filter((p) => inCategory(`${p.title} ${p.summary ?? ""}`, query.category!));
    items = items.filter((p) => {
      if (query.priceMin !== undefined || query.priceMax !== undefined) {
        if (!p.price || p.price.currency !== MARKETPLACE_CURRENCY) return false;
        if (query.priceMin !== undefined && p.price.amount < query.priceMin) return false;
        if (query.priceMax !== undefined && p.price.amount > query.priceMax) return false;
      }
      if (query.duration && !inDurationBucket(p.durationMinutes, query.duration)) return false;
      return true;
    });

    const more = rows.length === size && (typeof total === "number" ? position * size < total : true);
    const empty = position === 1 && items.length === 0;
    const filtered = query.priceMin !== undefined || query.priceMax !== undefined || query.duration;
    return {
      items,
      status: {
        status: items.length ? "ok" : "empty",
        count: items.length,
        ...(total !== undefined ? { total } : {}),
        ...(empty && rows.length === 0
          ? { note: "No Budapest inventory returned for this account" }
          : filtered
            ? { note: "Price and duration filters are applied to the returned page (EUR prices only)" }
            : {}),
      },
      next: more ? position + 1 : undefined,
      rawCount: rows.length,
    };
  } catch {
    return { items: [], status: { status: "error", count: 0, note: "TourDesk is temporarily unavailable" }, rawCount: 0 };
  }
}
