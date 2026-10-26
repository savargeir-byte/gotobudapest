/**
 * TourDesk native booking compatibility check.
 *
 * Determines whether the GoIceTravel native booking widget can safely handle
 * a given TourDesk product. This is a TECHNICAL check — geography is not a
 * factor. Any product whose data structure is supported by the widget is
 * eligible, regardless of which region it belongs to.
 *
 * ── SLOT-ID FORMAT CLASSES ───────────────────────────────────────────────────
 * TourDesk uses four distinct activityAvailabilityId formats. Each must pass
 * strict validation — there is no "accept any string" fallback.
 *
 * Format A — STANDARD_NUMERIC (all standard products, confirmed 2026-08/09):
 *   "YYYYMMDDHHmmss-{1–12 digits}_{YYYYMMDD}"
 *   Example: "20260819093000-9270_20260819"
 *
 * Format B — ALPHANUMERIC (Blue Lagoon 1-34, confirmed 2026-09):
 *   "YYYYMMDDHHmmss-{1–32 alphanumeric chars}"
 *   Suffix contains only letters and digits — no hyphens (distinguishes from
 *   UUID_SUFFIX) and no underscores (distinguishes from STANDARD_NUMERIC).
 *   Example: "20260903080000-202600DD080000"
 *   Note: prices vary per time slot; no variants on this product.
 *
 * Format C — UUID_SUFFIX (Buggy 95-37, confirmed 2026-09):
 *   "YYYYMMDDHHmmss-{standard UUID}"
 *   Strict RFC 4122 UUID structure in the suffix.
 *   Example: "20260904093000-fb04d6c6-dda5-f011-98e5-f2f90de990bd"
 *   Note: activityVariantId is also a UUID on these products.
 *
 * Format D — DATE_SUFFIX (timeless "open ticket" slots; PORTED from goTene,
 *   src/lib/providers/tourdesk/compatibility.ts — confirmed live there on products
 *   10090-36 and 13713-36, not observed for Budapest):
 *   "YYYYMMDDHHmmss-YYYY-MM-DD"
 *   Example: "20261021000000-2026-10-21"
 *   The suffix is an ISO date: it has hyphens, so it is not ALPHANUMERIC, and no
 *   underscore, so it is not STANDARD_NUMERIC.
 *
 * Any ID that does not match one of these four classes is UNSUPPORTED. The
 * product falls back to the external TourDesk link instead of native booking.
 *
 * ── SHAPES THE WIDGET NATIVELY SUPPORTS (NOT incompatibility reasons) ────────
 * • Variants (activityVariantId / TourAvailabilityVariant[]): TourDeskBookingWidget
 *   renders a variant selector and validates server-side in book/route.ts.
 * • Participant categories (TourAvailabilityPriceCategory[]): getCategories()
 *   resolves from variant or slot; server validates non-zero participant count.
 * • Per-person pricing (pricedPerPerson: true): computeBookingTotal() sums
 *   category.price × qty per category.
 * • Group/fixed pricing (pricedPerPerson: false): computeBookingTotal() uses
 *   variant.bookingPrice directly, confirmed live (2026-08 audit; super jeep
 *   "Group of 1-8" variant).
 * • No variants + slot-level pricePerCategories: widget's getCategories()
 *   falls back to slot.pricePerCategories when variant is null (Blue Lagoon shape).
 * • Pickup (pickupService / mandatoryPickup / questionsBasedPickup): widget has
 *   pickup toggle; book/route.ts re-validates mandatory-pickup server-side.
 * • Dependant categories (isDependant: true): rendered with a visible note;
 *   no parent-category link in the TourDesk API, so enforcement is UI-only.
 * • Multi-day / timeless tours: calendar shows available dates; no time step
 *   rendered for timeless products (slot.timeless).
 * • Multiple currency codes: formatPrice() uses Intl.NumberFormat for non-ISK.
 *
 * Fails CLOSED: if nextSlots has at least one slot and none have a compatible
 * activityAvailabilityId, the product is incompatible — safe fallback to external.
 *
 * Called from:
 *   - TourDeskTourDetail (server component) — decide widget vs external CTA
 *   - POST /api/tourdesk/book             — server-side recheck on live slot
 */

import type { TourAvailabilitySlot } from "./types";

// ── Slot-ID format class regexes ─────────────────────────────────────────────
// Keep all four strictly bounded — no ".*" or ".+" wildcards.

// Format A — STANDARD_NUMERIC
// "YYYYMMDDHHmmss-{activityId 1–12 digits}_{YYYYMMDD}"
// Confirmed live across all standard products (2026-08/09 audits).
const STANDARD_NUMERIC_RE = /^\d{14}-\d{1,12}_\d{8}$/;

// Format B — ALPHANUMERIC (no hyphens, no underscores in suffix)
// "YYYYMMDDHHmmss-{1–32 alphanumeric chars}"
// No hyphens → cannot be confused with UUID_SUFFIX.
// No underscores → cannot be confused with STANDARD_NUMERIC.
// Observed suffix: 14 chars of mixed digits + uppercase letters (Blue Lagoon 1-34).
// Upper bound of 32 allows modest variation without being unbounded.
const ALPHANUMERIC_RE = /^\d{14}-[A-Za-z0-9]{1,32}$/;

// Format C — UUID_SUFFIX
// "YYYYMMDDHHmmss-{RFC 4122 UUID}"
// Strict 8-4-4-4-12 hex structure in the suffix.
// Confirmed live: Buggy 95-37 (activityVariantId is also a UUID on these products).
const UUID_SUFFIX_RE =
  /^\d{14}-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Format D — DATE_SUFFIX (open-ticket slots), disjoint from the three above.
const DATE_SUFFIX_RE = /^\d{14}-\d{4}-\d{2}-\d{2}$/;

export type TourDeskSlotIdFormat =
  | "STANDARD_NUMERIC" // Format A — \d{14}-\d{1,12}_\d{8}
  | "ALPHANUMERIC" // Format B — \d{14}-[A-Za-z0-9]{1,32}  (Blue Lagoon class)
  | "UUID_SUFFIX" // Format C — \d{14}-UUID                (Buggy class)
  | "DATE_SUFFIX" // Format D — \d{14}-YYYY-MM-DD          (open-ticket class)
  | "UNSUPPORTED";

/**
 * Classify a TourDesk activityAvailabilityId into a known format class.
 *
 * Ordering matters: STANDARD_NUMERIC is checked first (most common), then
 * UUID_SUFFIX and DATE_SUFFIX (both strict and mutually exclusive), then
 * ALPHANUMERIC (broadest, no-hyphen/no-underscore fallback). An ID matching none
 * of the four is UNSUPPORTED.
 */
export function classifyTourDeskSlotId(id: string): TourDeskSlotIdFormat {
  if (typeof id !== "string" || id.length === 0) return "UNSUPPORTED";
  if (STANDARD_NUMERIC_RE.test(id)) return "STANDARD_NUMERIC";
  if (UUID_SUFFIX_RE.test(id)) return "UUID_SUFFIX";
  if (DATE_SUFFIX_RE.test(id)) return "DATE_SUFFIX";
  if (ALPHANUMERIC_RE.test(id)) return "ALPHANUMERIC";
  return "UNSUPPORTED";
}

/**
 * Return true if the slot ID belongs to any supported TourDesk format class.
 * Both checkBookingCompatibility and POST /api/tourdesk/book use this function
 * so that UI compatibility and server validation are always in sync.
 */
export function isSupportedTourDeskSlotId(id: string): boolean {
  return classifyTourDeskSlotId(id) !== "UNSUPPORTED";
}

// SLOT_ID_RE — backward-compat alias; matches only Format A (STANDARD_NUMERIC).
// New code must use isSupportedTourDeskSlotId() which handles all supported formats.
export const SLOT_ID_RE = STANDARD_NUMERIC_RE;

export type BookingIncompatibilityReason =
  | "UNSUPPORTED_SLOT_FORMAT" // activityAvailabilityId does not match any supported format class
  | "NO_USABLE_AVAILABILITY"; // product has zero future availability (reserved for future use)

export interface BookingCompatibilityResult {
  compatible: boolean;
  reasons: BookingIncompatibilityReason[];
}

/**
 * Check whether a product is technically compatible with the GoIceTravel
 * native booking widget, based on its next-available slots.
 *
 * @param nextSlots  The first few upcoming slots from TourAvailability/GetNext.
 *                   Pass an empty array when no upcoming slots are available —
 *                   zero availability is not a permanent incompatibility.
 * @returns          { compatible, reasons }
 */
export function checkBookingCompatibility(
  nextSlots: TourAvailabilitySlot[],
): BookingCompatibilityResult {
  const reasons: BookingIncompatibilityReason[] = [];

  if (nextSlots.length > 0) {
    // At least one slot must have a supported activityAvailabilityId.
    // Products where every returned slot has an unsupported ID format cannot
    // be booked natively — the booking API rejects non-matching slot IDs.
    const hasCompatibleSlot = nextSlots.some(
      (s) =>
        s.activityAvailabilityId !== null &&
        s.activityAvailabilityId !== undefined &&
        isSupportedTourDeskSlotId(s.activityAvailabilityId),
    );
    if (!hasCompatibleSlot) {
      reasons.push("UNSUPPORTED_SLOT_FORMAT");
    }
  }
  // Note: nextSlots.length === 0 does NOT add NO_USABLE_AVAILABILITY here.
  // Seasonal products with no current availability should still show the widget
  // (with an empty calendar) rather than permanently falling back to external.

  return { compatible: reasons.length === 0, reasons };
}
