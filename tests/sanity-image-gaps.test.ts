import assert from "node:assert/strict";
import test from "node:test";
import { hasImageGaps, planImageGaps } from "../scripts/sanity-image-gaps";

// Gap filling must only ever add what is missing: a present item, its order and any Studio edit are never touched.
const item = (k: string) => ({ _key: k, alt: k });
const expected = { gallery: [item("a"), item("b"), item("c")], heroImage: { asset: "x" } };

test("a complete document needs no patch", () => {
  const plan = planImageGaps(expected, { keys: ["a", "b", "c"], hasHero: true });
  assert.equal(hasImageGaps(plan), false);
  assert.deepEqual(plan.inserts, []);
});

test("a missing middle item is inserted after its predecessor, nothing else changes", () => {
  const plan = planImageGaps(expected, { keys: ["a", "c"], hasHero: true });
  assert.deepEqual(plan.inserts, [{ item: item("b"), at: { after: "a" } }]);
  assert.equal(plan.setHero, false);
});

test("a missing first item goes before the first present one; a missing last item after its predecessor", () => {
  assert.deepEqual(planImageGaps(expected, { keys: ["b", "c"], hasHero: true }).inserts, [{ item: item("a"), at: "before-first" }]);
  assert.deepEqual(planImageGaps(expected, { keys: ["a", "b"], hasHero: true }).inserts, [{ item: item("c"), at: { after: "b" } }]);
});

test("several missing items keep the intended order", () => {
  const plan = planImageGaps(expected, { keys: ["c"], hasHero: true });
  assert.deepEqual(plan.inserts, [
    { item: item("a"), at: "before-first" },
    { item: item("b"), at: { after: "a" } },
  ]);
  const empty = planImageGaps(expected, { keys: [], hasHero: true });
  assert.deepEqual(empty.inserts.map((i) => [i.item._key, i.at]), [
    ["a", "append"],
    ["b", { after: "a" }],
    ["c", { after: "b" }],
  ]);
});

test("an editor's extra or reordered items are kept: only absent keys are planned", () => {
  const plan = planImageGaps(expected, { keys: ["z", "c", "a", "b"], hasHero: true });
  assert.equal(hasImageGaps(plan), false);
});

test("the hero is set only when the field is absent and the seed has one", () => {
  assert.equal(planImageGaps(expected, { keys: ["a", "b", "c"], hasHero: false }).setHero, true);
  assert.equal(planImageGaps(expected, { keys: ["a", "b", "c"], hasHero: true }).setHero, false);
  assert.equal(planImageGaps({ gallery: [] }, { keys: [], hasHero: false }).setHero, false);
});

test("a photo already present under another _key (written in Studio or by another session) is not added a second time", () => {
  const withAssets = {
    gallery: [
      { _key: "a", asset: { _ref: "image-a" } },
      { _key: "b", asset: { _ref: "image-b" } },
      { _key: "c", asset: { _ref: "image-c" } },
    ],
  };
  // The live gallery holds all three photos, but the third one under a different _key.
  const plan = planImageGaps(withAssets, { keys: ["a", "b", "zz"], assets: ["image-a", "image-b", "image-c"], hasHero: true });
  assert.equal(hasImageGaps(plan), false);
  // A genuinely absent photo is still added.
  const missing = planImageGaps(withAssets, { keys: ["a", "b"], assets: ["image-a", "image-b"], hasHero: true });
  assert.deepEqual(missing.inserts.map((i) => i.item._key), ["c"]);
});

test("the same photo used twice in one gallery is added as many times as it is missing", () => {
  const twice = {
    gallery: [
      { _key: "a", asset: { _ref: "image-x" } },
      { _key: "b", asset: { _ref: "image-x" } },
    ],
  };
  assert.equal(planImageGaps(twice, { keys: ["a"], assets: ["image-x"], hasHero: true }).inserts.length, 1);
  assert.equal(planImageGaps(twice, { keys: ["q", "r"], assets: ["image-x", "image-x"], hasHero: true }).inserts.length, 0);
  assert.equal(planImageGaps(twice, { keys: [], assets: [], hasHero: true }).inserts.length, 2);
});
