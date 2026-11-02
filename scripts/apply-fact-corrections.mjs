// Applies the exact-string corrections from fact-check audit files to the content sources, and reports every
// correction that could not be matched so it is handled by hand (never silently dropped).
// Run: node scripts/apply-fact-corrections.mjs <audit.json> [...] [--dry]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const files = args.filter((a) => !a.startsWith("--"));
const root = process.cwd();

const targets = [
  "lib/attractions.json",
  "lib/attraction-long-form.ts",
  "lib/attraction-editorial.ts",
  "lib/guides.ts",
  "lib/guide-extra-sections.ts",
  "lib/new-editorial-guides.ts",
  "lib/attraction-history-batch-a.ts",
  "lib/attraction-history-batch-b.ts",
  "lib/attraction-history-batch-c.ts",
  ...fs.readdirSync(path.join(root, "lib/content-batches")).filter((f) => f.endsWith(".json")).map((f) => "lib/content-batches/" + f),
];
const text = new Map(targets.map((t) => [t, fs.readFileSync(path.join(root, t), "utf8")]));
const variants = (s) => [...new Set([s, JSON.stringify(s).slice(1, -1), s.replace(/"/g, '\\"'), s.replace(/`/g, "\\`")])];
const count = (hay, needle) => (needle ? hay.split(needle).length - 1 : 0);

let applied = 0;
const unmatched = [];
// A correction is meant for one attraction: its text normally sits in at most two sources (the record and the
// long-form copy of the description) plus one more. A find string matching more places is probably a short phrase
// shared with another attraction, so it is reported instead of applied (use a longer find, or --allow-multi).
const allowMulti = args.includes("--allow-multi");
const applyAll = (slug, find, replace, reason) => {
  let hits = 0;
  let total = 0;
  for (const body of text.values()) for (const v of variants(find)) { const n = count(body, v); if (n) { total += n; break; } }
  if (total > 3 && !allowMulti) {
    unmatched.push({ slug, find: find.slice(0, 120), reason: `ambiguous: matches ${total} places, not applied` });
    return 0;
  }
  for (const [file, body] of text) {
    let cur = body;
    for (const v of variants(find)) {
      const n = count(cur, v);
      if (!n) continue;
      const rep = v === find ? replace : v === JSON.stringify(find).slice(1, -1) ? JSON.stringify(replace).slice(1, -1) : replace.replace(/"/g, '\\"');
      cur = cur.split(v).join(rep);
      hits += n;
      break;
    }
    text.set(file, cur);
  }
  if (!hits) unmatched.push({ slug, find: find.slice(0, 120), reason });
  else applied += 1;
  return hits;
};

for (const f of files) {
  const audit = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const a of audit.attractions) {
    for (const c of a.corrections ?? []) {
      if (c.field === "address" || c.field === "coordinates") {
        // Structured fields live only in the attractions record.
        const list = JSON.parse(text.get("lib/attractions.json"));
        const rec = list.find((r) => r.slug === a.slug);
        if (!rec) { unmatched.push({ slug: a.slug, find: c.field, reason: "no record" }); continue; }
        if (c.field === "address") rec.address = c.replace;
        else {
          const [latitude, longitude] = String(c.replace).split(",").map(Number);
          if (!(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)) { unmatched.push({ slug: a.slug, find: "coordinates", reason: "bad value" }); continue; }
          rec.coordinates = { latitude, longitude };
        }
        const raw = text.get("lib/attractions.json");
        text.set("lib/attractions.json", JSON.stringify(list, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
        applied += 1;
        continue;
      }
      if (!c.find || c.find === c.replace) continue;
      const hits = applyAll(a.slug, c.find, c.replace, c.reason);
      if (hits > 2) console.warn(`WARN ${a.slug}: find text matched ${hits} places: ${c.find.slice(0, 60)}`);
    }
  }
}
if (!dry) for (const [file, body] of text) fs.writeFileSync(path.join(root, file), body);
console.log(`corrections applied: ${applied}; unmatched: ${unmatched.length}${dry ? " (dry run)" : ""}`);
for (const u of unmatched) console.log(`  UNMATCHED ${u.slug}: "${u.find}" (${u.reason})`);
