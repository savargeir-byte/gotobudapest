import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import baseline from "../lib/new-attractions/baseline.json";
import { newAttractionData, newAttractions, newPhotoRegistry, withNewNeighbourhoodPlaces } from "../lib/new-attractions";
import { newDayTripSlugs } from "../lib/new-attractions/day-trips";
import type { NewAttraction, NewPhoto } from "../lib/new-attractions/types";
import { validateAttraction, validateBatch, words, type Baseline } from "../lib/new-attractions/validate";

const base = baseline as unknown as Baseline;
const para = (n: number, seed = "stone") => Array.from({ length: n }, (_, i) => `${seed}${i % 7}`).join(" ") + ".";
const good: NewAttraction = {
  slug: "test-place-one",
  name: "Test Place One",
  nameHu: "Teszt Hely Egy",
  category: "Landmarks",
  address: "1 Example Street, Budapest",
  coordinates: { latitude: 47.5, longitude: 19.05 },
  district: "VII",
  neighbourhoods: ["jewish-quarter"],
  intro: "Alpha " + para(48, "intro"),
  about: [para(80, "about"), para(90, "more")],
  tips: ["Check the official page before you travel.", "Allow time for the walk from the nearest stop."],
  history: { intro: para(20, "hist"), sections: [{ heading: "Early years", paragraphs: [para(90, "early")] }] },
  sources: [
    { label: "Official site", url: "https://example.org/place" },
    { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Test" },
  ],
  relatedPlaces: ["chain-bridge"],
  relatedGuides: ["budapest-in-3-days"],
  photoKey: null,
  photoStatus: "needs-photography",
  seo: { title: "Test Place One in Budapest", description: "A short description of the test place that is comfortably longer than eighty characters in total." },
  checked: "2026-11-09",
};
const photos: Record<string, NewPhoto> = {};
const problems = (a: NewAttraction, p = photos) => validateAttraction(a, base, p).map((x) => x.problem);

test("a complete attraction passes the quality gate", () => {
  assert.deepEqual(problems(good), []);
});

test("prices, clock times and opening or admission statements are rejected", () => {
  for (const sentence of ["Tickets cost 3000 Ft for adults.", "Entry is 12 EUR.", "It opens at 9:30 every day.", "The museum is open daily and admission is free."]) {
    const bad = { ...good, about: [sentence + " " + para(80, "about"), good.about[1]] };
    assert.ok(problems(bad).length > 0, sentence);
  }
  // a distance or a year is not a clock time
  assert.deepEqual(problems({ ...good, about: [good.about[0] + " It is 2.5 km away and was built in 1896.", good.about[1]] }), []);
});

test("length, sources, neighbourhood, coordinates and licence rules are enforced", () => {
  assert.ok(problems({ ...good, intro: "Too short." }).some((p) => /intro has/.test(p)));
  assert.ok(problems({ ...good, about: ["short", "short"], history: { intro: "x", sections: [{ heading: "h", paragraphs: ["short"] }] } }).some((p) => /editorial text/.test(p)));
  assert.ok(problems({ ...good, sources: [good.sources[1]] }).some((p) => /two sources/.test(p)));
  assert.ok(problems({ ...good, sources: [{ label: "A", url: "https://en.wikipedia.org/wiki/A" }, { label: "B", url: "https://en.wikipedia.org/wiki/B" }] }).some((p) => /Wikipedia/.test(p)));
  assert.ok(problems({ ...good, neighbourhoods: ["atlantis"] }).some((p) => /unknown neighbourhood/.test(p)));
  assert.ok(problems({ ...good, coordinates: { latitude: 46.9, longitude: 19.1 } }).some((p) => /outside Budapest/.test(p)));
  assert.deepEqual(problems({ ...good, coordinates: { latitude: 47.6, longitude: 19.35 + 0.05 }, outsideBudapest: true, neighbourhoods: [], district: undefined }), []);
  assert.ok(problems({ ...good, outsideBudapest: true }).some((p) => /inside Budapest/.test(p)));
  assert.ok(problems({ ...good, relatedPlaces: ["no-such-place"] }).some((p) => /not an existing attraction/.test(p)));
  assert.ok(problems({ ...good, relatedGuides: ["no-such-guide"] }).some((p) => /unknown guide/.test(p)));
  const withPhoto = { ...good, photoKey: "test-place-one", photoStatus: "ok" as const };
  assert.ok(problems(withPhoto).some((p) => /no photo registry entry/.test(p)));
  const reg = (license: string): Record<string, NewPhoto> => ({
    "test-place-one": {
      src640: "/assets/photos/test-place-one-640.webp",
      src1280: "/assets/photos/test-place-one-1280.webp",
      width: 1280,
      height: 853,
      alt: "The facade of the test place seen from the street",
      credit: { title: "File.jpg", author: "A. Photographer", license, licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:File.jpg" },
    },
  });
  assert.deepEqual(problems(withPhoto, reg("CC BY-SA 4.0")), []);
  assert.ok(problems(withPhoto, reg("All rights reserved")).some((p) => /licence/.test(p)));
});

test("duplicates of existing slugs and names are rejected", () => {
  const dupSlug = validateBatch([{ ...good, slug: "chain-bridge" }], base, photos).map((x) => x.problem);
  assert.ok(dupSlug.some((p) => /already exists/.test(p)));
  const dupName = validateBatch([{ ...good, name: "Chain Bridge" }], base, photos).map((x) => x.problem);
  assert.ok(dupName.some((p) => /duplicates existing attraction/.test(p)));
  const twice = validateBatch([good, good], base, photos).map((x) => x.problem);
  assert.ok(twice.some((p) => /appears 2 times/.test(p)));
});

test("the baseline holds the published Sanity attractions, the local list and the three supplements", () => {
  assert.ok(base.sanity.length >= 127);
  assert.ok(base.local.length >= 116);
  assert.equal(base.neighbourhoods.length, 35);
  for (const s of ["memento-park", "godollo-royal-palace", "szimpla-kert"]) assert.ok(base.supplements.includes(s));
});

test("every shipped batch passes the gate together, and the generated index is up to date", () => {
  const dir = path.join(__dirname, "..", "lib", "new-attractions", "data");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const batchFiles = files.filter((f) => f.startsWith("batch-"));
  const all = batchFiles.flatMap((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as NewAttraction[]);
  assert.equal(newAttractionData.length, all.length, "run: node scripts/gen-new-attractions.mjs");
  assert.deepEqual(
    newDayTripSlugs,
    all.filter((d) => d.outsideBudapest).map((d) => d.slug).sort(),
    "day-trips.ts is stale: run node scripts/gen-new-attractions.mjs",
  );
  assert.deepEqual(validateBatch(all, base, newPhotoRegistry), []);
  assert.equal(newAttractions.length, all.length);
  for (const a of newAttractions) {
    assert.ok(a.description && words(a.description) >= 40);
    assert.ok(a.body && a.body.length > 2);
    assert.ok(a.history?.sections.length);
  }
});

test("neighbourhood pages list the new places that name them, after their existing places", () => {
  const out = withNewNeighbourhoodPlaces([{ slug: "jewish-quarter", placeSlugs: ["a"] }, { slug: "nowhere-else", placeSlugs: [] }]);
  assert.deepEqual(out[0].placeSlugs.slice(0, 1), ["a"]);
  assert.deepEqual(out[1].placeSlugs, []);
  const names = new Set(newAttractionData.filter((d) => d.neighbourhoods.includes("jewish-quarter")).map((d) => d.slug));
  assert.deepEqual(new Set(out[0].placeSlugs.slice(1)), names);
});
