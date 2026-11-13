import type { CategoryKey, MarketplaceProduct, Provider } from "./types";

// A balanced showcase, not a claim that a product is available on every date.
// Only the marketplace API can supply products, prices and bookable product URLs.
export const HOMEPAGE_CATEGORIES: ReadonlyArray<{ key: CategoryKey; label: string }> = [
  { key: "cruises", label: "Danube cruises" },
  { key: "baths", label: "Thermal baths" },
  { key: "walking", label: "City tours" },
  { key: "tickets", label: "Attraction tickets" },
  { key: "daytrips", label: "Day trips" },
  { key: "food", label: "Food experiences" },
];

const PROVIDER_PRIORITY: Record<Provider, number> = { tourdesk: 0, tiqets: 1, viator: 2 };

export function selectHomepageProducts(products: readonly MarketplaceProduct[], limit = 6): MarketplaceProduct[] {
  if (limit <= 0) return [];
  // The existing marketplace endpoint already validates supplier products, but the
  // homepage also refuses entries without a real local detail/handoff path.
  const candidates = products
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => Boolean(
      product.title?.trim() &&
      product.detailUrl?.startsWith("/tours/") &&
      /^https:\/\/[^/]+/.test(product.bookingUrl),
    ));
  // The homepage is a visual sales showcase: use a genuine supplier photograph
  // when one is available, or an accurately attributed photo of the exact venue.
  // Never invent media for Tiqets products with no photos.
  const mediaQuality = (p: MarketplaceProduct) => p.image?.src ? 2 : p.venuePhoto?.src640 ? 1 : 0;
  const titleMatch: Partial<Record<CategoryKey, RegExp>> = {
    cruises: /cruise|boat|danube|river|sail/i,
    baths: /bath|spa|thermal|széchenyi|szechenyi|gellért|gellert|lukács|lukacs/i,
    walking: /walk|guided tour|city tour|parliament|castle|tuk.?tuk/i,
    tickets: /ticket|entry|admission|museum|basilica|synagogue|parliament|skip.the.line/i,
    daytrips: /day.trip|countryside|half.day|etye?k|szentendre|esztergom|visegrád|visegrad|gödöllő|godollo/i,
    food: /food|tast|wine|market|dinner|cook|gastro/i,
  };
  const categoryFit = (category: CategoryKey, title: string): number => {
    // A food walk is a more representative "Food experiences" feature than
    // yet another Danube dinner cruise, even when both are tagged food.
    if (category === "food" && /food tour|tast|market|cook|culinary|gastro/i.test(title)) return 2;
    // Supplier tagging can list a cruise under generic walking or sightseeing.
    if (category === "walking" && /cruise|boat|sailing/i.test(title)) return 0;
    return titleMatch[category]?.test(title) ? 1 : 0;
  };
  const byFit = (category: CategoryKey) => (
    a: (typeof candidates)[number], b: (typeof candidates)[number],
  ) =>
    categoryFit(category, b.product.title) - categoryFit(category, a.product.title) ||
    mediaQuality(b.product) - mediaQuality(a.product) ||
    PROVIDER_PRIORITY[a.product.provider] - PROVIDER_PRIORITY[b.product.provider] ||
    a.index - b.index;
  const shown = new Set<string>();
  const selected: MarketplaceProduct[] = [];
  const take = (product: MarketplaceProduct) => {
    if (shown.has(product.id) || selected.length >= limit) return;
    shown.add(product.id);
    selected.push(product);
  };
  for (const category of HOMEPAGE_CATEGORIES) {
    const match = candidates
      .filter(({ product }) => !shown.has(product.id) && product.categories.includes(category.key))
      .sort(byFit(category.key))[0];
    if (match) take(match.product);
  }
  // Fill unrepresented categories with real products. An image is preferred for
  // this promotional surface, while provider priority breaks equal-media ties.
  for (const candidate of [...candidates].sort((a, b) =>
    mediaQuality(b.product) - mediaQuality(a.product) ||
    PROVIDER_PRIORITY[a.product.provider] - PROVIDER_PRIORITY[b.product.provider] ||
    a.index - b.index
  )) take(candidate.product);
  return selected;
}
