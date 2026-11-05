import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { evaluate, parse } from "groq-js";
import { compare, verifyQuery } from "../scripts/lib/sanity-verify-core.mjs";

// The post-seed acceptance check (scripts/sanity-verify.mjs) runs the same GROQ query against the live dataset. Here it runs over the
// documents the seed would create, so its logic is tested without a token and without writing anything.
type Doc = { _id: string; _type: string; [k: string]: unknown };
const dump = join(mkdtempSync(join(tmpdir(), "gtb-verify-")), "docs.json");
execFileSync(process.execPath, ["--import", "tsx", "scripts/sanity-seed.ts", "--dry-run"], { env: { ...process.env, SANITY_SEED_DUMP: dump }, stdio: "pipe" });
const { docs } = JSON.parse(readFileSync(dump, "utf8")) as { docs: Doc[] };

const rowsOf = async (dataset: Doc[]) => (await (await evaluate(parse(verifyQuery), { dataset })).get()) as Record<string, unknown>[];

test("a dataset that holds exactly what the seed builds passes: 146 documents, nothing missing or different", async () => {
  const report = compare(docs, await rowsOf(docs));
  assert.equal(report.expectedTotal, 146);
  assert.equal(report.presentTotal, 146);
  assert.deepEqual(report.missing, []);
  assert.deepEqual(report.differs, []);
  assert.deepEqual(report.extra, []);
  assert.equal((report.byType as Record<string, { expected: number }>).attraction.expected, 116);
});

test("an empty dataset (production today) is reported as 146 missing", async () => {
  const report = compare(docs, await rowsOf([]));
  assert.equal(report.missing.length, 146);
  assert.equal(report.presentTotal, 0);
});

test("a deleted document, a draft-only document and a stripped history are all caught", async () => {
  const drop = docs.find((d) => d._id === "attraction-hungarian-parliament")!;
  const draftOnly = docs.find((d) => d._id === "guide-budapest-in-3-days")!;
  const stripped = docs.find((d) => d._id === "attraction-matthias-church")!;
  const dataset = docs
    .filter((d) => d !== drop && d !== draftOnly)
    .map((d) => (d === stripped ? { ...d, historyIntro: undefined, stories: [], gallery: [] } : d))
    .concat([{ ...draftOnly, _id: "drafts.guide-budapest-in-3-days" }]);
  const report = compare(docs, await rowsOf(dataset));
  assert.deepEqual(report.missing.sort(), ["attraction-hungarian-parliament", "guide-budapest-in-3-days"]);
  assert.equal(report.differs.length, 1);
  assert.equal(report.differs[0].id, "attraction-matthias-church");
  assert.ok(report.differs[0].fields.some((f: string) => f.startsWith("history")));
});

test("documents added by editors are informational, not failures", async () => {
  const added = { _id: "attraction-new-place", _type: "attraction" } as Doc;
  const report = compare(docs, await rowsOf([...docs, added]));
  assert.deepEqual(report.missing, []);
  assert.deepEqual(report.extra, ["attraction-new-place"]);
});
