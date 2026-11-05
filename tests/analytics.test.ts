import assert from "node:assert/strict";
import test from "node:test";
import { ALL_DENIED, ALL_GRANTED, googleSignals, type ConsentChoices } from "../lib/consent/consent";
import { classifyPath, cleanPath, createDeduper, EVENT_NAMES, sanitizeParams } from "../lib/analytics/events";
import { createGa, validGaId, type GaEnv } from "../lib/analytics/ga";

const ID = "G-TEST123456";
const analyticsOnly: ConsentChoices = { ...ALL_DENIED, analytics: true };

function fakeEnv(cookie = "") {
  const loaded: string[] = [];
  const writes: string[] = [];
  const win: Record<string, unknown> = {};
  const doc = {
    get cookie() {
      return cookie;
    },
    set cookie(v: string) {
      writes.push(v);
    },
    location: { hostname: "www.gotobuda.com", protocol: "https:" },
  };
  const env: GaEnv = { win: win as never, doc: doc as never, loadScript: (s) => loaded.push(s) };
  return { env, loaded, writes, win };
}
const events = (win: Record<string, unknown>) =>
  ((win.dataLayer as ArrayLike<unknown>[] | undefined) ?? []).map((a) => Array.from(a as ArrayLike<unknown>));

test("a measurement ID is only accepted in GA4 form", () => {
  assert.equal(validGaId(ID), ID);
  for (const bad of [undefined, "", "UA-1234-1", "G-", "g-abcdef", "G-<script>", "G-TEST123456789012345"]) assert.equal(validGaId(bad), undefined, String(bad));
});

test("before consent the Google tag is not loaded, nothing is queued and nothing is sent", () => {
  const { env, loaded, win } = fakeEnv();
  const ga = createGa(ID, env);
  assert.equal(ga.send("page_view", { page_path: "/", content_category: "home" }), false);
  ga.apply(ALL_DENIED, googleSignals(ALL_DENIED)); // "reject all" or no choice
  assert.equal(ga.send("page_view", { page_path: "/", content_category: "home" }), false);
  assert.deepEqual(loaded, []);
  assert.equal(win.dataLayer, undefined);
  assert.equal(ga.isEnabled(), false);
});

test("without a measurement ID nothing can load even with consent", () => {
  const { env, loaded } = fakeEnv();
  const ga = createGa(undefined, env);
  ga.apply(ALL_GRANTED, googleSignals(ALL_GRANTED));
  assert.equal(ga.configured, false);
  assert.deepEqual(loaded, []);
  assert.equal(ga.send("page_view", { page_path: "/", content_category: "home" }), false);
});

test("without a measurement ID a refusal still removes leftover Google cookies", () => {
  const { env, writes } = fakeEnv("_ga=GA1.1.1; gtb_consent=x");
  createGa(undefined, env).apply(ALL_DENIED, googleSignals(ALL_DENIED));
  assert.ok(writes.some((w) => w.startsWith("_ga=; Max-Age=0")));
  assert.ok(!writes.some((w) => w.startsWith("gtb_consent=")));
});

test("analytics consent: defaults denied first, then the update, then config without an automatic page view, then the tag", () => {
  const { env, loaded, win } = fakeEnv();
  const ga = createGa(ID, env);
  ga.apply(analyticsOnly, googleSignals(analyticsOnly));
  assert.deepEqual(loaded, [`https://www.googletagmanager.com/gtag/js?id=${ID}`]);
  const log = events(win);
  assert.deepEqual(log.slice(0, 2).map((e) => [e[0], e[1]]), [["consent", "default"], ["consent", "update"]]);
  assert.equal((log[0][2] as Record<string, string>).analytics_storage, "denied");
  assert.equal((log[1][2] as Record<string, string>).analytics_storage, "granted");
  assert.equal((log[1][2] as Record<string, string>).ad_storage, "denied");
  const config = log.find((e) => e[0] === "config")!;
  assert.equal(config[1], ID);
  assert.equal((config[2] as Record<string, unknown>).send_page_view, false);
  assert.equal((config[2] as Record<string, unknown>).allow_google_signals, false);
  assert.equal((config[2] as Record<string, unknown>).allow_ad_personalization_signals, false);
});

test("events are sent only while enabled, with sanitised parameters, and never queued from before consent", () => {
  const { env, win } = fakeEnv();
  const ga = createGa(ID, env);
  assert.equal(ga.send("attraction_view", { attraction_slug: "chain-bridge", page_path: "/attractions/chain-bridge" }), false);
  ga.apply(analyticsOnly, googleSignals(analyticsOnly));
  assert.equal(events(win).some((e) => e[0] === "event"), false, "the earlier attempt was not queued");
  assert.equal(ga.send("attraction_view", { attraction_slug: "chain-bridge", page_path: "/attractions/chain-bridge?q=secret#x" }), true);
  const sent = events(win).filter((e) => e[0] === "event");
  assert.deepEqual(sent, [["event", "attraction_view", { attraction_slug: "chain-bridge", page_path: "/attractions/chain-bridge" }]]);
  // Invalid events are dropped, not guessed.
  assert.equal(ga.send("tour_card_click", { provider: "tourdesk" as never, product_id: "x:1", placement: "other" }), false);
});

test("withdrawal: further events stop, Google is told, optional cookies are removed, our consent cookie is not", () => {
  const { env, win, writes } = fakeEnv("gtb_consent=abc; _ga=GA1.1.1; _ga_TEST123456=GS1.1.1; other=1");
  const ga = createGa(ID, env);
  ga.apply(analyticsOnly, googleSignals(analyticsOnly));
  assert.equal(ga.send("page_view", { page_path: "/", content_category: "home" }), true);
  const before = events(win).length;
  ga.apply(ALL_DENIED, googleSignals(ALL_DENIED));
  assert.equal(ga.isEnabled(), false);
  assert.equal(win[`ga-disable-${ID}`], true);
  assert.equal(ga.send("page_view", { page_path: "/about", content_category: "about" }), false);
  const after = events(win).slice(before);
  assert.deepEqual(after.map((e) => [e[0], e[1]]), [["consent", "update"]]);
  assert.equal((after[0][2] as Record<string, string>).analytics_storage, "denied");
  assert.ok(writes.some((w) => w.startsWith("_ga=; Max-Age=0")), "removes _ga");
  assert.ok(writes.some((w) => w.startsWith("_ga_TEST123456=; Max-Age=0")), "removes _ga_<id>");
  assert.ok(writes.some((w) => w.includes("Domain=.gotobuda.com")), "also on the parent domain");
  assert.ok(!writes.some((w) => w.startsWith("gtb_consent=") || w.startsWith("other=")));
});

test("granting again after withdrawal re-enables without loading the tag twice", () => {
  const { env, loaded, win } = fakeEnv();
  const ga = createGa(ID, env);
  ga.apply(analyticsOnly, googleSignals(analyticsOnly));
  ga.apply(ALL_DENIED, googleSignals(ALL_DENIED));
  ga.apply(analyticsOnly, googleSignals(analyticsOnly));
  assert.equal(loaded.length, 1);
  assert.equal(win[`ga-disable-${ID}`], false);
  assert.equal(ga.send("page_view", { page_path: "/", content_category: "home" }), true);
});

test("marketing consent alone does not load the Google tag (no advertising tag exists); marketing plus analytics enables Google signals", () => {
  const a = fakeEnv();
  const gaA = createGa(ID, a.env);
  gaA.apply({ ...ALL_DENIED, marketing: true }, googleSignals({ ...ALL_DENIED, marketing: true }));
  assert.deepEqual(a.loaded, []);
  const b = fakeEnv();
  const gaB = createGa(ID, b.env);
  gaB.apply(ALL_GRANTED, googleSignals(ALL_GRANTED));
  const config = events(b.win).find((e) => e[0] === "config")!;
  assert.equal((config[2] as Record<string, unknown>).allow_google_signals, true);
  assert.equal((events(b.win)[1][2] as Record<string, string>).ad_storage, "granted");
});

test("parameters are allow-listed: free text, e-mail, query strings and unknown fields never get through", () => {
  assert.equal(sanitizeParams("site_search", { search_scope: "home", has_query: true } as never) !== null, true);
  assert.equal(sanitizeParams("site_search", { search_scope: "home", has_query: "jane@example.com" } as never), null);
  assert.equal(sanitizeParams("guide_view", { guide_slug: "jane@example.com", page_path: "/guides/x" }), null);
  assert.equal(sanitizeParams("guide_view", { guide_slug: "two words", page_path: "/guides/x" }), null);
  assert.equal(sanitizeParams("guide_view", { guide_slug: "danube-cruises", page_path: "https://evil.example/x" }), null);
  const withExtra = sanitizeParams("guide_view", { guide_slug: "danube-cruises", page_path: "/guides/danube-cruises", email: "a@b.c" } as never);
  assert.deepEqual(withExtra, { guide_slug: "danube-cruises", page_path: "/guides/danube-cruises" });
  assert.equal(sanitizeParams("cookie_consent_update", { consent_action: "custom", analytics: "granted", functional: "denied", marketing: "denied" })?.consent_action, "custom");
  assert.equal(sanitizeParams("cookie_consent_update", { consent_action: "x", analytics: "granted", functional: "denied", marketing: "denied" } as never), null);
  assert.equal(EVENT_NAMES.length, 12);
});

test("paths lose their query string and fragment; page kinds are recognised", () => {
  assert.equal(cleanPath("/attractions?q=jane%40example.com#top"), "/attractions");
  assert.equal(cleanPath("/guides/danube-cruises/"), "/guides/danube-cruises");
  assert.equal(cleanPath("javascript:alert(1)"), undefined);
  assert.deepEqual(classifyPath("/attractions/chain-bridge"), { type: "attraction", slug: "chain-bridge" });
  assert.deepEqual(classifyPath("/guides/budapest-in-3-days?x=1"), { type: "guide", slug: "budapest-in-3-days" });
  assert.deepEqual(classifyPath("/experiences/thermal-baths"), { type: "experience", slug: "thermal-baths" });
  assert.deepEqual(classifyPath("/tours/viator/12345P6"), { type: "tour", provider: "viator", id: "12345P6" });
  assert.deepEqual(classifyPath("/tours/tiqets/987"), { type: "tour", provider: "tiqets", id: "987" });
  assert.deepEqual(classifyPath("/tours/tourdesk/1"), { type: "other", category: "tours" });
  assert.deepEqual(classifyPath("/attractions"), { type: "other", category: "attractions" });
  assert.deepEqual(classifyPath("/"), { type: "other", category: "home" });
});

test("deduplication: a view fires once per key, a click once per interval", () => {
  let t = 1000;
  const d = createDeduper(() => t);
  assert.equal(d.once("page_view:/#1"), true);
  assert.equal(d.once("page_view:/#1"), false);
  assert.equal(d.once("page_view:/#2"), true);
  assert.equal(d.within("click", 800), true);
  t += 300;
  assert.equal(d.within("click", 800), false, "double click inside the interval");
  t += 600;
  assert.equal(d.within("click", 800), true, "a later click counts");
});

test("the production measurement ID is the GoToBuda.com stream, valid in GA4 form, and one module supplies it everywhere", async () => {
  const { DEFAULT_GA_MEASUREMENT_ID, GA_MEASUREMENT_ID } = await import("../lib/analytics/config");
  assert.equal(DEFAULT_GA_MEASUREMENT_ID, "G-GCVBYQPJ9W");
  assert.equal(validGaId(DEFAULT_GA_MEASUREMENT_ID), DEFAULT_GA_MEASUREMENT_ID);
  // Without an environment override (as in tests and CI) the production stream is used.
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) assert.equal(GA_MEASUREMENT_ID, DEFAULT_GA_MEASUREMENT_ID);
});
