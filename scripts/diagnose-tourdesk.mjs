// Read-only TourDesk diagnosis for the GoToBudapest affiliate account.
//
// Makes a handful (about 8) of explicit requests to https://api.tourdesk.io: three
// GET reference lists and five TourSearch POSTs (search is read-only). It creates
// no bookings or holds, writes nothing, never prints the API key, and does not scan
// any network.
//
// Usage (key from the Vercel project, never committed):
//   vercel env pull .env.diagnose --environment=production   # owner, once
//   node --env-file=.env.diagnose scripts/diagnose-tourdesk.mjs
//   (delete .env.diagnose afterwards)
//
// Verdicts:
//   AUTH_FAILED               401/403 or no key: the key is missing/invalid/for another account
//   NO_BUDAPEST_INVENTORY     authenticated, catalogue present, but nothing Budapest/Hungary
//   SEARCH_PAYLOAD_SUSPECT    free-text search returns the full catalogue regardless of the term
//   BUDAPEST_INVENTORY_FOUND  Budapest/Hungary products exist (check the site's filter next)
const key = process.env.TOURDESK_API_KEY?.trim();
const base = "https://api.tourdesk.io/api/v1.0";
if (!key) {
  console.error("TOURDESK_API_KEY is not set in this environment. Verdict: AUTH_FAILED (no key).");
  process.exit(2);
}
const headers = { ApiKey: key, Accept: "application/json", "Content-Type": "application/json" };
const hungary = /budapest|hungar|magyar|danube|buda\b|pest\b|szechenyi|balaton/i;

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  let json;
  try { json = await res.json(); } catch { json = undefined; }
  return { status: res.status, json };
}
const search = (term, extra = {}) =>
  call("POST", "/TourSearch", { searchParameter: term, page: 1, pageSize: 50, ...extra });
const rowsOf = (r) => (Array.isArray(r.json?.activities) ? r.json.activities : []);
const totalOf = (r) => r.json?.totalCount ?? r.json?.total ?? r.json?.totalItems ?? rowsOf(r).length;

const out = { statuses: {} };
const attractions = await call("GET", "/Attraction");
const regions = await call("GET", "/Region");
out.statuses.attraction = attractions.status;
out.statuses.region = regions.status;
const names = (r) => (Array.isArray(r.json) ? r.json : r.json?.items ?? []).map((x) => x.name ?? x.title ?? x.filterValue ?? "?");
const attractionNames = names(attractions);
const regionNames = names(regions);

const terms = ["", "Budapest", "Hungary", "Danube", "Hungarian"];
const results = {};
for (const t of terms) {
  const r = await search(t);
  out.statuses["search:" + (t || "(empty)")] = r.status;
  const rows = rowsOf(r);
  results[t || "(empty)"] = {
    total: totalOf(r),
    rows: rows.length,
    budapestLike: rows.filter((x) => hungary.test(`${x.title ?? ""} ${x.description ?? ""}`)).length,
    currencies: [...new Set(rows.map((x) => x.currency).filter(Boolean))],
    sample: rows.slice(0, 3).map((x) => String(x.title).slice(0, 70)),
  };
}

console.log("HTTP statuses:", JSON.stringify(out.statuses));
console.log(`Attractions (${attractionNames.length}): any Hungary/Budapest -> ${attractionNames.some((n) => hungary.test(n))}`);
console.log(`Regions (${regionNames.length}): any Hungary/Budapest -> ${regionNames.some((n) => hungary.test(n))}`);
console.table(results);

const denied = Object.values(out.statuses).some((s) => s === 401 || s === 403);
const anyBudapest = Object.values(results).some((r) => r.budapestLike > 0) ||
  attractionNames.some((n) => hungary.test(n)) || regionNames.some((n) => hungary.test(n));
const emptyTotal = results["(empty)"].total;
const sameEverywhere = ["Budapest", "Hungary", "Danube"].every((t) => results[t].total === emptyTotal) && emptyTotal > 0;
let verdict;
if (denied || Object.values(out.statuses).every((s) => s !== 200)) verdict = "AUTH_FAILED";
else if (anyBudapest) verdict = "BUDAPEST_INVENTORY_FOUND";
else if (sameEverywhere) verdict = "SEARCH_PAYLOAD_SUSPECT (search term ignored) and no Budapest products visible";
else verdict = "NO_BUDAPEST_INVENTORY";
console.log("\nVerdict:", verdict);
if (verdict === "NO_BUDAPEST_INVENTORY")
  console.log("The authenticated catalogue contains no Budapest/Hungary products: ask TourDesk to enable Budapest inventory for this affiliate account. Do not substitute other destinations.");
