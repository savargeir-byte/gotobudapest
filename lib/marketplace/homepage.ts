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
    ))
    .sort((a, b) => PROVIDER_PRIORITY[a.product.provider] - PROVIDER_PRIORITY[b.product.provider] || a.index - b.index);
  const shown = new Set<string>();
  const selected: MarketplaceProduct[] = [];
  const take = (product: MarketplaceProduct) => {
    if (shown.has(product.id) || selected.length >= limit) return;
    shown.add(product.id);
    selected.push(product);
  };
  for (const category of HOMEPAGE_CATEGORIES) {
    const match = candidates.find(({ product }) => !shown.has(product.id) && product.categories.includes(category.key));
    if (match) take(match.product);
  }
  for (const candidate of candidates) take(candidate.product);
  return selected;
}
