import type { MarketplaceProduct } from "./types";
import { shortHash } from "./util";

// PORTED from goTene src/lib/providers/dedupe.ts (canonicalKey + provider preference),
// adapted to a stateless, cursor-carried "seen" set so paging never re-shows a product.

/** Terms that mark a DISTINCT product: never collapse these across providers. */
export const DISTINGUISHING =
  /\b(vip|private|guided|transfer|combo|package|all[-\s]?inclusive|premium|skip|sunset|night|express|small[-\s]?group)\b/i;

/** Conservative canonical key for cross-provider duplicate detection. */
export function canonicalKey(title: string): string | null {
  if (DISTINGUISHING.test(title)) return null;
  const core = title
    .toLowerCase()
    .replace(/[:\-–—|].*$/, "") // drop a subtitle after a separator
    .replace(/\b(entry )?ticket[s]?\b/g, "")
    .replace(/\b(entry|admission|pass)\b/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return core.length >= 3 ? core : null;
}

export const canonicalHash = (title: string): string | null => {
  const k = canonicalKey(title);
  return k ? shortHash(k) : null;
};

/**
 * De-duplicate one merged page. `seenBefore` holds canonical hashes of products shown
 * on earlier pages (they are dropped). Inside the page TourDesk wins ties and replaces
 * the kept entry IN PLACE, so the position is unchanged. Returns the canonical hashes
 * kept on this page so the cursor can carry them forward.
 */
export function dedupePage(
  items: MarketplaceProduct[],
  seenBefore: ReadonlySet<string> = new Set(),
): { items: MarketplaceProduct[]; seen: string[] } {
  const ids = new Set<string>();
  const index = new Map<string, number>();
  const out: MarketplaceProduct[] = [];
  for (const p of items) {
    if (ids.has(p.id)) continue;
    const h = canonicalHash(p.title);
    if (h) {
      if (seenBefore.has(h)) continue;
      const at = index.get(h);
      if (at !== undefined) {
        if (p.provider === "tourdesk" && out[at].provider !== "tourdesk") {
          ids.delete(out[at].id);
          out[at] = p;
          ids.add(p.id);
        }
        continue;
      }
      index.set(h, out.length);
    }
    ids.add(p.id);
    out.push(p);
  }
  return { items: out, seen: [...index.keys()] };
}
