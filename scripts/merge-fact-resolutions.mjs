// Merges the Phase 18 resolutions of the open fact-check claims into docs/fact-check/attraction-fact-check.json.
// Each resolution file lists, per attraction, how every previously UNCERTAIN/BLOCKED claim was settled
// (VERIFIED, CORRECTED, REMOVED, QUALIFIED or BLOCKED) with the evidence URL, plus extra claims checked and the corrections applied.
// The attraction status is recomputed from its claims and is never upgraded just because a claim was softened:
//   UNCERTAIN  any claim is UNCERTAIN, QUALIFIED (kept with an attribution or caveat) or BLOCKED
//   CORRECTED  nothing open, but a correction or removal was made at some point
//   VERIFIED   every checked claim was supported as written
// Run: node scripts/merge-fact-resolutions.mjs <resolution.json> [...]
import fs from "node:fs";

const file = "docs/fact-check/attraction-fact-check.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const bySlug = new Map(data.attractions.map((a) => [a.slug, a]));
const tokens = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((t) => t.length > 3));
const overlap = (a, b) => {
  const A = tokens(a), B = tokens(b);
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return n / Math.max(1, Math.min(A.size, B.size));
};

let resolvedCount = 0;
let newClaims = 0;
let corrections = 0;
for (const f of process.argv.slice(2)) {
  for (const r of JSON.parse(fs.readFileSync(f, "utf8")).attractions) {
    const a = bySlug.get(r.slug);
    if (!a) throw new Error("unknown slug " + r.slug);
    const open = (a.claims ?? []).filter((c) => (c.finding === "UNCERTAIN" || c.finding === "BLOCKED") && !c.resolution);
    for (const x of r.resolved ?? []) {
      let best = null, score = -1;
      for (const c of open) {
        const s = overlap(x.claim, c.claim);
        if (s > score) { best = c; score = s; }
      }
      const resolution = { phase: 18, disposition: x.disposition, evidenceUrl: x.evidenceUrl ?? null, note: x.note ?? "" };
      if (best && score >= 0.3) {
        best.finding = x.disposition;
        best.resolution = resolution;
        open.splice(open.indexOf(best), 1);
      } else {
        a.claims.push({ claim: x.claim, where: "phase 18", evidenceUrl: x.evidenceUrl ?? "", finding: x.disposition, note: x.note ?? "", resolution });
      }
      resolvedCount++;
    }
    for (const c of r.newClaims ?? []) {
      a.claims.push({ ...c, phase: 18 });
      newClaims++;
    }
    for (const c of r.corrections ?? []) {
      a.corrections = [...(a.corrections ?? []), { ...c, phase: 18 }];
      corrections++;
    }
    if (r.sourceIssues?.length) a.sourceIssues = [...(a.sourceIssues ?? []), ...r.sourceIssues];
    a.phase18 = r.summary;
    a.summary = `${a.summary ?? ""} Phase 18: ${r.summary ?? ""}`.trim();
  }
}

const status = (a) => {
  const f = (a.claims ?? []).map((c) => c.finding);
  if (f.some((x) => x === "UNCERTAIN" || x === "QUALIFIED" || x === "BLOCKED")) return "UNCERTAIN";
  if ((a.corrections ?? []).length || f.some((x) => x === "CORRECTED" || x === "REMOVED")) return "CORRECTED";
  return "VERIFIED";
};
for (const a of data.attractions) a.status = status(a);
data.updated = "2026-11-02 (Phase 18 resolutions merged)";
fs.writeFileSync(file, JSON.stringify(data, null, 1) + "\n");
const count = (xs) => xs.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
console.log("resolved", resolvedCount, "new claims", newClaims, "corrections", corrections);
console.log("status", count(data.attractions.map((a) => a.status)));
console.log("claims", count(data.attractions.flatMap((a) => a.claims.map((c) => c.finding))));
