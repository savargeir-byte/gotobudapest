// The 90-attraction expansion (see lib/new-attractions/types.ts for the data format and validate.ts for the quality gate).
//
// Like the earlier supplements (lib/attraction-supplements.ts), these places are served from the repository and only added when the
// dataset has no attraction with the same slug, so a Sanity document (created in Studio or by a seed run) always wins.
// Neighbourhood pages list the places that name them in `neighbourhoods` (Sanity neighbourhoods do not know the new places yet).
import { longFormBodyFrom } from "../attraction-long-form";
import { textToBlocks } from "../portable-text";
import type { Attraction, AttractionHistory, Photo } from "../types";
import { batches, photoRegistries } from "./generated";
import type { NewAttraction, NewPhoto } from "./types";

export const newPhotoRegistry: Record<string, NewPhoto> = Object.assign({}, ...photoRegistries);
export const newAttractionData: NewAttraction[] = batches.flat();

function toAttraction(d: NewAttraction): Attraction {
  const photo = d.photoKey ? (newPhotoRegistry[d.photoKey] as Photo | undefined) : undefined;
  const history: AttractionHistory = {
    intro: d.history.intro,
    sections: d.history.sections.map((s, i) => ({
      heading: s.heading,
      body: textToBlocks(s.paragraphs, undefined, `${d.slug}-h${i}`),
    })),
    stories: [],
    sources: d.sources,
  };
  return {
    id: d.slug,
    slug: d.slug,
    name: d.name,
    nameHu: d.nameHu,
    category: d.category,
    description: d.intro,
    body: longFormBodyFrom(d.slug, { description: d.intro, paragraphs: d.about, tips: d.tips, sources: d.sources, checked: d.checked }),
    sourceUrl: d.sources[0].url,
    sourceLabel: d.sources[0].label,
    checked: d.checked,
    address: d.address,
    coordinates: d.coordinates,
    notice: d.outsideBudapest
      ? `${d.name} lies outside Budapest, so allow time for the journey and check the official information before you travel.`
      : undefined,
    photo,
    history,
    relatedGuides: d.relatedGuides,
    seo: d.seo,
  };
}

export const newAttractions: Attraction[] = newAttractionData.map(toAttraction);

/** Adds the topic's new places (those whose `neighbourhoods` name it) after the places it already lists. */
export function withNewNeighbourhoodPlaces<T extends { slug: string; placeSlugs: string[] }>(topics: T[]): T[] {
  return topics.map((t) => {
    const extra = newAttractionData.filter((d) => d.neighbourhoods.includes(t.slug) && !t.placeSlugs.includes(d.slug)).map((d) => d.slug);
    return extra.length ? { ...t, placeSlugs: [...t.placeSlugs, ...extra] } : t;
  });
}
