import { existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
const attractions = JSON.parse(
  readFileSync(new URL("../lib/attractions.json", import.meta.url), "utf8"),
);
assert.equal(attractions.length, 100, "Expected 100 attractions");
assert.equal(
  new Set(attractions.map((a) => a.slug)).size,
  100,
  "Duplicate attraction slug",
);
for (const a of attractions) {
  assert.match(a.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  for (const field of [
    "name",
    "description",
    "category",
    "sourceUrl",
    "checked",
  ])
    assert.ok(a[field], `${a.slug}: missing ${field}`);
  assert.equal(new URL(a.sourceUrl).protocol, "https:");
  if (a.coordinates) {
    assert.ok(a.coordinates.latitude > 47 && a.coordinates.latitude < 48);
    assert.ok(a.coordinates.longitude > 18 && a.coordinates.longitude < 20);
  }
  if (a.status?.startsWith("Closed")) assert.ok(a.notice);
}

const additionalSource = readFileSync(
  new URL("../lib/additional-attractions.ts", import.meta.url), "utf8",
);
const additionalSlugs = [
  ...additionalSource.matchAll(/^\s*slug:\s*"([^"]+)"/gm),
].map((match) => match[1]);
const additionalImages = [
  ...additionalSource.matchAll(/^\s*image:\s*"([^"]+)"/gm),
].map((match) => match[1]);
assert.equal(additionalSlugs.length, 16, "Expected 16 new sacred architecture attractions");
assert.equal(additionalImages.length, additionalSlugs.length, "Every new attraction needs its own photographed image");
assert.equal(new Set(additionalSlugs).size, 16, "Duplicate new attraction slug");
const existingSlugs = new Set(attractions.map((a) => a.slug));
for (const slug of additionalSlugs) {
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(!existingSlugs.has(slug), `Additional attraction duplicates existing one: ${slug}`);
}

const checks = JSON.parse(
  readFileSync(
    new URL("../docs/attraction-source-checks.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(checks.length, 100);
assert.ok(checks.every((c) => c.httpStatus === 200));
const photos = JSON.parse(
  readFileSync(new URL("../lib/photos.json", import.meta.url), "utf8"),
);
const allowed = /^(CC0|CC BY(-SA)?( [0-9.]+)?( [a-z]{2})?|Public domain|PD.*|Attribution)$/i;
for (const [key, p] of Object.entries(photos)) {
  for (const f of [p.src640, p.src1280])
    assert.ok(
      existsSync(new URL("../public" + f, import.meta.url)),
      `${key}: missing file ${f}`,
    );
  assert.ok(p.alt && p.alt.length > 15, `${key}: alt text too short`);
  assert.ok(p.credit?.sourceUrl?.startsWith("https://"), `${key}: no source`);
  assert.match(p.credit.license, allowed, `${key}: licence ${p.credit.license}`);
  assert.ok(p.credit.author, `${key}: no author`);
}
for (const a of attractions)
  if (a.image)
    assert.ok(
      existsSync(new URL("../public/assets/" + a.image, import.meta.url)),
      `${a.slug}: missing ${a.image}`,
    );
console.log(
  `Content checks passed: 116 unique places (100 original + 16 sacred heritage), ${attractions.filter((a) => a.coordinates).length} source-provided coordinate pairs, 100 source checks, ${Object.keys(photos).length} photograph entries verified.`,
);
