import { NextResponse } from "next/server";
import { gate, failure, readBody } from "../../../../../lib/booking/http";
import {
  record,
  array,
  text,
  validDate,
  ProviderError,
  tourdeskId,
} from "../../../../../lib/booking/common";
import {
  getBookingProduct,
  tdRequest,
} from "../../../../../lib/booking/products";
import {
  selectionError,
  selectionTotal,
} from "../../../../../lib/tourdesk/selection";
import type { TourAvailabilitySlot } from "../../../../../lib/tourdesk/types";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    if (process.env.TOURDESK_BOOKING_ENABLED === "false")
      throw new ProviderError(503, "Please continue directly on TourDesk.");
    const b = record(await readBody(req));
    const id = text(b.id),
      date = b.date;
    if (
      !tourdeskId(id) ||
      !validDate(date) ||
      typeof b.slotId !== "string" ||
      b.slotId.length > 100 ||
      typeof b.pickup !== "boolean" ||
      !Array.isArray(b.participants) ||
      b.participants.length > 20
    )
      throw new ProviderError(400, "Invalid booking selection");
    const quantities: Record<string, number> = {};
    for (const v of b.participants) {
      const p = record(v);
      if (
        typeof p.categoryId !== "string" ||
        !/^[A-Za-z0-9_-]{1,64}$/.test(p.categoryId) ||
        Object.hasOwn(quantities, p.categoryId) ||
        !Number.isInteger(p.quantity) ||
        Number(p.quantity) < 1 ||
        Number(p.quantity) > 50
      )
        throw new ProviderError(400, "Invalid participants");
      quantities[p.categoryId] = Number(p.quantity);
    }
    if (!Object.keys(quantities).length)
      throw new ProviderError(400, "Select participants");
    const product = await getBookingProduct("tourdesk", id);
    const tour = product.tour!;
    // Fresh availability, independent of browser-supplied prices or capacity.
    const slots = await tdRequest(`/TourAvailability/${id}/${date}/en`);
    const slot = (array(slots) as TourAvailabilitySlot[]).find(
      (s) => s.activityAvailabilityId === b.slotId,
    );
    if (!slot)
      throw new ProviderError(
        409,
        "This departure is no longer available. Choose another time.",
      );
    const variant = slot.variants?.find(
      (v) => v.activityVariantId === b.variantId,
    );
    if (b.variantId && !variant)
      throw new ProviderError(409, "This option is no longer available.");
    const error = selectionError(tour, slot, variant, quantities, b.pickup);
    if (error) throw new ProviderError(409, error);
    const total = selectionTotal(slot, variant, quantities, b.pickup);
    if (
      !Number.isFinite(total) ||
      typeof b.quotedTotal !== "number" ||
      Math.abs(total - b.quotedTotal) > 0.01 ||
      b.currency !== product.currency
    )
      throw new ProviderError(
        409,
        "The price has changed. Check availability again before continuing.",
      );
    // GoIceTravel TourBooking payload: real availabilityId, variant and categories.
    // The return origin is server-owned, never supplied by the browser.
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || "https://gotobudapest.vercel.app";
    const result = record(
      await tdRequest(`/TourBooking/${id}`, {
        method: "POST",
        body: JSON.stringify({
          isWidget: true,
          availabilityId: b.slotId,
          pickup: b.pickup,
          pickupPlace: 0,
          returnUrl: new URL("/booking/return", base).href,
          priceCategories: Object.entries(quantities).map(
            ([priceCategoryId, quantity]) => ({ priceCategoryId, quantity }),
          ),
          bookableExtras: null,
          events: null,
          variantId: variant?.activityVariantId || null,
        }),
      }),
    );
    if (result.success !== true)
      throw new ProviderError(
        409,
        "TourDesk could not create checkout. Please check availability before trying again.",
      );
    const raw = text(result.checkoutUrl);
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      throw new ProviderError(502);
    }
    const hosts = new Set([
      "checkout.tourdesk.is",
      ...(process.env.TOURDESK_ALLOWED_BOOKING_HOSTS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ]);
    if (
      u.protocol !== "https:" ||
      u.username ||
      u.password ||
      u.port ||
      !hosts.has(u.hostname)
    )
      throw new ProviderError(502);
    return NextResponse.json(
      { checkoutUrl: raw },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
