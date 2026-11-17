import { loadContent } from "../content";
import type { Attraction } from "../types";
import { matchVenue } from "./attraction-match";
import { cardImage } from "./images";
import { illustrativePhotoOf } from "./illustrative-photos";
import type { MarketplaceProduct, MarketplaceResult, VenuePhoto } from "./types";

// A credited photo of the exact venue takes priority. If none matches, use a clearly labelled
// and credited editorial illustration instead of leaving a giant empty tour card.
// Usable supplier photos always take priority; no booking or product data is changed.
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
      const photo = p.venuePhoto ?? venuePhotoOf(p.title, attractions) ?? illustrativePhotoOf(p);
      if (!photo) return p;
      // A usable supplier photo always wins; ours only waits behind it in case it fails to load.
      return cardImage(p.image) ? { ...p, fallbackPhoto: photo } : { ...p, venuePhoto: photo };
    }),
  };
}

// Server-side: the attractions come from the same content layer as the editorial pages (Sanity
// when populated, the local seed otherwise).
export async function withVenuePhotos(result: MarketplaceResult): Promise<MarketplaceResult> {
  if (!result.items.length) return result;
  try {
    const { attractions } = await loadContent();
    return attachVenuePhotos(result, attractions);
  } catch {
    // Even without Sanity, the already bundled, credited category illustrations work.
    return attachVenuePhotos(result, []);
  }
}
