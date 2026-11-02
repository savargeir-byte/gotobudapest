import type { AttractionLongForm } from "../attraction-long-form";
import type { HistorySeed } from "../attraction-history-batch-a";
import type { GuideSection } from "../guides";
import type { InlinePhotoPlacement } from "../inline-photos";
import g01Long from "./g01-long-form.json";
import g02Long from "./g02-long-form.json";
import g03Long from "./g03-long-form.json";
import g04Long from "./g04-long-form.json";
import g05Long from "./g05-long-form.json";
import g06Long from "./g06-long-form.json";
import g07Long from "./g07-long-form.json";
import g08Long from "./g08-long-form.json";
import g09Long from "./g09-long-form.json";
import g10Long from "./g10-long-form.json";
import g01History from "./g01-history.json";
import g02History from "./g02-history.json";
import g03History from "./g03-history.json";
import g04History from "./g04-history.json";
import g05History from "./g05-history.json";
import g06History from "./g06-history.json";
import g07History from "./g07-history.json";
import g08History from "./g08-history.json";
import g09History from "./g09-history.json";
import g10History from "./g10-history.json";
import guideGettingAround from "./guide-getting-around-budapest.json";
import guideNightlife from "./guide-budapest-bars-nightlife.json";
import guideFood from "./guide-budapest-food-and-markets.json";

/**
 * Researched editorial batches. Each JSON file is written from fetched sources and checked by
 * scripts/validate-batches.mjs (word counts, sources, no prices or opening times, labelled traditions).
 * This module only gathers them; lib/attraction-long-form.ts, lib/attraction-editorial-expanded.ts,
 * lib/guides.ts and lib/inline-photos.ts consume the exports below, and scripts/sanity-seed.ts migrates
 * the same data through lib/local-content.ts.
 */
export const batchLongForm = Object.assign(
  {},
  g01Long, g02Long, g03Long, g04Long, g05Long, g06Long, g07Long, g08Long, g09Long, g10Long,
) as Record<string, AttractionLongForm>;

export const batchHistories = [
  ...g01History, ...g02History, ...g03History, ...g04History, ...g05History,
  ...g06History, ...g07History, ...g08History, ...g09History, ...g10History,
] as unknown as HistorySeed[];

export type BatchGuide = {
  sections: GuideSection[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  places: string[];
  photos: InlinePhotoPlacement[];
};

export const batchGuides = {
  "getting-around-budapest": guideGettingAround,
  "budapest-bars-nightlife": guideNightlife,
  "budapest-food-and-markets": guideFood,
} as unknown as Record<string, BatchGuide>;

/** Attractions a guide mentions: shown as "Places mentioned in this guide" links. */
export const guidePlaces = (guideSlug: string): string[] => batchGuides[guideSlug]?.places ?? [];
