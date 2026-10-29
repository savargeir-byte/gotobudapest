import { type NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseQuery } from "@/lib/marketplace/query";
import { InvalidCursorError, searchMarketplace } from "@/lib/marketplace/registry";
import { withVenuePhotos } from "@/lib/marketplace/venue-photos";
import { activeProviders } from "@/lib/marketplace/enabled";

// Read-only, provider-neutral catalogue search. It only ever reads catalogue data from
// TourDesk, Viator and Tiqets with server-side keys; no booking, hold or payment call
// is made, and no provider body, key or URL parameter is echoed back.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allow = createRateLimiter(30, 60_000);
const MAX_URL = 4000;
const MAX_PARAMS = 20;

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function GET(req: NextRequest) {
  if (req.url.length > MAX_URL) return json({ error: "Request too large" }, 414);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) return json({ error: "Too many requests" }, 429, { "Retry-After": "60" });

  const params = req.nextUrl.searchParams;
  if ([...params.keys()].length > MAX_PARAMS) return json({ error: "Too many parameters" }, 400);
  for (const [key, value] of params) {
    const limit = key === "cursor" ? 1600 : key === "q" ? 200 : 64;
    if (value.length > limit) return json({ error: `Parameter too long: ${key}` }, 400);
  }

  const query = parseQuery(params);
  // Enumerated and numeric values must be valid, not silently dropped.
  const accepted: Record<string, (q: ReturnType<typeof parseQuery>) => boolean> = {
    category: (q) => q.category !== undefined,
    provider: (q) => q.provider !== undefined && activeProviders().includes(q.provider),
    sort: (q) => q.sort !== "relevance",
    duration: (q) => q.duration !== undefined,
    rating: (q) => q.minRating !== undefined,
    priceMin: (q) => q.priceMin !== undefined,
    priceMax: (q) => q.priceMax !== undefined,
  };
  for (const [key, ok] of Object.entries(accepted)) {
    const value = params.get(key) ?? "";
    if (value === "" || (key === "sort" && value === "relevance")) continue;
    if (!ok(parseQuery(new URLSearchParams({ [key]: value }))))
      return json({ error: `Invalid parameter: ${key}` }, 400);
  }
  if ((params.get("cursor") ?? "") !== "" && !query.cursor) return json({ error: "Invalid cursor" }, 400);

  try {
    const result = await withVenuePhotos(await searchMarketplace(query));
    const clean = Object.values(result.providers).every((p) => p.status !== "error");
    return json(result, 200, {
      "Cache-Control": clean
        ? "public, s-maxage=900, stale-while-revalidate=1800"
        : "no-store",
    });
  } catch (e) {
    if (e instanceof InvalidCursorError) return json({ error: "Invalid cursor" }, 400);
    console.error("[marketplace] search failed:", e instanceof Error ? e.name : "unknown");
    return json({ error: "The tours catalogue is temporarily unavailable" }, 503);
  }
}
