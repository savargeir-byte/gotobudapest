import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { matchAttractionPhoto } from "../lib/marketplace/attraction-match";
import { attractionContext, contextQuery, relevantProducts, seeAllHref } from "../lib/marketplace/context";
import { mapTiqetsAvailability, mapTiqetsDetail } from "../lib/marketplace/providers/tiqets-detail";
import {
  activeFilterCount,
  allProvidersDown,
  apiUrl,
  capabilityNote,
  countLine,
  createRequestGate,
  degradedProviders,
  filterChips,
  mergeItems,
  pageUrl,
  visibleControls,
  withoutChip,
} from "../lib/marketplace/ui";
import type { Attraction } from "../lib/types";
import type { MarketplaceProduct, MarketplaceResult, ProviderStatus } from "../lib/marketplace/types";

const product = (id: string, over: Partial<MarketplaceProduct> = {}): MarketplaceProduct => ({
  id,
  provider: "viator",
  providerKey: id.split(":")[1],
  title: `Product ${id}`,
  categories: [],
  bookingUrl: "https://www.viator.com/x",
  detailUrl: `/tours/viator/${id.split(":")[1]}`,
  ...over,
});
const st = (status: ProviderStatus["status"], extra: Partial<ProviderStatus> = {}): ProviderStatus => ({ status, count: 0, ...extra });
const result = (over: Partial<Record<"viator" | "tiqets" | "tourdesk", ProviderStatus>> = {}, notes?: string[]): MarketplaceResult => ({
  items: [],
  providers: { viator: st("ok", { total: 40 }), tiqets: st("ok", { total: 30 }), tourdesk: st("ok", { total: 25 }), ...over },
  ...(notes ? { notes } : {}),
});

test("controls follow provider capabilities and never offer a duration sort", () => {
  const all = visibleControls();
  assert.deepEqual(all.sorts, ["relevance", "rating", "popularity", "price_asc", "price_desc"]);
  assert.ok(!all.sorts.includes("duration" as never));
  assert.equal(all.rating, true);
  const td = visibleControls("tourdesk");
  assert.equal(td.rating, false);
  assert.deepEqual(td.sorts, ["relevance"]);
  assert.deepEqual(visibleControls("tiqets").sorts, ["relevance", "popularity"]);
});

test("capability notes name the providers that cannot do something, and never promise a global order", () => {
  assert.match(capabilityNote("sort")!, /orders each page of results; it is not a global ranking/);
  assert.match(capabilityNote("sort")!, /TourDesk/);
  assert.match(capabilityNote("rating")!, /TourDesk supplies no ratings/);
  assert.match(capabilityNote("price")!, /Viator apply this before paging/);
  assert.equal(capabilityNote("sort", "viator"), undefined);
});

test("chips describe active filters and removing one restores the rest", () => {
  const q = { sort: "price_asc" as const, q: "cruise", category: "cruises" as const, provider: "viator" as const, priceMin: 10, priceMax: 50, duration: "2to5" as const, minRating: 4.5 };
  const chips = filterChips(q);
  assert.deepEqual(chips.map((c) => c.key), ["q", "category", "provider", "price", "duration", "rating", "sort"]);
  const price = chips.find((c) => c.key === "price")!;
  assert.equal(price.label, "€10 – €50");
  const without = withoutChip(q, price);
  assert.equal(without.priceMin, undefined);
  assert.equal(without.priceMax, undefined);
  assert.equal(without.category, "cruises");
  assert.equal(withoutChip(q, chips.find((c) => c.key === "sort")!).sort, "relevance");
  assert.equal(activeFilterCount(q), 5);
});

test("urls keep filters, never the cursor, and the api url carries it", () => {
  const q = { sort: "rating" as const, q: "danube", category: "cruises" as const, cursor: "abc" };
  assert.equal(pageUrl(q), "/tours?q=danube&category=cruises&sort=rating");
  assert.equal(apiUrl(q, "CUR_1"), "/api/marketplace/search?q=danube&category=cruises&sort=rating&cursor=CUR_1");
  assert.equal(pageUrl({ sort: "relevance" }), "/tours");
});

test("load more never duplicates a product already shown", () => {
  const a = [product("viator:A1"), product("tiqets:5001", { provider: "tiqets" })];
  const merged = mergeItems(a, [product("viator:A1"), product("viator:B2"), product("viator:B2")]);
  assert.deepEqual(merged.map((p) => p.id), ["viator:A1", "tiqets:5001", "viator:B2"]);
});

test("result counts only claim totals when every provider supplied one and nothing narrows the page", () => {
  const base = { sort: "relevance" as const };
  assert.equal(countLine(result(), base, 24), "Showing 24 of about 95 products from 3 providers");
  assert.equal(countLine(result({ tourdesk: st("ok") }), base, 24), "Showing 24 results");
  assert.equal(countLine(result(), { ...base, category: "baths" }, 7), "Showing 7 results");
  assert.equal(countLine(result(), { ...base, priceMax: 20 }, 1), "Showing 1 result");
});

test("only degraded providers are reported", () => {
  const r = result({ viator: st("error"), tourdesk: st("empty") });
  const d = degradedProviders(r, { sort: "relevance" });
  assert.deepEqual(d.map((x) => x.provider).sort(), ["tourdesk", "viator"]);
  assert.match(d.find((x) => x.provider === "viator")!.text, /temporarily unavailable/);
  assert.equal(degradedProviders(r, { sort: "relevance", provider: "tiqets" }).length, 0);
  assert.equal(allProvidersDown(r, { sort: "relevance" }), false);
  assert.equal(allProvidersDown(result({ viator: st("error"), tiqets: st("error"), tourdesk: st("error") }), { sort: "relevance" }), true);
  assert.equal(allProvidersDown(result({ viator: st("error") }), { sort: "relevance", provider: "viator" }), true);
});

test("the request gate lets only the latest request apply its response", () => {
  const gate = createRequestGate();
  const first = gate.next();
  const second = gate.next();
  assert.equal(gate.isCurrent(first), false);
  assert.equal(gate.isCurrent(second), true);
  gate.invalidate();
  assert.equal(gate.isCurrent(second), false);
});

// ------------------------------------------------------------ editorial contexts
test("attraction contexts need a distinctive place word, otherwise no row", () => {
  assert.deepEqual(attractionContext("Hungarian Parliament")?.require, ["parliament"]);
  assert.deepEqual(attractionContext("Széchenyi Thermal Bath")?.require, ["szechenyi"]);
  assert.equal(attractionContext("Great Market Hall"), undefined);
  assert.equal(attractionContext("Budapest Zoo"), undefined);
});

test("relevant products must mention the place, are deduplicated and capped", () => {
  const ctx = attractionContext("Hungarian Parliament")!;
  const items = [
    product("viator:P1", { title: "Parliament Building Tickets" }),
    product("viator:P1", { title: "Parliament Building Tickets" }),
    product("viator:X2", { title: "Goulash Cooking Class" }),
    product("tiqets:7", { provider: "tiqets", title: "Visit the Hungarian Parliament", summary: "" }),
  ];
  assert.deepEqual(relevantProducts(items, ctx).map((p) => p.id), ["viator:P1", "tiqets:7"]);
  assert.equal(relevantProducts(items, ctx, 1).length, 1);
  assert.deepEqual(relevantProducts(items, { category: "food" }).length, 3, "category contexts rely on the API filter");
  assert.deepEqual(contextQuery({ q: "Buda Castle" }), { sort: "relevance", q: "Buda Castle" });
  assert.equal(seeAllHref({ category: "cruises" }), "/tours?category=cruises");
});

// ------------------------------------------------------------ Tiqets detail
const URL_OK = "https://www.tiqets.com/en/things-to-do-in-budapest-c68199/tickets-for-x-p5001/?partner=gotobudapest";
const row = { id: 5001, title: "Basilica Entry", city_name: "Budapest", product_url: URL_OK, sale_status: "available" };

test("Tiqets detail keeps only supplier text, strips HTML, hides unsupplied sections and never exposes images", () => {
  const d = mapTiqetsDetail(
    {
      ...row,
      description: "<p>Enter <b>the</b> landmark.</p><p>Second &amp; last.</p>",
      highlights: ["One", { text: "Two" }],
      whats_excluded: "Food\nDrinks",
      price: 12,
      currency: "EUR",
      ratings: { average: 4.64, total: 310 },
      cancellation: { policy: "flexible", window: "24" },
      images: [{ large: "https://images.example.com/x.jpg" }],
      prediscount_price: 99,
      discount_percentage: 50,
    },
    "5001",
  )!;
  assert.deepEqual(d.description, ["Enter the landmark.", "Second & last."]);
  assert.deepEqual(d.highlights, ["One", "Two"]);
  assert.deepEqual(d.exclusions, ["Food", "Drinks"]);
  assert.deepEqual(d.inclusions, []);
  assert.equal(d.bookingUrl, URL_OK, "affiliate URL byte for byte");
  assert.equal(d.cancellation?.summary, "Free cancellation up to 24h before");
  assert.deepEqual(d.rating, { value: 4.6, count: 310 });
  const json = JSON.stringify(d);
  assert.ok(!json.includes("images.example.com") && !json.includes("discount") && !json.includes("prediscount"), "no images, no invented discounts");
  const bare = mapTiqetsDetail(row, "5001")!;
  for (const k of ["price", "rating", "durationLabel", "cancellation", "openingInfo"]) assert.ok(!(k in bare), `${k} must not be invented`);
});

test("Tiqets detail refuses other cities, mismatched ids, bad hosts and unsafe ids", () => {
  assert.equal(mapTiqetsDetail({ ...row, city_name: "Reykjavik" }, "5001"), undefined);
  assert.equal(mapTiqetsDetail(row, "5002"), undefined);
  assert.equal(mapTiqetsDetail({ ...row, product_url: "https://tiqets.com.evil.example/x" }, "5001"), undefined);
  assert.equal(mapTiqetsDetail({ ...row, product_url: "http://www.tiqets.com/x" }, "5001"), undefined);
  assert.equal(mapTiqetsDetail(row, "5001/../x"), undefined);
  assert.equal(mapTiqetsDetail({ ...row, sale_status: "sold_out" }, "5001")!.onSale, false);
});

test("Tiqets availability: days, slots, ticket types without add-ons, and every degraded state", () => {
  const ok = mapTiqetsAvailability({
    sales_enabled: true,
    next_available_date: "2026-11-02",
    dates: [
      { date: "2026-11-02", availability: 5, price: 20, currency: "EUR", timeslots: [{ time: "10:00", availability: 2 }, { time: "12:00", availability: 0 }, { time: "whole_day", availability: 9 }] },
      { date: "2026-11-03", availability: 0, price: null },
      { date: "not-a-date", availability: 3 },
    ],
    variants: [{ id: 1, label: "Adult" }, { id: 2, label: "Audio", is_addon: true }],
  });
  assert.equal(ok.state, "ok");
  if (ok.state === "ok") {
    assert.deepEqual(ok.days.map((d) => d.date), ["2026-11-02", "2026-11-03"]);
    assert.deepEqual(ok.days[0].timeslots, ["10:00"]);
    assert.equal(ok.days[0].fromPrice?.label, "From €20");
    assert.equal(ok.days[1].available, false);
    assert.deepEqual(ok.ticketTypes.map((t) => t.label), ["Adult"]);
  }
  assert.equal(mapTiqetsAvailability({ sales_enabled: true, dates: [] }).state, "empty");
  assert.equal(mapTiqetsAvailability({ dates: [{ date: "2026-11-03", availability: 0 }] }).state, "empty");
  assert.deepEqual(mapTiqetsAvailability({ sales_enabled: false, dates: [] }), { state: "unavailable", reason: "sales-disabled" });
  assert.equal(mapTiqetsAvailability("garbage").state, "empty");
});

test("the Tiqets detail module contacts only product detail and availability GETs", () => {
  const src = readFileSync(new URL("../lib/marketplace/providers/tiqets-detail.ts", import.meta.url), "utf8");
  const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  // Every upstream path string handed to the HTTP helper (and any "/v2/..." literal) is read-only.
  const v2 = [...code.matchAll(/\/v2\/[A-Za-z0-9_/${}.?=&-]*/g)].map((m) => m[0]);
  assert.ok(v2.length >= 2);
  for (const p of v2) assert.doesNotMatch(p, /(orders?|bookings?|reserv|holds?|payments?|checkouts?|carts?)/i, p);
  assert.doesNotMatch(code, /method:\s*["'](POST|PUT|PATCH|DELETE)["']/);
  assert.doesNotMatch(code, /product_checkout_url/);
  const paths = [...code.matchAll(/tiqetsRequest\(\s*`([^`]+)`/g)].map((m) => m[1]);
  assert.deepEqual(paths.length, 2);
  for (const p of paths) assert.match(p, /^\/v2\/products\/\$\{id\}(\/availability\?.*)?$/);
});

// ------------------------------------------------------------ attraction photo match
const attraction = (name: string, credited = true): Attraction =>
  ({
    id: name, slug: name.toLowerCase().replace(/\W+/g, "-"), name, category: "Landmarks", description: "d",
    sourceUrl: "https://example.com", sourceLabel: "s", checked: "2026-10-23",
    photo: { src640: "/a.webp", src1280: "/a.webp", alt: `${name} photo`, ...(credited ? { credit: { title: "t", author: "a", license: "CC BY", licenseUrl: "https://x.test", sourceUrl: "https://x.test" } } : {}) },
  }) as Attraction;

test("a supplier product only gets a place photo on an exact, credited name match", () => {
  const list = [attraction("St. Stephen’s Basilica"), attraction("Chain Bridge"), attraction("Fisherman’s Bastion", false), attraction("Opera")];
  assert.equal(matchAttractionPhoto("St. Stephen's Basilica Entry Ticket", list)?.name, "St. Stephen’s Basilica");
  assert.equal(matchAttractionPhoto("Basilica Entry Ticket", list), undefined, "partial names never match");
  assert.equal(matchAttractionPhoto("Fisherman's Bastion Ticket", list), undefined, "uncredited photos are not used");
  assert.equal(matchAttractionPhoto("Opera House Tour", list), undefined, "very short names are too generic");
  assert.equal(matchAttractionPhoto("Chain Bridge Walking Tour", list)?.name, "Chain Bridge");
});
