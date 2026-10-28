// Adds reviewed Wikimedia Commons photographs for marketplace venues that are not attractions
// (see lib/marketplace/extra-venues.ts). ADDITIVE and idempotent: existing keys in lib/photos.json are
// never touched. For every pick the Commons API supplies the author and licence (nothing is typed by
// hand), a licence outside the allowed set aborts, and the 640/1280 WebP pair is written like
// scripts/build-photos.mjs does (same widths and qualities).
// Run: NODE_OPTIONS=--use-system-ca node scripts/add-venue-photos.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const picks = JSON.parse(readFileSync(path.join(root, "scripts", "venue-photo-picks.json"), "utf8"));
const photosPath = path.join(root, "lib", "photos.json");
const creditsPath = path.join(root, "docs", "image-credits.json");
const photos = JSON.parse(readFileSync(photosPath, "utf8"));
const credits = JSON.parse(readFileSync(creditsPath, "utf8"));
const ALLOWED = /^(CC BY(-SA)? [0-9.]+|CC0.*|Public domain)$/i;
const UA = "GoToBudapestImageCheck/1.0 (saevar.omarsson@isavia.is)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const plain = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function get(url) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (r.status === 429) {
      await sleep(4000 * (i + 1));
      continue;
    }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r;
  }
  throw new Error("rate limited " + url);
}

for (const [key, pick] of Object.entries(picks)) {
  if (photos[key]) {
    console.log("skip (exists)", key);
    continue;
  }
  const meta = await (
    await get(
      "https://commons.wikimedia.org/w/api.php?" +
        new URLSearchParams({ action: "query", format: "json", titles: "File:" + pick.file, prop: "imageinfo", iiprop: "url|size|extmetadata", iiextmetadatafilter: "LicenseShortName|LicenseUrl|Artist" }),
    )
  ).json();
  const info = Object.values(meta.query.pages)[0].imageinfo?.[0];
  if (!info) throw new Error("no imageinfo for " + pick.file);
  const m = info.extmetadata;
  const license = plain(m.LicenseShortName?.value);
  const author = plain(m.Artist?.value);
  if (!ALLOWED.test(license)) throw new Error(`${key}: licence not allowed: ${license}`);
  if (!author) throw new Error(`${key}: no author on the Commons page`);
  const licenseUrl = plain(m.LicenseUrl?.value) || undefined;
  if (!licenseUrl) throw new Error(`${key}: no licence URL`);
  const buf = Buffer.from(
    await (await get(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(pick.file.replace(/ /g, "_"))}?width=1600`)).arrayBuffer(),
  );
  const base = sharp(buf).rotate();
  const big = await base.clone().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 76 }).toBuffer({ resolveWithObject: true });
  const small = await base.clone().resize({ width: 640, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
  const dir = path.join(root, "public", "assets", "photos");
  writeFileSync(path.join(dir, `${key}-1280.webp`), big.data);
  writeFileSync(path.join(dir, `${key}-640.webp`), small);
  const credit = {
    title: pick.file,
    author,
    license,
    licenseUrl,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(pick.file.replace(/ /g, "_"))}`,
  };
  photos[key] = { src640: `/assets/photos/${key}-640.webp`, src1280: `/assets/photos/${key}-1280.webp`, width: big.info.width, height: big.info.height, alt: pick.alt, credit };
  credits.push({ key, verified: new Date().toISOString().slice(0, 10), ...credit, file: `/assets/photos/${key}-1280.webp` });
  console.log("added", key, `${big.info.width}x${big.info.height}`, license, "by", author);
  await sleep(700);
}
writeFileSync(photosPath, JSON.stringify(photos, null, 2) + "\n");
writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + "\n");
console.log("photos:", Object.keys(photos).length);
