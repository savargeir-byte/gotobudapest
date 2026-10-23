// Downloads the reviewed Commons photographs listed in photo-picks.json, writes optimised
// webp files to public/assets/photos and the credit data to lib/photos.json + docs/image-credits.json.
// Run: NODE_OPTIONS=--use-system-ca node scripts/build-photos.mjs <workdir>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const work = process.argv[2];
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const picks = JSON.parse(readFileSync(new URL("./photo-picks.json", import.meta.url), "utf8"));
const sets = {
  a: JSON.parse(readFileSync(path.join(work, "cands.json"), "utf8")),
  c: JSON.parse(readFileSync(path.join(work, "cands4.json"), "utf8")),
  d: JSON.parse(readFileSync(path.join(work, "cands5.json"), "utf8")),
};
const UA = "GoToBudapestImageCheck/1.0 (saevar.omarsson@isavia.is)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const outDir = path.join(root, "public", "assets", "photos");
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(work, "orig"), { recursive: true });

async function download(file, dest) {
  if (existsSync(dest)) return readFileSync(dest);
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=1600`;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (r.status === 429) {
      await sleep(4000 * (i + 1));
      continue;
    }
    if (!r.ok) throw new Error(`${r.status} ${file}`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(dest, buf);
    return buf;
  }
  throw new Error("rate limited " + file);
}

const result = {};
for (const [key, pick] of Object.entries(picks)) {
  if (pick.copy) continue;
  const cand = sets[pick.set][pick.from ?? key][pick.idx];
  const buf = await download(cand.file, path.join(work, "orig", `${key}.jpg`));
  const base = sharp(buf).rotate();
  const big = await base.clone().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer({ resolveWithObject: true });
  const small = await base.clone().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
  writeFileSync(path.join(outDir, `${key}-1280.webp`), big.data);
  writeFileSync(path.join(outDir, `${key}-640.webp`), small);
  result[key] = {
    src640: `/assets/photos/${key}-640.webp`,
    src1280: `/assets/photos/${key}-1280.webp`,
    width: big.info.width,
    height: big.info.height,
    alt: pick.alt,
    credit: {
      title: cand.file,
      author: cand.author || "Unknown author (see Commons file page)",
      license: cand.license,
      licenseUrl: cand.licenseUrl,
      sourceUrl: cand.sourceUrl,
    },
  };
  console.log("ok", key, cand.file.slice(0, 50), big.info.width + "x" + big.info.height);
  await sleep(700);
}
for (const [key, pick] of Object.entries(picks)) if (pick.copy) result[key] = structuredClone(result[pick.copy]);

// stable order: attractions first (as in attractions.json), then extras, then keyed pages
const order = JSON.parse(readFileSync(path.join(root, "lib", "attractions.json"), "utf8")).map((a) => a.slug);
const keys = Object.keys(result).sort((x, y) => {
  const rank = (k) => (order.includes(k) ? order.indexOf(k) : 1000 + (picks[k].extra ? 0 : 500));
  return rank(x) - rank(y) || x.localeCompare(y);
});
const sorted = Object.fromEntries(keys.map((k) => [k, result[k]]));
writeFileSync(path.join(root, "lib", "photos.json"), JSON.stringify(sorted, null, 2) + "\n");
const flat = keys.map((k) => ({ key: k, verified: "2026-10-23", ...result[k].credit, file: result[k].src1280 }));
writeFileSync(path.join(root, "docs", "image-credits.json"), JSON.stringify(flat, null, 2) + "\n");
console.log("photos:", keys.length);
