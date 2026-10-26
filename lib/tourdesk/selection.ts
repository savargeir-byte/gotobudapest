import type {
  Tour,
  TourAvailabilitySlot,
  TourAvailabilityVariant,
} from "./types";
import {
  computeBookingTotal,
  computeEffectiveParticipantRange,
} from "./bookingPricing";
import { isSupportedTourDeskSlotId } from "./compatibility";
// Reuses GoIceTravel pricing/capacity rules. Complex configurations remain on
// the provider's complete booking flow instead of being silently approximated.
export function selection(
  tour: Tour,
  slot: TourAvailabilitySlot,
  variant?: TourAvailabilityVariant,
) {
  const categories =
    variant?.pricePerCategories ||
    slot.pricePerCategories ||
    slot.priceCategories ||
    [];
  const fixed = variant?.pricedPerPerson === false;
  const unsupported =
    !slot.activityAvailabilityId ||
    !isSupportedTourDeskSlotId(slot.activityAvailabilityId) ||
    slot.comboActivity ||
    variant?.exclusiveCategories ||
    (variant?.bookableExtraPrices?.length || 0) > 0 ||
    !categories.length ||
    categories.some(
      (c) =>
        !c.priceCategoryId ||
        c.hidePrice ||
        c.isDependant ||
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
    (fixed && (variant?.pickupService ?? tour.pickupService)) ||
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
  };
}
export function selectionError(
  tour: Tour,
  slot: TourAvailabilitySlot,
  variant: TourAvailabilityVariant | undefined,
  quantities: Record<string, number>,
  pickup: boolean,
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
}
export function selectionTotal(
  slot: TourAvailabilitySlot,
  variant: TourAvailabilityVariant | undefined,
  quantities: Record<string, number>,
  pickup: boolean,
) {
  return computeBookingTotal({
    variantPricedPerPerson: variant?.pricedPerPerson ?? null,
    variantBookingPrice: variant?.bookingPrice ?? null,
    categories:
      variant?.pricePerCategories ||
      slot.pricePerCategories ||
      slot.priceCategories ||
      [],
    quantities,
    pickup,
  }).totalPrice;
}
