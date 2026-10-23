// Finds a candidate Wikipedia/Commons lead photograph for every attraction and
// records its licence. Output goes to a review file; nothing is downloaded here.
// Run with: NODE_OPTIONS=--use-system-ca node scripts/find-images.mjs <out.json>
import { readFileSync, writeFileSync } from "node:fs";

const attractions = JSON.parse(
  readFileSync(new URL("../lib/attractions.json", import.meta.url), "utf8"),
);
const UA = "GoToBudapestImageCheck/1.0 (saevar.omarsson@isavia.is)";
const OK_LICENSE = /^(CC BY(-SA)?( [0-9.]+)?|CC0|Public domain|PD|Attribution)/i;
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ");
const tokens = (s) => norm(s).split(/\s+/).filter((t) => t.length > 2);

async function api(host, params) {
  const url = `https://${host}/w/api.php?format=json&origin=*&${new URLSearchParams(params)}`;
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429) {
      await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
      continue;
    }
    return r.json();
  }
  throw new Error("rate limited " + url);
}

async function candidate(name, lang) {
  const q = name.replace(/\(.*?\)|[–—&]/g, " ").replace(/\s+/g, " ").trim();
  const res = await api(`${lang}.wikipedia.org`, {
    action: "query",
    generator: "search",
    gsrsearch: `${q} Budapest`,
    gsrlimit: "4",
    prop: "pageimages",
    piprop: "name|original",
  });
  const pages = Object.values(res.query?.pages ?? {}).sort(
    (a, b) => a.index - b.index,
  );
  const want = new Set(tokens(q).filter((t) => t !== "budapest"));
  for (const p of pages) {
    if (!p.pageimage) continue;
    const have = new Set(tokens(p.title));
    const hits = [...want].filter((t) => have.has(t)).length;
    if (hits / Math.max(want.size, 1) >= 0.6)
      return { page: p.title, lang, file: p.pageimage };
  }
  return null;
}

async function licence(file) {
  const res = await api("commons.wikimedia.org", {
    action: "query",
    titles: `File:${file}`,
    prop: "imageinfo",
    iiprop: "extmetadata|size|url",
  });
  const info = Object.values(res.query.pages)[0].imageinfo?.[0];
  if (!info) return null;
  const m = info.extmetadata;
  const strip = (s) => (s?.value ?? "").replace(/<[^>]+>/g, "").trim();
  return {
    license: strip(m.LicenseShortName),
    licenseUrl: strip(m.LicenseUrl),
    author: strip(m.Artist),
    credit: strip(m.Credit),
    descriptionUrl: info.descriptionurl,
    width: info.width,
    height: info.height,
  };
}

const out = [];
for (const a of attractions) {
  let c = await candidate(a.name, "en");
  if (!c) c = await candidate(a.name, "hu");
  let lic = null;
  if (c) lic = await licence(c.file);
  const usable =
    !!lic &&
    OK_LICENSE.test(lic.license) &&
    /\.(jpe?g|png|webp)$/i.test(c.file) &&
    lic.width >= 900;
  out.push({ slug: a.slug, name: a.name, ...c, ...lic, usable });
  console.log(
    `${usable ? "OK  " : "SKIP"} ${a.slug} -> ${c ? `${c.lang}:${c.page} | ${c.file} | ${lic?.license}` : "no match"}`,
  );
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
