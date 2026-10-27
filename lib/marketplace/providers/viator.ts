// Viator catalogue search for the Budapest marketplace. READ-ONLY: this module calls
// only /destinations, /products/tags, /products/search and /search/freetext. It never
// calls availability, booking, hold or reserve endpoints.
//
// PORTED from IcelandTripGuide src/lib/viator/{search.ts buildSearchBody, listingQuery.ts
// SORTING/filters} and goTene src/lib/providers/viator/{tags.ts resolveTagIds, adapter.ts
// tag fallback}. ADAPTED: Budapest destination, EUR, Budapest category patterns.
// productUrl is returned byte-for-byte (affiliate parameters are never rewritten).
import { viatorRequest } from "../../booking/products";
import { ProviderError } from "../../booking/common";
import {
  isBudapestText,
  label,
  list,
  object,
  price,
  safeHttps,
  viatorDestinationId,
  word,
} from "../../budapest-offers";
import { CATEGORY_TAG_PATTERNS, classify, inCategory, relevant } from "../categories";
import { MARKETPLACE_CURRENCY, type MarketplaceProduct, type MarketplaceQuery } from "../types";
import { formatMoney, inDurationBucket, minutesLabel, ttl } from "../util";
import { DURATIONS } from "../types";
import { disabledPage, type ProviderArgs, type ProviderPage } from "./types";

const SEARCH_TTL = 900;
const TAXONOMY_TTL = 604800; // 7 days

export type ViatorSorting = { sort: string; order?: string };

// IcelandTripGuide listingQuery.ts SORTING: DEFAULT (featured) is sent WITHOUT order,
// TRAVELER_RATING supports DESCENDING only, PRICE both directions.
export function viatorSorting(sort: MarketplaceQuery["sort"]): ViatorSorting {
  switch (sort) {
    case "rating":
      return { sort: "TRAVELER_RATING", order: "DESCENDING" };
    case "price_asc":
      return { sort: "PRICE", order: "ASCENDING" };
    case "price_desc":
      return { sort: "PRICE", order: "DESCENDING" };
    default:
      return { sort: "DEFAULT" };
  }
}

export function buildViatorSearchBody(
  query: MarketplaceQuery,
  destination: string,
  start: number,
  count: number,
  tagIds: number[] = [],
) {
  const d = query.duration ? DURATIONS.find((x) => x.key === query.duration)! : undefined;
  return {
    filtering: {
      destination,
      ...(tagIds.length ? { tags: tagIds } : {}),
      ...(query.priceMin !== undefined ? { lowestPrice: query.priceMin } : {}),
      ...(query.priceMax !== undefined ? { highestPrice: query.priceMax } : {}),
      ...(d
        ? {
            durationInMinutes: {
              from: d.fromMin,
              ...(d.toMin !== null ? { to: d.toMin } : {}),
            },
          }
        : {}),
      ...(query.minRating ? { rating: { from: query.minRating } } : {}),
    },
    sorting: viatorSorting(query.sort),
    pagination: { start, count },
    currency: MARKETPLACE_CURRENCY,
  };
}

// ---------------------------------------------------------------- tag taxonomy
export type ViatorTag = { id: number; name: string; parentTagIds: number[] };

export async function getViatorTags(): Promise<Map<number, ViatorTag>> {
  const map = new Map<number, ViatorTag>();
  try {
    const data = object(await viatorRequest("/products/tags", {}, ttl(TAXONOMY_TTL)));
    for (const row of list(data.tags)) {
      const t = object(row);
      if (typeof t.tagId !== "number") continue;
      const names = object(t.allNamesByLocale);
      const name = word(t.name) || word(names["en-US"]) || word(names.en) || word(Object.values(names)[0]);
      map.set(t.tagId, {
        id: t.tagId,
        name,
        parentTagIds: list(t.parentTagIds).filter((x): x is number => typeof x === "number"),
      });
    }
  } catch {
    // Taxonomy unavailable: no tag filter, the caller falls back to text classification.
  }
  return map;
}

// goTene tags.ts resolveTagIds: seeds are tags whose NAME matches a pattern, plus
// every descendant of a seed. Pure (unit-tested).
export function resolveTagIds(tags: Map<number, ViatorTag>, patterns: string[]): number[] {
  if (!patterns.length || tags.size === 0) return [];
  const seeds = new Set<number>();
  for (const t of tags.values()) {
    const n = t.name.toLowerCase();
    if (patterns.some((p) => n.includes(p))) seeds.add(t.id);
  }
  if (seeds.size === 0) return [];
  const result = new Set<number>(seeds);
  const hitsSeed = (id: number, seen: Set<number>): boolean => {
    const t = tags.get(id);
    if (!t) return false;
    for (const p of t.parentTagIds) {
      if (seeds.has(p)) return true;
      if (!seen.has(p)) {
        seen.add(p);
        if (hitsSeed(p, seen)) return true;
      }
    }
    return false;
  };
  for (const t of tags.values()) {
    if (!result.has(t.id) && hitsSeed(t.id, new Set())) result.add(t.id);
  }
  return [...result];
}

// -------------------------------------------------------------------- mapping
export function mapViatorProduct(
  row: unknown,
  destination: string,
): MarketplaceProduct | undefined {
  const r = object(row);
  const code = word(r.productCode);
  const title = word(r.title);
  // The Viator API returns an affiliate-ready productUrl. NEVER construct one.
  const bookingUrl = safeHttps(r.productUrl, ["viator.com"]);
  const destinations = list(r.destinations).map(object);
  const matchesCity =
    destinations.some((d) => String(d.ref) === destination) ||
    isBudapestText(`${title} ${word(r.description)}`);
  // Internal product page required: an unusable product code means the product is dropped.
  if (!code || !/^[A-Za-z0-9]{3,50}$/.test(code) || !title || !bookingUrl || !matchesCity) return undefined;

  const images = list(r.images).map(object);
  const cover = images.find((i) => i.isCover === true) || images[0];
  const variants = list(cover?.variants).map(object);
  const src = [...variants]
    .sort((a, b) => Number(b.width || 0) - Number(a.width || 0))
    .map((v) => safeHttps(v.url))
    .find(Boolean);
  // A variant near card width (smallest >= 480 px): cards never fetch the full-size photo.
  const small = [...variants]
    .filter((v) => Number(v.width || 0) >= 480)
    .sort((a, b) => Number(a.width || 0) - Number(b.width || 0))
    .map((v) => safeHttps(v.url))
    .find(Boolean);

  const pricing = object(r.pricing);
  const from = price(object(pricing.summary).fromPrice);
  const currency = /^[A-Z]{3}$/.test(word(pricing.currency)) ? word(pricing.currency) : MARKETPLACE_CURRENCY;

  const reviews = object(r.reviews);
  const avg = reviews.combinedAverageRating;
  const total = reviews.totalReviews;
  const rating =
    typeof avg === "number" && avg > 0 && avg <= 5 && typeof total === "number" && total > 0
      ? { value: Math.round(avg * 10) / 10, count: Math.round(total) }
      : undefined;

  const dur = object(r.duration);
  const fixed = typeof dur.fixedDurationInMinutes === "number" ? dur.fixedDurationInMinutes : undefined;
  const from_ = typeof dur.variableDurationFromMinutes === "number" ? dur.variableDurationFromMinutes : undefined;
  const to_ = typeof dur.variableDurationToMinutes === "number" ? dur.variableDurationToMinutes : undefined;
  const durationMinutes = fixed ?? from_;
  const durationLabel =
    fixed !== undefined
      ? minutesLabel(fixed)
      : from_ !== undefined && to_ !== undefined
        ? `${minutesLabel(from_)}–${minutesLabel(to_)}`
        : from_ !== undefined
          ? `${minutesLabel(from_)}+`
          : undefined;

  const summary = label(word(r.description), 220) || undefined;
  const flags = list(r.flags).map((f) => word(f));
  return {
    id: `viator:${code}`,
    provider: "viator",
    providerKey: code,
    title: label(title, 130),
    ...(summary ? { summary } : {}),
    ...(src
      ? { image: { src, alt: label(title, 130), ...(small && small !== src ? { small } : {}) } }
      : {}),
    ...(from !== undefined
      ? { price: { amount: from, currency, label: `From ${formatMoney(from, currency)}` } }
      : {}),
    ...(rating ? { rating } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(durationLabel ? { durationLabel } : {}),
    ...(flags.includes("FREE_CANCELLATION") ? { freeCancellation: true } : {}),
    categories: classify(`${title} ${summary ?? ""}`),
    detailUrl: `/tours/viator/${code}`,
    bookingUrl,
  };
}

// Filters the freetext endpoint cannot be trusted to apply are applied locally, only
// on values the API supplied. A product lacking the data is excluded while the
// filter is active: it is never guessed.
function localFilter(items: MarketplaceProduct[], q: MarketplaceQuery): MarketplaceProduct[] {
  return items.filter((p) => {
    if (q.priceMin !== undefined || q.priceMax !== undefined) {
      if (!p.price || p.price.currency !== MARKETPLACE_CURRENCY) return false;
      if (q.priceMin !== undefined && p.price.amount < q.priceMin) return false;
      if (q.priceMax !== undefined && p.price.amount > q.priceMax) return false;
    }
    if (q.duration && !inDurationBucket(p.durationMinutes, q.duration)) return false;
    if (q.minRating && (!p.rating || p.rating.value < q.minRating)) return false;
    return true;
  });
}

function fail(): ProviderPage {
  return { items: [], status: { status: "error", count: 0, note: "Viator is temporarily unavailable" }, rawCount: 0 };
}

export async function searchViator({ query, position, size }: ProviderArgs): Promise<ProviderPage> {
  const key = process.env.VIATOR_API_KEY?.trim();
  if (!key) return disabledPage("Not configured on this deployment");
  let destination: string | undefined;
  try {
    destination = await viatorDestinationId(key);
  } catch {
    return fail();
  }
  // Never query every country without a Budapest destination filter.
  if (!destination)
    return { items: [], status: { status: "error", count: 0, note: "Budapest destination not found" }, rawCount: 0 };

  const campaign = (process.env.VIATOR_CAMPAIGN_VALUE || "gotobudapest").trim().slice(0, 80);
  const campaignParam = campaign ? `?campaign-value=${encodeURIComponent(campaign)}` : "";

  try {
    let rows: unknown[];
    let total: number | undefined;
    let freetext = false;
    let classifierFallback = false;

    if (query.q) {
      freetext = true;
      const term = `Budapest ${query.q}`;
      const data = object(
        await viatorRequest(
          `/search/freetext${campaignParam}`,
          {
            method: "POST",
            body: JSON.stringify({
              searchTerm: term,
              searchTypes: [{ searchType: "PRODUCTS", pagination: { start: position, count: size } }],
              currency: MARKETPLACE_CURRENCY,
              productFiltering: { destination },
            }),
          },
          ttl(SEARCH_TTL),
        ),
      );
      const products = object(data.products);
      rows = list(products.results);
      total = typeof products.totalCount === "number" ? products.totalCount : undefined;
    } else {
      let tagIds: number[] = [];
      if (query.category) {
        tagIds = resolveTagIds(await getViatorTags(), CATEGORY_TAG_PATTERNS[query.category]);
      }
      const run = async (tags: number[]) =>
        object(
          await viatorRequest(
            `/products/search${campaignParam}`,
            {
              method: "POST",
              body: JSON.stringify(buildViatorSearchBody(query, destination!, position, size, tags)),
            },
            ttl(SEARCH_TTL),
          ),
        );
      let data: Record<string, unknown>;
      try {
        data = await run(tagIds);
        // goTene adapter: never let the optional tag filter break a page; fall back
        // to the unfiltered search when it empties the first page.
        if (tagIds.length && position === 1 && list(data.products).length === 0) {
          data = await run([]);
          classifierFallback = true;
        }
      } catch (e) {
        if (!tagIds.length) throw e;
        data = await run([]);
        classifierFallback = true;
      }
      if (query.category && !tagIds.length) classifierFallback = true;
      rows = list(data.products);
      total = typeof data.totalCount === "number" ? data.totalCount : undefined;
    }

    const mapped = rows
      .map((row) => mapViatorProduct(row, destination!))
      .filter((p): p is MarketplaceProduct => Boolean(p));
    let items = mapped;
    if (freetext) {
      items = items.filter((p) => relevant(`${p.title} ${p.summary ?? ""}`, query.q));
      items = localFilter(items, query);
    }
    if (query.category && (freetext || classifierFallback)) {
      items = items.filter((p) => inCategory(`${p.title} ${p.summary ?? ""}`, query.category!));
    }
    const nextStart = position + size;
    const more = typeof total === "number" ? nextStart <= total : rows.length === size;
    return {
      items,
      status: {
        status: items.length ? "ok" : "empty",
        count: items.length,
        ...(total !== undefined ? { total } : {}),
        ...(freetext && (query.priceMin !== undefined || query.priceMax !== undefined || query.duration || query.minRating)
          ? { note: "Price, duration and rating filters are applied to the returned page" }
          : {}),
      },
      next: more ? nextStart : undefined,
      rawCount: rows.length,
    };
  } catch (e) {
    if (e instanceof ProviderError || e instanceof Error) return fail();
    return fail();
  }
}
