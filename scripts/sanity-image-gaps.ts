// Fills images that an earlier seed run could not upload, without touching anything else.
//
// createIfNotExists never changes an existing document, so a gallery item or hero image that was left out
// the first time would stay missing. Every gallery item has a deterministic _key (see sanity-seed.ts), so
// an item is "missing" exactly when its _key is absent from the live gallery. Only missing items are
// inserted (at their intended position) and the hero is set only when the field is absent. Present items,
// their order, captions, credits and any Studio edits are never read back or rewritten.

export type GapItem = { _key: string; [field: string]: unknown };
// keys: the _key of every live gallery item. assets: the asset id each live gallery item points at (same order or not).
// An item written by hand in Studio (or by another session) carries a different _key but the same asset; it must count
// as present, otherwise the seed would add the same photo a second time.
export type LiveImages = { keys: string[]; hasHero: boolean; assets?: string[] };
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
  // Live photos per asset that no seeded _key accounts for. A photo may legitimately appear twice in one gallery, so
  // these are counted, not just looked up. Items matched by _key use up their own asset first.
  const unclaimed = new Map<string, number>();
  for (const a of live.assets ?? []) unclaimed.set(a, (unclaimed.get(a) ?? 0) + 1);
  const assetOf = (item: GapItem) => (item.asset as { _ref?: string } | undefined)?._ref;
  for (const item of items) {
    const a = assetOf(item);
    if (a && present.has(item._key) && (unclaimed.get(a) ?? 0) > 0) unclaimed.set(a, unclaimed.get(a)! - 1);
  }
  items.forEach((item, i) => {
    if (present.has(item._key)) return;
    const a = assetOf(item);
    if (a && (unclaimed.get(a) ?? 0) > 0) {
      unclaimed.set(a, unclaimed.get(a)! - 1); // already there under another _key: not a gap
      return;
    }
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
