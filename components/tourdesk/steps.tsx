"use client";
// Step components of the TourDesk journey: departure, option, participants,
// add-ons and pickup.
//
// PORTED from GoIceTravel src/components/TourDeskBookingWidget.tsx (commit 8d3e5523,
// read-only reference): time-slot picker with "N left" hints, variant (option)
// selector, participant rows with default-category initial counts (isDefault /
// initCount), per-category caps via computeCategoryMaxQty, dependant-category note,
// bookable extras (flat quantity or per price category, limitByPax, maxPerBooking)
// and the pickup choice incl. pickup surcharge. ADAPTED: GoToBudapest classes
// (booking-panel.css), no Tailwind/next-intl/cart/GA4, English copy, native number
// inputs with +/- buttons so each control has an accessible name.
import type {
  BookableExtraPrice,
  TourAvailabilityPriceCategory,
  TourAvailabilitySlot,
  TourAvailabilityVariant,
} from "../../lib/tourdesk/types";
import { computeCategoryMaxQty } from "../../lib/tourdesk/bookingPricing";
import { FLAT_EXTRA_KEY, type ExtraSelections } from "../../lib/tourdesk/extras";

export function Stepper({
  label,
  value,
  max,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  min?: number;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(Number.isFinite(n) ? n : 0)));
  return (
    <span className="booking-stepper">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        −
      </button>
      <input
        type="number"
        aria-label={label}
        min={min}
        max={max}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        +
      </button>
    </span>
  );
}

export function slotTime(s: TourAvailabilitySlot): string {
  return s.timeless
    ? "Admission for this date"
    : s.hourFormatted ||
        `${String(s.startHour).padStart(2, "0")}:${String(s.startMinute).padStart(2, "0")}`;
}

export function SlotPicker({
  slots,
  value,
  onSelect,
}: {
  slots: TourAvailabilitySlot[];
  value: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="booking-slots" role="radiogroup" aria-label="Departure time">
      {slots
        .filter((s) => s.activityAvailabilityId)
        .map((s) => {
          const open = s.bookable && !s.soldOut && !s.unavailable;
          const id = s.activityAvailabilityId!;
          const left =
            open && !s.unlimitedAvailability && s.availabilityCount > 0 && s.availabilityCount <= 5
              ? ` (${s.availabilityCount} left)`
              : "";
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={value === id}
              disabled={!open}
              className={value === id ? "active" : undefined}
              onClick={() => onSelect(id)}
            >
              {slotTime(s)}
              {open ? left : ` — ${s.soldOut ? "sold out" : "unavailable"}`}
            </button>
          );
        })}
    </div>
  );
}

export function VariantPicker({
  variants,
  value,
  onSelect,
  money,
}: {
  variants: TourAvailabilityVariant[];
  value: string;
  onSelect: (id: string) => void;
  money: (n: number) => string;
}) {
  return (
    <fieldset className="booking-variants">
      <legend>Option</legend>
      {variants.map((v) => (
        <label key={v.activityVariantId} className={value === v.activityVariantId ? "active" : undefined}>
          <input
            type="radio"
            name="tourdesk-variant"
            value={v.activityVariantId}
            checked={value === v.activityVariantId}
            onChange={() => onSelect(v.activityVariantId)}
          />
          <span>{v.title || "Tour option"}</span>
          {v.pricedPerPerson === false && typeof v.bookingPrice === "number" && Number.isFinite(v.bookingPrice) ? (
            <small>Group price {money(v.bookingPrice)}</small>
          ) : null}
        </label>
      ))}
    </fieldset>
  );
}

// GoIceTravel buildInitQuantities: the default category starts at initCount (or 1).
export function initialQuantities(
  cats: TourAvailabilityPriceCategory[],
  max: number,
): Record<string, number> {
  const init: Record<string, number> = {};
  for (const c of cats) {
    const id = c.priceCategoryId ?? "";
    const want = c.isDefault ? (c.initCount ?? 1) : 0;
    const catMax = c.maximumParticipants && c.maximumParticipants > 0 ? c.maximumParticipants : Infinity;
    init[id] = Math.max(0, Math.min(want, catMax, c.availabilityCount ?? Infinity, max));
  }
  return init;
}

export function ParticipantRows({
  categories,
  quantities,
  overallMax,
  fixedGroupPrice,
  money,
  onChange,
}: {
  categories: TourAvailabilityPriceCategory[];
  quantities: Record<string, number>;
  overallMax: number;
  fixedGroupPrice: boolean;
  money: (n: number) => string;
  onChange: (categoryId: string, n: number) => void;
}) {
  const total = Object.values(quantities).reduce((a, b) => a + b, 0);
  return (
    <fieldset className="booking-participants">
      <legend>Participants</legend>
      {categories.map((c) => {
        const id = c.priceCategoryId!;
        const n = quantities[id] || 0;
        const catCap = c.maximumParticipants && c.maximumParticipants > 0 ? c.maximumParticipants : undefined;
        const max = Math.min(
          computeCategoryMaxQty({
            categoryMaximumParticipants: Math.min(catCap ?? Infinity, c.availabilityCount ?? Infinity),
            effectiveOverallMax: overallMax,
            otherCategoriesQty: total - n,
          }),
          50,
        );
        const name = c.title || "Participant";
        return (
          <div className="booking-category" key={id}>
            <div>
              <strong>
                {name}
                {c.ageLimitFormatted ? ` (${c.ageLimitFormatted})` : ""}
              </strong>
              <span className="booking-category-price">
                {fixedGroupPrice ? "Included in group price" : money(c.price)}
              </span>
              {c.isDependant ? (
                <small>Requires at least one adult ticket in the booking.</small>
              ) : null}
            </div>
            <Stepper label={name} value={n} max={max} onChange={(q) => onChange(id, q)} />
          </div>
        );
      })}
    </fieldset>
  );
}

export function ExtrasPicker({
  extras,
  selections,
  quantities,
  money,
  onChange,
}: {
  extras: BookableExtraPrice[];
  selections: ExtraSelections;
  quantities: Record<string, number>;
  money: (n: number) => string;
  onChange: (extraId: string, key: string, n: number) => void;
}) {
  if (!extras.length) return null;
  return (
    <fieldset className="booking-extras">
      <legend>Add-ons</legend>
      {extras.map((e) => {
        const sel = selections[e.bookableExtraId] ?? {};
        const maxBooking = e.maxPerBooking > 0 ? e.maxPerBooking : 50;
        const stock = e.unlimitedAvailability ? Infinity : Math.max(0, e.availabilityCount);
        const used = Object.values(sel).reduce((a, b) => a + b, 0);
        return (
          <div className="booking-extra" key={e.bookableExtraId}>
            <strong>{e.title || "Add-on"}</strong>
            {e.information ? <small>{e.information.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}</small> : null}
            {e.pricedPerCategory ? (
              e.priceCategories
                .filter((c) => (e.limitByPax ? (quantities[c.priceCategoryId] ?? 0) > 0 : true))
                .map((c) => {
                  const own = sel[c.priceCategoryId] ?? 0;
                  const max = Math.min(
                    e.limitByPax ? (quantities[c.priceCategoryId] ?? 0) : 50,
                    maxBooking - (used - own),
                    stock - (used - own),
                    c.availabilityCount ?? Infinity,
                  );
                  return (
                    <div className="booking-category" key={c.priceCategoryId}>
                      <div>
                        <span>{c.title || "Option"}</span>
                        <span className="booking-category-price">{money(c.price)}</span>
                      </div>
                      <Stepper
                        label={`${e.title || "Add-on"}: ${c.title || "option"}`}
                        value={own}
                        max={Math.max(0, max)}
                        onChange={(q) => onChange(e.bookableExtraId, c.priceCategoryId, q)}
                      />
                    </div>
                  );
                })
            ) : (
              <div className="booking-category">
                <div>
                  <span className="booking-category-price">{money(e.price)}</span>
                </div>
                <Stepper
                  label={e.title || "Add-on"}
                  value={sel[FLAT_EXTRA_KEY] ?? 0}
                  max={Math.max(0, Math.min(maxBooking, stock))}
                  onChange={(q) => onChange(e.bookableExtraId, FLAT_EXTRA_KEY, q)}
                />
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

export function PickupChoice({
  mandatory,
  checked,
  onChange,
}: {
  mandatory: boolean;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  // The pickup surcharge (per category pickupPrice) is shown as its own line in the
  // price summary, exactly as computed by GoIceTravel's computeBookingTotal.
  return (
    <label className="booking-checkbox">
      <input
        type="checkbox"
        checked={checked}
        disabled={mandatory}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{mandatory ? "Pickup required" : "Include pickup"}</span>
    </label>
  );
}
