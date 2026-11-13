import assert from "node:assert/strict";
import test from "node:test";
import { HOMEPAGE_CATEGORIES, selectHomepageProducts } from "../lib/marketplace/homepage";
import type { CategoryKey, MarketplaceProduct, Provider } from "../lib/marketplace/types";

const item = (id: string, provider: Provider, categories: CategoryKey[]): MarketplaceProduct => ({
  id,
  provider,
  providerKey: id.split(":")[1],
  title: "Actual Budapest experience " + id,
  categories,
  detailUrl: "/tours/" + provider + "/" + id.split(":")[1],
  bookingUrl: "https://example.com/affiliate/" + id,
});

test("homepage has visible routes to key bookable Budapest categories", () => {
  assert.deepEqual(HOMEPAGE_CATEGORIES.map((x) => x.key), ["cruises", "baths", "walking", "tickets", "daytrips", "food"]);
});

test("homepage selects diverse relevant products and never repeats a multi-category product", () => {
  const result = selectHomepageProducts([
    item("viator:1", "viator", ["cruises", "walking"]),
    item("tiqets:2", "tiqets", ["cruises"]),
    item("tiqets:3", "tiqets", ["baths"]),
    item("viator:4", "viator", ["walking"]),
    item("viator:5", "viator", ["daytrips"]),
    item("tiqets:6", "tiqets", ["tickets"]),
    item("viator:7", "viator", ["food"]),
  ]);
  assert.equal(result.length, 6);
  assert.equal(new Set(result.map((p) => p.id)).size, 6);
  assert.deepEqual(result.map((p) => p.id), ["tiqets:2", "tiqets:3", "viator:1", "tiqets:6", "viator:5", "viator:7"]);
});

test("homepage respects TourDesk then Tiqets then Viator when products fit the same category", () => {
  assert.deepEqual(selectHomepageProducts([
    item("viator:1", "viator", ["cruises"]),
    item("tiqets:2", "tiqets", ["cruises"]),
    item("tourdesk:3", "tourdesk", ["cruises"]),
  ], 1).map((p) => p.provider), ["tourdesk"]);
});

test("homepage refuses products without a concrete booking handoff or internal product page", () => {
  const a = item("viator:10", "viator", ["cruises"]);
  assert.deepEqual(selectHomepageProducts([
    { ...a, detailUrl: undefined },
    { ...a, id: "viator:11", title: " " },
    { ...a, id: "viator:12", bookingUrl: "" },
    item("tiqets:13", "tiqets", ["tickets"]),
  ]).map((p) => p.id), ["tiqets:13"]);
  assert.deepEqual(selectHomepageProducts([a], 0), []);
});

test("homepage highlights genuinely relevant products with real imagery before photo-less listings", () => {
  const noPhotoCruise = { ...item("tiqets:100", "tiqets", ["cruises"]), title: "Budapest sightseeing cruise" };
  const picturedCruise = {
    ...item("viator:101", "viator", ["cruises"]),
    title: "Budapest Danube river cruise with drink",
    image: { src: "https://example.com/cruise.jpg", alt: "Supplier photograph of the cruise" },
  };
  const incorrectlyCategorisedCruise = {
    ...item("tiqets:102", "tiqets", ["baths"]),
    title: "Unlimited Prosecco Danube Cruise",
    image: { src: "https://example.com/another-cruise.jpg", alt: "Cruise" },
  };
  const realBath = {
    ...item("viator:103", "viator", ["baths"]),
    title: "Széchenyi thermal spa entry ticket",
    image: { src: "https://example.com/bath.jpg", alt: "Supplier photograph of the spa" },
  };
  assert.deepEqual(
    selectHomepageProducts([noPhotoCruise, picturedCruise, incorrectlyCategorisedCruise, realBath], 2).map((p) => p.id),
    ["viator:101", "viator:103"],
  );
});

test("a real photo never overrides more precise product-category relevance", () => {
  const bad = { ...item("viator:201", "viator", ["baths"]), title: "Danube river cruise", image: { src: "https://example.com/boat.jpg", alt: "Boat" } };
  const good = { ...item("tiqets:202", "tiqets", ["baths"]), title: "Budapest thermal baths ticket" };
  assert.equal(selectHomepageProducts([bad, good], 1)[0].id, "tiqets:202");
});

test("food experiences feature real food tours before another dinner cruise", () => {
  const photo = { src: "https://example.com/legitimate.jpg", alt: "Actual supplier image" };
  const dinnerCruise = { ...item("viator:301", "viator", ["food"]), title: "Danube Dinner Cruise with Live Music", image: photo };
  const foodTour = { ...item("viator:302", "viator", ["food"]), title: "Budapest Food Tour: Market to Tavern", image: photo };
  assert.deepEqual(selectHomepageProducts([dinnerCruise, foodTour], 1).map((p) => p.id), ["viator:302"]);
});
