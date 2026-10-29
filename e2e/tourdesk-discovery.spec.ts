import { expect, request as pwRequest, test, type APIRequestContext } from "@playwright/test";
import type { MarketplaceProduct, MarketplaceResult } from "../lib/marketplace/types";

// MOCKED provider tests for TourDesk inventory discovery (geolocation search, bounded scan,
// guards and honest status notes). They call /api/marketplace/search on the dedicated server (port
// 3101) wired to e2e/support/mock-provider.mjs. No live TourDesk is contacted: nothing here shows
// what the real account contains, or why a live Budapest search returned zero products.
const API = "http://localhost:3101/api/marketplace/search";
const MOCK = "http://127.0.0.1:3900";
const FOREIGN_IDS = ["tourdesk:90001-1", "tourdesk:90002-1"];

test.skip(!!process.env.PW_BASE_URL, "needs the local mock-provider server");
test.describe.configure({ mode: "serial" });
// The "tourdesk-discovery" project runs after all others (playwright.config.ts) because the mock's
// TourDesk scenario is global state; the log is scoped per test by remembering its length.
test.beforeEach(({}, info) => test.skip(info.project.name !== "tourdesk-discovery", "runs once, in its own project"));

let ctx: APIRequestContext;

test.beforeAll(async () => {
  ctx = await pwRequest.newContext();
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
});
test.afterAll(async () => {
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
  await ctx.dispose();
});
test.beforeEach(async () => {
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true, clearLog: true } });
});
test.afterEach(async () => {
  await ctx.post(`${MOCK}/__control/__list`, { data: { reset: true } });
});

const scenario = (tourdesk: string) => ctx.post(`${MOCK}/__control/__list`, { data: { tourdesk } });
async function search(params: Record<string, string> = {}) {
  const res = await ctx.get(`${API}?${new URLSearchParams({ provider: "tourdesk", ...params })}`);
  return { res, body: (await res.json()) as MarketplaceResult };
}
async function walk(params: Record<string, string> = {}) {
  const items: MarketplaceProduct[] = [];
  let cursor: string | undefined;
  let pages = 0;
  for (let i = 0; i < 8; i++) {
    const { res, body } = await ctx.get(`${API}?${new URLSearchParams({ provider: "tourdesk", ...params, ...(cursor ? { cursor } : {}) })}`).then(async (r) => ({ res: r, body: (await r.json()) as MarketplaceResult }));
    expect(res.status()).toBe(200);
    items.push(...body.items);
    pages++;
    cursor = body.nextCursor;
    if (!cursor) break;
  }
  return { items, pages };
}
const tdLog = async () =>
  ((await (await ctx.get(`${MOCK}/__log/__list`)).json()) as { provider: string; method: string; path: string; body?: Record<string, unknown> }[]).filter(
    (e) => e.provider === "tourdesk",
  );

test("MOCKED: default discovery asks the geolocation search first (page 0, pageSize 500, Budapest)", async () => {
  const { res, body } = await search();
  expect(res.status()).toBe(200);
  expect(body.providers.tourdesk.status).toBe("ok");
  const log = await tdLog();
  const first = log.find((e) => e.body?.geolocation);
  expect(first?.body).toMatchObject({ page: 0, pageSize: 500, geolocation: { lat: 47.4979, lon: 19.0402, radius: 30000 } });
  expect(log.every((e) => e.method === "POST" && e.path.endsWith("/TourSearch"))).toBe(true);
  // geo succeeded: no global scan and no free-text request
  expect(log.some((e) => !e.body?.geolocation)).toBe(false);
});

test("MOCKED: paging runs over the discovered Budapest subset without duplicates and never lists foreign products", async () => {
  const { items, pages } = await walk();
  expect(pages).toBeGreaterThanOrEqual(2); // 25 products at 20 per TourDesk page
  const ids = items.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(items.filter((i) => i.provider === "tourdesk").length).toBeGreaterThanOrEqual(23);
  for (const f of FOREIGN_IDS) expect(ids).not.toContain(f);
  expect(items.every((i) => i.detailUrl?.startsWith("/tours/tourdesk/"))).toBe(true);
});

test("MOCKED: filters and search are applied over the same subset", async () => {
  const walking = await search({ category: "walking" });
  expect(walking.body.items.length).toBeGreaterThan(0);
  expect(walking.body.items.every((i) => i.categories.includes("walking"))).toBe(true);
  const priced = await search({ priceMin: "40", priceMax: "50" });
  for (const i of priced.body.items) {
    expect(i.price?.currency).toBe("EUR");
    expect(i.price!.amount).toBeGreaterThanOrEqual(40);
    expect(i.price!.amount).toBeLessThanOrEqual(50);
  }
  expect(priced.body.providers.tourdesk.note).toMatch(/EUR/);
  const rated = await search({ rating: "4" });
  expect(rated.body.providers.tourdesk.status).toBe("unsupported");
  expect(rated.body.items).toHaveLength(0);
});

test("MOCKED: geo returning nothing falls back to the bounded scan and says so", async () => {
  await scenario("geo-empty");
  const { body } = await search();
  expect(body.providers.tourdesk.status).toBe("ok");
  expect(body.providers.tourdesk.note).toMatch(/scanning the TourDesk catalogue \(best effort\)/);
  const log = await tdLog();
  expect(log[0].body?.geolocation).toBeTruthy();
  const scan = log.find((e) => !e.body?.geolocation && !e.body?.searchParameter);
  expect(scan?.body).toMatchObject({ page: 1, pageSize: 500 });
  expect(body.items.some((i) => FOREIGN_IDS.includes(i.id))).toBe(false);
});

for (const sc of ["geo-unstable", "geo-noprogress", "geo-ignored"]) {
  test(`MOCKED: ${sc} geo answers are rejected, never accepted as partial data`, async () => {
    await scenario(sc);
    const { body } = await search();
    // the scan found the products; the geo result was not used
    expect(body.providers.tourdesk.status).toBe("ok");
    expect(body.providers.tourdesk.note).toMatch(/scanning/);
    const log = await tdLog();
    expect(log.some((e) => !e.body?.geolocation && !e.body?.searchParameter)).toBe(true);
  });
}

test("MOCKED: a nearby product without any Budapest signal is left out and counted; a city match is listed", async () => {
  await scenario("geo-city");
  const { items } = await walk();
  const titles = items.map((i) => i.title);
  expect(titles).toContain("River Bend Countryside Excursion");
  expect(titles).not.toContain("Sunset River Sightseeing");
  const { body } = await search();
  expect(body.providers.tourdesk.note).toMatch(/1 nearby product\(s\) without a Budapest marker were not listed/);
});

test("MOCKED: HTTP 401 and 403 are reported as rejected credentials while other providers keep working", async () => {
  for (const status of ["401", "403"]) {
    await scenario(status);
    const mixed = await ctx
      .get(`${API}?${new URLSearchParams({ q: "cruise" })}`)
      .then(async (r) => (await r.json()) as MarketplaceResult);
    expect(mixed.providers.tourdesk.status).toBe("error");
    expect(mixed.providers.tourdesk.note).toBe("TourDesk rejected the credentials");
    expect(mixed.providers.viator.status).toBe("ok");
    expect(mixed.items.some((i) => i.provider === "viator")).toBe(true);
    expect(JSON.stringify(mixed)).not.toMatch(/mock credentials rejected|dummy-tourdesk-key/);
  }
});

test("MOCKED: an upstream outage is 'unavailable', not an empty catalogue", async () => {
  await scenario("503");
  const { body } = await search();
  expect(body.providers.tourdesk.status).toBe("error");
  // The public note names the strategies and the real HTTP status (and nothing else).
  expect(body.providers.tourdesk.note).toBe(
    "TourDesk is temporarily unavailable (geo error (pageSize 500: HTTP 503); geo error (pageSize 100: HTTP 503); scan error (HTTP 503))",
  );
  expect(JSON.stringify(body)).not.toMatch(/dummy-tourdesk-key|ApiKey|mock upstream failure/);
});

test("MOCKED: zero inventory is 'empty' with the strategies that ran; nothing else is substituted", async () => {
  await scenario("empty");
  const { body } = await search();
  expect(body.providers.tourdesk.status).toBe("empty");
  expect(body.providers.tourdesk.note).toMatch(/^No Budapest inventory returned for this account\. Strategies tried: geo=empty/);
  expect(body.providers.tourdesk.note).toMatch(/scan=empty/);
  expect(body.items).toHaveLength(0);
});

test("MOCKED: discovery only reads: no booking, availability or other endpoint is contacted", async () => {
  await scenario("geo-empty");
  await search();
  const log = await tdLog();
  expect(log.length).toBeGreaterThan(0);
  expect(log.every((e) => e.method === "POST" && e.path.endsWith("/TourSearch"))).toBe(true);
  expect(JSON.stringify(log)).not.toMatch(/TourBooking|availability|checkout/i);
});
