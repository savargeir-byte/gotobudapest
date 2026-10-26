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
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    const b = validateCheckPayload(await readBody(req));
    if (!b || b.currency !== "EUR")
      throw new ProviderError(400, "Invalid availability request");
    const p = await getBookingProduct("viator", b.productCode);
    for (const band of b.paxMix) {
      if (!p.ageBands?.some((a) => a.ageBand === band.ageBand))
        throw new ProviderError(400, "Unknown age category");
    }
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
        const container = record(item.totalPrice);
        const amount =
          record(container.special).recommendedRetailPrice ??
          record(container.original).recommendedRetailPrice ??
          container.recommendedRetailPrice;
        return {
          productOptionCode: text(item.productOptionCode),
          startTime: text(item.startTime),
          available: item.available === true,
          totalPrice:
            typeof amount === "number" && Number.isFinite(amount) && amount >= 0
              ? { recommendedRetailPrice: amount }
              : undefined,
        };
      });
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
