// Merges the per-batch fact-check audits (T-013) into one inspectable report:
//   docs/fact-check/attraction-fact-check.json   every claim with its evidence URL and finding, plus corrections
//   docs/fact-check/guide-fact-check.json        the same for the five extended guides
//   docs/ATTRACTION_FACT_CHECK.md                readable summary: per-attraction status, corrections, open questions
// Run: node scripts/build-fact-check-report.mjs <audit-dir> <guide-verification.json> <date YYYY-MM-DD>
import fs from "node:fs";
import path from "node:path";

const [dir, guideFile, date] = process.argv.slice(2);
if (!dir || !guideFile || !date) throw new Error("usage: build-fact-check-report.mjs <audit-dir> <guide-verification.json> <date>");
const names = new Map(JSON.parse(fs.readFileSync("lib/attractions.json", "utf8")).map((a) => [a.slug, a.name]));

const attractions = fs
  .readdirSync(dir)
  .filter((f) => /^audit-\d+\.json$/.test(f))
  .sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).attractions);
const bySlug = new Map();
for (const a of attractions) bySlug.set(a.slug, a);
const missing = [...names.keys()].filter((s) => !bySlug.has(s));
if (missing.length) throw new Error("not audited: " + missing.join(", "));
const guides = JSON.parse(fs.readFileSync(guideFile, "utf8"));

fs.mkdirSync("docs/fact-check", { recursive: true });
fs.writeFileSync("docs/fact-check/attraction-fact-check.json", JSON.stringify({ date, attractions: [...bySlug.values()] }, null, 1) + "\n");
fs.writeFileSync("docs/fact-check/guide-fact-check.json", JSON.stringify({ date, guides }, null, 1) + "\n");

const count = (xs, k) => xs.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {});
const status = count([...bySlug.values()], "status");
const allClaims = [...bySlug.values()].flatMap((a) => a.claims ?? []);
const findings = count(allClaims, "finding");
const corrections = [...bySlug.values()].reduce((n, a) => n + (a.corrections?.length ?? 0), 0);
const short = (s, n = 220) => (s.length > n ? s.slice(0, n - 1) + "…" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");

const out = [];
out.push(`# Attraction fact-check (T-013)`, "");
out.push(`Independent claim-by-claim check of all ${bySlug.size} attraction pages, run ${date}. Every claim below was checked against a page the checker opened or a search result it names; the evidence URL is in \`docs/fact-check/attraction-fact-check.json\`. A valid URL or a passing structural test does not make a claim true, so a status is VERIFIED only where every checked claim was supported.`, "");
out.push("| Status | Attractions | Meaning |", "| --- | --- | --- |");
const meaning = { VERIFIED: "every checked claim supported", CORRECTED: "an error or unsupported claim was fixed in the content source", UNCERTAIN: "some claim could not be confirmed; it is kept qualified or flagged", BLOCKED: "no reliable evidence reachable" };
for (const k of ["VERIFIED", "CORRECTED", "UNCERTAIN", "BLOCKED"]) out.push(`| ${k} | ${status[k] ?? 0} | ${meaning[k]} |`);
out.push("", `Claims checked: ${allClaims.length} (${["VERIFIED", "CORRECTED", "UNCERTAIN", "BLOCKED"].map((k) => `${findings[k] ?? 0} ${k.toLowerCase()}`).join(", ")}). Text corrections applied to the content sources: ${corrections}.`, "");
out.push("Limits: official pages were often unreadable to the checker (Parliament sites show a CAPTCHA, budapestinfo.hu and UNESCO pages return only a title or a 403). Claims that rest on Wikipedia alone or on a search excerpt are marked in the JSON note and listed under \"Open questions\". The 'currently open or closed' state of venues is deliberately not stated on the site and was not verified.", "");

out.push("## Per attraction", "", "| Attraction | Status | Claims | Corrections | Summary |", "| --- | --- | --- | --- | --- |");
for (const a of [...bySlug.values()].sort((x, y) => x.slug.localeCompare(y.slug)))
  out.push(`| ${names.get(a.slug)} (\`${a.slug}\`) | ${a.status} | ${a.claims?.length ?? 0} | ${a.corrections?.length ?? 0} | ${short(a.summary ?? "", 160)} |`);

out.push("", "## Corrections made", "");
for (const a of [...bySlug.values()].filter((x) => x.corrections?.length).sort((x, y) => x.slug.localeCompare(y.slug))) {
  out.push(`### ${names.get(a.slug)} (\`${a.slug}\`)`, "");
  for (const c of a.corrections) {
    const what = c.field ? `${c.field}: ${short(String(c.find), 100)} → ${short(String(c.replace), 100)}` : `"${short(c.find, 180)}" → "${short(c.replace, 180)}"`;
    out.push(`- ${what}  \n  Reason: ${short(c.reason ?? "", 260)}${c.evidence ? `  \n  Evidence: ${c.evidence}` : ""}`);
  }
  out.push("");
}

out.push("## Open questions (claims not confirmed)", "");
for (const a of [...bySlug.values()].sort((x, y) => x.slug.localeCompare(y.slug))) {
  const open = (a.claims ?? []).filter((c) => c.finding === "UNCERTAIN" || c.finding === "BLOCKED");
  if (!open.length) continue;
  out.push(`### ${names.get(a.slug)} (\`${a.slug}\`)`, "");
  for (const c of open) out.push(`- ${c.finding}: ${short(c.claim, 200)} — ${short(c.note ?? "", 240)}${c.evidenceUrl ? ` (${c.evidenceUrl})` : ""}`);
  out.push("");
}

out.push("## Source problems found", "");
for (const a of [...bySlug.values()].sort((x, y) => x.slug.localeCompare(y.slug))) {
  if (!a.sourceIssues?.length) continue;
  out.push(`- \`${a.slug}\`: ${a.sourceIssues.map((s) => `${s.url} — ${short(s.issue, 140)}`).join("; ")}`);
}

out.push("", "## Guides (T-012)", "");
out.push("| Guide | Claims checked | Corrections |", "| --- | --- | --- |");
for (const g of guides) out.push(`| ${g.slug} | ${g.claims?.length ?? 0} | ${g.corrections?.length ?? 0} |`);
out.push("", "Details: `docs/fact-check/guide-fact-check.json`.", "");
fs.writeFileSync("docs/ATTRACTION_FACT_CHECK.md", out.join("\n"));
console.log(`report: ${bySlug.size} attractions, ${allClaims.length} claims, ${corrections} corrections`, status);
