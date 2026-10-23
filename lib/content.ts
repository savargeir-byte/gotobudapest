import { attractions } from "./attractions";
import content from "./content.json";
export type Place = {
  id: string;
  name: string;
  area: string;
  category: string;
  tag: string;
  image?: string;
  time: string;
  desc: string;
  body: string;
  url: string;
};
export const places: Place[] = content.places;
export const experiences = content.experiences as unknown as Record<
  string,
  [string, string, string | null]
>;
export const days = content.days as [string, [string, string, string][]][];

export const savedPlaces: Place[] = [
  ...places,
  ...attractions
    .filter((a) => !places.some((p) => p.id === a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      area: a.address || "Budapest & surroundings",
      category: a.category,
      tag: a.category,
      image: a.image,
      time: "Check current visitor information",
      desc: a.description,
      body: a.description,
      url: a.sourceUrl,
    })),
];
