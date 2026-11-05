// Fills images that an earlier seed run could not upload, without touching anything else.
//
// createIfNotExists never changes an existing document, so a gallery item or hero image that was left out
// the first time would stay missing. Every gallery item has a deterministic _key (see sanity-seed.ts), so
// an item is "missing" exactly when its _key is absent from the live gallery. Only missing items are
// inserted (at their intended position) and the hero is set only when the field is absent. Present items,
// their order, captions, credits and any Studio edits are never read back or rewritten.

export type GapItem = { _key: string; [field: string]: unknown };
export type LiveImages = { keys: string[]; hasHero: boolean };
export type ImageGapPlan = {
  setHero: boolean;
  inserts: { item: GapItem; at: "before-first" | "append" | { after: string } }[];
};

export function planImageGaps(
  expected: { gallery?: GapItem[]; heroImage?: unknown },
  live: LiveImages,
): ImageGapPlan {
  const present = new Set(live.keys);
  const inserts: ImageGapPlan["inserts"] = [];
  const items = expected.gallery ?? [];
  items.forEach((item, i) => {
    if (present.has(item._key)) return;
    // Anchor on the nearest earlier item that is (or by now will be) in the gallery.
    let at: ImageGapPlan["inserts"][number]["at"] | undefined;
    for (let j = i - 1; j >= 0; j--) {
      if (present.has(items[j]._key)) {
        at = { after: items[j]._key };
        break;
      }
    }
    if (!at) at = present.size === 0 ? "append" : "before-first";
    present.add(item._key);
    inserts.push({ item, at });
  });
  return { setHero: Boolean(expected.heroImage) && !live.hasHero, inserts };
}

export const hasImageGaps = (plan: ImageGapPlan) => plan.setHero || plan.inserts.length > 0;
