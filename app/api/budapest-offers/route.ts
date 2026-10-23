import { NextRequest, NextResponse } from "next/server";
import { getBudapestOffers, resolveOfferContext } from "../../../lib/budapest-offers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") || "";
  const slug = request.nextUrl.searchParams.get("slug") || "";
  if (!resolveOfferContext(kind, slug)) {
    return NextResponse.json({ error: "Unknown Budapest content context" }, {
      status: 400, headers: { "Cache-Control": "no-store" },
    });
  }
  const offers = await getBudapestOffers(kind, slug);
  return NextResponse.json({ offers: offers ?? [] }, {
    headers: {
      // Read-only public catalogue, no API keys, no customer identity or PII.
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
