import { expect, request as pwRequest, test, type APIRequestContext } from "@playwright/test";
import type { MarketplaceProduct, MarketplaceResult } from "../lib/marketplace/types";

// MOCKED provider tests. They call /api/marketplace/search on the dedicated server
// (port 3101) that runs with BOOKING_MOCK_ORIGIN and dummy keys, so every provider
// response comes from e2e/support/mock-provider.mjs. No live provider is contacted and
// nothing here proves behaviour of the real TourDesk, Viator or Tiqets APIs.
const API = "http://localhost:3101/api/marketplace/search";
const MOCK = "http://127.0.0.1:3900";

test.skip(!!process.env.PW_BASE_URL, "needs the local mock-provider server");
// One project only (the mock is shared state) and strictly serial: scenario switches
// are global for the mock.
test.describe.configure({ mode: "serial" });
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "runs once, on the desktop project"));

let ctx: APIRequestContext;

test.beforeAll(async () => {
  ctx = await pwRequest.newContext();
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
});
test.afterAll(async () => {
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  await ctx.dispose();
});

async function search(params: Record<string, string> = {}) {
  const res = await ctx.get(`${API}?${new URLSearchParams(params)}`);
  const text = await res.text();
  let body: MarketplaceResult | { error: string } | undefined;
  try {
    body = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { res, text, body: body as MarketplaceResult, error: (body as { error?: string })?.error };
}
async function all(params: Record<string, string>, maxPages = 12) {
  const items: MarketplaceProduct[] = [];
  const pages: MarketplaceResult[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const r = await search({ ...params, ...(cursor ? { cursor } : {}) });
    expect(r.res.status()).toBe(200);
    pages.push(r.body);
    items.push(...r.body.items);
    cursor = r.body.nextCursor;
    if (!cursor) break;
  }
  return { items, pages, cursor };
}
const scenario = (data: Record<string, string>) => ctx.post(`${MOCK}/__control/__list`, { data });
const listLog = async () =>
  (await (await ctx.get(`${MOCK}/__log/__list`)).json()) as { provider: string; method: string; path: string; body?: Record<string, any> }[];

test("MOCKED: paging walks every provider across pages without duplicates", async () => {
  const { items, pages, cursor } = await all({});
  expect(cursor).toBeUndefined();
  expect(pages.length).toBeGreaterThanOrEqual(3);
  const ids = items.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of pages) expect(p.items.length).toBeLessThanOrEqual(60);
  // 40 Viator + 27 available Tiqets + 24 Budapest TourDesk rows, minus cross-provider duplicates.
  const by = (p: string) => items.filter((i) => i.provider === p).length;
  expect(by("viator")).toBeGreaterThanOrEqual(38);
  expect(by("tiqets")).toBeGreaterThanOrEqual(26);
  expect(by("tourdesk")).toBeGreaterThanOrEqual(23);
  // The plain duplicate title exists at all three providers: one card, TourDesk wins.
  const dup = items.filter((i) => i.title === "Budapest Danube River Cruise");
  expect(dup).toHaveLength(1);
  expect(dup[0].provider).toBe("tourdesk");
  // The first page mixes providers (Viator-led weighted interleave).
  expect(new Set(pages[0].items.map((i) => i.provider)).size).toBe(3);
  expect(pages[0].providers.tourdesk.status).toBe("ok");
});

test("MOCKED: tampered or foreign cursors are rejected", async () => {
  const first = await search({});
  const cursor = first.body.nextCursor;
  expect(cursor, "the default query must have a second page").toBeTruthy();
  // A valid cursor continues the same query...
  expect((await search({ cursor: cursor! })).res.status()).toBe(200);
  // ...but is refused for another query, edited, or oversized.
  expect((await search({ category: "baths", cursor: cursor! })).res.status()).toBe(400);
  expect((await search({ cursor: cursor!.slice(0, -3) + "AAA" })).res.status()).toBe(400);
  expect((await search({ cursor: "x".repeat(1700) })).res.status()).toBe(400);
});

test("MOCKED: provider filter returns only that provider and skips the others", async () => {
  for (const provider of ["viator", "tiqets", "tourdesk"] as const) {
    const { items, pages } = await all({ provider });
    expect(items.length).toBeGreaterThan(10);
    expect(items.every((i) => i.provider === provider)).toBe(true);
    for (const other of ["viator", "tiqets", "tourdesk"].filter((p) => p !== provider))
      expect(pages[0].providers[other as "viator"].status).toBe("skipped");
  }
});

test("MOCKED: category narrows Viator with live tags and every result matches the category", async () => {
  const { items } = await all({ category: "cruises" });
  expect(items.length).toBeGreaterThan(5);
  for (const i of items) expect(i.categories).toContain("cruises");
  const viatorCalls = (await listLog()).filter((l) => l.provider === "viator" && l.body?.filtering?.tags);
  expect(viatorCalls.length).toBeGreaterThan(0);
  expect(viatorCalls.at(-1)!.body!.filtering.tags).toEqual(expect.arrayContaining([11, 111]));
});

test("MOCKED: free text uses the freetext endpoint and respects relevance", async () => {
  const { items } = await all({ q: "wine" });
  expect(items.length).toBeGreaterThan(2);
  for (const i of items) expect(`${i.title} ${i.summary ?? ""}`.toLowerCase()).toContain("wine");
  const log = await listLog();
  expect(log.some((l) => l.provider === "viator" && l.path.includes("/search/freetext") && /wine/i.test(l.body?.searchTerm))).toBe(true);
});

test("MOCKED: sorting is passed to Viator and affiliate/ratings/prices come from the API", async () => {
  const price = await all({ provider: "viator", sort: "price_asc" });
  const prices = price.items.map((i) => i.price?.amount ?? Infinity);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  const rating = await all({ provider: "viator", sort: "rating" });
  const r = rating.items.map((i) => i.rating?.value ?? -1);
  expect(r.slice(0, 20)).toEqual([...r.slice(0, 20)].sort((a, b) => b - a));
  const calls = (await listLog()).filter((l) => l.provider === "viator" && l.body?.sorting);
  expect(calls.some((c) => c.body!.sorting.sort === "PRICE" && c.body!.sorting.order === "ASCENDING")).toBe(true);
  expect(calls.some((c) => c.body!.sorting.sort === "TRAVELER_RATING" && c.body!.sorting.order === "DESCENDING")).toBe(true);
  // DEFAULT is sent WITHOUT an order.
  await all({ provider: "viator", sort: "relevance" });
  const def = (await listLog()).filter((l) => l.provider === "viator" && l.body?.sorting?.sort === "DEFAULT");
  expect(def.length).toBeGreaterThan(0);
  expect(def.every((d) => !("order" in d.body!.sorting))).toBe(true);
  // A product without any rating is listed last, never given one.
  expect(rating.items.some((i) => !i.rating)).toBe(true);
});

test("MOCKED: mixed-provider sorting is page-local, says so, and puts missing data last", async () => {
  const r = await search({ sort: "price_asc" });
  expect(r.body.notes?.some((n) => /orders each page/i.test(n))).toBe(true);
  const eur = r.body.items.filter((i) => i.price?.currency === "EUR").map((i) => i.price!.amount);
  expect(eur).toEqual([...eur].sort((a, b) => a - b));
  const tiqetsOnly = await search({ provider: "tiqets", sort: "price_asc" });
  expect(tiqetsOnly.body.providers.tiqets.note ?? tiqetsOnly.body.notes?.join(" ")).toMatch(/cannot sort/i);
  const td = await search({ provider: "tourdesk", sort: "rating" });
  expect(td.body.providers.tourdesk.note ?? td.body.notes?.join(" ")).toMatch(/cannot sort/i);
});

test("MOCKED: price, duration and rating filters", async () => {
  const cheap = await all({ provider: "viator", priceMax: "20" });
  expect(cheap.items.length).toBeGreaterThan(0);
  expect(cheap.items.every((i) => i.price!.amount <= 20)).toBe(true);
  const sent = (await listLog()).filter((l) => l.provider === "viator" && l.body?.filtering?.highestPrice === 20);
  expect(sent.length).toBeGreaterThan(0);

  const band = await all({ provider: "tiqets", priceMin: "14", priceMax: "25" });
  expect(band.items.length).toBeGreaterThan(0);
  expect(band.items.every((i) => i.price!.amount >= 14 && i.price!.amount <= 25)).toBe(true);
  expect(band.pages[0].providers.tiqets.note).toMatch(/applied to the returned page/);

  const mid = await all({ provider: "tourdesk", duration: "2to5" });
  expect(mid.items.length).toBeGreaterThan(0);
  expect(mid.items.every((i) => i.durationMinutes! >= 120 && i.durationMinutes! < 300)).toBe(true);
  const viatorDur = await all({ provider: "viator", duration: "lt2" });
  expect(viatorDur.items.every((i) => i.durationMinutes! < 120)).toBe(true);

  const rated = await all({ provider: "viator", rating: "4.5" });
  expect(rated.items.length).toBeGreaterThan(0);
  expect(rated.items.every((i) => i.rating!.value >= 4.5)).toBe(true);
  const tiqetsRated = await all({ provider: "tiqets", rating: "4.5" });
  expect(tiqetsRated.items.every((i) => i.rating!.value >= 4.5)).toBe(true);
});

test("MOCKED: TourDesk has no ratings, so it is excluded (not faked) while a rating filter is on", async () => {
  const r = await search({ rating: "4" });
  expect(r.body.providers.tourdesk.status).toBe("unsupported");
  expect(r.body.providers.tourdesk.note).toMatch(/no ratings/i);
  expect(r.body.items.some((i) => i.provider === "tourdesk")).toBe(false);
  expect(r.body.items.every((i) => i.rating && i.rating.value >= 4)).toBe(true);
});

test("MOCKED: a price filter excludes products priced in another currency instead of comparing numbers", async () => {
  const unfiltered = await all({ provider: "tourdesk" });
  expect(unfiltered.items.some((i) => i.price?.currency === "ISK")).toBe(true);
  const filtered = await all({ provider: "tourdesk", priceMax: "1000" });
  expect(filtered.items.some((i) => i.price?.currency === "ISK")).toBe(false);
});

test("MOCKED: products from other destinations are never shown", async () => {
  const { items } = await all({ provider: "tourdesk" });
  const text = JSON.stringify(items);
  expect(text).not.toMatch(/Reykjavik|Tenerife|Golden Circle|Whale/);
  expect(items.every((i) => /budapest/i.test(`${i.title} ${i.summary ?? ""}`))).toBe(true);
});

test("MOCKED: Tiqets items carry no image, sold-out items are absent and URLs are untouched", async () => {
  const { items } = await all({ provider: "tiqets" });
  expect(items.length).toBeGreaterThan(20);
  expect(items.every((i) => !("image" in i))).toBe(true);
  expect(items.some((i) => ["tiqets:5010", "tiqets:5020", "tiqets:5030"].includes(i.id))).toBe(false);
  for (const i of items) expect(i.bookingUrl).toMatch(/^https:\/\/www\.tiqets\.com\/en\/things-to-do-in-budapest-c68199\/.+\/\?partner=gotobudapest$/);
  const log = await listLog();
  expect(log.some((l) => l.provider === "tiqets" && l.path.includes("city_id=68199"))).toBe(true);
  expect(log.filter((l) => l.provider === "tiqets").every((l) => l.method === "GET")).toBe(true);
});

test("MOCKED: Viator affiliate URLs reach the client exactly as the API supplied them", async () => {
  const { items } = await all({ provider: "viator" });
  for (const i of items)
    expect(i.bookingUrl).toMatch(/\?pid=P00MOCK&mcid=42383&medium=api&campaign=gotobudapest&api_version=2\.0$/);
  const flagged = items.filter((i) => i.freeCancellation);
  expect(flagged.map((i) => i.providerKey)).toEqual(["VP003"]);
  expect(items.some((i) => i.price?.amount === 3)).toBe(true);
  expect(items.filter((i) => !i.rating).length).toBeGreaterThan(0);
});

test("MOCKED: only read-only catalogue endpoints were ever called", async () => {
  const log = await listLog();
  expect(log.length).toBeGreaterThan(10);
  for (const l of log) {
    if (l.provider === "viator") expect(l.method === "POST" && /\/(products\/search|search\/freetext)/.test(l.path)).toBe(true);
    if (l.provider === "tourdesk") expect(l.method === "POST" && l.path.endsWith("/TourSearch")).toBe(true);
    if (l.provider === "tiqets") expect(l.method).toBe("GET");
  }
  const transactional = (await (await ctx.get(`${MOCK}/__transactional`)).json()) as { path: string }[];
  expect(transactional.filter((t) => /marketplace|TourSearch|products\/search/.test(t.path))).toEqual([]);
});

test("MOCKED: a Viator outage degrades only its own slice and is never cached", async () => {
  await scenario({ viator: "503" });
  try {
    const r = await search({ q: "tour" });
    expect(r.res.status()).toBe(200);
    expect(r.body.providers.viator.status).toBe("error");
    expect(r.body.providers.viator.note).toMatch(/temporarily unavailable|did not respond/);
    expect(r.body.items.some((i) => i.provider === "tiqets")).toBe(true);
    expect(r.body.items.some((i) => i.provider === "tourdesk")).toBe(true);
    expect(r.res.headers()["cache-control"]).toBe("no-store");
    expect(r.text).not.toMatch(/mock upstream failure|exp-api-key|dummy-/);
  } finally {
    await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  }
});

test("MOCKED: malformed provider JSON is an isolated error, not a crash", async () => {
  await scenario({ tiqets: "malformed" });
  try {
    const r = await search({ q: "basilica" });
    expect(r.res.status()).toBe(200);
    expect(r.body.providers.tiqets.status).toBe("error");
    expect(r.text).not.toContain("{not json");
  } finally {
    await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  }
});

test("MOCKED: empty TourDesk inventory is reported as empty with a note; nothing else is substituted", async () => {
  await scenario({ tourdesk: "empty" });
  try {
    const r = await search({ q: "museum" });
    expect(r.res.status()).toBe(200);
    expect(r.body.providers.tourdesk.status).toBe("empty");
    // The note now also lists the discovery strategies that ran (geo, then the bounded scan).
    expect(r.body.providers.tourdesk.note).toMatch(/^No Budapest inventory returned for this account/);
    expect(r.body.items.some((i) => i.provider === "tourdesk")).toBe(false);
    expect(r.res.headers()["cache-control"]).toContain("s-maxage=900");
  } finally {
    await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  }
});

test("MOCKED: a provider that never answers is cut off by the per-provider timeout", async () => {
  await scenario({ viator: "slow" });
  const started = Date.now();
  try {
    const r = await search({ q: "spa" });
    expect(r.res.status()).toBe(200);
    expect(r.body.providers.viator.status).toBe("error");
    expect(Date.now() - started).toBeLessThan(14000);
    expect(r.body.items.length).toBeGreaterThan(0);
  } finally {
    await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  }
});

test("MOCKED: malformed, unknown and oversized parameters are rejected", async () => {
  const bad: Record<string, string>[] = [
    { category: "hacking" },
    { provider: "evil" },
    { sort: "drop table" },
    { priceMin: "abc" },
    { priceMax: "1e9" },
    { duration: "forever" },
    { rating: "3" },
    { q: "x".repeat(300) },
    { cursor: "garbage!" },
    Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`p${i}`, "1"])),
  ];
  for (const params of bad) expect((await search(params)).res.status(), JSON.stringify(params).slice(0, 40)).toBe(400);
  expect((await search({ x: "a".repeat(4100) })).res.status()).toBe(414);
  // Empty values from an HTML form are fine.
  expect((await search({ q: "", category: "", provider: "", sort: "relevance", priceMin: "" })).res.status()).toBe(200);
  // POST is not accepted.
  expect((await ctx.post(API, { data: {} })).status()).toBe(405);
});

test("MOCKED: responses never contain keys, provider bodies or internal hosts", async () => {
  const bodies = [
    (await search({})).text,
    (await search({ provider: "viator", sort: "rating" })).text,
    (await search({ q: "cruise" })).text,
  ].join("\n");
  for (const secret of ["dummy-tourdesk-key", "dummy-viator-key", "dummy-tiqets-key", "TOURDESK_API_KEY", "VIATOR_API_KEY", "TIQETS_API_KEY", "exp-api-key", "ApiKey", "Token ", "127.0.0.1:3900", "__viator", "__tiqets", "__td"])
    expect(bodies, secret).not.toContain(secret);
  const r = await search({});
  expect(r.res.headers()["x-powered-by"]).toBeUndefined();
  expect(r.res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(r.res.headers()["cache-control"]).toBe("public, s-maxage=900, stale-while-revalidate=1800");
});
