import type { ImageVariant, MarketplaceProduct } from "./types";

// Responsive image selection for provider photos (issue #11).
//
// Provider photos are remote CDN images (next.config images.unoptimized), so the browser
// must be given the real renditions and pick the right one itself. Rules:
//  - only renditions the provider API supplied are used; nothing is synthesised;
//  - a rendition narrower than MIN_CARD_SOURCE_WIDTH is a thumbnail (e.g. Viator's
//    100x100) and is never used on a card;
//  - a source that is smaller than the display needs is flagged "source-limited" and
//    is shown at its natural size with object-fit: cover (never enlarged by us);
//  - at most MAX_SRCSET_CANDIDATES candidates are offered, none wider than
//    MAX_CARD_IMAGE_WIDTH unless that is the only way to reach the needed width.

export type { ImageVariant } from "./types";

export const MIN_CARD_SOURCE_WIDTH = 320;
export const MAX_CARD_IMAGE_WIDTH = 1200;
export const MAX_SRCSET_CANDIDATES = 4;
export const MAX_STORED_VARIANTS = 6;

// Rendered card-photo widths measured in the real layouts (Playwright, 360-1920 px viewports).
// `sizes` mirrors them, deliberately a few percent above the measurement so a card is never
// asked for less than it shows:
//  - "grid": /tours results (filter sidebar + 3/2/1 columns, container capped at ~1450 px);
//  - "row": the contextual rows on home and editorial pages (3/2/1 columns, no sidebar).
export type CardLayout = "grid" | "row";
export const CARD_SIZES: Record<CardLayout, string> = {
  grid:
    "(max-width: 760px) 88vw, (max-width: 959px) 43vw, (max-width: 1100px) calc((100vw - 460px) / 2), (max-width: 1450px) calc((100vw - 490px) / 3), 305px",
  row: "(max-width: 760px) 88vw, (max-width: 1100px) 43vw, (max-width: 1450px) calc((100vw - 170px) / 3), 412px",
};
// Reference width for the fallback `src` and the source-limited flag (the widest a card gets).
export const CARD_CSS_WIDTH = 412;

type Raw = { url?: unknown; width?: unknown; height?: unknown };

// Turns a provider's raw variant list into validated, bounded renditions. `validate`
// is the caller's https/host check (returns the URL or undefined).
export function normalizeVariants(
  raw: unknown,
  validate: (url: unknown) => string | undefined,
): ImageVariant[] {
  if (!Array.isArray(raw)) return [];
  const byWidth = new Map<number, ImageVariant>();
  for (const item of raw as Raw[]) {
    if (!item || typeof item !== "object") continue;
    const width = Number(item.width);
    const src = validate(item.url);
    if (!src || !Number.isFinite(width) || width < 1 || width > 10000) continue;
    const height = Number(item.height);
    byWidth.set(Math.round(width), {
      src,
      width: Math.round(width),
      ...(Number.isFinite(height) && height > 0 ? { height: Math.round(height) } : {}),
    });
  }
  return thin([...byWidth.values()].sort((a, b) => a.width - b.width));
}

// Beyond this width a rendition is only a candidate when nothing narrower reaches a 2x card.
export const MAX_FALLBACK_IMAGE_WIDTH = 1920;

// Keeps the list small for the JSON payload: usable renditions only, at most MAX_STORED_VARIANTS.
// Card-sized renditions (<= MAX_CARD_IMAGE_WIDTH) are sampled evenly, always keeping the smallest
// and the widest of them; above the cap only the smallest fallback and the widest original are
// kept (the latter is what a product detail gallery can use).
function thin(sorted: ImageVariant[]): ImageVariant[] {
  const usable = sorted.filter((v) => v.width >= MIN_CARD_SOURCE_WIDTH);
  if (usable.length <= MAX_STORED_VARIANTS) return usable;
  const card = usable.filter((v) => v.width <= MAX_CARD_IMAGE_WIDTH);
  const above = usable.filter((v) => v.width > MAX_CARD_IMAGE_WIDTH);
  const extra = [
    above.find((v) => v.width <= MAX_FALLBACK_IMAGE_WIDTH),
    above[above.length - 1],
  ].filter((v): v is ImageVariant => !!v);
  const room = Math.max(1, MAX_STORED_VARIANTS - new Set(extra.map((v) => v.width)).size);
  const picked: ImageVariant[] = [];
  if (card.length <= room) picked.push(...card);
  else
    for (let i = 0; i < room; i++)
      picked.push(card[Math.round((i * (card.length - 1)) / Math.max(1, room - 1))]);
  return [...new Map([...picked, ...extra].map((v) => [v.width, v])).values()].sort(
    (x, y) => x.width - y.width,
  );
}

export type Picked = { variant?: ImageVariant; sourceLimited: boolean; neededWidth: number };

// Smallest usable rendition >= cssWidth x dpr, never heavier than MAX_CARD_IMAGE_WIDTH (unless
// every usable rendition is wider, then the smallest of them). When the provider has nothing wide
// enough the widest usable one is returned and the result is source-limited; when only our weight
// cap stops us, it is not (the source could have supplied more).
export function pickVariant(
  variants: ImageVariant[] | undefined,
  cssWidth: number,
  dpr = 2,
): Picked {
  const neededWidth = Math.min(MAX_CARD_IMAGE_WIDTH, Math.ceil(cssWidth * dpr));
  const usable = (variants ?? [])
    .filter((v) => v.width >= MIN_CARD_SOURCE_WIDTH)
    .sort((a, b) => a.width - b.width);
  if (!usable.length) return { sourceLimited: true, neededWidth };
  const within = usable.filter((v) => v.width <= MAX_CARD_IMAGE_WIDTH);
  if (!within.length) return { variant: usable[0], sourceLimited: false, neededWidth };
  const enough = within.find((v) => v.width >= neededWidth);
  if (enough) return { variant: enough, sourceLimited: false, neededWidth };
  const widest = within[within.length - 1];
  return { variant: widest, sourceLimited: within.length === usable.length, neededWidth };
}

export type CardImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  // The widest rendition the provider supplied that we offer; 0 when unknown.
  widestWidth: number;
  sourceLimited: boolean;
};

// Candidate renditions for srcset: usable, <= MAX_CARD_IMAGE_WIDTH (plus the smallest wider
// one when nothing reaches the needed width), reduced to MAX_SRCSET_CANDIDATES.
export function buildSrcSet(
  variants: ImageVariant[] | undefined,
  layout: CardLayout = "grid",
): CardImageProps | undefined {
  const usable = (variants ?? [])
    .filter((v) => v.width >= MIN_CARD_SOURCE_WIDTH)
    .sort((a, b) => a.width - b.width);
  if (!usable.length) return undefined;
  let pool = usable.filter((v) => v.width <= MAX_CARD_IMAGE_WIDTH);
  if (!pool.length) pool = [usable[0]];
  // Nothing card-sized reaches a 2x card: allow the smallest bounded fallback rather than blur.
  const wider = usable.find((v) => v.width > MAX_CARD_IMAGE_WIDTH && v.width <= MAX_FALLBACK_IMAGE_WIDTH);
  if (wider && pool[pool.length - 1].width < Math.ceil(CARD_CSS_WIDTH * 2) && !pool.includes(wider))
    pool = [...pool, wider];
  while (pool.length > MAX_SRCSET_CANDIDATES) {
    // drop the candidate closest to its neighbours (keeps the smallest and the widest)
    let drop = 1;
    let best = Infinity;
    for (let i = 1; i < pool.length - 1; i++) {
      const gap = pool[i + 1].width - pool[i - 1].width;
      if (gap < best) {
        best = gap;
        drop = i;
      }
    }
    pool = pool.filter((_, i) => i !== drop);
  }
  const widest = pool[pool.length - 1];
  const picked = pickVariant(pool, CARD_CSS_WIDTH, 2);
  const fallback = picked.variant ?? widest;
  return {
    src: fallback.src,
    srcSet: pool.map((v) => `${v.src} ${v.width}w`).join(", "),
    sizes: CARD_SIZES[layout],
    width: fallback.width,
    ...(fallback.height ? { height: fallback.height } : {}),
    widestWidth: widest.width,
    sourceLimited: widest.width < Math.min(MAX_CARD_IMAGE_WIDTH, CARD_CSS_WIDTH * 2),
  };
}

// What a card should render for a product, or undefined when there is no usable photo
// (placeholder path). Products with only a single URL (TourDesk) get just that src.
export function cardImage(
  image: MarketplaceProduct["image"],
  layout: CardLayout = "grid",
): CardImageProps | undefined {
  if (!image) return undefined;
  const set = buildSrcSet(image.variants, layout);
  if (set) return set;
  if (image.variants && image.variants.length === 0 && image.sourceLimited) return undefined;
  const src = image.small ?? image.src;
  return src ? { src, widestWidth: 0, sourceLimited: false } : undefined;
}
