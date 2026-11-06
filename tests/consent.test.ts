import assert from "node:assert/strict";
import test from "node:test";
import {
  ALL_DENIED,
  ALL_GRANTED,
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_DAYS,
  POLICY_VERSION,
  cookieHeaderValue,
  googleSignals,
  isGoogleOptionalCookie,
  makeRecord,
  parseRecord,
  readFromCookieString,
  serializeRecord,
} from "../lib/consent/consent";

const NOW = new Date("2026-11-05T12:00:00Z");

test("nothing optional is chosen by default and only an explicit true grants a category", () => {
  assert.deepEqual(ALL_DENIED, { necessary: true, analytics: false, functional: false, marketing: false });
  const r = makeRecord({}, NOW);
  assert.deepEqual(r.choices, ALL_DENIED);
  assert.equal(r.policy, POLICY_VERSION);
  assert.deepEqual(makeRecord({ analytics: true }, NOW).choices, { ...ALL_DENIED, analytics: true });
  assert.deepEqual(makeRecord(ALL_GRANTED, NOW).choices, ALL_GRANTED);
});

test("a record round-trips through its cookie text", () => {
  const r = makeRecord({ analytics: true, marketing: true }, NOW);
  assert.deepEqual(parseRecord(serializeRecord(r), NOW), r);
  const header = cookieHeaderValue(r, true);
  assert.match(header, new RegExp(`^${CONSENT_COOKIE}=`));
  assert.match(header, /; Path=\/; Max-Age=15552000; SameSite=Lax; Secure$/);
  assert.equal(CONSENT_MAX_AGE_DAYS * 86400, 15552000);
  assert.doesNotMatch(cookieHeaderValue(r, false), /Secure/);
  assert.deepEqual(readFromCookieString(`a=1; ${header.split(";")[0]}; b=2`, NOW), r);
});

test("anything unreadable, foreign, stale, from the future or from another policy version counts as no choice", () => {
  const good = serializeRecord(makeRecord({ analytics: true }, NOW));
  assert.ok(parseRecord(good, NOW));
  assert.equal(parseRecord("", NOW), null);
  assert.equal(parseRecord(null, NOW), null);
  assert.equal(parseRecord("garbage", NOW), null);
  assert.equal(parseRecord(good.replace(`p=${POLICY_VERSION}`, "p=1999-01-01"), NOW), null);
  assert.equal(parseRecord(good.replace("a=1", "a=yes"), NOW), null);
  assert.equal(parseRecord(good.replace("&m=0", ""), NOW), null);
  const old = new Date(NOW.getTime() - (CONSENT_MAX_AGE_DAYS + 1) * 86_400_000);
  assert.equal(parseRecord(serializeRecord(makeRecord({ analytics: true }, old)), NOW), null);
  const future = new Date(NOW.getTime() + 3_600_000);
  assert.equal(parseRecord(serializeRecord(makeRecord({ analytics: true }, future)), NOW), null);
  assert.equal(readFromCookieString("other=1", NOW), null);
  assert.equal(readFromCookieString(`${CONSENT_COOKIE}=%E0%A4%A`, NOW), null);
});

test("Google consent mode v2: all denied by default, each signal follows only its own category", () => {
  const denied = googleSignals(ALL_DENIED);
  assert.deepEqual(denied, {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
  });
  const analyticsOnly = googleSignals({ ...ALL_DENIED, analytics: true });
  assert.equal(analyticsOnly.analytics_storage, "granted");
  assert.equal(analyticsOnly.ad_storage, "denied");
  assert.equal(analyticsOnly.ad_user_data, "denied");
  assert.equal(analyticsOnly.ad_personalization, "denied");
  const marketingOnly = googleSignals({ ...ALL_DENIED, marketing: true });
  assert.equal(marketingOnly.analytics_storage, "denied");
  // No advertising product exists, so the marketing choice never turns an ad signal on.
  assert.deepEqual([marketingOnly.ad_storage, marketingOnly.ad_user_data, marketingOnly.ad_personalization], ["denied", "denied", "denied"]);
  const functionalOnly = googleSignals({ ...ALL_DENIED, functional: true });
  assert.deepEqual([functionalOnly.functionality_storage, functionalOnly.personalization_storage], ["granted", "granted"]);
});

test("only Google's optional cookies are treated as removable, never our own consent cookie", () => {
  for (const n of ["_ga", "_ga_ABC123DEF4", "_gid", "_gat_gtag_G_X", "_gcl_au", "_gcl_aw", "_gac_UA", "_gads"]) assert.ok(isGoogleOptionalCookie(n), n);
  for (const n of [CONSENT_COOKIE, "session", "gtb", "ga"]) assert.equal(isGoogleOptionalCookie(n), false, n);
});
