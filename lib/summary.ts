import { readingMinutes } from "./portable-text";
import type { Attraction, Guide } from "./types";

// Lightweight projection for client components: keeps the RSC payload small by
// leaving out rich text, galleries and credits.
export type AttractionSummary = Pick<
  Attraction,
  "id" | "slug" | "name" | "category" | "description" | "status" | "address"
> & { photo?: { src640: string; alt: string } };

export function summarize(a: Attraction): AttractionSummary {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    category: a.category,
    description: a.description,
    status: a.status,
    address: a.address,
    photo: a.photo ? { src640: a.photo.src640, alt: a.photo.alt } : undefined,
  };
}

export type GuideSummary = Pick<
  Guide,
  "slug" | "title" | "shortTitle" | "category" | "description"
> & { photo: { src640: string; alt: string }; minutes: number };

export function summarizeGuide(g: Guide): GuideSummary {
  return {
    slug: g.slug,
    title: g.title,
    shortTitle: g.shortTitle,
    category: g.category,
    description: g.description,
    photo: { src640: g.photo.src640, alt: g.photo.alt },
    minutes: readingMinutes(g),
  };
}
