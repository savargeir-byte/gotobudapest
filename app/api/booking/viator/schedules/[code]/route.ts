import { NextResponse } from "next/server";
import { gate, failure } from "../../../../../../lib/booking/http";
import { ProviderError, viatorId } from "../../../../../../lib/booking/common";
import { getBookingProduct } from "../../../../../../lib/booking/products";
import { getViatorSchedules, scheduleView } from "../../../../../../lib/booking/viator-schedules";
export const dynamic = "force-dynamic";

// Read-only schedules for the product page's "try again" button. Schedules are product-level
// (not traveller-specific) so a successful answer may be shared for 15 minutes (IcelandTripGuide
// schedules route: s-maxage 900); errors are never cached.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    const { code } = await params;
    if (!viatorId(code)) throw new ProviderError(400, "Invalid product");
    await getBookingProduct("viator", code); // Budapest-only guard, same as the page
    const result = scheduleView(await getViatorSchedules(code));
    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          result.status === "ok"
            ? "public, s-maxage=900, stale-while-revalidate=300"
            : "no-store",
      },
    });
  } catch (e) {
    return failure(e);
  }
}
