import { createHash } from "node:crypto";
import { readFileSync, readdirSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
const { docs, patches } = JSON.parse(readFileSync(".tmp/sanity-seed.json", "utf8"));
if (docs.length !== 146) throw new Error("Unexpected document count: " + docs.length);
const wanted = new Set();
function scan(x) {
  if (Array.isArray(x)) return x.forEach(scan);
  if (!x || typeof x !== "object") return;
  if (typeof x._ref === "string" && x._ref.startsWith("image-dryrun-")) wanted.add(x._ref);
  Object.values(x).forEach(scan);
}
docs.forEach(scan);
const assets = [];
function walk(dir) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) { walk(file); continue; }
    if (!ent.isFile()) continue;
    const src = "/" + path.relative("public", file).split(path.sep).join("/");
    const placeholder = "image-dryrun-" + createHash("sha1").update(src).digest("hex").slice(0, 8) + "-1x1-webp";
    if (wanted.has(placeholder)) assets.push({ placeholder, src, bytes: statSync(file).size });
  }
}
walk("public");
if (assets.length !== wanted.size || assets.length !== 131) throw new Error("Asset lookup mismatch: " + assets.length + "/" + wanted.size);
mkdirSync("sanity-export", { recursive: true });
const files = [];
let part = [], chars = 2, idx = 0;
function flush() {
  if (!part.length) return;
  const filename = "docs-" + String(idx++).padStart(3, "0") + ".json";
  writeFileSync("sanity-export/" + filename, JSON.stringify(part));
  files.push(filename);
  part = []; chars = 2;
}
for (const doc of docs) {
  const n = JSON.stringify(doc).length + 1;
  if (part.length && chars + n > 40000) flush();
  part.push(doc);
  chars += n;
}
flush();
writeFileSync("sanity-export/patches.json", JSON.stringify(patches));
writeFileSync("sanity-export/assets.json", JSON.stringify(assets));
writeFileSync("sanity-export/manifest.json", JSON.stringify({ docCount: docs.length, patchCount: patches.length, assetCount: assets.length, files }));
console.log("Export:", files.length, "parts,", docs.length, "documents,", patches.length, "patches,", assets.length, "assets");
