// Bookable extras (add-ons) for the TourDesk journey.
//
// REUSED / PORTED (read-only references):
//  - GoIceTravel src/components/TourDeskBookingWidget.tsx (commit 8d3e5523): the
//    selection model (outer key = bookableExtraId, inner key = priceCategoryId or
//    "__qty__" for flat extras), the price formula and the request shape
//    GoIceTravelExtraSelection (lib/tourdesk/types.ts, verbatim).
//  - goTene src/lib/providers/tourdesk/bookingValidation.ts (commit 5097540):
//    validateExtras (server-side rules against FRESH live data) and the flat
//    TourBooking row shape, which matches TourDesk's public OpenAPI schema
//    TourBookingBookableExtra { bookableExtraId, priceCategoryId, quantity }
//    (GoIceTravel sent a nested shape; the OpenAPI spec and goTene use flat rows).
// ADAPTED: types come from GoIceTravel's lib/tourdesk/types.ts; messages are
// Budapest copy; nothing here touches the network.
import type {
  BookableExtraPrice,
  GoIceTravelExtraSelection,
  TourAvailabilityVariant,
} from "./types";

export const FLAT_EXTRA_KEY = "__qty__";

/** Browser-side shape: bookableExtraId -> (priceCategoryId | "__qty__") -> quantity. */
export type ExtraSelections = Record<string, Record<string, number>>;

const EXTRA_ID_RE = /^\d{1,20}$/;

export function variantExtras(
  variant: Pick<TourAvailabilityVariant, "bookableExtraPrices"> | undefined | null,
): BookableExtraPrice[] {
  const list = variant?.bookableExtraPrices;
  return Array.isArray(list) ? list.filter((e) => e && e.bookableExtraId) : [];
}

/** GoIceTravel widget formula for the cost of the selected extras. */
export function extrasTotal(
  extras: BookableExtraPrice[],
  selections: ExtraSelections | GoIceTravelExtraSelection[] | undefined,
): number {
  if (!selections) return 0;
  const byId = Array.isArray(selections)
    ? toSelectionMap(selections)
    : selections;
  return extras.reduce((sum, extra) => {
    const sel = byId[extra.bookableExtraId] ?? {};
    if (extra.pricedPerCategory) {
      return (
        sum +
        extra.priceCategories.reduce(
          (s, c) => s + c.price * (sel[c.priceCategoryId] ?? 0),
          0,
        )
      );
    }
    return sum + extra.price * (sel[FLAT_EXTRA_KEY] ?? 0);
  }, 0);
}

function toSelectionMap(list: GoIceTravelExtraSelection[]): ExtraSelections {
  const map: ExtraSelections = {};
  for (const e of list) {
    const inner: Record<string, number> = {};
    if (e.priceCategories.length)
      for (const c of e.priceCategories) inner[c.priceCategoryId] = c.quantity;
    else inner[FLAT_EXTRA_KEY] = e.quantity;
    map[e.extraId] = inner;
  }
  return map;
}

/** Browser selections -> the request payload (only non-zero quantities). */
export function selectionsToRequest(
  extras: BookableExtraPrice[],
  selections: ExtraSelections,
): GoIceTravelExtraSelection[] {
  return extras.flatMap((extra) => {
    const sel = selections[extra.bookableExtraId] ?? {};
    if (extra.pricedPerCategory) {
      const cats = extra.priceCategories
        .filter((c) => (sel[c.priceCategoryId] ?? 0) > 0)
        .map((c) => ({
          priceCategoryId: c.priceCategoryId,
          quantity: sel[c.priceCategoryId]!,
        }));
      return cats.length
        ? [
            {
              extraId: extra.bookableExtraId,
              quantity: cats.reduce((s, c) => s + c.quantity, 0),
              priceCategories: cats,
            },
          ]
        : [];
    }
    const qty = sel[FLAT_EXTRA_KEY] ?? 0;
    return qty > 0
      ? [{ extraId: extra.bookableExtraId, quantity: qty, priceCategories: [] }]
      : [];
  });
}

/** Strict parsing of the browser request (GoIceTravel route.ts validation, ported). */
export function parseExtrasRequest(
  raw: unknown,
): GoIceTravelExtraSelection[] | undefined | "invalid" {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw) || raw.length > 20) return "invalid";
  const out: GoIceTravelExtraSelection[] = [];
  const seen = new Set<string>();
  for (const e of raw) {
    if (!e || typeof e !== "object" || Array.isArray(e)) return "invalid";
    const ee = e as Record<string, unknown>;
    if (typeof ee.extraId !== "string" || !EXTRA_ID_RE.test(ee.extraId)) return "invalid";
    if (seen.has(ee.extraId)) return "invalid";
    seen.add(ee.extraId);
    if (
      typeof ee.quantity !== "number" ||
      !Number.isInteger(ee.quantity) ||
      ee.quantity < 1 ||
      ee.quantity > 100
    )
      return "invalid";
    if (!Array.isArray(ee.priceCategories) || ee.priceCategories.length > 20)
      return "invalid";
    const cats: { priceCategoryId: string; quantity: number }[] = [];
    const seenCat = new Set<string>();
    for (const c of ee.priceCategories) {
      if (!c || typeof c !== "object" || Array.isArray(c)) return "invalid";
      const ce = c as Record<string, unknown>;
      if (typeof ce.priceCategoryId !== "string" || !EXTRA_ID_RE.test(ce.priceCategoryId))
        return "invalid";
      if (seenCat.has(ce.priceCategoryId)) return "invalid";
      seenCat.add(ce.priceCategoryId);
      if (
        typeof ce.quantity !== "number" ||
        !Number.isInteger(ce.quantity) ||
        ce.quantity < 1 ||
        ce.quantity > 50
      )
        return "invalid";
      cats.push({ priceCategoryId: ce.priceCategoryId, quantity: ce.quantity });
    }
    out.push({ extraId: ee.extraId, quantity: ee.quantity, priceCategories: cats });
  }
  return out;
}

/**
 * Server rules against the LIVE variant (goTene validateExtras, adapted). Returns a
 * traveller-facing message and an HTTP status, or undefined when the extras are fine.
 */
export function validateExtraSelections(
  variant: Pick<TourAvailabilityVariant, "bookableExtraPrices"> | undefined | null,
  selections: GoIceTravelExtraSelection[] | undefined,
  quantityByCategory: Record<string, number>,
): { status: 400 | 409; message: string } | undefined {
  if (!selections?.length) return undefined;
  const offered = new Map(variantExtras(variant).map((e) => [e.bookableExtraId, e]));
  for (const sel of selections) {
    const extra = offered.get(sel.extraId);
    if (!extra)
      return {
        status: 409,
        message: "An add-on you selected is no longer offered. Please review your add-ons.",
      };
    const max = extra.maxPerBooking > 0 ? extra.maxPerBooking : Infinity;
    if (extra.pricedPerCategory) {
      if (!sel.priceCategories.length)
        return {
          status: 400,
          message: `Please choose who the "${extra.title ?? "add-on"}" is for.`,
        };
      const allowed = new Set(extra.priceCategories.map((c) => String(c.priceCategoryId)));
      let sum = 0;
      for (const c of sel.priceCategories) {
        if (!allowed.has(c.priceCategoryId))
          return {
            status: 409,
            message: "An add-on option you selected is no longer offered. Please review your add-ons.",
          };
        if (extra.limitByPax && c.quantity > (quantityByCategory[c.priceCategoryId] ?? 0))
          return {
            status: 400,
            message: "An add-on cannot exceed the number of matching participants.",
          };
        sum += c.quantity;
      }
      if (sum !== sel.quantity || sum > max)
        return { status: 400, message: "Please review the add-on quantities." };
    } else if (sel.priceCategories.length > 0 || sel.quantity > max) {
      return { status: 400, message: "Please review the add-on quantities." };
    }
    if (!extra.unlimitedAvailability) {
      if (extra.availabilityCount <= 0)
        return {
          status: 409,
          message: "An add-on you selected is sold out. Please review your add-ons.",
        };
      if (sel.quantity > extra.availabilityCount)
        return {
          status: 409,
          message: "An add-on you selected has fewer places left. Please review your add-ons.",
        };
    }
  }
  return undefined;
}

/**
 * TourDesk OpenAPI TourBookingBookableExtra rows are FLAT:
 * { bookableExtraId, priceCategoryId, quantity } (goTene buildPayload). A
 * category-priced extra becomes one row per category; a flat extra one row with
 * priceCategoryId null.
 */
export type FlatExtraRow = {
  bookableExtraId: string;
  priceCategoryId: string | null;
  quantity: number;
};
export function extrasToPayload(
  selections: GoIceTravelExtraSelection[] | undefined,
): FlatExtraRow[] | null {
  if (!selections?.length) return null;
  return selections.flatMap((e): FlatExtraRow[] =>
    e.priceCategories.length
      ? e.priceCategories.map((c) => ({
          bookableExtraId: e.extraId,
          priceCategoryId: c.priceCategoryId,
          quantity: c.quantity,
        }))
      : [{ bookableExtraId: e.extraId, priceCategoryId: null, quantity: e.quantity }],
  );
}
