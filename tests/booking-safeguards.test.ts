import assert from "node:assert/strict";
import test from "node:test";
import { ProviderError } from "../lib/booking/common";
import {
  CheckoutError,
  classifyCheckoutFailure,
  isValidCheckoutUrl,
  parseOrderId,
  safeTourdeskUrl,
} from "../lib/booking/checkout";
import {
  isTourdeskBookingEnabledFor,
  getTourdeskPilotKeys,
} from "../lib/booking/gate";
import {
  classifyTourDeskSlotId,
  isSupportedTourDeskSlotId,
} from "../lib/tourdesk/compatibility";

// Ported test shapes from goTene (booking.test.ts / compatibility.test.ts), adapted.

test("checkout URLs: TourDesk hosts accepted, every spoof vector rejected", () => {
  for (const ok of [
    "https://checkout.tourdesk.is/HandleOrder/Info/743714/e134107",
    "https://tourdesk.is/x",
    "https://anyreseller.tourdesk.is/pay?s=1",
  ])
    assert.equal(isValidCheckoutUrl(ok, {}), true, ok);
  for (const bad of [
    "https://checkout.tourdesk.is.evil.example/pay",
    "https://eviltourdesk.is/pay",
    "https://tourdesk.is.evil.example/",
    "http://checkout.tourdesk.is/pay",
    "https://user:pw@checkout.tourdesk.is/pay",
    "https://checkout.tourdesk.is:8443/pay",
    "javascript:alert(1)",
    "//checkout.tourdesk.is/pay",
    "https://tourdesk.io/pay",
    "",
    null,
    undefined,
  ])
    assert.equal(isValidCheckoutUrl(bad as string, {}), false, String(bad));
});

test("extra hosts only come from the reviewed environment list", () => {
  assert.equal(isValidCheckoutUrl("https://pay.example-merchant.com/x", {}), false);
  assert.equal(
    isValidCheckoutUrl("https://pay.example-merchant.com/x", {
      TOURDESK_ALLOWED_BOOKING_HOSTS: "pay.example-merchant.com",
    }),
    true,
  );
  assert.equal(safeTourdeskUrl(42, {}), undefined);
});

test("order id is parsed only from the confirmed HandleOrder path", () => {
  assert.equal(parseOrderId("https://checkout.tourdesk.is/HandleOrder/Info/743714/e134107"), "743714");
  assert.equal(parseOrderId("https://checkout.tourdesk.is/other/743714/x"), null);
  assert.equal(parseOrderId("not a url"), null);
});

test("definite refusals leave no order; anything uncertain is ORDER_STATUS_UNKNOWN", () => {
  const rejected = classifyCheckoutFailure(new CheckoutError("Sold out", "TOURDESK_REJECTED"));
  assert.equal(rejected.code, "PROVIDER_REJECTED");
  assert.equal(rejected.orderMayExist, false);
  assert.equal(rejected.status, 409);

  const http400 = classifyCheckoutFailure(new ProviderError(502, "x", 400));
  assert.equal(http400.orderMayExist, false);
  assert.equal(classifyCheckoutFailure(new ProviderError(502, "x", 401)).code, "PROVIDER_AUTH_FAILED");
  assert.equal(classifyCheckoutFailure(new ProviderError(502, "x", 403)).orderMayExist, false);
  assert.equal(classifyCheckoutFailure(new ProviderError(502, "x", 429)).code, "PROVIDER_RATE_LIMITED");

  for (const uncertain of [
    new ProviderError(502, "x", 500),
    new ProviderError(502, "x", 503),
    new ProviderError(502), // network error / timeout / unreadable body: no upstream status
    new CheckoutError("unusable url", "INVALID_CHECKOUT_URL"),
    new Error("boom"),
  ]) {
    const f = classifyCheckoutFailure(uncertain);
    assert.equal(f.code, "ORDER_STATUS_UNKNOWN");
    assert.equal(f.orderMayExist, true);
    assert.equal(f.status, 503);
    assert.doesNotMatch(f.message, /try again/i, "must never invite a blind retry");
  }
});

test("native checkout gate is default-off, fails closed and honours pilot keys", () => {
  assert.equal(isTourdeskBookingEnabledFor("12-2", {}), false);
  for (const v of ["false", "yes", "1", "TRUE", ""])
    assert.equal(isTourdeskBookingEnabledFor("12-2", { TOURDESK_BOOKING_ENABLED: v }), false, v);
  assert.equal(isTourdeskBookingEnabledFor("12-2", { TOURDESK_BOOKING_ENABLED: "true" }), true);
  const env = { TOURDESK_PILOT_KEYS: "99-9, 12-2 ,bad,1-" };
  assert.deepEqual([...getTourdeskPilotKeys(env)].sort(), ["12-2", "99-9"]);
  assert.equal(isTourdeskBookingEnabledFor("12-2", env), true);
  assert.equal(isTourdeskBookingEnabledFor("13-2", env), false);
  // "false" does not hide an explicitly listed pilot product (same as both references).
  assert.equal(
    isTourdeskBookingEnabledFor("12-2", { ...env, TOURDESK_BOOKING_ENABLED: "false" }),
    true,
  );
});

test("slot id format D (open tickets) is recognised and unknown formats still hand off", () => {
  const d = "20261021000000-2026-10-21";
  assert.equal(classifyTourDeskSlotId(d), "DATE_SUFFIX");
  assert.equal(isSupportedTourDeskSlotId(d), true);
  for (const bad of ["20261021000000-2026-10", "2026102100000-2026-10-21", "20261021000000-2026-10-21x", "", "weird/id"])
    assert.equal(isSupportedTourDeskSlotId(bad), false, bad);
});

import { PRODUCTION_ORIGIN, returnOrigin } from "../lib/site";

test("TourDesk return URL origin: configured domain, otherwise www.gotobuda.com, never browser input", () => {
  assert.equal(PRODUCTION_ORIGIN, "https://www.gotobuda.com");
  assert.equal(returnOrigin({}), "https://www.gotobuda.com");
  assert.equal(returnOrigin({ NEXT_PUBLIC_SITE_URL: "https://www.gotobuda.com" }), "https://www.gotobuda.com");
  assert.equal(returnOrigin({ NEXT_PUBLIC_SITE_URL: "https://www.gotobuda.com/" }), "https://www.gotobuda.com");
  // invalid / unsafe values never leak into the return URL
  for (const bad of ["http://evil.example", "https://www.gotobuda.com/x?y=1", "javascript:alert(1)", "not a url"])
    assert.equal(returnOrigin({ NEXT_PUBLIC_SITE_URL: bad }), "https://www.gotobuda.com", bad);
});
