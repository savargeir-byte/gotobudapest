import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
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
import {
  CheckoutError,
  TOURDESK_BOOKING_TIMEOUT_MS,
  classifyCheckoutFailure,
  isValidCheckoutUrl,
  parseOrderId,
} from "../../../../../lib/booking/checkout";
import { isTourdeskBookingEnabledFor } from "../../../../../lib/booking/gate";
import {
  extrasToPayload,
  parseExtrasRequest,
} from "../../../../../lib/tourdesk/extras";
import type { TourAvailabilitySlot } from "../../../../../lib/tourdesk/types";
export const dynamic = "force-dynamic";
// Room for the 12 s availability reads plus the 20 s TourBooking POST, so a slow provider
// yields our own ORDER_STATUS_UNKNOWN JSON instead of a platform timeout page.
export const maxDuration = 40;
export async function POST(req: Request) {
  const rejected = gate(req);
  if (rejected) return rejected;
  try {
    const b = record(await readBody(req));
    const id = text(b.id),
      date = b.date;
    // Independent server-side gate (default OFF): never trust the page to have gated.
    if (!isTourdeskBookingEnabledFor(id))
      throw new ProviderError(503, "Please continue directly on TourDesk.");
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
    // Extras (add-ons): strict shape here, live rules in selectionError below.
    const extras = parseExtrasRequest(b.extras);
    if (extras === "invalid") throw new ProviderError(400, "Invalid add-ons");
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
    const error = selectionError(
      tour,
      slot,
      variant,
      quantities,
      b.pickup,
      extras,
    );
    if (error) throw new ProviderError(409, error);
    const total = selectionTotal(slot, variant, quantities, b.pickup, extras);
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
    // TourBooking payload: the real availabilityId, variant and categories (GoIceTravel
    // buildTourDeskPayload shape). The return origin is server-owned, never browser input.
    const base =
      process.env.NEXT_PUBLIC_SITE_URL || "https://gotobudapest.vercel.app";
    const diagnosticId = randomUUID();
    try {
      // TRANSACTIONAL: a single POST per user action, never retried automatically.
      const result = record(
        await tdRequest(
          `/TourBooking/${id}`,
          {
            method: "POST",
            body: JSON.stringify({
              isWidget: true,
              availabilityId: b.slotId,
              pickup: b.pickup,
              pickupPlace: 0,
              returnUrl: new URL("/booking/return", base).href,
              priceCategories: Object.entries(quantities).map(
                ([priceCategoryId, quantity]) => ({
                  priceCategoryId,
                  quantity,
                }),
              ),
              // Flat rows per TourDesk's OpenAPI TourBookingBookableExtra (goTene
              // buildPayload); null when no add-on was selected.
              bookableExtras: extrasToPayload(extras),
              events: null,
              variantId: variant?.activityVariantId || null,
            }),
          },
          0,
          TOURDESK_BOOKING_TIMEOUT_MS,
        ),
      );
      if (result.success !== true)
        throw new CheckoutError(
          text(result.reason) || "Booking creation failed",
          "TOURDESK_REJECTED",
        );
      const raw = text(result.checkoutUrl);
      if (!isValidCheckoutUrl(raw))
        throw new CheckoutError(
          "Invalid checkout URL returned by TourDesk",
          "INVALID_CHECKOUT_URL",
        );
      console.info(
        "[tourdesk/book] checkout_created uniqueKey=%s orderId=%s",
        id,
        parseOrderId(raw) ?? "unknown",
      );
      return NextResponse.json(
        { checkoutUrl: raw },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err) {
      // Safe, correlatable diagnostics only: no key, payload, personal data or URL.
      console.error(
        "[tourdesk/book] failed stage=checkout diagnosticId=%s uniqueKey=%s errorType=%s providerStatus=%s code=%s",
        diagnosticId,
        id,
        err instanceof Error ? err.name : typeof err,
        err instanceof ProviderError ? (err.upstreamStatus ?? "n/a") : "n/a",
        err instanceof CheckoutError ? err.code : "n/a",
      );
      const failed = classifyCheckoutFailure(err);
      const headers = { "Cache-Control": "no-store" };
      if (!failed.orderMayExist)
        return NextResponse.json(
          {
            error: failed.message,
            code: failed.code,
            orderCreated: false,
            diagnosticId,
          },
          { status: failed.status, headers },
        );
      // TourDesk may have created an unpaid order: no invitation to retry.
      return NextResponse.json(
        {
          error: failed.message,
          code: failed.code,
          diagnosticId,
          reconciliationRequired: true,
        },
        { status: failed.status, headers },
      );
    }
  } catch (e) {
    return failure(e);
  }
}
