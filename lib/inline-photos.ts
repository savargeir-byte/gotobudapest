/**
 * Editorial photograph placements.
 *
 * Source assets are the locally stored, licensed photographs registered in
 * lib/photos.json. This is the static seed for a future Sanity Portable Text
 * guide template: each image becomes its own ordered content block.
 *
 * Never replace a place-specific photo with a generic photo described as that
 * venue. Captions below identify the depicted subject.
 */
export type InlinePhotoPlacement = {
  after: string;
  photoKey: string;
  caption: string;
};

export const guideInlinePhotos: Record<string, InlinePhotoPlacement[]> = {
  "downtown-pest-walking-guide": [
    { after: "stops-with-a-story", photoKey: "dohany-street-synagogue", caption: "The Dohány Street Synagogue, described as the largest synagogue in Europe." },
  ],
  "budapest-in-3-days": [
    { after: "landmarks-at-a-glance", photoKey: "heroes-square", caption: "The Millennium Monument and colonnades of Heroes' Square, at the head of Andrássy Avenue." },
    { after: "before-you-start", photoKey: "g-tram", caption: "Budapest's yellow trams are a familiar sight as you explore the city." },
    { after: "day-one", photoKey: "hood-castle", caption: "Matthias Church and Trinity Square in the historic Castle District." },
    { after: "day-two", photoKey: "hungarian-parliament", caption: "The Parliament building on the Pest bank of the Danube." },
    { after: "day-three", photoKey: "szechenyi-thermal-bath-pools", caption: "The outdoor pools of Széchenyi Thermal Bath in City Park." },
  ],
  "budapest-thermal-baths": [
    { after: "bath-history", photoKey: "lukacs-thermal-bath", caption: "The roof terrace of the Lukács Thermal Bath, which says it has used these springs since at least the twelfth century." },
    { after: "choose-your-bath", photoKey: "g-bath-inside", caption: "Bathers enjoying the pools at Széchenyi Thermal Bath." },
    { after: "szechenyi", photoKey: "szechenyi-thermal-bath-pools", caption: "Another look at Széchenyi's outdoor bathing area." },
    { after: "rudas", photoKey: "rudas-thermal-bath", caption: "Rudas Thermal Bath on the Buda side. Check its current session rules." },
    { after: "gellert-closure", photoKey: "gellert-thermal-bath", caption: "Gellért Thermal Bath — currently closed for renovation; not an available bathing stop." },
  ],
  "getting-around-budapest": [
    { after: "plan-your-day", photoKey: "chain-bridge", caption: "Walking across the Chain Bridge is a scenic way to move between Buda and Pest." },
    { after: "buy-and-validate", photoKey: "underground-railway-museum", caption: "The Underground Railway Museum illustrates Budapest's long public-transport history, not current ticket validation." },
    { after: "choose-ticket", photoKey: "buda-castle-funicular", caption: "The Buda Castle Funicular uses a separate ticket from ordinary transport services." },
  ],
  "buda-castle-district": [
    { after: "castle-hill-timeline", photoKey: "hungarian-national-gallery", caption: "The Royal Palace on Castle Hill, which houses the Hungarian National Gallery." },
    { after: "arrival", photoKey: "buda-castle-funicular", caption: "The historic funicular connects the river level with Castle Hill." },
    { after: "trinity-square", photoKey: "matthias-church", caption: "Matthias Church and its distinctive roof tiles on Castle Hill." },
    { after: "bastion", photoKey: "toth-arpad-promenade", caption: "A quieter view from the Tóth Árpád Promenade along Castle Hill." },
    { after: "wander", photoKey: "buda-castle-district", caption: "The Royal Palace area within Budapest's Castle District." },
  ],
  "danube-cruises": [
    { after: "what-you-see-from-the-water", photoKey: "fishermans-bastion", caption: "Fisherman's Bastion on Castle Hill, one of the landmarks above the river." },
    { after: "choose-format", photoKey: "chain-bridge", caption: "The Chain Bridge is one of the landmarks visible along central Danube routes." },
    { after: "day-or-evening", photoKey: "g-nightview", caption: "Budapest's illuminated riverfront offers a different atmosphere after dark." },
    { after: "route-changes", photoKey: "hungarian-parliament", caption: "Parliament is a major Danube landmark; confirm whether your chosen boat passes it." },
  ],
  "budapest-bars-nightlife": [
    { after: "choose-evening", photoKey: "g-nightview", caption: "Budapest's riverfront lit up after dark — an alternative to a bar-focused evening." },
    { after: "ruin-bars", photoKey: "dohany-street-synagogue", caption: "Dohány Street Synagogue in Budapest's historic Jewish Quarter, home to many nightlife streets — not a photograph of a bar." },
    { after: "rooftops", photoKey: "st-stephens-basilica", caption: "St Stephen's Basilica, beside the area where High Note SkyBar is located." },
    { after: "practical", photoKey: "g-tram", caption: "Budapest's public transport can form part of the journey back after an evening out; check late services." },
  ],
};

export const topicInlinePhotos: Record<string, InlinePhotoPlacement[]> = {
  danube: [
    { after: "Walk both banks", photoKey: "hungarian-parliament", caption: "Parliament viewed from across the Danube." },
    { after: "Cross the bridges on foot", photoKey: "chain-bridge", caption: "The Chain Bridge links the city's two banks." },
    { after: "See the city from the water", photoKey: "g-cruise", caption: "A sightseeing cruise boat in front of the Hungarian Parliament." },
    { after: "Take a green break on the river", photoKey: "margaret-island", caption: "Margaret Island provides green space amid the Danube." },
  ],
  "thermal-baths": [
    { after: "Pair a bath with a neighbourhood", photoKey: "szechenyi-thermal-bath-pools", caption: "The outdoor pools of Széchenyi, close to City Park." },
    { after: "Choose the kind of bath you want", photoKey: "rudas-thermal-bath", caption: "Rudas Bath on the Buda riverbank has day- and area-specific visiting arrangements." },
    { after: "Check the status before you plan", photoKey: "gellert-thermal-bath", caption: "Gellért Thermal Bath is closed for renovation; this image does not indicate current access." },
  ],
  "food-and-markets": [
    { after: "Start with the market", photoKey: "great-market-hall", caption: "The Great Market Hall is a classic destination for browsing stalls and ingredients." },
    { after: "Plan one grand café stop", photoKey: "g-cafe", caption: "The decorated interior of the historic Café Gerbeaud." },
    { after: "What to look for on a menu", photoKey: "g-langos", caption: "Lángos, a Hungarian fried-dough speciality often served with savoury toppings." },
  ],
  "castle-district": [
    { after: "Choose your way up", photoKey: "buda-castle-funicular", caption: "The Castle Hill funicular rises above Clark Ádám Square." },
    { after: "Begin at Trinity Square", photoKey: "matthias-church", caption: "Matthias Church is one of Castle Hill's signature landmarks." },
    { after: "Walk towards the palace", photoKey: "buda-castle-district", caption: "The palace quarter on the southern end of Castle Hill." },
    { after: "Find the quieter corners", photoKey: "toth-arpad-promenade", caption: "Tóth Árpád Promenade offers a calmer walk above the Buda hills." },
  ],
  "downtown-pest": [
    { after: "Begin on the riverfront", photoKey: "chain-bridge", caption: "Chain Bridge and its elegant stone gateways near central Pest." },
    { after: "Basilica to Andrássy Avenue", photoKey: "st-stephens-basilica", caption: "St Stephen's Basilica is a defining landmark of central Pest." },
    { after: "Café, square and shopping street", photoKey: "g-cafe", caption: "Inside Café Gerbeaud, near Vörösmarty Square." },
    { after: "Jewish heritage", photoKey: "dohany-street-synagogue", caption: "Dohány Street Synagogue, in the neighbouring Jewish Quarter." },
  ],
};

/** Silent omission is preferable to misrepresenting an unavailable photo. */
export function photoAfter(
  assignments: Record<string, InlinePhotoPlacement[]>,
  slug: string,
  section: string,
) {
  return (assignments[slug] ?? []).filter((item) => item.after === section);
}
