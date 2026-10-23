// Collects openly licensed Commons photo candidates per attraction (and extra keys),
// downloads small thumbnails and builds labelled contact sheets for manual review.
// Run: NODE_OPTIONS=--use-system-ca node scripts/collect-candidates.mjs <workdir>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const work = process.argv[2];
mkdirSync(path.join(work, "thumbs"), { recursive: true });
mkdirSync(path.join(work, "sheets"), { recursive: true });
const attractions = JSON.parse(
  readFileSync(new URL("../lib/attractions.json", import.meta.url), "utf8"),
);
const extra = JSON.parse(readFileSync(new URL("./extra-queries.json", import.meta.url), "utf8"));
const queries = JSON.parse(readFileSync(new URL(process.env.QFILE || "./image-queries.json", import.meta.url), "utf8"));
const pass1 = existsSync(path.join(work, "candidates.json"))
  ? JSON.parse(readFileSync(path.join(work, "candidates.json"), "utf8"))
  : [];

const UA = "GoToBudapestImageCheck/1.0 (saevar.omarsson@isavia.is)";
const OK = /^(CC BY(-SA)? [0-9.]+( [a-z]{2,3})?|CC0.*|Public domain|PD.*|Attribution)$/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `https://commons.wikimedia.org/w/api.php?format=json&origin=*&${new URLSearchParams(params)}`;
  for (let i = 0; i < 6; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) {
      await sleep(3000 * (i + 1));
      continue;
    }
    return r.json();
  }
  throw new Error("rate limited");
}
const strip = (s) => (s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();

function toCand(p) {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  const license = strip(m.LicenseShortName?.value);
  if (!OK.test(license)) return null;
  if (!/^image\/(jpeg|png)$/.test(ii.mime)) return null;
  if (ii.width < 1000) return null;
  const title = p.title.replace(/^File:/, "");
  if (/logo|map|flag|coat|plan|diagram|poster|icon|stamp|vignette/i.test(title)) return null;
  return {
    file: title,
    thumb: ii.thumburl,
    width: ii.width,
    height: ii.height,
    license,
    licenseUrl: strip(m.LicenseUrl?.value),
    author: strip(m.Artist?.value),
    sourceUrl: ii.descriptionurl,
  };
}

async function search(q) {
  const res = await api({
    action: "query",
    generator: "search",
    gsrsearch: q,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "420",
  });
  return Object.values(res.query?.pages ?? {})
    .sort((a, b) => a.index - b.index)
    .map(toCand)
    .filter(Boolean);
}

async function cat(q) {
  const r = await api({ action: "query", list: "search", srsearch: q, srnamespace: "14", srlimit: "1" });
  const title = r.query?.search?.[0]?.title;
  if (!title) return [];
  console.log("  category:", title);
  const res = await api({
    action: "query",
    generator: "categorymembers",
    gcmtitle: title,
    gcmtype: "file",
    gcmlimit: "40",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "420",
  });
  return Object.values(res.query?.pages ?? {})
    .map(toCand)
    .filter(Boolean)
    .sort((a, b) => b.width * b.height - a.width * a.height)
    .slice(0, 8);
}


async function byFile(file) {
  const res = await api({
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "420",
  });
  return toCand(Object.values(res.query.pages)[0]);
}

const items = [
  ...attractions.map((a) => ({ key: a.slug, qs: queries[a.slug] ?? [`${a.name} Budapest`] })),
  ...Object.entries(extra).map(([key, qs]) => ({ key, qs })),
];

const only = process.argv[3] ? new Set(process.argv[3].split(",")) : null;
const result = {};
for (const it of items) {
  if (only && !only.has(it.key)) continue;
  const cands = [];
  const seen = new Set();
  const add = (c) => {
    if (c && !seen.has(c.file)) {
      seen.add(c.file);
      cands.push(c);
    }
  };
  const p1 = process.env.QFILE ? null : pass1.find((x) => x.slug === it.key && x.file);
  if (p1) add(await byFile(p1.file));
  for (const q of it.qs) {
    if (cands.length >= 8) break;
    if (q.startsWith("Cat:")) for (const c of await cat(q.slice(4))) add(c);
    else if (q.startsWith("File:")) add(await byFile(q.slice(5)));
    else for (const c of await search(q)) add(c);
    await sleep(250);
  }
  result[it.key] = cands.slice(0, 8);
  console.log(it.key, result[it.key].length);
}
writeFileSync(path.join(work, only ? "cands-partial.json" : "cands.json"), JSON.stringify(result, null, 1));

// thumbnails
const tag = process.env.TAG || (only ? "p" : "a");
const keys = Object.keys(result);
for (const k of keys) {
  for (let i = 0; i < result[k].length; i++) {
    const f = path.join(work, "thumbs", `${k}__${i}.jpg`);
    if (existsSync(f)) continue;
    for (let t = 0; t < 5; t++) {
      const r = await fetch(result[k][i].thumb, { headers: { "User-Agent": UA } });
      if (r.status === 429) {
        await sleep(3000 * (t + 1));
        continue;
      }
      if (r.ok) writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      break;
    }
    await sleep(150);
  }
}

// contact sheets: rows of attractions, 5 columns
const ROW = 9;
const W = 190,
  H = 135,
  LAB = 22;
for (let s = 0; s * ROW < keys.length; s++) {
  const group = keys.slice(s * ROW, s * ROW + ROW);
  const comps = [];
  const svgs = [];
  group.forEach((k, r) => {
    svgs.push(
      `<text x="4" y="${r * (H + LAB) + 15}" font-size="14" font-family="Arial" fill="#000">${k}</text>`,
    );
    result[k].forEach((c, i) => {
      const f = path.join(work, "thumbs", `${k}__${i}.jpg`);
      if (existsSync(f))
        comps.push({ f, left: i * W, top: r * (H + LAB) + LAB });
      svgs.push(
        `<text x="${i * W + 4}" y="${r * (H + LAB) + LAB + H - 4}" font-size="16" font-weight="bold" font-family="Arial" fill="#fff" stroke="#000" stroke-width="0.6">${i}</text>`,
      );
    });
  });
  const layers = [];
  for (const c of comps) {
    const buf = await sharp(c.f).resize(W - 4, H, { fit: "cover" }).toBuffer();
    layers.push({ input: buf, left: c.left, top: c.top });
  }
  layers.push({
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 8}" height="${ROW * (H + LAB)}">${svgs.join("")}</svg>`,
    ),
    left: 0,
    top: 0,
  });
  await sharp({
    create: { width: W * 8, height: ROW * (H + LAB), channels: 3, background: "#ddd" },
  })
    .composite(layers)
    .jpeg({ quality: 70 })
    .toFile(path.join(work, "sheets", `${tag}-${String(s).padStart(2, "0")}.jpg`));
}
console.log("sheets done");
