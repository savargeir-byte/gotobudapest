// Repairs a slug that differs from the seeded one only by stray punctuation at its ends (for example the public
// dataset held "buda-castle-funicular." for the Buda Castle Funicular, which made its page return 404).
//
// Only that exact case is touched: the live slug, stripped of leading and trailing non-alphanumerics, must equal
// the seeded slug. A slug an editor really changed in Studio ("funicular-railway") is never overwritten.

export type SlugRow = { _id: string; slug: string | null };

const strip = (s: string) => s.trim().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");

export function planSlugDrift(expected: { _id: string; slug: string }[], live: SlugRow[]) {
  const byId = new Map(live.map((r) => [r._id, r.slug]));
  return expected.flatMap((e) => {
    const current = byId.get(e._id);
    if (!current || current === e.slug || strip(current) !== e.slug) return [];
    return [{ _id: e._id, from: current, to: e.slug }];
  });
}
