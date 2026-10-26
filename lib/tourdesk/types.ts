// ── Search ────────────────────────────────────────────────────────────────────

export interface TourSearchRequest {
  searchParameter?: string;
  regions?: number[];
  tags?: string[];
  attractions?: string[];
  vendors?: number[];
  travelMethods?: string[];
  activityIds?: string[];
  privateFilter?: boolean;
  isBestseller?: boolean;
  minprice?: number;
  maxprice?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  geolocation?: { lat: number; lon: number; radius: number };
}

export interface TourDiscount {
  title: string | null;
  value: number;
  discountValueTypeId: number;
}

export interface TourSearchItem {
  uniqueKey: string;
  activityId: number;
  providerId: number;
  title: string;
  photoUrl: string | null;
  description: string | null;
  price: number;
  formattedPrice: string | null;
  currency: string | null;
  isRecommended: boolean;
  isBestSeller: boolean;
  isCertified: boolean;
  duration: number;
  durationFormatted: string | null;
  vendor: string | null;
  tourUrl: string | null;
  discount: TourDiscount | null;
  availableDates: string[] | null;
}

export interface TourSearchResponse {
  page: number;
  totalCount: number;
  activities: TourSearchItem[] | null;
  regionIds: number[] | null;
  tagIds: number[] | null;
  vendorIds: number[] | null;
  travelMethodIds: number[] | null;
  attractionIds: number[] | null;
}

// ── Tour detail ───────────────────────────────────────────────────────────────

export interface TourImageVersion {
  size: string | null;
  url: string | null;
}

export interface TourImage {
  versions: TourImageVersion[] | null;
  isKeyPhoto: boolean;
  alternateText: string | null;
}

export interface TourVendorDetail {
  vendorId: number;
  vendorName: string | null;
  vendorUniqueueId: number;
}

export interface TourLocation {
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string | null;
}

export interface TourMeetingPoint {
  title: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string | null;
}

export interface TourCancellationPolicy {
  cutoffHours: number;
  charge: number;
  chargeType: number;
}

export interface TourPriceCategory {
  priceCategoryId: string | null;
  title: string | null;
  description: string | null;
  isDefault: boolean;
  isDependant: boolean;
  priceCategoryTypeId: number;
  ageLimitFormatted: string | null;
  occupancy: number;
  minPax: number | null;
  maxPax: number | null;
}

export interface TourCurrency {
  name: string | null;
  currencyCode: string | null;
  currencySign: string | null;
  decimalPlaces: number;
  locale: string | null;
  prefix: boolean;
}

export interface TourRoute {
  routeId: number;
  providerId: number;
  centerLatitude: number | null;
  centerLongitude: number | null;
  mapZoomLevel: number;
  startLatitude: number | null;
  startLongitude: number | null;
  endLatitude: number | null;
  endLongitude: number | null;
  startIsSameAsEnd: boolean;
}

export interface TourWaypoint {
  routeWaypointId: number;
  routeId: number;
  providerId: number;
  latitude: number;
  longitude: number;
  orderIndex: number;
}

export interface TourTagDetail {
  activityTagId: number;
  name: string | null;
  description: string | null;
  activities: number;
  activityTagTypeId: number;
}

export interface TourAttractionDetail {
  activityAttractionId: number;
  name: string | null;
  description: string | null;
  activities: number;
}

export interface TourTravelMethodDetail {
  travelMethodId: number;
  name: string | null;
}

export interface Tour {
  activityId: number;
  providerId: number;
  activityCategoryId: number;
  title: string | null;
  subTitle: string | null;
  summary: string | null;
  description: string | null;
  included: string | null;
  requirements: string | null;
  attention: string | null;
  slug: string | null;
  price: number;
  priceFormatted: string | null;
  durationTypeId: number;
  durationType: string | null;
  durationFormatted: string | null;
  duration: number;
  minimumAge: number;
  pickupService: boolean;
  mandatoryPickup: boolean;
  questionsBasedPickup: boolean;
  pickupPrice: number | null;
  pickupMinutesBefore: number;
  noPickupMessage: string | null;
  pickupAllotment: boolean;
  isEntryTicket: boolean;
  seasonAllYear: boolean;
  seasonStartDate: string | null;
  seasonEndDate: string | null;
  difficultyLevel: string | null;
  regionId: number | null;
  isRecommended: boolean;
  isBestSeller: boolean;
  bookingCutoffHours: number;
  bookingCutoffMinutes: number;
  bookingCutoffDays: number;
  bookingCutoffWeeks: number;
  voucherText: string | null;
  uniqueId: number;
  tourUrl: string | null;
  currencyCode: string | null;
  availabilityBookingFlow: 1 | 2;
  maximumPassengers: number | null;
  minimumPassengers: number | null;
  images: TourImage[] | null;
  vendor: TourVendorDetail | null;
  route: TourRoute | null;
  travelMethod: TourTravelMethodDetail | null;
  waypoints: TourWaypoint[] | null;
  activityTags: TourTagDetail[] | null;
  activityAttraction: TourAttractionDetail[] | null;
  activityCancellationPolicies: TourCancellationPolicy[] | null;
  activityCancellationPolicyText: string | null;
  currency: TourCurrency | null;
  location: TourLocation | null;
  discount: TourDiscount | null;
  meetingPoints: TourMeetingPoint[] | null;
  priceCategories: TourPriceCategory[] | null;
}

// ── Availability ──────────────────────────────────────────────────────────────

export interface TourPriceTier {
  min: number;
  max: number;
  price: number;
  priceFormatted: string | null;
}

export interface TourAvailabilityPriceCategory {
  priceCategoryId: string | null;
  priceCategoryTypeId: number;
  title: string | null;
  description: string | null;
  formattedPrice: string | null;
  price: number;
  occupancy: number;
  ageLimitFormatted: string | null;
  isDefault: boolean;
  isDependant: boolean;
  minAge: number;
  maxAge: number;
  availabilityCount: number | null;
  tiers: TourPriceTier[] | null;
  pickupPrice: number;
  formattedPickupPrice: string | null;
  // Extended fields present in variant.pricePerCategories
  chargePerBooking?: boolean;
  initCount?: number;
  hidePrice?: boolean;
  minimumParticipants?: number | null;
  maximumParticipants?: number | null;
  exclusiveGroupId?: string | null;
}

export interface BookableExtraPriceCategory {
  title: string | null;
  formattedPrice: string | null;
  priceCategoryId: string;
  priceCategoryTypeId: number | null;
  price: number;
  availabilityCount: number | null;
}

/**
 * An optional add-on available for a variant (e.g. boot rental, museum admission).
 * Returned as bookableExtraPrices on TourAvailabilityVariant.
 *
 * pricedPerCategory=true  → each priceCategory has its own price; map by priceCategoryId
 * pricedPerCategory=false → single flat extra.price; qty controlled by maxPerBooking
 * limitByPax=true         → max qty per category = participant qty for that same priceCategoryId
 * maxPerBooking=0         → unlimited
 */
export interface BookableExtraPrice {
  bookableExtraId: string;
  title: string | null;
  information: string | null;
  pricingType: number | null;
  price: number; // flat price when pricedPerCategory=false
  pricedPerCategory: boolean;
  limitByPax: boolean;
  maxPerBooking: number; // 0 = unlimited
  unlimitedAvailability: boolean;
  availabilityCount: number;
  priceCategories: BookableExtraPriceCategory[];
}

/** GoIceTravel-owned extra selection sent from widget to POST /api/tourdesk/book */
export interface GoIceTravelExtraSelection {
  extraId: string;
  quantity: number;
  priceCategories: Array<{ priceCategoryId: string; quantity: number }>;
}

/**
 * A single bookable option within a slot.
 *
 * TourDesk returns these under slot.variants (field name confirmed live 2026-08).
 * slot.activityVariants is always null — the real field is slot.variants.
 *
 * For products with a single variant whose isDefault=true: auto-select it.
 * For products with multiple variants: user must choose one before booking.
 *
 * Pricing model:
 *   pricedPerPerson=true  → use pricePerCategories for per-person pricing
 *   pricedPerPerson=false → use bookingPrice as a fixed whole-booking price
 *
 * Pickup overrides:
 *   variant.pickupService and variant.mandatoryPickup take precedence over tour-level values.
 */
export interface TourAvailabilityVariant {
  activityVariantId: string;
  available: boolean;
  title: string | null;
  isDefault: boolean;
  description: string | null;
  minPerBooking: number;
  maxPerBooking: number; // 0 = no upper limit
  pricedPerPerson: boolean;
  bookingPrice: number | null; // fixed price when pricedPerPerson=false
  pickupPrice: number | null;
  pickupPriceVariable: boolean;
  pickupPricedPerPerson: boolean;
  bookingPriceFormatted: string | null;
  pickupPriceFormatted: string | null;
  pickupService: boolean | null; // variant-level override; null = inherit from tour
  mandatoryPickup: boolean | null; // variant-level override; null = inherit from tour
  deleted: boolean;
  exclusiveCategories: boolean;
  pricePerCategories: TourAvailabilityPriceCategory[] | null;
  bookableExtraPrices: BookableExtraPrice[] | null;
}

/**
 * GoIceTravel-owned normalized variant, derived from TourAvailabilityVariant.
 * Used in the booking widget and passed via props — no TourDesk internals leak into UI.
 */
export interface GoIceTravelTourVariant {
  id: string;
  title: string;
  available: boolean;
  isDefault: boolean;
  pricedPerPerson: boolean;
  bookingPrice: number | null;
  pickupService: boolean | null;
  mandatoryPickup: boolean | null;
  minPerBooking: number;
  maxPerBooking: number;
  pricePerCategories: TourAvailabilityPriceCategory[] | null;
  extras: BookableExtraPrice[] | null;
}

export interface TourAvailabilitySlot {
  activityAvailabilityId: string | null;
  availabilityDate: string;
  availabilityDateTimeFormatted: string | null;
  startHour: number;
  startMinute: number;
  hourFormatted: string | null;
  timeless: boolean;
  durationMinutes: number;
  bookable: boolean;
  unavailable: boolean;
  soldOut: boolean;
  availabilityCount: number;
  unlimitedAvailability: boolean;
  bookedParticipants: number;
  minParticipants: number;
  maxParticipants: number | null;
  defaultPrice: number;
  pickupPrice: number;
  dropoffPrice: number;
  /**
   * Always null in live API responses (2026-08 audit).
   * The actual booking identifier is activityAvailabilityId.
   * Kept for schema completeness; never rely on this field.
   */
  hashKey: string | null;
  discount: TourDiscount | null;
  /**
   * Per-category pricing at slot level (legacy / non-variant products).
   * For variant products, pricing lives in slot.variants[n].pricePerCategories.
   */
  priceCategories: TourAvailabilityPriceCategory[] | null;
  pricePerCategories: TourAvailabilityPriceCategory[] | null;
  /**
   * Bookable options for this slot. Confirmed field name: "variants" (not activityVariants).
   * slot.activityVariants is always null — ignore it.
   *
   * 0 items  → book directly, no variant selection
   * 1 item   → auto-select (single default)
   * 2+ items → user must choose before booking
   */
  variants: TourAvailabilityVariant[] | null;
  // Additional live fields observed in API
  pickupAllotment: boolean | null;
  pickupAvailabilityCount: number | null;
  comboActivity: boolean | null;
  flexible: boolean | null;
}

export interface TourNextAvailabilities {
  availabilities: TourAvailabilitySlot[] | null;
  nextKey: string | null;
}

// ── Reference data ────────────────────────────────────────────────────────────

export interface TourDeskRegion {
  id: number;
  name: string | null;
  filterValue: number;
}

export interface TourDeskTag {
  id: number;
  name: string | null;
  filterValue: string | null;
}

export interface TourDeskTravelMethod {
  id: number;
  name: string | null;
  filterValue: string | null;
}

export interface TourDeskAttraction {
  id: number;
  name: string | null;
  filterValue: string | null;
}

export interface TourDeskVendor {
  name: string | null;
  uniqueVendorId: number;
  filterValue: number;
}

// ── Booking ───────────────────────────────────────────────────────────────────

export interface TourBookingParticipant {
  categoryId: string;
  quantity: number;
}

/** GoIceTravel-owned request schema accepted by POST /api/tourdesk/book */
export interface GoIceTravelBookingRequest {
  uniqueKey: string;
  /** slot.activityAvailabilityId — the unique booking identifier for the selected slot */
  slotId: string;
  /** variant.activityVariantId — required when slot has variants, null when slot has none */
  variantId: string | null;
  date: string; // YYYY-MM-DD
  participants: TourBookingParticipant[];
  pickup: boolean;
  locale: string;
  extras?: GoIceTravelExtraSelection[];
}

/** Shape of the TourDesk booking payload sent server-to-server */
export interface TourDeskBookingPayload {
  isWidget: boolean;
  availabilityId: string | null;
  pickup: boolean;
  pickupPlace: number;
  returnUrl: string | null;
  priceCategories:
    { priceCategoryId: string | null; quantity: number }[] | null;
  bookableExtras: Array<{
    bookableExtraId: string;
    quantity: number;
    priceCategories: Array<{ priceCategoryId: string; quantity: number }>;
  }> | null;
  events: null;
  variantId: string | null;
}

/** TourDesk POST /TourBooking response */
export interface TourDeskBookingResponse {
  success: boolean;
  reason: string | null;
  checkoutUrl: string | null;
}
