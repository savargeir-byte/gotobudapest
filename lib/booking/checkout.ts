// TourDesk checkout safeguards.
//
// PORTED from goTene (read-only reference, commit 5097540):
//   src/lib/providers/tourdesk/booking.ts   isTourdeskHost, isValidCheckoutUrl,
//                                           parseOrderId, CheckoutFailure,
//                                           classifyCheckoutFailure, BookingError
//   src/lib/providers/tourdesk/client.ts    BOOKING_TIMEOUT_MS (20 s for the POST)
// ADAPTED for Budapest: ProviderError/upstreamStatus instead of TourdeskApiError, no
// "support" contact (the site has none: the traveller is pointed to TourDesk), the
// extra-host variable is TOURDESK_ALLOWED_BOOKING_HOSTS, and a URL with an explicit
// port is rejected as well.
import { ProviderError } from "./common";

/** POST /TourBooking may create an unpaid order, so it gets room to answer; reads keep 12 s. */
export const TOURDESK_BOOKING_TIMEOUT_MS = 20_000;

type Env = Record<string, string | undefined>;

/**
 * Trust model (goTene): any host under TourDesk's own registrable domain
 * `tourdesk.is` is a TourDesk-controlled checkout/portal host (the shared
 * `checkout.tourdesk.is` and per-reseller portals whose slug varies by account).
 * `checkout.tourdesk.is.evil.example` and `eviltourdesk.is` are NOT under that domain.
 */
export function isTourdeskHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "tourdesk.is" || h.endsWith(".tourdesk.is");
}

function extraHosts(env: Env): Set<string> {
  return new Set(
    (env.TOURDESK_ALLOWED_BOOKING_HOSTS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)),
  );
}

/**
 * Validate a provider-returned URL: https only, no credentials, no explicit port, and
 * a TourDesk host (or a reviewed extra host from TOURDESK_ALLOWED_BOOKING_HOSTS).
 * Used for the checkoutUrl and for product/booking URLs.
 */
export function isValidCheckoutUrl(
  url: string | null | undefined,
  env: Env = process.env,
): url is string {
  if (!url || url.length > 4096) return false;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      parsed.port !== ""
    )
      return false;
    const host = parsed.hostname.toLowerCase();
    return isTourdeskHost(host) || extraHosts(env).has(host);
  } catch {
    return false;
  }
}

/** The URL itself when valid (goTene safeTourdeskUrl), otherwise undefined. */
export function safeTourdeskUrl(
  url: unknown,
  env: Env = process.env,
): string | undefined {
  return typeof url === "string" && isValidCheckoutUrl(url, env) ? url : undefined;
}

/**
 * Order id from a checkout URL path, e.g.
 * https://checkout.tourdesk.is/HandleOrder/Info/743714/e134107 -> "743714".
 * Logged server-side for correlation only.
 */
export function parseOrderId(url: string): string | null {
  try {
    const m = new URL(url).pathname.match(/\/HandleOrder\/Info\/(\d+)\//);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** A definite answer from TourDesk that no order was created, or a checkout we cannot use. */
export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly code: "TOURDESK_REJECTED" | "INVALID_CHECKOUT_URL",
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/**
 * What the traveller needs to know after POST /TourBooking failed.
 *   orderMayExist=false: TourDesk gave a DEFINITE refusal (success:false, HTTP 4xx).
 *     No order exists; the traveller may adjust the selection and try again.
 *   orderMayExist=true: the request may have reached TourDesk and created an unpaid
 *     order (network error, timeout, HTTP 5xx, unreadable 2xx body, or success:true
 *     with an unusable checkout URL). Never retried automatically; the UI blocks
 *     resubmission and points to the provider.
 */
export interface CheckoutFailure {
  status: 409 | 503;
  code:
    | "PROVIDER_REJECTED"
    | "PROVIDER_AUTH_FAILED"
    | "PROVIDER_RATE_LIMITED"
    | "ORDER_STATUS_UNKNOWN";
  message: string;
  orderMayExist: boolean;
}

const ORDER_STATUS_UNKNOWN: CheckoutFailure = {
  status: 503,
  code: "ORDER_STATUS_UNKNOWN",
  message:
    "We could not confirm whether TourDesk created your checkout. Please do not book again from this page. Open TourDesk to check for an existing booking or to continue there.",
  orderMayExist: true,
};

export function classifyCheckoutFailure(err: unknown): CheckoutFailure {
  if (err instanceof CheckoutError && err.code === "TOURDESK_REJECTED") {
    return {
      status: 409,
      code: "PROVIDER_REJECTED",
      message: `TourDesk couldn't accept this booking: ${err.message.slice(0, 200).replace(/[.\s]+$/, "")}. No booking was made. Please adjust your selection and try again.`,
      orderMayExist: false,
    };
  }
  const upstream = err instanceof ProviderError ? err.upstreamStatus : undefined;
  if (upstream !== undefined && upstream >= 400 && upstream < 500) {
    if (upstream === 401 || upstream === 403) {
      return {
        status: 503,
        code: "PROVIDER_AUTH_FAILED",
        message: "Online booking is temporarily unavailable. No booking was made.",
        orderMayExist: false,
      };
    }
    if (upstream === 429) {
      return {
        status: 503,
        code: "PROVIDER_RATE_LIMITED",
        message:
          "The booking system is busy. No booking was made. Please try again in a minute.",
        orderMayExist: false,
      };
    }
    return {
      status: 409,
      code: "PROVIDER_REJECTED",
      message:
        "TourDesk couldn't accept this selection. No booking was made. Please review your selection and try again.",
      orderMayExist: false,
    };
  }
  // INVALID_CHECKOUT_URL (order created, URL unusable), 5xx, network, timeout, bad JSON.
  return ORDER_STATUS_UNKNOWN;
}
