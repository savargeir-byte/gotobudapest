// Search titles for pages whose on-page heading is deliberately editorial ("Soak up the city"): the heading stays as it is,
// the <title> names what the page is about. Keyed by path. Titles must stay specific to the page (no two pages share one).
export const seoTitleOverrides: Record<string, string> = {
  "/experiences/danube": "Budapest Danube Experiences: Walks, Bridges & Cruises",
  "/experiences/food-and-markets": "Budapest Food Experiences: Markets, Cafés & Tastings",
  "/experiences/thermal-baths": "Budapest Thermal Baths: Plan a Slow Spa Day",
};
