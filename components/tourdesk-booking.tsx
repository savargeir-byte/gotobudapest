"use client";
import "./booking-panel.css";
import { useEffect, useRef, useState } from "react";
import type { Tour, TourAvailabilitySlot } from "../lib/tourdesk/types";
import {
  selection,
  selectionError,
  selectionTotal,
} from "../lib/tourdesk/selection";
type Constraints = Pick<
  Tour,
  | "minimumPassengers"
  | "maximumPassengers"
  | "pickupService"
  | "mandatoryPickup"
  | "questionsBasedPickup"
>;
export default function TourDeskBooking({
  id,
  tour: constraints,
  currency,
  bookingUrl,
}: {
  id: string;
  tour: Constraints;
  currency: string;
  bookingUrl: string;
}) {
  const tour = constraints as Tour;
  const [dates, setDates] = useState<string[]>([]),
    [date, setDate] = useState(""),
    [slots, setSlots] = useState<TourAvailabilitySlot[]>([]),
    [refresh, setRefresh] = useState(0),
    [datesTry, setDatesTry] = useState(0);
  const [slotId, setSlotId] = useState(""),
    [variantId, setVariantId] = useState(""),
    [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickup, setPickup] = useState(false),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    const c = new AbortController();
    fetch(`/api/booking/tourdesk/${id}`, { signal: c.signal })
      .then(async (r) => {
        const b = await r.json().catch(() => ({}));
        if (!r.ok || !Array.isArray(b.dates))
          throw Error(b.error || "Dates could not be loaded. Please try again.");
        if (!c.signal.aborted) setDates(b.dates);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [id, datesTry]);
  useEffect(() => {
    if (!date) return;
    const c = new AbortController();
    fetch(`/api/booking/tourdesk/${id}?date=${date}`, { signal: c.signal })
      .then(async (r) => {
        const b = await r.json().catch(() => ({}));
        if (!r.ok || !Array.isArray(b.slots))
          throw Error(b.error || "Times could not be loaded. Please try again.");
        if (!c.signal.aborted) setSlots(b.slots);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [id, date, refresh]);
  const slot = slots.find((s) => s.activityAvailabilityId === slotId);
  const variants = (slot?.variants || []).filter(
    (v) => v.available && !v.deleted,
  );
  const variant =
    variants.find((v) => v.activityVariantId === variantId) ||
    (variants.length === 1 ? variants[0] : undefined);
  const config = slot ? selection(tour, slot, variant) : undefined;
  const mustPickup = config?.mandatoryPickup || false;
  const usePickup = mustPickup || pickup;
  const issue = slot
    ? selectionError(tour, slot, variant, quantities, usePickup)
    : "Choose a departure.";
  const total = slot ? selectionTotal(slot, variant, quantities, usePickup) : 0;
  const money = (n: number) =>
    currency
      ? new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(
          n,
        )
      : "Confirm price with TourDesk";
  const reset = () => {
    setReview(false);
    setQuantities({});
    setVariantId("");
    setPickup(false);
    setError("");
  };
  async function checkout() {
    if (pending.current || issue || !currency || !slot) return;
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/api/booking/tourdesk/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          date,
          slotId,
          variantId: variant?.activityVariantId || null,
          pickup: usePickup,
          participants: Object.entries(quantities)
            .filter(([, n]) => n > 0)
            .map(([categoryId, quantity]) => ({ categoryId, quantity })),
          quotedTotal: total,
          currency,
        }),
      });
      const b = await r.json().catch(() => ({}));
      if (!r.ok || !b.checkoutUrl) {
        // 409 = availability, capacity or price changed since the quote. Reload the
        // live availability so the page shows the current prices; keep the selection.
        if (r.status === 409) {
          setSlots([]);
          setBusy(true);
          setRefresh((n) => n + 1);
          throw Error(
            (b.error || "Availability has changed.") +
              " We refreshed availability: please review the updated total below.",
          );
        }
        throw Error(b.error || "Checkout could not be opened.");
      }
      window.location.assign(b.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setReview(false);
      pending.current = false;
      setSubmitting(false);
    }
  }
  return (
    <section className="booking-panel" aria-labelledby="booking-title">
      <h2 id="booking-title">Plan your visit</h2>
      <p>
        Choose your date and participants here. TourDesk collects your details
        and payment at secure checkout.
      </p>
      {busy ? <p role="status">Checking live availability…</p> : null}
      {error ? (
        <p role="alert" className="booking-error">
          {error}
        </p>
      ) : null}
      {!review ? (
        <>
          <label>
            1. Date
            <select
              value={date}
              disabled={busy || !dates.length}
              onChange={(e) => {
                setDate(e.target.value);
                setSlots([]);
                setBusy(Boolean(e.target.value));
                setSlotId("");
                reset();
              }}
            >
              <option value="">Choose a date</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </option>
              ))}
            </select>
          </label>
          {date && !busy ? (
            <label>
              2. Departure
              <select
                value={slotId}
                onChange={(e) => {
                  setSlotId(e.target.value);
                  reset();
                }}
              >
                <option value="">Choose a departure</option>
                {slots
                  .filter((s) => s.activityAvailabilityId)
                  .map((s) => {
                    const open = s.bookable && !s.soldOut && !s.unavailable;
                    const when = s.timeless
                      ? "Admission for this date"
                      : s.hourFormatted ||
                        `${String(s.startHour).padStart(2, "0")}:${String(s.startMinute).padStart(2, "0")}`;
                    return (
                      <option
                        key={s.activityAvailabilityId}
                        value={s.activityAvailabilityId!}
                        disabled={!open}
                      >
                        {open
                          ? when
                          : `${when} — ${s.soldOut ? "sold out" : "unavailable"}`}
                      </option>
                    );
                  })}
              </select>
            </label>
          ) : null}
          {date &&
          !busy &&
          !slots.some((s) => s.bookable && !s.soldOut && !s.unavailable) ? (
            <p>
              No departures available on this date. Choose another date or check
              with TourDesk.
            </p>
          ) : null}
          {date && !busy ? (
            <button
              className="textlink"
              type="button"
              onClick={() => {
                reset();
                setSlots([]);
                setSlotId("");
                setBusy(true);
                setRefresh((n) => n + 1);
              }}
            >
              Refresh availability
            </button>
          ) : null}
          {variants.length > 1 ? (
            <label>
              Option
              <select
                value={variantId}
                onChange={(e) => {
                  setVariantId(e.target.value);
                  setQuantities({});
                  setReview(false);
                  setPickup(false);
                }}
              >
                <option value="">Choose an option</option>
                {variants.map((v) => (
                  <option key={v.activityVariantId} value={v.activityVariantId}>
                    {v.title || "Tour option"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {config?.unsupported ? (
            <p>
              This option has additional booking choices. Use the TourDesk link
              below to see the complete selection.
            </p>
          ) : slot && config && (!variants.length || variant) ? (
            <fieldset>
              <legend>3. Participants</legend>
              {config.categories.map((c) => (
                <label key={c.priceCategoryId}>
                  {c.title || "Participant"}{" "}
                  {c.ageLimitFormatted ? `(${c.ageLimitFormatted})` : ""}
                  <span className="booking-category-price">
                    {variant?.pricedPerPerson === false
                      ? "Included in group price"
                      : money(c.price)}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(
                      50,
                      c.maximumParticipants ?? 50,
                      c.availabilityCount ?? 50,
                    )}
                    inputMode="numeric"
                    value={quantities[c.priceCategoryId!] || 0}
                    onChange={(e) => {
                      setQuantities((q) => ({
                        ...q,
                        [c.priceCategoryId!]: Math.max(
                          0,
                          Math.min(
                            50,
                            c.maximumParticipants ?? 50,
                            c.availabilityCount ?? 50,
                            Number(e.target.value) || 0,
                          ),
                        ),
                      }));
                      setReview(false);
                    }}
                  />
                </label>
              ))}
            </fieldset>
          ) : null}
          {config && (config.pickup || mustPickup) ? (
            <label className="booking-checkbox">
              <input
                type="checkbox"
                checked={usePickup}
                disabled={mustPickup}
                onChange={(e) => {
                  setPickup(e.target.checked);
                  setReview(false);
                }}
              />
              {mustPickup ? "Pickup required" : "Include pickup"}
            </label>
          ) : null}
          {slot && !config?.unsupported ? (
            <>
              <p className="booking-total">Total: {money(total)}</p>
              {issue ? <p className="booking-note">{issue}</p> : null}
              <button
                className="primary"
                type="button"
                disabled={!!issue || !currency || busy}
                onClick={() => setReview(true)}
              >
                Review booking →
              </button>
            </>
          ) : null}
          {!busy && !dates.length && !error ? (
            <p>
              No dates are currently available here. Check the provider for
              alternatives.
            </p>
          ) : null}
          {!busy && !dates.length && error ? (
            <button
              className="textlink"
              type="button"
              onClick={() => {
                setError("");
                setBusy(true);
                setDatesTry((n) => n + 1);
              }}
            >
              Try again
            </button>
          ) : null}
        </>
      ) : (
        <div className="booking-review">
          <h3>Review your selection</h3>
          <p>
            {date} · {slot?.hourFormatted || "Selected admission"}
          </p>
          {variant?.title ? <p>{variant.title}</p> : null}
          <ul>
            {config?.categories
              .filter((c) => (quantities[c.priceCategoryId!] || 0) > 0)
              .map((c) => (
                <li key={c.priceCategoryId}>
                  {c.title}: {quantities[c.priceCategoryId!]}
                </li>
              ))}
          </ul>
          {usePickup ? <p>Pickup included</p> : null}
          <p className="booking-total">Total: {money(total)}</p>
          <p>
            We check availability again before creating checkout. Your booking
            is confirmed only after TourDesk confirms it.
          </p>
          <button
            className="primary"
            type="button"
            disabled={submitting}
            onClick={checkout}
          >
            {submitting
              ? "Opening secure checkout…"
              : "Continue to TourDesk payment ↗"}
          </button>
          <button
            className="textlink"
            type="button"
            disabled={submitting}
            onClick={() => setReview(false)}
          >
            Edit selection
          </button>
        </div>
      )}
      <a
        className="textlink booking-provider-link"
        href={bookingUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        See all options on TourDesk ↗
      </a>
    </section>
  );
}
