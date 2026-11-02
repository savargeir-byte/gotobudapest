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
    if (!res.body.includes("Photo:")) problem(row, "no photo credit");
    if (!row.canonical) problem(row, "no canonical link");
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
