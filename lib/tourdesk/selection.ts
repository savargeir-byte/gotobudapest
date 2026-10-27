import type {
  GoIceTravelExtraSelection,
  Tour,
  TourAvailabilityPriceCategory,
  TourAvailabilitySlot,
  TourAvailabilityVariant,
} from "./types";
import {
  extrasTotal,
  validateExtraSelections,
  variantExtras,
} from "./extras";
import {
  computeBookingTotal,
  computeEffectiveParticipantRange,
} from "./bookingPricing";
import { isSupportedTourDeskSlotId } from "./compatibility";
// Reuses GoIceTravel pricing/capacity rules (verbatim lib/tourdesk/bookingPricing.ts)
// and goTene's server-side selection rules. Configurations that neither reference
// supports natively remain on the provider's complete booking flow instead of being
// silently approximated: tier pricing, exclusive category groups, multi-occupancy
// categories, per-person charge-per-booking categories, hidden prices, combo
// activities, questions-based pickup and unsupported slot-id formats.
// Native here (as in GoIceTravel): variants, extras, pickup (incl. pickup price),
// fixed group prices, dependant categories (goTene: need at least one adult).

// goTene bookingValidation.slotPriceCategories: TourDesk may send an EMPTY
// pricePerCategories next to a populated priceCategories, so take the first
// NON-EMPTY list (a plain || would stop at the empty array and hide every category).
const nonEmpty = <T>(l: T[] | null | undefined): l is T[] =>
  Array.isArray(l) && l.length > 0;
export function selectionPriceCategories(
  slot: TourAvailabilitySlot,
  variant?: TourAvailabilityVariant,
): TourAvailabilityPriceCategory[] {
  if (variant && nonEmpty(variant.pricePerCategories)) return variant.pricePerCategories;
  if (nonEmpty(slot.pricePerCategories)) return slot.pricePerCategories;
  if (nonEmpty(slot.priceCategories)) return slot.priceCategories;
  return [];
}

export function selection(
  tour: Tour,
  slot: TourAvailabilitySlot,
  variant?: TourAvailabilityVariant,
) {
  const categories = selectionPriceCategories(slot, variant);
  const fixed = variant?.pricedPerPerson === false;
  const unsupported =
    !slot.activityAvailabilityId ||
    !isSupportedTourDeskSlotId(slot.activityAvailabilityId) ||
    slot.comboActivity ||
    variant?.exclusiveCategories ||
    !categories.length ||
    categories.some(
      (c) =>
        !c.priceCategoryId ||
        c.hidePrice ||
        c.exclusiveGroupId ||
        (c.tiers?.length || 0) > 0 ||
        c.occupancy > 1 ||
        (!fixed && c.chargePerBooking) ||
        !Number.isFinite(c.price) ||
        c.price < 0 ||
        (c.pickupPrice != null &&
          (!Number.isFinite(c.pickupPrice) || c.pickupPrice < 0)),
    ) ||
    (fixed &&
      (!Number.isFinite(variant?.bookingPrice) ||
        (variant?.bookingPrice ?? -1) < 0)) ||
    tour.questionsBasedPickup;
  const range = computeEffectiveParticipantRange({
    tourMinimumPassengers: Math.max(
      tour.minimumPassengers || 1,
      slot.minParticipants || 1,
    ),
    tourMaximumPassengers: tour.maximumPassengers,
    variantMinPerBooking: variant?.minPerBooking,
    variantMaxPerBooking: variant?.maxPerBooking,
    slotUnlimitedAvailability: slot.unlimitedAvailability,
    slotAvailabilityCount: slot.availabilityCount,
    hasSelectedSlot: true,
  });
  if (slot.maxParticipants && slot.maxParticipants > 0)
    range.max = Math.min(range.max, slot.maxParticipants);
  return {
    categories,
    unsupported: !!unsupported,
    range,
    pickup: variant?.pickupService ?? tour.pickupService,
    mandatoryPickup: variant?.mandatoryPickup ?? tour.mandatoryPickup,
    extras: variantExtras(variant),
  };
}
export function selectionError(
  tour: Tour,
  slot: TourAvailabilitySlot,
  variant: TourAvailabilityVariant | undefined,
  quantities: Record<string, number>,
  pickup: boolean,
  extras?: GoIceTravelExtraSelection[],
): string | undefined {
  const s = selection(tour, slot, variant);
  if (s.unsupported) return "Please complete this configuration on TourDesk.";
  if (
    !slot.bookable ||
    slot.soldOut ||
    slot.unavailable ||
    variant?.deleted ||
    variant?.available === false
  )
    return "This departure is no longer available.";
  if ((slot.variants?.length || 0) > 0 && !variant) return "Choose an option.";
  const total = Object.values(quantities).reduce((a, b) => a + b, 0);
  if (total < s.range.min || total > Math.min(50, s.range.max))
    return `Choose between ${s.range.min} and ${Math.min(50, s.range.max)} participants.`;
  const ids = new Set(s.categories.map((c) => c.priceCategoryId));
  if (Object.keys(quantities).some((id) => !ids.has(id)))
    return "Unknown participant category.";
  for (const c of s.categories) {
    const n = quantities[c.priceCategoryId || ""] || 0;
    if (!Number.isInteger(n) || n < 0 || n > 50)
      return "Invalid participant quantity.";
    if (n > 0 && n < (c.minimumParticipants || 0))
      return "Check the category minimum.";
    const max = Math.min(
      c.maximumParticipants ?? 50,
      c.availabilityCount ?? 50,
    );
    if (n > max) return "Participant availability has changed.";
  }
  if (s.mandatoryPickup && !pickup)
    return "Pickup is required for this option.";
  if (pickup && !s.pickup && !s.mandatoryPickup)
    return "Pickup is not available for this option.";
  if (
    pickup &&
    slot.pickupAvailabilityCount != null &&
    slot.pickupAvailabilityCount < total
  )
    return "Not enough pickup spaces remain.";
  // goTene DEPENDANT_WITHOUT_ADULT: children/infants need at least one adult ticket.
  const byId = new Map(s.categories.map((c) => [c.priceCategoryId || "", c]));
  let dependants = 0;
  let independents = 0;
  for (const [id, n] of Object.entries(quantities)) {
    if (!n) continue;
    if (byId.get(id)?.isDependant) dependants += n;
    else independents += n;
  }
  if (dependants > 0 && independents === 0)
    return "Children and infants must be accompanied by at least one adult ticket.";
  const bad = validateExtraSelections(variant, extras, quantities);
  if (bad) return bad.message;
}
export function selectionTotal(
  slot: TourAvailabilitySlot,
  variant: TourAvailabilityVariant | undefined,
  quantities: Record<string, number>,
  pickup: boolean,
  extras?: GoIceTravelExtraSelection[],
) {
  const base = computeBookingTotal({
    variantPricedPerPerson: variant?.pricedPerPerson ?? null,
    variantBookingPrice: variant?.bookingPrice ?? null,
    categories: selectionPriceCategories(slot, variant),
    quantities,
    pickup,
  }).totalPrice;
  // Extras use GoIceTravel's widget formula (price x quantity, per category when
  // the extra is priced per category) against the live variant data.
  return base + extrasTotal(variantExtras(variant), extras);
}
