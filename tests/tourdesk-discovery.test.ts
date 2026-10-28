import assert from "node:assert/strict";
import test from "node:test";
import {
  BUDAPEST_GEO,
  DiscoveryAuthError,
  DiscoveryHttpError,
  DiscoveryUnavailableError,
  GEO_FALLBACK_PAGE_SIZE,
  GEO_PAGE_SIZE,
  SCAN_MAX_PAGES,
  collectGeo,
  describeDiscovery,
  discoverBudapest,
  discoveryModeFromEnv,
  guardRow,
  type Row,
  type SearchFn,
  type TourSearchPage,
} from "../lib/tourdesk/discovery";

// MOCKED: these tests drive the discovery logic with fake TourSearch responses. They prove the
// logic (strategy order, totalCount validation, guards), not what the real TourDesk API returns.

const row = (n: number, over: Row = {}): Row => ({
  uniqueKey: `${70000 + n}-1`,
  title: `Budapest Walking Tour ${n}`,
  description: "A Budapest experience.",
  price: 30 + n,
  currency: "EUR",
  tourUrl: `https://checkout.tourdesk.is/budapest/${70000 + n}-1`,
  ...over,
});
const iceland = (n: number): Row =>
  row(900 + n, { title: "Reykjavik Golden Circle Day Tour", description: "Iceland highlights", tourUrl: `https://checkout.tourdesk.is/iceland/${70900 + n}-1` });

type Call = Record<string, unknown>;
function server(opts: {
  geo?: (body: Call) => TourSearchPage;
  global?: Row[];
  text?: Row[];
  status?: number; // answer every request with this HTTP status
  failGeoAbove?: number; // geo pageSize above this fails (response too large)
}) {
  const calls: Call[] = [];
  const fn: SearchFn = async (body) => {
    calls.push(body);
    if (opts.status) throw new DiscoveryHttpError(opts.status);
    if (body.geolocation) {
      if (opts.failGeoAbove && Number(body.pageSize) > opts.failGeoAbove) throw new DiscoveryHttpError(502);
      if (!opts.geo) return { totalCount: 0, activities: [] };
      return opts.geo(body);
    }
    if (body.searchParameter) return { totalCount: (opts.text ?? []).length, activities: (opts.text ?? []).slice(0, 20) };
    const all = opts.global ?? [];
    const size = Number(body.pageSize);
    const p = Number(body.page);
    return { page: p, totalCount: all.length, activities: all.slice((p - 1) * size, p * size) };
  };
  return { fn, calls };
}
const pagedGeo = (rows: Row[]) => (body: Call): TourSearchPage => {
  const size = Number(body.pageSize);
  const p = Number(body.page);
  return { page: p, totalCount: rows.length, activities: rows.slice(p * size, p * size + size) };
};

test("geo search is the first strategy: page 0, pageSize 500, Budapest geolocation", async () => {
  const rows = [row(1), row(2), iceland(1)];
  const { fn, calls } = server({ geo: pagedGeo(rows) });
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.strategy, "geo");
  assert.equal(r.complete, true);
  assert.deepEqual(calls[0], { page: 0, pageSize: GEO_PAGE_SIZE, geolocation: BUDAPEST_GEO });
  assert.equal(calls.length, 1, "no scan when geo succeeded");
  assert.equal(r.rows.length, 2);
  assert.equal(r.counts.returned, 3);
  assert.equal(r.counts.excludedOtherDestination, 1);
  assert.ok(r.rows.every((x) => !/Reykjavik/i.test(String(x.title))), "foreign product never listed");
});

test("geo pages are followed until unique products equal totalCount", async () => {
  const rows = Array.from({ length: 5 }, (_, i) => row(i + 1));
  const calls: Call[] = [];
  const fn: SearchFn = async (body) => {
    calls.push(body);
    const p = Number(body.page);
    return { page: p, totalCount: 5, activities: rows.slice(p * 2, p * 2 + 2) }; // server returns 2 per page
  };
  const step = await collectGeo(fn, 500);
  assert.equal(step.kind, "ok");
  if (step.kind === "ok") assert.equal(step.rows.length, 5);
  assert.deepEqual(calls.map((c) => c.page), [0, 1, 2]);
});

test("unstable geo pagination is rejected, never accepted as partial data", async () => {
  const rows = Array.from({ length: 6 }, (_, i) => row(i + 1));
  const changing: SearchFn = async (body) => {
    const p = Number(body.page);
    return { page: p, totalCount: p === 0 ? 6 : 5, activities: rows.slice(p * 3, p * 3 + 3) };
  };
  const step = await collectGeo(changing, 500);
  assert.equal(step.kind, "rejected");
  const stuck: SearchFn = async () => ({ totalCount: 6, activities: rows.slice(0, 3) });
  const step2 = await collectGeo(stuck, 500);
  assert.equal(step2.kind, "rejected");
  if (step2.kind === "rejected") assert.match(step2.reason, /no new products|no pagination progress/);
  const tooMany: SearchFn = async () => ({ totalCount: 2, activities: rows.slice(0, 4) });
  assert.equal((await collectGeo(tooMany, 500)).kind, "rejected");
  const short: SearchFn = async (b) => ({ totalCount: 8, activities: Number(b.page) === 0 ? rows : rows.slice(0, 0).concat(rows) });
  assert.equal((await collectGeo(short, 500)).kind, "rejected"); // same rows again: no progress
});

test("a geo answer without a totalCount cannot be validated and is rejected", async () => {
  const fn: SearchFn = async () => ({ activities: [row(1), row(2)] });
  const step = await collectGeo(fn, 500);
  assert.equal(step.kind, "rejected");
  if (step.kind === "rejected") assert.match(step.reason, /missing totalCount/);
});

test("an implausible geo totalCount means the geolocation filter was ignored", async () => {
  const fn: SearchFn = async () => ({ totalCount: 12000, activities: [row(1)] });
  const step = await collectGeo(fn, 500);
  assert.equal(step.kind, "rejected");
  if (step.kind === "rejected") assert.match(step.reason, /implausible/);
});

test("when geo is rejected both page sizes are tried, then the bounded scan runs", async () => {
  const rows = Array.from({ length: 4 }, (_, i) => row(i + 1));
  const unstable: SearchFn = async () => ({ totalCount: 99, activities: rows });
  const calls: Call[] = [];
  const fn: SearchFn = async (body) => {
    calls.push(body);
    if (body.geolocation) return unstable(body);
    const all = [...rows, iceland(1)];
    return { page: Number(body.page), totalCount: all.length, activities: all };
  };
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.strategy, "scan");
  assert.equal(r.rows.length, 4);
  const geoSizes = calls.filter((c) => c.geolocation).map((c) => c.pageSize);
  assert.ok(geoSizes.includes(GEO_PAGE_SIZE) && geoSizes.includes(GEO_FALLBACK_PAGE_SIZE));
  assert.deepEqual(r.attempts.map((a) => `${a.strategy}:${a.outcome}`).slice(0, 2), ["geo:rejected", "geo:rejected"]);
  assert.equal(r.attempts.at(-1)?.strategy, "scan");
});

test("a response that is too large for 500 succeeds at pageSize 100", async () => {
  const rows = Array.from({ length: 3 }, (_, i) => row(i + 1));
  const { fn, calls } = server({ geo: pagedGeo(rows), failGeoAbove: 100 });
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.strategy, "geo");
  assert.deepEqual(calls.filter((c) => c.geolocation).map((c) => c.pageSize), [500, 100]);
  assert.equal(r.attempts[0].outcome, "error");
});

test("geo returning nothing falls back to the global scan, which only keeps Budapest products", async () => {
  const global = [iceland(1), row(1), iceland(2), row(2), row(3, { title: "Day trip", description: "Somewhere else" })];
  const { fn, calls } = server({ global });
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.strategy, "scan");
  assert.equal(r.complete, true);
  assert.equal(r.rows.length, 2);
  // scan rows need an explicit Budapest marker: the two Iceland rows and the unmarked row all fail it
  assert.equal(r.counts.excludedNoMarker, 3);
  assert.equal(r.counts.excludedOtherDestination, 0);
  assert.deepEqual(calls.map((c) => (c.geolocation ? "geo" : "scan")), ["geo", "scan"]);
  assert.match(describeDiscovery(r), /scanning the TourDesk catalogue \(best effort\)/);
});

test("the scan is bounded: capped pages mark the result incomplete", async () => {
  const calls: Call[] = [];
  const fn: SearchFn = async (body) => {
    calls.push(body);
    if (body.geolocation) return { totalCount: 0, activities: [] };
    return { page: Number(body.page), totalCount: 100_000, activities: [row(Number(body.page))] };
  };
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.strategy, "scan");
  assert.equal(r.complete, false);
  assert.equal(calls.filter((c) => !c.geolocation).length, SCAN_MAX_PAGES);
  assert.match(describeDiscovery(r), /capped/);
});

test("zero inventory is an honest, definite empty result naming the strategies tried", async () => {
  const { fn } = server({ global: [iceland(1), iceland(2)] });
  const r = await discoverBudapest(fn, "auto");
  assert.equal(r.rows.length, 0);
  const note = describeDiscovery(r);
  assert.match(note, /^No Budapest inventory returned for this account\./);
  assert.match(note, /geo=empty/);
  assert.match(note, /scan=empty/);
});

test("HTTP 401 and 403 are credential errors, never cached results", async () => {
  for (const status of [401, 403]) {
    const { fn } = server({ status });
    await assert.rejects(() => discoverBudapest(fn, "auto"), (e: unknown) => e instanceof DiscoveryAuthError && e.status === status);
  }
});

test("when every strategy fails without an answer discovery is unavailable (not empty)", async () => {
  const { fn } = server({ status: 503 });
  await assert.rejects(() => discoverBudapest(fn, "auto"), (e: unknown) => e instanceof DiscoveryUnavailableError);
});

test("geo-only mode never scans; text mode uses bounded free-text pages", async () => {
  const geoOnly = server({ global: [row(1)] });
  const r = await discoverBudapest(geoOnly.fn, "geo");
  assert.equal(r.rows.length, 0);
  assert.ok(geoOnly.calls.every((c) => c.geolocation));
  const text = server({ text: [row(1), iceland(1)] });
  const t = await discoverBudapest(text.fn, "text");
  assert.equal(t.strategy, "text");
  assert.equal(t.complete, false);
  assert.equal(t.rows.length, 1);
  assert.ok(text.calls.every((c) => c.searchParameter === "Budapest" && c.pageSize === 20));
});

test("guard: geo rows need a Budapest marker or city, scan rows need an explicit marker", () => {
  assert.equal(guardRow(row(1), "geo"), "admit");
  assert.equal(guardRow(row(2, { title: "River Excursion", description: "", city: "Budapest" }), "geo"), "admit");
  assert.equal(guardRow(row(3, { title: "River Excursion", description: "" }), "geo"), "noMarker");
  assert.equal(guardRow(iceland(1), "geo"), "otherDestination");
  assert.equal(guardRow(row(4, { title: "River Excursion", description: "", city: "Budapest" }), "scan"), "noMarker");
  assert.equal(guardRow(row(5, { title: "Budapest and Reykjavik combo" }), "scan"), "otherDestination");
  assert.equal(guardRow(row(6, { title: "Vienna day trip from Budapest" }), "geo"), "admit");
  for (const bad of [
    row(7, { tourUrl: "https://evil.example/pay" }),
    row(8, { tourUrl: "http://checkout.tourdesk.is/x" }),
    row(9, { tourUrl: "https://checkout.tourdesk.is.evil.example/x" }),
  ])
    assert.equal(guardRow(bad, "geo"), "badUrl");
  assert.equal(guardRow(row(10, { uniqueKey: "../etc" }), "geo"), "noMarker");
});

test("TOURDESK_DISCOVERY selects the mode, defaulting to auto", () => {
  assert.equal(discoveryModeFromEnv({}), "auto");
  assert.equal(discoveryModeFromEnv({ TOURDESK_DISCOVERY: "GEO" }), "geo");
  assert.equal(discoveryModeFromEnv({ TOURDESK_DISCOVERY: "text" }), "text");
  assert.equal(discoveryModeFromEnv({ TOURDESK_DISCOVERY: "everything" }), "auto");
});
