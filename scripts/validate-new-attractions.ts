// Validates new-attraction data files against the baseline (slugs, names, neighbourhoods) and the quality rules.
//   npx tsx scripts/validate-new-attractions.ts [--skip-photos] [--photos photos.json ...] [batch.json ...]
// With no batch files every lib/new-attractions/data/batch-*.json is checked together with every photos-*.json there; extra
// registries can be added with --photos (used by writers working in a staging folder).
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { validateBatch, words, type Baseline } from "../lib/new-attractions/validate";
import type { NewAttraction, NewPhoto } from "../lib/new-attractions/types";

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "lib", "new-attractions", "data");
const baseline = JSON.parse(readFileSync(path.join(root, "lib", "new-attractions", "baseline.json"), "utf8")) as Baseline;

const rest = process.argv.slice(2);
const extraPhotos: string[] = [];
let skipPhotos = false;
const args: string[] = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === "--photos") extraPhotos.push(path.resolve(rest[++i]));
  else if (rest[i] === "--skip-photos") skipPhotos = true;
  else args.push(rest[i]);
}
const files = args.length
  ? args.map((f) => path.resolve(f))
  : readdirSync(dataDir).filter((f) => /^batch-.*\.json$/.test(f)).map((f) => path.join(dataDir, f));
const photoFiles = [
  ...readdirSync(dataDir).filter((f) => /^photos-.*\.json$/.test(f)).map((f) => path.join(dataDir, f)),
  ...extraPhotos,
];

const list: NewAttraction[] = files.flatMap((f) => JSON.parse(readFileSync(f, "utf8")));
const photos: Record<string, NewPhoto> = Object.assign({}, ...photoFiles.map((f) => JSON.parse(readFileSync(f, "utf8"))));
// --skip-photos: writers validate their text before the photographer has produced the registry.
const issues = validateBatch(list, baseline, photos).filter((i) => !skipPhotos || !/photo/i.test(i.problem));

for (const a of list) {
  const w = [...a.about, ...a.history.sections.flatMap((s) => s.paragraphs), a.history.intro].reduce((n, p) => n + words(p), 0);
  console.log(`${a.slug.padEnd(44)} intro ${String(words(a.intro)).padStart(3)}w  editorial ${String(w).padStart(4)}w  sources ${a.sources.length}  photo ${a.photoStatus}`);
}
if (issues.length) {
  console.log(`\n${issues.length} problem(s):`);
  for (const i of issues) console.log(` - ${i.slug}: ${i.problem}`);
  process.exit(1);
}
console.log(`\nOK: ${list.length} attraction(s) pass the quality gate.`);
