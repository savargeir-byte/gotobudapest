import assert from "node:assert/strict";
import test from "node:test";
import { activeProviders, providerNames, tourdeskMarketplaceEnabled } from "../lib/marketplace/enabled";
import { searchMarketplace } from "../lib/marketplace/registry";
import { allProvidersDown, countLine, degradedProviders } from "../lib/marketplace/ui";
import { PROVIDER_LABEL, type MarketplaceResult } from "../lib/marketplace/types";

// TourDesk is paused: the switch defaults to OFF with no configuration and only the exact value "true"
// turns it on. The integration code itself is untouched (its own tests still run).

test("the TourDesk marketplace switch defaults to off; only the exact value true enables it", () => {
  assert.equal(tourdeskMarketplaceEnabled({}), false);
  for (const v of ["", "false", "1", "yes", "TRUE", " true", "true "]) assert.equal(tourdeskMarketplaceEnabled({ TOURDESK_MARKETPLACE_ENABLED: v }), false, JSON.stringify(v));
  assert.equal(tourdeskMarketplaceEnabled({ TOURDESK_MARKETPLACE_ENABLED: "true" }), true);
  // an API key alone never turns it on
  assert.equal(tourdeskMarketplaceEnabled({ TOURDESK_API_KEY: "k" }), false);
  assert.deepEqual(activeProviders({}), ["viator", "tiqets"]);
  assert.deepEqual(activeProviders({ TOURDESK_MARKETPLACE_ENABLED: "true" }), ["viator", "tiqets", "tourdesk"]);
});

test("partner names for copy follow the active list", () => {
  assert.equal(providerNames(["viator", "tiqets"], PROVIDER_LABEL), "Viator and Tiqets");
  assert.equal(providerNames(["viator", "tiqets", "tourdesk"], PROVIDER_LABEL), "Viator, Tiqets and TourDesk");
  assert.equal(providerNames(["viator"], PROVIDER_LABEL), "Viator");
});

async function withEnv<T>(env: Record<string, string | undefined>, run: (urls: string[]) => Promise<T>): Promise<T> {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k];
    else process.env[k] = env[k];
  }
  const urls: string[] = [];
  const realFetch = globalThis.fetch;
  // every provider answers HTTP 500: a provider that is asked shows up as an error, one that is not asked is silent
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    urls.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    return new Response("{}", { status: 500 });
  }) as typeof fetch;
  try {
    return await run(urls);
  } finally {
    globalThis.fetch = realFetch;
    for (const k of Object.keys(env)) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test("switched off: the marketplace makes no TourDesk request and the result does not mention TourDesk", async () => {
  await withEnv(
    { TOURDESK_API_KEY: "dummy-key", TOURDESK_MARKETPLACE_ENABLED: undefined, VIATOR_API_KEY: "dummy", TIQETS_API_KEY: "dummy" },
    async (urls) => {
      const r = await searchMarketplace({ sort: "relevance" });
      assert.deepEqual(Object.keys(r.providers).sort(), ["tiqets", "viator"]);
      assert.equal(urls.some((u) => /tourdesk/i.test(u)), false, "no TourDesk request");
      assert.ok(urls.some((u) => /viator|tiqets/.test(u)), "the active providers are still asked");
      assert.doesNotMatch(JSON.stringify(r), /tourdesk/i);
    },
  );
});

test("switched off: a request for the TourDesk filter asks nobody and says nothing about TourDesk", async () => {
  await withEnv({ TOURDESK_API_KEY: "dummy-key", TOURDESK_MARKETPLACE_ENABLED: undefined }, async (urls) => {
    const r = await searchMarketplace({ sort: "relevance", provider: "tourdesk" });
    assert.equal(urls.length, 0);
    assert.deepEqual(r.items, []);
    assert.doesNotMatch(JSON.stringify(r), /tourdesk/i);
  });
});

test("switched on again: TourDesk is asked and reported like before (the integration is preserved)", async () => {
  await withEnv({ TOURDESK_API_KEY: "dummy-key", TOURDESK_MARKETPLACE_ENABLED: "true", VIATOR_API_KEY: undefined, TIQETS_API_KEY: undefined }, async (urls) => {
    const r = await searchMarketplace({ sort: "relevance", provider: "tourdesk" });
    assert.ok(urls.some((u) => /api\.tourdesk\.io/.test(u)), "TourDesk is requested");
    assert.equal(r.providers.tourdesk.status, "error");
  });
});

test("UI helpers cope with a result that has no TourDesk entry (no crash, no TourDesk line)", () => {
  const ok = (count: number) => ({ status: "ok" as const, count, total: count });
  const result = { items: [], providers: { viator: ok(18), tiqets: ok(12) } } as unknown as MarketplaceResult;
  assert.equal(countLine(result, { sort: "relevance" }, 30), "Showing 30 of about 30 products from 2 providers");
  assert.deepEqual(degradedProviders(result, { sort: "relevance" }), []);
  assert.equal(allProvidersDown(result, { sort: "relevance" }), false);
  const down = { items: [], providers: { viator: { status: "error", count: 0 }, tiqets: { status: "error", count: 0 } } } as unknown as MarketplaceResult;
  assert.equal(allProvidersDown(down, { sort: "relevance" }), true);
  assert.ok(degradedProviders(down, { sort: "relevance" }).every((d) => d.provider !== "tourdesk"));
  assert.equal(allProvidersDown({ items: [], providers: {} } as unknown as MarketplaceResult, { sort: "relevance" }), false, "no providers at all is not 'all down'");
});
