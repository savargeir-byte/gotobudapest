import assert from "node:assert/strict";
import test from "node:test";
import { mockOrigin, providerUrl } from "../lib/booking/test-origin";

const env = (o: Record<string, string>) => o;

test("mock origin is ignored in production, even for a valid loopback value", () => {
  assert.equal(
    mockOrigin(env({ BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900", VERCEL_ENV: "production" })),
    undefined,
  );
  assert.equal(
    providerUrl(
      "https://api.tourdesk.io/api/v1.0/Tour/1-1",
      env({ BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900", VERCEL_ENV: "production" }),
    ),
    "https://api.tourdesk.io/api/v1.0/Tour/1-1",
  );
});

test("mock origin is ignored unless it is exactly http loopback with a port", () => {
  for (const bad of [
    "http://127.0.0.1.evil.com:3900",
    "http://localhost.evil.com:3900",
    "http://user@127.0.0.1:3900",
    "http://127.0.0.1:3900@evil.com",
    "https://127.0.0.1:3900",
    "http://127.0.0.1:3900/",
    "http://127.0.0.1:3900/path",
    "http://127.0.0.1:3900?x=1",
    "http://127.0.0.1",
    "http://127.0.0.1:0",
    "http://127.0.0.1:70000",
    "http://0.0.0.0:3900",
    "http://[::1]:3900",
    "http://evil.example:3900",
    "",
  ])
    assert.equal(mockOrigin(env({ BOOKING_MOCK_ORIGIN: bad })), undefined, bad);
  assert.equal(mockOrigin({}), undefined);
});

test("valid loopback origins are honoured outside production", () => {
  for (const ok of ["http://127.0.0.1:3900", "http://localhost:3900"])
    for (const vercelEnv of [undefined, "preview", "development"])
      assert.equal(
        mockOrigin({ BOOKING_MOCK_ORIGIN: ok, ...(vercelEnv ? { VERCEL_ENV: vercelEnv } : {}) }),
        ok,
      );
});

test("only provider API hosts are rewritten, keeping path and query", () => {
  const e = env({ BOOKING_MOCK_ORIGIN: "http://127.0.0.1:3900" });
  assert.equal(
    providerUrl("https://api.tourdesk.io/api/v1.0/TourAvailability/1-2/2026-11-01/en", e),
    "http://127.0.0.1:3900/__td/api/v1.0/TourAvailability/1-2/2026-11-01/en",
  );
  assert.equal(
    providerUrl("https://api.viator.com/partner/products/ABC123?x=1", e),
    "http://127.0.0.1:3900/__viator/partner/products/ABC123?x=1",
  );
  assert.equal(
    providerUrl("https://api.tiqets.com/v2/products?city_id=1", e),
    "http://127.0.0.1:3900/__tiqets/v2/products?city_id=1",
  );
  // Any other host (including a checkout host) is never redirected.
  assert.equal(
    providerUrl("https://checkout.tourdesk.is/booking/1-2", e),
    "https://checkout.tourdesk.is/booking/1-2",
  );
  assert.equal(providerUrl("https://evil.example/x", e), "https://evil.example/x");
  assert.equal(providerUrl("http://api.tourdesk.io/x", e), "http://api.tourdesk.io/x");
});
