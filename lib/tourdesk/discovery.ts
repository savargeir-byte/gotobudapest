// TourDesk inventory DISCOVERY for Budapest. READ-ONLY: only POST /TourSearch is used.
//
// ADAPTED from goTene src/lib/providers/tourdesk/catalog.ts (commit 5097540, read-only
// reference): server-side geolocation search at page 0 with pageSize 500, a result is only
// trusted when the unique products equal the reported totalCount (unstable or partial pages
// are rejected, never accepted silently), then a bounded text scan over the global catalogue as
// the fallback. Destination markers/exclusions follow goTene tenerife.ts (precision first).
//
// ADAPTED for Budapest: geolocation {47.4979, 19.0402, 30 km}, Budapest/Hungary markers and
// other-destination exclusions, no baseline ids (none are known), HTTP 401/403 reported as a
// credentials problem, an optional page-size fallback (500 -> 100), and the discovered Budapest
// subset is cached by discovery-cache.ts so marketplace paging, filters and search never hit
// /TourSearch for every page.
//
// Nothing from another destination is ever returned: an account without Budapest inventory
// yields an honest "empty" result. This module has no Next.js imports so it can be unit tested.
import { safeTourdeskUrl } from "../booking/checkout";

export const BUDAPEST_GEO = { lat: 47.4979, lon: 19.0402, radius: 30000 } as const;
export const GEO_PAGE_SIZE = 500;
export const GEO_FALLBACK_PAGE_SIZE = 100;
export const GEO_MAX_PAGES = 10;
// A geo answer larger than this means the geolocation filter was ignored (the account's
// regionIds/vendorIds filters are documented as non-functional), so it is not trusted.
export const GEO_SANITY_MAX = 2000;
export const SCAN_PAGE_SIZE = 500;
export const SCAN_MAX_PAGES = 30;
export const SCAN_CONCURRENCY = 4;
// GoIceTravel/goTene: larger text-search pages make paging unstable, so text uses 20.
export const TEXT_PAGE_SIZE = 20;
export const TEXT_MAX_PAGES = 5;

export type DiscoveryMode = "geo" | "text" | "auto";
export type DiscoveryStrategy = "geo" | "text" | "scan";

export type TourSearchPage = { page?: number; totalCount?: number; activities?: unknown[] };
export type SearchFn = (body: Record<string, unknown>) => Promise<TourSearchPage>;
export type Row = Record<string, unknown>;

// An HTTP answer (or a failure without one: status undefined) from TourDesk.
export class DiscoveryHttpError extends Error {
  constructor(
    readonly status: number | undefined,
    message = "TourDesk request failed",
  ) {
    super(message);
    this.name = "DiscoveryHttpError";
  }
}
// 401/403: the key is missing, invalid or not allowed for this account. Never cached.
export class DiscoveryAuthError extends Error {
  constructor(readonly status: number) {
    super("TourDesk rejected the credentials");
    this.name = "DiscoveryAuthError";
  }
}
// Every strategy failed without a definite answer. Never cached.
export class DiscoveryUnavailableError extends Error {
  constructor(readonly attempts: Attempt[]) {
    super("TourDesk discovery was unavailable");
    this.name = "DiscoveryUnavailableError";
  }
}

export const isAuthStatus = (s: number | undefined) => s === 401 || s === 403;

export type Attempt = {
  strategy: DiscoveryStrategy;
  outcome: "ok" | "empty" | "rejected" | "error";
  detail?: string;
};

export type DiscoveryCounts = {
  // Rows returned by TourDesk for the winning strategy (before the Budapest guard).
  returned: number;
  admitted: number;
  excludedOtherDestination: number;
  excludedNoMarker: number;
  excludedBadUrl: number;
};

export type DiscoveryResult = {
  strategy: DiscoveryStrategy;
  rows: Row[]; // admitted, Budapest-guarded, unique by uniqueKey
  complete: boolean; // false for a truncated scan or a text strategy (best effort)
  attempts: Attempt[];
  counts: DiscoveryCounts;
};

// ---------------------------------------------------------------------------------------
// Budapest guard (goTene tenerife.ts shape: markers + exclusions over title+description+vendor)
// ---------------------------------------------------------------------------------------
const BUDAPEST = new RegExp(
  [
    "budapest",
    "hungar",
    "magyar",
    "\\bbuda\\b",
    "\\bpest\\b",
    "sz[eé]chenyi",
    "gell[eé]rt",
    "andr[aá]ssy",
    "margaret island",
    "fisherman'?s bastion",
    "matthias church",
    "heroes'? square",
    "szentendre",
    "visegr[aá]d",
    "esztergom",
    "balaton",
  ].join("|"),
  "i",
);

// Other destinations that must never be presented as Budapest (alone, i.e. with no Budapest marker).
const OTHER_DESTINATION = new RegExp(
  [
    "iceland",
    "reykjav[ií]k",
    "tenerife",
    "canary",
    "gran canaria",
    "lanzarote",
    "fuerteventura",
    "\\bla palma\\b",
    "la gomera",
    "golden circle",
    "blue lagoon",
    "thingvellir",
    "j[oö]kuls[aá]rl[oó]n",
  ].join("|"),
  "i",
);

const KEY = /^\d{1,12}-\d{1,8}$/;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const text = (r: Row) => `${str(r.title)} ${str(r.description)} ${str(r.vendor)}`;

export const hasBudapestMarker = (r: Row) => BUDAPEST.test(text(r));
export const hasOtherDestinationMarker = (r: Row) => OTHER_DESTINATION.test(text(r));
const cityIsBudapest = (r: Row) => {
  const c = r.city ?? (r.location as Row | undefined)?.city;
  return typeof c === "string" && /budapest/i.test(c);
};
// goTene isOffIslandOnly: another destination named and no Budapest place.
export const isOffDestinationOnly = (r: Row) => hasOtherDestinationMarker(r) && !hasBudapestMarker(r);

type Guard = "admit" | "otherDestination" | "noMarker" | "badUrl";

// Geo rows are location-filtered by TourDesk, but a row must still carry a Budapest signal (marker
// or city) before it gets an internal product page (the detail page requires Budapest too), and
// must not be another destination. Scan/text rows are only admitted on an explicit marker.
export function guardRow(r: Row, via: DiscoveryStrategy): Guard {
  if (!KEY.test(str(r.uniqueKey)) || !str(r.title).trim()) return "noMarker";
  if (!safeTourdeskUrl(r.tourUrl)) return "badUrl";
  if (via === "geo") {
    if (isOffDestinationOnly(r)) return "otherDestination";
    return hasBudapestMarker(r) || cityIsBudapest(r) ? "admit" : "noMarker";
  }
  if (!hasBudapestMarker(r)) return "noMarker";
  if (hasOtherDestinationMarker(r)) return "otherDestination";
  return "admit";
}

function admit(rows: Row[], via: DiscoveryStrategy): { rows: Row[]; counts: DiscoveryCounts } {
  const counts: DiscoveryCounts = {
    returned: rows.length,
    admitted: 0,
    excludedOtherDestination: 0,
    excludedNoMarker: 0,
    excludedBadUrl: 0,
  };
  const byKey = new Map<string, Row>();
  for (const r of rows) {
    const g = guardRow(r, via);
    if (g === "otherDestination") counts.excludedOtherDestination++;
    else if (g === "noMarker") counts.excludedNoMarker++;
    else if (g === "badUrl") counts.excludedBadUrl++;
    else byKey.set(str(r.uniqueKey), r);
  }
  counts.admitted = byKey.size;
  return { rows: [...byKey.values()], counts };
}

const asRows = (a: unknown[] | undefined): Row[] =>
  (Array.isArray(a) ? a : []).filter((x): x is Row => !!x && typeof x === "object" && !Array.isArray(x));

async function call(search: SearchFn, body: Record<string, unknown>): Promise<TourSearchPage> {
  try {
    return await search(body);
  } catch (e) {
    const status = e instanceof DiscoveryHttpError ? e.status : undefined;
    if (isAuthStatus(status)) throw new DiscoveryAuthError(status!);
    throw e instanceof DiscoveryHttpError ? e : new DiscoveryHttpError(undefined);
  }
}

// ---------------------------------------------------------------------------------------
// (a) Geolocation search: goTene collectCompleteGeoItems
// ---------------------------------------------------------------------------------------
type Step =
  | { kind: "ok"; rows: Row[]; total: number }
  | { kind: "empty" }
  | { kind: "rejected"; reason: string };

export async function collectGeo(search: SearchFn, pageSize: number): Promise<Step> {
  const geo = (page: number) => call(search, { page, pageSize, geolocation: BUDAPEST_GEO });
  const first = await geo(0);
  // A geo answer is only trusted when it states a count to validate against: no totalCount, no proof
  // that the pages we read are all of them.
  const total = typeof first.totalCount === "number" ? first.totalCount : NaN;
  if (!Number.isInteger(total) || total < 0) return { kind: "rejected", reason: "invalid or missing totalCount" };
  if (total === 0) return { kind: "empty" };
  if (total > GEO_SANITY_MAX)
    return { kind: "rejected", reason: `totalCount ${total} is implausible for a 30 km search (geolocation filter ignored?)` };

  const byKey = new Map<string, Row>();
  const absorb = (rows: Row[]) => {
    let added = 0;
    for (const r of rows) {
      const k = str(r.uniqueKey);
      if (!k) continue;
      if (!byKey.has(k)) added++;
      byKey.set(k, r);
    }
    return added;
  };
  absorb(asRows(first.activities));
  if (byKey.size > total) return { kind: "rejected", reason: "more unique products than totalCount" };

  let pageNo = 1;
  while (byKey.size < total && pageNo <= GEO_MAX_PAGES) {
    const next = await geo(pageNo);
    const nextTotal = Number(next.totalCount ?? total);
    if (nextTotal !== total) return { kind: "rejected", reason: "totalCount changed between pages (unstable pagination)" };
    const added = absorb(asRows(next.activities));
    if (byKey.size > total) return { kind: "rejected", reason: "more unique products than totalCount" };
    if (added === 0) return { kind: "rejected", reason: "a page added no new products (no pagination progress)" };
    pageNo++;
  }
  if (byKey.size !== total)
    return { kind: "rejected", reason: `unique products ${byKey.size} != totalCount ${total}` };
  return { kind: "ok", rows: [...byKey.values()], total };
}

// Geo at pageSize 500, then once more at 100 when 500 failed or was rejected (very large pages
// can be refused or unstable; GoIceTravel measured unstable totals at big page sizes).
async function discoverGeo(search: SearchFn, attempts: Attempt[]): Promise<Step> {
  let last: Step = { kind: "rejected", reason: "not attempted" };
  for (const size of [GEO_PAGE_SIZE, GEO_FALLBACK_PAGE_SIZE]) {
    try {
      last = await collectGeo(search, size);
    } catch (e) {
      if (e instanceof DiscoveryAuthError) throw e;
      const status = e instanceof DiscoveryHttpError ? e.status : undefined;
      attempts.push({ strategy: "geo", outcome: "error", detail: `pageSize ${size}: ${status ? "HTTP " + status : "no response"}` });
      last = { kind: "rejected", reason: "request failed" };
      continue;
    }
    if (last.kind === "ok" || last.kind === "empty") {
      attempts.push({ strategy: "geo", outcome: last.kind, detail: last.kind === "ok" ? `${last.total} products, pageSize ${size}` : "totalCount 0" });
      return last;
    }
    attempts.push({ strategy: "geo", outcome: "rejected", detail: `pageSize ${size}: ${last.reason}` });
  }
  return last;
}

// ---------------------------------------------------------------------------------------
// (b) Bounded global scan: goTene textScan (page 1.., pageSize 500, every page must succeed)
// ---------------------------------------------------------------------------------------
async function collectScan(search: SearchFn): Promise<{ rows: Row[]; scanned: number; truncated: boolean }> {
  const first = await call(search, { page: 1, pageSize: SCAN_PAGE_SIZE });
  const total = Number(first.totalCount ?? first.activities?.length ?? 0);
  const wanted = Math.max(1, Math.ceil(total / SCAN_PAGE_SIZE));
  const pageCount = Math.min(SCAN_MAX_PAGES, wanted);
  const pages: Row[][] = [asRows(first.activities)];
  const todo = Array.from({ length: pageCount - 1 }, (_, i) => i + 2);
  for (let i = 0; i < todo.length; i += SCAN_CONCURRENCY) {
    const batch = await Promise.all(
      todo.slice(i, i + SCAN_CONCURRENCY).map((p) => call(search, { page: p, pageSize: SCAN_PAGE_SIZE })),
    );
    for (const b of batch) pages.push(asRows(b.activities));
  }
  const all = pages.flat();
  return { rows: all, scanned: all.length, truncated: pageCount < wanted };
}

// Free-text strategy (TOURDESK_DISCOVERY=text): the pre-existing approach, bounded and unioned.
async function collectText(search: SearchFn): Promise<{ rows: Row[]; scanned: number }> {
  const byKey = new Map<string, Row>();
  for (let page = 1; page <= TEXT_MAX_PAGES; page++) {
    const r = await call(search, { searchParameter: "Budapest", page, pageSize: TEXT_PAGE_SIZE });
    const rows = asRows(r.activities);
    let added = 0;
    for (const row of rows) {
      const k = str(row.uniqueKey);
      if (k && !byKey.has(k)) {
        byKey.set(k, row);
        added++;
      }
    }
    const total = Number(r.totalCount ?? 0);
    if (rows.length < TEXT_PAGE_SIZE || added === 0 || (total > 0 && byKey.size >= total)) break;
  }
  return { rows: [...byKey.values()], scanned: byKey.size };
}

// ---------------------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------------------
export function discoveryModeFromEnv(env: Record<string, string | undefined> = process.env): DiscoveryMode {
  const v = (env.TOURDESK_DISCOVERY ?? "").trim().toLowerCase();
  return v === "geo" || v === "text" ? v : "auto";
}

const result = (
  strategy: DiscoveryStrategy,
  rows: Row[],
  complete: boolean,
  attempts: Attempt[],
  counts: DiscoveryCounts,
): DiscoveryResult => ({ strategy, rows, complete, attempts, counts });

export async function discoverBudapest(
  search: SearchFn,
  mode: DiscoveryMode = "auto",
): Promise<DiscoveryResult> {
  const attempts: Attempt[] = [];
  let definiteEmpty: DiscoveryResult | undefined;

  if (mode === "geo" || mode === "auto") {
    const step = await discoverGeo(search, attempts);
    if (step.kind === "ok") {
      const a = admit(step.rows, "geo");
      if (a.rows.length) return result("geo", a.rows, true, attempts, a.counts);
      // TourDesk answered with products near Budapest, none usable: still a definite answer.
      definiteEmpty = result("geo", [], true, attempts, a.counts);
    } else if (step.kind === "empty") {
      definiteEmpty = result("geo", [], true, attempts, { returned: 0, admitted: 0, excludedOtherDestination: 0, excludedNoMarker: 0, excludedBadUrl: 0 });
    }
    if (mode === "geo") {
      if (definiteEmpty) return definiteEmpty;
      throw new DiscoveryUnavailableError(attempts);
    }
  }

  if (mode === "text") {
    const t = await collectText(search);
    const a = admit(t.rows, "text");
    attempts.push({ strategy: "text", outcome: a.rows.length ? "ok" : "empty", detail: `${t.scanned} rows read` });
    return result("text", a.rows, false, attempts, a.counts);
  }

  // auto: bounded global scan after geo returned nothing or was rejected.
  try {
    const s = await collectScan(search);
    const a = admit(s.rows, "scan");
    attempts.push({
      strategy: "scan",
      outcome: a.rows.length ? "ok" : "empty",
      detail: `${s.scanned} products scanned${s.truncated ? ` (capped at ${SCAN_MAX_PAGES} pages)` : ""}`,
    });
    return result("scan", a.rows, !s.truncated, attempts, a.counts);
  } catch (e) {
    if (e instanceof DiscoveryAuthError) throw e;
    const status = e instanceof DiscoveryHttpError ? e.status : undefined;
    attempts.push({ strategy: "scan", outcome: "error", detail: status ? `HTTP ${status}` : "no response" });
    if (definiteEmpty) return definiteEmpty;
    throw new DiscoveryUnavailableError(attempts);
  }
}

// Honest, human-readable note for the marketplace status line (no secrets, no raw bodies).
export function describeDiscovery(r: DiscoveryResult): string {
  const tried = r.attempts.map((a) => `${a.strategy}=${a.outcome}${a.detail ? ` (${a.detail})` : ""}`).join("; ");
  if (!r.rows.length)
    return `No Budapest inventory returned for this account. Strategies tried: ${tried}.`;
  const parts: string[] = [];
  if (r.strategy === "scan") parts.push("Found by scanning the TourDesk catalogue (best effort)");
  if (r.strategy === "text") parts.push("Found by text search (best effort)");
  if (!r.complete && r.strategy === "scan") parts.push("scan was capped, some products may be missing");
  if (r.counts.excludedNoMarker && r.strategy === "geo")
    parts.push(`${r.counts.excludedNoMarker} nearby product(s) without a Budapest marker were not listed`);
  return parts.join("; ");
}

// Single non-secret log line.
export function discoveryLogLine(r: DiscoveryResult): string {
  const c = r.counts;
  return `[offers] tourdesk strategy=${r.strategy} complete=${r.complete} returned=${c.returned} admitted=${c.admitted} otherDestination=${c.excludedOtherDestination} noMarker=${c.excludedNoMarker} badUrl=${c.excludedBadUrl}`;
}
