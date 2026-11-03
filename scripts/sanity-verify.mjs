// Post-seed acceptance check: compares the PUBLISHED documents in the live dataset with the documents the seed builds from the local
// content, one by one (id, type, history, stories, gallery, sections, FAQs, hero photo). Public CDN API, no token, read only.
//
//   node scripts/sanity-verify.mjs            fails (exit 1) when a seeded document is missing; count differences are warnings
//   node scripts/sanity-verify.mjs --strict   also fails on count differences (use it straight after seeding, before any edit)
//
// After an editor has changed a document in Studio a count can differ on purpose, so run it without --strict from then on.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compare, verifyQuery } from "./lib/sanity-verify-core.mjs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "ut6qxuke";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const apiVersion = "2026-10-01"; // keep in sync with sanity/env.ts
const strict = process.argv.includes("--strict");

// What the seed would create (dry run: no network, no token).
const dump = join(mkdtempSync(join(tmpdir(), "gtb-verify-")), "docs.json");
execFileSync(process.execPath, ["--import", "tsx", "scripts/sanity-seed.ts", "--dry-run"], {
  env: { ...process.env, SANITY_SEED_DUMP: dump },
  stdio: "pipe",
});
const { docs } = JSON.parse(readFileSync(dump, "utf8"));

const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(verifyQuery)}&perspective=published`;
const response = await fetch(url);
if (!response.ok) {
  console.error(`Query failed with HTTP ${response.status}`);
  process.exit(2);
}
const { result } = await response.json();

const report = compare(docs, result);
console.log(`dataset ${projectId}/${dataset}: ${report.presentTotal} of ${report.expectedTotal} seeded documents are published`);
console.log("type            expected  present");
for (const [type, row] of Object.entries(report.byType)) {
  console.log(`${type.padEnd(15)} ${String(row.expected).padStart(8)}  ${String(row.present).padStart(7)}  ${row.expected === row.present ? "ok" : "INCOMPLETE"}`);
}
if (report.missing.length) console.log(`\nMISSING (${report.missing.length}): ${report.missing.slice(0, 20).join(", ")}${report.missing.length > 20 ? ", ..." : ""}`);
if (report.differs.length) {
  console.log(`\nDIFFERENT from the seed (${report.differs.length}):`);
  for (const d of report.differs.slice(0, 20)) console.log(`  ${d.id}: ${d.fields.join("; ")}`);
}
if (report.extra.length) console.log(`\nEditorial documents the seed did not create (${report.extra.length}): ${report.extra.slice(0, 10).join(", ")}`);

const failed = report.missing.length > 0 || (strict && report.differs.length > 0);
console.log(failed ? "\nRESULT: FAIL" : report.differs.length ? "\nRESULT: PASS with warnings" : "\nRESULT: PASS");
process.exit(failed ? 1 : 0);
