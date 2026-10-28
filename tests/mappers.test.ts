import assert from "node:assert/strict";
import test from "node:test";
import {
  mapAttraction,
  mapGuide,
  mapPhoto,
  mapTopic,
  safeUrl,
} from "../lib/sanity/mappers";
import { createRateLimiter } from "../lib/rate-limit";

const photo = {
  src640: "/assets/city.webp",
  src1280: "/assets/city.webp",
  alt: "fallback photo for the test",
};

test("safeUrl accepts only https URLs", () => {
  assert.equal(safeUrl("https://example.com/a"), "https://example.com/a");
  for (const bad of ["http://x.co", "javascript:alert(1)", "data:text/plain,hi", "//x.co", "", null, 5])
    assert.equal(safeUrl(bad), undefined);
});

test("attractions without an https source URL are rejected", () => {
  const base = { _id: "a", name: "Place", slug: "place", category: "Landmarks", description: "d" };
  assert.equal(mapAttraction({ ...base, sourceUrl: "http://insecure.example" }), undefined);
  assert.equal(mapAttraction({ ...base, sourceUrl: "javascript:alert(1)" }), undefined);
  const ok = mapAttraction({ ...base, sourceUrl: "https://example.com" });
  assert.equal(ok?.slug, "place");
});

test("coordinates are only set when both values exist (nothing is invented)", () => {
  const base = {
    _id: "a", name: "Place", slug: "place", category: null, description: "d",
    sourceUrl: "https://example.com",
  };
  assert.equal(mapAttraction(base)?.coordinates, undefined);
  assert.equal(mapAttraction({ ...base, lat: 47.5 })?.coordinates, undefined);
  assert.deepEqual(mapAttraction({ ...base, lat: 47.5, lng: 19.04 })?.coordinates, {
    latitude: 47.5,
    longitude: 19.04,
  });
});

test("photos need an asset; credit links must be https", () => {
  assert.equal(mapPhoto({ alt: "no asset" }, "x"), undefined);
  const p = mapPhoto(
    {
      asset: { _ref: "image-abc123def456abc123def456abc123def456abc1-1200x800-jpg" },
      alt: "",
      creditAuthor: "A. Photographer",
      creditLicense: "CC BY 4.0",
      creditLicenseUrl: "javascript:alert(1)",
      creditSourceUrl: "https://commons.wikimedia.org/wiki/File:X.jpg",
    },
    "Fallback alt",
  );
  assert.ok(p?.src640.startsWith("https://cdn.sanity.io/images/"));
  assert.equal(p?.alt, "Fallback alt");
  assert.equal(p?.credit?.licenseUrl, "");
  assert.equal(p?.credit?.sourceUrl, "https://commons.wikimedia.org/wiki/File:X.jpg");
});

test("guides and topics drop unsafe source links and incomplete entries", () => {
  const g = mapGuide(
    {
      title: "T", slug: "t", category: "Itineraries", description: "d", intro: "i",
      sources: [
        { label: "ok", url: "https://example.com" },
        { label: "bad", url: "http://example.com" },
        { label: "worse", url: "javascript:alert(1)" },
      ],
      faqs: [{ question: "q", answer: "a" }, { question: "only q" }],
    },
    photo,
  );
  assert.deepEqual(g?.sources, [{ label: "ok", url: "https://example.com/" }]);
  assert.equal(g?.faqs.length, 1);
  assert.equal(mapGuide({ title: "T", slug: "", category: null, description: "d", intro: "i" }, photo), undefined);
  const t = mapTopic({ title: "T", slug: "t", summary: "s", intro: "i" }, photo);
  assert.equal(t?.photo, photo);
});

test("rate limiter allows the limit and blocks the next request, per key", () => {
  const allow = createRateLimiter(3, 1000);
  const now = 1_000_000;
  assert.deepEqual([1, 2, 3, 4].map(() => allow("a", now)), [true, true, true, false]);
  assert.equal(allow("b", now), true);
  assert.equal(allow("a", now + 1001), true);
});

import { readingMinutes } from "../lib/portable-text";
import { localContent } from "../lib/local-content";

test("reading time reflects the length of every guide", () => {
  for (const g of localContent().guides) {
    const m = readingMinutes(g);
    assert.ok(m >= 2 && m <= 8, `${g.slug} reading time ${m}`);
  }
});

const block = (text: string) => ({
  _type: "block",
  _key: "b1",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: "s1", text, marks: [] }],
});
const baseAttraction = {
  _id: "a", name: "Place", slug: "place", category: "Landmarks", description: "d",
  sourceUrl: "https://example.com",
};

test("history needs an introduction and at least one non-empty section", () => {
  assert.equal(mapAttraction({ ...baseAttraction, historySections: [{ heading: "H", body: [block("t")] }] })?.history, undefined);
  assert.equal(mapAttraction({ ...baseAttraction, historyIntro: "Intro", historySections: [] })?.history, undefined);
  assert.equal(mapAttraction({ ...baseAttraction, historyIntro: "Intro", historySections: [{ heading: "H", body: [] }] })?.history, undefined);
  const ok = mapAttraction({ ...baseAttraction, historyIntro: "Intro", historySections: [{ heading: "H", body: [block("t")] }] });
  assert.equal(ok?.history?.sections.length, 1);
});

test("stories without an https source, a known kind or a body are dropped", () => {
  const story = (over: object) => ({
    kind: "local-tradition", title: "T", body: [block("x")],
    sourceUrl: "https://example.com/s", sourceLabel: "Source", ...over,
  });
  const a = mapAttraction({
    ...baseAttraction,
    historyIntro: "Intro",
    historySections: [{ heading: "H", body: [block("t")] }],
    stories: [
      story({}),
      story({ sourceUrl: "http://example.com" }),
      story({ sourceUrl: "javascript:alert(1)" }),
      story({ kind: "legend-of-doom" }),
      story({ body: [] }),
      story({ title: "" }),
    ],
    historySources: [{ label: "ok", url: "https://example.com" }, { label: "bad", url: "ftp://example.com" }],
  });
  assert.equal(a?.history?.stories.length, 1);
  assert.equal(a?.history?.sources.length, 1);
});

test("gallery photos keep captions and credits; items without an asset are dropped", () => {
  const ref = "image-0123456789abcdef0123456789abcdef01234567-1200x800-jpg";
  const a = mapAttraction({
    ...baseAttraction,
    gallery: [
      { asset: { _ref: ref }, alt: "A clear description of the photo", caption: "Caption", creditAuthor: "A", creditLicense: "CC BY 4.0", creditSourceUrl: "https://commons.wikimedia.org/wiki/File:X.jpg" },
      { alt: "no asset" },
    ],
  });
  assert.equal(a?.gallery?.length, 1);
  assert.equal(a?.gallery?.[0].caption, "Caption");
  assert.equal(a?.gallery?.[0].credit?.license, "CC BY 4.0");
});

import { rateLimitScale } from "../lib/rate-limit";

test("the test quota scale is ignored on Vercel and for anything but a small integer", () => {
  assert.equal(rateLimitScale({}), 1);
  assert.equal(rateLimitScale({ RATE_LIMIT_TEST_SCALE: "1000" }), 1000);
  // Never honoured on Vercel (production, preview or development).
  for (const vercel of ["1", "production", "preview"])
    assert.equal(rateLimitScale({ VERCEL: vercel, RATE_LIMIT_TEST_SCALE: "1000" }), 1, vercel);
  for (const bad of ["0", "-5", "1001", "1e3", "abc", "", " 5", "10000", "5.5"])
    assert.equal(rateLimitScale({ RATE_LIMIT_TEST_SCALE: bad }), 1, bad);
});
