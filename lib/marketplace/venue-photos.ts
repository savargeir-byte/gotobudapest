import { loadContent } from "../content";
import type { Attraction } from "../types";
import { matchVenue } from "./attraction-match";
import type { MarketplaceProduct, MarketplaceResult, VenuePhoto } from "./types";

// Our own, correctly credited photograph of the exact venue a product is about, for products
// that arrive without any licensed supplier photo (Tiqets on this key tier). It is an editorial
// venue photograph, never the supplier's photo of the product: the card says so. Products that
// already carry a provider photo (Viator) are left exactly as they are.
export function venuePhotoOf(title: string, attractions: Attraction[]): VenuePhoto | undefined {
  const m = matchVenue(title, attractions);
  if (!m) return undefined;
  const { photo } = m;
  const size = photo as { width?: number; height?: number };
  return {
    src640: photo.src640,
    src1280: photo.src1280,
    ...(size.width && size.height ? { width: size.width, height: size.height } : {}),
    alt: photo.alt,
    venue: m.name,
    venueSlug: m.slug,
    relation: m.relation,
    credit: {
      author: photo.credit.author,
      license: photo.credit.license,
      licenseUrl: photo.credit.licenseUrl,
      sourceUrl: photo.credit.sourceUrl,
      title: photo.credit.title,
    },
  };
}

export function attachVenuePhotos<T extends { items: MarketplaceProduct[] }>(result: T, attractions: Attraction[]): T {
  return {
    ...result,
    items: result.items.map((p) => {
      if (p.image || p.venuePhoto) return p;
      const venuePhoto = venuePhotoOf(p.title, attractions);
      return venuePhoto ? { ...p, venuePhoto } : p;
    }),
  };
}

// Server-side: the attractions come from the same content layer as the editorial pages (Sanity
// when populated, the local seed otherwise).
export async function withVenuePhotos(result: MarketplaceResult): Promise<MarketplaceResult> {
  if (!result.items.some((p) => !p.image)) return result;
  try {
    const { attractions } = await loadContent();
    return attachVenuePhotos(result, attractions);
  } catch {
    // Content unavailable: cards simply stay text cards.
    return result;
  }
}
