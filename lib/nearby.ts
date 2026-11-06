// Places close to an attraction, worked out from the coordinates we already hold. No distance is estimated or invented:
// it is the straight-line (great-circle) distance between two stored points, shown rounded and labelled as such. It is
// not a walking route and says nothing about opening hours or access.
type Located = { slug: string; name: string; coordinates?: { latitude: number; longitude: number } };

const EARTH_RADIUS_M = 6_371_008.8;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres (haversine). */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "about 450 m" below a kilometre (to the nearest 50 m), "about 1.3 km" above. */
export function formatDistance(meters: number): string {
  // Rounded first, so 975-999 m reads "about 1.0 km" rather than "about 1000 m".
  const rounded = Math.round(meters / 50) * 50;
  if (rounded < 1000) return `about ${Math.max(50, rounded)} m`;
  return `about ${(Math.round(meters / 100) / 10).toFixed(1)} km`;
}

/**
 * The nearest other places within `radiusMeters`, nearest first. Places without coordinates are skipped, and an
 * attraction without coordinates has no neighbours (nothing is guessed).
 */
export function nearbyPlaces<T extends Located>(
  place: Located,
  all: T[],
  { max = 4, radiusMeters = 1500 }: { max?: number; radiusMeters?: number } = {},
): { place: T; meters: number }[] {
  const origin = place.coordinates;
  if (!origin) return [];
  return all
    .flatMap((p) => {
      if (p.slug === place.slug || !p.coordinates) return [];
      const meters = distanceMeters(origin, p.coordinates);
      return meters <= radiusMeters ? [{ place: p, meters }] : [];
    })
    .sort((x, y) => x.meters - y.meters || x.place.name.localeCompare(y.place.name))
    .slice(0, max);
}
