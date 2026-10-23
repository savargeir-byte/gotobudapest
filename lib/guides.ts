export type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};
export type Guide = {
  slug: string;
  title: string;
  shortTitle: string;
  category:
    | "Itineraries"
    | "Thermal baths"
    | "Getting around"
    | "Neighbourhoods"
    | "Danube cruises"
    | "Bars & nightlife";
  description: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  intro: string;
  highlights: string[];
  sections: GuideSection[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  related: string[];
  updated: string;
};
export const guides: Guide[] = [
  {
    slug: "budapest-in-3-days",
    title: "Budapest in 3 days: a relaxed first-time itinerary",
    shortTitle: "Three days, two riverbanks",
    category: "Itineraries",
    description:
      "A practical three-day Budapest itinerary covering Castle Hill, Parliament, the Danube and a thermal-bath afternoon, with room to explore.",
    image: "city.webp",
    imageAlt: "Budapest and its bridges spanning the Danube",
    updated: "2026-10-23",
    intro:
      "Three days give you room for Budapest’s big sights and some unplanned discoveries. This suggested route groups nearby places, keeps the Buda and Pest sides together where practical and leaves one afternoon for slowing down. Treat the order as a starting point, then move any timed visits around the tickets you actually secure.",
    highlights: [
      "Day 1: Castle Hill and the Buda riverbank",
      "Day 2: Parliament and downtown Pest",
      "Day 3: City Park and a thermal-bath visit",
    ],
    sections: [
      {
        id: "before-you-start",
        title: "Before you start",
        paragraphs: [
          "Choose one or two visits that matter most to you and arrange those first. Parliament’s official visitor service directs online ticket buyers to Jegymester; use that official route rather than choosing a reseller by its name alone. If the available tour falls on a different day, swap the days of this itinerary.",
          "Keep arrival day light if you land late. A riverside walk and dinner can be a better first evening than trying to fit a major interior visit between the airport journey and hotel check-in. The timings here are our planning suggestions, not tour departure times.",
        ],
        bullets: [
          "Save the official venue pages for your travel dates.",
          "Keep a weather-flexible indoor option in reserve.",
          "Use the My trip hearts on the home page to build a shortlist.",
        ],
      },
      {
        id: "day-one",
        title: "Day 1 — Castle Hill and a Buda panorama",
        paragraphs: [
          "Begin around Trinity Square and Matthias Church, then spend time at Fisherman’s Bastion. The lower level and upper lookout have separate admission arrangements: the district’s visitor guide lists the lower level as free and the upper lookout as paid. You do not have to buy an upper-level ticket simply to enjoy the wider district.",
          "Continue through the Castle District instead of rushing straight back down. We suggest allowing a half-day for sightseeing, pauses and an optional interior visit. Walk a stretch of the Buda riverbank later for a view towards Parliament. If slopes or uneven surfaces are difficult, plan the approach with BKK and check each venue’s access arrangements.",
        ],
      },
      {
        id: "day-two",
        title: "Day 2 — Parliament and downtown Pest",
        paragraphs: [
          "Build the morning around Parliament if you have a confirmed visit. Otherwise, admire the exterior around Kossuth Square and continue with a Pest-side walk. Do not turn up assuming an interior ticket will be available on arrival.",
          "Leave the afternoon for downtown streets and a café stop. Keep a meal break in the plan rather than treating food as something to squeeze in between sights. Finish with another riverfront perspective; a cruise is an optional alternative, so compare its departure point and inclusions before booking.",
        ],
      },
      {
        id: "day-three",
        title: "Day 3 — City Park and time to unwind",
        paragraphs: [
          "Make the third day deliberately slower: a walk in City Park followed by a bath visit if it suits your group. Széchenyi is the natural pairing for this area, but check the current entry conditions before building the day around it.",
          "Gellért Bath is currently closed for renovation, so it is not an alternative stop on this route. If bathing is not right for your group, extend the park visit or revisit your favourite neighbourhood. Leave a buffer before an airport transfer rather than planning a final paid activity against a tight departure.",
        ],
      },
      {
        id: "adapt-the-route",
        title: "Make the route work for you",
        paragraphs: [
          "With two days, choose Castle Hill plus downtown Pest and treat the baths as a swap, not an extra obligation. With a fourth day, repeat a neighbourhood at a different pace before adding a distant excursion.",
          "This route is self-guided and does not calculate live travel times. Check the day’s transport service and venue notices, especially if your plans depend on a particular connection or entry slot.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is three days enough for a first visit?",
        answer:
          "It is a useful starting length for this suggested route. Choose fewer interior visits if you prefer a slower pace or have limited mobility.",
      },
      {
        question: "Does this itinerary include booked tickets?",
        answer:
          "No. It is a self-guided planning suggestion. Arrange tickets separately through the venue or a provider you choose.",
      },
    ],
    sources: [
      {
        label: "Parliament — official ticket purchasing",
        url: "https://www.parlament.hu/web/visitors/purchasing-tickets",
      },
      {
        label: "Visit Budavár — Castle District sights",
        url: "https://visitbudavar.com/en/attractions",
      },
      {
        label: "Gellért Bath — renovation notice",
        url: "https://www.gellertbath.hu/",
      },
    ],
    related: [
      "buda-castle-district",
      "budapest-thermal-baths",
      "getting-around-budapest",
    ],
  },
  {
    slug: "budapest-thermal-baths",
    title: "Budapest thermal baths: choosing your first visit",
    shortTitle: "Find your thermal-bath ritual",
    category: "Thermal baths",
    description:
      "Plan a Budapest bath visit with practical notes on Széchenyi, Rudas, age restrictions, what to pack and the Gellért closure.",
    image: "city.webp",
    imageAlt: "The Danube between the Buda and Pest sides of Budapest",
    imageCaption:
      "Budapest city panorama — this is not a photograph of a bath.",
    updated: "2026-10-23",
    intro:
      "Choose a bath around the kind of day you want, where you are staying and who is travelling with you. A well-planned visit needs more than an entrance ticket: check which areas it covers, the admission rules and what you need to bring. Here is a practical starting point for your first Budapest bath visit.",
    highlights: [
      "Pair Széchenyi with a City Park day",
      "Check the exact Rudas session before choosing tickets",
      "Gellért is currently closed for renovation",
    ],
    sections: [
      {
        id: "choose-your-bath",
        title: "Choose around the rest of your day",
        paragraphs: [
          "Our suggested approach is to give the bath a dedicated part of the day. Avoid squeezing it between two fixed-time attractions: changing, settling in and travelling to the next stop all take time. Choose somewhere convenient to your sightseeing rather than crossing the city for an activity you feel obliged to do.",
          "Széchenyi is a straightforward candidate for a day centred on City Park. Rudas is worth considering when you are planning time on the Buda side. Those are itinerary pairings, not a ranking or a promise about crowd levels.",
        ],
      },
      {
        id: "szechenyi",
        title: "Széchenyi: check the practical details first",
        paragraphs: [
          "Széchenyi’s official FAQ says children under 14 need a specialist medical certificate and advance approval. It also states that the building is not fully barrier-free. Check the current instructions directly if either point affects your party, rather than assuming a standard ticket meets your needs.",
          "Compare the available ticket types on the official bath site. Do not assume that a locker, private changing cabin or optional experience is interchangeable. Read the description of the ticket you are about to buy and keep the confirmation accessible.",
        ],
      },
      {
        id: "rudas",
        title: "Rudas: the session and access areas matter",
        paragraphs: [
          "Rudas publishes different access arrangements across the week, including single-sex sessions for the Turkish bath. Check the date, session and included areas together before choosing a ticket, especially when visiting as a couple or group.",
          "The operator states that children under 14 cannot visit. It also says that night-bathing tickets are available only online. Avoid relying on a general opening-hours snippet when your plan depends on a particular area being accessible.",
        ],
      },
      {
        id: "gellert-closure",
        title: "Gellért: remove it from your current bath plan",
        paragraphs: [
          "The official Gellért website says the bath has been closed since 1 October 2025, with reopening planned for 2028. A planned reopening is not a confirmed date for a future booking.",
          "Older destination articles and photographs may still suggest visiting. If this bath is the reason for a future trip, wait for an operator announcement before making non-refundable plans around its return.",
        ],
      },
      {
        id: "packing-and-pacing",
        title: "Packing and pacing your visit",
        paragraphs: [
          "As a practical packing list, take swimwear, a towel, suitable poolside footwear and a bag for wet items. Check the venue’s specific rules for any additional equipment or rental options before relying on them. Keep valuables to a minimum and follow changing-room instructions.",
          "Plan a pause afterwards instead of a sprint to the next attraction. If you are travelling with children, choose a venue explicitly suitable for their ages and confirm which facilities they can use. A famous thermal bath is not automatically a family swimming-pool option.",
        ],
        bullets: [
          "Read the operator’s current admission rules.",
          "Check exactly what the ticket covers.",
          "Match the visit to your group’s ages and access needs.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is Gellért Bath open?",
        answer:
          "The operator says it is closed for renovation, with reopening planned for 2028. Check the official notice before making future plans.",
      },
      {
        question: "Can children visit Széchenyi or Rudas?",
        answer:
          "Rudas states that under-14s cannot visit. Széchenyi publishes an under-14 medical-certificate and approval exception. Always read the operator’s current admission conditions.",
      },
    ],
    sources: [
      {
        label: "Széchenyi — official FAQ and access information",
        url: "https://www.szechenyibath.hu/faq",
      },
      {
        label: "Rudas — session schedule and age restrictions",
        url: "https://www.rudasfurdo.hu/en/opening-hours",
      },
      {
        label: "Rudas — ticket and night-bathing information",
        url: "https://www.rudasfurdo.hu/en/prices",
      },
      {
        label: "Gellért — official closure notice",
        url: "https://www.gellertbath.hu/",
      },
    ],
    related: ["budapest-in-3-days", "getting-around-budapest"],
  },
  {
    slug: "getting-around-budapest",
    title: "Getting around Budapest: a first-visit transport guide",
    shortTitle: "A little less navigating",
    category: "Getting around",
    description:
      "Understand Budapest public transport, single-ticket validation, travelcards, BudapestGO and the special ticket for the 100E Airport Express.",
    image: "city.webp",
    imageAlt: "Bridges and riverbanks connecting Budapest neighbourhoods",
    updated: "2026-10-23",
    intro:
      "Start with the places you want to visit, then choose transport that fits your day. Walking works well for compact sightseeing stops; metro, tram and bus connections help you cover the gaps. The main thing to get right is the ticket you hold and how it must be used.",
    highlights: [
      "Buy through official BKK channels",
      "Validate single tickets correctly",
      "100E Airport Express uses a special fare",
    ],
    sections: [
      {
        id: "plan-your-day",
        title: "Group your stops before choosing transport",
        paragraphs: [
          "Put nearby sights together: one outing for Castle Hill, another for downtown Pest and a separate block for City Park. This avoids turning each attraction into a cross-city journey. Start and finish with the address of your accommodation, not just the neighbourhood name.",
          "For your first day, keep one simple route saved and leave time to find the stop or platform. Use BKK’s current journey information when you travel; this guide does not provide live routing or disruption notices.",
        ],
      },
      {
        id: "buy-and-validate",
        title: "Buying a single ticket is not the last step",
        paragraphs: [
          "BKK explains that single tickets need validation when you start travelling. Paper tickets use a validator; digital tickets follow the scanning instructions in BudapestGO. Keep the validated ticket available throughout the journey.",
          "A regular single ticket generally covers one uninterrupted ride, with a metro-transfer exception when continuing in the same direction. For a journey involving other transfers, compare time-based tickets or a travelcard instead of assuming one single ticket covers everything.",
        ],
      },
      {
        id: "choose-ticket",
        title: "Single tickets, timed tickets or a travelcard?",
        paragraphs: [
          "Think about your actual pattern: two journeys surrounding a long walking day are different from repeatedly crossing between districts. Check the products currently offered by BKK, then compare the options for your intended journeys.",
          "BKK’s 30- and 90-minute digital tickets allow transfers within their rules, but require scanning when you change vehicles. Daily travelcards allow unlimited transfers within their validity and do not require single-ticket-style validation. Read the current product conditions before buying.",
        ],
      },
      {
        id: "airport",
        title: "Airport journeys: check the 100E fare separately",
        paragraphs: [
          "The airport describes 100E Airport Express as a direct connection between Liszt Ferenc Airport and Deák Ferenc tér in central Pest. It requires a special ticket, so do not assume your regular city single ticket covers the airport journey.",
          "Choose a route from the airport to your actual accommodation and reverse that check before departure. Allow for luggage, walking to your stop and check-in requirements. Current airport stopping patterns and timetables should come from the operator, not a fixed travel-time promise in a guide.",
        ],
      },
      {
        id: "small-habits",
        title: "Small habits that make the day easier",
        paragraphs: [
          "Save your hotel address and an offline note of the route back. Keep your phone charged if your ticket is digital, and check what you must show during inspection. For accessibility needs, examine the specific service and stop rather than assuming every connection is step-free.",
          "Use official BKK sales channels and check the fare there before purchasing. As an editorial suggestion, leave a little flexibility in your first journey instead of booking a timed attraction immediately after arrival.",
        ],
        bullets: [
          "Check your route shortly before leaving.",
          "Read ticket conditions before payment.",
          "Keep tickets and booking confirmations within easy reach.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use a regular single ticket on the 100E?",
        answer:
          "No. BKK states that regular single tickets are not valid on 100E Airport Express. Check the current airport-ticket options directly with BKK.",
      },
      {
        question: "Do daily travelcards need single-ticket validation?",
        answer:
          "BKK says daily travelcards and passes do not require validation. Follow any instructions to show the ticket or pass, and use it within its validity.",
      },
    ],
    sources: [
      {
        label: "BKK — tickets, passes and validation",
        url: "https://bkk.hu/en/visiting-budapest/tickets-and-passes/",
      },
      {
        label: "BKK — single-ticket rules and exclusions",
        url: "https://bkk.hu/en/tickets-and-passes/prices/single-ticket/",
      },
      {
        label: "Budapest Airport — 100E Airport Express",
        url: "https://www.bud.hu/en/parking-transport/transportation/public-transportation/public-transportation-by-bus/100e-airport-express-your-direct-link-between-liszt-ferenc-international-airport-and-budapest-city-centre.html",
      },
    ],
    related: ["budapest-in-3-days", "buda-castle-district"],
  },
  {
    slug: "buda-castle-district",
    title: "Buda Castle District: a self-guided first visit",
    shortTitle: "A morning above the Danube",
    category: "Neighbourhoods",
    description:
      "Plan a self-guided Castle District visit around Fisherman’s Bastion, Matthias Church, Trinity Square and time to wander.",
    image: "budapest.webp",
    imageAlt:
      "Matthias Church and Fisherman’s Bastion in the Buda Castle District",
    updated: "2026-10-23",
    intro:
      "The Castle District is most rewarding when you give it more than a photo stop. Start with its familiar landmarks, then leave room for the streets between them. This is a suggested walking sequence, not a timed tour: adjust the distance and number of interiors to your own pace.",
    highlights: [
      "Start around Trinity Square",
      "Separate the Bastion’s lower and upper-level access",
      "Leave space for a quieter stretch of the district",
    ],
    sections: [
      {
        id: "arrival",
        title: "Choose a comfortable approach",
        paragraphs: [
          "Castle Hill deserves a little arrival planning. Check a current BKK route from your accommodation and decide whether you want to walk up or reduce the climb. For anyone with mobility needs, review the approach and venue access independently; a viewpoint being nearby does not mean the route is step-free.",
          "Our suggestion is to reserve a half-day if you want a mix of streets, viewpoints and an interior visit. That is an editorial allowance, not an official tour duration. If you have only a short window, focus on one part of the district rather than rushing across it.",
        ],
      },
      {
        id: "trinity-square",
        title: "Begin at Trinity Square and Matthias Church",
        paragraphs: [
          "Use Trinity Square as an orientation point. The district’s official visitor guide groups Matthias Church, Fisherman’s Bastion and the Holy Trinity Column around this square, which makes it a useful place to start your visit.",
          "Pause to take in the church exterior before choosing whether to go inside. Check the church’s own website for the visitor schedule and tickets on your date. Do not build a tightly timed route around opening hours copied from an old article or a search snippet.",
        ],
      },
      {
        id: "bastion",
        title: "Fisherman’s Bastion: understand the two levels",
        paragraphs: [
          "Visit Budavár lists the lower level as free and the upper lookout as paid. Explore the lower terraces and take in the view across to Pest before deciding whether you want the additional upper-level access.",
          "Give yourself time to look beyond a single photo angle. Consider a later walk along the Buda riverbank as a second perspective on the same cityscape. This is a suggestion for variety, not a promise of a particular sunset, weather or crowd level.",
        ],
      },
      {
        id: "wander",
        title: "Leave the main viewpoints behind for a while",
        paragraphs: [
          "Continue to Tóth Árpád Promenade for a change of outlook. The district visitor guide describes a walk along the castle wall with views towards the Buda hills. It offers a different direction to look after spending time facing the Danube.",
          "Choose a manageable loop and pause before adding another major stop. If you continue towards the palace area, treat any museum interior as a separate decision with its own opening hours and tickets. You can enjoy the neighbourhood without trying to enter every building.",
        ],
      },
      {
        id: "finish",
        title: "Finish without rushing the descent",
        paragraphs: [
          "Keep the return journey flexible. You might spend more time in the district, continue towards the river or use a current public-transport connection back to Pest. Check your onward route before committing to a long downhill walk.",
          "Wear shoes you are comfortable walking in and leave space for rests. In poor weather, shorten the outdoor route rather than trying to keep every viewpoint. A slower visit with fewer stops is still a complete Castle District experience.",
        ],
        bullets: [
          "Check church access on your date.",
          "Treat each paid attraction separately.",
          "Plan the approach and return around your mobility needs.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need one ticket for the whole Castle District?",
        answer:
          "No single ticket is required simply to explore the neighbourhood’s public streets. Individual venues and paid lookout areas have their own admission arrangements.",
      },
      {
        question: "How long should I allow?",
        answer:
          "Our suggested allowance is a half-day for unhurried wandering and an optional interior. Adapt that to your mobility, interests and any confirmed entry times.",
      },
    ],
    sources: [
      {
        label: "Visit Budavár — official district sights",
        url: "https://visitbudavar.com/en/attractions",
      },
      {
        label: "Matthias Church — official visitor site",
        url: "https://matyas-templom.hu/en/",
      },
      {
        label: "BKK — official transport information",
        url: "https://bkk.hu/en/",
      },
    ],
    related: ["budapest-in-3-days", "getting-around-budapest"],
  },
];
const additionalGuides: Guide[] = [
  {
    slug: "danube-cruises",
    title: "Budapest Danube cruises: daytime, evening or dinner?",
    shortTitle: "See Budapest from the water",
    category: "Danube cruises",
    description:
      "Choose a Budapest river cruise by route, daylight, departure pier and inclusions, with practical advice before you book.",
    image: "danube.webp",
    imageAlt: "Parliament and the Danube in Budapest",
    updated: "2026-10-23",
    intro:
      "A river cruise can be an easy way to enjoy Budapest from a new angle, but the right choice depends on what you want from the outing. Start with a simple question: are you mainly interested in the views, an evening atmosphere or a meal on board? Then compare the actual ticket details rather than the headline photograph.",
    highlights: [
      "Choose the experience before comparing tickets",
      "Confirm the precise pier and boarding time",
      "Check operational notices before departure",
    ],
    sections: [
      {
        id: "choose-format",
        title: "Start with the format",
        paragraphs: [
          "For a first visit, our suggestion is to choose sightseeing if the river views are the main reason you are going. A dinner cruise makes sense when you specifically want the meal as part of the evening. Compare the total time on board, seating arrangements and what is included before deciding.",
          "Do not compare a basic sightseeing ticket with a meal package as if they were equivalent. Think about your group, the time you have and whether commentary, music or dining is more important to you. Children, dietary needs and accessibility can change the choice.",
        ],
      },
      {
        id: "day-or-evening",
        title: "Daytime versus evening",
        paragraphs: [
          "Daylight can suit visitors who want to study the buildings and orient themselves between Buda and Pest. For an evening outing, check the actual departure time for your date rather than assuming that every evening-labelled sailing happens after dark. The season changes that calculation.",
          "Legenda separates its daytime Duna Bella sightseeing trips from its evening Danube Legend programme. Use those operator descriptions as examples of the distinction, then read the inclusions of the exact departure you are considering.",
        ],
      },
      {
        id: "route-changes",
        title: "Do not assume an island stop is operating",
        paragraphs: [
          "River conditions can affect the advertised route. At the time of this guide’s check, Legenda displayed a low-water notice stating that daytime sightseeing boats could not dock at Margaret Island and were temporarily following the evening route.",
          "That is an operational notice, not a permanent description of all Budapest cruises. Read the current provider notices before booking, especially if getting off at a particular stop is your main reason for choosing a sailing.",
        ],
      },
      {
        id: "boarding",
        title: "Check the pier as carefully as the time",
        paragraphs: [
          "Use the meeting point on your booking confirmation and find it before your departure day if possible. The Danube has multiple boarding locations: a riverside neighbourhood or a recognisable landmark is not precise enough to identify your boat.",
          "Leave time for the walk to the pier, any check-in and boarding. If you need step-free access, ask about the specific vessel and boarding arrangements before paying. Do not assume that all boats or water levels produce the same access conditions.",
        ],
      },
      {
        id: "compare",
        title: "What to compare before booking",
        paragraphs: [
          "Write down the essentials from each ticket: route, duration, commentary language, included drinks or meal, indoor seating, cancellation terms and the correct departure point. Compare the list rather than a promotional starting price.",
          "GoToBudapest is providing a planning guide here. Live availability and booking are not connected yet, so follow the operator’s official site for current products and terms. A waterfront walk remains a good alternative if you prefer to keep the evening flexible.",
        ],
        bullets: [
          "Read current operational notices.",
          "Confirm the precise meeting point.",
          "Check cancellation and weather-related conditions.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is daytime or evening better?",
        answer:
          "Choose daytime for a clearer orientation to the riverbanks, or an evening departure if that atmosphere is your priority. Check actual daylight and departure times for your date.",
      },
      {
        question: "Can I book a cruise on GoToBudapest now?",
        answer:
          "Not yet. This guide links to official operator information; live booking and availability will be added separately.",
      },
    ],
    sources: [
      {
        label: "Legenda — sightseeing cruise formats",
        url: "https://legenda.hu/en/sightseeing-cruises",
      },
      {
        label: "Legenda — current operational notices",
        url: "https://legenda.hu/en",
      },
      {
        label: "Legenda — Danube Legend programme",
        url: "https://legenda.hu/en/danube-legend",
      },
    ],
    related: [
      "budapest-in-3-days",
      "budapest-bars-nightlife",
      "getting-around-budapest",
    ],
  },
  {
    slug: "budapest-bars-nightlife",
    title: "Budapest bars and nightlife: find your kind of evening",
    shortTitle: "Ruin bars, rooftops & cocktails",
    category: "Bars & nightlife",
    description:
      "Plan a Budapest evening around ruin bars, cocktail counters or a rooftop terrace, with a focused shortlist and official venue links.",
    image: "city.webp",
    imageAlt: "Panoramic Budapest city view",
    imageCaption:
      "Budapest city panorama — this is not a photograph of a featured bar.",
    updated: "2026-10-23",
    intro:
      "An evening in Budapest does not need to become a long pub crawl. Choose the setting you want first: a courtyard to explore, a place to dance, a cocktail-focused bar or a rooftop table. The shortlist below introduces different formats so you can choose one or two stops that actually fit your plans.",
    highlights: [
      "Choose atmosphere before planning a route",
      "Compare venue-specific table and terrace terms",
      "Check the current programme and journey home",
    ],
    sections: [
      {
        id: "choose-evening",
        title: "Choose the kind of evening you want",
        paragraphs: [
          "Start by deciding whether you want conversation, live entertainment, dancing or a view. Our suggested approach is one main venue and an optional second stop nearby. Leave time for dinner and make a plan for the journey back to your accommodation.",
          "A ruin-bar-style setting and a nightclub programme can overlap, but they are not the same experience. Look at the venue’s programme for your date rather than expecting every place to offer the same atmosphere at every hour.",
        ],
      },
      {
        id: "ruin-bars",
        title: "Ruin bars and a larger party complex",
        paragraphs: [
          "Szimpla Kert’s own information site provides its basic visitor details and concert programme. Begin there to check what is happening before choosing your visit. Treat it as a specific venue with its own schedule, rather than a generic promise about every ruin bar in the city.",
          "Instant–Fogas describes a multi-space party complex on Akácfa Street, with different music settings under one roof. It is a candidate when dancing and a later evening are the priority. Check the current event details and entry conditions directly with the venue.",
        ],
      },
      {
        id: "cocktails",
        title: "A cocktail-focused alternative",
        paragraphs: [
          "Boutiq Bar presents a cocktail-led experience in central Budapest. It is a useful contrast to a multi-room party venue: review the current drinks offering and reservation options before deciding whether it fits your evening.",
          "If conversation is the aim, ask about a suitable table rather than assuming every bar will be quiet. Menus, opening days and reservation conditions can change, so use the venue’s own information for the date you plan to go.",
        ],
      },
      {
        id: "rooftops",
        title: "Rooftop views: understand the table you are booking",
        paragraphs: [
          "High Note SkyBar is a rooftop venue beside the Basilica. Its official site distinguishes regular areas from separate panoramic-table and champagne-bar reservations with different minimum-consumption arrangements. Read the terms of the specific area you select.",
          "For a view-led evening, ask about terrace availability and indoor alternatives before committing. A generic rooftop photograph does not guarantee a particular table or weather conditions. Leave room to change plans if an outdoor setting is the main attraction.",
        ],
      },
      {
        id: "practical",
        title: "Make the evening easy to enjoy",
        paragraphs: [
          "Check the venue’s latest programme, entry policy and reservation terms. Keep your chosen addresses saved, use the official transport information for the return and respect the residential streets around nightlife areas. Do not plan the next morning around an unrealistically early start.",
          "This is an editorial introduction, not a paid ranking or a claim that we have personally visited the venues. We have linked the official sites so you can make the final choice from current information.",
        ],
        bullets: [
          "Choose one main venue rather than an obligatory crawl.",
          "Confirm table conditions directly with the venue.",
          "Keep a clear plan for returning to your accommodation.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do all bars need reservations?",
        answer:
          "No single rule applies. Check the individual venue and any table or terrace area you want, especially for a group.",
      },
      {
        question: "Is this a personally tested or paid ranking?",
        answer:
          "No. It is an editorial introduction to different evening formats, based on the venues’ own information.",
      },
    ],
    sources: [
      {
        label: "Szimpla Kert — official information and programme",
        url: "https://szimpla.hu/info.html",
      },
      {
        label: "Instant–Fogas — official venue and events",
        url: "https://instant-fogas.com/",
      },
      {
        label: "Boutiq Bar — official venue site",
        url: "https://boutiqbar.com/",
      },
      {
        label: "High Note SkyBar — official reservations and conditions",
        url: "https://highnoteskybar.hu/en/",
      },
    ],
    related: [
      "danube-cruises",
      "budapest-in-3-days",
      "getting-around-budapest",
    ],
  },
];
guides.push(...additionalGuides);
export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
export function readingMinutes(guide: Guide) {
  const words = [
    guide.intro,
    ...guide.sections.flatMap((s) => [
      s.title,
      ...s.paragraphs,
      ...(s.bullets || []),
    ]),
  ]
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 210));
}
