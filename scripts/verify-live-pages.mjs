// Read-only public check of a deployed site: every attraction page, the eight guides and the sitemap.
// One GET per page, paced (default 400 ms), no cookies, no forms, no booking. It records HTTP status, the canonical URL,
// the h1, whether the long-form sections and the photo credit are present, and it compares the sitemap with the data.
// The HTML is only searched for fixed markers; it is never rewritten or sanitised.
// Run: NODE_OPTIONS=--use-system-ca node scripts/verify-live-pages.mjs [--base https://www.gotobuda.com] [--delay 400] [--out report.json]
import fs from "node:fs";
import attractions from "../lib/attractions.json" with { type: "json" };
import photos from "../lib/photos.json" with { type: "json" };

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const base = arg("--base", "https://www.gotobuda.com").replace(/\/$/, "");
const delay = Number(arg("--delay", "400"));
const out = arg("--out", null);
const checkLinks = args.includes("--links");
// With --links every internal link and local image found on the pages is requested once afterwards (HEAD, GET if refused).
const linkSources = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const guideSlugs = ["budapest-in-3-days", "budapest-thermal-baths", "getting-around-budapest", "buda-castle-district", "danube-cruises", "budapest-bars-nightlife", "budapest-food-and-markets", "downtown-pest-walking-guide"];
const alnum = (s) => s.replace(/&#?\w+;/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function get(path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(base + path, { headers: { "User-Agent": "gotobudapest-readonly-check/1.0", Accept: "text/html" }, redirect: "manual" });
      if (r.status === 429) { await sleep(15000); continue; }
      const body = r.status === 200 ? await r.text() : "";
      if (checkLinks && body) {
        for (const m of body.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
          const target = m[1].replace(/&amp;/g, "&");
          if (!target.startsWith("//") && !linkSources.has(target)) linkSources.set(target, path);
        }
      }
      return { status: r.status, location: r.headers.get("location"), body };
    } catch (e) {
      if (attempt === 2) return { status: 0, error: e.message, body: "" };
      await sleep(2000);
    }
  }
  return { status: 0, body: "" };
}
// Words of the visible text, counted by walking the markup character by character (nothing is rewritten or sanitised).
function visibleWords(html) {
  const words = [];
  let current = "";
  let i = 0;
  const skip = (open, close) => {
    if (html.startsWith(open, i)) {
      const end = html.indexOf(close, i);
      i = end < 0 ? html.length : end + close.length;
      return true;
    }
    return false;
  };
  while (i < html.length) {
    if (skip("<script", "</script>") || skip("<style", "</style>")) continue;
    const ch = html[i];
    if (ch === "<") {
      const end = html.indexOf(">", i);
      i = end < 0 ? html.length : end + 1;
      if (current) { words.push(current); current = ""; }
      continue;
    }
    if (/\s/.test(ch)) { if (current) { words.push(current); current = ""; } } else current += ch;
    i++;
  }
  if (current) words.push(current);
  return words.length;
}
const descriptionWords = (html) => (html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "").split(/\s+/).filter(Boolean).length;
// Inline photographs expected per guide (e2e/editorial-images.spec.ts).
const guidePhotos = { "budapest-in-3-days": 7, "budapest-thermal-baths": 6, "getting-around-budapest": 6, "buda-castle-district": 7, "danube-cruises": 5, "budapest-bars-nightlife": 7, "budapest-food-and-markets": 3, "downtown-pest-walking-guide": 3 };
const canonicalOf = (html) => html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/)?.[1] ?? null;

const rows = [];
const problem = (row, msg) => row.problems.push(msg);

const sitemap = await get("/sitemap.xml");
// By path: the sitemap lists the canonical host even when checking a preview or a local build.
const inSitemap = new Set([...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
console.log(`sitemap.xml: HTTP ${sitemap.status}, ${inSitemap.size} URLs`);
if ([...inSitemap].some((p) => /tourdesk/i.test(p))) console.log("PROBLEM: a TourDesk URL is in the sitemap");

for (const a of attractions) {
  const path = `/attractions/${a.slug}`;
  const res = await get(path);
  const row = { path, status: res.status, canonical: null, h1: null, longForm: false, photoCredit: null, inSitemap: inSitemap.has(path), problems: [] };
  if (res.status !== 200) problem(row, `HTTP ${res.status}${res.location ? " -> " + res.location : ""}`);
  else {
    row.canonical = canonicalOf(res.body);
    row.h1 = res.body.match(/<h1[^>]*>([^<]*)/)?.[1] ?? "";
    row.longForm = /<h2[^>]*>About /.test(res.body) && res.body.includes("Plan your visit");
    row.history = res.body.includes('aria-labelledby="place-history"') && res.body.includes("Historical sources");
    row.descriptionWords = descriptionWords(res.body);
    if (!row.history) problem(row, "history section or its sources missing");
    if (row.descriptionWords < 35 || row.descriptionWords > 70) problem(row, `meta description has ${row.descriptionWords} words (35-70)`);
    if (!row.canonical) problem(row, "no canonical link");
    else if (!row.canonical.endsWith(path)) problem(row, `canonical ${row.canonical}`);
    if (!alnum(row.h1).includes(alnum(a.name.split("(")[0]).slice(0, 10))) problem(row, `h1 "${row.h1}"`);
    if (!row.longForm) problem(row, "about/plan-your-visit sections missing");
    if (photos[a.slug]) {
      row.photoCredit = res.body.includes("Photo:") || res.body.includes("Wikimedia Commons");
      if (!row.photoCredit) problem(row, "photo credit not found");
    }
  }
  if (!row.inSitemap) problem(row, "not in sitemap");
  rows.push(row);
  await sleep(delay);
}
for (const slug of guideSlugs) {
  const path = `/guides/${slug}`;
  const res = await get(path);
  const row = { path, status: res.status, canonical: null, problems: [], inSitemap: inSitemap.has(path), bytes: res.body.length };
  if (res.status !== 200) problem(row, `HTTP ${res.status}`);
  else {
    row.canonical = canonicalOf(res.body);
    row.words = visibleWords(res.body);
    row.inlinePhotos = res.body.split('<figure class="editorial-inline-photo').length - 1;
    if (!res.body.includes("Photo:")) problem(row, "no photo credit");
    if (!row.canonical) problem(row, "no canonical link");
    if (row.words < 1100) problem(row, `only ${row.words} visible words on the page`);
    if (row.inlinePhotos !== guidePhotos[slug]) problem(row, `${row.inlinePhotos} inline photographs, expected ${guidePhotos[slug]}`);
  }
  if (!row.inSitemap) problem(row, "not in sitemap");
  rows.push(row);
  await sleep(delay);
}
for (const path of ["/", "/attractions", "/guides", "/tours"]) {
  const res = await get(path);
  const row = { path, status: res.status, problems: [], tourdeskLink: /href="\/tours\/tourdesk/i.test(res.body) };
  if (res.status !== 200) problem(row, `HTTP ${res.status}`);
  if (row.tourdeskLink) problem(row, "a TourDesk product link is visible");
  if (path === "/attractions") {
    // The directory data travels in the page payload (the cards themselves are drawn in the browser on the deployment that predates the server-rendered directory).
    row.sacredEntries = res.body.split('\\"category\\":\\"Sacred architecture\\"').length - 1;
    row.sacredFilter = row.sacredEntries >= 16 || res.body.includes(">Sacred architecture<");
    row.title = res.body.match(/<title>([^<]*)/)?.[1] ?? "";
    if (!row.sacredFilter) problem(row, `only ${row.sacredEntries} 'Sacred architecture' entries in the directory (16 expected)`);
    if (!/\b(11[6-9]|1[2-9]\d)\b/.test(row.title + res.body.slice(0, 20000))) problem(row, "directory does not show a count of at least 116 places");
  }
  rows.push(row);
  await sleep(delay);
}

const linkRows = [];
if (checkLinks) {
  for (const [target, from] of linkSources) {
    if (target.startsWith("/_next/static/")) continue; // build assets: covered by the pages rendering
    let res = null;
    for (const method of ["HEAD", "GET"]) {
      try {
        res = await fetch(base + target, { method, headers: { "User-Agent": "gotobudapest-readonly-check/1.0" }, redirect: "manual" });
        if (res.status !== 405 && res.status !== 501) break;
      } catch (e) {
        res = { status: 0 };
      }
    }
    const row = { path: target, status: res.status, from, problems: [] };
    if (res.status !== 200 && !(res.status >= 301 && res.status <= 308)) problem(row, `link target answers ${res.status} (found on ${from})`);
    linkRows.push(row);
    await sleep(Math.min(delay, 150));
  }
  console.log(`links: ${linkRows.length} unique internal links and local images requested, ${linkRows.filter((r) => r.problems.length).length} failing`);
  for (const r of linkRows.filter((x) => x.problems.length)) console.log(`  ${r.path}: ${r.problems.join("; ")}`);
}

const bad = rows.filter((r) => r.problems.length);
for (const r of bad) console.log(`${r.path}: ${r.problems.join("; ")}`);
const ok = rows.filter((r) => r.status === 200).length;
console.log(`\n${rows.length} pages checked (${attractions.length} attractions, ${guideSlugs.length} guides, 4 index pages): ${ok} answered 200, ${bad.length} with problems`);
if (out) fs.writeFileSync(out, JSON.stringify({ base, checkedAt: new Date().toISOString(), rows, links: linkRows }, null, 1));
