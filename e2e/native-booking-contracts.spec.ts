import { expect, test } from "@playwright/test";
import { POST as checkout } from "../app/api/booking/tourdesk/checkout/route";
import { POST as viatorCheck } from "../app/api/booking/viator/check/route";
import { getBookingProduct } from "../lib/booking/products";
import { selectionError, selectionTotal } from "../lib/tourdesk/selection";
import { validDate } from "../lib/booking/common";
import type {
  Tour,
  TourAvailabilitySlot,
  TourAvailabilityVariant,
} from "../lib/tourdesk/types";

const date = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const slotId =
  date.replaceAll("-", "") + "100000-12_" + date.replaceAll("-", "");
const category = {
  priceCategoryId: "adult",
  title: "Adults",
  price: 40,
  occupancy: 1,
  pickupPrice: 5,
  availabilityCount: null,
};
const tour = {
  activityId: 12,
  providerId: 2,
  title: "Budapest Danube Cruise",
  location: { city: "Budapest" },
  description: "Boat trip in Budapest",
  tourUrl: "https://checkout.tourdesk.is/booking/12-2",
  currencyCode: "EUR",
  minimumPassengers: 1,
  maximumPassengers: 0,
  pickupService: true,
  mandatoryPickup: false,
  questionsBasedPickup: false,
} as unknown as Tour;
const slot = {
  activityAvailabilityId: slotId,
  bookable: true,
  unavailable: false,
  soldOut: false,
  unlimitedAvailability: false,
  availabilityCount: 4,
  minParticipants: 1,
  maxParticipants: null,
  pricePerCategories: [category],
  variants: null,
} as unknown as TourAvailabilitySlot;
const payload = () => ({
  id: "12-2",
  date,
  slotId,
  variantId: null,
  pickup: false,
  participants: [{ categoryId: "adult", quantity: 2 }],
  quotedTotal: 80,
  currency: "EUR",
});
const request = (body: unknown, origin = "https://gotobudapest.vercel.app") =>
  new Request("https://gotobudapest.vercel.app/api/booking/tourdesk/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify(body),
  });

async function mocked(
  run: (calls: { url: string; init: RequestInit }[]) => Promise<void>,
  options: {
    slots?: TourAvailabilitySlot[];
    checkoutUrl?: string;
    foreign?: boolean;
    failAvailability?: boolean;
  } = {},
) {
  const oldFetch = globalThis.fetch,
    oldTD = process.env.TOURDESK_API_KEY,
    oldV = process.env.VIATOR_API_KEY,
    flag = process.env.TOURDESK_BOOKING_ENABLED;
  const calls: { url: string; init: RequestInit }[] = [];
  process.env.TOURDESK_API_KEY = "test-only";
  process.env.VIATOR_API_KEY = "test-only";
  delete process.env.TOURDESK_BOOKING_ENABLED;
  globalThis.fetch = (async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });
    let value: unknown;
    if (url.includes("/Tour/"))
      value = options.foreign
        ? {
            ...tour,
            title: "Reykjavik Cruise",
            description: "Iceland",
            location: { city: "Reykjavik" },
          }
        : tour;
    else if (url.includes("/TourAvailability/")) {
      if (options.failAvailability) return new Response("{}", { status: 503 });
      value = options.slots ?? [slot];
    } else if (url.includes("/TourBooking/"))
      value = {
        success: true,
        checkoutUrl:
          options.checkoutUrl ||
          "https://checkout.tourdesk.is/HandleOrder/Info/123/abc",
      };
    else if (url.endsWith("/destinations"))
      value = {
        destinations: [{ name: "Budapest", type: "CITY", destinationId: 499 }],
      };
    else if (url.includes("/products/"))
      value = {
        title: "Budapest city walk",
        destinations: [{ ref: 499 }],
        productUrl:
          "https://www.viator.com/tours/Budapest/Walk/d499-123P1?pid=EXACT&mcid=1&medium=api",
        pricingInfo: {
          ageBands: [{ ageBand: "ADULT", startAge: 18, endAge: 99 }],
        },
      };
    else if (url.endsWith("/availability/check"))
      value = {
        currency: "EUR",
        bookableItems: [
          {
            available: true,
            productOptionCode: "DEFAULT",
            totalPrice: { original: { recommendedRetailPrice: 80 } },
          },
        ],
      };
    else throw Error("Unexpected provider request: " + url);
    return new Response(JSON.stringify(value), {
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    await run(calls);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [key, value] of Object.entries({
      TOURDESK_API_KEY: oldTD,
      VIATOR_API_KEY: oldV,
      TOURDESK_BOOKING_ENABLED: flag,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("TourDesk carries the real selection into checkout and rechecks uncached availability", async () =>
  mocked(async (calls) => {
    const r = await checkout(request(payload()));
    expect(r.status).toBe(200);
    expect((await r.json()).checkoutUrl).toBe(
      "https://checkout.tourdesk.is/HandleOrder/Info/123/abc",
    );
    const live = calls.find((c) => c.url.includes("/TourAvailability/"))!;
    expect(live.init.cache).toBe("no-store");
    const c = calls.find((c) => c.url.includes("/TourBooking/"))!;
    const sent = JSON.parse(String(c.init.body));
    expect(sent.availabilityId).toBe(slotId);
    expect(sent.priceCategories).toEqual([
      { priceCategoryId: "adult", quantity: 2 },
    ]);
    expect(sent.returnUrl).toMatch(
      /^https:\/\/gotobudapest\.vercel\.app\/booking\/return$/,
    );
    expect(sent).not.toHaveProperty("quotedTotal");
    expect(c.init.cache).toBe("no-store");
  }));
test("changed capacity does not create an order", async () =>
  mocked(
    async (calls) => {
      const r = await checkout(request(payload()));
      expect(r.status).toBe(409);
      expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(false);
    },
    { slots: [{ ...slot, availabilityCount: 1 }] },
  ));
test("changed prices do not create an order", async () =>
  mocked(async (calls) => {
    const r = await checkout(request({ ...payload(), quotedTotal: 1 }));
    expect(r.status).toBe(409);
    expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(false);
  }));
test("unknown participant categories and duplicate IDs fail closed", async () =>
  mocked(async (calls) => {
    for (const participants of [
      [{ categoryId: "forged", quantity: 2 }],
      [
        { categoryId: "adult", quantity: 1 },
        { categoryId: "adult", quantity: 1 },
      ],
    ]) {
      const r = await checkout(request({ ...payload(), participants }));
      expect([400, 409]).toContain(r.status);
    }
    expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(false);
  }));
test("foreign destinations cannot be booked through Budapest endpoints", async () =>
  mocked(
    async (calls) => {
      const r = await checkout(request(payload()));
      expect(r.status).toBe(404);
      expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(false);
    },
    { foreign: true },
  ));
test("upstream failures are retriable errors, not false sold-out claims", async () =>
  mocked(
    async (calls) => {
      const r = await checkout(request(payload()));
      expect(r.status).toBe(502);
      expect(
        calls.filter((c) => c.url.includes("/TourAvailability/")),
      ).toHaveLength(1);
      expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(false);
    },
    { failAvailability: true },
  ));
test("checkout URL host spoofing is rejected", async () =>
  mocked(
    async () => {
      const r = await checkout(request(payload()));
      expect(r.status).toBe(502);
    },
    { checkoutUrl: "https://checkout.tourdesk.is.evil.example/pay" },
  ));
test("cross-origin and oversized writes are rejected before provider requests", async () =>
  mocked(async (calls) => {
    expect(
      (await checkout(request(payload(), "https://evil.example"))).status,
    ).toBe(403);
    expect(
      (await checkout(request({ ...payload(), padding: "x".repeat(17000) })))
        .status,
    ).toBe(413);
    expect(calls).toHaveLength(0);
  }));
test("native booking can be explicitly disabled", async () =>
  mocked(async (calls) => {
    process.env.TOURDESK_BOOKING_ENABLED = "false";
    expect((await checkout(request(payload()))).status).toBe(503);
    expect(calls).toHaveLength(0);
  }));
test("participant pricing, pickup and zero-as-unlimited conventions are preserved", () => {
  expect(selectionTotal(slot, undefined, { adult: 2 }, true)).toBe(90);
  expect(
    selectionError(tour, slot, undefined, { adult: 2 }, false),
  ).toBeUndefined();
  expect(
    selectionError(tour, slot, undefined, { adult: 5 }, false),
  ).toBeTruthy();
});
test("fixed group prices are charged once, while extras use provider flow", () => {
  const v = {
    activityVariantId: "123",
    available: true,
    deleted: false,
    pricedPerPerson: false,
    bookingPrice: 150,
    pickupService: false,
    minPerBooking: 1,
    maxPerBooking: 4,
    pricePerCategories: [{ ...category, price: 0, chargePerBooking: true }],
  } as unknown as TourAvailabilityVariant;
  expect(selectionTotal(slot, v, { adult: 3 }, false)).toBe(150);
  expect(
    selectionError(tour, { ...slot, variants: [v] }, v, { adult: 3 }, false),
  ).toBeUndefined();
  expect(
    selectionError(
      tour,
      { ...slot, variants: [v] },
      { ...v, bookableExtraPrices: [{}] as never },
      { adult: 3 },
      false,
    ),
  ).toContain("TourDesk");
});
test("dates reject calendar overflows and past dates", () => {
  expect(validDate("2027-02-31")).toBe(false);
  expect(validDate("2020-01-01")).toBe(false);
  expect(validDate(date)).toBe(true);
});
test("Viator uses exact returned affiliate link and checks availability without booking writes", async () =>
  mocked(async (calls) => {
    const p = await getBookingProduct("viator", "123P1");
    expect(p.bookingUrl).toBe(
      "https://www.viator.com/tours/Budapest/Walk/d499-123P1?pid=EXACT&mcid=1&medium=api",
    );
    const r = await viatorCheck(
      request({
        productCode: "123P1",
        travelDate: date,
        currency: "EUR",
        paxMix: [{ ageBand: "ADULT", numberOfTravelers: 2 }],
        locale: "en",
      }),
    );
    expect(r.status).toBe(200);
    const sent = calls.find((c) => c.url.endsWith("/availability/check"))!;
    expect(JSON.parse(String(sent.init.body))).toEqual({
      productCode: "123P1",
      travelDate: date,
      currency: "EUR",
      paxMix: [{ ageBand: "ADULT", numberOfTravelers: 2 }],
    });
    expect(sent.init.cache).toBe("no-store");
    expect(
      calls.some((c) => /bookings|reserve|hold|target-lander/.test(c.url)),
    ).toBe(false);
  }));
