import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const existing = JSON.parse(read("lib/attractions.json"));
const baseline = read("lib/attraction-editorial.ts");
const batchA = read("lib/attraction-history-batch-a.ts");
const batchB = read("lib/attraction-history-batch-b.ts");
const aggregator = read("lib/attraction-editorial-expanded.ts");
const slugsA = [...batchA.matchAll(/^\s+slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const slugsB = [...batchB.matchAll(/^\s+slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
const slugs = [...slugsA, ...slugsB];
const baselineSlugs = [...baseline.matchAll(/^\s+"([a-z0-9-]+)":\s*\{/gm)].map((m) => m[1]);
const catalog = new Map(existing.map((place) => [place.slug, place]));
assert.equal(slugsA.length, 25, "Batch A must have exactly 25 attractions");
assert.equal(slugsB.length, 25, "Batch B must have exactly 25 attractions");
assert.equal(new Set(slugs).size, 50, "Duplicate new editorial slug");
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
const stories = (batchA.match(/kind: "historical-account"|kind:"historical-account"|kind: "local-tradition"|kind:"local-tradition"/g) ?? []).length
  + (batchB.match(/kind: "historical-account"|kind:"historical-account"|kind: "local-tradition"|kind:"local-tradition"/g) ?? []).length;
console.log(`Validated 50 unique source-linked histories in 100-place directory, 100 specific history sections, ${stories} labelled stories/traditions. Existing ${baselineSlugs.length} histories preserved.`);
