import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const manifest = JSON.parse(readFileSync("lib/photos.json", "utf8"));
const assignments = readFileSync("lib/inline-photos.ts", "utf8");
const guideFile = readFileSync("lib/guides.ts", "utf8");
const topicFile = readFileSync("lib/topics.ts", "utf8");

const matches = [...assignments.matchAll(/\{ after: "([^"]+)", photoKey: "([^"]+)", caption: "([^"]+)" \}/g)];
assert.equal(matches.length, 40, "Expected 40 curated inline placements");
const seen = new Set();
for (const [, after, key, caption] of matches) {
  assert.ok(after && caption.length > 15, `Incomplete inline placement ${key}`);
  assert.ok(!caption.toLowerCase().includes("photo of a featured bar"), "Misleading label");
  const photo = manifest[key];
  assert.ok(photo, `Missing photo metadata ${key}`);
  assert.ok(photo.alt && photo.alt.length > 12, `Missing alt text ${key}`);
  assert.ok(photo.credit?.author, `Missing author credit ${key}`);
  assert.ok(photo.credit?.license, `Missing image license ${key}`);
  assert.ok(photo.credit?.licenseUrl?.startsWith("https://") || photo.credit?.licenseUrl?.startsWith("http://") || ["CC0", "Public domain"].includes(photo.credit?.license), `Missing license information ${key}`);
  assert.ok(photo.credit?.sourceUrl?.startsWith("https://"), `Missing Commons source ${key}`);
  for (const file of [photo.src640, photo.src1280]) {
    assert.ok(file.startsWith("/assets/photos/"), `Unexpected photo URL ${file}`);
    const size = statSync(join("public", file)).size;
    assert.ok(size > 1000, `Empty image: ${file}`);
  }
  assert.ok(
    guideFile.includes(`id: "${after}"`) || topicFile.includes(`title: "${after}"`),
    `No article section with anchor ${after}`,
  );
  seen.add(key);
}
assert.equal((assignments.match(/after: "/g) || []).length, 40);
console.log(
  `Inline photo validation passed: ${matches.length} placements, ${seen.size} distinct licensed assets, all local variants and attribution verified.`,
);
