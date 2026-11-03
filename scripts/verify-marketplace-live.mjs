// Read-only quality check of the public tours marketplace (Viator and Tiqets; TourDesk must stay absent).
// It only sends GET requests to the public API the /tours page itself uses, paced under that API's limit of 30 per minute
// (default 2.4 s), and to a few internal product pages. It never books, never posts, never follows a provider link.
// Checked: provider identity, real price, affiliate booking URL (https, provider domain, partner parameters), internal product page,
// photos, categories, sorting (monotonic), pagination (no repeated products), provider filter, product pages (200, one provider hand-off).
// Run: NODE_OPTIONS=--use-system-ca node scripts/verify-marketplace-live.mjs [--base https://www.gotobuda.com] [--delay 2400] [--json > report.json]

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const base = arg("--base", "https://www.gotobuda.com").replace(/\/$/, "");
const delay = Number(arg("--delay", "2400"));
const jsonOutput = args.includes("--json");
const log = (...parts) => { if (!jsonOutput) console.log(...parts); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CATEGORIES = ["cruises", "baths", "walking", "food", "tickets", "daytrips", "transfers", "sightseeing", "nightlife", "family"];
const problems = [];
const note = (msg) => problems.push(msg);
const report = { base, checkedAt: new Date().toISOString(), queries: [], productPages: [], problems };

async function api(params) {
  const qs = new URLSearchParams(params).toString();
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`${base}/api/marketplace/search${qs ? "?" + qs : ""}`, { headers: { Accept: "application/json", "User-Agent": "gotobudapest-readonly-check/1.0" } });
    if (r.status === 429) {
      await sleep(20000);
      continue;
    }
    if (!r.ok) return { status: r.status, body: null };
    return { status: r.status, body: await r.json() };
  }
  return { status: 429, body: null };
}

const hostOk = { viator: /(^|\.)viator\.com$/, tiqets: /(^|\.)tiqets\.com$/ };
function checkItem(label, p) {
  const where = `${label}: ${p.id ?? "?"}`;
  if (!["viator", "tiqets"].includes(p.provider)) return note(`${where}: provider ${p.provider}`);
  if (!p.title) note(`${where}: no title`);
  let url;
  try { url = new URL(p.bookingUrl); } catch { return note(`${where}: booking URL is not a URL`); }
  if (url.protocol !== "https:") note(`${where}: booking URL is not https`);
  if (!hostOk[p.provider].test(url.hostname)) note(`${where}: booking host ${url.hostname} is not ${p.provider}`);
  const partner = p.provider === "viator" ? url.searchParams.has("pid") && url.searchParams.has("mcid") : [...url.searchParams.keys()].some((k) => /partner|tq|aid|ref|utm_source/i.test(k)) || /partner/i.test(url.search);
  if (!partner) note(`${where}: no affiliate/partner parameter in the booking URL`);
  if (p.price && !(p.price.amount > 0 && /^[A-Z]{3}$/.test(p.price.currency))) note(`${where}: odd price ${JSON.stringify(p.price)}`);
  if (!p.price) note(`${where}: no price (the card shows none)`);
  if (!/^\/tours\/(viator|tiqets)\/[A-Za-z0-9-]+$/.test(p.detailUrl ?? "")) note(`${where}: detail URL ${p.detailUrl}`);
  if (p.image && !/^https:\/\//.test(p.image.src)) note(`${where}: image is not https`);
  if (p.image && !p.image.alt) note(`${where}: image without alt text`);
}

const seen = new Map();
async function query(label, params, expect = {}) {
  const { status, body } = await api(params);
  const row = { label, params, status, items: body?.items?.length ?? 0 };
  report.queries.push(row);
  await sleep(delay);
  if (!body) { note(`${label}: HTTP ${status}`); return null; }
  for (const p of body.items) { checkItem(label, p); seen.set(p.id, p); }
  const providers = new Set(body.items.map((p) => p.provider));
  row.providers = [...providers];
  if (providers.has("tourdesk") || body.items.some((p) => /tourdesk/i.test(p.id))) note(`${label}: TourDesk product present`);
  if (body.providers?.tourdesk && !["disabled", "skipped"].includes(body.providers.tourdesk.status)) note(`${label}: TourDesk status ${body.providers.tourdesk.status}`);
  if (expect.provider && [...providers].some((x) => x !== expect.provider)) note(`${label}: provider filter leaked ${[...providers]}`);
  if (expect.sort) {
    const prices = body.items.filter((p) => p.price).map((p) => p.price.amount);
    const ok = expect.sort === "asc" ? prices.every((v, i) => i === 0 || v >= prices[i - 1]) : prices.every((v, i) => i === 0 || v <= prices[i - 1]);
    row.sortedPrices = prices.slice(0, 8);
    if (!ok) note(`${label}: prices are not sorted ${expect.sort}: ${prices.slice(0, 10)}`);
  }
  return body;
}

const first = await query("default", {});
log(`default: ${first?.items.length ?? 0} products, providers ${JSON.stringify(first?.providers && Object.fromEntries(Object.entries(first.providers).map(([k, v]) => [k, v.status])))}`);
await query("provider=viator", { provider: "viator" }, { provider: "viator" });
await query("provider=tiqets", { provider: "tiqets" }, { provider: "tiqets" });
for (const c of CATEGORIES) {
  const b = await query(`category=${c}`, { category: c });
  if (b && !b.items.length) report.queries.at(-1).empty = true;
  if (b) for (const p of b.items) if (!p.categories.includes(c)) note(`category=${c}: ${p.id} is not in the category (${p.categories})`);
}
await query("sort=price_asc", { sort: "price_asc", provider: "viator" }, { sort: "asc", provider: "viator" });
await query("sort=price_desc", { sort: "price_desc", provider: "viator" }, { sort: "desc", provider: "viator" });
await query("sort=rating", { sort: "rating", provider: "viator" });
await query("price filter", { priceMin: "10", priceMax: "60" });
await query("search q=parliament", { q: "parliament" });
if (first?.nextCursor) {
  const second = await query("page 2", { cursor: first.nextCursor });
  const dup = second?.items.filter((p) => first.items.some((q) => q.id === p.id)).length ?? 0;
  if (dup) note(`page 2 repeats ${dup} products of page 1`);
} else note("default: no nextCursor, pagination not testable");

// Internal product pages: a bounded sample per provider.
for (const provider of ["viator", "tiqets"]) {
  const sample = [...seen.values()].filter((p) => p.provider === provider && /^\/tours\/(viator|tiqets)\/[A-Za-z0-9-]+$/.test(p.detailUrl ?? "")).slice(0, 4);
  for (const p of sample) {
    const r = await fetch(base + p.detailUrl, { headers: { "User-Agent": "gotobudapest-readonly-check/1.0" }, redirect: "manual" });
    const html = r.status === 200 ? await r.text() : "";
    const row = { path: p.detailUrl, status: r.status, title: p.title, providerLinks: 0, problems: [] };
    if (r.status !== 200) row.problems.push(`HTTP ${r.status}`);
    else {
      row.providerLinks = [...html.matchAll(/href="(https:\/\/[^"]+)"/g)].filter((m) => hostOk[provider].test(new URL(m[1].replace(/&amp;/g, "&")).hostname)).length;
      if (!html.includes("<h1")) row.problems.push("no h1");
      if (/href="\/tours\/tourdesk/i.test(html)) row.problems.push("TourDesk link");
      if (row.providerLinks < 1) row.problems.push("no provider hand-off link");
      if (!/availability/i.test(html)) row.problems.push("no availability section");
    }
    for (const m of row.problems) note(`product page ${p.detailUrl}: ${m}`);
    report.productPages.push(row);
    await sleep(600);
  }
}

const providerCount = {};
for (const p of seen.values()) providerCount[p.provider] = (providerCount[p.provider] || 0) + 1;
report.distinctProducts = seen.size;
report.byProvider = providerCount;
log(`distinct products seen: ${seen.size} ${JSON.stringify(providerCount)}`);
log(`queries: ${report.queries.length}; product pages: ${report.productPages.length}`);
log(`empty categories: ${report.queries.filter((q) => q.empty).map((q) => q.label).join(", ") || "none"}`);
log(`problems: ${problems.length}`);
for (const m of problems.slice(0, 60)) log("  " + m);
if (jsonOutput) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
