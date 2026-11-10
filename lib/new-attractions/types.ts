// Data format of the 90-attraction expansion. One JSON file per batch part (lib/new-attractions/data/batch-NN-x.json) holds an
// array of NewAttraction; lib/new-attractions/index.ts turns them into the site's Attraction type and
// lib/new-attractions/validate.ts is the quality gate (also run by tests/new-attractions.test.ts).
//
// Writing rules (same as lib/attraction-long-form.ts): every fact is stated by one of the cited sources; nothing is rounded up;
// opening hours, ticket prices and booking conditions are NEVER stated (the text sends the reader to the official source);
// a legend or tradition is never presented as established history.

export type NewSource = { label: string; url: string };
export type NewSection = { heading: string; paragraphs: string[] };

export type NewAttraction = {
  slug: string;
  name: string;
  /** The place's Hungarian name (the same as `name` when the English name is simply the Hungarian one). */
  nameHu: string;
  category:
    | "Landmarks"
    | "Museums"
    | "Sacred architecture"
    | "Arts & culture"
    | "Food & markets"
    | "Parks & outdoors"
    | "Baths & wellness"
    | "Nightlife";
  /** Postal address or the clearest verifiable location description. */
  address: string;
  coordinates: { latitude: number; longitude: number };
  /** Budapest district in roman numerals, e.g. "VII", when the place is in Budapest. */
  district?: string;
  /** True for a destination outside Budapest (a day trip): it gets the day-trip tour row and the car-rental card. */
  outsideBudapest?: boolean;
  /** Slugs from the 35 published neighbourhoods this place belongs to (empty only when outsideBudapest). */
  neighbourhoods: string[];
  /** 40-70 words: the card text and the page introduction. */
  intro: string;
  /** "About" paragraphs: what the place is, what visitors can see and do. No hours, no prices. */
  about: string[];
  /** Practical visiting points without invented hours or prices; they send the reader to the official source. */
  tips: string[];
  history: { intro: string; sections: NewSection[] };
  /** At least two, at least one that is not Wikipedia. */
  sources: NewSource[];
  /** Existing attraction slugs (published Sanity or earlier batches) worth visiting next. */
  relatedPlaces: string[];
  /** Existing guide slugs. */
  relatedGuides: string[];
  /** Key into lib/new-attractions/data/photos-*.json, or null while the place is flagged for photography. */
  photoKey: string | null;
  photoStatus: "ok" | "needs-photography";
  seo: { title: string; description: string };
  checked: string;
};

export type NewPhoto = {
  src640: string;
  src1280: string;
  width: number;
  height: number;
  alt: string;
  credit: { title: string; author: string; license: string; licenseUrl: string; sourceUrl: string };
};
