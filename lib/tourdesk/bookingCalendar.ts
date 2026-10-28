// VERBATIM from GoIceTravel src/lib/tourdesk/bookingCalendar.ts (read-only reference,
// commit 8d3e5523). Pure date/calendar helpers; no changes.
/**
 * Pure calendar helpers for TourDeskBookingWidget — extracted so the
 * calendar/date logic (month grid construction, date-key parsing, weekday
 * labels, availability-state derivation) can be unit tested directly
 * instead of only via string-matching the component source. No React, no
 * side effects, no fetches.
 *
 * Date-key convention throughout: "YYYY-MM-DD", always parsed via local
 * calendar components (`new Date(year, month, day)`), never via
 * `new Date(dateString)` — the latter parses as UTC midnight and can
 * render as the previous day in western timezones. TourDesk's own
 * `hourFormatted` slot-time strings are displayed verbatim elsewhere and
 * never routed through Date/UTC math at all, so there is no separate
 * time-of-day reinterpretation risk to guard against here.
 */

export interface DateKeyParts {
  year: number;
  month: number; // 1-12
  day: number;
}

export function parseDateKey(dateStr: string): DateKeyParts {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

export function toDateKey(year: number, monthIndex0: number, day: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dateKeyToDate(dateStr: string): Date {
  const { year, month, day } = parseDateKey(dateStr);
  return new Date(year, month - 1, day);
}

export function isDateKeyInFuture(dateStr: string, today: Date): boolean {
  const ref = new Date(today);
  ref.setHours(0, 0, 0, 0);
  return dateKeyToDate(dateStr) >= ref;
}

/** Monday-first weekday index (JS Date#getDay() is 0=Sun..6=Sat). */
export function mondayFirstIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/** Locale-aware Monday-first weekday short labels, e.g. ["Mon","Tue",...]. */
export function getWeekdayLabels(locale: string): string[] {
  // 2024-01-01 is a real, fixed Monday — used only as a reference date to
  // read weekday names from Intl, never as "now".
  const monday = new Date(2024, 0, 1);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return fmt.format(d);
  });
}

export type CalendarCell = { day: number; dateKey: string } | null;

/** Full month grid, padded to whole weeks (Monday-first), null for filler cells. */
export function buildCalendarRows(year: number, monthIndex0: number): CalendarCell[][] {
  const leading = mondayFirstIndex(new Date(year, monthIndex0, 1).getDay());
  const total = daysInMonth(year, monthIndex0);
  const cellCount = Math.ceil((leading + total) / 7) * 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < cellCount; i++) {
    const day = i - leading + 1;
    cells.push(day < 1 || day > total ? null : { day, dateKey: toDateKey(year, monthIndex0, day) });
  }
  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/**
 * The furthest month navigation should allow, bounded by the last date
 * TourDesk actually returned availability for — prevents paging forward
 * into an unbounded run of guaranteed-empty months. TourDesk's
 * GetAllDates endpoint returns the complete future set in one call (see
 * src/lib/tourdesk/availability.ts) so this never requires a new request.
 */
export function getMaxViewMonth(
  futureDatesAscending: string[],
  today: Date,
): { year: number; month: number } {
  if (futureDatesAscending.length === 0) {
    return { year: today.getFullYear(), month: today.getMonth() };
  }
  const { year, month } = parseDateKey(futureDatesAscending[futureDatesAscending.length - 1]);
  return { year, month: month - 1 };
}

export type DayAvailabilityState = "past" | "available" | "unavailable";

export interface DayState {
  state: DayAvailabilityState;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
}

/**
 * Derive a single calendar cell's display state. `availableDateSet` must
 * already be the authoritative "has at least one bookable slot" set from
 * TourDesk — this function never invents availability for a date it
 * hasn't been told about; an unlisted future date is "unavailable", not
 * "unknown", because TourDesk's GetAllDates response is already complete
 * (there is no later/partial load to distinguish from truly sold out).
 */
export function getDayState(
  dateKey: string,
  opts: { todayKey: string; availableDateSet: ReadonlySet<string>; selectedDate: string | null },
): DayState {
  const isPast = dateKey < opts.todayKey;
  const isAvailable = opts.availableDateSet.has(dateKey);
  const isToday = dateKey === opts.todayKey;
  const isSelected = dateKey === opts.selectedDate;
  const state: DayAvailabilityState = isPast ? "past" : isAvailable ? "available" : "unavailable";
  return { state, isToday, isSelected, disabled: isPast || !isAvailable };
}
