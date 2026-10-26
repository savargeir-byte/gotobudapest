"use client";
import "./booking-panel.css";
import { useState } from "react";
import type { BookingProduct } from "../lib/booking/products";
type Result = {
  productOptionCode?: string;
  startTime?: string;
  available?: boolean;
  totalPrice?: {
    price?: { recommendedRetailPrice?: number };
    original?: { recommendedRetailPrice?: number };
    special?: { recommendedRetailPrice?: number } | null;
    recommendedRetailPrice?: number;
  };
};
export default function ViatorBooking({
  id,
  bookingUrl,
  ageBands = [],
}: {
  id: string;
  bookingUrl: string;
  ageBands: BookingProduct["ageBands"];
}) {
  const [open, setOpen] = useState(false),
    [date, setDate] = useState(""),
    [quantities, setQuantities] = useState<Record<string, number>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [currency, setCurrency] = useState(""),
    [results, setResults] = useState<Result[] | null>(null);
  async function check(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const r = await fetch("/api/booking/viator/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: id,
          travelDate: date,
          currency: "EUR",
          locale: "en",
          paxMix: Object.entries(quantities)
            .filter(([, n]) => n > 0)
            .map(([ageBand, numberOfTravelers]) => ({
              ageBand,
              numberOfTravelers,
            })),
        }),
      });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) throw Error(b.error || "Availability could not be checked. Please try again.");
      setCurrency(
        typeof b.currency === "string" && /^[A-Z]{3}$/.test(b.currency)
          ? b.currency
          : "",
      );
      setResults(Array.isArray(b.bookableItems) ? b.bookableItems : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="booking-panel">
      <h2>Book this experience</h2>
      <p>Complete your reservation and payment securely on Viator.</p>
      <a
        className="primary"
        href={bookingUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
      >
        Book on Viator ↗
      </a>
      {ageBands.length ? (
        <>
          <button
            type="button"
            className="textlink booking-provider-link"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Check dates and prices here
          </button>
          {open ? (
            <form onSubmit={check}>
              <p className="booking-note">
                This is an availability preview. Your date, time and participant
                choices do not transfer to Viator. Select them again there to
                complete booking.
              </p>
              <label>
                Date
                <input
                  type="date"
                  disabled={busy}
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setResults(null);
                  }}
                />
              </label>
              <fieldset disabled={busy}>
                <legend>Participants</legend>
                {ageBands.map((b) => (
                  <label key={b.ageBand}>
                    {b.ageBand.toLowerCase()}
                    {b.startAge != null
                      ? ` (age ${b.startAge}${b.endAge != null ? "–" + b.endAge : "+"})`
                      : ""}
                    <input
                      type="number"
                      min="0"
                      max={Math.min(50, b.maxTravelersPerBooking ?? 50)}
                      inputMode="numeric"
                      value={quantities[b.ageBand] || 0}
                      onChange={(e) => {
                        setQuantities((q) => ({
                          ...q,
                          [b.ageBand]: Math.max(
                            0,
                            Math.min(50, Number(e.target.value) || 0),
                          ),
                        }));
                        setResults(null);
                      }}
                    />
                  </label>
                ))}
              </fieldset>
              <button
                className="primary"
                disabled={busy || !Object.values(quantities).some((n) => n > 0)}
              >
                {busy ? "Checking…" : "Check availability"}
              </button>
              {error ? <p role="alert">{error}</p> : null}
              {results ? (
                <div role="status">
                  {results.some((r) => r.available) ? (
                    <>
                      <h3>Available options</h3>
                      <ul>
                        {results
                          .filter((r) => r.available)
                          .map((r, i) => {
                            const n =
                              r.totalPrice?.special?.recommendedRetailPrice ??
                              r.totalPrice?.original?.recommendedRetailPrice ??
                              r.totalPrice?.recommendedRetailPrice;
                            return (
                              <li key={i}>
                                {r.productOptionCode || "Available option"}
                                {r.startTime ? " · " + r.startTime : ""}
                                {typeof n === "number" && currency
                                  ? " · " +
                                    new Intl.NumberFormat("en-IE", {
                                      style: "currency",
                                      currency,
                                    }).format(n)
                                  : " · Confirm price on Viator"}
                              </li>
                            );
                          })}
                      </ul>
                    </>
                  ) : (
                    <p>
                      No available options for this selection. Try another date
                      or check directly with Viator.
                    </p>
                  )}
                  <p>
                    Choose your dates and participants again on Viator.
                    Availability can change before booking.
                  </p>
                </div>
              ) : null}
            </form>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
