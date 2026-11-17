import assert from "node:assert/strict";
import test from "node:test";
import { CITY_VIEWS, illustrativePhotoOf } from "../lib/marketplace/illustrative-photos";
import type { CategoryKey, MarketplaceProduct } from "../lib/marketplace/types";

function product(title: string, categories: CategoryKey[] = []): MarketplaceProduct {
  return {
    id: "tiqets:5001",
    provider: "tiqets",
    providerKey: "5001",
    title,
    categories,
    detailUrl: "/tours/tiqets/5001",
    bookingUrl: "https://www.tiqets.com/en/example",
  };
}

test("image-less Danube cruise has a real credited editorial cruise photo", () => {
  const p = illustrativePhotoOf(product("Budapest: Sightseeing Cruise", ["cruises", "walking"]));
  assert.equal(p?.relation, "illustrative");
  assert.equal(p?.venueSlug, "g-cruise");
  assert.match(p?.src640 ?? "", /^\/assets\/photos\/g-cruise-640\.webp$/);
  assert.ok(p?.credit.author && p.credit.license && p.credit.sourceUrl.startsWith("https://"));
});

test("multi-attraction Budapest Card receives city context, not a misleading photo of a single bath", () => {
  const p = illustrativePhotoOf(product("Budapest Card: 30+ Attractions with Szt. Lukacs Thermal Bath and Pool", ["baths"]));
  assert.equal(p?.venueSlug, "g-skyline");
  assert.equal(p?.relation, "illustrative");
});

test("actual named baths can use an identifiable venue photo with an illustrative disclosure", () => {
  assert.equal(illustrativePhotoOf(product("Lukács Spa: Thermal Bath Admission", ["baths"]))?.venueSlug, "lukacs-thermal-bath");
  assert.equal(illustrativePhotoOf(product("Széchenyi Spa: Full Day Entry Ticket", ["baths"]))?.venueSlug, "szechenyi-thermal-bath");
});

test("all marketplace categories have an explicitly illustrative, locally stored, licensed fallback", () => {
  const categories: CategoryKey[] = ["cruises", "baths", "walking", "food", "tickets", "daytrips", "transfers", "sightseeing", "nightlife", "family"];
  for (const category of categories) {
    const photo = illustrativePhotoOf(product("Budapest experience", [category]));
    assert.ok(photo, category);
    assert.equal(photo.relation, "illustrative", category);
    assert.match(photo.src640, /^\/assets\/photos\/[a-z0-9-]+-640\.webp$/);
    assert.match(photo.src1280, /^\/assets\/photos\/[a-z0-9-]+-1280\.webp$/);
    assert.ok(photo.credit.sourceUrl.includes("commons.wikimedia.org"), category);
    assert.ok(photo.credit.licenseUrl.startsWith("https://"), category);
  }
  assert.ok(CITY_VIEWS.some((v) => v.slug === illustrativePhotoOf(product("Unknown Budapest activity"))?.venueSlug));
});

test("a Danube Bend day trip is not shown with a river-cruise photograph", () => {
  const p = illustrativePhotoOf(product("Budapest: Full-Day Danube Bend Guided Tour with Lunch + Transport", ["daytrips"]));
  assert.notEqual(p?.venueSlug, "g-cruise");
  assert.ok(CITY_VIEWS.some((v) => v.slug === p?.venueSlug));
});

test("the choice is stable for one product and varies across products, all licensed and credited", () => {
  const titles = ["Walking Tour of Buda", "Walking Tour of Pest", "Budapest: Private Transfer from Budapest Airport", "Grand City Tour", "Trabant Car Private Tour", "Puszta Full-Day Tour"];
  const slugs = titles.map((t) => illustrativePhotoOf(product(t))?.venueSlug);
  assert.deepEqual(slugs, titles.map((t) => illustrativePhotoOf(product(t))?.venueSlug));
  assert.ok(new Set(slugs).size >= 2, "city views should vary between cards");
  // every picture in the pool is a locally stored, credited, open-licence photograph
  for (let i = 0; i < 200; i++) {
    const p = illustrativePhotoOf(product(`Budapest tour number ${i}`));
    assert.ok(p, `tour ${i}`);
    assert.match(p.src640, /^\/assets\/photos\/[a-z0-9-]+-640\.webp$/);
    assert.match(p.credit.license, /^(CC BY(-SA)? [0-9.]+|CC0.*|Public domain)$/i);
  }
  const used = new Set(Array.from({ length: 200 }, (_, i) => illustrativePhotoOf(product(`Budapest tour number ${i}`))?.venueSlug));
  assert.equal(used.size, CITY_VIEWS.length, "all city views are used");
});
