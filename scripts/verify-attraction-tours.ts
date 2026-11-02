// Read-only check of the ticket and tour cards on attraction pages. For every attraction it asks the public
// marketplace API (the same request the page makes), applies the page's own relevance filter, and reports
// the products that would be shown, so the matching, provider, price, internal page and affiliate hand-off can
// be reviewed. It never books anything and sends one GET per attraction, paced under the API's rate limit.
// Run: NODE_OPTIONS=--use-system-ca npx tsx scripts/verify-attraction-tours.ts [--base https://www.gotobuda.com] [slug ...]
import { attractions } from "../lib/attractions";
import { attractionContext, contextQuery, relevantProducts } from "../lib/marketplace/context";
import { apiUrl } from "../lib/marketplace/ui";
import type { MarketplaceProduct, MarketplaceResult } from "../lib/marketplace/types";

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const base = baseIdx >= 0 ? args[baseIdx + 1] : "https://www.gotobuda.com";
const only = args.filter((a, i) => !a.startsWith("--") && i !== baseIdx + 1);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
type Row = { slug: string; name: string; asked: string; shown: MarketplaceProduct[]; problems: string[] };
const rows: Row[] = [];

for (const a of attractions) {
  if (only.length && !only.includes(a.slug)) continue;
  const ctx = attractionContext(a.name, a.slug);
  if (!ctx) continue;
  const asked = apiUrl(contextQuery(ctx));
  let body: MarketplaceResult | undefined;
  for (let attempt = 0; attempt < 4 && !body; attempt++) {
    const r = await fetch(base + asked, { headers: { Accept: "application/json" } });
    if (r.status === 429) {
      await sleep(15000);
      continue;
    }
    if (!r.ok) break;
    body = (await r.json()) as MarketplaceResult;
  }
  const shown = body ? relevantProducts(body.items ?? [], ctx, 6) : [];
  const problems: string[] = [];
  if (!body) problems.push("API request failed");
  for (const p of shown) {
    if (!["viator", "tiqets"].includes(p.provider)) problems.push(`${p.id}: unexpected provider ${p.provider}`);
    if (!p.detailUrl?.startsWith("/tours/")) problems.push(`${p.id}: no internal product page`);
    let bookingHost: string | undefined;
    try {
      const bookingUrl = new URL(p.bookingUrl);
      if (bookingUrl.protocol !== "https:") problems.push(`${p.id}: booking URL is not https`);
      else bookingHost = bookingUrl.hostname.toLowerCase();
    } catch {
      problems.push(`${p.id}: booking URL is malformed`);
    }
    if (bookingHost && p.provider === "viator" && bookingHost !== "viator.com" && !bookingHost.endsWith(".viator.com"))
      problems.push(`${p.id}: Viator URL off-domain`);
    if (bookingHost && p.provider === "tiqets" && bookingHost !== "tiqets.com" && !bookingHost.endsWith(".tiqets.com"))
      problems.push(`${p.id}: Tiqets URL off-domain`);
    if (p.price && !(p.price.amount > 0 && /^[A-Z]{3}$/.test(p.price.currency))) problems.push(`${p.id}: odd price ${JSON.stringify(p.price)}`);
    if (!p.price) problems.push(`${p.id}: no price (card shows none, nothing invented)`);
  }
  rows.push({ slug: a.slug, name: a.name, asked: ctx.q ?? "", shown, problems });
  await sleep(2300);
}

const withTours = rows.filter((r) => r.shown.length);
console.log(`Attractions with a tour/ticket context: ${rows.length}; with at least one relevant live product: ${withTours.length}; none: ${rows.length - withTours.length}`);
for (const r of withTours) {
  console.log(`\n${r.slug} (${r.name}) asked "${r.asked}" -> ${r.shown.length}`);
  for (const p of r.shown) {
    const price = p.price ? `${p.price.amount} ${p.price.currency}` : "no price";
    console.log(`  [${p.provider}] ${p.title.slice(0, 80)} | ${price} | ${p.detailUrl} | affiliate: ${/pid=|partner|aid=|mcid=|tq_|ref/i.test(p.bookingUrl) ? "yes" : "CHECK"}`);
  }
}
const bad = rows.flatMap((r) => r.problems.map((p) => `${r.slug}: ${p}`));
console.log(`\nProblems: ${bad.length}`);
for (const b of bad) console.log("  " + b);
console.log(`\nNo-product attractions (nothing is rendered for them): ${rows.filter((r) => !r.shown.length).map((r) => r.slug).join(", ")}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
