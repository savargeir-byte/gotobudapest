// Builds the readable fact-check report (T-013) from the committed data:
//   docs/fact-check/attraction-fact-check.json   every claim with its evidence URL, finding and resolution, plus corrections
//   docs/fact-check/guide-fact-check.json        the same for the five extended guides
// and writes docs/ATTRACTION_FACT_CHECK.md. The JSON is the record; this file only renders it.
// Run: node scripts/build-fact-check-report.mjs
import fs from "node:fs";

const names = new Map(JSON.parse(fs.readFileSync("lib/attractions.json", "utf8")).map((a) => [a.slug, a.name]));
const data = JSON.parse(fs.readFileSync("docs/fact-check/attraction-fact-check.json", "utf8"));
const guides = JSON.parse(fs.readFileSync("docs/fact-check/guide-fact-check.json", "utf8")).guides;
const attractions = data.attractions;
const missing = [...names.keys()].filter((s) => !attractions.some((a) => a.slug === s));
if (missing.length) throw new Error("not audited: " + missing.join(", "));
const sorted = [...attractions].sort((x, y) => x.slug.localeCompare(y.slug));

const count = (xs) => xs.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {});
const status = count(attractions.map((a) => a.status));
const allClaims = attractions.flatMap((a) => a.claims ?? []);
const findings = count(allClaims.map((c) => c.finding));
const corrections = attractions.reduce((n, a) => n + (a.corrections?.length ?? 0), 0);
const short = (s, n = 220) => (s.length > n ? s.slice(0, n - 1) + "…" : s).split("|").join("&#124;").replace(/\r?\n/g, " ");
const label = (a) => `${names.get(a.slug)} (\`${a.slug}\`)`;

const out = [];
out.push("# Attraction fact-check (T-013)", "");
out.push(
  `Claim-by-claim check of all ${attractions.length} attraction pages. Phase 17 (2026-11-02) checked every claim; Phase 18 (2026-11-02) resolved the claims that stayed uncertain and added coordinates and addresses. The checks were made by model-based researchers who opened the cited pages or named the search result they used; **no human editor has signed this off**. The evidence URL of every claim is in \`docs/fact-check/attraction-fact-check.json\`. A valid URL or a passing structural test does not make a claim true, and a claim that was softened or removed is not counted as verified.`,
  "",
);
out.push("| Attraction status | Attractions | Meaning |", "| --- | --- | --- |");
const meaning = {
  VERIFIED: "every checked claim supported as written",
  CORRECTED: "errors or unsupported claims were fixed or removed in the content source; nothing open remains",
  UNCERTAIN: "at least one claim is still unconfirmed or is kept only with an attribution or caveat in the text",
  BLOCKED: "no reliable evidence reachable",
};
for (const k of ["VERIFIED", "CORRECTED", "UNCERTAIN", "BLOCKED"]) out.push(`| ${k} | ${status[k] ?? 0} | ${meaning[k]} |`);
out.push("");
out.push("| Claim finding | Claims |", "| --- | --- |");
for (const k of ["VERIFIED", "CORRECTED", "REMOVED", "QUALIFIED", "UNCERTAIN", "BLOCKED"]) out.push(`| ${k} | ${findings[k] ?? 0} |`);
out.push("", `${allClaims.length} claims in total; ${corrections} text, address and coordinate corrections recorded and applied to the content sources. REMOVED: the claim was deleted because no support was found. QUALIFIED: the claim stays, worded with an explicit attribution or caveat.`, "");
out.push(
  "Limits: official pages were often unreadable to the checkers (Parliament sites show a CAPTCHA, UNESCO returns 403, budapestinfo.hu pages return only a title). Claims that rest on Wikipedia alone or on a search excerpt are marked in the JSON note and listed below. Whether a venue is open today is deliberately not stated on the site and was not verified.",
  "",
);

out.push("## Phase 18: the six attractions that stayed uncertain", "");
const six = ["city-park-ice-rink", "franz-liszt-memorial-museum-and-research-centre", "hungarian-natural-history-museum", "millenaris-park", "rumbach-street-synagogue", "szamos-chocolate-museum"];
for (const s of six) {
  const a = attractions.find((x) => x.slug === s);
  out.push(`### ${label(a)} — ${a.status}`, "", short(a.phase18 ?? "", 700), "");
}

out.push("## Per attraction", "", "| Attraction | Status | Claims | Corrections | Summary |", "| --- | --- | --- | --- | --- |");
for (const a of sorted) out.push(`| ${names.get(a.slug)} (\`${a.slug}\`) | ${a.status} | ${a.claims?.length ?? 0} | ${a.corrections?.length ?? 0} | ${short(a.summary ?? "", 160)} |`);

out.push("", "## Corrections made", "");
for (const a of sorted.filter((x) => x.corrections?.length)) {
  out.push(`### ${label(a)}`, "");
  for (const c of a.corrections) {
    const what = c.field ? `${c.field}: ${short(String(c.find || "(none)"), 100)} → ${short(String(c.replace), 100)}` : `"${short(c.find, 180)}" → "${short(c.replace, 180)}"`;
    out.push(`- ${what}  \n  Reason: ${short(c.reason ?? "", 260)}${c.evidence ? `  \n  Evidence: ${c.evidence}` : ""}`);
  }
  out.push("");
}

out.push("## Claims still open (uncertain, qualified or blocked)", "");
for (const a of sorted) {
  const open = (a.claims ?? []).filter((c) => ["UNCERTAIN", "QUALIFIED", "BLOCKED"].includes(c.finding));
  if (!open.length) continue;
  out.push(`### ${label(a)}`, "");
  for (const c of open) out.push(`- ${c.finding}: ${short(c.claim, 200)} — ${short(c.resolution?.note || c.note || "", 260)}${(c.resolution?.evidenceUrl || c.evidenceUrl) ? ` (${c.resolution?.evidenceUrl || c.evidenceUrl})` : ""}`);
  out.push("");
}

out.push("## Source problems found", "");
for (const a of sorted) {
  if (!a.sourceIssues?.length) continue;
  out.push(`- \`${a.slug}\`: ${a.sourceIssues.map((s) => `${s.url} — ${short(s.issue, 140)}`).join("; ")}`);
}

const tsFile = "docs/phase19/time-sensitive-review.json";
if (fs.existsSync(tsFile)) {
  const ts = JSON.parse(fs.readFileSync(tsFile, "utf8"));
  const n = (k) => ts.counts[k] ?? 0;
  out.push("", `## Time-sensitive visitor statements, re-checked ${ts.date} (Phase 19)`, "");
  out.push(
    `${ts.results.length} sentences about closures, reopenings, rules, procedures and routes were re-checked against current operator or official pages (${ts.method}): CURRENT ${n("CURRENT")}, OUTDATED ${n("OUTDATED")}, UNVERIFIED ${n("UNVERIFIED")}, not time-sensitive (history or generic advice) ${n("NOT_TIME_SENSITIVE")}. ${ts.corrections.length} corrections were applied. Evidence URLs: docs/phase19/time-sensitive-review.json. This is model-based; no human editor has signed it off.`,
    "",
  );
  out.push("Corrections:", "");
  for (const c of ts.corrections) out.push(`- ${c.slug}: ${short(c.reason ?? "", 240)} (${c.evidence})`);
  out.push("", "Still UNVERIFIED (no current source reachable; the wording stays cautious):", "");
  for (const r of ts.results.filter((x) => x.verdict === "UNVERIFIED")) out.push(`- ${r.slug}: ${short(r.sentence, 160)}`);
}
out.push("", "## Guides (T-012)", "");
out.push("| Guide | Claims checked | Corrections |", "| --- | --- | --- |");
for (const g of guides) out.push(`| ${g.slug} | ${g.claims?.length ?? 0} | ${g.corrections?.length ?? 0} |`);
out.push("", "Details: `docs/fact-check/guide-fact-check.json`.", "");
fs.writeFileSync("docs/ATTRACTION_FACT_CHECK.md", out.join("\n"));
console.log(`report: ${attractions.length} attractions, ${allClaims.length} claims, ${corrections} corrections`, status, findings);
