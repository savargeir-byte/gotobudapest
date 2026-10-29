import attractionData from "./attractions.json";
import type { AttractionEditorial } from "./attraction-editorial";
import { historySeedsA } from "./attraction-history-batch-a";
import { historySeedsB } from "./attraction-history-batch-b";
import { historySeedsC } from "./attraction-history-batch-c";

/**
 * Additional independently authored histories for attractions already in the
 * 100-place directory. Built from source-backed editorial seeds so a future
 * Sanity migration can preserve historySections/stories/sources 1:1.
 *
 * IMPORTANT: absent folklore is intentionally left absent, not invented.
 */
const directory = new Map(attractionData.map((attraction) => [attraction.slug, attraction]));
const seeds = [...historySeedsA, ...historySeedsB, ...historySeedsC];

export const expandedAttractionEditorial: Record<string, AttractionEditorial> =
  Object.fromEntries(
    seeds.map(({ slug, introduction, chapters, stories, additionalSources }) => {
      const place = directory.get(slug);
      if (!place) throw new Error(`History references an unknown Budapest attraction: ${slug}`);
      return [
        slug,
        {
          introduction,
          historySections: chapters.map(([heading, narrative]) => ({
            heading,
            paragraphs: [narrative],
          })),
          ...(stories?.length ? { stories } : {}),
          sources: [
            { label: `${place.name} — Budapest visitor information`, url: place.sourceUrl },
            ...(additionalSources ?? []),
          ],
        } satisfies AttractionEditorial,
      ];
    }),
  );
