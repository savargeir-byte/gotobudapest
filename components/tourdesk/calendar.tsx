"use client";
// Month-grid date picker for the TourDesk journey.
//
// PORTED from GoIceTravel src/components/TourDeskBookingWidget.tsx (commit 8d3e5523,
// read-only reference): compact date trigger + calendar dialog (bottom sheet on
// mobile, popover on desktop), month navigation bounded by the last date TourDesk
// returned availability for, per-day state from the authoritative available-date
// set (never invented), full-date aria-labels, aria-pressed/aria-current.
// The calendar maths are GoIceTravel's own pure helpers, verbatim
// (lib/tourdesk/bookingCalendar.ts). ADAPTED: GoToBudapest classes (booking-panel.css),
// no icons library, English copy, keyboard handling (Escape closes, focus returns to
// the trigger, focus moves into the grid on open).
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCalendarRows,
  dateKeyToDate,
  getDayState,
  getMaxViewMonth,
  getWeekdayLabels,
  toDateKey,
} from "../../lib/tourdesk/bookingCalendar";

const LOCALE = "en-GB";

export default function DateCalendar({
  dates,
  value,
  onSelect,
  disabled,
}: {
  dates: string[];
  value: string;
  onSelect: (dateKey: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<{ year: number; month: number } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const todayKey = today
    ? toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    : "";
  const available = useMemo(() => new Set(dates), [dates]);
  const future = useMemo(
    () => (todayKey ? [...dates].filter((d) => d >= todayKey).sort() : []),
    [dates, todayKey],
  );
  const weekdays = useMemo(() => getWeekdayLabels(LOCALE), []);

  function openPanel() {
    const now = new Date();
    setToday(now);
    const anchor = value || future[0] || toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
    const [y, m] = anchor.split("-").map(Number);
    setView({ year: y, month: m - 1 });
    setOpen(true);
  }
  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  // Move focus into the grid when the dialog opens.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el =
        panel.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:not(:disabled)') ||
        panel.current?.querySelector<HTMLButtonElement>("td button:not(:disabled)");
      el?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, view?.year, view?.month]);

  const minMonth = today ? { year: today.getFullYear(), month: today.getMonth() } : null;
  const maxMonth = today ? getMaxViewMonth(future, today) : null;
  const rows = view ? buildCalendarRows(view.year, view.month) : [];
  const monthLabel = view
    ? new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" }).format(
        new Date(view.year, view.month, 1),
      )
    : "";
  const atMin = !!view && !!minMonth && view.year * 12 + view.month <= minMonth.year * 12 + minMonth.month;
  const atMax = !!view && !!maxMonth && view.year * 12 + view.month >= maxMonth.year * 12 + maxMonth.month;
  const go = (delta: number) =>
    setView((v) => {
      if (!v) return v;
      const n = v.year * 12 + v.month + delta;
      return { year: Math.floor(n / 12), month: n % 12 };
    });

  const selectedLabel = value
    ? new Intl.DateTimeFormat(LOCALE, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateKeyToDate(value))
    : "";

  return (
    <div className="booking-calendar">
      <button
        ref={trigger}
        type="button"
        className="booking-date-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? close(false) : openPanel())}
      >
        <span>{selectedLabel || "Choose a date"}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && view ? (
        <>
          <div className="booking-calendar-backdrop" aria-hidden="true" onClick={() => close()} />
          <div
            ref={panel}
            className="booking-calendar-panel"
            role="dialog"
            aria-label="Choose a date"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                close();
              }
            }}
          >
            <div className="booking-calendar-head">
              <button
                type="button"
                aria-label="Previous month"
                disabled={atMin}
                onClick={() => go(-1)}
              >
                ‹
              </button>
              <p aria-live="polite">{monthLabel}</p>
              <button type="button" aria-label="Next month" disabled={atMax} onClick={() => go(1)}>
                ›
              </button>
              <button
                type="button"
                className="booking-calendar-close"
                aria-label="Close calendar"
                onClick={() => close()}
              >
                ×
              </button>
            </div>
            <table>
              <caption className="sr">{monthLabel}</caption>
              <thead>
                <tr>
                  {weekdays.map((w, i) => (
                    <th key={i} scope="col">
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => {
                      if (!cell) return <td key={ci} />;
                      const st = getDayState(cell.dateKey, {
                        todayKey,
                        availableDateSet: available,
                        selectedDate: value || null,
                      });
                      const full = new Intl.DateTimeFormat(LOCALE, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(dateKeyToDate(cell.dateKey));
                      return (
                        <td key={ci}>
                          <button
                            type="button"
                            disabled={st.disabled}
                            aria-pressed={st.isSelected}
                            aria-current={st.isToday ? "date" : undefined}
                            aria-label={st.disabled ? `${full}, not available` : full}
                            onClick={() => {
                              onSelect(cell.dateKey);
                              close();
                            }}
                          >
                            {cell.day}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="booking-calendar-note">Only dates with live availability can be chosen.</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
