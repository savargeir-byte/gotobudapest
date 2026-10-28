// TourDesk catalogue for the Budapest marketplace. READ-ONLY: POST /TourSearch only.
//
// DISCOVERY is delegated to lib/tourdesk/discovery.ts (adapted from goTene catalog.ts):
// geolocation search (page 0, pageSize 500, totalCount validated), then a bounded global scan, never
// relying only on free-text search. The discovered Budapest subset is cached
// (lib/tourdesk/discovery-cache.ts) and the marketplace paging, search, category, price and duration
// handling below runs over that cached subset instead of calling /TourSearch for every page.
//
// API limits (swagger + both references): no ratings, no sorting, and the price/tags/region
// filters are not reliable, so price and duration are applied locally on the supplied values.
// A TourDesk account is scoped to its own inventory: if it has no Budapest products the status is
// "empty" with the strategies that ran, and nothing from other destinations is ever shown.
import { safeTourdeskUrl } from "../../booking/checkout";
import { isBudapestText, label, object, price, safeHttps, word } from "../../budapest-offers";
import {
  DiscoveryAuthError,
  DiscoveryHttpError,
  DiscoveryUnavailableError,
  failureDetail,
  attemptsSummary,
  describeDiscovery,
  guardRow,
  type DiscoveryResult,
} from "../../tourdesk/discovery";
import { getBudapestCatalogue } from "../../tourdesk/discovery-cache";
import { CATEGORY_TERM, classify, inCategory, relevant } from "../categories";
import { MARKETPLACE_CURRENCY, type MarketplaceProduct, type MarketplaceQuery } from "../types";
import { formatMoney, inDurationBucket } from "../util";
import { disabledPage, type ProviderArgs, type ProviderPage } from "./types";

// Kept for the free-text strategy (TOURDESK_DISCOVERY=text) and for tests.
export function tourdeskTerm(query: MarketplaceQuery): string {
  const extra = query.q || (query.category ? CATEGORY_TERM[query.category] : "");
  return extra ? `Budapest ${extra}` : "Budapest";
}

export function mapTourdeskItem(row: unknown, opts: { geo?: boolean } = {}): MarketplaceProduct | undefined {
  const r = object(row);
  const title = word(r.title);
  const summary = label(word(r.description), 220);
  const bookingUrl = safeTourdeskUrl(r.tourUrl);
  const key = word(r.uniqueKey);
  // The account catalogue can contain other destinations: never mislabel them as Budapest. Rows found
  // by the geolocation search are location-filtered by TourDesk and pass the discovery guard instead
  // of the plain text check (a Budapest marker or city is still required).
  const budapest = opts.geo ? guardRow(r, "geo") === "admit" : isBudapestText(`${title} ${summary}`);
  if (!key || !/^\d{1,12}-\d{1,8}$/.test(key) || !title || !bookingUrl || !budapest) return undefined;
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
    detailUrl: `/tours/tourdesk/${key}`,
    bookingUrl,
  };
}

// Stable order over the cached subset (TourDesk has no sort): bestsellers, then recommended, then the
// order TourDesk returned them, so a cursor over a page number stays meaningful between requests.
function orderedProducts(cat: DiscoveryResult): MarketplaceProduct[] {
  const geo = cat.strategy === "geo";
  const seen = new Set<string>();
  return cat.rows
    .map((row, index) => {
      const r = object(row);
      const p = mapTourdeskItem(row, { geo });
      return p ? { p, index, rank: r.isBestSeller === true ? 0 : r.isRecommended === true ? 1 : 2 } : undefined;
    })
    .filter((x): x is { p: MarketplaceProduct; index: number; rank: number } => Boolean(x))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((x) => x.p)
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
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

  let cat: DiscoveryResult;
  try {
    cat = await getBudapestCatalogue();
  } catch (e) {
    if (e instanceof DiscoveryAuthError) {
      console.warn(`[offers] tourdesk discovery rejected: status=${e.status || "no-key"}`);
      return { items: [], status: { status: "error", count: 0, note: "TourDesk rejected the credentials" }, rawCount: 0 };
    }
    // Non-secret diagnosis for the runtime logs: the strategies tried and their HTTP statuses.
    const attempts =
      e instanceof DiscoveryUnavailableError
        ? attemptsSummary(e.attempts)
        : e instanceof DiscoveryHttpError
          ? `request ${failureDetail(e)}`
          : "";
    console.warn(
      `[offers] tourdesk discovery unavailable: ${e instanceof Error ? e.name : "unknown"}${e instanceof DiscoveryHttpError ? ` status=${e.status ?? "no response"}` : ""} ${attempts}`.trim(),
    );
    // The note is public (the search API returns it): it carries the strategies and HTTP statuses so the
    // real failure is visible without log access, and nothing else.
    return {
      items: [],
      status: { status: "error", count: 0, note: attempts ? `TourDesk is temporarily unavailable (${attempts})` : "TourDesk is temporarily unavailable" },
      rawCount: 0,
    };
  }

  const all = orderedProducts(cat);
  if (!all.length)
    return {
      items: [],
      status: { status: "empty", count: 0, note: describeDiscovery(cat) },
      rawCount: 0,
    };

  const filtered = all
    .filter((p) => relevant(`${p.title} ${p.summary ?? ""}`, query.q))
    .filter((p) => !query.category || inCategory(`${p.title} ${p.summary ?? ""}`, query.category))
    .filter((p) => {
      if (query.priceMin !== undefined || query.priceMax !== undefined) {
        if (!p.price || p.price.currency !== MARKETPLACE_CURRENCY) return false;
        if (query.priceMin !== undefined && p.price.amount < query.priceMin) return false;
        if (query.priceMax !== undefined && p.price.amount > query.priceMax) return false;
      }
      return !query.duration || inDurationBucket(p.durationMinutes, query.duration);
    });

  const start = Math.max(0, (position - 1) * size);
  const items = filtered.slice(start, start + size);
  const more = start + size < filtered.length;
  const priced = query.priceMin !== undefined || query.priceMax !== undefined || query.duration;
  const discovery = describeDiscovery(cat);
  return {
    items,
    status: {
      status: filtered.length ? "ok" : "empty",
      count: items.length,
      total: filtered.length,
      ...(priced
        ? { note: "Price filter compares EUR prices only; TourDesk lists some products in other currencies" }
        : discovery
          ? { note: discovery }
          : {}),
    },
    next: more ? position + 1 : undefined,
    rawCount: items.length,
  };
}
