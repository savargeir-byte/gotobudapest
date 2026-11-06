import assert from "node:assert/strict";
import test from "node:test";
import { viatorBookable } from "../lib/booking/viator-product";
import { mapViatorProduct } from "../lib/marketplace/providers/viator";

// A listing card must never lead to a detail page that is guaranteed to fail: the listing mapper
// and the detail path share ONE acceptance rule (viatorBookable).

const DEST = "684";
const URL_OK = "https://www.viator.com/tours/Budapest/Danube-Cruise/d684-ABC123?pid=P00X&mcid=42383&medium=api&campaign=gotobudapest";
const base = { productCode: "ABC123", title: "Danube Cruise", productUrl: URL_OK, destinations: [{ ref: 684 }] };

test("a product with the Budapest destination ref and a direct tour URL is kept, URL untouched", () => {
  const p = mapViatorProduct(base, DEST);
  assert.ok(p);
  assert.equal(p.bookingUrl, URL_OK);
  assert.equal(p.detailUrl, "/tours/viator/ABC123");
  assert.deepEqual(viatorBookable(base, "ABC123", DEST), { ok: true, url: URL_OK });
});

test("a text-only Budapest mention without the destination ref is dropped", () => {
  const vienna = {
    productCode: "VIE001",
    title: "Vienna day trip from Budapest",
    description: "Leave Budapest early and see Vienna",
    productUrl: "https://www.viator.com/tours/Vienna/Day-Trip/d454-VIE001?pid=P00X",
    destinations: [{ ref: "454" }],
  };
  assert.equal(mapViatorProduct(vienna, DEST), undefined);
  assert.equal(mapViatorProduct({ ...vienna, destinations: [] }, DEST), undefined);
  assert.equal(mapViatorProduct({ ...vienna, destinations: undefined }, DEST), undefined);
  assert.deepEqual(viatorBookable(vienna, "VIE001", DEST), { ok: false, status: 404, message: "Budapest product not found" });
});

test("a product whose URL is not a direct /tours/ page for its code is dropped", () => {
  assert.equal(mapViatorProduct({ ...base, productUrl: "https://www.viator.com/Budapest/d684-ttd?pid=P00X" }, DEST), undefined);
  assert.equal(
    mapViatorProduct({ ...base, productUrl: "https://www.viator.com/tours/Budapest/Danube-Cruise/d684-OTHER9?pid=P00X" }, DEST),
    undefined,
  );
  const r = viatorBookable({ ...base, productUrl: "https://www.viator.com/searchResults/all?text=x" }, "ABC123", DEST);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.status, 502);
});

test("the listing and the detail rule agree on every case", () => {
  const cases: [string, Record<string, unknown>][] = [
    ["ok", base],
    ["no ref", { ...base, destinations: [{ ref: "454" }] }],
    ["lander url", { ...base, productUrl: "https://www.viator.com/Budapest/d684-ttd" }],
    ["foreign host", { ...base, productUrl: "https://evil.example/tours/x/d684-ABC123" }],
    ["no title", { ...base, title: "" }],
  ];
  for (const [name, row] of cases) {
    assert.equal(Boolean(mapViatorProduct(row, DEST)), viatorBookable(row, "ABC123", DEST).ok, name);
  }
});
