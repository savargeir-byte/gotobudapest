import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { buildViatorSearchBody, mapViatorProduct, resolveTagIds, viatorSorting, type ViatorTag } from "../lib/marketplace/providers/viator";
import { mapTiqetsProduct } from "../lib/marketplace/providers/tiqets";
import { mapTourdeskItem, tourdeskTerm } from "../lib/marketplace/providers/tourdesk";
import { CATEGORY_TAG_PATTERNS } from "../lib/marketplace/categories";
import type { MarketplaceQuery } from "../lib/marketplace/types";

const q = (over: Partial<MarketplaceQuery> = {}): MarketplaceQuery => ({ sort: "relevance", ...over });
const PRODUCT_URL =
  "https://www.viator.com/tours/Budapest/Some-Tour/d684-ABC123?pid=P00X&mcid=42383&medium=api&campaign=gotobudapest&api_version=2.0&text=a%20b";

// ---------------------------------------------------------------------- Viator
test("Viator productUrl is preserved byte for byte; widest image, rating and flags only when supplied", () => {
  const p = mapViatorProduct(
    {
      productCode: "ABC123",
      title: "Danube Cruise",
      description: "<b>River</b> cruise",
      productUrl: PRODUCT_URL,
      destinations: [{ ref: "684" }],
      images: [{ isCover: true, variants: [{ url: "https://m.example.com/s.jpg", width: 200 }, { url: "https://m.example.com/l.jpg", width: 900 }] }],
      pricing: { summary: { fromPrice: 3 }, currency: "EUR" },
      reviews: { combinedAverageRating: 4.64, totalReviews: 120 },
      duration: { fixedDurationInMinutes: 90 },
      flags: ["FREE_CANCELLATION"],
    },
    "684",
  )!;
  assert.equal(p.bookingUrl, PRODUCT_URL);
  assert.equal(p.image?.src, "https://m.example.com/l.jpg");
  assert.deepEqual(p.rating, { value: 4.6, count: 120 });
  assert.equal(p.freeCancellation, true);
  assert.equal(p.price?.amount, 3);
  assert.equal(p.durationLabel, "1h 30m");
  assert.equal(p.summary, "River cruise");
  assert.equal(p.detailUrl, "/tours/viator/ABC123");

  const bare = mapViatorProduct(
    { productCode: "XYZ789", title: "Bare", productUrl: PRODUCT_URL, destinations: [{ ref: "684" }] },
    "684",
  )!;
  for (const k of ["rating", "freeCancellation", "image", "price", "durationMinutes"]) assert.ok(!(k in bare), `${k} must not be invented`);
});

test("Viator products with a foreign host, foreign destination or no URL are dropped", () => {
  const base = { productCode: "ABC123", title: "T", productUrl: PRODUCT_URL, destinations: [{ ref: "684" }] };
  assert.ok(mapViatorProduct(base, "684"));
  assert.equal(mapViatorProduct({ ...base, productUrl: "https://evil.example/x" }, "684"), undefined);
  assert.equal(mapViatorProduct({ ...base, productUrl: "http://www.viator.com/x" }, "684"), undefined);
  assert.equal(mapViatorProduct({ ...base, productUrl: "https://viator.com.evil.example/x" }, "684"), undefined);
  assert.equal(mapViatorProduct({ ...base, destinations: [{ ref: "905" }], title: "Reykjavik tour" }, "684"), undefined);
  assert.equal(mapViatorProduct({ ...base, productUrl: undefined }, "684"), undefined);
});

test("Viator search body follows the documented sort and filter rules", () => {
  assert.deepEqual(viatorSorting("relevance"), { sort: "DEFAULT" }); // no `order` for DEFAULT
  assert.ok(!("order" in viatorSorting("relevance")));
  assert.deepEqual(viatorSorting("rating"), { sort: "TRAVELER_RATING", order: "DESCENDING" });
  assert.deepEqual(viatorSorting("price_asc"), { sort: "PRICE", order: "ASCENDING" });
  assert.deepEqual(viatorSorting("price_desc"), { sort: "PRICE", order: "DESCENDING" });
  const body = buildViatorSearchBody(q({ sort: "price_asc", priceMin: 10, priceMax: 80, duration: "2to5", minRating: 4.5 }), "684", 19, 18, [11, 111]);
  assert.deepEqual(body, {
    filtering: {
      destination: "684",
      tags: [11, 111],
      lowestPrice: 10,
      highestPrice: 80,
      durationInMinutes: { from: 120, to: 300 },
      rating: { from: 4.5 },
    },
    sorting: { sort: "PRICE", order: "ASCENDING" },
    pagination: { start: 19, count: 18 },
    currency: "EUR",
  });
  assert.deepEqual(buildViatorSearchBody(q({ duration: "gt8" }), "684", 1, 24).filtering.durationInMinutes, { from: 480 });
});

test("tag resolution matches names and includes descendants only", () => {
  const tags = new Map<number, ViatorTag>([
    [1, { id: 1, name: "Cruises", parentTagIds: [] }],
    [2, { id: 2, name: "Day Cruises", parentTagIds: [1] }],
    [3, { id: 3, name: "Sunset Dinner Boat", parentTagIds: [2] }],
    [4, { id: 4, name: "Walking Tours", parentTagIds: [] }],
    [5, { id: 5, name: "Unrelated", parentTagIds: [4] }],
  ]);
  assert.deepEqual(resolveTagIds(tags, CATEGORY_TAG_PATTERNS.cruises).sort(), [1, 2, 3]);
  assert.deepEqual(resolveTagIds(tags, CATEGORY_TAG_PATTERNS.baths), []);
  assert.deepEqual(resolveTagIds(new Map(), CATEGORY_TAG_PATTERNS.cruises), []);
});

// ---------------------------------------------------------------------- Tiqets
test("Tiqets products never expose images and keep product_url unchanged", () => {
  const url = "https://www.tiqets.com/en/things-to-do-in-budapest-c68199/tickets-for-x-p5001/?partner=gotobudapest";
  const p = mapTiqetsProduct({
    id: 5001,
    title: "Basilica Entry",
    tagline: "Visit",
    price: 12,
    currency: "EUR",
    ratings: { average: 4.4, total: 30 },
    duration: "2 hours",
    city_name: "Budapest",
    product_url: url,
    sale_status: "available",
    images: [{ large: "https://images.example.com/t.jpg" }],
  })!;
  assert.equal(p.bookingUrl, url);
  assert.ok(!("image" in p));
  assert.equal(JSON.stringify(p).includes("images.example.com"), false);
  assert.equal(p.durationMinutes, 120);
  assert.deepEqual(p.rating, { value: 4.4, count: 30 });
  const ok = { id: 1, title: "T", city_name: "Budapest", product_url: url, sale_status: "available" };
  assert.ok(mapTiqetsProduct(ok));
  assert.equal(mapTiqetsProduct({ ...ok, sale_status: "sold_out" }), undefined);
  assert.equal(mapTiqetsProduct({ ...ok, city_name: "Prague" }), undefined);
  assert.equal(mapTiqetsProduct({ ...ok, product_url: "https://tiqets.com.evil.example/x" }), undefined);
  assert.equal(mapTiqetsProduct({ ...ok, product_url: "http://www.tiqets.com/x" }), undefined);
});

// ------------------------------------------------------------------- TourDesk
test("TourDesk items from other destinations are never shown as Budapest", () => {
  const item = {
    uniqueKey: "70001-1",
    title: "Budapest Food Tour",
    description: "Eat",
    price: 40,
    currency: "EUR",
    duration: 150,
    tourUrl: "https://checkout.tourdesk.is/budapest/70001-1",
  };
  const p = mapTourdeskItem(item)!;
  assert.equal(p.detailUrl, "/tours/tourdesk/70001-1");
  assert.equal(p.durationMinutes, 150);
  assert.ok(!("rating" in p));
  assert.equal(mapTourdeskItem({ ...item, title: "Reykjavik Golden Circle", description: "Iceland" }), undefined);
  assert.equal(mapTourdeskItem({ ...item, title: "Tenerife Whale Watching", description: "Canary Islands" }), undefined);
  assert.equal(mapTourdeskItem({ ...item, tourUrl: "https://checkout.tourdesk.is.evil.example/x" }), undefined);
  assert.equal(mapTourdeskItem({ ...item, uniqueKey: "weird key" })!.detailUrl, undefined);
  assert.equal(tourdeskTerm(q()), "Budapest");
  assert.equal(tourdeskTerm(q({ category: "cruises" })), "Budapest Danube cruise");
  assert.equal(tourdeskTerm(q({ q: "wine" })), "Budapest wine");
});

// ------------------------------------------------- read-only guarantee (grep)
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".ts") ? [p] : [];
  });
}

test("marketplace modules only use read-only catalogue endpoints", () => {
  const sources = [...files("lib/marketplace"), "app/api/marketplace/search/route.ts"];
  assert.ok(sources.length >= 10);
  const forbidden = /["'`]\/?(?:v2\/)?(availability|bookings?|reserve|hold|cart|checkout|TourBooking|TourAvailability|payments?|orders?)[/"'`?]/i;
  const calls = new Set<string>();
  for (const f of sources) {
    const text = readFileSync(f, "utf8");
    assert.doesNotMatch(text, forbidden, `${f} references a transactional endpoint`);
    assert.doesNotMatch(text, /method:\s*["'](PUT|PATCH|DELETE)["']/, `${f} uses a write method`);
    for (const m of text.matchAll(/method:\s*"POST"[\s\S]{0,200}/g)) calls.add(f + ":" + m[0].slice(0, 60));
    for (const m of text.matchAll(/["'`]\/(?:search\/freetext|products\/search|TourSearch|products\/tags|v2\/cities|v2\/products|destinations)/g)) calls.add(m[0]);
  }
  const allowed = ["/search/freetext", "/products/search", "/TourSearch", "/products/tags", "/v2/cities", "/v2/products"];
  for (const c of calls) if (!c.includes(":")) assert.ok(allowed.some((a) => c.includes(a)), c);
});
