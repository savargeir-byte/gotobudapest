"use client";
// Availability, options and prices for a Viator product, with the provider handoff as the
// LAST thing in the panel.
//
// Flow (IcelandTripGuide booking sheet, adapted): date (from the product's real schedules) ->
// travellers (age bands) -> live check via POST /api/booking/viator/check (a read of availability
// and prices) -> options with live totals -> "Continue to Viator". The date and traveller choices
// do NOT transfer to Viator (we never append parameters to the API-supplied affiliate URL), and
// the panel says so. Nothing here books, holds or reserves anything.
import "../booking-panel.css";
import { useCallback, useMemo, useRef, useState } from "react";
import DateCalendar from "../tourdesk/calendar";
import { Stepper } from "../tourdesk/steps";

export type BandInfo = {
  ageBand: string;
  label: string;
  min: number;
  max: number;
};
export type OptionInfo = { code: string; title: string };
import type { ScheduleView } from "../../lib/booking/viator-schedules";

type Line = { ageBand: string; count: number; subtotal: number };
type Item = {
  productOptionCode?: string;
  startTime?: string;
  available?: boolean;
  unavailableReason?: string;
  totalPrice?: { recommendedRetailPrice?: number };
  lines?: Line[];
};

const REASON: Record<string, string> = {
  SOLD_OUT: "Sold out",
  PAST_BOOKING_CUTOFF: "Booking window closed",
  NOT_OPERATING: "Not operating on this date",
};

export default function ViatorAvailability({
  code,
  bookingUrl,
  bands,
  options,
  requirements,
  schedule: initial,
}: {
  code: string;
  bookingUrl: string;
  bands: BandInfo[];
  options: OptionInfo[];
  requirements: { min?: number; max?: number; adultRequired?: boolean };
  schedule: ScheduleView;
}) {
  const [schedule, setSchedule] = useState<ScheduleView>(initial);
  const [retrying, setRetrying] = useState(false);
  const [date, setDate] = useState("");
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      bands.map((b) => [b.ageBand, b.ageBand === "ADULT" || bands.length === 1 ? Math.max(1, b.min) : b.min]),
    ),
  );
  const [busy, setBusy] = useState(false);
  // The last answer, tied to the selection it was asked for: changing the date or group makes
  // it stale and it simply stops being shown (never show old prices for a new selection).
  const [answer, setAnswer] = useState<{ date: string; mix: string; items?: Item[]; error?: string } | null>(null);
  const [liveCurrency, setLiveCurrency] = useState("");
  const request = useRef(0);
  const fromPrice = schedule.status === "ok" ? schedule.fromPrice : undefined;
  const currency = liveCurrency || (schedule.status === "ok" ? schedule.currency : "EUR");
  const money = useMemo(() => {
    const f = new Intl.NumberFormat("en-IE", { style: "currency", currency });
    return (n: number) => f.format(n);
  }, [currency]);

  const total = Object.values(qty).reduce((n, x) => n + x, 0);
  const maxTotal = requirements.max ?? 99;
  const problem =
    total < (requirements.min ?? 1)
      ? `Select at least ${requirements.min ?? 1} traveller${(requirements.min ?? 1) > 1 ? "s" : ""}.`
      : total > maxTotal
        ? `This experience allows at most ${maxTotal} travellers.`
        : requirements.adultRequired && !(qty.ADULT > 0)
          ? "At least one adult is required."
          : "";

  const mixKey = JSON.stringify(Object.entries(qty).sort());
  const current = answer && answer.date === date && answer.mix === mixKey ? answer : null;
  const items = current?.items ?? null;
  const error = current?.error ?? "";

  const check = useCallback(async () => {
    if (!date || problem || busy) return;
    const mine = ++request.current;
    setBusy(true);
    setAnswer(null);
    try {
      const r = await fetch("/api/booking/viator/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: code,
          travelDate: date,
          currency: "EUR",
          locale: "en",
          paxMix: Object.entries(qty)
            .filter(([, n]) => n > 0)
            .map(([ageBand, numberOfTravelers]) => ({ ageBand, numberOfTravelers })),
        }),
      });
      const b = await r.json().catch(() => ({}));
      if (mine !== request.current) return;
      if (!r.ok)
        throw Error(
          typeof b.error === "string" && b.error
            ? b.error
            : "Availability could not be checked. Please try again.",
        );
      if (typeof b.currency === "string" && /^[A-Z]{3}$/.test(b.currency)) setLiveCurrency(b.currency);
      setAnswer({ date, mix: mixKey, items: Array.isArray(b.bookableItems) ? b.bookableItems : [] });
    } catch (e) {
      if (mine === request.current)
        setAnswer({
          date,
          mix: mixKey,
          error: e instanceof Error ? e.message : "Availability could not be checked. Please try again.",
        });
    } finally {
      if (mine === request.current) setBusy(false);
    }
  }, [date, problem, busy, code, qty, mixKey]);

  async function retrySchedule() {
    setRetrying(true);
    try {
      const r = await fetch(`/api/booking/viator/schedules/${code}`);
      const b = await r.json().catch(() => ({}));
      if (r.ok && b?.status === "ok" && Array.isArray(b.dates)) setSchedule(b as ScheduleView);
      else if (r.ok && ["empty", "forbidden", "notfound", "error"].includes(b?.status))
        setSchedule({ status: b.status });
      else setSchedule({ status: "error" });
    } catch {
      setSchedule({ status: "error" });
    } finally {
      setRetrying(false);
    }
  }

  const optionName = (c?: string) =>
    options.find((o) => o.code === c)?.title || (c && c !== "DEFAULT" ? c : "Standard option");
  const available = (items ?? []).filter((i) => i.available);
  const unavailable = (items ?? []).filter((i) => !i.available);
  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const live = schedule.status === "ok";
  const noLive = ["empty", "forbidden", "notfound"].includes(schedule.status);

  return (
    <section className="booking-panel vp-panel" id="availability" aria-labelledby="availability-heading" tabIndex={-1}>
      <h2 id="availability-heading">Check availability &amp; prices</h2>
      {fromPrice !== undefined ? (
        <p className="vp-from">
          From <strong>{money(fromPrice)}</strong> per person
          <small> · the live price for your date and group is shown below</small>
        </p>
      ) : null}

      {noLive ? (
        <p className="vp-state" role="status">
          Live availability is not available for this product here. You can still check dates, options and
          prices on Viator.
        </p>
      ) : schedule.status === "error" ? (
        <div className="vp-state" role="alert">
          <p>Availability could not be loaded just now.</p>
          <button type="button" className="outline" onClick={retrySchedule} disabled={retrying}>
            {retrying ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : (
        <>
          <div className="booking-step">
            <span className="booking-step-label">1. Choose a date</span>
            {live && schedule.status === "ok" && schedule.dates.length ? (
              <DateCalendar dates={schedule.dates} value={date} onSelect={setDate} disabled={busy} />
            ) : (
              <p className="vp-state" role="status">
                Viator lists no bookable dates in the next year for this product.
              </p>
            )}
            {live && schedule.status === "ok" && schedule.unknownCount > 0 ? (
              <p className="booking-calendar-note">
                Some dates have no schedule data; they are not offered here. Check Viator for them.
              </p>
            ) : null}
          </div>

          {date ? (
            <fieldset className="booking-step" disabled={busy}>
              <legend className="booking-step-label">2. Travellers</legend>
              {bands.map((b) => (
                <div className="booking-category" key={b.ageBand}>
                  <div>
                    {b.label}
                    {b.min > 0 ? <small>At least {b.min} per booking</small> : null}
                  </div>
                  <Stepper
                    label={b.label}
                    value={qty[b.ageBand] ?? 0}
                    min={0}
                    max={Math.min(b.max, maxTotal)}
                    onChange={(n) => setQty((q) => ({ ...q, [b.ageBand]: n }))}
                  />
                </div>
              ))}
              {problem ? <p role="alert">{problem}</p> : null}
              <button type="button" className="primary" onClick={check} disabled={busy || Boolean(problem)}>
                {busy ? "Checking…" : "Check availability"}
              </button>
            </fieldset>
          ) : null}

          {error ? (
            <div className="vp-state" role="alert">
              <p>{error}</p>
              <button type="button" className="outline" onClick={check} disabled={busy || Boolean(problem)}>
                Try again
              </button>
            </div>
          ) : null}

          {items ? (
            <div className="vp-results" role="status" aria-live="polite">
              <h3>
                {date ? fmtDate(date) : ""} · {total} traveller{total > 1 ? "s" : ""}
              </h3>
              {available.length ? (
                <ul className="vp-optionlist">
                  {available.map((i, k) => (
                    <li key={k} className="vp-option">
                      <div>
                        <strong>{optionName(i.productOptionCode)}</strong>
                        {i.startTime ? <small>Starts {i.startTime}</small> : null}
                        {i.lines?.length ? (
                          <small>
                            {i.lines
                              .map((l) => `${l.count} × ${bands.find((b) => b.ageBand === l.ageBand)?.label ?? l.ageBand}: ${money(l.subtotal)}`)
                              .join(" · ")}
                          </small>
                        ) : null}
                      </div>
                      <span className="vp-price">
                        {typeof i.totalPrice?.recommendedRetailPrice === "number"
                          ? money(i.totalPrice.recommendedRetailPrice)
                          : "Price on Viator"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {unavailable.length
                    ? `Nothing is bookable for this date: ${[...new Set(unavailable.map((i) => REASON[i.unavailableReason ?? "SOLD_OUT"] ?? "Unavailable"))].join(", ").toLowerCase()}.`
                    : "Viator returned no bookable options for this date and group."}{" "}
                  Try another date or group size.
                </p>
              )}
              {available.length && unavailable.length ? (
                <p className="booking-note">
                  {unavailable.length} other option{unavailable.length > 1 ? "s are" : " is"} not bookable on this
                  date.
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {/* Final step: the only link to the provider on this page. */}
      <div className="vp-handoff" id="book-on-viator">
        <h3>Ready to book?</h3>
        <p>
          Booking, traveller details and payment are completed on Viator. The date, group and option you chose
          here are <strong>not carried over</strong>: choose them again on Viator. Availability and prices can
          change before you book.
        </p>
        <a className="primary" href={bookingUrl} target="_blank" rel="sponsored noopener noreferrer">
          Continue to Viator ↗
        </a>
      </div>
    </section>
  );
}
