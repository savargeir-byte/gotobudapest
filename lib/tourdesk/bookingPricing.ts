/**
 * Pure participant-capacity and pricing helpers for TourDeskBookingWidget —
 * extracted so the precedence/pricing math can be unit tested with real
 * numbers instead of only via string-matching the component source. No
 * React, no side effects. The server (src/app/api/tourdesk/book/route.ts)
 * independently re-derives and enforces the same constraints at booking
 * time; everything here is a UX guardrail, never the source of truth.
 */

import type { TourAvailabilityPriceCategory } from "./types";

/**
 * Format a price using TourDesk's own currency code when available.
 * Every real product observed live so far (2026-08 audit) returns "ISK",
 * so that case keeps the historical "1,234 ISK" suffix format byte-
 * identical — no visual change for any currently bookable product. A
 * non-ISK (or unrecognized) code falls through to Intl's currency
 * formatting instead of silently mislabeling the amount as ISK.
 */
export function formatPrice(
  price: number,
  currencyCode: string | null | undefined,
): string {
  if (!currencyCode || currencyCode === "ISK") {
    // Whole krona only — an unrounded upstream price (e.g. 218281.667) would
    // otherwise render verbatim as "218,281.667 ISK".
    return price.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " ISK";
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(price);
  } catch {
    return `${price.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currencyCode}`;
  }
}

export interface ParticipantRangeInputs {
  tourMinimumPassengers: number | null;
  /**
   * TourDesk convention (confirmed live, 2026-08 audit against the real
   * "Whale Watching" product 130-1): 0 means "no upper limit", exactly like
   * variant.maxPerBooking below — NOT a literal zero-seat cap. Passing this
   * through a plain `?? Infinity` would silently cap every such product at
   * zero participants; this was a real, confirmed bug caught by live QA.
   */
  tourMaximumPassengers: number | null;
  variantMinPerBooking?: number | null;
  /** Same 0-means-unlimited convention as tourMaximumPassengers above. */
  variantMaxPerBooking?: number | null;
  slotUnlimitedAvailability: boolean;
  slotAvailabilityCount: number;
  /** True when no slot is selected yet — max is then unconstrained by slot capacity. */
  hasSelectedSlot: boolean;
}

export interface ParticipantRange {
  min: number;
  max: number;
}

/** TourDesk's "0 means unlimited" convention, applied uniformly. */
function orUnlimited(value: number | null | undefined): number {
  return value && value > 0 ? value : Infinity;
}

/**
 * Effective min/max participant precedence:
 *   min = max(tour.minimumPassengers, variant.minPerBooking)
 *   max = min(tour.maximumPassengers [0 = unlimited], variant.maxPerBooking [0 = unlimited],
 *             slot.availabilityCount [unless unlimitedAvailability])
 */
export function computeEffectiveParticipantRange(
  inputs: ParticipantRangeInputs,
): ParticipantRange {
  const min = Math.max(
    inputs.tourMinimumPassengers ?? 1,
    inputs.variantMinPerBooking ?? 1,
  );
  const max = Math.min(
    orUnlimited(inputs.tourMaximumPassengers),
    orUnlimited(inputs.variantMaxPerBooking),
    inputs.hasSelectedSlot && !inputs.slotUnlimitedAvailability
      ? inputs.slotAvailabilityCount
      : Infinity,
  );
  return { min, max };
}

/**
 * The highest quantity a single category's + button may reach without
 * pushing the total past the effective overall cap, given what every
 * OTHER category already holds. A per-category cap alone would let, e.g.,
 * Adults=5 and Children=5 both look individually valid on a 5-seat slot;
 * this subtracts the other categories' current total first.
 */
export function computeCategoryMaxQty(opts: {
  categoryMaximumParticipants: number | null | undefined;
  effectiveOverallMax: number;
  otherCategoriesQty: number;
  hardCap?: number;
}): number {
  const hardCap = opts.hardCap ?? 50;
  const categoryCap = opts.categoryMaximumParticipants ?? Infinity;
  return Math.max(
    0,
    Math.min(
      hardCap,
      categoryCap,
      opts.effectiveOverallMax - opts.otherCategoriesQty,
    ),
  );
}

export interface BookingTotalInputs {
  /** null when no variant / a variant with no per-category pricing applies. */
  variantPricedPerPerson: boolean | null;
  variantBookingPrice: number | null;
  categories: TourAvailabilityPriceCategory[];
  quantities: Record<string, number>;
  pickup: boolean;
}

export interface BookingTotal {
  basePrice: number;
  pickupSurcharge: number;
  totalPrice: number;
}

/**
 * Pricing model:
 *  - pricedPerPerson === false (a variant with a flat group/vehicle price):
 *    the total is the variant's own bookingPrice, full stop. Confirmed
 *    live (2026-08 audit, e.g. "Superjeep for up to 6 persons" and
 *    "Group of 1-8"): every category on such a variant has price=0 and
 *    chargePerBooking=true — they exist purely to record who's coming
 *    (for the manifest), not to multiply into the charge. Do NOT multiply
 *    bookingPrice by a category/traveler count.
 *  - otherwise (per-person, including no-variant legacy slots): sum of
 *    category.price × quantity.
 *  - pickup surcharge only applies to per-person pricing (a flat group
 *    price already covers the whole booking).
 */
export function computeBookingTotal(inputs: BookingTotalInputs): BookingTotal {
  const isFixedGroupPrice = inputs.variantPricedPerPerson === false;

  const basePrice = isFixedGroupPrice
    ? (inputs.variantBookingPrice ?? 0)
    : inputs.categories.reduce((sum, cat) => {
        const qty = inputs.quantities[cat.priceCategoryId ?? ""] ?? 0;
        return sum + cat.price * qty;
      }, 0);

  const pickupSurcharge =
    inputs.pickup && !isFixedGroupPrice
      ? inputs.categories.reduce((sum, cat) => {
          const qty = inputs.quantities[cat.priceCategoryId ?? ""] ?? 0;
          return sum + (cat.pickupPrice ?? 0) * qty;
        }, 0)
      : 0;

  return {
    basePrice,
    pickupSurcharge,
    totalPrice: basePrice + pickupSurcharge,
  };
}
