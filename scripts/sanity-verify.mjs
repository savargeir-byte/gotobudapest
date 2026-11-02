// Compares published document counts in the live dataset with what the seed
// builds. Uses the public CDN API: no token. Run: node scripts/sanity-verify.mjs
import { readFileSync } from "node:fs";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "ut6qxuke";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const apiVersion = "2026-10-01"; // keep in sync with sanity/env.ts

// The attraction count follows the catalogue file; categories are the distinct attraction and guide
// categories (14 now: the 13 before the sacred-architecture category was added, plus that one).
const attractionCount = JSON.parse(readFileSync(new URL("../lib/attractions.json", import.meta.url), "utf8")).length;
const expected = {
  attraction: attractionCount,
  guide: 8,
  experience: 3,
  neighbourhood: 2,
  region: 2,
  category: 14,
  siteSettings: 1,
};

const query = `{${Object.keys(expected)
  .map((t) => `"${t}": count(*[_type == "${t}"])`)
  .join(",")}}`;
const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;

const response = await fetch(url);
if (!response.ok) {
  console.error(`Query failed with HTTP ${response.status}`);
  process.exit(2);
}
const { result } = await response.json();

let ok = true;
console.log("type            expected  actual");
for (const [type, want] of Object.entries(expected)) {
  const got = result[type];
  const match = got === want;
  if (!match) ok = false;
  console.log(
    `${type.padEnd(15)} ${String(want).padStart(8)}  ${String(got).padStart(6)}  ${match ? "ok" : "MISMATCH"}`,
  );
}
process.exit(ok ? 0 : 1);
