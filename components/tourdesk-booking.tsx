"use client";
import "./booking-panel.css";
import { useEffect, useRef, useState } from "react";
import type {
  Tour,
  TourAvailabilitySlot,
  TourAvailabilityVariant,
} from "../lib/tourdesk/types";
import {
  selection,
  selectionError,
  selectionPriceCategories,
  selectionTotal,
} from "../lib/tourdesk/selection";
import { computeBookingTotal, formatPrice } from "../lib/tourdesk/bookingPricing";
import { slotTime, SlotPicker, VariantPicker, ParticipantRows, ExtrasPicker, PickupChoice, initialQuantities } from "./tourdesk/steps";
import DateCalendar from "./tourdesk/calendar";
import {
  FLAT_EXTRA_KEY,
  extrasTotal,
  selectionsToRequest,
  type ExtraSelections,
} from "../lib/tourdesk/extras";
type Constraints = Pick<
  Tour,
  | "minimumPassengers"
  | "maximumPassengers"
  | "pickupService"
  | "mandatoryPickup"
  | "questionsBasedPickup"
>;
// TourDesk booking journey. The step order and behaviours are GoIceTravel's
// TourDeskBookingWidget (date -> departure -> option -> participants -> add-ons ->
// pickup -> price -> checkout), see components/tourdesk/* for the ported pieces and
// docs/BOOKING_REUSE.md for the feature-by-feature comparison. GoToBudapest adds a
// review step and goTene's checkout protections:
// After a checkout attempt whose outcome could not be confirmed (ported from goTene's
// TourDeskBookingWidget: ORDER_STATUS_UNKNOWN lock) the page refuses a second
// transactional request, even after a reload, for this long.
const UNCERTAIN_LOCK_MS = 30 * 60_000;
const stamp = () => Date.now();
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
    [quantities, setQuantities] = useState<Record<string, number>>({}),
    [extraSel, setExtraSel] = useState<ExtraSelections>({});
  const [pickup, setPickup] = useState(false),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [review, setReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uncertain, setUncertain] = useState<{ ref?: string } | null>(null);
  const pending = useRef(false);
  const lockKey = `gotobudapest-uncertain-${id}`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(lockKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { ts?: unknown; ref?: unknown };
      if (typeof saved.ts === "number" && stamp() - saved.ts < UNCERTAIN_LOCK_MS) {
        pending.current = true;
        // Restoring a client-only lock after hydration (sessionStorage does not exist
        // on the server), so it cannot be a lazy initial state without a mismatch.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUncertain({ ref: typeof saved.ref === "string" ? saved.ref : undefined });
      } else sessionStorage.removeItem(lockKey);
    } catch {
      /* storage unavailable: the in-memory lock below still applies */
    }
  }, [lockKey]);
  function lock(ref?: string) {
    // Never reset pending: no second POST /TourBooking from this page.
    pending.current = true;
    setUncertain({ ref });
    setSubmitting(false);
    try {
      sessionStorage.setItem(lockKey, JSON.stringify({ ts: stamp(), ref }));
    } catch {
      /* ignore */
    }
  }
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
  const extrasRequest = variant ? selectionsToRequest(config?.extras ?? [], extraSel) : [];
  const issue = slot
    ? selectionError(tour, slot, variant, quantities, usePickup, extrasRequest)
    : "Choose a departure.";
  const total = slot
    ? selectionTotal(slot, variant, quantities, usePickup, extrasRequest)
    : 0;
  const money = (n: number) =>
    currency ? formatPrice(n, currency) : "Confirm price with TourDesk";
  // Price breakdown with the same functions the total uses (no second formula).
  const parts =
    slot && config && !config.unsupported
      ? computeBookingTotal({
          variantPricedPerPerson: variant?.pricedPerPerson ?? null,
          variantBookingPrice: variant?.bookingPrice ?? null,
          categories: selectionPriceCategories(slot, variant),
          quantities,
          pickup: usePickup,
        })
      : undefined;
  const addOns = config ? extrasTotal(config.extras, extrasRequest) : 0;
  const fixedGroup = variant?.pricedPerPerson === false;
  // Selection state changes are done in handlers (never effects): choosing a
  // departure/option re-initialises participants (GoIceTravel default category).
  const resetChoices = () => {
    setReview(false);
    setExtraSel({});
    setPickup(false);
    setError("");
  };
  function startSelection(
    s: TourAvailabilitySlot | undefined,
    variantArg?: TourAvailabilityVariant,
  ) {
    if (!s) {
      setQuantities({});
      return;
    }
    const cfg = selection(tour, s, variantArg);
    setQuantities(initialQuantities(cfg.categories, cfg.range.max));
  }
  function chooseDate(d: string) {
    setDate(d);
    setSlots([]);
    setSlotId("");
    setVariantId("");
    setQuantities({});
    setBusy(true);
    resetChoices();
  }
  function chooseSlot(sid: string) {
    const s = slots.find((x) => x.activityAvailabilityId === sid);
    const vs = (s?.variants || []).filter((v) => v.available && !v.deleted);
    const single = vs.length === 1 ? vs[0] : undefined;
    setSlotId(sid);
    setVariantId(single?.activityVariantId ?? "");
    resetChoices();
    startSelection(s, single);
  }
  function chooseVariant(vid: string) {
    setVariantId(vid);
    resetChoices();
    startSelection(slot, variants.find((v) => v.activityVariantId === vid));
  }
  async function checkout() {
    if (pending.current || issue || !currency || !slot) return;
    pending.current = true;
    setSubmitting(true);
    setError("");
    let r: Response;
    let b: Record<string, unknown> | null;
    try {
      r = await fetch("/api/booking/tourdesk/checkout", {
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
          ...(extrasRequest.length ? { extras: extrasRequest } : {}),
          quotedTotal: total,
          currency,
        }),
      });
      b = await r.json().catch(() => null);
    } catch {
      // The POST was sent: a network failure does not prove TourDesk created nothing.
      lock();
      return;
    }
    // A non-JSON answer (for example a platform timeout page) is also unconfirmed.
    if (!b) {
      lock();
      return;
    }
    if (
      b.reconciliationRequired === true ||
      b.code === "ORDER_STATUS_UNKNOWN"
    ) {
      lock(typeof b.diagnosticId === "string" ? b.diagnosticId : undefined);
      return;
    }
    try {
      if (!r.ok || typeof b.checkoutUrl !== "string") {
        // 409 = availability, capacity or price changed since the quote. Reload the
        // live availability so the page shows the current prices; keep the selection.
        const message = typeof b.error === "string" ? b.error : "";
        if (r.status === 409) {
          setSlots([]);
          setBusy(true);
          setRefresh((n) => n + 1);
          throw Error(
            (message || "Availability has changed.") +
              " We refreshed availability: please review the updated total below.",
          );
        }
        throw Error(message || "Checkout could not be opened.");
      }
      window.location.assign(b.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setReview(false);
      pending.current = false;
      setSubmitting(false);
    }
  }
  if (uncertain)
    return (
      <section className="booking-panel" aria-labelledby="booking-title">
        <h2 id="booking-title">Checkout not confirmed</h2>
        <p role="alert" className="booking-error">
          We could not confirm whether TourDesk created your checkout. Please do
          not book again from this page.
          {uncertain.ref ? ` Reference: ${uncertain.ref}.` : ""}
        </p>
        <p>
          Open TourDesk to check for an existing booking or to continue there.
          Nothing here confirms an order or a payment.
        </p>
        <a
          className="primary"
          href={bookingUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Check or continue on TourDesk ↗
        </a>
      </section>
    );
  const openSlots = slots.some((s) => s.bookable && !s.soldOut && !s.unavailable);
  const chosenDate = date
    ? new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";
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
          <div className="booking-step">
            <span className="booking-step-label" id="td-date-label">1. Date</span>
            <DateCalendar
              dates={dates}
              value={date}
              disabled={busy && !dates.length}
              onSelect={chooseDate}
            />
          </div>
          {date && !busy ? (
            <div className="booking-step">
              <span className="booking-step-label">2. Departure</span>
              <SlotPicker slots={slots} value={slotId} onSelect={chooseSlot} />
            </div>
          ) : null}
          {date && !busy && !openSlots ? (
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
                resetChoices();
                setQuantities({});
                setSlots([]);
                setSlotId("");
                setBusy(true);
                setRefresh((n) => n + 1);
              }}
            >
              Refresh availability
            </button>
          ) : null}
          {slot && variants.length > 1 ? (
            <VariantPicker
              variants={variants}
              value={variantId}
              onSelect={chooseVariant}
              money={money}
            />
          ) : null}
          {slot && config?.unsupported ? (
            <p>
              This option has additional booking choices. Use the TourDesk link
              below to see the complete selection.
            </p>
          ) : slot && config && (!variants.length || variant) ? (
            <>
              <ParticipantRows
                categories={config.categories}
                quantities={quantities}
                overallMax={Math.min(50, config.range.max)}
                fixedGroupPrice={fixedGroup}
                money={money}
                onChange={(cid, n) => {
                  setQuantities((q) => ({ ...q, [cid]: n }));
                  setReview(false);
                }}
              />
              <ExtrasPicker
                extras={config.extras}
                selections={extraSel}
                quantities={quantities}
                money={money}
                onChange={(eid, key, n) => {
                  setExtraSel((s) => ({
                    ...s,
                    [eid]: { ...(s[eid] ?? {}), [key]: n },
                  }));
                  setReview(false);
                }}
              />
            </>
          ) : null}
          {config && !config.unsupported && (config.pickup || mustPickup) ? (
            <PickupChoice
              mandatory={mustPickup}
              checked={usePickup}
              onChange={(v) => {
                setPickup(v);
                setReview(false);
              }}
            />
          ) : null}
          {slot && !config?.unsupported && (!variants.length || variant) ? (
            <>
              <div className="booking-summary" aria-live="polite">
                {parts && !fixedGroup ? (
                  <p>Tickets: {money(parts.basePrice)}</p>
                ) : null}
                {parts && fixedGroup ? (
                  <p>Group price: {money(parts.basePrice)}</p>
                ) : null}
                {parts && parts.pickupSurcharge > 0 ? (
                  <p>Pickup: +{money(parts.pickupSurcharge)}</p>
                ) : null}
                {addOns > 0 ? <p>Add-ons: +{money(addOns)}</p> : null}
                <p className="booking-total">Total: {money(total)}</p>
              </div>
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
            {chosenDate} · {slot ? slotTime(slot) : "Selected admission"}
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
            {config?.extras.flatMap((e) => {
              const sel = extraSel[e.bookableExtraId] ?? {};
              if (e.pricedPerCategory)
                return e.priceCategories
                  .filter((c) => (sel[c.priceCategoryId] ?? 0) > 0)
                  .map((c) => (
                    <li key={`${e.bookableExtraId}-${c.priceCategoryId}`}>
                      Add-on {e.title || ""} ({c.title || "option"}): {sel[c.priceCategoryId]}
                    </li>
                  ));
              return (sel[FLAT_EXTRA_KEY] ?? 0) > 0
                ? [
                    <li key={e.bookableExtraId}>
                      Add-on {e.title || ""}: {sel[FLAT_EXTRA_KEY]}
                    </li>,
                  ]
                : [];
            })}
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
