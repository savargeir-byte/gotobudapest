// Re-verifies lib/photos.json: files exist, licences are allowed, Commons file pages return 200.
// Run: NODE_OPTIONS=--use-system-ca node scripts/verify-photos.mjs [--sheets <dir>]
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const photos = JSON.parse(readFileSync(path.join(root, "lib", "photos.json"), "utf8"));
const ALLOWED = /^(CC BY(-SA)? [0-9.]+( [a-z]{2,3})?|CC0.*|Public domain)$/i;
const bad = [];
const pages = new Map();
for (const [key, p] of Object.entries(photos)) {
  for (const f of [p.src640, p.src1280])
    if (!existsSync(path.join(root, "public", f))) bad.push(`${key}: missing ${f}`);
  if (!ALLOWED.test(p.credit.license)) bad.push(`${key}: licence ${p.credit.license}`);
  if (!p.alt || p.alt.length < 20) bad.push(`${key}: weak alt`);
  if (!p.credit.author) bad.push(`${key}: no author`);
  pages.set(p.credit.sourceUrl, key);
}
const UA = "GoToBudapestImageCheck/1.0 (saevar.omarsson@isavia.is)";
let n = 0;
for (const [url, key] of pages) {
  let status = 0;
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    status = r.status;
    if (status !== 429) break;
    await new Promise((res) => setTimeout(res, 3000 * (i + 1)));
  }
  if (status !== 200) bad.push(`${key}: ${url} -> ${status}`);
  if (++n % 25 === 0) console.log("checked", n, "of", pages.size);
  await new Promise((res) => setTimeout(res, 150));
}
console.log(bad.length ? "PROBLEMS:\n" + bad.join("\n") : `OK: ${Object.keys(photos).length} entries, ${pages.size} distinct source pages, all files present, licences allowed, all pages 200`);

const si = process.argv.indexOf("--sheets");
if (si > 0) {
  const dir = process.argv[si + 1];
  mkdirSync(dir, { recursive: true });
  const keys = Object.keys(photos);
  const W = 300, H = 200, COLS = 5, ROWS = 4, LAB = 16;
  for (let s = 0; s * COLS * ROWS < keys.length; s++) {
    const group = keys.slice(s * COLS * ROWS, (s + 1) * COLS * ROWS);
    const layers = [];
    const labels = [];
    for (let i = 0; i < group.length; i++) {
      const x = (i % COLS) * W, y = Math.floor(i / COLS) * (H + LAB);
      layers.push({ input: await sharp(path.join(root, "public", photos[group[i]].src640)).resize(W - 2, H, { fit: "cover" }).jpeg().toBuffer(), left: x, top: y + LAB });
      labels.push(`<text x="${x + 2}" y="${y + 12}" font-size="12" font-family="Arial">${group[i]}</text>`);
    }
    layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W * COLS}" height="${ROWS * (H + LAB)}">${labels.join("")}</svg>`), left: 0, top: 0 });
    await sharp({ create: { width: W * COLS, height: ROWS * (H + LAB), channels: 3, background: "#ddd" } })
      .composite(layers).jpeg({ quality: 70 }).toFile(path.join(dir, `final-${s}.jpg`));
  }
}
