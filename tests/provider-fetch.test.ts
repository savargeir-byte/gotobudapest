import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError, RESPONSE_TOO_LARGE, providerFetch } from "../lib/booking/common";
import { DiscoveryHttpError, failureDetail } from "../lib/tourdesk/discovery";

// A TourSearch page of 500 products can be several MB decoded; the 2 MB default (right for one product)
// would refuse it as a failure without an HTTP status. The bound is now per caller and the refusal is
// logged with its size.
function withFetch<T>(body: string, headers: Record<string, string>, run: () => Promise<T>): Promise<T> {
  const real = globalThis.fetch;
  globalThis.fetch = (async () => new Response(body, { status: 200, headers })) as typeof fetch;
  return run().finally(() => {
    globalThis.fetch = real;
  });
}
const big = JSON.stringify({ activities: [{ pad: "x".repeat(2_500_000) }], totalCount: 1 });

test("the default 2 MB cap refuses a large body, by declared length and by actual length", async () => {
  for (const headers of [{ "content-length": String(big.length) }, {}] as Record<string, string>[])
    await withFetch(big, headers, async () => {
      await assert.rejects(
        providerFetch("tourdesk", "/TourSearch", "k"),
        (e: unknown) => e instanceof ProviderError && e.status === 502 && e.message === RESPONSE_TOO_LARGE && e.upstreamStatus === undefined,
      );
    });
});

test("a caller-supplied bound accepts the same body, and is still a bound", async () => {
  await withFetch(big, { "content-length": String(big.length) }, async () => {
    const page = (await providerFetch("tourdesk", "/TourSearch", "k", {}, 0, false, 12000, 5_000_000)) as { totalCount: number };
    assert.equal(page.totalCount, 1);
    await assert.rejects(providerFetch("tourdesk", "/TourSearch", "k", {}, 0, false, 12000, 1_000_000), ProviderError);
  });
});

test("an unreadable body is still a plain 502", async () => {
  await withFetch("not json", {}, async () => {
    await assert.rejects(
      providerFetch("tourdesk", "/TourSearch", "k"),
      (e: unknown) => e instanceof ProviderError && e.status === 502 && e.message !== RESPONSE_TOO_LARGE,
    );
  });
});

test("failure details name the real cause without secrets", () => {
  assert.equal(failureDetail(new DiscoveryHttpError(400)), "HTTP 400");
  assert.equal(failureDetail(new DiscoveryHttpError(undefined, RESPONSE_TOO_LARGE)), "response too large");
  assert.equal(failureDetail(new DiscoveryHttpError(undefined)), "no response");
  assert.equal(failureDetail(new Error("boom")), "no response");
});

import { attemptsSummary } from "../lib/tourdesk/discovery";

test("the public failure summary names strategies and statuses only, and is bounded", () => {
  assert.equal(
    attemptsSummary([
      { strategy: "geo", outcome: "error", detail: "pageSize 500: HTTP 400" },
      { strategy: "geo", outcome: "error", detail: "pageSize 100: response too large" },
      { strategy: "scan", outcome: "error", detail: "HTTP 429" },
    ]),
    "geo error (pageSize 500: HTTP 400); geo error (pageSize 100: response too large); scan error (HTTP 429)",
  );
  assert.equal(attemptsSummary([]), "");
  assert.ok(attemptsSummary(Array.from({ length: 100 }, () => ({ strategy: "geo", outcome: "error", detail: "HTTP 500" }))).length <= 400);
});
