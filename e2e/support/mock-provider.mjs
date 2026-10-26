// Local MOCK of the TourDesk and Viator (and Tiqets) provider APIs for the
// browser-level booking tests. It is NOT a provider, makes no outbound requests,
// listens on 127.0.0.1 only and is reached through BOOKING_MOCK_ORIGIN
// (see lib/booking/test-origin.ts). Everything it returns is synthetic.
//
// Test isolation: behaviour is derived from the product id so parallel tests never
// share state.
//   TourDesk activityId   100000-199999 per-person (adult/child) pricing, pickup
//                         200000-299999 two options: per person and fixed group price
//                         300000-399999 complex (tier pricing) -> provider handoff
//                         700000-799999 foreign (Reykjavik) product -> must be refused
//   Viator productCode    VOK*   availability ok       VNONE* nothing available
//                         VERR*  availability returns 500   VFOR* foreign destination
// Per-id overrides: POST /__control/<id> with a JSON object; inspection: GET /__log/<id>.
import { createServer } from "node:http";

const port = Number(process.env.MOCK_PROVIDER_PORT || 3900);
const defaults = () => ({
  adultPrice: 40,
  childPrice: 20,
  capacity: 6,
  pickupPrice: 5,
  availabilityStatus: 200,
  bookingStatus: 200,
  malformedAvailability: false,
  noDates: false,
  allSoldOut: false,
  bookingSuccess: true,
  checkoutUrl: null,
  slow: 0,
});
const state = new Map(); // id -> overrides
const logs = new Map(); // id -> [{method, path, body}]
const transactional = []; // any request that looks like a booking/hold/reserve write
const get = (id) => {
  if (!state.has(id)) state.set(id, defaults());
  return state.get(id);
};
const note = (id, entry) => {
  if (!logs.has(id)) logs.set(id, []);
  logs.get(id).push(entry);
};

const day = (offset) =>
  new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const compact = (d) => d.replaceAll("-", "");
const slotId = (id, date, hhmm) =>
  `${compact(date)}${hhmm}00-${id.split("-")[0]}_${compact(date)}`;
const cat = (priceCategoryId, title, price, extra = {}) => ({
  priceCategoryId,
  title,
  price,
  occupancy: 1,
  pickupPrice: null,
  availabilityCount: null,
  minimumParticipants: 0,
  maximumParticipants: null,
  ageLimitFormatted: null,
  hidePrice: false,
  isDependant: false,
  exclusiveGroupId: null,
  tiers: null,
  chargePerBooking: false,
  ...extra,
});

function kindOf(id) {
  const n = Number(id.split("-")[0]);
  if (n >= 700000) return "foreign";
  if (n >= 300000) return "complex";
  if (n >= 200000) return "group";
  return "standard";
}

function tourDetail(id) {
  const [activityId, providerId] = id.split("-").map(Number);
  const k = kindOf(id);
  const foreign = k === "foreign";
  return {
    activityId,
    providerId,
    title: foreign ? "Golden Circle Day Tour" : "Budapest Danube Evening Cruise",
    summary: foreign ? "Waterfalls and geysers." : "A mocked evening cruise in Budapest.",
    description: foreign
      ? "<p>Iceland highlights.</p>"
      : "<p>Glide past the Hungarian Parliament and the Chain Bridge on a <strong>mock</strong> evening cruise in Budapest.</p>",
    included: "<ul><li>Welcome drink</li><li>Audio guide</li></ul>",
    durationFormatted: "1 hour 30 minutes",
    activityCancellationPolicyText: "Free cancellation up to 24 hours before departure (mock).",
    price: 40,
    tourUrl: `https://budapest.tourdesk.is/booking/${id}`,
    currencyCode: "EUR",
    minimumPassengers: 1,
    maximumPassengers: 0,
    pickupService: k === "standard" || k === "complex",
    mandatoryPickup: false,
    questionsBasedPickup: false,
    location: { city: foreign ? "Reykjavik" : "Budapest" },
    images: [
      { versions: [{ url: `https://media.mock-tourdesk.test/${id}/cover-640.jpg` }, { url: `https://media.mock-tourdesk.test/${id}/cover-1280.jpg` }] },
      { versions: [{ url: `https://media.mock-tourdesk.test/${id}/second-1280.jpg` }] },
    ],
  };
}

function slotsFor(id, date) {
  const s = get(id);
  const k = kindOf(id);
  const ten = slotId(id, date, "1000");
  const noon = slotId(id, date, "1200");
  const two = slotId(id, date, "1400");
  const evening = slotId(id, date, "1900");
  const base = {
    bookable: true,
    unavailable: false,
    soldOut: false,
    unlimitedAvailability: false,
    availabilityCount: s.capacity,
    minParticipants: 1,
    maxParticipants: null,
    variants: null,
    timeless: false,
  };
  const standardCats = () => [
    cat("adult", "Adults", s.adultPrice, { pickupPrice: s.pickupPrice, ageLimitFormatted: "13+" }),
    cat("child", "Children", s.childPrice, { pickupPrice: s.pickupPrice, ageLimitFormatted: "4-12", maximumParticipants: 4 }),
  ];
  const out = [];
  const withVariants = (extra) => ({ ...base, ...extra });
  if (k === "group") {
    const variants = [
      {
        activityVariantId: "v-person",
        title: "Standard seating (per person)",
        available: true,
        deleted: false,
        pricedPerPerson: true,
        bookingPrice: null,
        minPerBooking: 1,
        maxPerBooking: 0,
        pricePerCategories: [cat("adult", "Adults", s.adultPrice)],
        pickupService: false,
      },
      {
        activityVariantId: "v-group",
        title: "Private boat (fixed price, up to 6)",
        available: true,
        deleted: false,
        pricedPerPerson: false,
        bookingPrice: 200,
        minPerBooking: 1,
        maxPerBooking: 6,
        pricePerCategories: [cat("adult", "Guests", 0)],
        pickupService: false,
      },
    ];
    out.push(withVariants({ activityAvailabilityId: ten, hourFormatted: "10:00", startHour: 10, startMinute: 0, variants, pricePerCategories: null }));
    out.push(withVariants({ activityAvailabilityId: noon, hourFormatted: "12:00", startHour: 12, startMinute: 0, soldOut: true, bookable: false, pricePerCategories: null }));
    return out;
  }
  if (k === "complex") {
    out.push(withVariants({
      activityAvailabilityId: ten, hourFormatted: "10:00", startHour: 10, startMinute: 0,
      pricePerCategories: [
        cat("adult", "Adults", 50, { tiers: [{ from: 1, to: 3, price: 50 }, { from: 4, to: 10, price: 42 }] }),
      ],
    }));
    return out;
  }
  // standard
  out.push(withVariants({ activityAvailabilityId: ten, hourFormatted: "10:00", startHour: 10, startMinute: 0, pricePerCategories: standardCats() }));
  out.push(withVariants({ activityAvailabilityId: noon, hourFormatted: "12:00", startHour: 12, startMinute: 0, soldOut: true, bookable: false, pricePerCategories: standardCats() }));
  out.push(withVariants({ activityAvailabilityId: two, hourFormatted: "14:00", startHour: 14, startMinute: 0, unavailable: true, bookable: false, pricePerCategories: standardCats() }));
  out.push(withVariants({ activityAvailabilityId: evening, hourFormatted: "19:00", startHour: 19, startMinute: 0, pricePerCategories: standardCats() }));
  if (s.allSoldOut) for (const x of out) { x.soldOut = true; x.bookable = false; }
  return out;
}

function viatorProduct(code) {
  const foreign = code.startsWith("VFOR");
  const base = `https://www.viator.com/tours/${foreign ? "Reykjavik" : "Budapest"}/Mock-Danube-Cruise/d${foreign ? "999" : "684"}-${code}`;
  return {
    productCode: code,
    title: foreign ? "Whale watching from Reykjavik" : "Budapest Danube Cruise (mock)",
    description: "A mocked Viator product description for Budapest.",
    // Exact API URL including tracking parameters: the CTA must keep it byte for byte.
    productUrl: `${base}?pid=P00MOCK&mcid=42383&medium=api&medium_version=2.0&uid=U-MOCK`,
    destinations: [{ ref: foreign ? "999" : "684" }],
    images: [
      { isCover: true, variants: [{ url: `https://media.mock-viator.test/${code}/cover-480.jpg`, width: 480 }, { url: `https://media.mock-viator.test/${code}/cover-1200.jpg`, width: 1200 }] },
    ],
    inclusions: [{ otherDescription: "Welcome drink" }, { otherDescription: "Live commentary" }],
    cancellationPolicy: { description: "Free cancellation up to 24 hours before (mock)." },
    pricingInfo: {
      ageBands: [
        { ageBand: "ADULT", startAge: 13, endAge: 99, minTravelersPerBooking: 1, maxTravelersPerBooking: 10 },
        { ageBand: "CHILD", startAge: 4, endAge: 12, minTravelersPerBooking: 0, maxTravelersPerBooking: 6 },
      ],
    },
  };
}

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      try { resolve(text ? JSON.parse(text) : undefined); } catch { resolve(text); }
    });
  });
const send = (res, status, body, headers = {}) => {
  const payload = typeof body === "string" ? body : JSON.stringify(body ?? null);
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(payload);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const path = url.pathname;
  const body = req.method === "POST" || req.method === "PUT" ? await readBody(req) : undefined;

  if (path === "/__health") return send(res, 200, { ok: true });
  if (path.startsWith("/__control/") && req.method === "POST") {
    const id = decodeURIComponent(path.slice("/__control/".length));
    Object.assign(get(id), body || {});
    return send(res, 200, get(id));
  }
  if (path.startsWith("/__log/")) {
    const id = decodeURIComponent(path.slice("/__log/".length));
    return send(res, 200, logs.get(id) || []);
  }
  if (path === "/__transactional") return send(res, 200, transactional);

  // Anything resembling a booking/hold/reserve write is recorded and refused.
  if (/\/(bookings?|reserve|hold|cart|target-lander)(\/|$|\?)/i.test(path + url.search) && !path.startsWith("/__td/api/v1.0/TourBooking/")) {
    transactional.push({ method: req.method, path: path + url.search, body });
    return send(res, 418, { error: "mock refuses transactional endpoints" });
  }

  // ---------------------------------------------------------------- TourDesk
  if (path.startsWith("/__td/api/v1.0/")) {
    const rest = path.slice("/__td/api/v1.0/".length);
    let m;
    if ((m = /^Tour\/(\d+-\d+)$/.exec(rest))) {
      note(m[1], { method: req.method, path: rest });
      return send(res, 200, tourDetail(m[1]));
    }
    if ((m = /^TourAvailability\/GetAllDates\/(\d+-\d+)$/.exec(rest))) {
      const id = m[1];
      const s = get(id);
      note(id, { method: req.method, path: rest });
      if (s.availabilityStatus !== 200) return send(res, s.availabilityStatus, { error: "mock upstream failure" });
      if (s.malformedAvailability) return send(res, 200, "{not json");
      return send(res, 200, s.noDates ? [] : [`${day(2)}T00:00:00`, `${day(3)}T00:00:00`, `${day(5)}T00:00:00`]);
    }
    if ((m = /^TourAvailability\/(\d+-\d+)\/(\d{4}-\d{2}-\d{2})\/en$/.exec(rest))) {
      const [, id, date] = m;
      const s = get(id);
      note(id, { method: req.method, path: rest });
      if (s.slow) await sleep(s.slow);
      if (s.availabilityStatus !== 200) return send(res, s.availabilityStatus, { error: "mock upstream failure" });
      if (s.malformedAvailability) return send(res, 200, "{not json");
      if (kindOf(id) === "foreign") return send(res, 200, []);
      return send(res, 200, slotsFor(id, date));
    }
    if ((m = /^TourBooking\/(\d+-\d+)$/.exec(rest)) && req.method === "POST") {
      const id = m[1];
      const s = get(id);
      note(id, { method: "POST", path: rest, body });
      if (s.slow) await sleep(s.slow);
      if (s.bookingStatus !== 200) return send(res, s.bookingStatus, { error: "mock booking failure" });
      return send(res, 200, {
        success: s.bookingSuccess,
        checkoutUrl: s.checkoutUrl || `https://checkout.tourdesk.is/pay/${id}?session=mock-${Date.now()}`,
      });
    }
    return send(res, 404, { error: "mock: unknown TourDesk path " + rest });
  }

  // ------------------------------------------------------------------ Viator
  if (path.startsWith("/__viator/partner/")) {
    const rest = path.slice("/__viator/partner/".length);
    let m;
    if (rest === "destinations") return send(res, 200, { destinations: [{ destinationId: 684, name: "Budapest", type: "CITY" }, { destinationId: 999, name: "Reykjavik", type: "CITY" }] });
    if ((m = /^products\/([A-Za-z0-9]+)$/.exec(rest))) {
      note(m[1], { method: req.method, path: rest });
      return send(res, 200, viatorProduct(m[1]));
    }
    if (rest === "availability/check" && req.method === "POST") {
      const code = body?.productCode || "";
      note(code, { method: "POST", path: rest, body });
      if (code.startsWith("VERR")) return send(res, 500, { error: "mock viator failure" });
      if (code.startsWith("VNONE"))
        return send(res, 200, { currency: "EUR", bookableItems: [{ productOptionCode: "TOUR1", available: false }] });
      return send(res, 200, {
        currency: "EUR",
        bookableItems: [
          { productOptionCode: "SEATED", startTime: "19:00", available: true, totalPrice: { original: { recommendedRetailPrice: 61 }, special: { recommendedRetailPrice: 55.5 } } },
          { productOptionCode: "PREMIUM", startTime: "21:00", available: true, totalPrice: { original: { recommendedRetailPrice: 89 }, special: null } },
        ],
      });
    }
    // products/search, search/freetext: no catalogue needed for the product pages
    return send(res, 200, { products: [], totalCount: 0 });
  }

  // ------------------------------------------------------------------ Tiqets
  if (path.startsWith("/__tiqets/")) return send(res, 200, { products: [] });

  return send(res, 404, { error: "mock: not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[mock-provider] listening on http://127.0.0.1:${port} (synthetic data, no outbound requests)`);
});
