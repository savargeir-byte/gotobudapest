// Writes a dated JSON snapshot of the local (pre-Sanity) content.
// Run: npx tsx scripts/export-local-content.ts
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  attractionPhoto,
  experiences,
  guides,
  neighbourhoods,
  rawAttractions,
  rawPhotos,
  root,
} from "./lib/local-content";

const date = "2026-10-23";
const out = path.join(root, "backups", `local-content-${date}.json`);

const snapshot = {
  snapshotDate: date,
  generatedAt: new Date().toISOString(),
  note: "Pre-Sanity content: attractions (with resolved photo), guides, experiences, neighbourhoods and photograph credits. See backups/README.md.",
  counts: {
    attractions: rawAttractions.length,
    guides: guides.length,
    experiences: experiences.length,
    neighbourhoods: neighbourhoods.length,
    photos: Object.keys(rawPhotos).length,
  },
  attractions: rawAttractions.map((a, index) => ({
    ...a,
    order: index,
    photo: attractionPhoto(a) ?? null,
  })),
  guides,
  experiences,
  neighbourhoods,
  photos: rawPhotos,
};

mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Wrote ${path.relative(root, out)}`, snapshot.counts);
