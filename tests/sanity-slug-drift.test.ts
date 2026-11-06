import assert from "node:assert/strict";
import test from "node:test";
import { planSlugDrift } from "../scripts/sanity-slug-drift";

test("only a slug that differs by stray end punctuation is repaired", () => {
  const expected = [
    { _id: "attraction-a", slug: "buda-castle-funicular" },
    { _id: "attraction-b", slug: "chain-bridge" },
    { _id: "attraction-c", slug: "gellert-hill" },
    { _id: "attraction-d", slug: "ruin-bars" },
    { _id: "attraction-e", slug: "missing-doc" },
  ];
  const live = [
    { _id: "attraction-a", slug: "buda-castle-funicular." },
    { _id: "attraction-b", slug: "chain-bridge" }, // already right
    { _id: "attraction-c", slug: "gellert-hill-citadel" }, // an editor's own change: never touched
    { _id: "attraction-d", slug: null },
  ];
  assert.deepEqual(planSlugDrift(expected, live), [{ _id: "attraction-a", from: "buda-castle-funicular.", to: "buda-castle-funicular" }]);
});
