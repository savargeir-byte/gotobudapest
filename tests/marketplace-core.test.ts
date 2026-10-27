import assert from "node:assert/strict";
import test from "node:test";
import { InvalidCursorError, decodeCursor, encodeCursor } from "../lib/marketplace/cursor";
import { canonicalKey, dedupePage } from "../lib/marketplace/dedupe";
import { classify, inCategory, relevant } from "../lib/marketplace/categories";
import { sortPage } from "../lib/marketplace/registry";
import { parseQuery } from "../lib/marketplace/query";
import { parseDurationMinutes } from "../lib/marketplace/util";
import type { MarketplaceProduct, MarketplaceQuery } from "../lib/marketplace/types";

const q = (over: Partial<MarketplaceQuery> = {}): MarketplaceQuery => ({ sort: "relevance", ...over });
const prod = (id: string, title: string, provider: MarketplaceProduct["provider"], extra: Partial<MarketplaceProduct> = {}): MarketplaceProduct => ({
  id: `${provider}:${id}`,
  provider,
  providerKey: id,
  title,
  categories: [],
  bookingUrl: "https://example.com/x",
  ...extra,
});

// ---------------------------------------------------------------------- cursor
test("cursor round trips and is bound to its query", () => {
  const query = q({ q: "danube", category: "cruises" });
  const c = encodeCursor({ p: { viator: 19, tiqets: 2 }, d: ["tourdesk"], s: ["abcdef", "ghijkl"] }, query);
  assert.ok(c.length < 600);
  assert.deepEqual(decodeCursor(c, query), { p: { viator: 19, tiqets: 2 }, d: ["tourdesk"], s: ["abcdef", "ghijkl"] });
  assert.throws(() => decodeCursor(c, q({ q: "other" })), InvalidCursorError);
});

test("tampered, oversized or malformed cursors are rejected", () => {
  const query = q();
  const good = encodeCursor({ p: { viator: 19 }, d: [], s: [] }, query);
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o), "utf8").toString("base64url");
  const hash = JSON.parse(Buffer.from(good, "base64url").toString()).q;
  const bad = [
    "not base64!!",
    "x".repeat(1700),
    b64([]),
    b64({ q: hash, p: {}, d: [] }), // missing key
    b64({ q: hash, p: { viator: -1 }, d: [], s: "" }),
    b64({ q: hash, p: { viator: 1.5 }, d: [], s: "" }),
    b64({ q: hash, p: { viator: 999999999 }, d: [], s: "" }),
    b64({ q: hash, p: { evil: 3 }, d: [], s: "" }),
    b64({ q: hash, p: {}, d: ["evil"], s: "" }),
    b64({ q: hash, p: {}, d: [], s: "abc" }), // not a multiple of 6
    b64({ q: hash, p: {}, d: [], s: "a".repeat(6 * 151) }),
    b64({ q: hash, p: {}, d: [], s: "a b c " }),
    b64({ q: hash, p: {}, d: [], s: "", extra: 1 }),
    Buffer.from("{not json", "utf8").toString("base64url"),
  ];
  for (const c of bad) assert.throws(() => decodeCursor(c, query), InvalidCursorError, c.slice(0, 20));
  assert.doesNotThrow(() => decodeCursor(good, query));
});

test("the cursor keeps at most 150 seen hashes and stays below the URL limit", () => {
  const seen = Array.from({ length: 400 }, (_, i) => String(i).padStart(6, "0"));
  const c = encodeCursor({ p: { viator: 19, tiqets: 3, tourdesk: 3 }, d: [], s: seen }, q());
  assert.ok(c.length <= 1600);
  assert.equal(decodeCursor(c, q()).s.length, 150);
  assert.equal(parseQuery({ cursor: c }).cursor, c, "query.ts must accept the longest cursor");
});

// ---------------------------------------------------------------------- dedupe
test("canonical keys are conservative: distinct variants are never collapsed", () => {
  for (const t of ["Budapest Private Danube Cruise", "VIP Parliament Tour", "Guided Basilica Visit", "Airport Transfer Budapest", "Sunset Cruise", "Small-Group Food Tour", "Skip-the-line Tickets", "Danube Cruise Combo"])
    assert.equal(canonicalKey(t), null, t);
  assert.equal(canonicalKey("Budapest Danube River Cruise"), "budapest danube river cruise");
  assert.equal(canonicalKey("Basilica: Entry Ticket"), "basilica");
  assert.equal(canonicalKey("Basilica Entry Tickets"), "basilica");
  assert.equal(canonicalKey("A"), null);
});

test("duplicates across providers collapse in place and TourDesk wins ties", () => {
  const items = [
    prod("1", "Budapest Danube River Cruise", "viator"),
    prod("2", "Budapest Danube River Cruise", "tiqets"),
    prod("3", "Budapest Danube River Cruise", "tourdesk"),
    prod("4", "VIP Budapest Danube River Cruise", "viator"),
    prod("5", "Private Danube Cruise", "viator"),
    prod("6", "Private Danube Cruise", "tiqets"),
  ];
  const { items: out, seen } = dedupePage(items);
  assert.deepEqual(out.map((p) => p.id), ["tourdesk:3", "viator:4", "viator:5", "tiqets:6"]);
  assert.equal(seen.length, 1);
});

test("products already shown on earlier pages are dropped via the carried hashes", () => {
  const first = dedupePage([prod("1", "Budapest Danube River Cruise", "viator")]);
  const second = dedupePage([prod("2", "Budapest Danube River Cruise", "tourdesk"), prod("3", "Another Walk", "viator")], new Set(first.seen));
  assert.deepEqual(second.items.map((p) => p.id), ["viator:3"]);
  assert.deepEqual(dedupePage([prod("1", "A", "viator"), prod("1", "A", "viator")]).items.length, 1);
});

// ------------------------------------------------------------------ categories
test("categories classify on the supplied text and a product can have several", () => {
  assert.ok(classify("Danube River Cruise with Dinner").includes("cruises"));
  assert.ok(classify("Danube River Cruise with Dinner").includes("food"));
  assert.ok(classify("Széchenyi Thermal Bath Entry").includes("baths"));
  assert.ok(classify("Parliament Skip-the-Line Tickets").includes("tickets"));
  assert.ok(classify("Szentendre Day Trip from Budapest").includes("daytrips"));
  assert.ok(classify("Budapest Airport Transfer").includes("transfers"));
  assert.deepEqual(classify("Something unrelated"), []);
  assert.equal(inCategory("Evening cruise", "cruises"), true);
  assert.equal(inCategory("Evening cruise", "baths"), false);
});

test("the relevance guard ignores the destination word and short tokens", () => {
  assert.equal(relevant("Budapest Food Tour", "budapest"), true);
  assert.equal(relevant("Parliament tour", "danube cruise"), false);
  assert.equal(relevant("Danube sunset", "danube cruise"), true);
  assert.equal(relevant("anything", undefined), true);
  assert.equal(relevant("anything", "go"), true);
});

test("durations are parsed only when the supplied text is unambiguous", () => {
  assert.equal(parseDurationMinutes("2 hours"), 120);
  assert.equal(parseDurationMinutes("1.5 hours"), 90);
  assert.equal(parseDurationMinutes("90 minutes"), 90);
  assert.equal(parseDurationMinutes("2h 30m"), 150);
  assert.equal(parseDurationMinutes("flexible"), undefined);
  assert.equal(parseDurationMinutes(undefined), undefined);
});

// ----------------------------------------------------------------------- sort
test("local sorting is stable and puts products without the field last", () => {
  const items = [
    prod("a", "A", "viator", { price: { amount: 30, currency: "EUR", label: "" }, rating: { value: 4.2, count: 5 } }),
    prod("b", "B", "tourdesk", { price: { amount: 12000, currency: "ISK", label: "" } }),
    prod("c", "C", "tiqets", { price: { amount: 10, currency: "EUR", label: "" }, rating: { value: 4.8, count: 2 } }),
    prod("d", "D", "viator", {}),
    prod("e", "E", "viator", { price: { amount: 30, currency: "EUR", label: "" }, rating: { value: 4.2, count: 9 } }),
  ];
  assert.deepEqual(sortPage(items, "price_asc").map((p) => p.providerKey), ["c", "a", "e", "b", "d"]);
  assert.deepEqual(sortPage(items, "price_desc").map((p) => p.providerKey), ["a", "e", "c", "b", "d"]);
  assert.deepEqual(sortPage(items, "rating").map((p) => p.providerKey), ["c", "e", "a", "b", "d"]);
  assert.deepEqual(sortPage(items, "relevance").map((p) => p.providerKey), ["a", "b", "c", "d", "e"]);
});
