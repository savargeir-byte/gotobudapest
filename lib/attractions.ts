import data from "./attractions.json";
export type Attraction = {
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
export const attractions: Attraction[] = data;
export function getAttraction(slug: string) {
  return attractions.find((a) => a.slug === slug);
}
export function suggestedGuides(category: string) {
  return category === "Baths & wellness"
    ? ["budapest-thermal-baths", "getting-around-budapest"]
    : category === "Landmarks"
      ? ["budapest-in-3-days", "buda-castle-district", "danube-cruises"]
      : ["budapest-in-3-days", "getting-around-budapest"];
}
