// Input validation for POST /api/booking/check. The route forwards to Viator
// with the server API key, so only well-formed availability checks may pass.

const PRODUCT_CODE_RE = /^[A-Za-z0-9]{3,50}$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CURRENCY_RE = /^[A-Z]{3}$/;
const AGE_BANDS = new Set([
  "ADULT",
  "CHILD",
  "YOUTH",
  "INFANT",
  "SENIOR",
  "TRAVELER",
]);
const LOCALES = new Set(["en", "es", "zh", "ja"]);
const MAX_PER_BAND = 50;
const MAX_TOTAL = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface CheckPayload {
  productCode: string;
  travelDate: string;
  currency: string;
  paxMix: { ageBand: string; numberOfTravelers: number }[];
  locale: string;
}

export function validateCheckPayload(
  body: unknown,
  now = Date.now(),
): CheckPayload | null {
  if (!body || typeof body !== "object") return null;
  const { productCode, travelDate, currency, paxMix, locale } = body as Record<
    string,
    unknown
  >;

  if (typeof productCode !== "string" || !PRODUCT_CODE_RE.test(productCode))
    return null;
  if (typeof currency !== "string" || !CURRENCY_RE.test(currency)) return null;

  if (typeof travelDate !== "string") return null;
  const m = DATE_RE.exec(travelDate);
  if (!m) return null;
  const date = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (new Date(date).toISOString().slice(0, 10) !== travelDate) return null; // e.g. 2026-02-31
  // Allow yesterday (timezones ahead of UTC) up to two years ahead.
  if (date < now - 2 * DAY_MS || date > now + 2 * 366 * DAY_MS) return null;

  if (
    !Array.isArray(paxMix) ||
    paxMix.length === 0 ||
    paxMix.length > AGE_BANDS.size
  )
    return null;
  const mix: CheckPayload["paxMix"] = [];
  const seen = new Set<string>();
  let total = 0;
  for (const entry of paxMix) {
    if (!entry || typeof entry !== "object") return null;
    const { ageBand, numberOfTravelers } = entry as Record<string, unknown>;
    if (
      typeof ageBand !== "string" ||
      !AGE_BANDS.has(ageBand) ||
      seen.has(ageBand)
    )
      return null;
    if (
      typeof numberOfTravelers !== "number" ||
      !Number.isInteger(numberOfTravelers)
    )
      return null;
    if (numberOfTravelers < 1 || numberOfTravelers > MAX_PER_BAND) return null;
    seen.add(ageBand);
    total += numberOfTravelers;
    mix.push({ ageBand, numberOfTravelers });
  }
  if (total > MAX_TOTAL) return null;

  return {
    productCode,
    travelDate,
    currency,
    paxMix: mix,
    locale: typeof locale === "string" && LOCALES.has(locale) ? locale : "en",
  };
}
