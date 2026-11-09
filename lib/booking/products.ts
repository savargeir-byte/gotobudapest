import {
  array,
  record,
  plain,
  text,
  https,
  tourdeskId,
  viatorId,
  providerFetch,
  ProviderError,
} from "./common";
import { safeTourdeskUrl } from "./checkout";
import { viatorBaseUrl, viatorDestinationId } from "../budapest-offers";
import type { Tour } from "../tourdesk/types";
import { parseViatorDetail, viatorBookable, type ViatorDetail } from "./viator-product";
export type BookingProduct = {
  provider: "TourDesk" | "Viator";
  id: string;
  title: string;
  description: string;
  photos: string[];
  bookingUrl: string;
  currency: string;
  price?: number;
  included?: string;
  cancellation?: string;
  duration?: string;
  tour?: Tour;
  // Viator only: the full API product detail (display model), absent sections omitted.
  viator?: ViatorDetail;
  ageBands?: {
    ageBand: string;
    startAge?: number;
    endAge?: number;
    minTravelersPerBooking?: number;
    maxTravelersPerBooking?: number;
  }[];
};
export function tdRequest(
  path: string,
  init: RequestInit = {},
  cacheSeconds = 0,
  timeoutMs = 12000,
) {
  const key = (process.env.TOURDESK_API_KEY_V2 || process.env.TOURDESK_API_KEY)?.trim();
  return providerFetch(
    "tourdesk",
    path,
    key,
    {
      ...init,
      headers: {
        ApiKey: key || "",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    cacheSeconds,
    false,
    timeoutMs,
  );
}
export function viatorRequest(
  path: string,
  init: RequestInit = {},
  cacheSeconds = 0,
) {
  const key = process.env.VIATOR_API_KEY?.trim();
  return providerFetch(
    "viator",
    path,
    key,
    {
      ...init,
      headers: {
        "exp-api-key": key || "",
        Accept: "application/json;version=2.0",
        "Accept-Language": "en-US",
        "Content-Type": "application/json",
      },
    },
    cacheSeconds,
    viatorBaseUrl() === "https://api.sandbox.viator.com/partner",
  );
}
export async function getBookingProduct(
  provider: string,
  id: string,
): Promise<BookingProduct> {
  if (provider === "tourdesk" && tourdeskId(id)) {
    const t = (await tdRequest(`/Tour/${id}?culture=en`, {}, 300)) as Tour;
    const city = t.location?.city || "";
    if (
      !/budapest/i.test(
        city +
          " " +
          plain(t.title) +
          " " +
          plain(t.summary) +
          " " +
          plain(t.description),
      )
    )
      throw new ProviderError(404, "Budapest product not found");
    if (!t.title || `${t.activityId}-${t.providerId}` !== id)
      throw new ProviderError(404, "Product not found");
    const url = safeTourdeskUrl(t.tourUrl);
    if (!url) throw new ProviderError(502);
    return {
      provider: "TourDesk",
      id,
      title: plain(t.title),
      description: plain(t.description || t.summary),
      photos: (t.images || [])
        .flatMap((i) => {
          const v = [...(i.versions || [])]
            .reverse()
            .map((v) => https(v.url))
            .find(Boolean);
          return v ? [v] : [];
        })
        .slice(0, 6),
      bookingUrl: url,
      currency: /^[A-Z]{3}$/.test(
        t.currencyCode || t.currency?.currencyCode || "",
      )
        ? t.currencyCode || t.currency?.currencyCode || ""
        : "",
      price: t.price,
      // Keep list structure readable once tags are stripped.
      included: plain(String(t.included || "").replace(/<\/li>\s*<li[^>]*>/gi, " · ")),
      cancellation: plain(t.activityCancellationPolicyText),
      duration: plain(t.durationFormatted),
      tour: t,
    };
  }
  if (provider === "viator" && viatorId(id)) {
    // Request Viator\'s standard direct-product page while preserving the provider-supplied affiliate URL.
    // Ask Viator to return its standard exact-product page, not the generic affiliate lander.
    // The provider creates the full commission-bearing URL; never alter it afterwards.
    // NOTE: the detail request carries no campaign-value on purpose: whether this endpoint accepts it (Viator Partner
    // Resource Center, "Affiliate Attribution" lists it) has not been confirmed against the live API, and a rejected
    // parameter would break every product page. Owner decision.
    const r = record(await viatorRequest(`/products/${id}?target-lander=NONE`, {}, 900));
    const destination = await viatorDestinationId(
      process.env.VIATOR_API_KEY || "",
    );
    // Same acceptance rule as the listing card (fails closed rather than sending a customer
    // to a Viator category/search page).
    const bookable = viatorBookable(r, id, destination);
    if (!bookable.ok) throw new ProviderError(bookable.status, bookable.message);
    const url = bookable.url;
    const p = record(r.pricingInfo);
    const listingPrice = record(record(r.pricing).summary).fromPrice;
    const listingCurrency = text(record(r.pricing).currency);
    const bands = array(p.ageBands)
      .map(record)
      .map((b) => ({
        ageBand: text(b.ageBand),
        startAge: typeof b.startAge === "number" ? b.startAge : undefined,
        endAge: typeof b.endAge === "number" ? b.endAge : undefined,
        minTravelersPerBooking:
          typeof b.minTravelersPerBooking === "number"
            ? b.minTravelersPerBooking
            : undefined,
        maxTravelersPerBooking:
          typeof b.maxTravelersPerBooking === "number"
            ? b.maxTravelersPerBooking
            : undefined,
      }))
      .filter((b) =>
        /^(ADULT|CHILD|YOUTH|INFANT|SENIOR|TRAVELER)$/.test(b.ageBand),
      );
    return {
      provider: "Viator",
      id,
      title: plain(r.title),
      description: plain(r.description),
      photos: array(r.images)
        .map(record)
        .sort((a, b) => Number(b.isCover === true) - Number(a.isCover === true))
        .flatMap((i) => {
          const v = array(i.variants)
            .map(record)
            .sort((a, b) => Number(b.width || 0) - Number(a.width || 0));
          const u = v.map((x) => https(x.url)).find(Boolean);
          return u ? [u] : [];
        })
        .slice(0, 6),
      bookingUrl: url,
      currency: /^[A-Z]{3}$/.test(listingCurrency) ? listingCurrency : "EUR",
      price: typeof listingPrice === "number" && Number.isFinite(listingPrice) && listingPrice >= 0 ? listingPrice : undefined,
      ageBands: bands,
      included: array(r.inclusions)
        .map((x) => plain(record(x).otherDescription || record(x).description))
        .filter(Boolean)
        .join(" · "),
      cancellation: plain(record(r.cancellationPolicy).description),
      viator: parseViatorDetail(r),
    };
  }
  throw new ProviderError(404, "Product not found");
}
