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
