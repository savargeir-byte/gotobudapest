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
import { viatorBaseUrl, viatorDestinationId } from "../budapest-offers";
import type { Tour } from "../tourdesk/types";
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
) {
  const key = process.env.TOURDESK_API_KEY?.trim();
  return providerFetch(
    "https://api.tourdesk.io/api/v1.0" + path,
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
  );
}
export function viatorRequest(
  path: string,
  init: RequestInit = {},
  cacheSeconds = 0,
) {
  const key = process.env.VIATOR_API_KEY?.trim();
  return providerFetch(
    viatorBaseUrl() + path,
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
    const hosts = [
      "tourdesk.is",
      "tourdesk.io",
      "tourdesk.com",
      ...(process.env.TOURDESK_ALLOWED_BOOKING_HOSTS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ];
    const url = https(t.tourUrl, hosts);
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
    // Same affiliate handoff as IcelandTripGuide: no target-lander=NONE and no invented URL parameters.
    const r = record(await viatorRequest(`/products/${id}`, {}, 900));
    const destination = await viatorDestinationId(
      process.env.VIATOR_API_KEY || "",
    );
    if (
      !destination ||
      !array(r.destinations).some((d) => String(record(d).ref) === destination)
    )
      throw new ProviderError(404, "Budapest product not found");
    const url = https(r.productUrl, ["viator.com"]);
    if (!url || !r.title) throw new ProviderError(502);
    const p = record(r.pricingInfo);
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
      currency: "EUR",
      ageBands: bands,
      included: array(r.inclusions)
        .map((x) => plain(record(x).otherDescription || record(x).description))
        .filter(Boolean)
        .join(" · "),
      cancellation: plain(record(r.cancellationPolicy).description),
    };
  }
  throw new ProviderError(404, "Product not found");
}
