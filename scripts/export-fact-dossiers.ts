// Writes one fact-check dossier per attraction (the record, the long-form text, the history and every cited
// source URL) so each claim can be checked against sources. Read-only for the site; writes only to --out.
// Run: npx tsx scripts/export-fact-dossiers.ts --out <dir> [--per 10]
import fs from "node:fs";
import path from "node:path";
import { attractions } from "../lib/attractions";
import { attractionLongForm } from "../lib/attraction-long-form";
import { getAttractionEditorial } from "../lib/attraction-editorial";
import { attractionGallery } from "../lib/attraction-galleries";

const args = process.argv.slice(2);
const out = args[args.indexOf("--out") + 1];
const per = args.includes("--per") ? Number(args[args.indexOf("--per") + 1]) : 10;
if (!out) throw new Error("--out required");
fs.mkdirSync(out, { recursive: true });

const rows = attractions.map((a) => {
  const lf = attractionLongForm[a.slug];
  const ed = getAttractionEditorial(a.slug);
  return {
    slug: a.slug,
    name: a.name,
    category: a.category,
    address: a.address,
    coordinates: a.coordinates,
    description: a.description,
    sourceUrl: a.sourceUrl,
    sourceLabel: a.sourceLabel,
    longForm: lf ?? null,
    history: ed ?? null,
    heroPhoto: a.photo ? { alt: a.photo.alt, credit: a.photo.credit } : null,
    galleryCount: attractionGallery(a.slug).length,
  };
});
const batches: (typeof rows)[] = [];
for (let i = 0; i < rows.length; i += per) batches.push(rows.slice(i, i + per));
batches.forEach((b, i) => {
  fs.writeFileSync(path.join(out, `dossier-${String(i + 1).padStart(2, "0")}.json`), JSON.stringify(b, null, 1));
});
console.log(`${rows.length} dossiers in ${batches.length} batches -> ${out}`);
