import { photos as verifiedPhotos } from "../attractions";
import type { MarketplaceProduct, VenuePhoto } from "./types";

// A clearly labelled, licensed editorial illustration when the provider has no usable photo.
// These photos illustrate the city or a broad category, NEVER a specific supplier product.
// The source photos are already shipped in public/assets/photos and credited in lib/photos.json.
type Pick = { slug: string; subject: string };
const SKYLINE: Pick = { slug: "g-skyline", subject: "the Budapest skyline" };

export function illustrativePhotoOf(product: MarketplaceProduct): VenuePhoto | undefined {
  const title = product.title.toLowerCase();
  const categories = product.categories;

  // A city card/pass includes many unrelated attractions; do not imply any one venue or bath.
  const isMultiAttractionPass = /\b(?:card|city pass|museum pass|hop[\s-]?on[\s-]?hop[\s-]?off)\b/.test(title);
  let pick: Pick = SKYLINE;
  if (!isMultiAttractionPass) {
    if (/\b(?:cruise|riverboat|boat trip|boat tour|danube)\b/.test(title) || categories.includes("cruises")) {
      pick = { slug: "g-cruise", subject: "a Danube cruise scene in Budapest" };
    } else if (/\b(?:thermal|spa|bath|baths|wellness)\b/.test(title) || categories.includes("baths")) {
      if (/luk[aá]cs|szt\.?\s*lukacs/.test(title))
        pick = { slug: "lukacs-thermal-bath", subject: "Lukács Thermal Bath" };
      else if (/sz[eé]chenyi/.test(title))
        pick = { slug: "szechenyi-thermal-bath", subject: "Széchenyi Thermal Bath" };
      else if (/gell[eé]rt/.test(title))
        pick = { slug: "gellert-thermal-bath", subject: "Gellért Thermal Bath" };
      else
        pick = { slug: "g-bath-inside", subject: "Széchenyi Thermal Bath in Budapest" };
    } else if (categories.includes("nightlife")) {
      pick = { slug: "g-nightlife", subject: "a Budapest ruin bar" };
    } else if (categories.includes("food")) {
      pick = { slug: "g-market", subject: "Budapest's Great Market Hall" };
    } else if (categories.includes("family")) {
      pick = { slug: "city-park-varosliget", subject: "Budapest City Park" };
    }
    // Tours, passes, day trips, transfers, attraction tickets and unclassified products use
    // a neutral Budapest skyline. We do not pretend a specific venue is on their itinerary.
  }

  const photo = verifiedPhotos[pick.slug];
  if (!photo?.credit || !photo.src640 || !photo.src1280) return undefined;
  const { credit } = photo;
  return {
    src640: photo.src640,
    src1280: photo.src1280,
    alt: photo.alt,
    venue: pick.subject,
    venueSlug: pick.slug,
    relation: "illustrative",
    credit: {
      title: credit.title,
      author: credit.author,
      license: credit.license,
      licenseUrl: credit.licenseUrl,
      sourceUrl: credit.sourceUrl,
    },
  };
}
