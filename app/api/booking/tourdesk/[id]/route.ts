import { NextResponse } from "next/server";
import { gate, failure } from "../../../../../lib/booking/http";
import {
  getBookingProduct,
  tdRequest,
} from "../../../../../lib/booking/products";
import {
  validDate,
  ProviderError,
  tourdeskId,
  array,
} from "../../../../../lib/booking/common";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    const { id } = await params;
    if (!tourdeskId(id)) throw new ProviderError(400, "Invalid product");
    await getBookingProduct("tourdesk", id);
    const date = new URL(req.url).searchParams.get("date");
    if (date && !validDate(date)) throw new ProviderError(400, "Invalid date");
    const value = await tdRequest(
      date
        ? `/TourAvailability/${id}/${date}/en`
        : `/TourAvailability/GetAllDates/${id}`,
    );
    if (!Array.isArray(value)) throw new ProviderError(502);
    return NextResponse.json(
      date
        ? { slots: array(value).slice(0, 250) }
        : {
            dates: value
              .filter((d) => typeof d === "string" && validDate(d.slice(0, 10)))
              .map((d) => d.slice(0, 10))
              .slice(0, 732),
          },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
