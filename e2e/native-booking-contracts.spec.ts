import { expect, test } from "@playwright/test";
import { POST as checkout } from "../app/api/booking/tourdesk/checkout/route";
import { POST as viatorCheck } from "../app/api/booking/viator/check/route";
import { getBookingProduct } from "../lib/booking/products";
import { resetBookingGateForTests } from "../lib/booking/http";
import { selectionError, selectionTotal } from "../lib/tourdesk/selection";
import {
  extrasToPayload,
  extrasTotal,
  variantExtras,
} from "../lib/tourdesk/extras";
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
    bookingStatus?: number;
  } = {},
) {
  resetBookingGateForTests();
  const oldFetch = globalThis.fetch,
    oldTD = process.env.TOURDESK_API_KEY,
    oldV = process.env.VIATOR_API_KEY,
    flag = process.env.TOURDESK_BOOKING_ENABLED,
    pilot = process.env.TOURDESK_PILOT_KEYS;
  const calls: { url: string; init: RequestInit }[] = [];
  process.env.TOURDESK_API_KEY = "test-only";
  process.env.VIATOR_API_KEY = "test-only";
  // Native checkout is default-off (ported gate); these contracts exercise it enabled.
  process.env.TOURDESK_BOOKING_ENABLED = "true";
  delete process.env.TOURDESK_PILOT_KEYS;
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
    } else if (url.includes("/TourBooking/")) {
      if (options.bookingStatus)
        return new Response("{}", { status: options.bookingStatus });
      value = {
        success: true,
        checkoutUrl:
          options.checkoutUrl ||
          "https://checkout.tourdesk.is/HandleOrder/Info/123/abc",
      };
    } else if (url.endsWith("/destinations"))
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
      TOURDESK_PILOT_KEYS: pilot,
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
    // Server-owned return URL on the confirmed production domain (NEXT_PUBLIC_SITE_URL unset).
    expect(sent.returnUrl).toBe("https://www.gotobuda.com/booking/return");
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
      // success:true with an unusable checkout URL: an order may exist, so the answer is
      // ORDER_STATUS_UNKNOWN (never "try again"), and the spoofed URL is never returned.
      expect(r.status).toBe(503);
      const body = await r.json();
      expect(body.code).toBe("ORDER_STATUS_UNKNOWN");
      expect(body.reconciliationRequired).toBe(true);
      expect(typeof body.diagnosticId).toBe("string");
      expect(JSON.stringify(body)).not.toContain("evil.example");
      expect(body.error).not.toMatch(/try again/i);
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
test("native booking is OFF by default and for TOURDESK_BOOKING_ENABLED=false", async () =>
  mocked(async (calls) => {
    delete process.env.TOURDESK_BOOKING_ENABLED;
    expect((await checkout(request(payload()))).status).toBe(503);
    process.env.TOURDESK_BOOKING_ENABLED = "false";
    expect((await checkout(request(payload()))).status).toBe(503);
    process.env.TOURDESK_BOOKING_ENABLED = "yes";
    expect((await checkout(request(payload()))).status).toBe(503);
    expect(calls).toHaveLength(0);
  }));
test("a listed pilot key enables exactly that product", async () =>
  mocked(async (calls) => {
    delete process.env.TOURDESK_BOOKING_ENABLED;
    process.env.TOURDESK_PILOT_KEYS = "99-9, 12-2";
    expect((await checkout(request(payload()))).status).toBe(200);
    expect(calls.some((c) => c.url.includes("/TourBooking/"))).toBe(true);
    process.env.TOURDESK_PILOT_KEYS = "99-9,not-a-key";
    calls.length = 0;
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
test("fixed group prices are charged once; offered add-ons no longer force the provider flow", () => {
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
  // Add-ons are part of the ported journey (see lib/tourdesk/extras.ts): an offered
  // extra that nobody selected is valid, and a selection is priced on top.
  const withExtra = {
    ...v,
    bookableExtraPrices: [
      {
        bookableExtraId: "9",
        title: "Audio guide",
        pricedPerCategory: false,
        price: 5,
        limitByPax: false,
        maxPerBooking: 2,
        unlimitedAvailability: true,
        availabilityCount: 0,
        priceCategories: [],
      },
    ] as never,
  } as TourAvailabilityVariant;
  const s2 = { ...slot, variants: [withExtra] };
  expect(
    selectionError(tour, s2, withExtra, { adult: 3 }, false),
  ).toBeUndefined();
  const pick = [{ extraId: "9", quantity: 2, priceCategories: [] }];
  expect(
    selectionError(tour, s2, withExtra, { adult: 3 }, false, pick),
  ).toBeUndefined();
  expect(selectionTotal(s2, withExtra, { adult: 3 }, false, pick)).toBe(160);
  // Unsupported pricing models still hand off to TourDesk.
  expect(
    selectionError(
      tour,
      {
        ...slot,
        variants: [
          { ...withExtra, pricePerCategories: [{ ...category, occupancy: 2 }] },
        ],
      } as never,
      {
        ...withExtra,
        pricePerCategories: [{ ...category, occupancy: 2 }],
      } as never,
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

// ---- Ported GoIceTravel journey: variants, dependants, add-ons, pickup (MOCKED) ----
// In-process contract tests of POST /api/booking/tourdesk/checkout against synthetic
// provider responses: server-side re-validation of everything the browser sends.
const rcat = (
  id: string,
  title: string,
  price: number,
  extra: object = {},
) => ({
  priceCategoryId: id,
  title,
  price,
  occupancy: 1,
  pickupPrice: 5,
  availabilityCount: null,
  isDefault: false,
  isDependant: false,
  ...extra,
});
const variantBase = {
  available: true,
  deleted: false,
  pricedPerPerson: true,
  bookingPrice: null,
  minPerBooking: 1,
  maxPerBooking: 0,
  pickupService: true,
  mandatoryPickup: false,
};
const richVariants = [
  {
    ...variantBase,
    activityVariantId: "v-cruise",
    title: "Evening cruise",
    pricePerCategories: [
      rcat("101", "Adults", 40, { isDefault: true }),
      rcat("102", "Children", 20, {
        isDependant: true,
        maximumParticipants: 4,
      }),
    ],
    bookableExtraPrices: [
      {
        bookableExtraId: "4001",
        title: "Dinner",
        information: null,
        pricingType: 1,
        price: 0,
        pricedPerCategory: true,
        limitByPax: true,
        maxPerBooking: 4,
        unlimitedAvailability: false,
        availabilityCount: 4,
        priceCategories: [
          {
            title: "Adult dinner",
            formattedPrice: null,
            priceCategoryId: "101",
            priceCategoryTypeId: 1,
            price: 25,
            availabilityCount: null,
          },
          {
            title: "Child dinner",
            formattedPrice: null,
            priceCategoryId: "102",
            priceCategoryTypeId: 2,
            price: 12,
            availabilityCount: null,
          },
        ],
      },
      {
        bookableExtraId: "4002",
        title: "Audio guide",
        information: null,
        pricingType: 1,
        price: 5,
        pricedPerCategory: false,
        limitByPax: false,
        maxPerBooking: 2,
        unlimitedAvailability: true,
        availabilityCount: 0,
        priceCategories: [],
      },
    ],
  },
  {
    ...variantBase,
    activityVariantId: "v-premium",
    title: "Premium (pickup required)",
    mandatoryPickup: true,
    pricePerCategories: [
      rcat("101", "Adults", 60, { isDefault: true, pickupPrice: 8 }),
    ],
    bookableExtraPrices: [],
  },
  {
    ...variantBase,
    activityVariantId: "v-nopickup",
    title: "Self-guided (no pickup)",
    pickupService: false,
    pricePerCategories: [rcat("101", "Adults", 30, { isDefault: true })],
    bookableExtraPrices: [],
  },
];
const richSlot = {
  ...slot,
  availabilityCount: 8,
  pricePerCategories: null,
  variants: richVariants,
} as unknown as TourAvailabilitySlot;
const rich = (over: Record<string, unknown> = {}) => ({
  id: "12-2",
  date,
  slotId,
  variantId: "v-cruise",
  pickup: false,
  participants: [
    { categoryId: "101", quantity: 2 },
    { categoryId: "102", quantity: 1 },
  ],
  extras: [
    {
      extraId: "4001",
      quantity: 2,
      priceCategories: [{ priceCategoryId: "101", quantity: 2 }],
    },
    { extraId: "4002", quantity: 1, priceCategories: [] },
  ],
  quotedTotal: 155, // 2 x 40 + 1 x 20 + 2 x 25 + 5
  currency: "EUR",
  ...over,
});
const withRich = (
  run: (calls: { url: string; init: RequestInit }[]) => Promise<void>,
  o = {},
) => mocked(run, { slots: [richSlot], ...o });
const bookingCalls = (calls: { url: string; init: RequestInit }[]) =>
  calls.filter((c) => c.url.includes("/TourBooking/"));

test("MOCKED: extras, variant and categories are re-validated and sent as flat TourBooking rows", async () =>
  withRich(async (calls) => {
    const r = await checkout(request(rich()));
    expect(r.status).toBe(200);
    const post = bookingCalls(calls);
    expect(post).toHaveLength(1);
    const sent = JSON.parse(String(post[0].init.body));
    expect(sent.variantId).toBe("v-cruise");
    expect(sent.priceCategories).toEqual([
      { priceCategoryId: "101", quantity: 2 },
      { priceCategoryId: "102", quantity: 1 },
    ]);
    expect(sent.bookableExtras).toEqual([
      { bookableExtraId: "4001", priceCategoryId: "101", quantity: 2 },
      { bookableExtraId: "4002", priceCategoryId: null, quantity: 1 },
    ]);
    expect(post[0].init.cache).toBe("no-store");
    // availability was re-read uncached before the order
    expect(
      calls.find((c) => c.url.includes("/TourAvailability/"))!.init.cache,
    ).toBe("no-store");
  }));

test("MOCKED: forged or stale add-ons never reach TourBooking", async () =>
  withRich(async (calls) => {
    const bad = [
      // extra the variant does not offer
      rich({ extras: [{ extraId: "9999", quantity: 1, priceCategories: [] }] }),
      // category the extra does not price
      rich({
        extras: [
          {
            extraId: "4001",
            quantity: 1,
            priceCategories: [{ priceCategoryId: "555", quantity: 1 }],
          },
        ],
      }),
      // limitByPax: more dinners for adults than adults travelling
      rich({
        extras: [
          {
            extraId: "4001",
            quantity: 3,
            priceCategories: [{ priceCategoryId: "101", quantity: 3 }],
          },
        ],
        quotedTotal: 155,
      }),
      // flat extra above its per-booking maximum
      rich({ extras: [{ extraId: "4002", quantity: 3, priceCategories: [] }] }),
      // quantity does not match the category rows
      rich({
        extras: [
          {
            extraId: "4001",
            quantity: 5,
            priceCategories: [{ priceCategoryId: "101", quantity: 2 }],
          },
        ],
      }),
    ];
    for (const b of bad)
      expect(
        (await checkout(request(b))).status,
        JSON.stringify(b.extras),
      ).toBe(409);
    expect(bookingCalls(calls)).toHaveLength(0);
  }));

test("MOCKED: malformed add-on payloads are rejected as 400 before any provider request", async () =>
  withRich(async (calls) => {
    const bad = [
      rich({ extras: "nope" }),
      rich({ extras: [{ extraId: "abc", quantity: 1, priceCategories: [] }] }),
      rich({ extras: [{ extraId: "4002", quantity: 0, priceCategories: [] }] }),
      rich({
        extras: [
          { extraId: "4002", quantity: 1, priceCategories: [] },
          { extraId: "4002", quantity: 1, priceCategories: [] },
        ],
      }),
      rich({
        extras: Array.from({ length: 21 }, (_, i) => ({
          extraId: String(i + 1),
          quantity: 1,
          priceCategories: [],
        })),
      }),
    ];
    for (const b of bad) expect((await checkout(request(b))).status).toBe(400);
    expect(calls).toHaveLength(0);
  }));

test("MOCKED: the quoted total must include add-ons and pickup (price drift is refused)", async () =>
  withRich(async (calls) => {
    expect((await checkout(request(rich({ quotedTotal: 100 })))).status).toBe(
      409,
    ); // add-ons omitted
    expect(
      (await checkout(request(rich({ quotedTotal: 155, pickup: true }))))
        .status,
    ).toBe(409); // pickup 3 x 5 missing
    expect(
      (await checkout(request(rich({ quotedTotal: 170, pickup: true }))))
        .status,
    ).toBe(200);
    expect(bookingCalls(calls)).toHaveLength(1);
  }));

test("MOCKED: dependants need an adult, categories must exist, mandatory pickup is enforced", async () =>
  withRich(async (calls) => {
    const childrenOnly = rich({
      participants: [{ categoryId: "102", quantity: 2 }],
      extras: undefined,
      quotedTotal: 40,
    });
    expect((await checkout(request(childrenOnly))).status).toBe(409);
    const unknownCategory = rich({
      participants: [{ categoryId: "777", quantity: 1 }],
      extras: undefined,
      quotedTotal: 0,
    });
    expect((await checkout(request(unknownCategory))).status).toBe(409);
    const premium = (over: object) =>
      rich({
        variantId: "v-premium",
        participants: [{ categoryId: "101", quantity: 1 }],
        extras: undefined,
        ...over,
      });
    expect(
      (await checkout(request(premium({ pickup: false, quotedTotal: 60 }))))
        .status,
    ).toBe(409); // pickup required
    expect(
      (await checkout(request(premium({ pickup: true, quotedTotal: 68 }))))
        .status,
    ).toBe(200); // 60 + 8
    const noPickup = rich({
      variantId: "v-nopickup",
      participants: [{ categoryId: "101", quantity: 1 }],
      extras: undefined,
      pickup: true,
      quotedTotal: 30,
    });
    expect((await checkout(request(noPickup))).status).toBe(409); // pickup not offered
    expect((await checkout(request(rich({ variantId: null })))).status).toBe(
      409,
    ); // option required
    expect(
      (await checkout(request(rich({ variantId: "v-ghost" })))).status,
    ).toBe(409);
    expect(bookingCalls(calls)).toHaveLength(1);
  }));

test("MOCKED: an unconfirmed TourBooking with add-ons is ORDER_STATUS_UNKNOWN and is sent exactly once", async () =>
  withRich(
    async (calls) => {
      const r = await checkout(request(rich()));
      expect(r.status).toBe(503);
      const body = await r.json();
      expect(body.code).toBe("ORDER_STATUS_UNKNOWN");
      expect(body.reconciliationRequired).toBe(true);
      expect(typeof body.diagnosticId).toBe("string");
      expect(body.error).not.toMatch(/try again/i);
      expect(bookingCalls(calls)).toHaveLength(1); // never retried automatically
    },
    { bookingStatus: 503 },
  ));

test("MOCKED: extras are priced from live data only (GoIceTravel formula, per category or flat)", () => {
  const v = richVariants[0] as unknown as TourAvailabilityVariant;
  const sel = [
    {
      extraId: "4001",
      quantity: 3,
      priceCategories: [
        { priceCategoryId: "101", quantity: 2 },
        { priceCategoryId: "102", quantity: 1 },
      ],
    },
    { extraId: "4002", quantity: 2, priceCategories: [] },
  ];
  expect(extrasTotal(variantExtras(v), sel)).toBe(2 * 25 + 12 + 2 * 5);
  expect(extrasTotal(variantExtras(v), undefined)).toBe(0);
  expect(extrasToPayload(sel)).toEqual([
    { bookableExtraId: "4001", priceCategoryId: "101", quantity: 2 },
    { bookableExtraId: "4001", priceCategoryId: "102", quantity: 1 },
    { bookableExtraId: "4002", priceCategoryId: null, quantity: 2 },
  ]);
});

test("the per-address rate limit still applies: the 31st request from one client in a minute is refused", async () =>
  mocked(async (calls) => {
    const same = () =>
      new Request("https://gotobudapest.vercel.app/api/booking/tourdesk/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "https://gotobudapest.vercel.app",
        },
        body: JSON.stringify({ not: "a valid selection" }),
      });
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) statuses.push((await checkout(same())).status);
    expect(statuses.slice(0, 30).every((s) => s === 400)).toBe(true);
    expect(statuses[30]).toBe(429);
    expect(calls).toHaveLength(0); // rejected before any provider request
  }));
