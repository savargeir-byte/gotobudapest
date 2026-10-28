import { hasFilters, toSearchParams } from "./query";
import {
  CAPABILITIES,
  CATEGORIES,
  DURATIONS,
  PROVIDERS,
  PROVIDER_LABEL,
  SORT_LABEL,
  type MarketplaceProduct,
  type MarketplaceQuery,
  type MarketplaceResult,
  type Provider,
  type SortKey,
} from "./types";

// Pure helpers shared by the /tours page, the contextual tour rows and their tests.
// They only describe what the backend contract says: nothing here invents data.

export type Controls = {
  price: boolean;
  duration: boolean;
  rating: boolean;
  sorts: SortKey[]; // always includes "relevance"
};

const scope = (provider?: Provider): Provider[] => (provider ? [provider] : [...PROVIDERS]);

// A control is offered when at least one provider in scope can honour it (server side or,
// where the provider supplies the value, on the returned page). Duration sorting is never
// offered (not supported or verified).
export function visibleControls(provider?: Provider): Controls {
  const list = scope(provider);
  const sorts = new Set<SortKey>(["relevance"]);
  for (const p of list) for (const s of CAPABILITIES[p].sort) sorts.add(s);
  const order: SortKey[] = ["relevance", "rating", "popularity", "price_asc", "price_desc"];
  return {
    // Tiqets and TourDesk supply price/duration (applied to the page they return); only
    // TourDesk has no ratings at all.
    price: list.some((p) => CAPABILITIES[p].price || p === "tiqets" || p === "tourdesk"),
    duration: list.some((p) => CAPABILITIES[p].duration || p === "tiqets" || p === "tourdesk"),
    rating: list.some((p) => CAPABILITIES[p].rating),
    sorts: order.filter((s) => sorts.has(s)),
  };
}

export type FilterKey = "price" | "duration" | "rating" | "sort";

// Honest, per-filter explanation of which providers apply it how. Shown next to the control.
export function capabilityNote(key: FilterKey, provider?: Provider): string | undefined {
  const list = scope(provider);
  const names = (ps: Provider[]) => ps.map((p) => PROVIDER_LABEL[p]).join(" and ");
  if (key === "price" || key === "duration") {
    const server = list.filter((p) => CAPABILITIES[p][key]);
    const page = list.filter((p) => !CAPABILITIES[p][key]);
    if (!page.length) return undefined;
    return server.length
      ? `${names(server)} apply this before paging. ${names(page)} are filtered on the page of results they return, using the values they supply; products without that value are hidden while the filter is on.`
      : `${names(page)} are filtered on the page of results they return, using the values they supply; products without that value are hidden while the filter is on.`;
  }
  if (key === "rating") {
    const none = list.filter((p) => !CAPABILITIES[p].rating);
    const page = list.filter((p) => p === "tiqets");
    const parts: string[] = [];
    if (page.length) parts.push(`${names(page)} ratings are checked on the page returned.`);
    if (none.length) parts.push(`${names(none)} supplies no ratings, so its products are hidden while a rating filter is on.`);
    return parts.join(" ") || undefined;
  }
  // sort
  const lacking = list.filter((p) => CAPABILITIES[p].sort.length <= 1);
  const mixed = list.length > 1;
  const parts: string[] = [];
  if (mixed)
    parts.push("With several providers, sorting orders each page of results; it is not a global ranking of every product.");
  if (lacking.length)
    parts.push(`${names(lacking)} cannot sort; its products are placed within each page by the values it supplies.`);
  return parts.join(" ") || undefined;
}

export type Chip = { key: string; label: string; remove: Partial<MarketplaceQuery> & { clear?: (keyof MarketplaceQuery)[] } };

const money = (n: number) => `€${n % 1 === 0 ? n : n.toFixed(2)}`;

export function filterChips(q: MarketplaceQuery): Chip[] {
  const chips: Chip[] = [];
  if (q.q) chips.push({ key: "q", label: `“${q.q}”`, remove: { clear: ["q"] } });
  if (q.category) {
    const c = CATEGORIES.find((x) => x.key === q.category);
    chips.push({ key: "category", label: c?.label ?? q.category, remove: { clear: ["category"] } });
  }
  if (q.provider) chips.push({ key: "provider", label: PROVIDER_LABEL[q.provider], remove: { clear: ["provider"] } });
  if (q.priceMin !== undefined || q.priceMax !== undefined) {
    const label =
      q.priceMin !== undefined && q.priceMax !== undefined
        ? `${money(q.priceMin)} – ${money(q.priceMax)}`
        : q.priceMin !== undefined
          ? `From ${money(q.priceMin)}`
          : `Up to ${money(q.priceMax!)}`;
    chips.push({ key: "price", label, remove: { clear: ["priceMin", "priceMax"] } });
  }
  if (q.duration) {
    const d = DURATIONS.find((x) => x.key === q.duration);
    chips.push({ key: "duration", label: d?.label ?? q.duration, remove: { clear: ["duration"] } });
  }
  if (q.minRating) chips.push({ key: "rating", label: `${q.minRating}★ and up`, remove: { clear: ["minRating"] } });
  if (q.sort !== "relevance") chips.push({ key: "sort", label: SORT_LABEL[q.sort], remove: { sort: "relevance" } });
  return chips;
}

export function withoutChip(q: MarketplaceQuery, chip: Chip): MarketplaceQuery {
  const next: MarketplaceQuery = { ...q, cursor: undefined };
  for (const k of chip.remove.clear ?? []) delete next[k];
  if (chip.remove.sort) next.sort = chip.remove.sort;
  return next;
}

// Number of active filters for the mobile "Filters (n)" button (the search text and the
// category tabs are visible outside the drawer, so they are not counted).
export function activeFilterCount(q: MarketplaceQuery): number {
  return (
    (q.provider ? 1 : 0) +
    (q.priceMin !== undefined || q.priceMax !== undefined ? 1 : 0) +
    (q.duration ? 1 : 0) +
    (q.minRating ? 1 : 0) +
    (q.sort !== "relevance" ? 1 : 0)
  );
}

export function apiUrl(q: MarketplaceQuery, cursor?: string): string {
  const p = toSearchParams(q);
  if (cursor) p.set("cursor", cursor);
  const s = p.toString();
  return `/api/marketplace/search${s ? `?${s}` : ""}`;
}

// Shareable page URL (the cursor is never part of it).
export function pageUrl(q: MarketplaceQuery, base = "/tours"): string {
  const s = toSearchParams(q).toString();
  return s ? `${base}?${s}` : base;
}

// Append a page of results without duplicating a product already shown.
export function mergeItems(existing: MarketplaceProduct[], incoming: MarketplaceProduct[]): MarketplaceProduct[] {
  const seen = new Set(existing.map((i) => i.id));
  const out = [...existing];
  for (const i of incoming) {
    if (seen.has(i.id)) continue;
    seen.add(i.id);
    out.push(i);
  }
  return out;
}

// Result-count line. Totals are only summed when every contributing provider supplied one
// and no filter that is applied to the returned page (or by title/tag) is active, because
// only then "about N" is meaningful. Otherwise the line states only what was received.
export function countLine(result: MarketplaceResult, q: MarketplaceQuery, shown: number): string {
  const contributing = PROVIDERS.filter((p) => result.providers[p].status === "ok" || result.providers[p].status === "empty");
  const totals = contributing.map((p) => result.providers[p].total);
  const filtered = Boolean(q.q || q.category || q.priceMin !== undefined || q.priceMax !== undefined || q.duration || q.minRating);
  if (!filtered && contributing.length && totals.every((t) => typeof t === "number")) {
    const sum = (totals as number[]).reduce((a, b) => a + b, 0);
    const from = contributing.length === 1 ? PROVIDER_LABEL[contributing[0]] : `${contributing.length} providers`;
    return `Showing ${shown} of about ${sum.toLocaleString("en-GB")} products from ${from}`;
  }
  return shown === 1 ? "Showing 1 result" : `Showing ${shown} results`;
}

export type Degraded = { provider: Provider; text: string };

// Provider problems worth telling the visitor about (healthy providers are not listed).
export function degradedProviders(result: MarketplaceResult, q: MarketplaceQuery): Degraded[] {
  const out: Degraded[] = [];
  for (const p of PROVIDERS) {
    if (q.provider && q.provider !== p) continue;
    const s = result.providers[p];
    if (s.status === "error")
      out.push({
        provider: p,
        // With one provider selected nothing else is shown: never promise "other providers".
        text: q.provider
          ? `${PROVIDER_LABEL[p]} is temporarily unavailable, so no ${PROVIDER_LABEL[p]} products can be shown right now. Choose "All providers" to see the rest.`
          : `${PROVIDER_LABEL[p]} is temporarily unavailable. Results from the other providers are still shown.`,
      });
    else if (s.status === "empty" && p === "tourdesk" && !q.q && !q.category && !hasFilters({ ...q, provider: undefined, sort: "relevance" }))
      out.push({ provider: p, text: "TourDesk returned no Budapest products for this account right now." });
    else if (s.status === "disabled") out.push({ provider: p, text: `${PROVIDER_LABEL[p]} is not configured on this deployment.` });
  }
  return out;
}

export function allProvidersDown(result: MarketplaceResult, q: MarketplaceQuery): boolean {
  const asked = PROVIDERS.filter((p) => !q.provider || q.provider === p);
  return asked.every((p) => result.providers[p].status === "error");
}

// Latest-request-wins gate: every started request gets an id and only the latest may apply
// its response, so a slow earlier search can never replace a newer one.
export function createRequestGate() {
  let current = 0;
  return {
    next: () => ++current,
    isCurrent: (id: number) => id === current,
    invalidate: () => ++current,
  };
}
