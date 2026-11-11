import type { SourceLink } from "../types";

// Extra editorial for a neighbourhood page. It is layered on top of the Sanity document (see index.ts): the Sanity text is kept and
// these sections are appended; nothing here is written to Sanity.
export type NeighbourhoodEditorial = {
  slug: string;
  checked: string; // YYYY-MM-DD
  sections: { title: string; paragraphs: string[] }[];
  highlights?: string[];
  placeSlugs?: string[];
  guides?: string[];
  sources: SourceLink[];
  seo?: { title: string; description: string };
};
