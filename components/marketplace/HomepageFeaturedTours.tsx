import Link from "next/link";
import { unstable_cache } from "next/cache";
import ProductCard from "@/components/marketplace/ProductCard";
import { searchMarketplace } from "@/lib/marketplace/registry";
import { withVenuePhotos } from "@/lib/marketplace/venue-photos";
import type { CategoryKey, MarketplaceProduct } from "@/lib/marketplace/types";

// Server-render actual partner listings. The 15-minute shared cache avoids making
// live supplier calls for each homepage visit; no secret or checkout operation
// is passed to the browser. The streaming boundary in Home keeps the hero fast.
const getHomepageInventory = unstable_cache(
  async () => withVenuePhotos(await searchMarketplace({ sort: "relevance" })),
  ["gotobudapest-homepage-marketplace-v1"],
  { revalidate: 900 },
);

const SHOWCASE: CategoryKey[] = ["cruises", "baths", "walking", "tickets", "food", "daytrips"];
const PROVIDER_PRIORITY: Record<string, number> = { tourdesk: 0, tiqets: 1, viator: 2 };

export function selectHomepageTours(products: MarketplaceProduct[], limit = 6): MarketplaceProduct[] {
  const eligible = products.filter((p) => Boolean(p.detailUrl && p.bookingUrl));
  const picked: MarketplaceProduct[] = [];
  const used = new Set<string>();
  const add = (p: MarketplaceProduct | undefined) => {
    if (!p || used.has(p.id)) return;
    used.add(p.id);
    picked.push(p);
  };

  // Curate distinct visitor interests before choosing the most relevant provider.
  // Preserve the supplier's own result order within the same priority tier.
  const ordered = eligible
    .map((p, index) => ({ p, index }))
    .sort((a, b) =>
      (PROVIDER_PRIORITY[a.p.provider] ?? 3) - (PROVIDER_PRIORITY[b.p.provider] ?? 3) ||
      a.index - b.index)
    .map(({ p }) => p);

  for (const category of SHOWCASE) {
    if (picked.length >= limit) break;
    add(ordered.find((p) => !used.has(p.id) && p.categories.includes(category)));
  }
  for (const product of ordered) {
    if (picked.length >= limit) break;
    add(product);
  }
  return picked;
}

export default async function HomepageFeaturedTours() {
  let products: MarketplaceProduct[] = [];
  try {
    const result = await getHomepageInventory();
    products = selectHomepageTours(result.items);
  } catch {
    // Provider interruptions must not prevent the homepage from rendering.
    // The category links below remain usable without a live supplier response.
  }

  return (
    <>
      {products.length ? (
        <ul className="mk-grid home-tour-grid" data-testid="homepage-tour-products">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} compact priority={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="home-tour-unavailable" role="status">
          Live listings are temporarily unavailable. Browse the tour catalogue and check availability with the provider.
        </p>
      )}
      <nav className="home-tour-categories" aria-label="Explore Budapest tour categories">
        <Link href="/tours?category=cruises">Danube cruises ↗</Link>
        <Link href="/tours?category=baths">Thermal baths ↗</Link>
        <Link href="/tours?category=walking">Walking tours ↗</Link>
        <Link href="/tours?category=daytrips">Day trips ↗</Link>
      </nav>
    </>
  );
}
