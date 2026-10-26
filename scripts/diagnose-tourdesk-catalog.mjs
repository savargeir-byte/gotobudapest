#!/usr/bin/env node
/**
 * Read-only TourDesk catalogue diagnostics for GoToBudapest. NEVER calls /TourBooking or checkout.
 *
 * ADAPTED from goTene scripts/diagnose-tourdesk-catalog.mjs (commit 5097540, read-only
 * reference): the global scan, geo scan, detail coordinate check, pagination checks and
 * report shape are unchanged. Adapted for Budapest: destination regexes, geolocation /
 * bounding box, no baseline ids (none are known for Budapest), plus two text probes and a
 * VERDICT line. It never prints the API key.
 *
 * Usage (key from the Vercel project; owner runs it, key is never committed):
 *   vercel env pull .env.diagnose --environment=production
 *   node --env-file=.env.diagnose scripts/diagnose-tourdesk-catalog.mjs
 *   DIAG_MAX_PAGES=40 node --env-file=.env.diagnose scripts/diagnose-tourdesk-catalog.mjs
 *   (delete .env.diagnose afterwards)
 *
 * Request volume: up to DIAG_MAX_PAGES global pages of 500, up to 10 geo pages, one
 * /Tour detail request per geo result and 2 text probes. All explicit TourDesk API calls.
 *
 * Verdicts: AUTH_FAILED | NO_BUDAPEST_INVENTORY | BUDAPEST_INVENTORY_FOUND
 */

const BUDAPEST = new RegExp(
  [
    "budapest",
    "hungar",
    "magyar",
    "\bbuda\b",
    "\bpest\b",
    "danube",
    "sz[eé]chenyi",
    "gell[eé]rt",
    "margaret island",
    "fisherman'?s bastion",
    "matthias church",
    "parliament",
  ].join("|"),
  "i",
);

// Other destinations that must never be presented as Budapest.
const OTHER_DESTINATION = new RegExp(
  ["iceland", "reykjav[ií]k", "tenerife", "gullfoss", "geysir", "golden circle", "blue lagoon", "lanzarote", "gran canaria"].join("|"),
  "i",
);

// No Budapest product ids are known; fill in verified ids here after the first successful run.
const BASELINE_IDS = [];

const GEO = { lat: 47.4979, lon: 19.0402, radius: 30000 };
const BBOX = { minLat: 47.35, maxLat: 47.63, minLng: 18.9, maxLng: 19.3 };
const GEO_MAX_PAGES = 10;

function fallbackText(item) {
  return `${item.title ?? ""} ${item.description ?? ""} ${item.vendor ?? ""}`;
}

function matchesProductionFallback(item) {
  const text = fallbackText(item);
  return BUDAPEST.test(text) && !OTHER_DESTINATION.test(text);
}

// Another destination named and no Budapest marker.
function isOffIslandOnly(item) {
  const text = fallbackText(item);
  return OTHER_DESTINATION.test(text) && !BUDAPEST.test(text);
}

function detailCoords(detail) {
  const candidates = [
    [detail?.latitude, detail?.longitude],
    [detail?.location?.latitude, detail?.location?.longitude],
    [detail?.meetingPoint?.latitude, detail?.meetingPoint?.longitude],
  ];
  for (const [lat, lng] of candidates) {
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
}

function inBudapestBox(coords) {
  return Boolean(
    coords &&
      coords.lat >= BBOX.minLat &&
      coords.lat <= BBOX.maxLat &&
      coords.lng >= BBOX.minLng &&
      coords.lng <= BBOX.maxLng,
  );
}

const key = process.env.TOURDESK_API_KEY;
if (!key) {
  console.error("TOURDESK_API_KEY must be set in a trusted local/server environment. VERDICT: AUTH_FAILED (no key)");
  process.exitCode = 1;
} else {
  const base = (process.env.TOURDESK_API_BASE_URL || "https://api.tourdesk.io").replace(/\/+$/, "");
  const root = /\/api\/v\d/i.test(base) ? base : `${base}/api/v1.0`;
  const headers = {
    ApiKey: key,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const MAX_PAGES = Number(process.env.DIAG_MAX_PAGES || 40);

  async function search(payload) {
    const res = await fetch(`${root}/TourSearch`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`TourSearch HTTP ${res.status}`);
    const data = await res.json();
    return {
      page: data?.page,
      totalCount: Number(data?.totalCount ?? 0),
      activities: Array.isArray(data?.activities) ? data.activities : [],
    };
  }

  async function detail(uniqueKey) {
    const res = await fetch(`${root}/Tour/${encodeURIComponent(uniqueKey)}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return { uniqueKey, ok: false, status: res.status, coords: null };
    const data = await res.json();
    const coords = detailCoords(data);
    return { uniqueKey, ok: true, status: res.status, coords, inBox: inBudapestBox(coords) };
  }

  function absorb(map, activities) {
    let added = 0;
    for (const item of activities ?? []) {
      if (!item?.uniqueKey) continue;
      if (!map.has(item.uniqueKey)) added++;
      map.set(item.uniqueKey, item);
    }
    return added;
  }

  async function scanGlobal() {
    const first = await search({ page: 1, pageSize: 500 });
    const effectivePageSize = first.activities.length;
    const requiredPages =
      effectivePageSize > 0 ? Math.ceil(first.totalCount / effectivePageSize) : 1;
    const pagesToFetch = Math.min(requiredPages, MAX_PAGES);

    const byKey = new Map();
    absorb(byKey, first.activities);
    for (let page = 2; page <= pagesToFetch; page++) {
      absorb(byKey, (await search({ page, pageSize: 500 })).activities);
    }

    const matched = [...byKey.values()].filter(matchesProductionFallback);
    return {
      reportedTotalCount: first.totalCount,
      effectivePageSize,
      requiredPages,
      pagesFetched: pagesToFetch,
      uniqueFetched: byKey.size,
      fullByReportedCount: byKey.size >= first.totalCount,
      fallbackMatched: matched.length,
      fallbackMatchedIds: matched.map((x) => x.uniqueKey).sort(),
    };
  }

  async function scanGeo() {
    const first = await search({ page: 0, pageSize: 500, geolocation: GEO });
    const reportedTotal = first.totalCount || first.activities.length;
    const byKey = new Map();
    absorb(byKey, first.activities);

    let pagesFetched = 1;
    let noProgress = false;
    let totalChanged = false;

    for (
      let page = 1;
      byKey.size < reportedTotal && page <= GEO_MAX_PAGES;
      page++
    ) {
      const next = await search({ page, pageSize: 500, geolocation: GEO });
      pagesFetched++;
      if (next.totalCount && next.totalCount !== reportedTotal) {
        totalChanged = true;
        break;
      }
      const added = absorb(byKey, next.activities);
      if (added === 0) {
        noProgress = true;
        break;
      }
    }

    const items = [...byKey.values()];
    const ids = new Set(items.map((x) => x.uniqueKey));
    const missingBaseline = BASELINE_IDS.filter((id) => !ids.has(id));
    const otherIslandSearchItems = items
      .filter(isOffIslandOnly)
      .map((x) => ({ uniqueKey: x.uniqueKey, title: x.title }));

    const detailChecks = [];
    for (const item of items) {
      detailChecks.push(await detail(item.uniqueKey));
    }

    return {
      reportedTotalCount: reportedTotal,
      uniqueFetched: byKey.size,
      pagesFetched,
      complete: byKey.size === reportedTotal && !noProgress && !totalChanged,
      noProgress,
      totalChanged,
      baselinePresent: BASELINE_IDS.length - missingBaseline.length,
      baselineExpected: BASELINE_IDS.length,
      missingBaseline,
      otherIslandSearchItems,
      detailCoordinates: {
        checked: detailChecks.length,
        inBudapestBox: detailChecks.filter((x) => x.inBox).length,
        outsideBudapestBox: detailChecks.filter((x) => x.coords && !x.inBox).map((x) => x.uniqueKey),
        missingCoordinates: detailChecks.filter((x) => x.ok && !x.coords).map((x) => x.uniqueKey),
        failedDetailRequests: detailChecks.filter((x) => !x.ok).map((x) => ({
          uniqueKey: x.uniqueKey,
          status: x.status,
        })),
      },
    };
  }

  async function textProbe(term) {
    const r = await search({ searchParameter: term, page: 1, pageSize: 50 });
    return {
      term,
      reportedTotalCount: r.totalCount,
      returned: r.activities.length,
      budapestLike: r.activities.filter(matchesProductionFallback).length,
      sampleTitles: r.activities.slice(0, 3).map((x) => String(x.title).slice(0, 70)),
    };
  }

  try {
    const [global, geo] = await Promise.all([scanGlobal(), scanGeo()]);
    const probes = [await textProbe("Budapest"), await textProbe("Hungary")];
    const found =
      global.fallbackMatched > 0 ||
      geo.uniqueFetched > 0 ||
      probes.some((p) => p.budapestLike > 0);
    console.log(
      JSON.stringify(
        {
          mode: "READ_ONLY — no booking/checkout calls",
          productionFallbackMatcher: {
            fields: ["title", "description", "vendor"],
            global,
          },
          geo,
          textProbes: probes,
          verdict: found ? "BUDAPEST_INVENTORY_FOUND" : "NO_BUDAPEST_INVENTORY",
          acceptance: {
            geoComplete: geo.complete,
            allBaselinePresent: BASELINE_IDS.length === 0 ? null : geo.missingBaseline.length === 0,
            zeroOtherDestinationMarkers: geo.otherIslandSearchItems.length === 0,
            allDetailCoordsInBudapest:
              geo.detailCoordinates.outsideBudapestBox.length === 0 &&
              geo.detailCoordinates.missingCoordinates.length === 0 &&
              geo.detailCoordinates.failedDetailRequests.length === 0,
          },
          notes: [
            "A geo response is only trustworthy when unique returned products equal totalCount.",
            "If geo pagination changes, pages are followed until uniqueFetched equals totalCount or the result is rejected.",
            "The text matcher here uses title, description and vendor only; coordinates are diagnostic evidence.",
            "No TourBooking endpoint is called by this script.",
          ],
        },
        null,
        2,
      ),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Read-only TourDesk catalog diagnostic failed:", message);
    if (/HTTP (401|403)/.test(message))
      console.error("VERDICT: AUTH_FAILED (the key is missing, invalid or belongs to another account)");
    process.exitCode = 1;
  }
}
