import { NextResponse } from "next/server";
import { gate, failure, readBody } from "../../../../../lib/booking/http";
import {
  ProviderError,
  record,
  array,
  text,
} from "../../../../../lib/booking/common";
import {
  getBookingProduct,
  viatorRequest,
} from "../../../../../lib/booking/products";
import { validateCheckPayload } from "../../../../../lib/booking/validate-viator";
import { getViatorSchedules } from "../../../../../lib/booking/viator-schedules";
export const dynamic = "force-dynamic";

// Live availability preview. The ONLY upstream call is POST /availability/check, which
// is a read of availability and prices. This route never books, holds or reserves.
function price(container: Record<string, unknown>): number | undefined {
  const amount =
    record(container.special).recommendedRetailPrice ??
    record(container.original).recommendedRetailPrice ??
    container.recommendedRetailPrice;
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0
    ? amount
    : undefined;
}

export async function POST(req: Request) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    const b = validateCheckPayload(await readBody(req));
    if (!b || b.currency !== "EUR")
      throw new ProviderError(400, "Invalid availability request");
    const p = await getBookingProduct("viator", b.productCode);
    // Age categories come from the product itself; if it lists none, from its schedules.
    let allowed = new Set((p.ageBands ?? []).map((a) => a.ageBand));
    if (!allowed.size) {
      const s = await getViatorSchedules(b.productCode);
      if (s.status === "ok") allowed = new Set(s.info.bands.map((x) => x.ageBand));
    }
    for (const band of b.paxMix) {
      if (!allowed.has(band.ageBand))
        throw new ProviderError(400, "Unknown age category");
    }
    // Booking requirements reported by the product (same rules as the reference validateMix).
    const req_ = p.viator?.requirements;
    const total = b.paxMix.reduce((n, x) => n + x.numberOfTravelers, 0);
    if (req_?.min && total < req_.min)
      throw new ProviderError(400, `This experience needs at least ${req_.min} travellers`);
    if (req_?.max && total > req_.max)
      throw new ProviderError(400, `This experience allows at most ${req_.max} travellers`);
    if (
      req_?.adultRequired &&
      !b.paxMix.some((x) => x.ageBand === "ADULT" && x.numberOfTravelers > 0)
    )
      throw new ProviderError(400, "At least one adult is required");

    const result = await viatorRequest("/availability/check", {
      method: "POST",
      body: JSON.stringify({
        productCode: b.productCode,
        travelDate: b.travelDate,
        currency: "EUR",
        paxMix: b.paxMix,
      }),
    });
    const data = record(result);
    const bookableItems = array(data.bookableItems)
      .map(record)
      .map((item) => {
        const amount = price(record(item.totalPrice));
        const reason = text(item.unavailableReason);
        return {
          productOptionCode: text(item.productOptionCode),
          startTime: text(item.startTime),
          available: item.available === true,
          unavailableReason: /^[A-Z_]{1,40}$/.test(reason) ? reason : undefined,
          totalPrice:
            amount !== undefined ? { recommendedRetailPrice: amount } : undefined,
          lines: array(item.lineItems)
            .map(record)
            .flatMap((li) => {
              const sub = price(record(li.subtotalPrice));
              const count = li.numberOfTravelers;
              const band = text(li.ageBand);
              return sub !== undefined &&
                typeof count === "number" &&
                Number.isInteger(count) &&
                count > 0 &&
                /^[A-Z]{3,12}$/.test(band)
                ? [{ ageBand: band, count, subtotal: sub }]
                : [];
            })
            .slice(0, 8),
        };
      })
      .slice(0, 60);
    return NextResponse.json(
      { currency: text(data.currency), bookableItems },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    return failure(e);
  }
}
