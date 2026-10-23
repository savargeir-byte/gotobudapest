import "server-only";
import { cache } from "react";
import { sanityFetch } from "./sanity/client";
import {
  attractionsQuery,
  experiencesQuery,
  guidesQuery,
  neighbourhoodsQuery,
  settingsQuery,
} from "./sanity/queries";
import {
  mapAttraction,
  mapGuide,
  mapSettings,
  mapTopic,
  type RawAttraction,
  type RawGuide,
  type RawSettings,
  type RawTopic,
} from "./sanity/mappers";
import { localContent } from "./local-content";
import type { Attraction, Guide, Photo, SiteContent, Topic } from "./types";

// Content comes from Sanity (published documents only). Each collection falls
// back to the original local content when Sanity returns nothing or fails, so a
// CMS outage or an empty dataset can never take the site down.

const defaultPhoto: Photo = {
  src640: "/assets/city.webp",
  src1280: "/assets/city.webp",
  alt: "Budapest's bridges crossing the Danube, with Buda on the left and Pest on the right",
};

async function safe<T>(label: string, run: () => Promise<T[]>): Promise<T[]> {
  try {
    return await run();
  } catch (error) {
    // Message only: never log request objects, which could carry credentials.
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[content] Sanity ${label} unavailable, using local content: ${message}`);
    return [];
  }
}

function compact<T>(list: (T | undefined)[]): T[] {
  return list.filter((x): x is T => x !== undefined);
}

export const loadContent = cache(async (): Promise<SiteContent> => {
  const local = localContent();
  const localGuidePhoto = (slug: string) =>
    local.guides.find((g) => g.slug === slug)?.photo ?? defaultPhoto;
  const localTopicPhoto = (slug: string) =>
    [...local.experiences, ...local.neighbourhoods].find((t) => t.slug === slug)
      ?.photo ?? defaultPhoto;

  const [rawA, rawG, rawE, rawN, rawS] = await Promise.all([
    safe("attractions", () => sanityFetch<RawAttraction[]>(attractionsQuery)),
    safe("guides", () => sanityFetch<RawGuide[]>(guidesQuery)),
    safe("experiences", () => sanityFetch<RawTopic[]>(experiencesQuery)),
    safe("neighbourhoods", () => sanityFetch<RawTopic[]>(neighbourhoodsQuery)),
    safe("settings", async () => {
      const s = await sanityFetch<RawSettings>(settingsQuery);
      return s ? [s] : [];
    }),
  ]);

  const attractions = compact(rawA.map(mapAttraction));
  const guides = compact(rawG.map((g) => mapGuide(g, localGuidePhoto(g.slug))));
  const experiences = compact(rawE.map((t) => mapTopic(t, localTopicPhoto(t.slug))));
  const neighbourhoods = compact(rawN.map((t) => mapTopic(t, localTopicPhoto(t.slug))));

  return {
    attractions: attractions.length ? attractions : local.attractions,
    guides: guides.length ? guides : local.guides,
    experiences: experiences.length ? experiences : local.experiences,
    neighbourhoods: neighbourhoods.length ? neighbourhoods : local.neighbourhoods,
    settings: mapSettings(rawS[0] ?? null, local.settings),
  };
});

// Lookup helpers over a loaded dataset.
export const bySlug = <T extends { slug: string }>(list: T[], slug: string) =>
  list.find((x) => x.slug === slug);
export const pick = <T extends { slug: string }>(list: T[], slugs: string[]) =>
  compact(slugs.map((s) => bySlug(list, s)));

export function suggestedGuideSlugs(a: Attraction, guides: Guide[]) {
  const wanted = a.relatedGuides?.length
    ? a.relatedGuides
    : a.category === "Baths & wellness"
      ? ["budapest-thermal-baths", "getting-around-budapest"]
      : a.category === "Landmarks"
        ? ["budapest-in-3-days", "buda-castle-district", "danube-cruises"]
        : ["budapest-in-3-days", "getting-around-budapest"];
  return pick(guides, wanted);
}

// Experience and neighbourhood pages that feature a given attraction.
export function topicsForPlace(content: SiteContent, slug: string) {
  return [
    ...content.experiences.map((t) => ({ t, base: "/experiences" })),
    ...content.neighbourhoods.map((t) => ({ t, base: "/neighbourhoods" })),
  ]
    .filter(({ t }) => t.placeSlugs.includes(slug))
    .map(({ t, base }) => ({ title: t.title, href: `${base}/${t.slug}` }));
}

export type { Topic };
