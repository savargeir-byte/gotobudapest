// Aggregation of the three providers into one provider-neutral result page.
//
// PORTED from goTene providers/registry.ts: parallel providers with per-provider error
// isolation, per-provider page sizes, weighted interleave (Viator 2 : Tiqets 1 : TourDesk 1),
// opaque cursor, and conservative cross-provider dedupe (TourDesk wins ties).
// ADAPTED: Budapest only, honest capability handling, local sorting of the merged page
// only where the data exists, and automatic extra rounds when filters empty a page.
import { InvalidCursorError, SEEN_MAX, decodeCursor, encodeCursor, type CursorState } from "./cursor";
import { dedupePage } from "./dedupe";
import { activeProviders } from "./enabled";
import { searchTiqets } from "./providers/tiqets";
import { searchTourdesk } from "./providers/tourdesk";
import type { ProviderArgs, ProviderPage } from "./providers/types";
import { searchViator } from "./providers/viator";
import {
  CAPABILITIES,
  PROVIDERS,
  PROVIDER_LABEL,
  SORT_LABEL,
  type MarketplaceProduct,
  type MarketplaceQuery,
  type MarketplaceResult,
  type Provider,
  type ProviderStatus,
} from "./types";
import { withTimeout } from "./util";

export { InvalidCursorError };

const MULTI_SIZE: Record<Provider, number> = { viator: 18, tiqets: 12, tourdesk: 20 };
const SINGLE_SIZE: Record<Provider, number> = { viator: 24, tiqets: 24, tourdesk: 20 };
const WEIGHT: Record<Provider, number> = { viator: 2, tiqets: 1, tourdesk: 1 };
const MIN_FILL = 6; // fetch more rounds when filtering leaves fewer products than this
const MAX_ROUNDS = 3;

const adapters: Record<Provider, (a: ProviderArgs) => Promise<ProviderPage>> = {
  viator: searchViator,
  tiqets: searchTiqets,
  tourdesk: searchTourdesk,
};

const timeoutMs = () => {
  const n = Number(process.env.MARKETPLACE_PROVIDER_TIMEOUT_MS);
  return Number.isInteger(n) && n >= 500 && n <= 30000 ? n : 9000;
};

function weightedMerge(lists: Record<Provider, MarketplaceProduct[]>): MarketplaceProduct[] {
  const idx: Record<Provider, number> = { viator: 0, tiqets: 0, tourdesk: 0 };
  const out: MarketplaceProduct[] = [];
  let remaining = PROVIDERS.reduce((n, p) => n + lists[p].length, 0);
  while (remaining > 0) {
    for (const p of PROVIDERS) {
      for (let w = 0; w < WEIGHT[p]; w++) {
        if (idx[p] < lists[p].length) {
          out.push(lists[p][idx[p]++]);
          remaining--;
        }
      }
    }
  }
  return out;
}

// Stable local sort of the merged page. Products lacking the field go last.
export function sortPage(items: MarketplaceProduct[], sort: MarketplaceQuery["sort"]): MarketplaceProduct[] {
  const keyed = items.map((p, i) => ({ p, i }));
  const cmp = (a: number | undefined, b: number | undefined, dir: 1 | -1) =>
    a === undefined && b === undefined ? 0 : a === undefined ? 1 : b === undefined ? -1 : (a - b) * dir;
  if (sort === "rating")
    keyed.sort(
      (x, y) =>
        cmp(x.p.rating?.value, y.p.rating?.value, -1) ||
        cmp(x.p.rating?.count, y.p.rating?.count, -1) ||
        x.i - y.i,
    );
  else if (sort === "price_asc" || sort === "price_desc") {
    const dir = sort === "price_asc" ? 1 : -1;
    const amount = (p: MarketplaceProduct) => (p.price?.currency === "EUR" ? p.price.amount : undefined);
    keyed.sort((x, y) => cmp(amount(x.p), amount(y.p), dir) || x.i - y.i);
  } else return items;
  return keyed.map((k) => k.p);
}

export async function searchMarketplace(query: MarketplaceQuery): Promise<MarketplaceResult> {
  const state: CursorState = query.cursor ? decodeCursor(query.cursor, query) : { p: {}, d: [], s: [] };
  // A provider switched off (TourDesk, see enabled.ts) is never requested: no API call, no status, no error.
  const enabled = activeProviders();
  const wanted: Provider[] = (query.provider ? [query.provider] : [...PROVIDERS]).filter((p) => enabled.includes(p));
  const sizes = query.provider ? SINGLE_SIZE : MULTI_SIZE;

  const positions: Record<Provider, number> = {
    viator: state.p.viator ?? 1,
    tiqets: state.p.tiqets ?? 1,
    tourdesk: state.p.tourdesk ?? 1,
  };
  const done = new Set<Provider>(state.d);
  const collected: Record<Provider, MarketplaceProduct[]> = { viator: [], tiqets: [], tourdesk: [] };
  const status: Record<Provider, ProviderStatus> = {
    viator: { status: "skipped", count: 0, note: "Not requested" },
    tiqets: { status: "skipped", count: 0, note: "Not requested" },
    tourdesk: { status: "skipped", count: 0, note: "Not requested" },
  };
  const hasNext: Record<Provider, boolean> = { viator: false, tiqets: false, tourdesk: false };
  const errored = new Set<Provider>();

  for (const p of PROVIDERS) {
    if (!wanted.includes(p)) status[p] = { status: "skipped", count: 0, note: "Filtered out by the provider filter" };
    else if (done.has(p)) status[p] = { status: "skipped", count: 0, note: "No more results" };
  }

  let active = wanted.filter((p) => !done.has(p));
  for (let round = 0; round < MAX_ROUNDS && active.length; round++) {
    const pages = await Promise.all(
      active.map(async (p): Promise<[Provider, ProviderPage]> => {
        try {
          return [p, await withTimeout(adapters[p]({ query, position: positions[p], size: sizes[p] }), timeoutMs())];
        } catch {
          // Provider outage degrades only its own slice; no provider detail is exposed.
          return [p, { items: [], rawCount: 0, status: { status: "error", count: 0, note: `${PROVIDER_LABEL[p]} did not respond in time` } }];
        }
      }),
    );
    const nextActive: Provider[] = [];
    for (const [p, page] of pages) {
      collected[p].push(...page.items);
      const prev = status[p];
      const merged: ProviderStatus = {
        status:
          page.status.status === "error" && collected[p].length === 0
            ? "error"
            : collected[p].length
              ? "ok"
              : page.status.status === "ok"
                ? "empty"
                : page.status.status,
        count: collected[p].length,
        ...(page.status.total !== undefined ? { total: page.status.total } : {}),
        ...(page.status.note ? { note: page.status.note } : prev.note && prev.status !== "skipped" ? { note: prev.note } : {}),
      };
      status[p] = merged;
      if (page.status.status === "disabled" || page.status.status === "unsupported") {
        status[p] = page.status;
        continue;
      }
      if (page.status.status === "error") errored.add(p);
      if (page.status.status !== "error" && page.next !== undefined) {
        positions[p] = page.next;
        hasNext[p] = true;
        nextActive.push(p);
      } else if (page.status.status !== "error") {
        hasNext[p] = false;
        done.add(p);
      }
    }
    const filled = PROVIDERS.reduce((n, p) => n + collected[p].length, 0);
    active = nextActive;
    if (filled >= MIN_FILL) break;
  }

  const seenBefore = new Set(state.s);
  const deduped = dedupePage(weightedMerge(collected), seenBefore);
  const items = sortPage(deduped.items, query.sort);

  // Honest notes about how the page was assembled.
  const notes: string[] = [];
  const contributing = PROVIDERS.filter((p) => items.some((i) => i.provider === p));
  if (query.sort !== "relevance") {
    const unsupported = contributing.filter((p) => !CAPABILITIES[p].sort.includes(query.sort));
    if (contributing.length > 1)
      notes.push(`"${SORT_LABEL[query.sort]}" orders each page of results; providers return their pages independently.`);
    for (const p of unsupported) {
      const msg =
        query.sort === "popularity"
          ? `${PROVIDER_LABEL[p]} supplies no popularity ranking.`
          : `${PROVIDER_LABEL[p]} cannot sort this way; its items are ordered within the page using the values it supplied, and items without them come last.`;
      notes.push(msg);
      if (!status[p].note) status[p] = { ...status[p], note: msg };
    }
    if (items.some((i) => (query.sort === "rating" ? !i.rating : !i.price)))
      notes.push(
        query.sort === "rating"
          ? "Products without a rating are listed last."
          : "Products without a comparable EUR price are listed last.",
      );
  }
  if ((query.priceMin !== undefined || query.priceMax !== undefined) && contributing.length)
    notes.push("Prices are compared in EUR; products priced in another currency are excluded while a price filter is active.");

  // Cursor: only providers that still have pages (never for errors alone).
  const remaining = wanted.filter((p) => hasNext[p] && !done.has(p));
  let nextCursor: string | undefined;
  if (remaining.length) {
    const p: CursorState["p"] = {};
    for (const prov of remaining) p[prov] = positions[prov];
    // A provider that failed on this page is retried at the same position next time,
    // but a cursor is never issued for failures alone.
    for (const prov of errored) if (wanted.includes(prov) && !done.has(prov)) p[prov] = positions[prov];
    nextCursor = encodeCursor(
      { p, d: PROVIDERS.filter((x) => done.has(x)), s: [...state.s, ...deduped.seen].slice(-SEEN_MAX) },
      query,
    );
  }

  // The public result names only the providers in use.
  const publicStatus = Object.fromEntries(PROVIDERS.filter((p) => enabled.includes(p)).map((p) => [p, status[p]])) as Record<Provider, ProviderStatus>;
  return { items, ...(nextCursor ? { nextCursor } : {}), providers: publicStatus, ...(notes.length ? { notes } : {}) };
}
