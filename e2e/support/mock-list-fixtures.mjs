// Deterministic LIST fixtures for the marketplace mock (synthetic data only).
// Used by e2e/support/mock-provider.mjs. Nothing here is a real product.

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const DUP_TITLE = "Budapest Danube River Cruise"; // plain title present at all three providers

// ------------------------------------------------------------------- Viator
const VTYPES = [
  { cat: "cruises", tag: 111, title: "Danube Evening Cruise with Drinks", dur: 90, price: 24 },
  { cat: "baths", tag: 12, title: "Thermal Bath Entry with Spa Access", dur: 240, price: 38 },
  { cat: "walking", tag: 13, title: "Highlights Walking Tour", dur: 150, price: 18 },
  { cat: "food", tag: 14, title: "Hungarian Food and Wine Tasting", dur: 180, price: 55 },
  { cat: "tickets", tag: 15, title: "Parliament Building Tickets", dur: 60, price: 30 },
  { cat: "daytrips", tag: 16, title: "Szentendre Day Trip from Budapest", dur: 480, price: 75 },
  { cat: "transfers", tag: 17, title: "Airport Shuttle Service", dur: 45, price: 20 },
];

export const VIATOR_TAGS = [
  { tagId: 11, allNamesByLocale: { "en-US": "Cruises" }, parentTagIds: [] },
  { tagId: 111, allNamesByLocale: { "en-US": "Day Cruises" }, parentTagIds: [11] },
  { tagId: 12, allNamesByLocale: { "en-US": "Spa & Thermal Baths" }, parentTagIds: [] },
  { tagId: 13, allNamesByLocale: { "en-US": "Walking Tours" }, parentTagIds: [] },
  { tagId: 14, allNamesByLocale: { "en-US": "Food, Wine & Tastings" }, parentTagIds: [] },
  { tagId: 15, allNamesByLocale: { "en-US": "Skip-the-Line Tickets" }, parentTagIds: [] },
  { tagId: 16, allNamesByLocale: { "en-US": "Day Trips" }, parentTagIds: [] },
  { tagId: 17, allNamesByLocale: { "en-US": "Airport Transfers" }, parentTagIds: [] },
];

export const viatorUrl = (code, title) =>
  `https://www.viator.com/tours/Budapest/${slug(title)}/d684-${code}?pid=P00MOCK&mcid=42383&medium=api&campaign=gotobudapest&api_version=2.0`;

function viatorRow(i) {
  if (i === 0) {
    return row("VDUP01", DUP_TITLE, "A relaxed river cruise past the Parliament.", [111], 120, 29, 4.6, 210, []);
  }
  const t = VTYPES[(i - 1) % 7];
  const n = Math.floor((i - 1) / 7) + 1;
  const title = `${t.title} ${n}`;
  const price = i === 2 ? 3 : Math.round((t.price + i * 1.5) * 100) / 100;
  const rating = i % 6 === 5 ? null : 3.5 + ((i - 1) % 4) * 0.4;
  const flags = [];
  if (i === 3) flags.push("FREE_CANCELLATION");
  if (i % 5 === 0) flags.push("LIKELY_TO_SELL_OUT");
  return row(`VP${String(i).padStart(3, "0")}`, title, `${t.title} in Budapest, ${t.cat} experience number ${i}.`, [t.tag], t.dur + (i % 3) * 30, price, rating, 10 + i, flags);
}
// Image rendition sets (issue #11). Viator really returns several renditions per photo, including
// 100x100 thumbnails; the mock reproduces the shapes the card code has to cope with. The file name
// carries the width so the browser test can serve a PNG of exactly that size.
const vurl = (code, w) => `https://media.example.com/v/${code}-${w}.jpg`;
const vset = (code, widths) => widths.map((w) => ({ url: vurl(code, w), width: w, height: Math.round((w * 2) / 3) }));
export const VIATOR_IMAGE_CASES = {
  VP001: { kind: "full", widths: [100, 480, 720, 1080, 1600] }, // large source: card must pick by size x DPR
  VP003: { kind: "mid", widths: [100, 200, 480, 720] }, // widest 720: below 800 px at 2x, so source-limited
  VP004: { kind: "small", widths: [100, 400] }, // 400 px only: shown at natural size, never enlarged
  VP005: { kind: "thumbs", widths: [100, 200] }, // thumbnails only: no image, designed text card
};
function imageVariants(code) {
  const c = VIATOR_IMAGE_CASES[code];
  if (c) return vset(code, c.widths);
  // default (all other codes): the original 200 px + 800 px pair
  return [{ url: `https://media.example.com/v/${code}-small.jpg`, width: 200 }, { url: `https://media.example.com/v/${code}-large.jpg`, width: 800 }];
}
function row(code, title, description, tags, dur, price, rating, reviews, flags) {
  return {
    productCode: code,
    title,
    description,
    tags,
    productUrl: viatorUrl(code, title),
    images: [
      { isCover: true, variants: imageVariants(code) },
    ],
    destinations: [{ ref: "684" }],
    pricing: { summary: { fromPrice: price }, currency: "EUR" },
    ...(rating === null ? {} : { reviews: { combinedAverageRating: rating, totalReviews: reviews } }),
    duration: { fixedDurationInMinutes: dur },
    flags,
  };
}
export const VIATOR_ROWS = Array.from({ length: 40 }, (_, i) => viatorRow(i));

// ------------------------------------------------------------------- Tiqets
const TTYPES = [
  { title: "Basilica Entry", tag: "ticket" },
  { title: "Museum Entry", tag: "ticket" },
  { title: "Evening Sightseeing Cruise", tag: "cruise" },
  { title: "Spa Day Pass", tag: "spa" },
  { title: "Food Market Tasting", tag: "food" },
  { title: "Old Town Walking Tour", tag: "walk" },
];
export const tiqetsUrl = (id, title) =>
  `https://www.tiqets.com/en/things-to-do-in-budapest-c68199/tickets-for-${slug(title)}-p${id}/?partner=gotobudapest`;
function tiqetsRow(i) {
  const id = 5001 + i;
  // Row 1 is a real venue ticket (our credited Basilica photo is shown on its card) and row 2 names one featured
  // stop (Matthias Church); all others keep generic titles.
  const title = i === 0 ? DUP_TITLE : i === 1 ? "St. Stephen's Basilica: Entry Ticket" : i === 2 ? "Castle District Walking Tour + Matthias Church Entry" : `${TTYPES[(i - 1) % 6].title} ${Math.floor((i - 1) / 6) + 1}`;
  return {
    id,
    title,
    tagline: i === 0 ? "River cruise" : `${title} in Budapest`,
    price: i === 0 ? 27 : 12 + i,
    currency: "EUR",
    ...(i % 7 === 6 ? {} : { ratings: { average: 4 + (i % 5) * 0.2, total: 50 + i } }),
    ...(i % 3 === 0 ? { duration: "2 hours" } : i % 3 === 1 ? { duration: "90 minutes" } : {}),
    city_id: 68199,
    city_name: "Budapest",
    product_url: tiqetsUrl(id, title),
    sale_status: i % 10 === 9 ? "sold_out" : "available",
    // The Tiqets key tier returns no images, but a mock that includes one lets the
    // tests prove they are never exposed.
    images: [{ large: `https://images.example.com/t/${id}.jpg` }],
    ...(i % 4 === 0 ? { cancellation: { policy: "flexible", window: "24" } } : {}),
  };
}
export const TIQETS_ROWS = Array.from({ length: 30 }, (_, i) => tiqetsRow(i));

// ------------------------------------------------------------------ TourDesk
const DTYPES = [
  { title: "Buda Castle Private Walking Tour", dur: 180 },
  { title: "Budapest Food Market Tour", dur: 150 },
  { title: "Budapest Thermal Spa Experience", dur: 240 },
  { title: "Budapest Day Trip to Lake Balaton", dur: 480 },
];
function tourdeskRow(i) {
  const key = `${70001 + i}-1`;
  const t = DTYPES[(i - 1) % 4];
  const title = i === 0 ? DUP_TITLE : `${t.title} ${Math.floor((i - 1) / 4) + 1}`;
  const isk = i === 5;
  return {
    uniqueKey: key,
    activityId: 70001 + i,
    providerId: 1,
    title,
    description: `${title}, a Budapest experience from the mock catalogue.`,
    photoUrl: `https://media.example.com/td/${key}.jpg`,
    price: isk ? 12000 : 30 + i * 2,
    formattedPrice: isk ? "12.000 ISK" : `€${30 + i * 2}`,
    currency: isk ? "ISK" : "EUR",
    duration: i === 0 ? 120 : t.dur,
    durationFormatted: "",
    vendor: "Mock Budapest Tours",
    tourUrl: `https://checkout.tourdesk.is/budapest/${key}`,
  };
}
export const TOURDESK_ROWS = Array.from({ length: 25 }, (_, i) => tourdeskRow(i));
// A sloppy upstream: other destinations from the same account appear in results.
export const TOURDESK_FOREIGN = [
  {
    uniqueKey: "90001-1",
    activityId: 90001,
    providerId: 1,
    title: "Reykjavik Golden Circle Day Tour",
    description: "Iceland highlights",
    price: 100,
    currency: "EUR",
    duration: 480,
    tourUrl: "https://checkout.tourdesk.is/iceland/90001-1",
  },
  {
    uniqueKey: "90002-1",
    activityId: 90002,
    providerId: 1,
    title: "Tenerife Whale Watching",
    description: "Canary Islands",
    price: 60,
    currency: "EUR",
    duration: 180,
    tourUrl: "https://checkout.tourdesk.is/tenerife/90002-1",
  },
];
// Rows only returned by the geolocation scenario "geo-city": the first is admitted through its
// city field although its text names no Budapest place; the second carries no Budapest signal at
// all and must be left out (and counted) by the discovery guard.
export const TOURDESK_GEO_CITY = [
  {
    uniqueKey: "70101-1",
    activityId: 70101,
    providerId: 1,
    title: "River Bend Countryside Excursion",
    description: "A full-day countryside excursion by minibus.",
    city: "Budapest",
    price: 79,
    formattedPrice: "€79",
    currency: "EUR",
    duration: 600,
    tourUrl: "https://checkout.tourdesk.is/budapest/70101-1",
  },
  {
    uniqueKey: "70102-1",
    activityId: 70102,
    providerId: 1,
    title: "Sunset River Sightseeing",
    description: "An evening on the water.",
    price: 35,
    formattedPrice: "€35",
    currency: "EUR",
    duration: 90,
    tourUrl: "https://checkout.tourdesk.is/budapest/70102-1",
  },
];

export const tokensOf = (term) =>
  String(term || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && t !== "budapest");
export const matchesAll = (tokens, ...texts) => {
  const hay = texts.join(" ").toLowerCase();
  return tokens.every((t) => hay.includes(t));
};

// ------------------------------------------------------- Tiqets product detail + availability
// Ids 5001..5030 are the list rows above. Special ids drive the failure scenarios:
//   6001 detail 404            6002 availability 403       6003 availability empty
//   6004 availability malformed  6005 detail malformed     6006 foreign city (Reykjavik)
//   6007 minimal product (no optional fields)              6008 not on sale
//   6009 availability 404      6010 availability sales_enabled=false
const SPECIAL = new Set([6002, 6003, 6004, 6007, 6008, 6009, 6010]);
export const tiqetsKnown = (id) => (id >= 5001 && id <= 5030) || SPECIAL.has(id);

function detailBase(id) {
  const i = id - 5001;
  const base = id >= 5001 && id <= 5030 ? tiqetsRow(i) : tiqetsRow(1);
  return { ...base, id, title: id >= 5001 && id <= 5030 ? base.title : `Special Case Ticket ${id}`, product_url: tiqetsUrl(id, base.title) };
}

export function tiqetsDetail(id) {
  if (id === 6001) return { status: 404, body: { error: "mock: not found" } };
  if (id === 6005) return { status: 200, body: "{not json", raw: true };
  if (id === 6006)
    return { status: 200, body: { product: { ...detailBase(5002), id, city_id: 5, city_name: "Reykjavik", title: "Reykjavik Harbour Ticket" } } };
  if (!tiqetsKnown(id)) return { status: 404, body: { error: "mock: not found" } };
  if (id === 6007)
    return {
      status: 200,
      body: { product: { id, title: "Minimal Budapest Ticket", city_name: "Budapest", product_url: tiqetsUrl(id, "Minimal Budapest Ticket"), sale_status: "available" } },
    };
  const p = detailBase(id);
  return {
    status: 200,
    body: {
      product: {
        ...p,
        sale_status: id === 6008 ? "sold_out" : "available",
        description: "<p>Enter the landmark and explore at your own pace.</p><p>Audio guide available in several languages.</p>",
        highlights: ["Skip the ticket queue", "Panoramic views"],
        whats_included: ["Entry ticket", "Audio guide"],
        whats_excluded: "Food and drinks",
        important_information: ["Bring a photo ID", "Bags may be checked at the entrance"],
        opening_hours: "Daily 9:00-18:00 (check the supplier page for exceptions)",
        cancellation: { policy: "flexible", window: "24" },
        duration: "2 hours",
        ratings: { average: 4.6, total: 310 },
        prediscount_price: 99,
        discount_percentage: 50,
        images: [{ large: `https://images.example.com/t/${id}.jpg` }],
      },
    },
  };
}

const pad = (n) => String(n).padStart(2, "0");
const isoDay = (offset) => {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

export function tiqetsAvailability(id) {
  if (id === 6002) return { status: 403, body: { error: "mock: forbidden" } };
  if (id === 6009) return { status: 404, body: { error: "mock: not found" } };
  if (id === 6004) return { status: 200, body: "{not json", raw: true };
  if (id === 6010) return { status: 200, body: { success: true, sales_enabled: false, dates: [] } };
  if (id === 6003) return { status: 200, body: { success: true, sales_enabled: true, next_available_date: null, dates: [], variants: [] } };
  const dates = Array.from({ length: 9 }, (_, k) => ({
    date: isoDay(k + 1),
    availability: k === 2 ? 0 : 20 - k,
    price: k === 2 ? null : 20 + k,
    currency: "EUR",
    timeslots: k % 2 === 0 ? [{ time: "10:00", availability: 5 }, { time: "14:00", availability: 0 }, { time: "16:30", availability: 3 }] : [{ time: "whole_day", availability: 9 }],
  }));
  return {
    status: 200,
    body: {
      success: true,
      sales_enabled: true,
      next_available_date: isoDay(1),
      dates,
      variants: [
        { id: 11, label: "Adult", description: "Ages 18+", variant_type: "ticket" },
        { id: 12, label: "Child", description: "Ages 6-17", variant_type: "ticket" },
        { id: 13, label: "Audio guide add-on", is_addon: true },
      ],
    },
  };
}
