#!/usr/bin/env node
/**
 * Read-only Viator availability diagnostics for GoToBudapest. Calls ONLY:
 *   GET  /products/{code}               (product details)
 *   POST /availability/check            (availability and prices: a read, never a booking)
 * It never calls /bookings, /availability/hold or any cart/payment endpoint, and it never
 * prints the API key.
 *
 * Purpose: the live site gets start times from /availability/check but no price. This prints the
 * SHAPE of the real response (every key path with its JSON type, numbers shown) so the price
 * container can be read from evidence instead of guessed.
 *
 * Usage (key from the Vercel project; the owner runs it, the key is never committed):
 *   vercel env pull .env.diagnose --environment=production
 *   node --env-file=.env.diagnose scripts/diagnose-viator-availability.mjs [PRODUCT_CODE] [YYYY-MM-DD]
 *   (delete .env.diagnose afterwards)
 */
const key = process.env.VIATOR_API_KEY?.trim();
if (!key) {
  console.error("VIATOR_API_KEY is not set (see the usage notes at the top of this file).");
  process.exit(2);
}
const base = "https://api.viator.com/partner";
const code = /^[0-9]{1,10}P[0-9]{1,6}$/.test(process.argv[2] ?? "") ? process.argv[2] : "35015P1";
const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
const date = /^\d{4}-\d{2}-\d{2}$/.test(process.argv[3] ?? "") ? process.argv[3] : inTwoWeeks;
const headers = {
  "exp-api-key": key,
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "Content-Type": "application/json",
};

// One line per key path: "$.bookableItems[].totalPrice.price.original.recommendedRetailPrice: number = 25".
function shape(value, path, out, depth = 0) {
  if (value === null) return void out.push(`${path}: null`);
  if (Array.isArray(value)) {
    out.push(`${path}: array(${value.length})`);
    if (value.length && depth < 8) shape(value[0], `${path}[]`, out, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) if (depth < 8) shape(v, `${path}.${k}`, out, depth + 1);
    return;
  }
  const shown = typeof value === "string" ? JSON.stringify(value.slice(0, 40)) : String(value);
  out.push(`${path}: ${typeof value} = ${shown}`);
}

async function call(method, path, body) {
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { status: res.status, json, bytes: text.length };
}

const product = await call("GET", `/products/${code}`);
console.log(`GET /products/${code} -> HTTP ${product.status} (${product.bytes} bytes)`);
if (product.json) {
  console.log("  pricingInfo.type:", product.json.pricingInfo?.type, "| ageBands:", (product.json.pricingInfo?.ageBands ?? []).map((b) => b.ageBand).join(","));
  console.log("  bookingConfirmationSettings:", JSON.stringify(product.json.bookingConfirmationSettings));
}

const check = await call("POST", "/availability/check", {
  productCode: code,
  travelDate: date,
  currency: "EUR",
  paxMix: [{ ageBand: "ADULT", numberOfTravelers: 2 }],
});
console.log(`POST /availability/check ${code} ${date} -> HTTP ${check.status} (${check.bytes} bytes)`);
if (check.json) {
  const lines = [];
  shape(check.json, "$", lines);
  // Items repeat per start time: the first item shows the shape.
  console.log(lines.join("\n"));
  const items = check.json.bookableItems ?? [];
  console.log(
    `\nitems=${items.length} available=${items.filter((i) => i.available).length} withTotalPrice=${items.filter((i) => i.totalPrice).length} withLineItems=${items.filter((i) => i.lineItems?.length).length}`,
  );
} else {
  console.log("(response was not JSON)");
}
