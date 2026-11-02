// Read-only public check of a deployed site: every attraction page, the eight guides and the sitemap.
// One GET per page, paced (default 400 ms), no cookies, no forms, no booking. It records HTTP status, the canonical URL,
// the h1, whether the long-form text and the photo credit are present, and it compares the sitemap with the data.
// Run: NODE_OPTIONS=--use-system-ca node scripts/verify-live-pages.mjs [--base https://www.gotobuda.com] [--delay 400] [--out report.json]
import fs from "node:fs";

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const base = arg("--base", "https://www.gotobuda.com").replace(/\/$/, "");
const delay = Number(arg("--delay", "400"));
const out = arg("--out", null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const attractions = JSON.parse(fs.readFileSync("lib/attractions.json", "utf8"));
const guideSlugs = ["budapest-in-3-days", "budapest-thermal-baths", "getting-around-budapest", "buda-castle-district", "danube-cruises", "budapest-bars-nightlife", "budapest-food-and-markets", "downtown-pest-walking-guide"];
const photos = JSON.parse(fs.readFileSync("lib/photos.json", "utf8"));
const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));

async function get(path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(base + path, { headers: { "User-Agent": "gotobudapest-readonly-check/1.0", Accept: "text/html" }, redirect: "manual" });
      if (r.status === 429) { await sleep(15000); continue; }
      return { status: r.status, location: r.headers.get("location"), body: r.status === 200 ? await r.text() : "" };
    } catch (e) {
      if (attempt === 2) return { status: 0, error: e.message, body: "" };
      await sleep(2000);
    }
  }
  return { status: 0, body: "" };
}

const rows = [];
const problem = (row, msg) => row.problems.push(msg);

const sitemap = await get("/sitemap.xml");
const inSitemap = new Set([...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)); // by path: the sitemap lists the canonical host even when checking a preview or local build
console.log(`sitemap.xml: HTTP ${sitemap.status}, ${inSitemap.size} URLs`);

for (const a of attractions) {
  const path = `/attractions/${a.slug}`;
  const res = await get(path);
  const row = { path, status: res.status, canonical: null, h1: null, longForm: false, photoCredit: null, inSitemap: inSitemap.has(path), problems: [] };
  if (res.status !== 200) problem(row, `HTTP ${res.status}${res.location ? " -> " + res.location : ""}`);
  else {
    row.canonical = res.body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? res.body.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/)?.[1] ?? null;
    row.h1 = decode(res.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g, "") ?? "");
    const t = text(res.body);
    row.longForm = /About /.test(t) && /Plan your visit/.test(t);
    if (!row.canonical) problem(row, "no canonical link");
    else if (!row.canonical.endsWith(path)) problem(row, `canonical ${row.canonical}`);
    if (!row.h1.includes(a.name.replace(/\s*\(.*\)/, "").slice(0, 12))) problem(row, `h1 "${row.h1}"`);
    if (!row.longForm) problem(row, "about/plan-your-visit sections missing");
    const p = photos[a.slug];
    if (p) {
      const credited = t.includes(p.credit.author.slice(0, 20)) || t.includes("Wikimedia Commons");
      row.photoCredit = credited;
      if (!credited) problem(row, "photo credit not found");
    }
  }
  if (!row.inSitemap) problem(row, "not in sitemap");
  rows.push(row);
  await sleep(delay);
}
for (const slug of guideSlugs) {
  const path = `/guides/${slug}`;
  const res = await get(path);
  const row = { path, status: res.status, canonical: null, h1: null, problems: [], inSitemap: inSitemap.has(path) };
  if (res.status !== 200) problem(row, `HTTP ${res.status}`);
  else {
    row.canonical = res.body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ?? null;
    const t = text(res.body);
    row.words = t.split(" ").length;
    if (!/Photo:/.test(t)) problem(row, "no photo credit");
    if (!row.canonical) problem(row, "no canonical link");
  }
  if (!row.inSitemap) problem(row, "not in sitemap");
  rows.push(row);
  await sleep(delay);
}
for (const path of ["/", "/attractions", "/guides", "/tours"]) {
  const res = await get(path);
  const row = { path, status: res.status, problems: [], tourdeskVisible: /tourdesk/i.test(text(res.body)) };
  if (res.status !== 200) problem(row, `HTTP ${res.status}`);
  if (row.tourdeskVisible) problem(row, "TourDesk text is visible");
  rows.push(row);
  await sleep(delay);
}

const bad = rows.filter((r) => r.problems.length);
for (const r of bad) console.log(`${r.path}: ${r.problems.join("; ")}`);
const ok = rows.filter((r) => r.status === 200).length;
console.log(`\n${rows.length} pages checked (${attractions.length} attractions, ${guideSlugs.length} guides, 4 index pages): ${ok} answered 200, ${bad.length} with problems`);
if (out) fs.writeFileSync(out, JSON.stringify({ base, checkedAt: new Date().toISOString(), rows }, null, 1));
