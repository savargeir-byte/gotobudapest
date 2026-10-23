import data from "./attractions.json";
import photoData from "./photos.json";

export type PhotoCredit = {
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};
export type Photo = {
  src640: string;
  src1280: string;
  alt: string;
  credit?: PhotoCredit;
};
export const photos = photoData as unknown as Record<string, Photo>;

type AttractionData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  checked: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number };
  status?: string;
  notice?: string;
  additionalSource?: string;
  image?: string;
  imageAlt?: string;
};
export type Attraction = AttractionData & { photo?: Photo };

// Photographs that shipped with the first design stay valid; verified
// additional photographs from lib/photos.json fill in the rest.
export const attractions: Attraction[] = (data as AttractionData[]).map(
  (a) => ({
    ...a,
    photo: a.image
      ? {
          src640: `/assets/${a.image}`,
          src1280: `/assets/${a.image}`,
          alt: a.imageAlt || a.name,
        }
      : photos[a.slug],
  }),
);
export function getAttraction(slug: string) {
  return attractions.find((a) => a.slug === slug);
}
export function attractionsBySlug(slugs: string[]) {
  return slugs
    .map((s) => getAttraction(s))
    .filter((a): a is Attraction => a !== undefined);
}
export function suggestedGuides(category: string) {
  return category === "Baths & wellness"
    ? ["budapest-thermal-baths", "getting-around-budapest"]
    : category === "Landmarks"
      ? ["budapest-in-3-days", "buda-castle-district", "danube-cruises"]
      : ["budapest-in-3-days", "getting-around-budapest"];
}
