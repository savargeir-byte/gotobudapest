import assert from "node:assert/strict";
import test from "node:test";
import { distanceMeters, formatDistance, nearbyPlaces } from "../lib/nearby";
import { attractions } from "../lib/attractions";

const at = (latitude: number, longitude: number) => ({ latitude, longitude });

test("distance is the great-circle distance: zero for the same point, symmetric, and about right for a known pair", () => {
  assert.equal(distanceMeters(at(47.5, 19.04), at(47.5, 19.04)), 0);
  const a = at(47.4979, 19.0402);
  const b = at(47.5007, 19.0461);
  assert.equal(Math.round(distanceMeters(a, b)), Math.round(distanceMeters(b, a)));
  // One degree of latitude is about 111.2 km.
  assert.ok(Math.abs(distanceMeters(at(47, 19), at(48, 19)) - 111_195) < 300);
});

test("distances are rounded and labelled, never made more exact than the data", () => {
  assert.equal(formatDistance(430), "about 450 m");
  assert.equal(formatDistance(20), "about 50 m");
  assert.equal(formatDistance(1260), "about 1.3 km");
});

test("nearest places come first, the place itself and places without coordinates are left out, a radius applies", () => {
  const here = { slug: "here", name: "Here", coordinates: at(47.5, 19.04) };
  const all = [
    here,
    { slug: "far", name: "Far", coordinates: at(47.6, 19.2) },
    { slug: "b", name: "B", coordinates: at(47.502, 19.04) },
    { slug: "a", name: "A", coordinates: at(47.501, 19.04) },
    { slug: "none", name: "No coordinates" },
  ];
  assert.deepEqual(nearbyPlaces(here, all).map((n) => n.place.slug), ["a", "b"]);
  assert.deepEqual(nearbyPlaces(here, all, { max: 1 }).map((n) => n.place.slug), ["a"]);
  assert.deepEqual(nearbyPlaces({ slug: "x", name: "X" }, all), [], "no coordinates, no neighbours");
});

test("on the real directory: the Chain Bridge has close neighbours and none is itself or further than the radius", () => {
  const bridge = attractions.find((a) => a.slug === "chain-bridge")!;
  const near = nearbyPlaces(bridge, attractions);
  assert.ok(near.length >= 2, "a central landmark has neighbours");
  for (const n of near) {
    assert.notEqual(n.place.slug, "chain-bridge");
    assert.ok(n.meters <= 1500);
  }
  assert.deepEqual(near.map((n) => n.meters), [...near.map((n) => n.meters)].sort((x, y) => x - y));
});
