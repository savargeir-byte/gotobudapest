import assert from "node:assert/strict";
import test from "node:test";
import {
  durationOf,
  isFreeCancellation,
  paragraphsOf,
  parseViatorDetail,
} from "../lib/booking/viator-product";
import {
  addDaysISO,
  bookableDates,
  dateAvailability,
  isoWeekday,
  normalizeSchedules,
  productToday,
  scheduleView,
} from "../lib/booking/viator-schedules";

// MOCKED: synthetic API payloads. They prove the parsing and season logic (ported from
// IcelandTripGuide), not what the real Viator API returns for any product.

const variant = (url: string, width: number) => ({ url, width });

test("parseViatorDetail keeps only what the API supplied", () => {
  const empty = parseViatorDetail({ title: "T" });
  assert.deepEqual(empty.images, []);
  assert.deepEqual(empty.paragraphs, []);
  assert.deepEqual(empty.highlights, []);
  assert.equal(empty.rating, undefined);
  assert.equal(empty.itinerary, undefined);
  assert.equal(empty.cancellation, undefined);
  assert.equal(empty.durationLabel, undefined);
  assert.deepEqual(empty.options, []);
  assert.deepEqual(empty.logistics, { start: [], end: [] });
});

test("images: https only, cover first, srcset from the variants", () => {
  const d = parseViatorDetail({
    title: "Cruise",
    images: [
      { variants: [variant("https://x.test/a-200.jpg", 200), variant("https://x.test/a-800.jpg", 800)] },
      { isCover: true, caption: "Cover", variants: [variant("https://x.test/c-480.jpg", 480), variant("https://x.test/c-1200.jpg", 1200)] },
      { variants: [variant("http://insecure.test/b.jpg", 400)] },
      { variants: [] },
    ],
  });
  assert.equal(d.images.length, 2);
  assert.equal(d.images[0].alt, "Cover");
  assert.equal(d.images[0].large, "https://x.test/c-1200.jpg");
  assert.equal(d.images[0].small, "https://x.test/c-480.jpg");
  assert.equal(d.images[0].srcSet, "https://x.test/c-480.jpg 480w, https://x.test/c-1200.jpg 1200w");
  assert.equal(d.images[1].alt, "Cruise — photo 2");
});

test("rating needs both a positive average and a review count", () => {
  assert.deepEqual(parseViatorDetail({ reviews: { combinedAverageRating: 4.6, totalReviews: 12 } }).rating, { value: 4.6, count: 12 });
  assert.equal(parseViatorDetail({ reviews: { combinedAverageRating: 4.6, totalReviews: 0 } }).rating, undefined);
  assert.equal(parseViatorDetail({ reviews: { combinedAverageRating: 0, totalReviews: 5 } }).rating, undefined);
  assert.equal(parseViatorDetail({ reviews: { totalReviews: 5 } }).rating, undefined);
});

test("paragraphs: markup removed, breaks kept, nothing executable survives", () => {
  assert.deepEqual(paragraphsOf("<p>One <b>bold</b> &amp; fine</p><p>Two<br/>lines</p>"), ["One bold & fine", "Two lines"]);
  assert.deepEqual(paragraphsOf("<script>alert(1)</script>Hello"), ["alert(1) Hello"]);
  assert.deepEqual(paragraphsOf(undefined), []);
});

test("duration labels", () => {
  assert.deepEqual(durationOf({ fixedDurationInMinutes: 150 }), { label: "2 h 30 min", minutes: 150 });
  assert.deepEqual(durationOf({ fixedDurationInMinutes: 45 }), { label: "45 min", minutes: 45 });
  assert.equal(durationOf({ variableDurationFromMinutes: 60, variableDurationToMinutes: 120 }).label, "1 h–2 h");
  assert.deepEqual(durationOf({}), {});
});

test("free cancellation: STANDARD, or a full refund up to one day before; 7 days is not free", () => {
  assert.equal(isFreeCancellation({ type: "STANDARD" }), true);
  assert.equal(isFreeCancellation({ type: "CUSTOM", refundEligibility: [{ dayRangeMin: 1, percentageRefundable: 100 }] }), true);
  assert.equal(isFreeCancellation({ type: "CUSTOM", refundEligibility: [{ dayRangeMin: 7, percentageRefundable: 100 }] }), false);
  assert.equal(isFreeCancellation({ type: "CUSTOM", refundEligibility: [{ dayRangeMin: 1, percentageRefundable: 50 }] }), false);
  assert.equal(isFreeCancellation({ type: "ALL_SALES_FINAL" }), false);
});

test("itinerary, logistics, options, languages and requirements", () => {
  const d = parseViatorDetail({
    itinerary: {
      itineraryType: "STANDARD",
      skipTheLine: true,
      days: [{ title: "Day", items: [{ description: "Board", duration: { fixedDurationInMinutes: 15 }, admissionIncluded: "YES" }, { description: "" }] }],
    },
    logistics: { start: [{ description: "Pier", location: { name: "Vigado" } }], end: [{ description: "Same" }] },
    productOptions: [{ productOptionCode: "A1", title: "Seated" }, { productOptionCode: "bad code!", title: "x" }],
    languageGuides: [{ type: "AUDIO", language: "en" }, { type: "AUDIO", language: "en" }, { type: "WRITTEN", language: "hu" }],
    bookingRequirements: { minTravelersPerBooking: 2, maxTravelersPerBooking: 8, requiresAdultForBooking: true },
    confirmationType: "INSTANT",
  });
  assert.equal(d.itinerary?.skipTheLine, true);
  assert.equal(d.itinerary?.days[0].items.length, 1);
  assert.equal(d.itinerary?.days[0].items[0].minutes, 15);
  assert.deepEqual(d.logistics.start, [{ description: "Pier", location: "Vigado" }]);
  assert.deepEqual(d.options.map((o) => o.code), ["A1"]);
  assert.deepEqual(d.languages, ["EN (audio)", "HU (written)"]);
  assert.deepEqual(d.requirements, { min: 2, max: 8, adultRequired: true });
  assert.equal(d.confirmation, "INSTANT");
});

// ---------------------------------------------------------------- schedules

const season = (over: Record<string, unknown> = {}) => ({
  startDate: "2030-01-01",
  pricingRecords: [{ daysOfWeek: ["MONDAY", "FRIDAY"], timedEntries: [{ startTime: "10:00" }] }],
  ...over,
});
const info = (items: unknown[]) => normalizeSchedules({ currency: "EUR", summary: { fromPrice: 25 }, bookableItems: items });

test("dateAvailability: weekday rules, season bounds, unavailable dates, unknown", () => {
  const today = "2030-01-01";
  const i = info([{ productOptionCode: "A", seasons: [season({ endDate: "2030-03-31" })] }]);
  assert.equal(isoWeekday("2030-01-07"), "MONDAY");
  assert.equal(dateAvailability("2029-12-31", i, today), "past");
  assert.equal(dateAvailability("2030-01-07", i, today), "available"); // Monday
  assert.equal(dateAvailability("2030-01-08", i, today), "unavailable"); // Tuesday
  assert.equal(dateAvailability("2030-04-05", i, today), "unavailable"); // after the season
  const blocked = info([{ productOptionCode: "A", seasons: [season({ pricingRecords: [{ daysOfWeek: ["MONDAY"], timedEntries: [{ startTime: "10:00", unavailableDates: [{ date: "2030-01-07" }] }] }] })] }]);
  assert.equal(dateAvailability("2030-01-07", blocked, today), "unavailable");
  assert.equal(dateAvailability("2030-01-14", blocked, today), "available");
  assert.equal(dateAvailability("2030-01-07", { availability: [] }, today), "unknown");
  const noSeasons = info([{ productOptionCode: "A", seasons: [] }]);
  assert.equal(dateAvailability("2030-01-07", noSeasons, today), "unknown");
});

test("an open-ended season runs 384 days from today, no further", () => {
  const today = "2030-01-01";
  const i = info([{ productOptionCode: "A", seasons: [season({ pricingRecords: [{ daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] }] })] }]);
  assert.equal(dateAvailability(addDaysISO(today, 384), i, today), "available");
  assert.equal(dateAvailability(addDaysISO(today, 385), i, today), "unavailable");
  const { dates, unknownCount } = bookableDates(i, today);
  assert.equal(dates.length, 385);
  assert.equal(unknownCount, 0);
});

test("bookableDates is the union over options and counts unknown dates separately", () => {
  const today = "2030-01-01"; // a Tuesday
  const i = info([
    { productOptionCode: "A", seasons: [season({ pricingRecords: [{ daysOfWeek: ["MONDAY"] }] })] },
    { productOptionCode: "B", seasons: [season({ pricingRecords: [{ daysOfWeek: ["FRIDAY"] }] })] },
  ]);
  const { dates } = bookableDates(i, today, 14);
  assert.deepEqual(dates, ["2030-01-04", "2030-01-07", "2030-01-11", "2030-01-14"]);
  const mixed = info([{ productOptionCode: "A", seasons: [] }]);
  assert.deepEqual(bookableDates(mixed, today, 6), { dates: [], unknownCount: 7 });
});

test("normalizeSchedules: bands, from price, currency", () => {
  const i = normalizeSchedules({
    currency: "EUR",
    summary: { fromPrice: 38.5, fromPriceBeforeDiscount: 45 },
    bookableItems: [
      {
        productOptionCode: "A",
        seasons: [
          {
            startDate: "2030-01-01",
            pricingRecords: [
              { daysOfWeek: ["MONDAY"], pricingDetails: [{ ageBand: "ADULT", minTravelers: 1, maxTravelers: 10 }, { ageBand: "bad", maxTravelers: 3 }] },
            ],
          },
        ],
      },
    ],
  });
  assert.equal(i.fromPrice, 38.5);
  assert.equal(i.fromPriceBeforeDiscount, 45);
  assert.equal(i.currency, "EUR");
  assert.deepEqual(i.bands, [{ ageBand: "ADULT", min: 1, max: 10 }]);
  assert.equal(normalizeSchedules({}).fromPrice, undefined);
});

test("scheduleView: ok carries dates and price, every other status passes through", () => {
  const today = productToday();
  const ok = scheduleView(
    { status: "ok", info: info([{ productOptionCode: "A", seasons: [season({ startDate: today, pricingRecords: [{ daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] }] })] }]) },
    today,
  );
  assert.equal(ok.status, "ok");
  if (ok.status === "ok") {
    assert.equal(ok.fromPrice, 25);
    assert.equal(ok.currency, "EUR");
    assert.ok(ok.dates.length > 300);
    assert.equal(ok.dates[0], today);
  }
  for (const status of ["empty", "forbidden", "notfound", "error"] as const) {
    assert.deepEqual(scheduleView({ status }), { status });
  }
});

test("entities are decoded once: encoded entities are never decoded a second time", () => {
  assert.deepEqual(paragraphsOf("a &amp;lt; b &amp;amp; c &lt;i&gt;"), ["a &lt; b &amp; c <i>"]);
});
