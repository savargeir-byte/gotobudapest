import { attractionsBySlug, photos, type Photo } from "./attractions";

export type TopicSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type TopicFaq = { question: string; answer: string };

export type Topic = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  photoKey: string;
  fallbackPhoto: Photo;
  intro: string;
  highlights: string[];
  faqs: TopicFaq[];
  sections: TopicSection[];
  placesHeading: string;
  placesIntro: string;
  placeSlugs: string[];
  guides: string[];
  sources: { label: string; url: string }[];
};

export const sectionId = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const topicPhoto = (t: Topic): Photo => photos[t.photoKey] ?? t.fallbackPhoto;
export const topicPlaces = (t: Topic) => attractionsBySlug(t.placeSlugs);

const local = (file: string, alt: string): Photo => ({
  src640: `/assets/${file}`,
  src1280: `/assets/${file}`,
  alt,
});

type TopicBase = Omit<Topic, "highlights" | "faqs">;

const experienceBase: TopicBase[] = [
  {
    slug: "danube",
    title: "The Danube, at your pace",
    eyebrow: "RIVERSIDE WALKS & A CITY SEEN FROM THE WATER",
    summary: "Riverside walks, bridges and a city seen from the water.",
    description:
      "How to experience Budapest along the Danube: riverside walks, bridges, viewpoints, green islands and cruise options, with the places to visit on both banks.",
    photoKey: "exp-danube",
    fallbackPhoto: local(
      "danube.webp",
      "The Hungarian Parliament and the Danube seen from the Buda riverbank",
    ),
    intro:
      "The Danube is what holds Budapest together. Buda rises in hills on one bank and Pest spreads out flat on the other, and almost every classic view in the city is a view across the water. You can see the river from a bridge, a promenade, a hilltop terrace or a boat, and each gives you a different city.",
    sections: [
      {
        title: "Walk both banks",
        paragraphs: [
          "Treat the riverfront as a route rather than a single stop. On the Pest side the embankment runs past the Chain Bridge, the Gresham Palace and the Hungarian Academy of Sciences towards the Parliament, and the Shoes on the Danube Bank memorial sits on the same stretch. On the Buda side the road below Castle Hill starts at Clark Ádám Square, the foot of the Chain Bridge and the funicular.",
          "Each bank is the viewpoint for the other. The Pest promenade looks up at Castle Hill and the Bastion; the terraces on Castle Hill look back across to the Parliament and the Pest skyline.",
        ],
        bullets: [
          "Pest bank: Chain Bridge → Gresham Palace → Shoes on the Danube Bank → Parliament.",
          "Buda bank: Clark Ádám Square → the foot of Castle Hill → the Castle Garden Bazaar.",
          "Leave time to stop: most of the good moments here are unplanned.",
        ],
      },
      {
        title: "Cross the bridges on foot",
        paragraphs: [
          "The Chain Bridge is the obvious first crossing, linking Széchenyi István Square in Pest with Clark Ádám Square in Buda. Walking it rather than riding over gives you time to look downstream and upstream, and the bridge ends make natural starting points for either side of the city.",
          "If you have time for a second crossing, pick one further along the river and compare the angle: every bridge frames the Parliament, Castle Hill and Gellért Hill a little differently.",
        ],
      },
      {
        title: "See the city from the water",
        paragraphs: [
          "A river cruise changes the scale of the city and puts the Parliament and Castle Hill in one frame. Formats differ widely: shorter daytime sightseeing trips, evening cruises when the riverside landmarks are lit, and longer trips with dinner or drinks.",
          "GoToBudapest does not take bookings. Compare the route, departure pier, duration and what is included directly with each operator, and check accessibility for your own needs. Our guide explains how to choose between daytime, evening and dinner formats.",
        ],
      },
      {
        title: "Take a green break on the river",
        paragraphs: [
          "Two places let you leave the pavements without leaving the water. Margaret Island is a green island in the middle of the Danube for walks and a slower pace, and Kopaszi-gát is a waterside green area on the Buda side.",
        ],
      },
      {
        title: "Practical notes",
        paragraphs: [
          "Embankments are largely flat, but Castle Hill and Gellért Hill are steep, and surfaces can be uneven. Wind off the river can make evenings feel cooler than the forecast, so carry a layer outside summer. Opening times, boat departures and seasonal services change; confirm them with the operator before you travel.",
        ],
      },
    ],
    placesHeading: "Places along the river",
    placesIntro:
      "Landmarks, memorials and green spaces on or beside the Danube, on both banks.",
    placeSlugs: [
      "chain-bridge",
      "hungarian-parliament",
      "shoes-on-the-danube-bank",
      "gresham-palace",
      "hungarian-academy-of-sciences",
      "pesti-vigado",
      "fishermans-bastion",
      "buda-castle-funicular",
      "clark-adam-square-and-the-0-km-stone",
      "castle-garden-bazaar",
      "gellert-hill-citadella",
      "margaret-island",
      "margaret-island-water-tower",
      "kopaszi-gat",
    ],
    guides: [
      "danube-cruises",
      "budapest-in-3-days",
      "getting-around-budapest",
    ],
    sources: [
      { label: "Budapest Info — official visitor guide", url: "https://www.budapestinfo.hu/en" },
      { label: "BKK — official transport information", url: "https://bkk.hu/en/" },
    ],
  },
  {
    slug: "thermal-baths",
    title: "Soak up the city",
    eyebrow: "FIND YOUR THERMAL-BATH RITUAL",
    summary: "Build a slower day around a thermal-bath visit.",
    description:
      "A practical introduction to Budapest's thermal baths: how to choose between Széchenyi, Rudas, Lukács and other baths, which are seasonal, and which is closed for renovation.",
    photoKey: "exp-baths",
    fallbackPhoto: local(
      "city.webp",
      "Budapest's bridges crossing the Danube between Buda and Pest",
    ),
    intro:
      "Bathing is part of how Budapest rests. Some baths are grand historic complexes, some are small Ottoman-era-style Turkish baths, and others are open-air pools that only run in season. The best visit is the one that suits the rest of your day, so choose the bath around the neighbourhood you are already exploring.",
    sections: [
      {
        title: "Pair a bath with a neighbourhood",
        paragraphs: [
          "Széchenyi Thermal Bath sits in City Park, so it fits naturally with a slow day around Heroes' Square and the park. On the Buda side, Rudas, Lukács and Veli Bej are close to the river and Gellért Hill, which makes them an easy follow-on to a morning on Castle Hill. Palatinus is on Margaret Island and works well after a walk on the island.",
          "Thinking in neighbourhoods keeps travel time down and leaves the baths as the relaxed part of the day instead of an extra errand.",
        ],
      },
      {
        title: "Choose the kind of bath you want",
        paragraphs: [
          "Large thermal complexes combine several pools, steam and sauna areas. Turkish-style baths such as Rudas and Veli Bej offer a quieter, more traditional atmosphere, and both have sessions and access areas that vary by day and time, so check which one applies to your chosen date.",
          "Open-air pools and beaches such as Palatinus, Lupa Beach and the Római Open-Air Bath are seasonal. Aquaworld Resort Budapest is a family-oriented water-park setting rather than a historic bath.",
        ],
      },
      {
        title: "Check the status before you plan",
        paragraphs: [
          "Gellért Thermal Bath is currently closed for renovation. The operator states that reopening is planned for 2028, which is not a confirmed date, so build your bath day around another venue. Seasonal baths can be closed outside their season and may change dates from year to year.",
        ],
      },
      {
        title: "Before you go",
        paragraphs: [
          "Bring swimwear and a towel unless the venue says it provides them, and check which facilities your ticket covers. Age rules, mixed or single-gender sessions, pool access and dress requirements differ between baths. GoToBudapest does not show ticket prices or availability, so confirm everything on the bath's own website.",
        ],
        bullets: [
          "Choose one bath rather than two: it is meant to be slow.",
          "Check the day-specific session and access information.",
          "Plan how you will get there and back before you get wet and tired.",
        ],
      },
    ],
    placesHeading: "Baths and wellness in Budapest",
    placesIntro:
      "Every bath in the directory, with seasonal and closure notices where they apply, plus two places that pair well with a bath day.",
    placeSlugs: [
      "szechenyi-thermal-bath",
      "rudas-thermal-bath",
      "lukacs-thermal-bath",
      "veli-bej-bath",
      "palatinus-bath",
      "gellert-thermal-bath",
      "romai-open-air-bath",
      "lupa-beach",
      "aquaworld-resort-budapest",
      "city-park-varosliget",
      "margaret-island",
    ],
    guides: [
      "budapest-thermal-baths",
      "getting-around-budapest",
      "budapest-in-3-days",
    ],
    sources: [
      { label: "Széchenyi Thermal Bath — official site", url: "https://www.szechenyibath.hu/" },
      { label: "Budapest Info — official visitor guide", url: "https://www.budapestinfo.hu/en" },
    ],
  },
  {
    slug: "food-and-markets",
    title: "A taste of Budapest",
    eyebrow: "MARKET MORNINGS, CAFÉS & HUNGARIAN FLAVOURS",
    summary: "Market mornings, cafés and Hungarian flavours.",
    description:
      "Where to start with Hungarian food and drink in Budapest: the Great Market Hall, historic cafés, chocolate, Unicum and what to look for on a menu.",
    photoKey: "exp-food",
    fallbackPhoto: local(
      "budapest.webp",
      "Matthias Church and Fisherman's Bastion in the Castle District",
    ),
    intro:
      "Budapest is a city of long breakfasts and unhurried cafés. You do not need a list of restaurants to eat well here: start with a market, learn a few dishes, plan one grand café stop and let the rest of your wandering decide where you end up.",
    sections: [
      {
        title: "Start with the market",
        paragraphs: [
          "The Great Market Hall is a covered market hall for exploring food stalls and the atmosphere of a city market. Go earlier in the day for the best sense of how it works as a market, and treat it as a place to look, taste and ask questions as well as to buy.",
        ],
      },
      {
        title: "Plan one grand café stop",
        paragraphs: [
          "Budapest's historic cafés are destinations in their own right. The New York Café is known for its richly decorated interior, and Café Gerbeaud sits on Vörösmarty Square in the middle of downtown Pest. Both are popular, so allow for queues at busy times and check opening hours.",
          "Pair a café stop with a walk: Vörösmarty Square and Váci Street are short walks apart, and Andrássy Avenue leads onwards from the centre.",
        ],
      },
      {
        title: "Sweet and spirited stops",
        paragraphs: [
          "For a food-flavoured museum visit, the Szamos Chocolate Museum is centred on the Szamos confectionery tradition, and House of Unicum tells the story of the Unicum brand and its production heritage. Check visit formats and age rules for the spirits-related venue directly.",
        ],
      },
      {
        title: "What to look for on a menu",
        paragraphs: [
          "Hungarian classics worth knowing by name include gulyás (a soup or stew), pörkölt (paprika-based stew), halászlé (fish soup), lángos (fried flatbread) and kürtőskalács (chimney cake). Cooking varies from place to place, so ask staff what they recommend.",
        ],
        bullets: [
          "Ask about ingredients and allergens directly; menus and recipes change.",
          "Opening hours vary, and many places close on certain days.",
          "GoToBudapest does not rate or recommend individual restaurants.",
        ],
      },
      {
        title: "Food history indoors",
        paragraphs: [
          "If the weather turns, the Hungarian Agricultural Museum in Vajdahunyad Castle and the Hungarian Museum of Trade and Tourism explore the country's agricultural, commercial and hospitality history.",
        ],
      },
    ],
    placesHeading: "Food, drink and market places",
    placesIntro:
      "Markets, cafés and food-related visits from the directory. For evening plans, read our bars and nightlife guide.",
    placeSlugs: [
      "great-market-hall",
      "new-york-cafe",
      "cafe-gerbeaud",
      "vorosmarty-square",
      "vaci-street",
      "szamos-chocolate-museum",
      "house-of-unicum",
      "hungarian-agricultural-museum-and-library",
      "hungarian-museum-of-trade-and-tourism",
    ],
    guides: [
      "budapest-bars-nightlife",
      "budapest-in-3-days",
      "getting-around-budapest",
    ],
    sources: [
      { label: "Budapest Info — official visitor guide", url: "https://www.budapestinfo.hu/en" },
      { label: "Great Market Hall — Budapest Info", url: "https://www.budapestinfo.hu/en" },
    ],
  },
];

const neighbourhoodBase: TopicBase[] = [
  {
    slug: "castle-district",
    title: "The Castle District",
    eyebrow: "HISTORIC · HILLY · SCENIC",
    summary: "Storybook streets above the Danube.",
    description:
      "A self-guided look at Buda's Castle District: how to get there, Matthias Church, Fisherman's Bastion, the palace area, quieter corners and practical notes on slopes and access.",
    photoKey: "hood-castle",
    fallbackPhoto: local(
      "budapest.webp",
      "Matthias Church and Fisherman's Bastion in the Castle District",
    ),
    intro:
      "Castle Hill is Budapest's old Buda: cobbled lanes, courtyards, gateways and terraces above the Danube, with Matthias Church and Fisherman's Bastion at its heart. It rewards a slow half-day, and it is the best place to look back across the river at Pest.",
    sections: [
      {
        title: "Choose your way up",
        paragraphs: [
          "The funicular connects Clark Ádám Square, at the Buda end of the Chain Bridge, with the Castle area. You can also walk up, either by the stairs and paths from the river or through the Vienna Gate side, or take a bus: BKK lists routes 16, 16A and 116 for the upper Castle area, so check the current journey planner for your starting point. Whichever you choose, expect slopes.",
        ],
      },
      {
        title: "Begin at Trinity Square",
        paragraphs: [
          "Trinity Square is the centre of the district and sits beside Matthias Church. Take time to look at the details of the building, then continue to Fisherman's Bastion, whose terraces overlook the Danube and the Pest riverbank. The lower walkways and the upper lookout have different access arrangements, so check admission details for the level you want.",
        ],
      },
      {
        title: "Walk towards the palace",
        paragraphs: [
          "South of the church the hill opens into the Buda Castle palace complex. The Hungarian National Gallery and the Budapest History Museum are both inside it, and the Matthias Fountain and Savoyai Terrace are outside. Check museums and venues separately, because opening times and tickets are not shared.",
        ],
      },
      {
        title: "Find the quieter corners",
        paragraphs: [
          "Away from the main viewpoints the hill is calmer. The Tóth Árpád Promenade runs along the Castle wall, the Castle Garden Bazaar and the Tabán below the hill are green spaces, and the Medieval Jewish Prayer House introduces Buda's medieval Jewish heritage. The Hospital in the Rock is an underground museum beneath the hill.",
        ],
        bullets: [
          "Mary Magdalene Tower is currently listed as temporarily closed; check before planning an interior visit.",
          "The Vienna Gate is a convenient entrance or exit on the northern side.",
        ],
      },
      {
        title: "Make it comfortable",
        paragraphs: [
          "Wear shoes with grip, because cobbles, steps and slopes are the norm. Leave time for the descent rather than rushing it, and confirm access arrangements for your own mobility needs before you go.",
        ],
      },
    ],
    placesHeading: "On and around Castle Hill",
    placesIntro: "Landmarks, museums, gardens and viewpoints in the district.",
    placeSlugs: [
      "buda-castle-district",
      "matthias-church",
      "trinity-square",
      "fishermans-bastion",
      "buda-castle-funicular",
      "vienna-gate",
      "hungarian-national-gallery",
      "budapest-history-museum",
      "matthias-fountain",
      "savoyai-terrace",
      "toth-arpad-promenade",
      "castle-garden-bazaar",
      "the-taban",
      "medieval-jewish-prayer-house",
      "hospital-in-the-rock",
      "mary-magdalene-tower",
      "hungarian-heritage-house",
    ],
    guides: [
      "buda-castle-district",
      "getting-around-budapest",
      "budapest-in-3-days",
    ],
    sources: [
      { label: "Visit Budavár — official attractions", url: "https://visitbudavar.com/en/attractions" },
      { label: "Matthias Church — official site", url: "https://matyas-templom.hu/en/" },
    ],
  },
  {
    slug: "downtown-pest",
    title: "Downtown Pest",
    eyebrow: "GRAND · WALKABLE · RIVERSIDE",
    summary: "Boulevards, architecture and café stops.",
    description:
      "A walking guide to downtown Pest: the Parliament and riverfront, St. Stephen's Basilica, Andrássy Avenue, Vörösmarty Square, Jewish heritage sites and indoor museums.",
    photoKey: "hood-pest",
    fallbackPhoto: local(
      "danube.webp",
      "The Hungarian Parliament on the Pest riverbank",
    ),
    intro:
      "Pest is the flat, grand half of the city: wide boulevards, apartment blocks, cafés, concert halls and the Danube promenade. Most of the central sights are within walking distance of each other, which makes it ideal for a day without a fixed plan.",
    sections: [
      {
        title: "Begin on the riverfront",
        paragraphs: [
          "Start by the Danube. The Hungarian Parliament stands on the Pest bank at Kossuth Square, and the promenade south of it passes the Shoes on the Danube Bank memorial, a riverside memorial to people murdered during the Holocaust, which deserves a respectful visit. Further on you reach the Chain Bridge, the Gresham Palace and the Hungarian Academy of Sciences around Széchenyi István Square.",
        ],
      },
      {
        title: "Basilica to Andrássy Avenue",
        paragraphs: [
          "St. Stephen's Basilica is a good starting point for the streets of the centre. From the area, Andrássy Avenue is the grand route out towards City Park, lined with the Hungarian State Opera, the Liszt Academy of Music and the House of Terror Museum and ending at Heroes' Square.",
        ],
        bullets: [
          "Opera and concert halls publish their own performance calendars and visitor programmes.",
          "The House of Terror Museum addresses Hungary's experience of twentieth-century dictatorships; allow time and emotional space for it.",
        ],
      },
      {
        title: "Café, square and shopping street",
        paragraphs: [
          "Vörösmarty Square is a natural meeting point, home to Café Gerbeaud, and it connects to the pedestrian Váci Street. Pause for a coffee and cake before carrying on, or head for the New York Café for a more theatrical stop.",
        ],
      },
      {
        title: "Jewish heritage",
        paragraphs: [
          "The Dohány Street Synagogue is a significant synagogue and Jewish heritage site in central Pest. Check visiting arrangements, any dress requirements and security procedures with the site before you go, and treat it as a place of worship and memory.",
        ],
      },
      {
        title: "When it rains",
        paragraphs: [
          "Downtown has plenty of indoor options. The Hungarian National Museum traces the country's history, and the Great Market Hall makes an easy covered stop for food and atmosphere.",
        ],
      },
    ],
    placesHeading: "Landmarks, museums and cafés in the centre",
    placesIntro:
      "A selection from the directory that you can link together on foot or with a short tram or metro ride.",
    placeSlugs: [
      "hungarian-parliament",
      "shoes-on-the-danube-bank",
      "chain-bridge",
      "gresham-palace",
      "hungarian-academy-of-sciences",
      "pesti-vigado",
      "st-stephens-basilica",
      "andrassy-avenue",
      "hungarian-state-opera",
      "liszt-ferenc-academy-of-music",
      "house-of-terror-museum",
      "vorosmarty-square",
      "cafe-gerbeaud",
      "new-york-cafe",
      "vaci-street",
      "dohany-street-synagogue",
      "hungarian-national-museum",
      "great-market-hall",
    ],
    guides: [
      "budapest-in-3-days",
      "getting-around-budapest",
      "budapest-bars-nightlife",
    ],
    sources: [
      { label: "Budapest Info — official visitor guide", url: "https://www.budapestinfo.hu/en" },
      { label: "Hungarian Parliament — visitor information", url: "https://www.parlament.hu/web/visitors" },
    ],
  },
];


const extras: Record<
  string,
  { highlights: string[]; faqs: TopicFaq[]; sources?: Topic["sources"] }
> = {
  danube: {
    highlights: [
      "Walk a stretch of either embankment before choosing a boat.",
      "Check the exact departure pier and route for any cruise.",
      "Evening departures vary with season and sunset.",
    ],
    faqs: [
      {
        question: "Do I need a cruise ticket to enjoy the Danube?",
        answer:
          "No. The public riverfront and bridges offer excellent views without booking a boat.",
      },
      {
        question: "Are all cruises the same?",
        answer:
          "No. Check the route, boarding pier, operating dates, inclusions and cancellation conditions for the specific departure.",
      },
    ],
  },
  "thermal-baths": {
    highlights: [
      "Pair Széchenyi with City Park.",
      "Check Rudas session arrangements carefully.",
      "Gellért Bath is closed for renovation.",
    ],
    faqs: [
      {
        question: "Is Gellért Bath open?",
        answer:
          "No. The operator reports a renovation closure with a planned reopening in 2028, which is not a confirmed date.",
      },
      {
        question: "Are Budapest thermal baths suitable for children?",
        answer:
          "Admission rules differ by venue and area. Check the operator's age restrictions before buying tickets.",
      },
    ],
    sources: [
      { label: "Rudas Bath — opening hours", url: "https://www.rudasfurdo.hu/en/opening-hours" },
      { label: "Gellért Bath — closure notice", url: "https://www.gellertbath.hu/" },
    ],
  },
  "food-and-markets": {
    highlights: [
      "Browse the Great Market Hall with time to look around.",
      "Pair Vörösmarty Square with a café stop.",
      "Check menus, reservations and current hours directly.",
    ],
    faqs: [
      {
        question: "Is this a list of the best restaurants in Budapest?",
        answer:
          "No. It selects food-related places from the attraction directory and does not rank or review restaurants.",
      },
      {
        question: "Should I book cafés?",
        answer:
          "Check each café's current reservation policy and opening hours; they vary by venue.",
      },
    ],
    sources: [
      { label: "Café Gerbeaud — official website", url: "https://gerbeaud.hu/en/" },
      { label: "New York Café — official website", url: "https://newyorkcafe.hu/en/" },
    ],
  },
  "castle-district": {
    highlights: [
      "Allow half a day for a relaxed first visit.",
      "Fisherman's Bastion has separately ticketed upper areas.",
      "Build in time for the backstreets and viewpoints beyond the main photo stop.",
    ],
    faqs: [
      {
        question: "Is the Castle District free to visit?",
        answer:
          "Walking the public streets is free. Museums, church interiors and the upper lookout at Fisherman's Bastion may require separate admission.",
      },
      {
        question: "How much time should I allow?",
        answer:
          "A half-day is a useful editorial allowance for the main viewpoints and quieter lanes. Add time for any museum or guided visit.",
      },
    ],
    sources: [
      {
        label: "BKK — Buda Castle Funicular",
        url: "https://bkk.hu/en/travel-information/special-and-heritage-transport-services/funicular/",
      },
    ],
  },
  "downtown-pest": {
    highlights: [
      "A mostly walkable city-centre area.",
      "Combine St. Stephen's Basilica, the Chain Bridge and the riverside.",
      "Váci Street and Vörösmarty Square bring cafés and shopping into the mix.",
    ],
    faqs: [
      {
        question: "Is Downtown Pest the same as the Jewish Quarter?",
        answer:
          "No. The historic city centre is primarily District V; the Jewish Quarter is mainly in neighbouring District VII and deserves a separate visit.",
      },
      {
        question: "Can I see the main sights on foot?",
        answer:
          "Many central sights are close enough for a walking day. Allow extra time for stops, accessibility needs and any booked interiors.",
      },
    ],
    sources: [
      {
        label: "BKK — public transport network in the city centre",
        url: "https://bkk.hu/en/journey-planning/maps/public-transport-network-in-the-city-centre",
      },
    ],
  },
};
const withExtras = (t: TopicBase): Topic => ({
  ...t,
  highlights: extras[t.slug].highlights,
  faqs: extras[t.slug].faqs,
  sources: [...t.sources, ...(extras[t.slug].sources ?? [])],
});
export const experiences: Topic[] = experienceBase.map(withExtras);
export const neighbourhoods: Topic[] = neighbourhoodBase.map(withExtras);

// Experience and neighbourhood pages that feature a given attraction.
export function topicsForPlace(slug: string) {
  return [
    ...experiences.map((t) => ({ t, base: "/experiences" })),
    ...neighbourhoods.map((t) => ({ t, base: "/neighbourhoods" })),
  ]
    .filter(({ t }) => t.placeSlugs.includes(slug))
    .map(({ t, base }) => ({ title: t.title, href: `${base}/${t.slug}` }));
}
