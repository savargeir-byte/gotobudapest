// Cached TourDesk discovery for the Budapest marketplace and offers.
//
// The discovered Budapest subset (see discovery.ts) is cached for a bounded time under the
// 'tourdesk-catalog' tag, scoped per deployment + strategy so another account's products are never
// reused after a key change (goTene catalog.ts accountScope, without hashing the key). Only definite answers are cached: HTTP 401/403 and
// "every strategy failed" throw, and unstable_cache does not store a thrown result.
import { unstable_cache } from "next/cache";
import { ProviderError, RESPONSE_TOO_LARGE, providerFetch } from "../booking/common";
import { mockOrigin } from "../booking/test-origin";
import {
  DiscoveryAuthError,
  DiscoveryHttpError,
  discoverBudapest,
  discoveryLogLine,
  discoveryModeFromEnv,
  type DiscoveryMode,
  type DiscoveryResult,
  type SearchFn,
  type TourSearchPage,
} from "./discovery";

export const CATALOGUE_REVALIDATE_SECONDS = 1800;
export const CATALOGUE_TAG = "tourdesk-catalog";
// Geo and scan pages are large and run server-side at TourDesk: allow longer than a detail read.
const SEARCH_TIMEOUT_MS = 20_000;
// A page of 500 full product records can be several MB once decoded, well above the 2 MB default that
// suits one product. Still bounded. (Whether the live failure was this cap is UNPROVEN: see
// docs/RELEASE_STATUS.md; the refusal is now logged with the size, so it can be told apart.)
export const SEARCH_MAX_BYTES = 24_000_000;

export function tourdeskSearchFn(key: string): SearchFn {
  return async (body): Promise<TourSearchPage> => {
    try {
      return (await providerFetch(
        "tourdesk",
        "/TourSearch",
        key,
        {
          method: "POST",
          headers: { ApiKey: key, Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        0,
        false,
        SEARCH_TIMEOUT_MS,
        SEARCH_MAX_BYTES,
      )) as TourSearchPage;
    } catch (e) {
      throw new DiscoveryHttpError(
        e instanceof ProviderError ? e.upstreamStatus : undefined,
        e instanceof ProviderError && e.message === RESPONSE_TOO_LARGE ? RESPONSE_TOO_LARGE : undefined,
      );
    }
  };
}

let runs = 0; // number of discovery runs started; tells "discovery threw" from "no cache store"
async function run(key: string, mode: DiscoveryMode): Promise<DiscoveryResult> {
  runs++;
  const r = await discoverBudapest(tourdeskSearchFn(key), mode);
  // One non-secret line per (re)discovery, never per request.
  console.info(discoveryLogLine(r));
  return r;
}

const cached = new Map<string, () => Promise<DiscoveryResult>>();
const inFlight = new Map<string, Promise<DiscoveryResult>>();

export function getBudapestCatalogue(): Promise<DiscoveryResult> {
  const key = process.env.TOURDESK_API_KEY?.trim();
  if (!key) return Promise.reject(new DiscoveryAuthError(0));
  const mode = discoveryModeFromEnv();
  // No key material in the cache key. Another TourDesk account needs a new key, which needs a
  // redeploy and so a new deployment id: a cached catalogue never outlives its account.
  const scope = `${process.env.VERCEL_DEPLOYMENT_ID ?? "local"}:${mode}`;
  const existing = inFlight.get(scope);
  if (existing) return existing;

  const runsBefore = runs;
  let load = cached.get(scope);
  if (!load) {
    load = unstable_cache(() => run(key, mode), ["tourdesk", "budapest-catalogue", "v1", scope], {
      revalidate: CATALOGUE_REVALIDATE_SECONDS,
      tags: [CATALOGUE_TAG],
    });
    cached.set(scope, load);
  }
  // Against the loopback mock (browser/API tests only) nothing is cached, so scenarios take effect.
  // Outside a Next request (plain Node tests, scripts) unstable_cache has no cache store and throws
  // before running anything: discover uncached then. Errors from discovery itself are rethrown.
  const uncachedFallback = (e: unknown) => {
    if (runs !== runsBefore) throw e;
    return run(key, mode);
  };
  const p = (mockOrigin() ? run(key, mode) : load().catch(uncachedFallback)).finally(() => inFlight.delete(scope));
  inFlight.set(scope, p);
  return p;
}
