import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_CARD_IMAGE_WIDTH,
  MAX_SRCSET_CANDIDATES,
  MAX_STORED_VARIANTS,
  MIN_CARD_SOURCE_WIDTH,
  buildSrcSet,
  cardImage,
  normalizeVariants,
  pickVariant,
} from "../lib/marketplace/images";
import { mapViatorProduct } from "../lib/marketplace/providers/viator";
import { mapTourdeskItem } from "../lib/marketplace/providers/tourdesk";

// Issue #11: card photos must come from the provider's own renditions, chosen by size x DPR.

const https = (u: unknown) => (typeof u === "string" && u.startsWith("https://") ? u : undefined);
const raw = (widths: number[]) => widths.map((w) => ({ url: `https://m.example.com/${w}.jpg`, width: w, height: Math.round(w * 0.66) }));

test("thumbnails (e.g. Viator's 100x100) are never kept as card renditions", () => {
  const v = normalizeVariants(raw([100, 200, 480, 720]), https);
  assert.deepEqual(v.map((x) => x.width), [480, 720]);
  assert.ok(v.every((x) => x.width >= MIN_CARD_SOURCE_WIDTH));
  assert.deepEqual(normalizeVariants(raw([100, 200]), https), []);
});

test("normalizing drops junk, non-https URLs and duplicate widths, and bounds the stored list", () => {
  const v = normalizeVariants(
    [
      null,
      "x",
      { url: "http://insecure.example.com/a.jpg", width: 800 },
      { url: "https://m.example.com/a.jpg", width: "NaN" },
      { url: "https://m.example.com/a.jpg", width: -5 },
      { url: "https://m.example.com/b.jpg", width: 800 },
      { url: "https://m.example.com/c.jpg", width: 800 },
    ],
    https,
  );
  assert.equal(v.length, 1);
  assert.equal(normalizeVariants("nope", https).length, 0);
  const many = normalizeVariants(raw([320, 400, 480, 560, 640, 720, 800, 900, 1000, 1080, 1200, 1600]), https);
  assert.ok(many.length <= MAX_STORED_VARIANTS);
  assert.equal(many[0].width, 320);
  assert.equal(many[many.length - 1].width, 1600);
});

test("pickVariant: smallest rendition that covers CSS width x DPR; otherwise the widest, flagged source-limited", () => {
  const v = normalizeVariants(raw([480, 720, 1080, 1600]), https);
  assert.equal(pickVariant(v, 400, 1).variant?.width, 480);
  assert.equal(pickVariant(v, 400, 2).variant?.width, 1080); // needs 800 px -> 1080, not the 1600 original
  assert.equal(pickVariant(v, 400, 2).sourceLimited, false);
  assert.equal(pickVariant(v, 400, 3).variant?.width, 1080); // weight cap 1200: the 1600 original is not fetched for a card
  const limited = pickVariant(normalizeVariants(raw([400]), https), 400, 2);
  assert.equal(limited.sourceLimited, true);
  assert.equal(limited.variant?.width, 400);
  assert.equal(pickVariant([], 400, 2).variant, undefined);
  assert.equal(pickVariant(undefined, 400, 2).sourceLimited, true);
});

test("buildSrcSet is bounded and never offers a thumbnail or an image from nowhere", () => {
  const v = normalizeVariants(raw([100, 480, 560, 640, 720, 800, 1080, 1600, 2400]), https);
  const set = buildSrcSet(v)!;
  const widths = set.srcSet!.split(",").map((c) => Number(c.trim().split(" ")[1].replace("w", "")));
  assert.ok(widths.length <= MAX_SRCSET_CANDIDATES);
  assert.ok(widths.every((w) => w >= MIN_CARD_SOURCE_WIDTH));
  assert.ok(widths.every((w) => w <= MAX_CARD_IMAGE_WIDTH));
  assert.ok(widths.includes(480));
  assert.equal(set.sourceLimited, false);
  assert.match(set.sizes!, /88vw/);
  assert.notEqual(buildSrcSet(v, "row")!.sizes, set.sizes);
  assert.equal(buildSrcSet(normalizeVariants(raw([100, 200]), https)), undefined);
  assert.equal(buildSrcSet(undefined), undefined);
});

test("a small source is shown at its natural size and flagged, never invented into a larger one", () => {
  const set = buildSrcSet(normalizeVariants(raw([400]), https))!;
  assert.equal(set.srcSet, "https://m.example.com/400.jpg 400w");
  assert.equal(set.widestWidth, 400);
  assert.equal(set.sourceLimited, true);
});

test("Viator mapping keeps real renditions, drops thumbnails and uses a card-sized src", () => {
  const product = (widths: number[]) =>
    mapViatorProduct(
      {
        productCode: "PRD001",
        title: "Cruise",
        productUrl: "https://www.viator.com/tours/Budapest/x/d684-PRD001?pid=P00X&mcid=42383",
        destinations: [{ ref: "684" }],
        images: [{ isCover: true, variants: raw(widths) }],
      },
      "684",
    )!;
  const full = product([100, 480, 720, 1080]);
  assert.deepEqual(full.image?.variants?.map((v) => v.width), [480, 720, 1080]);
  assert.equal(full.image?.src, "https://m.example.com/1080.jpg");
  assert.ok(!full.image?.small); // 480 css px x 2 dpr = 960 -> the 1080 rendition, which is already src
  assert.ok(!full.image?.sourceLimited);

  // thumbnails only: no image at all (placeholder card), never a stretched 100 px photo
  const thumbs = product([100, 200]);
  assert.equal(thumbs.image, undefined);
  assert.equal(cardImage(thumbs.image), undefined);

  const small = product([100, 400]);
  assert.equal(small.image?.sourceLimited, true);
});

test("TourDesk keeps its single supplied photo URL and cardImage serves exactly that", () => {
  const p = mapTourdeskItem({
    uniqueKey: "12-2",
    title: "Budapest Danube Cruise",
    description: "A real river experience in Budapest",
    tourUrl: "https://checkout.tourdesk.is/booking/12-2",
    photoUrl: "https://media.example.com/budapest.jpg",
    formattedPrice: "€45",
  });
  const img = cardImage(p?.image);
  assert.equal(img?.src, "https://media.example.com/budapest.jpg");
  assert.equal(img?.srcSet, undefined);
});
