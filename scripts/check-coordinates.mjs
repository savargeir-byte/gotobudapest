// Read-only geography check of lib/attractions.json: coordinate sanity (range, Budapest region), address field
// sanity (a URL or just the venue name is not an address), and a comparison of every stored pin with the position
// OpenStreetMap Nominatim finds for the street address (paced at one request per 1.2 s, as its usage policy asks).
// Run: NODE_OPTIONS=--use-system-ca node scripts/check-coordinates.mjs [--geocode] [--out report.json]
import fs from "node:fs";
import list from "../lib/attractions.json" with { type: "json" };

const args = process.argv.slice(2);
const geocode = args.includes("--geocode");
const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;
const dist = (a, b) => {
  const dl = rad(b.latitude - a.latitude);
  const dn = rad(b.longitude - a.longitude);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];
const rows = [];

for (const a of list) {
  const c = a.coordinates;
  const row = { slug: a.slug, address: a.address ?? null, coordinates: c ?? null, flags: [] };
  if (!c) row.flags.push("no coordinates");
  else if (!(c.latitude >= 47.3 && c.latitude <= 47.7 && c.longitude >= 18.8 && c.longitude <= 19.4)) row.flags.push("outside the Budapest region");
  if (!a.address) row.flags.push("no address");
  else {
    if (/https?:|www\./i.test(a.address)) row.flags.push("address field holds a URL");
    if (a.address.trim().toLowerCase() === a.name.trim().toLowerCase()) row.flags.push("address field repeats the name");
    if (!/\d/.test(a.address)) row.flags.push("address has no number");
  }
  rows.push(row);
}
for (let i = 0; i < list.length; i++)
  for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    if (a.coordinates && b.coordinates && dist(a.coordinates, b.coordinates) < 15) {
      rows[i].flags.push(`pin within 15 m of ${b.slug}`);
      rows[j].flags.push(`pin within 15 m of ${a.slug}`);
    }
  }

if (geocode) {
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const row = rows[i];
    if (!a.address || !a.coordinates || row.flags.some((f) => /URL|repeats|no number/.test(f))) continue;
    // Nominatim wants "street number, city": drop postal codes, "H-", "Budapest" and punctuation noise first.
    const q =
      a.address
        .replace(/\(.*?\)/g, "")
        .replace(/\b(H-)?\d{4}\b/g, "")
        .replace(/Budapest,?/gi, "")
        .replace(/stny\./gi, "sétány")
        .replace(/\bu\./g, "utca")
        .replace(/[.;]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[ ,]+|[ ,]+$/g, "") + ", Budapest";
    try {
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(q), { headers: { "User-Agent": "gotobudapest-factcheck/1.0 (read-only)" } });
      const body = await r.json();
      if (body[0]) {
        const found = { latitude: Number(body[0].lat), longitude: Number(body[0].lon) };
        row.geocoded = found;
        row.metres = Math.round(dist(a.coordinates, found));
        if (row.metres > 250) row.flags.push(`pin is ${row.metres} m from the geocoded address`);
      } else row.flags.push("address not found by Nominatim");
    } catch (e) {
      row.flags.push("geocoder error: " + e.message);
    }
    await sleep(1200);
  }
}
const flagged = rows.filter((r) => r.flags.length);
for (const r of flagged) console.log(`${r.slug}: ${r.flags.join("; ")}${r.address ? `  [${r.address}]` : ""}`);
console.log(`\n${list.length} attractions, ${list.filter((a) => a.coordinates).length} with coordinates, ${flagged.length} flagged`);
if (out) fs.writeFileSync(out, JSON.stringify(rows, null, 1));
