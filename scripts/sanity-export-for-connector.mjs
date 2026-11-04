import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
const raw = JSON.parse(readFileSync(".tmp/sanity-seed.json", "utf8"));
const { docs, patches } = raw;
if (docs.length !== 146) throw new Error("Unexpected editorial document count: " + docs.length);
const wanted = new Set();
const scan = (value) => {
  if (Array.isArray(value)) return value.forEach(scan);
  if (!value || typeof value !== "object") return;
  if (typeof value._ref === "string" && value._ref.startsWith("image-dryrun-")) wanted.add(value._ref);
  Object.values(value).forEach(scan);
};
docs.forEach(scan);
const assets = [];
const walk = (folder) => {
  for (const e of readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    if (!e.isFile()) continue;
    const src = "/" + path.relative("public", full).split(path.sep).join("/");
    const id = "image-dryrun-" + createHash("sha1").update(src).digest("hex").slice(0, 8) + "-1x1-webp";
    if (wanted.has(id)) assets.push({ placeholder: id, src, byteLength: statSync(full).size });
  }
};
walk("public");
if (assets.length !== wanted.size) {
  const found = new Set(assets.map((a) => a.placeholder));
  throw new Error("Missing assets: " + [...wanted].filter((id) => !found.has(id)).join(", "));
}
if (assets.length !== 131) throw new Error("Unexpected local image count: " + assets.length);
writeFileSync("sanity-export.json", JSON.stringify({ docs, patches, assets }));
console.log("Exported", docs.length, "documents,", patches.length, "patches,", assets.length, "asset references");
