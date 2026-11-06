import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { loadContent } from "@/lib/content";
import { visitorGuides } from "@/lib/visitor-guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { attractions, guides, experiences, neighbourhoods } =
    await loadContent();
  const entry = (
    path: string,
    priority: number,
    lastModified?: string,
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    priority,
    ...(lastModified ? { lastModified } : {}),
  });
  return [
    entry("/", 1),
    entry("/attractions", 0.9),
    entry("/experiences", 0.8),
    entry("/tours", 0.8),
    entry("/neighbourhoods", 0.8),
    entry("/guides", 0.8),
    entry("/essentials", 0.6),
    entry("/visitor-guides", 0.8),
    entry("/currency", 0.7),
    entry("/transportation", 0.8),
    entry("/gastronomy", 0.8),
    entry("/culture", 0.8),
    entry("/visit", 0.8),
    ...visitorGuides.map((g) => entry(`/${g.group}/${g.slug}`, 0.65)),
    entry("/privacy", 0.2),
    ...experiences.map((t) => entry(`/experiences/${t.slug}`, 0.7)),
    ...neighbourhoods.map((t) => entry(`/neighbourhoods/${t.slug}`, 0.7)),
    ...guides.map((g) => entry(`/guides/${g.slug}`, 0.7, g.updated || undefined)),
    ...attractions.map((a) => entry(`/attractions/${a.slug}`, 0.5, a.checked || undefined)),
  ];
}
