import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const existing = JSON.parse(read("lib/attractions.json"));
const baseline = read("lib/attraction-editorial.ts");
const batchA = read("lib/attraction-history-batch-a.ts");
const batchB = read("lib/attraction-history-batch-b.ts");
const batchC = read("lib/attraction-history-batch-c.ts");
const aggregator = read("lib/attraction-editorial-expanded.ts");
const slugsA = [...batchA.matchAll(/^\s+slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const slugsB = [...batchB.matchAll(/^\s+slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const slugsC = [...batchC.matchAll(/^\s+slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const slugs = [...slugsA, ...slugsB, ...slugsC];
const baselineSlugs = [...baseline.matchAll(/^\s+"([a-z0-9-]+)":\s*\{/gm)].map((m) => m[1]);
const catalog = new Map(existing.map((place) => [place.slug, place]));
assert.equal(slugsA.length, 25, "Batch A must have exactly 25 attractions");
assert.equal(slugsB.length, 25, "Batch B must have exactly 25 attractions");
assert.ok(slugsC.length >= 1, "Batch C must not be empty");
assert.equal(new Set(slugs).size, 50 + slugsC.length, "Duplicate new editorial slug");
for (const slug of slugs) {
  assert.ok(catalog.has(slug), `Unknown attraction: ${slug}`);
  assert.ok(!baselineSlugs.includes(slug), `New history overwrites existing article: ${slug}`);
  const place = catalog.get(slug);
  assert.ok(place.sourceUrl.startsWith("https://"), `Missing source: ${slug}`);
  assert.ok(place.description.length > 20, `Missing attraction description: ${slug}`);
}
assert.ok(aggregator.includes("chapters.map"), "History chapters are not converted to rendered sections");
assert.ok(aggregator.includes("place.sourceUrl"), "Published sources not attached");
assert.ok(baseline.includes("expandedAttractionEditorial[slug]"), "New histories not connected to attraction page lookup");
const toCount = (text) => (text.match(/^\s+\["[^"\n]+", "/gm) ?? []).length;
assert.equal(toCount(batchA), 50, "Each batch A article requires two chapters");
assert.equal(toCount(batchB), 50, "Each batch B article requires two chapters");
// Batch C chapters are written one array per chapter over several lines.
const chaptersC = (batchC.match(/^\s+\[$/gm) ?? []).length;
assert.ok(chaptersC >= 2 * slugsC.length, "Each batch C article requires at least two chapters");
for (const slug of slugsC) {
  const start = batchC.indexOf(`slug: "${slug}"`);
  const next = batchC.indexOf("slug: \"", start + 10);
  const entry = next > 0 ? batchC.slice(start, next) : batchC.slice(start);
  assert.match(entry, /additionalSources:\s*\[\s*WIKI\(/, `Batch C history needs a cited source: ${slug}`);
}
const stories = (batchA.match(/kind: "historical-account"|kind:"historical-account"|kind: "local-tradition"|kind:"local-tradition"/g) ?? []).length
  + (batchB.match(/kind: "historical-account"|kind:"historical-account"|kind: "local-tradition"|kind:"local-tradition"/g) ?? []).length;
console.log(`Validated ${slugs.length} unique source-linked histories (25 + 25 + ${slugsC.length}) in the 100-place directory, ${toCount(batchA) + toCount(batchB) + chaptersC} specific history sections, ${stories} labelled stories/traditions. Existing ${baselineSlugs.length} histories preserved.`);
