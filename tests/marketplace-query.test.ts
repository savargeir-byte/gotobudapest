import assert from "node:assert/strict";
import test from "node:test";
import { hasFilters, parseQuery, toSearchParams } from "../lib/marketplace/query";

test("defaults and canonical round trip", () => {
  const q = parseQuery(new URLSearchParams(""));
  assert.deepEqual(q, { sort: "relevance" });
  assert.equal(hasFilters(q), false);
  const full = parseQuery(
    new URLSearchParams(
      "q=danube cruise&category=cruises&provider=viator&sort=price_asc&priceMin=10&priceMax=80.5&duration=2to5&rating=4.5",
    ),
  );
  assert.equal(
    toSearchParams(full).toString(),
    "q=danube+cruise&category=cruises&provider=viator&sort=price_asc&priceMin=10&priceMax=80.5&duration=2to5&rating=4.5",
  );
});

test("everything unknown, malformed or out of range is dropped or clamped", () => {
  const q = parseQuery({
    q: "  <script>alert(1)</script>\u0000  x".padEnd(300, "y"),
    category: "hacking",
    provider: "evil",
    sort: "drop table",
    priceMin: "-5",
    priceMax: "1e9",
    duration: "forever",
    rating: "9",
    cursor: "not valid!!",
  });
  assert.ok(q.q && q.q.length <= 80 && !/[<>\u0000]/.test(q.q));
  assert.equal(q.category, undefined);
  assert.equal(q.provider, undefined);
  assert.equal(q.sort, "relevance");
  assert.equal(q.priceMin, undefined);
  assert.equal(q.priceMax, undefined);
  assert.equal(q.duration, undefined);
  assert.equal(q.minRating, undefined);
  assert.equal(q.cursor, undefined);
});

test("reversed price bounds are swapped; array params take the first value", () => {
  const q = parseQuery({ priceMin: "90", priceMax: "20", category: ["food", "baths"] });
  assert.deepEqual([q.priceMin, q.priceMax, q.category], [20, 90, "food"]);
});
