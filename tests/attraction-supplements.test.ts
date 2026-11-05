import assert from "node:assert/strict";
import test from "node:test";
import { supplementAttractions, withSupplements } from "../lib/attraction-supplements";
import { attractions as local } from "../lib/attractions";
import { areaFallback, attractionContext } from "../lib/marketplace/context";
import { blocksToPlainText } from "../lib/portable-text";
import type { Attraction } from "../lib/types";

const text = (a: Attraction) =>
  [a.description, blocksToPlainText(a.body), a.history?.intro, ...(a.history?.sections ?? []).map((s) => blocksToPlainText(s.body))].join("\n");

test("there are three supplements and none duplicates a local attraction or another supplement", () => {
  assert.deepEqual(supplementAttractions.map((a) => a.slug), ["memento-park", "godollo-royal-palace", "szimpla-kert"]);
  const slugs = [...local.map((a) => a.slug), ...supplementAttractions.map((a) => a.slug)];
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every supplement is complete: sources over https, coordinates in the Budapest area, a checked date, history and text", () => {
  for (const a of supplementAttractions) {
    assert.match(a.sourceUrl, /^https:\/\//, a.slug);
    assert.ok(a.sourceLabel && a.address, a.slug);
    assert.match(a.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(a.coordinates && a.coordinates.latitude > 47.3 && a.coordinates.latitude < 47.7, a.slug);
    assert.ok(a.coordinates && a.coordinates.longitude > 18.8 && a.coordinates.longitude < 19.5, a.slug);
    assert.ok(a.description.length > 80 && a.description.length < 400, a.slug);
    assert.ok((a.body?.length ?? 0) >= 6, `${a.slug}: About text, tips and sources`);
    assert.ok(a.history && a.history.sections.length >= 2 && a.history.sources.length >= 2, a.slug);
    for (const s of a.history!.sources) assert.match(s.url, /^https:\/\//);
    assert.ok(a.seo?.title && a.seo.description && a.seo.description.length <= 200, a.slug);
    assert.ok(a.relatedGuides && a.relatedGuides.length >= 1, a.slug);
  }
});

test("each supplement shows a photograph of the place itself with a complete licence credit", () => {
  for (const a of supplementAttractions) {
    assert.ok(a.photo, `${a.slug} has a photo`);
    assert.match(a.photo!.src1280, /^\/assets\/photos\//);
    const c = a.photo!.credit!;
    assert.ok(c.author && c.title && c.license, a.slug);
    assert.match(c.licenseUrl, /^https:\/\//);
    assert.match(c.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
  }
});

test("no price, currency, availability or booking promise is written into the editorial text", () => {
  for (const a of supplementAttractions) {
    const t = text(a);
    assert.doesNotMatch(t, /[€$£]|\b(HUF|EUR|USD|Ft)\b|\bfrom \d/i, `${a.slug}: no price`);
    assert.doesNotMatch(t, /\b(book now|sold out|available today|skip the line|best price|guaranteed)\b/i, a.slug);
    assert.doesNotMatch(t, /\b(open|opens|closes?)\b[^.]*\b\d{1,2}[:.]\d{2}\b/i, `${a.slug}: no opening hours`);
  }
});

test("the Gödöllő page carries the operator's renovation notice; the others have none", () => {
  const g = supplementAttractions.find((a) => a.slug === "godollo-royal-palace")!;
  assert.match(g.notice ?? "", /rehabilitation programme/);
  assert.equal(supplementAttractions.filter((a) => a.notice).length, 1);
});

test("withSupplements adds only what the dataset lacks, and a dataset slug always wins", () => {
  const edited = { ...supplementAttractions[0], name: "Edited in Studio", description: "Studio text" };
  const out = withSupplements([...(local as unknown as Attraction[]).slice(0, 3), edited]);
  assert.equal(out.filter((a) => a.slug === "memento-park").length, 1);
  assert.equal(out.find((a) => a.slug === "memento-park")!.name, "Edited in Studio");
  assert.ok(out.some((a) => a.slug === "godollo-royal-palace") && out.some((a) => a.slug === "szimpla-kert"));
  assert.equal(withSupplements(out).length, out.length, "idempotent");
});

test("product matching for the new places: Gödöllő by town name, Szimpla through the nightlife row, Memento by name", () => {
  assert.deepEqual(attractionContext("Royal Palace of Gödöllő", "godollo-royal-palace")?.require, ["godollo"]);
  assert.equal(attractionContext("Szimpla Kert", "szimpla-kert"), undefined);
  assert.deepEqual(attractionContext("Memento Park", "memento-park")?.require, ["memento"]);
});

test("the wider-category row is a plain category query, honestly worded, and never invents a product", () => {
  const bath = areaFallback("Baths & wellness", "Lukács Thermal Bath")!;
  assert.deepEqual(bath.context, { category: "baths" });
  assert.match(bath.description, /not tickets for Lukács Thermal Bath/);
  assert.equal(areaFallback("Museums", "X")!.context.category, "tickets");
  assert.equal(areaFallback("Landmarks", "X")!.context.category, "walking");
  assert.equal(areaFallback("Food & markets", "X")!.context.category, "food");
  assert.equal(areaFallback("Nightlife", "Szimpla Kert", "szimpla-kert")!.context.category, "nightlife");
  assert.equal(areaFallback("Museums", "Memento Park", "memento-park")!.context.category, "daytrips");
  assert.equal(areaFallback("Something else", "X"), undefined);
  for (const c of ["Baths & wellness", "Landmarks", "Museums", "Food & markets", "Nightlife"]) {
    const f = areaFallback(c, "Place")!;
    assert.equal(f.context.titleOnly, undefined, "a category row is not a title match");
    assert.doesNotMatch(f.heading + f.description, /[€$£]/);
  }
});
