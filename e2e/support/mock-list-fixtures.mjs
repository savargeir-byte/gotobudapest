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
function row(code, title, description, tags, dur, price, rating, reviews, flags) {
  return {
    productCode: code,
    title,
    description,
    tags,
    productUrl: viatorUrl(code, title),
    images: [
      { isCover: true, variants: [{ url: `https://media.example.com/v/${code}-small.jpg`, width: 200 }, { url: `https://media.example.com/v/${code}-large.jpg`, width: 800 }] },
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
  const title = i === 0 ? DUP_TITLE : `${TTYPES[(i - 1) % 6].title} ${Math.floor((i - 1) / 6) + 1}`;
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

export const tokensOf = (term) =>
  String(term || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && t !== "budapest");
export const matchesAll = (tokens, ...texts) => {
  const hay = texts.join(" ").toLowerCase();
  return tokens.every((t) => hay.includes(t));
};
