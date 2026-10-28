// Viator product detail (GET /products/{productCode}) -> plain display model.
//
// PORTED from IcelandTripGuide (read-only reference, commit d3f92c4):
//   src/lib/viator/types.ts      field names of the detail response
//   src/lib/viator/utils.ts      getCoverImage / getImageUrl / getLargestImageUrl / formatDuration
//   src/lib/viator/products.ts   isFreeCancellation (STANDARD policy, or a 100% refund tier
//                                that starts at most 1 day before the experience)
// ADAPTED: defensive parsing of untrusted JSON (every value is type-checked, URLs must be https),
// text is stripped of markup, image variants become a srcset. Nothing is invented: a section the
// API did not return is simply absent from the result.
import { array, https, plain, record, text } from "./common";

export type ViatorImage = {
  alt: string;
  caption?: string;
  credit?: string;
  small: string;
  large: string;
  srcSet: string;
  width: number;
  isCover: boolean;
};
export type ViatorLogisticsPoint = { description: string; location?: string };
export type ViatorItineraryItem = {
  text: string;
  minutes?: number;
  passBy?: boolean;
  admission?: "YES" | "NO";
};
export type ViatorDetail = {
  images: ViatorImage[];
  paragraphs: string[];
  highlights: string[];
  rating?: { value: number; count: number };
  durationLabel?: string;
  durationMinutes?: number;
  inclusions: string[];
  exclusions: string[];
  additionalInfo: { label: string; text: string }[];
  logistics: { start: ViatorLogisticsPoint[]; end: ViatorLogisticsPoint[] };
  itinerary?: {
    kind: string;
    privateTour?: boolean;
    skipTheLine?: boolean;
    activity?: string;
    days: { title?: string; items: ViatorItineraryItem[] }[];
  };
  options: {
    code: string;
    title: string;
    description?: string;
    languages: string[];
  }[];
  languages: string[];
  cancellation?: {
    description: string;
    free: boolean;
    badWeather?: boolean;
    tiers: { fromDays?: number; toDays?: number; percent: number }[];
  };
  requirements: {
    min?: number;
    max?: number;
    adultRequired?: boolean;
  };
  confirmation?: "INSTANT" | "MANUAL" | "INSTANT_THEN_MANUAL";
  supplier?: string;
};

// Retail price of an /availability/check price container. The reference (IcelandTripGuide) reads
// `special` then `original` then a flat value; Viator's published schema also nests these under
// `price`. Live responses for a Budapest product carried times but no price in the first shape, so
// both are accepted. Nothing is invented: no recognised retail price means no price.
export function retailPrice(container: Record<string, unknown>): number | undefined {
  const nested = record(container.price);
  const amount =
    record(container.special).recommendedRetailPrice ??
    record(container.original).recommendedRetailPrice ??
    record(nested.special).recommendedRetailPrice ??
    record(nested.original).recommendedRetailPrice ??
    container.recommendedRetailPrice;
  return typeof amount === "number" && Number.isFinite(amount) && amount >= 0 ? amount : undefined;
}

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

const ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", apos: "'", "#39": "'" };

// Paragraphs keep their breaks; every tag and entity is removed (React escapes the rest).
export function paragraphsOf(value: unknown): string[] {
  return text(value)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, " ")
    // One pass, so decoded text is never decoded again ("&amp;lt;" stays "&lt;").
    .replace(/&(nbsp|amp|lt|gt|apos|#39);/gi, (_m, name: string) => ENTITIES[name.toLowerCase()])
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .slice(0, 40);
}

function minutesText(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h >= 24 && r === 0) return `${h / 24} day${h / 24 > 1 ? "s" : ""}`;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export function durationOf(raw: unknown): { label?: string; minutes?: number } {
  const d = record(raw);
  const fixed = num(d.fixedDurationInMinutes);
  if (fixed) return { label: minutesText(fixed), minutes: fixed };
  const from = num(d.variableDurationFromMinutes);
  const to = num(d.variableDurationToMinutes);
  if (from && to) return { label: `${minutesText(from)}–${minutesText(to)}`, minutes: from };
  if (from) return { label: `${minutesText(from)}+`, minutes: from };
  return {};
}

function imageOf(raw: unknown, title: string, index: number): ViatorImage | undefined {
  const i = record(raw);
  const variants = array(i.variants)
    .map(record)
    .map((v) => ({ url: https(v.url), width: num(v.width) ?? 0 }))
    .filter((v): v is { url: string; width: number } => Boolean(v.url))
    .sort((a, b) => a.width - b.width);
  if (!variants.length) return undefined;
  const closest = (target: number) =>
    [...variants].sort(
      (a, b) => Math.abs(a.width - target) - Math.abs(b.width - target),
    )[0];
  const large = variants[variants.length - 1];
  const small = closest(480);
  const caption = plain(i.caption) || undefined;
  const credit = plain(i.imageSource) || undefined;
  return {
    alt: caption || `${title} — photo ${index + 1}`,
    caption,
    credit: credit && credit.toLowerCase() !== "supplier" ? credit : undefined,
    small: small.url,
    large: large.url,
    srcSet: variants
      .filter((v) => v.width > 0)
      .map((v) => `${v.url} ${v.width}w`)
      .join(", "),
    width: large.width,
    isCover: i.isCover === true,
  };
}

// "Free cancellation" in Viator's sense (IcelandTripGuide products.ts): a full refund when
// cancelling at least 24 hours ahead. A full refund only 7+ days ahead is NOT free cancellation.
export function isFreeCancellation(policy: Record<string, unknown>): boolean {
  if (policy.type === "STANDARD") return true;
  return array(policy.refundEligibility)
    .map(record)
    .some(
      (r) =>
        num(r.percentageRefundable) === 100 &&
        (num(r.dayRangeMin) ?? Number.POSITIVE_INFINITY) <= 1,
    );
}

const list = (v: unknown, pick: (x: Record<string, unknown>) => unknown) =>
  array(v)
    .map(record)
    .map((x) => plain(pick(x)))
    .filter(Boolean)
    .slice(0, 40);

const point = (v: unknown): ViatorLogisticsPoint[] =>
  array(v)
    .map(record)
    .flatMap((x) => {
      const description = plain(x.description);
      const location = plain(record(x.location).name) || undefined;
      return description || location
        ? [{ description: description || location!, location: description ? location : undefined }]
        : [];
    })
    .slice(0, 10);

const ADDITIONAL_LABEL: Record<string, string> = {
  STANDARD: "Good to know",
  ACCESSIBILITY: "Accessibility",
  HEALTH_AND_FITNESS: "Health and fitness",
  CONFIRMATION: "Confirmation",
  PRICE: "Pricing",
  DRESS_CODE: "What to wear",
  MEETING_POINT: "Meeting point",
  WEATHER: "Weather",
};
const label = (type: string) =>
  ADDITIONAL_LABEL[type] ??
  (type ? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ") : "Good to know");

export function parseViatorDetail(r: Record<string, unknown>): ViatorDetail {
  const title = plain(r.title);
  const images = array(r.images)
    .map((x, i) => imageOf(x, title, i))
    .filter((x): x is ViatorImage => Boolean(x))
    .sort((a, b) => Number(b.isCover) - Number(a.isCover))
    .slice(0, 12)
    // Uncaptioned photos are numbered in the order they are shown.
    .map((im, i) => (im.caption ? im : { ...im, alt: `${title} — photo ${i + 1}` }));

  const reviews = record(r.reviews);
  const ratingValue = num(reviews.combinedAverageRating);
  const ratingCount = num(reviews.totalReviews);
  const rating =
    ratingValue && ratingValue > 0 && ratingCount && ratingCount > 0
      ? { value: Math.min(5, ratingValue), count: ratingCount }
      : undefined;

  const dur = durationOf(r.duration ?? record(r.itinerary).duration);

  const it = record(r.itinerary);
  const days = array(it.days)
    .map(record)
    .map((d) => ({
      title: plain(d.title) || undefined,
      items: array(d.items)
        .map(record)
        .flatMap((i): ViatorItineraryItem[] => {
          const t = plain(i.description);
          if (!t) return [];
          const admission = i.admissionIncluded;
          return [
            {
              text: t,
              minutes: num(record(i.duration).fixedDurationInMinutes),
              passBy: i.passByWithoutStopping === true || undefined,
              admission: admission === "YES" || admission === "NO" ? admission : undefined,
            },
          ];
        })
        .slice(0, 30),
    }))
    .filter((d) => d.items.length || d.title)
    .slice(0, 14);
  const activity = plain(record(it.activityInfo).description) || undefined;
  const itinerary =
    days.length || activity
      ? {
          kind: text(it.itineraryType),
          privateTour: it.privateTour === true || undefined,
          skipTheLine: it.skipTheLine === true || undefined,
          activity,
          days,
        }
      : undefined;

  const guide = (x: unknown) => {
    const g = record(x);
    const language = plain(g.language).toUpperCase();
    const kind = text(g.type);
    return language
      ? `${language}${kind === "AUDIO" ? " (audio)" : kind === "WRITTEN" ? " (written)" : ""}`
      : "";
  };
  const languages = [
    ...new Set(array(r.languageGuides).map(guide).filter(Boolean)),
  ].slice(0, 12);

  const options = array(r.productOptions)
    .map(record)
    .flatMap((o) => {
      const code = text(o.productOptionCode);
      if (!/^[A-Za-z0-9_-]{1,50}$/.test(code)) return [];
      return [
        {
          code,
          title: plain(o.title) || code,
          description: plain(o.description) || undefined,
          languages: [...new Set(array(o.languageGuides).map(guide).filter(Boolean))].slice(0, 8),
        },
      ];
    })
    .slice(0, 20);

  const policy = record(r.cancellationPolicy);
  const policyText = plain(policy.description);
  const tiers = array(policy.refundEligibility)
    .map(record)
    .flatMap((t) => {
      const percent = num(t.percentageRefundable);
      return percent === undefined
        ? []
        : [{ fromDays: num(t.dayRangeMin), toDays: num(t.dayRangeMax), percent }];
    })
    .slice(0, 8);
  const cancellation =
    policyText || tiers.length || policy.type
      ? {
          description: policyText,
          free: isFreeCancellation(policy),
          badWeather: policy.cancelIfBadWeather === true || undefined,
          tiers,
        }
      : undefined;

  const req = record(r.bookingRequirements);
  const confirmation = text(r.confirmationType);

  return {
    images,
    paragraphs: paragraphsOf(r.description),
    highlights: array(r.highlights)
      .map((h) => plain(h))
      .filter(Boolean)
      .slice(0, 12),
    rating,
    durationLabel: dur.label,
    durationMinutes: dur.minutes,
    inclusions: list(r.inclusions, (x) => x.otherDescription || x.description || x.typeDescription),
    exclusions: list(r.exclusions, (x) => x.otherDescription || x.description || x.typeDescription),
    additionalInfo: array(r.additionalInfo)
      .map(record)
      .flatMap((a) => {
        const t = plain(a.description);
        return t ? [{ label: label(text(a.type)), text: t }] : [];
      })
      .slice(0, 12),
    logistics: {
      start: point(record(r.logistics).start),
      end: point(record(r.logistics).end),
    },
    itinerary,
    options,
    languages,
    cancellation,
    requirements: {
      min: num(req.minTravelersPerBooking),
      max: num(req.maxTravelersPerBooking),
      adultRequired: req.requiresAdultForBooking === true || undefined,
    },
    confirmation:
      confirmation === "INSTANT" ||
      confirmation === "MANUAL" ||
      confirmation === "INSTANT_THEN_MANUAL"
        ? confirmation
        : undefined,
    supplier: plain(record(r.supplier).name) || undefined,
  };
}
