// Tiqets product detail + availability for the GoToBudapest product page.
// READ-ONLY: GET /v2/products/{id} and GET /v2/products/{id}/availability, nothing else.
// Affiliate-only: the supplier's own product_url is returned unchanged and is the final
// hand-off. No order, hold or payment endpoint is ever contacted (a unit test greps this
// module's source for such paths).
//
// PORTED from goTene src/lib/providers/tiqets/{adapter.ts getExperience/getAvailability,
// normalization.ts normalizeCancellation/normalizeAvailability, types.ts}. ADAPTED for
// Budapest: Budapest-only guard (city name), no images (the Tiqets key tier does not
// license them), only supplier-supplied text is shown, and sales_enabled/4xx/empty/
// malformed availability each have an honest state.
//
// The optional text sections (highlights, inclusions, ...) read a small whitelist of
// field names that the Tiqets Distributor API documents or goTene observed. They are
// best-effort and UNVERIFIED for this account: a section is shown only when the API
// actually returned it.
import { ProviderError } from "../../booking/common";
import { isBudapestText, label, list, object, price, safeHttps, word } from "../../budapest-offers";
import { tiqetsRequest } from "../http";
import { MARKETPLACE_CURRENCY } from "../types";
import { formatMoney, parseDurationMinutes, ttl } from "../util";

const DETAIL_TTL = 86400; // 24 h
const AVAILABILITY_TTL = 900; // 15 min
const WINDOW_DAYS = 30;

export const isTiqetsId = (id: string) => /^\d{1,12}$/.test(id);

export type TiqetsDetail = {
  id: string;
  title: string;
  tagline?: string;
  summary?: string;
  description: string[]; // paragraphs
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  importantInfo: string[];
  openingInfo?: string;
  cityName: string;
  price?: { amount: number; currency: string; label: string };
  rating?: { value: number; count: number };
  durationLabel?: string;
  durationMinutes?: number;
  cancellation?: { summary: string; free: boolean };
  onSale: boolean;
  // Exactly as supplied by Tiqets (affiliate parameters included).
  bookingUrl: string;
};

// Plain text only: markup is dropped by a character-level scan (no regex tag stripping,
// so nested/malformed fragments such as "<scr<b>ipt>" cannot survive), a small fixed set
// of entities is decoded in ONE pass, and the length is capped. The result is always
// rendered through React text nodes.
const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  "#39": "'",
  apos: "'",
  lt: "<",
  gt: ">",
};
function stripMarkup(value: string): string {
  let out = "";
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === "<") {
      // Block-level closers and <br> keep a line break; everything else is dropped.
      const rest = value.slice(i + 1, i + 8).toLowerCase() + " ";
      if (depth === 0 && /^(br|\/p|\/li|\/div)[\s/>]/.test(rest)) out += "\n";
      depth++;
    } else if (ch === ">" && depth > 0) {
      depth--;
    } else if (depth === 0) {
      out += ch;
    }
  }
  return out;
}
function plain(value: unknown, max = 1200): string {
  if (typeof value !== "string") return "";
  return stripMarkup(value.slice(0, 20000))
    .replace(/&(nbsp|amp|quot|#39|apos|lt|gt);/gi, (_m, name: string) => ENTITIES[name.toLowerCase()])
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function items(value: unknown, max = 12): string[] {
  const out: string[] = [];
  if (typeof value === "string") {
    for (const line of plain(value, 3000).split(/\n+/)) {
      const t = line.replace(/^[\s•*\-–]+/, "").trim();
      if (t) out.push(t.slice(0, 240));
    }
  } else if (Array.isArray(value)) {
    for (const v of value) {
      const t =
        typeof v === "string"
          ? plain(v, 240)
          : plain(word(object(v).text) || word(object(v).title) || word(object(v).description), 240);
      if (t) out.push(t);
    }
  }
  return out.slice(0, max);
}

const firstItems = (r: Record<string, unknown>, keys: string[]) => {
  for (const k of keys) {
    const got = items(r[k]);
    if (got.length) return got;
  }
  return [];
};

function cancellation(c: unknown): TiqetsDetail["cancellation"] {
  const o = object(c);
  const policy = word(o.policy).toLowerCase();
  const window = word(o.window);
  if (!policy && !window) return undefined;
  if (policy === "never") return { summary: "Non-refundable", free: false };
  const flexible = /flex|refund/.test(policy);
  const w = window ? (/^\d+$/.test(window) ? `${window}h` : window.slice(0, 40)) : "";
  if (w) return { summary: `Free cancellation up to ${w} before`, free: true };
  if (flexible) return { summary: "Flexible cancellation", free: true };
  return policy ? { summary: plain(word(o.policy), 120), free: false } : undefined;
}

export function mapTiqetsDetail(row: unknown, id: string): TiqetsDetail | undefined {
  const r = object(row);
  const title = word(r.title);
  // Affiliate product_url is kept unchanged and host-validated.
  const bookingUrl = safeHttps(r.product_url, ["tiqets.com"]);
  // Budapest only: another destination (or no city at all) is not served here.
  if (!isTiqetsId(id) || String(r.id) !== id || !title || !bookingUrl || !isBudapestText(word(r.city_name)))
    return undefined;
  const amount = price(r.price);
  const currency = /^[A-Z]{3}$/.test(word(r.currency)) ? word(r.currency) : MARKETPLACE_CURRENCY;
  const ratings = object(r.ratings);
  const rating =
    typeof ratings.average === "number" && ratings.average > 0 && ratings.average <= 5 &&
    typeof ratings.total === "number" && ratings.total > 0
      ? { value: Math.round(ratings.average * 10) / 10, count: Math.round(ratings.total) }
      : undefined;
  const durationLabel = plain(word(r.duration), 40) || undefined;
  const durationMinutes = parseDurationMinutes(r.duration);
  const description = plain(word(r.description), 4000)
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const opening = plain(word(r.opening_hours) || word(r.opening_times), 400);
  const tagline = label(word(r.tagline), 200) || undefined;
  const summary = label(word(r.summary), 400) || undefined;
  return {
    id,
    title: label(title, 160),
    ...(tagline ? { tagline } : {}),
    ...(summary ? { summary } : {}),
    description: description.length ? description : summary ? [summary] : [],
    highlights: firstItems(r, ["highlights"]),
    inclusions: firstItems(r, ["whats_included", "included", "inclusions"]),
    exclusions: firstItems(r, ["whats_excluded", "excluded", "exclusions"]),
    importantInfo: firstItems(r, ["important_information", "know_before_you_go", "important_info"]),
    ...(opening ? { openingInfo: opening } : {}),
    cityName: label(word(r.city_name), 60),
    ...(amount !== undefined
      ? { price: { amount, currency, label: `From ${formatMoney(amount, currency)}` } }
      : {}),
    ...(rating ? { rating } : {}),
    ...(durationLabel ? { durationLabel } : {}),
    ...(durationMinutes !== undefined ? { durationMinutes } : {}),
    ...(cancellation(r.cancellation) ? { cancellation: cancellation(r.cancellation) } : {}),
    onSale: r.sale_status === "available",
    bookingUrl,
  };
}

export type TiqetsProductResult =
  | { state: "ok"; product: TiqetsDetail }
  | { state: "not-found" }
  | { state: "error" };

export async function getTiqetsProduct(id: string): Promise<TiqetsProductResult> {
  if (!isTiqetsId(id)) return { state: "not-found" };
  try {
    const data = object(await tiqetsRequest(`/v2/products/${id}`, ttl(DETAIL_TTL)));
    const product = mapTiqetsDetail(data.product, id);
    return product ? { state: "ok", product } : { state: "not-found" };
  } catch (e) {
    if (e instanceof ProviderError && e.status === 404) return { state: "not-found" };
    return { state: "error" };
  }
}

// ------------------------------------------------------------------ availability
export type TiqetsDay = {
  date: string; // YYYY-MM-DD
  available: boolean;
  fromPrice?: { amount: number; currency: string; label: string };
  timeslots: string[]; // HH:MM with capacity (whole-day tickets have none)
};

export type TiqetsAvailability =
  | {
      state: "ok";
      days: TiqetsDay[];
      ticketTypes: { label: string; description?: string }[];
      nextAvailableDate?: string;
    }
  | { state: "empty"; nextAvailableDate?: string }
  | { state: "unavailable"; reason: "not-authorized" | "not-offered" | "sales-disabled" }
  | { state: "error" };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ymd = (d: Date) => d.toISOString().slice(0, 10);

export function mapTiqetsAvailability(data: unknown): TiqetsAvailability {
  const o = object(data);
  if (o.sales_enabled === false) return { state: "unavailable", reason: "sales-disabled" };
  const next = word(o.next_available_date);
  const nextAvailableDate = DATE.test(next) ? next : undefined;
  const days: TiqetsDay[] = [];
  for (const raw of list(o.dates)) {
    const d = object(raw);
    const date = word(d.date);
    if (!DATE.test(date)) continue;
    const capacity = typeof d.availability === "number" ? d.availability : 0;
    const amount = price(d.price);
    const currency = /^[A-Z]{3}$/.test(word(d.currency)) ? word(d.currency) : MARKETPLACE_CURRENCY;
    const timeslots = list(d.timeslots)
      .map(object)
      .filter((t) => /^\d{2}:\d{2}$/.test(word(t.time)) && typeof t.availability === "number" && t.availability > 0)
      .map((t) => word(t.time))
      .slice(0, 12);
    days.push({
      date,
      available: capacity > 0,
      ...(capacity > 0 && amount !== undefined
        ? { fromPrice: { amount, currency, label: `From ${formatMoney(amount, currency)}` } }
        : {}),
      timeslots,
    });
  }
  // Ticket types (Adult, Child, ...): display only; add-ons are excluded (goTene).
  const ticketTypes = list(o.variants)
    .map(object)
    .filter((v) => word(v.label) && v.is_addon !== true)
    .map((v) => ({
      label: label(word(v.label), 80),
      ...(word(v.description) ? { description: plain(word(v.description), 200) } : {}),
    }))
    .slice(0, 12);
  if (!days.some((d) => d.available)) return { state: "empty", ...(nextAvailableDate ? { nextAvailableDate } : {}) };
  return {
    state: "ok",
    days: days.slice(0, WINDOW_DAYS),
    ticketTypes,
    ...(nextAvailableDate ? { nextAvailableDate } : {}),
  };
}

export async function getTiqetsAvailability(id: string, today = new Date()): Promise<TiqetsAvailability> {
  if (!isTiqetsId(id)) return { state: "unavailable", reason: "not-offered" };
  const start = ymd(today);
  const end = ymd(new Date(today.getTime() + WINDOW_DAYS * 86400000));
  try {
    const data = await tiqetsRequest(
      `/v2/products/${id}/availability?start_date=${start}&end_date=${end}&currency=${MARKETPLACE_CURRENCY}`,
      ttl(AVAILABILITY_TTL),
    );
    return mapTiqetsAvailability(data);
  } catch (e) {
    const status = e instanceof ProviderError ? e.upstreamStatus ?? e.status : undefined;
    // The availability endpoint may not be enabled for this key tier or product.
    if (status === 401 || status === 403) return { state: "unavailable", reason: "not-authorized" };
    if (status === 404) return { state: "unavailable", reason: "not-offered" };
    return { state: "error" };
  }
}
