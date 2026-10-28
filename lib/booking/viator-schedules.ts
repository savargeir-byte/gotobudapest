// Viator availability schedules (GET /availability/schedules/{productCode}) -> bookable dates.
//
// PORTED (logic verbatim, types trimmed) from IcelandTripGuide src/lib/booking/adapter.ts
// (read-only reference, commit d3f92c4): normalizeSchedules, dateAvailability, addDaysISO,
// isoWeekday, productToday, OPEN_SEASON_DAYS. The season model is Viator's:
//   bookableItems (options) -> seasons [startDate, endDate ?? today+384]
//   -> pricingRecords (daysOfWeek) -> timedEntries (per start time unavailableDates)
//      or pricingRecords.unavailableDates (no start time).
// ADAPTED for Budapest: the product time zone is Europe/Budapest (Viator dates are calendar
// dates "relative to the time zone in which the product operates"), currency defaults to the
// marketplace currency, and fetching goes through the hardened providerFetch wrapper.
// Read-only: only the schedules GET is used here. No booking/hold/reserve endpoint exists.
import { array, record, text } from "./common";
import { viatorRequest } from "./products";

export const PRODUCT_TIME_ZONE = "Europe/Budapest";
// Viator: a season without endDate "extends 384 days into the future from the present time".
export const OPEN_SEASON_DAYS = 384;

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export type AvailabilityRecord = {
  days: string[] | null;
  timed: { startTime: string; days: string[] | null; unavailable: string[] }[] | null;
  unavailable: string[];
};
export type AvailabilitySeason = {
  start: string | null;
  end: string | null; // null = open-ended
  records: AvailabilityRecord[];
  legacyDays: string[] | null;
  legacyUnavailable: string[];
};
export type OptionAvailability = {
  code: string | null;
  unavailable: string[];
  seasons: AvailabilitySeason[];
};
export type ScheduleBand = {
  ageBand: string;
  min?: number;
  max?: number;
};
export type ScheduleInfo = {
  availability: OptionAvailability[];
  bands: ScheduleBand[];
  currency: string;
  fromPrice?: number;
  fromPriceBeforeDiscount?: number;
};
export type DateAvailability = "past" | "available" | "unavailable" | "unknown";

export type SchedulesResult =
  | { status: "ok"; info: ScheduleInfo }
  | { status: "empty" } // the product returned no usable schedule data
  | { status: "forbidden" } // the key tier is not allowed to read schedules
  | { status: "notfound" }
  | { status: "error" }; // transient

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
export function isoWeekday(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export function productToday(now: Date = new Date(), timeZone = PRODUCT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const strings = (v: unknown): string[] =>
  array(v).filter((x): x is string => typeof x === "string");
const dateList = (v: unknown): string[] =>
  array(v)
    .map((u) => (typeof u === "string" ? u : text(record(u).date)))
    .filter(Boolean);
const dayList = (v: unknown): string[] | null => {
  const d = strings(v);
  return d.length ? d : null;
};

export function normalizeSchedules(raw: unknown): ScheduleInfo {
  const r = record(raw);
  const bands = new Map<string, ScheduleBand>();
  const availability: OptionAvailability[] = [];
  for (const rawItem of array(r.bookableItems)) {
    const item = record(rawItem);
    const option: OptionAvailability = {
      code: text(item.productOptionCode) || null,
      unavailable: dateList(item.unavailableDates),
      seasons: [],
    };
    availability.push(option);
    for (const rawSeason of array(item.seasons)) {
      const season = record(rawSeason);
      const rule: AvailabilitySeason = {
        start: text(season.startDate) || null,
        end: text(season.endDate) || null,
        records: [],
        legacyDays: dayList(season.daysOfWeek),
        legacyUnavailable: dateList(season.unavailableDates),
      };
      option.seasons.push(rule);
      for (const rawRecord of array(season.pricingRecords)) {
        const pr = record(rawRecord);
        rule.records.push({
          days: dayList(pr.daysOfWeek),
          timed: array(pr.timedEntries).length
            ? array(pr.timedEntries)
                .map(record)
                .map((te) => ({
                  startTime: text(te.startTime),
                  days: dayList(te.daysOfWeek),
                  unavailable: dateList(te.unavailableDates),
                }))
            : null,
          unavailable: dateList(pr.unavailableDates),
        });
        for (const pd of array(pr.pricingDetails).map(record)) {
          const band = text(pd.ageBand);
          if (!/^[A-Z]{3,12}$/.test(band)) continue;
          const max = typeof pd.maxTravelers === "number" ? pd.maxTravelers : undefined;
          const min = typeof pd.minTravelers === "number" ? pd.minTravelers : undefined;
          const have = bands.get(band);
          if (!have) bands.set(band, { ageBand: band, min, max });
          else if (max !== undefined && (have.max ?? 0) < max) have.max = max;
        }
      }
    }
  }
  const summary = record(r.summary);
  const cur = text(r.currency);
  const price = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined;
  return {
    availability,
    bands: [...bands.values()],
    currency: /^[A-Z]{3}$/.test(cur) ? cur : "EUR",
    fromPrice: price(summary.fromPrice),
    fromPriceBeforeDiscount: price(summary.fromPriceBeforeDiscount),
  };
}

// Season-aware availability of one calendar date (IcelandTripGuide dateAvailability).
// A date is available if ANY option has ANY start time free on it. 'unknown' = Viator gave no
// usable schedule data for it; the live /availability/check decides (never shown as confirmed).
export function dateAvailability(
  iso: string,
  info: Pick<ScheduleInfo, "availability">,
  today: string = productToday(),
): DateAvailability {
  if (iso < today) return "past";
  const rules = info.availability;
  if (rules.length === 0) return "unknown";
  const horizon = addDaysISO(today, OPEN_SEASON_DAYS);
  const weekday = isoWeekday(iso);
  let unknown = false;
  for (const option of rules) {
    if (option.unavailable.includes(iso)) continue;
    if (option.seasons.length === 0) {
      unknown = true;
      continue;
    }
    for (const season of option.seasons) {
      if (season.start && iso < season.start) continue;
      if (iso > (season.end ?? horizon)) continue;
      if (season.legacyUnavailable.includes(iso)) continue;
      if (season.records.length === 0) {
        if (season.legacyDays) {
          if (season.legacyDays.includes(weekday)) return "available";
        } else unknown = true;
        continue;
      }
      for (const rec of season.records) {
        const days = rec.days ?? season.legacyDays;
        if (days && !days.includes(weekday)) continue;
        if (rec.timed) {
          const free = rec.timed.some(
            (te) => (!te.days || te.days.includes(weekday)) && !te.unavailable.includes(iso),
          );
          if (free) return "available";
        } else if (!rec.unavailable.includes(iso)) return "available";
      }
    }
  }
  return unknown ? "unknown" : "unavailable";
}

// Bounded list of bookable calendar dates for the date picker.
export function bookableDates(
  info: Pick<ScheduleInfo, "availability">,
  today: string = productToday(),
  horizonDays = OPEN_SEASON_DAYS,
): { dates: string[]; unknownCount: number } {
  const dates: string[] = [];
  let unknownCount = 0;
  for (let i = 0; i <= horizonDays; i++) {
    const iso = addDaysISO(today, i);
    const state = dateAvailability(iso, info, today);
    if (state === "available") dates.push(iso);
    else if (state === "unknown") unknownCount++;
  }
  return { dates, unknownCount };
}

// What the browser needs: bookable dates and the "from" price, never the raw season model.
export type ScheduleView =
  | {
      status: "ok";
      dates: string[];
      unknownCount: number;
      fromPrice?: number;
      currency: string;
      bands: ScheduleBand[];
    }
  | { status: "empty" | "forbidden" | "notfound" | "error" };

export function scheduleView(result: SchedulesResult, today: string = productToday()): ScheduleView {
  if (result.status !== "ok") return { status: result.status };
  const { dates, unknownCount } = bookableDates(result.info, today);
  return {
    status: "ok",
    dates,
    unknownCount,
    fromPrice: result.info.fromPrice,
    currency: result.info.currency,
    bands: result.info.bands,
  };
}

// Server-side read of the schedules. Errors are classified, never thrown, so a failing
// schedules call can degrade the page (the details still render) instead of breaking it.
export async function getViatorSchedules(code: string): Promise<SchedulesResult> {
  try {
    const raw = await viatorRequest(`/availability/schedules/${code}`, {}, 900);
    const info = normalizeSchedules(raw);
    return info.availability.length ? { status: "ok", info } : { status: "empty" };
  } catch (e) {
    const status =
      e && typeof e === "object" && "upstreamStatus" in e
        ? (e as { upstreamStatus?: number }).upstreamStatus
        : undefined;
    if (status === 401 || status === 403) return { status: "forbidden" };
    if (status === 404) return { status: "notfound" };
    return { status: "error" };
  }
}
