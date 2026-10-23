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
