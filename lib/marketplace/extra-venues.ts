// Places that Budapest products are about but that are not attractions of this site, together with a
// credited photograph (lib/photos.json, added by scripts/add-venue-photos.mjs from Wikimedia Commons).
// Only venues with a real, correctly credited photograph belong here; the matcher ignores an entry
// whose photograph is missing. Keep names specific: a venue matches only on its full name or alias.
export type ExtraVenue = { slug: string; name: string; aliases: string[] };

export const EXTRA_VENUES: ExtraVenue[] = [
  { slug: "memento-park", name: "Memento Park", aliases: ["Memento Statue Park"] },
  {
    slug: "godollo-royal-palace",
    name: "Royal Palace of Gödöllő",
    aliases: ["Gödöllő Royal Palace", "Gödöllő Palace", "Sisi's Gödöllő Palace"],
  },
];
