import { readFileSync } from "node:fs";
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
const checks = JSON.parse(
  readFileSync(
    new URL("../docs/attraction-source-checks.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(checks.length, 100);
assert.ok(checks.every((c) => c.httpStatus === 200));
console.log(
  `Content checks passed: 100 unique places, ${attractions.filter((a) => a.coordinates).length} source-provided coordinate pairs, 100 source checks.`,
);
