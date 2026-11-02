import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import attractionData from "../lib/attractions.json";

type Claim = { claim: string; finding: string; evidenceUrl?: string; note?: string };
type Audit = { slug: string; status: string; claims: Claim[]; corrections?: { reason?: string; evidence?: string }[] };
const report = JSON.parse(fs.readFileSync("docs/fact-check/attraction-fact-check.json", "utf8")) as { attractions: Audit[] };
const FINDINGS = ["VERIFIED", "CORRECTED", "REMOVED", "QUALIFIED", "UNCERTAIN", "BLOCKED"];

test("the fact-check report covers every attraction exactly once and is machine-readable", () => {
  const slugs = attractionData.map((a) => a.slug).sort();
  assert.deepEqual(report.attractions.map((a) => a.slug).sort(), slugs);
  for (const a of report.attractions) {
    assert.ok(Array.isArray(a.claims) && a.claims.length >= 4, `${a.slug}: at least 4 claims`);
    for (const c of a.claims) {
      assert.ok(c.claim && FINDINGS.includes(c.finding), `${a.slug}: finding ${c.finding}`);
      if (c.finding === "VERIFIED") assert.match(c.evidenceUrl ?? "", /^https?:\/\//, `${a.slug}: a verified claim needs an evidence URL`);
    }
  }
});

test("an attraction status is never better than its claims: softened or unconfirmed claims keep it UNCERTAIN", () => {
  for (const a of report.attractions) {
    const open = a.claims.some((c) => ["UNCERTAIN", "QUALIFIED", "BLOCKED"].includes(c.finding));
    if (open) assert.equal(a.status, "UNCERTAIN", a.slug);
    else if (a.status === "VERIFIED") assert.ok(!(a.corrections?.length), `${a.slug}: VERIFIED with corrections`);
    else assert.equal(a.status, "CORRECTED", a.slug);
  }
});

test("coordinates and addresses: in range, in the Budapest region, no URL or bare name in the address field", () => {
  for (const a of attractionData as { slug: string; name: string; address?: string; coordinates?: { latitude: number; longitude: number } }[]) {
    if (a.coordinates) {
      const { latitude, longitude } = a.coordinates;
      assert.ok(latitude >= 47.3 && latitude <= 47.7 && longitude >= 18.8 && longitude <= 19.4, `${a.slug}: outside the Budapest region`);
    }
    if (a.address) {
      assert.ok(!/https?:|www\./i.test(a.address), `${a.slug}: URL in the address`);
      assert.notEqual(a.address.trim().toLowerCase(), a.name.trim().toLowerCase(), `${a.slug}: address repeats the name`);
    }
  }
  const sacred = (attractionData as { slug: string; category: string; coordinates?: unknown }[]).filter((a) => a.category === "Sacred architecture");
  assert.equal(sacred.length, 16);
  for (const a of sacred) assert.ok(a.coordinates, `${a.slug}: sacred sites have a verified pin`);
});
