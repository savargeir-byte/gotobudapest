import { expect, test } from "@playwright/test";
import { encodeSignatureHeader } from "@sanity/webhook";

// Proves the REAL per-client limits (30 requests per minute) on a dedicated server started
// WITHOUT RATE_LIMIT_TEST_SCALE (see playwright.config.ts, port 3102). Every request comes
// from the test runner's own address: no forwarded-address header is set or varied, so the
// limiter is exercised exactly as production exercises it. Each test hits a different route
// (each route has its own counter), so the tests do not depend on each other.
const secret = process.env.PW_REVALIDATE_SECRET || "";
test.beforeEach(({}, info) => test.skip(info.project.name !== "rate-limits", "runs once, on the rate-limits project"));
test.describe.configure({ mode: "serial" });

async function statuses(count: number, call: () => Promise<{ status(): number; headers(): Record<string, string> }>) {
  const out: number[] = [];
  let last: { status(): number; headers(): Record<string, string> } | undefined;
  for (let i = 0; i < count; i++) {
    last = await call();
    out.push(last.status());
  }
  return { out, last: last! };
}

test("marketplace search: the first 30 requests succeed, the 31st is refused with Retry-After", async ({ request }) => {
  const { out, last } = await statuses(31, () => request.get("/api/marketplace/search?provider=viator"));
  expect(out.slice(0, 30).every((s) => s === 200)).toBe(true);
  expect(out[30]).toBe(429);
  expect(last.headers()["retry-after"]).toBe("60");
  expect(last.headers()["cache-control"]).toBe("no-store");
});

test("booking API: the 31st request is refused before any provider is contacted", async ({ request }) => {
  const { out, last } = await statuses(31, () =>
    request.post("/api/booking/viator/check", { data: { not: "a valid selection" } }),
  );
  expect(out.slice(0, 30).every((s) => s === 400)).toBe(true);
  expect(out[30]).toBe(429);
  expect(last.headers()["retry-after"]).toBe("60");
});

test("revalidation webhook: the 31st request is refused, signed requests are unaffected until then", async ({ request }) => {
  test.skip(!secret, "needs PW_REVALIDATE_SECRET");
  const body = JSON.stringify({ _type: "guide", _id: "guide.danube-cruises", operation: "update" });
  const signed = await encodeSignatureHeader(body, Date.now(), secret);
  const headers = { "content-type": "application/json", "sanity-webhook-signature": signed };
  const { out } = await statuses(31, () => request.post("/api/revalidate", { data: body, headers }));
  expect(out.slice(0, 30).every((s) => s === 200)).toBe(true);
  expect(out[30]).toBe(429);
});
