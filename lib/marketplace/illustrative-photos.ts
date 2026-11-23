import { photos as verifiedPhotos } from "../attractions";
import type { MarketplaceProduct, VenuePhoto } from "./types";

// A clearly labelled, licensed editorial illustration when the provider has no usable photo.
// These photos illustrate the city or a broad category, NEVER a specific supplier product.
// The source photos are already shipped in public/assets/photos and credited in lib/photos.json.
type Choice = { slug: string; subject: string };
const SKYLINE: Choice = { slug: "g-skyline", subject: "the Budapest skyline" };

// Generic city views for products that name no venue and fit no category (walking tours, transfers,
// day trips, unclassified tickets). One is chosen from the title, so the same product always gets
// the same picture (server and browser agree) while neighbouring cards do not all look alike.
// Daytime views only: a night photograph is used just when the title itself says night or evening.
export const CITY_VIEWS: Choice[] = [
  SKYLINE,
  { slug: "g-tram", subject: "a tram in Budapest" },
  { slug: "chain-bridge", subject: "the Chain Bridge in Budapest" },
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function illustrativePhotoOf(product: Pick<MarketplaceProduct, "title" | "categories">): VenuePhoto | undefined {
  const title = product.title.toLowerCase();
  const categories = product.categories;

  // A city card/pass includes many unrelated attractions; do not imply any one venue or bath.
  const isMultiAttractionPass = /\b(?:card|city pass|museum pass|budapest pass|hop[\s-]?on[\s-]?hop[\s-]?off)\b/.test(title);
  const isDayTrip = categories.includes("daytrips") || /(?:day trip|day tour|full[- ]day|half[- ]day|excursion|danube bend)/.test(title);
  let pick: Choice = CITY_VIEWS[hash(title) % CITY_VIEWS.length];
  if (isMultiAttractionPass) {
    pick = SKYLINE;
  } else if (isDayTrip) {
    // Day trips leave the city and often include lunch: never a market, bath or bar photograph; a city view stands for the departure point.
  } else if (/\b(?:cruise|riverboat|boat trip|boat tour)\b/.test(title) || categories.includes("cruises")) {
    pick = { slug: "g-cruise", subject: "a Danube cruise scene in Budapest" };
  } else if (/\b(?:thermal|spa|bath|baths|wellness)\b/.test(title) || categories.includes("baths")) {
    if (/luk[aá]cs|szt\.?\s*lukacs/.test(title)) pick = { slug: "lukacs-thermal-bath", subject: "Lukács Thermal Bath" };
    else if (/sz[eé]chenyi/.test(title)) pick = { slug: "szechenyi-thermal-bath", subject: "Széchenyi Thermal Bath" };
    else if (/gell[eé]rt/.test(title)) pick = { slug: "gellert-thermal-bath", subject: "Gellért Thermal Bath" };
    else pick = { slug: "g-bath-inside", subject: "Széchenyi Thermal Bath in Budapest" };
  } else if (categories.includes("nightlife")) {
    pick = { slug: "g-nightlife", subject: "a Budapest ruin bar" };
  } else if (/\b(?:night|evening|after dark)\b/.test(title)) {
    pick = { slug: "g-nightview", subject: "Budapest at night" };
  } else if (categories.includes("food")) {
    pick = { slug: "g-market", subject: "Budapest's Great Market Hall" };
  } else if (categories.includes("family")) {
    pick = { slug: "city-park-varosliget", subject: "Budapest City Park" };
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
