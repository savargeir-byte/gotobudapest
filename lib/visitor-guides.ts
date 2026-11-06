import type { TourContext } from "./marketplace/context";
import { cultureGuides } from "./culture-guides";
import { practicalGuides } from "./practical-guides";

export type VisitorSection = { id: string; title: string; paragraphs: string[] };
export type VisitorGuide = {
  group: "transportation" | "gastronomy" | "culture" | "visit";
  slug: string; title: string; shortTitle: string; description: string;
  photoKey: string; caption?: string; tourContext: TourContext;
  intro: string; highlights: string[]; sections: VisitorSection[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  places: string[]; other: string[];
};
export const visitorGuides: VisitorGuide[] = [...cultureGuides, ...practicalGuides,
  {
    "group": "transportation",
    "slug": "public-transport",
    "title": "Budapest public transport: metro, trams and buses",
    "shortTitle": "Metro, trams & buses",
    "description": "A practical guide to BKK, metro lines, scenic trams, ticket validation and late-night journeys.",
    "photoKey": "g-tram",
    "caption": "A yellow Budapest tram. Check current BKK service notices before travelling.",
    "tourContext": {
      "category": "sightseeing"
    },
    "intro": "Budapest’s metro, trams, buses and trolleybuses make a car-free city break practical. The best route is usually the one that keeps nearby attractions together, rather than racing between opposite sides of the Danube.",
    "highlights": [
      "Use BudapestGO for live connections and disruptions.",
      "Metro lines M1–M4 cover different parts of the city; do not treat them as one loop.",
      "Tram 2 offers scenic views beside part of the Pest bank of the Danube."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Plan around the city, not just a line",
        "paragraphs": [
          "The metro is useful for crossing distances, while trams and buses link stops beyond the underground network. In central Pest you may walk between several sights; Castle Hill and Gellért Hill add slopes and steps. Plan your journey around the actual entrance, not just a station name.",
          "For a Buda day, consider Matthias Church and Fisherman’s Bastion in one outing. For Pest, Parliament, the Basilica and city-centre streets make a natural cluster."
        ]
      },
      {
        "id": "section-2",
        "title": "Tram views beside the river",
        "paragraphs": [
          "Budapest’s tram line 2 runs by part of the Pest-side Danube and is an inexpensive regular public transport ride rather than a bookable sightseeing boat. Riverfront tram routes on the Buda bank offer another perspective; check the current line and service before setting out.",
          "Trams share streets and stops with other users. Keep your ticket or pass available for inspections and watch platforms and traffic carefully."
        ]
      },
      {
        "id": "section-3",
        "title": "Tickets, validation and changes",
        "paragraphs": [
          "Most paper single tickets must be validated when your journey begins. Digital ticket scanning, travelcards, passes and transfer rules differ by product. Use official BudapestGO instructions and ticket machines instead of an old fare chart.",
          "If you plan to ride late, verify night-bus services and changes separately. After a concert or evening cruise, allow time to reach the correct direction of travel."
        ]
      },
      {
        "id": "section-4",
        "title": "Accessibility and weather",
        "paragraphs": [
          "Not every historic station or Castle District approach is step-free. Low-floor vehicles and accessible stops are available on parts of the network, but a whole journey needs checking. Snow, heat or road works can also change a route that looked easy on a map."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is tram 2 a guided tour?",
        "answer": "No. It is regular public transport with picturesque views; buy the appropriate public transport ticket."
      },
      {
        "question": "Can I use BudapestGO to buy tickets?",
        "answer": "Yes, the official app provides journey planning and supported ticket products. Check validation rules for your choice."
      }
    ],
    "sources": [
      {
        "label": "BKK public transport guide",
        "url": "https://bkk.hu/en/visiting-budapest/"
      },
      {
        "label": "BKK journey planner and service notices",
        "url": "https://bkk.hu/en/travel-information/"
      },
      {
        "label": "Budapest Info transport overview",
        "url": "https://www.budapestinfo.hu/en/transportation"
      }
    ],
    "places": [
      "hungarian-parliament",
      "chain-bridge",
      "buda-castle-funicular",
      "heroes-square"
    ],
    "other": [
      "/transportation/tickets-and-passes",
      "/transportation/accessible-travel",
      "/guides/getting-around-budapest",
      "/guides/budapest-in-3-days"
    ]
  },
  {
    "group": "transportation",
    "slug": "airport-to-city",
    "title": "Getting from Budapest Airport to the city centre",
    "shortTitle": "Airport to city",
    "description": "Choose between the direct 100E Airport Express, 200E connections, taxis and arranged transfers.",
    "photoKey": "g-skyline",
    "caption": "Budapest skyline; this photograph does not depict the airport or its buses.",
    "tourContext": {
      "category": "transfers"
    },
    "intro": "Liszt Ferenc International Airport connects with central Budapest using both direct and connecting public transport. Your best choice depends on the hotel address, luggage, time of arrival and whether you need a step-free route.",
    "highlights": [
      "100E goes direct to Kálvin tér and Deák Ferenc tér.",
      "The airport shuttle ticket differs from an ordinary BKK single ticket.",
      "200E connects with the wider city network and may require a transfer."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "100E: direct airport express",
        "paragraphs": [
          "BKK describes the 100E as a 24-hour service to central Pest through Kálvin tér and Deák Ferenc tér. Typical published journey time is about 40 minutes, but traffic, time of day and service notices change actual travel time.",
          "The 100E uses the designated airport-shuttle ticket or a permitted add-on for qualifying pass holders. Do not assume a regular city single ticket is accepted. BKK lists Pay&GO bankcard payment on the bus and digital tickets via BudapestGO."
        ]
      },
      {
        "id": "section-2",
        "title": "200E: connection into the wider network",
        "paragraphs": [
          "The 200E bus is a separate option serving the airport and the Kőbánya-Kispest area, with metro and onward transport options. It is useful for some destinations but usually involves an additional leg for central visitors.",
          "A 100E special airport ticket is not valid on 200E. Select the correct ordinary ticket or pass for the journey, and check the connection at the time you travel."
        ]
      },
      {
        "id": "section-3",
        "title": "Taxis and transfers",
        "paragraphs": [
          "Licensed taxi services and legitimate pre-arranged transfers can be convenient with heavy luggage, small children or accommodation far from public transport. Use official airport pick-up information and check the price conditions; do not accept unsolicited terminal offers.",
          "Booking a transfer is not the same as buying a BKK ticket. Compare the terms and departure time directly with the transport supplier."
        ]
      },
      {
        "id": "section-4",
        "title": "Departing for a flight",
        "paragraphs": [
          "Work backwards from your airline’s check-in and baggage deadline, not just your flight’s departure time. Allow a buffer for security, finding the airport terminal, and delays on the route. Save your route and a fallback option offline."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Do normal BKK tickets cover 100E?",
        "answer": "No. The 100E has a special airport-shuttle fare or a qualifying pass add-on under BKK’s current rules."
      },
      {
        "question": "Can I use a bankcard on the 100E?",
        "answer": "Yes. BKK lists Budapest Pay&GO contactless purchase and validation on the 100E."
      }
    ],
    "sources": [
      {
        "label": "BKK official 100E Airport Express",
        "url": "https://bkk.hu/en/travel-information/airport-express/"
      },
      {
        "label": "BKK airport connection information",
        "url": "https://bkk.hu/en/visiting-budapest/247-connection-between-the-airport-and-the-city-centre/"
      },
      {
        "label": "Budapest Airport official website",
        "url": "https://www.bud.hu/en"
      }
    ],
    "places": [
      "great-market-hall",
      "st-stephens-basilica",
      "hungarian-parliament"
    ],
    "other": [
      "/transportation/tickets-and-passes",
      "/currency",
      "/essentials",
      "/guides/budapest-in-3-days"
    ]
  },
  {
    "group": "transportation",
    "slug": "tickets-and-passes",
    "title": "Budapest tickets, passes and ticket validation",
    "shortTitle": "Tickets & passes",
    "description": "Understand regular tickets, travelcards, mobile validation, Pay&GO and the special 100E fare.",
    "photoKey": "buda-castle-funicular",
    "caption": "The Castle Hill Funicular requires a separate ticket; it is not an illustration of an ordinary BKK validator.",
    "tourContext": {
      "category": "transfers"
    },
    "intro": "A transport ticket is only good value if it matches how you will travel. Budapest has single tickets, time-based options, travelcards and passes, plus some special services. Check live prices with BKK, because both fares and validation rules can change.",
    "highlights": [
      "A purchased paper ticket normally needs validation.",
      "Pay&GO bankcard ticketing is available only on supported services.",
      "100E Airport Express has its own ticket rules."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "One trip, several rides or several days?",
        "paragraphs": [
          "If you are taking one short ride, a single ticket may fit. If you plan several journeys, look at time-based tickets, day travelcards or longer passes. Check how changes between vehicles are treated: transfer rights are not identical across all products.",
          "For a visit focused on one neighbourhood, walking may save money and time. For spread-out visits, public transport will often be worthwhile."
        ]
      },
      {
        "id": "section-2",
        "title": "Where to purchase",
        "paragraphs": [
          "Use the official BudapestGO app, BKK sales points and ticket vending machines. BKK also offers bankcard-based Pay&GO on selected services. A bankcard swipe is not universally equivalent to a ticket on every bus or tram.",
          "Avoid screenshots of QR tickets or third-party resale offers. Follow the operator’s current validation and identification instructions."
        ]
      },
      {
        "id": "section-3",
        "title": "How validation works",
        "paragraphs": [
          "Ordinary paper single tickets typically need validation at the beginning of the journey; some mobile tickets need a code scan or other activation. Passes and travelcards may be checked in other ways. Ticket inspectors can request proof of validity, so keep it accessible.",
          "If you enter the metro, validate at the correct place before going onto the platform. Do not assume a barrier-free station means ticket-free travel."
        ]
      },
      {
        "id": "section-4",
        "title": "The airport and funicular exceptions",
        "paragraphs": [
          "The 100E airport bus requires a dedicated ticket or an eligible add-on. The Castle Hill Funicular has its own fare and is not automatically covered by ordinary city transport tickets. Always compare the exact route against your ticket type."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Do I validate my ticket after buying it?",
        "answer": "For many single tickets, yes. Purchase and validation are distinct steps."
      },
      {
        "question": "Does a city travelcard include the Castle Hill Funicular?",
        "answer": "Do not assume so. The funicular has separate ticketing rules; check its operator."
      }
    ],
    "sources": [
      {
        "label": "BKK current ticket prices",
        "url": "https://bkk.hu/en/tickets-and-passes/prices/"
      },
      {
        "label": "BKK visitors’ ticket guide",
        "url": "https://bkk.hu/en/visiting-budapest/tickets-and-passes/"
      },
      {
        "label": "BKK airport express fares",
        "url": "https://bkk.hu/en/travel-information/airport-express/"
      }
    ],
    "places": [
      "buda-castle-funicular",
      "hungarian-parliament",
      "heroes-square"
    ],
    "other": [
      "/transportation/airport-to-city",
      "/transportation/public-transport",
      "/currency",
      "/guides/getting-around-budapest"
    ]
  },
  {
    "group": "transportation",
    "slug": "cycling",
    "title": "Cycling in Budapest and MOL Bubi bike sharing",
    "shortTitle": "Cycling & bike sharing",
    "description": "Plan riverside rides and use the renewed MOL Bubi bike-sharing service responsibly.",
    "photoKey": "chain-bridge",
    "caption": "The Chain Bridge and Danube; the photo shows the landmark, not a dedicated cycle lane.",
    "tourContext": {
      "category": "sightseeing"
    },
    "intro": "Cycling can be a refreshing alternative to sightseeing on foot, but road conditions vary across Budapest. The MOL Bubi network relaunched with a new provider, bikes and app in August 2026, so check the current version rather than following older instructions.",
    "highlights": [
      "MOL Bubi relaunched in August 2026 with regular and e-assist bikes.",
      "Use the current Bubi app for real-time availability and return rules.",
      "Cycle lanes and pedestrian restrictions must be checked by location."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Choose a comfortable route",
        "paragraphs": [
          "The Danube, green spaces and quieter streets can make appealing rides, but Budapest does not have a separated cycle path on every road. Choose a route for your confidence level and follow cycle-specific signs and maps. Avoid assuming a car route is a safe bike route.",
          "If you are travelling as a family, consider a shorter loop with public green areas and plenty of stops rather than a busy cross-town journey."
        ]
      },
      {
        "id": "section-2",
        "title": "The renewed MOL Bubi scheme",
        "paragraphs": [
          "BKK announced the renewed MOL Bubi public bike-sharing service in August 2026, with a redesigned app, new bicycles and e-assist options. Fleet size, service area and return locations may expand, making the app the best source of current availability.",
          "Check unlocking conditions, travel time charges and permitted parking before setting out. Return the bike only where the active rules allow."
        ]
      },
      {
        "id": "section-3",
        "title": "Road rules and weather",
        "paragraphs": [
          "Do not ride across pedestrian-only spaces or on pavements unless signs and local rules permit it. Tram tracks, cobblestones and wet roads need particular attention. Use lights and appropriate safety equipment.",
          "A bike outing can combine with neighbourhood walks and sightseeing stops. Lock your bike correctly and leave time for unforeseen detours."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is MOL Bubi still operating?",
        "answer": "Yes. BKK’s renewed MOL Bubi system began on 3 August 2026. Confirm current service and pricing in its official app."
      },
      {
        "question": "Are bikes allowed on any pavement?",
        "answer": "No. Follow Budapest’s traffic signs and restrictions; do not assume pedestrians must give way."
      }
    ],
    "sources": [
      {
        "label": "BKK official Bubi information",
        "url": "https://bkk.hu/en/travel-information/bubi/"
      },
      {
        "label": "BKK 2026 Bubi relaunch",
        "url": "https://bkk.hu/en/news/2026/08/bubi-bikes-back-in-budapest.17084/"
      },
      {
        "label": "Budapest Info cycling information",
        "url": "https://www.budapestinfo.hu/en/information-on-cycling-in-budapest"
      }
    ],
    "places": [
      "margaret-island",
      "city-park-varosliget",
      "chain-bridge",
      "kopaszi-gat"
    ],
    "other": [
      "/transportation/public-transport",
      "/transportation/accessible-travel",
      "/neighbourhoods",
      "/guides/budapest-in-3-days"
    ]
  },
  {
    "group": "transportation",
    "slug": "accessible-travel",
    "title": "Accessible transport and step-free sightseeing in Budapest",
    "shortTitle": "Accessible travel",
    "description": "Check lifts, low-floor transport, hills and venue access before planning a Budapest journey.",
    "photoKey": "g-tram",
    "caption": "A tram in Budapest. This photo does not establish the accessibility of a particular vehicle or stop.",
    "tourContext": {
      "category": "sightseeing"
    },
    "intro": "Budapest has accessible public transport services, but a low-floor vehicle alone does not guarantee an accessible journey. Check the station, lifts, stop, crossing and final approach to the attraction you want to visit.",
    "highlights": [
      "Check live elevator and service updates in BKK’s journey planner.",
      "Castle Hill and Gellért Hill have steep approaches.",
      "Ask each attraction about accessible entrances and assistance."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Plan the whole journey",
        "paragraphs": [
          "A low-floor tram or bus may be suitable, but station access, gaps at boarding and pavement conditions matter too. Look for official BKK accessibility information and any disruption notices. When lift access is essential, verify that it is operating on the day.",
          "If the route includes a transfer, confirm both legs. Give yourself more time than the minimum shown by a generic journey planner."
        ]
      },
      {
        "id": "section-2",
        "title": "Know where the hills are",
        "paragraphs": [
          "The Pest side is comparatively flat, while Buda contains steep streets, steps and cobbles around Castle Hill and Gellért Hill. A photo showing a wide promenade does not prove an entire route is suitable for wheelchair users or travellers with limited mobility.",
          "Choose attractions based on their actual entrances, not simply whether the neighbourhood seems walkable. Some buildings have separate accessible entrances."
        ]
      },
      {
        "id": "section-3",
        "title": "Baths, museums and guided visits",
        "paragraphs": [
          "Major museums and thermal baths publish varying accessibility information. Historic buildings, pool access, changing facilities and guided routes can have different constraints. Contact the venue directly with the precise assistance you need before paying for a non-refundable ticket.",
          "Commercial tours should be checked with the operator for vehicle access and walking requirements. A generic label such as ‘easy’ is not enough."
        ]
      },
      {
        "id": "section-4",
        "title": "A more comfortable day",
        "paragraphs": [
          "Plan a few nearby visits with reliable alternatives, accessible facilities and rest breaks. A guided tour is worth considering only if the provider confirms its suitability. The freedom to skip a difficult section is often more valuable than an ambitious itinerary."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Are all Budapest metro stations step-free?",
        "answer": "No. Accessibility differs by station and connection. Check BKK’s current information for your precise route."
      },
      {
        "question": "Can a thermal bath guarantee step-free access?",
        "answer": "Facilities and pools differ. Confirm specific entrances, changing rooms and pool access directly with the bath."
      }
    ],
    "sources": [
      {
        "label": "BKK official accessibility information",
        "url": "https://bkk.hu/en/travel-information/accessibility/"
      },
      {
        "label": "Budapest Info transportation overview",
        "url": "https://www.budapestinfo.hu/en/transportation"
      }
    ],
    "places": [
      "hungarian-parliament",
      "szechenyi-thermal-bath",
      "matthias-church",
      "gellert-hill-citadella"
    ],
    "other": [
      "/transportation/public-transport",
      "/transportation/airport-to-city",
      "/guides/budapest-thermal-baths",
      "/essentials"
    ]
  },
  {
    "group": "transportation",
    "slug": "taxis-and-parking",
    "title": "Budapest taxis, ride-hailing and parking",
    "shortTitle": "Taxis & parking",
    "description": "Use licensed taxis, understand parking zones and decide whether a car makes sense for your trip.",
    "photoKey": "andrassy-avenue",
    "caption": "Andrássy Avenue in Budapest; not a photograph of a taxi rank or parking meter.",
    "tourContext": {
      "category": "transfers"
    },
    "intro": "Most first-time visitors do not need a car to explore central Budapest. Taxis or a legitimate transfer can help with luggage and late travel, while driving and parking need a closer look at local rules, restricted streets and payment.",
    "highlights": [
      "Choose licensed taxis or reputable booked transfers.",
      "Parking zones and permitted hours vary by location.",
      "Public transport can often be easier than parking in the centre."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Choosing a taxi",
        "paragraphs": [
          "Use a clearly licensed taxi company or a legitimate booking platform and confirm the estimated fare or published tariff before travelling. Avoid accepting offers from strangers at transport hubs.",
          "For airport travel, follow the operator and airport’s published pick-up instructions. If you have mobility requirements or large equipment, ask about vehicle suitability before booking."
        ]
      },
      {
        "id": "section-2",
        "title": "Parking in Budapest",
        "paragraphs": [
          "Parking rules differ across districts, zones and days. Watch signs carefully and use the city’s official parking information or designated payment channels. A hotel advertising parking may still need a separate reservation and charge.",
          "Do not rely on an old guide’s prices. A legal space can also be time-limited, reserved or unavailable at particular times."
        ]
      },
      {
        "id": "section-3",
        "title": "Driving beyond Budapest",
        "paragraphs": [
          "A rented car may make sense for a wider Hungary trip, but city-centre travel is generally manageable by public transport. If taking motorways, check Hungarian e-vignette rules before entering toll routes.",
          "Check local road restrictions, insurance conditions, one-way streets and where you are permitted to leave the vehicle overnight."
        ]
      },
      {
        "id": "section-4",
        "title": "Alternatives that keep things simple",
        "paragraphs": [
          "For Parliament, the Basilica and Danube walks, consider arriving by metro or tram and exploring on foot. Castle Hill is better assessed separately because of the slopes and transport links."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Do I need a rental car for central Budapest?",
        "answer": "Usually not. Budapest has extensive public transport; a car can add parking and traffic complications."
      },
      {
        "question": "Are parking fees the same across all districts?",
        "answer": "No. Check the current zone, time restrictions, and payment methods in the specific location."
      }
    ],
    "sources": [
      {
        "label": "Budapest Info transport guide",
        "url": "https://www.budapestinfo.hu/en/transportation"
      },
      {
        "label": "BKK public transport options",
        "url": "https://bkk.hu/en/visiting-budapest/"
      },
      {
        "label": "Budapest Airport official guidance",
        "url": "https://www.bud.hu/en"
      }
    ],
    "places": [
      "st-stephens-basilica",
      "hungarian-parliament",
      "buda-castle-district"
    ],
    "other": [
      "/transportation/airport-to-city",
      "/transportation/public-transport",
      "/essentials",
      "/guides/budapest-in-3-days"
    ]
  },
  {
    "group": "gastronomy",
    "slug": "hungarian-cuisine",
    "title": "What to eat in Budapest: Hungarian dishes explained",
    "shortTitle": "Hungarian food to try",
    "description": "Discover gulyás, pörkölt, chicken paprikash, lángos and Hungarian desserts with practical tips.",
    "photoKey": "g-langos",
    "caption": "Lángos, a savoury Hungarian fried-dough speciality with toppings. Photo credited below.",
    "tourContext": {
      "category": "food"
    },
    "intro": "Budapest is an excellent place to explore traditional Hungarian dishes, from rich stews and soups to inexpensive market snacks and pastries. A dish’s name, portion and recipe can vary between kitchens, so use this as a starting point rather than a fixed restaurant menu.",
    "highlights": [
      "Gulyás is traditionally a soup, not simply any beef stew.",
      "Pörkölt and paprikás are different styles of sauced dishes.",
      "Lángos and chimney cake suit an informal food stop."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Start with the soups and stews",
        "paragraphs": [
          "Gulyás (goulash) is a hearty soup associated with beef, vegetables and paprika. Pörkölt is a stew-like dish often served with sides, while chicken paprikash features a paprika-based sauce, frequently finished with sour cream. If you need to avoid particular ingredients, check the recipe with the restaurant.",
          "Menus written for visitors sometimes translate several dishes loosely as ‘goulash’. Ask what is actually served before ordering, especially if you expect a particular spice level or accompaniment."
        ]
      },
      {
        "id": "section-2",
        "title": "Street food, markets and bakeries",
        "paragraphs": [
          "Lángos is fried dough commonly served savoury, including with garlic, sour cream or cheese. Kürtőskalács, often called chimney cake in English, is a sweet pastry cooked on a rotating spit and coated with sugar or other toppings.",
          "The Great Market Hall offers a useful introduction to local ingredients and casual snacks. Compare stalls and prices rather than assuming every vendor offers the same food or opening hours."
        ]
      },
      {
        "id": "section-3",
        "title": "Cafés and traditional desserts",
        "paragraphs": [
          "Budapest’s historic cafés are as much about architecture and atmosphere as cake. Look for layered cakes, pastries and coffee, but check menus and reservations with the venue itself.",
          "Café Gerbeaud and New York Café are well-known heritage interiors that can be visited for different experiences. Neither should be mistaken for a guarantee of short queues or budget pricing."
        ]
      },
      {
        "id": "section-4",
        "title": "Choose a food experience responsibly",
        "paragraphs": [
          "A cooking class, food walk or tasting tour can add context, especially if it covers traditional ingredients and neighbourhood history. Check what is included, dietary accommodations, minimum age for alcohol tastings and whether the activity is genuinely in Budapest.",
          "For independent exploration, combine a market with a café and one traditional meal rather than treating every recommendation as a stop you have to complete."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is Hungarian goulash always a thick stew?",
        "answer": "Traditional gulyás is a soup; menus sometimes translate other beef dishes loosely, so check the description."
      },
      {
        "question": "Is lángos a dessert?",
        "answer": "It is commonly eaten savoury, although sweet toppings exist too."
      }
    ],
    "sources": [
      {
        "label": "Official Budapest gastronomy overview",
        "url": "https://www.budapestinfo.hu/en/gastronomy"
      },
      {
        "label": "Budapest Info Hungarian cuisine",
        "url": "https://www.budapestinfo.hu/en/hungarian-cuisine"
      }
    ],
    "places": [
      "great-market-hall",
      "cafe-gerbeaud",
      "new-york-cafe"
    ],
    "other": [
      "/gastronomy/markets-and-street-food",
      "/gastronomy/cafes-and-patisseries",
      "/currency",
      "/guides/budapest-food-and-markets",
      "/neighbourhoods/jewish-quarter"
    ]
  },
  {
    "group": "gastronomy",
    "slug": "cafes-and-patisseries",
    "title": "Budapest cafés, coffee houses and patisseries",
    "shortTitle": "Cafés & sweet treats",
    "description": "Plan a café stop at Gerbeaud or New York Café and discover Budapest’s pastry traditions.",
    "photoKey": "g-cafe",
    "caption": "The ornate interior of historic Café Gerbeaud, Budapest. Photo credited below.",
    "tourContext": {
      "category": "food"
    },
    "intro": "A coffee stop is part of Budapest’s city story. Ornate cafés, old confectioneries and modern neighbourhood coffee shops offer very different moods. Choose one that fits your walking route rather than adding long transfers for a single photo.",
    "highlights": [
      "Historic cafés can be destination visits in their own right.",
      "Cakes and service charges differ by venue.",
      "Smaller independent cafés often require no advance planning."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Café Gerbeaud and Vörösmarty Square",
        "paragraphs": [
          "Café Gerbeaud is associated with Budapest’s confectionery history and sits in an excellent location for central Pest sightseeing. The historic interior is an attraction, but opening times, seat availability, menu prices and reservations should be checked with the café.",
          "Pair it with a walk along Váci Street or towards the Danube; those are separate sights and do not require buying a café meal."
        ]
      },
      {
        "id": "section-2",
        "title": "The dramatic New York Café",
        "paragraphs": [
          "New York Café is famed for its richly decorated interior. It is not right beside Gerbeaud: treat it as a stop in another part of central Pest, perhaps on a Jewish Quarter or wider boulevard walk.",
          "If it is crowded, consider whether a shorter, quieter coffee stop serves your trip better. The setting is memorable, but the price and wait time may be a bigger commitment than expected."
        ]
      },
      {
        "id": "section-3",
        "title": "Other cafés and cake culture",
        "paragraphs": [
          "Hungary’s desserts include layered cakes, strudels and sweet pastries, but recipes and menu offerings vary. Ask about allergens and check whether the listed price includes a service charge. Traditional and speciality coffee cafés can both be worthwhile.",
          "A food tour may add value by giving you a curated tasting route, but confirm exactly how many stops and tastings are included."
        ]
      },
      {
        "id": "section-4",
        "title": "Make the neighbourhood the main event",
        "paragraphs": [
          "Combine a café stop with the Basilica, downtown squares or district streets. GoToBudapest’s attraction pages can help you decide which nearby buildings and stories to explore before and after your coffee."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Are the two best-known cafés next to each other?",
        "answer": "No. Gerbeaud is near Vörösmarty Square; New York Café is farther east."
      },
      {
        "question": "Can I assume historic cafés have the same menu each day?",
        "answer": "No. Check the venue’s current menu, prices, opening times and reservation policies."
      }
    ],
    "sources": [
      {
        "label": "Official Budapest gastronomy overview",
        "url": "https://www.budapestinfo.hu/en/gastronomy"
      },
      {
        "label": "Café Gerbeaud official website",
        "url": "https://gerbeaud.hu/en/"
      },
      {
        "label": "New York Café official website",
        "url": "https://newyorkcafe.hu/en/"
      }
    ],
    "places": [
      "cafe-gerbeaud",
      "new-york-cafe",
      "st-stephens-basilica",
      "great-market-hall"
    ],
    "other": [
      "/gastronomy/hungarian-cuisine",
      "/gastronomy/markets-and-street-food",
      "/neighbourhoods/downtown-pest",
      "/guides/budapest-food-and-markets"
    ]
  },
  {
    "group": "gastronomy",
    "slug": "markets-and-street-food",
    "title": "Budapest markets and street food: what to look for",
    "shortTitle": "Markets & street food",
    "description": "Explore the Great Market Hall, Hungarian ingredients, lángos and neighbourhood food stops.",
    "photoKey": "g-market",
    "caption": "The interior of Budapest’s Great Market Hall. Photo credited below.",
    "tourContext": {
      "category": "food"
    },
    "intro": "Food markets give you a practical feel for Budapest. You can browse vegetables, spices and everyday ingredients, try a snack and continue into nearby streets. They are working shopping places, not identical to all-day food festivals.",
    "highlights": [
      "The Great Market Hall is a well-known visitor market.",
      "Opening times can be different on weekends and holidays.",
      "Compare prices and ask whether card payment is accepted at the stall."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Begin at the Great Market Hall",
        "paragraphs": [
          "The Great Market Hall near Fővám tér is a central starting point for exploring local ingredients, paprika, baked goods and some ready-to-eat food. It is easy to pair with a riverside walk or the streets of the southern inner city.",
          "Do not assume every stall offers cooked dishes, the same prices or card payment. Allow time to compare what is available; keep a small amount of HUF cash if needed."
        ]
      },
      {
        "id": "section-2",
        "title": "Understand paprika and familiar ingredients",
        "paragraphs": [
          "Paprika appears across many Hungarian dishes but can vary from sweet to hotter preparations. Market stalls may sell different grades and blends. Read the labels and confirm what the product contains before buying, especially if you are transporting foods across borders.",
          "Traditional sausages, pickles, preserves, strudels and pastries are other foods visitors may encounter. Availability varies by season and stall."
        ]
      },
      {
        "id": "section-3",
        "title": "Try a casual snack",
        "paragraphs": [
          "Lángos is a familiar fried-dough street food, often with garlic, sour cream and cheese. Chimney cake is another popular sweet treat. They suit a flexible food stop rather than a strict sightseeing timetable.",
          "Look for clear prices and sensible portion sizes. If you have allergies or dietary restrictions, ask the seller directly about ingredients and cooking methods."
        ]
      },
      {
        "id": "section-4",
        "title": "Beyond the famous hall",
        "paragraphs": [
          "Neighbourhood food streets, cafés and smaller markets can add variety. Pair market time with the nearby Hungarian National Museum or the Great Market Hall’s surrounding streets, rather than trying to cross the city for several similar stalls."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is the Great Market Hall a restaurant?",
        "answer": "It is primarily a market with a mix of stalls and some food options; it should not be treated as a single restaurant."
      },
      {
        "question": "Can I use a card at every stall?",
        "answer": "Card payment is common in Budapest but not universal at small stalls. Ask first and keep local cash as a backup."
      }
    ],
    "sources": [
      {
        "label": "Official Budapest gastronomy guide",
        "url": "https://www.budapestinfo.hu/en/gastronomy"
      },
      {
        "label": "Visit Hungary — money and card use",
        "url": "https://visithungary.com/articles/money"
      }
    ],
    "places": [
      "great-market-hall",
      "hungarian-national-museum",
      "cafe-gerbeaud"
    ],
    "other": [
      "/gastronomy/hungarian-cuisine",
      "/gastronomy/cafes-and-patisseries",
      "/currency",
      "/guides/budapest-food-and-markets"
    ]
  },
  {
    "group": "gastronomy",
    "slug": "bars-and-nightlife",
    "title": "Budapest bars, ruin pubs and evening food",
    "shortTitle": "Bars & nightlife",
    "description": "Get a feel for Budapest’s ruin bars, relaxed evenings, river views and practical late-night transport.",
    "photoKey": "g-nightlife",
    "caption": "Budapest nightlife scene. Photo credited below.",
    "tourContext": {
      "category": "nightlife"
    },
    "intro": "Budapest offers everything from relaxed cafés that stay open late to lively ruin pubs and evening river cruises. District VII is often associated with nightlife, but it also contains important Jewish heritage; respect the neighbourhood as a lived-in place.",
    "highlights": [
      "Ruin pubs are only one way to enjoy a Budapest evening.",
      "Plan a safe return trip before the metro and tram timetable changes.",
      "Check age restrictions and inclusions on bookable evening tours."
    ],
    "sections": [
      {
        "id": "section-1",
        "title": "Ruin pubs and the Jewish Quarter",
        "paragraphs": [
          "Ruin bars have helped shape Budapest’s international nightlife reputation. Their popularity can make streets busy or noisy late into the evening, so consider the exact venue and street if you are staying nearby.",
          "Do not overlook Dohány Street Synagogue and other important Jewish heritage sites. Visiting a religious place during the day and going out at night require different respect and visiting arrangements."
        ]
      },
      {
        "id": "section-2",
        "title": "An evening with a view",
        "paragraphs": [
          "A riverside walk or a scheduled Danube cruise can be a quieter alternative to a busy bar. Cruises vary in route, duration, included drinks and cancellation terms, so compare what the provider actually offers before booking.",
          "For rooftop bars, check entry requirements, minimum spend or reservations. A panorama does not mean the venue can guarantee the table or view pictured."
        ]
      },
      {
        "id": "section-3",
        "title": "Food, service charges and getting home",
        "paragraphs": [
          "Late meals can be convenient but pricing and service charges vary. Check whether the bill includes a service charge before adding a separate tip. Pay in HUF if a terminal offers dynamic conversion to your home currency.",
          "After an evening out, use official BKK night routes or a licensed taxi. Keep your accommodation address saved and avoid leaving a friend isolated."
        ]
      }
    ],
    "faqs": [
      {
        "question": "Is the Jewish Quarter only about nightlife?",
        "answer": "No. It has significant religious, cultural and historical heritage, alongside lively evening venues."
      },
      {
        "question": "Can I book a cruise instead of visiting a bar?",
        "answer": "Yes. Check available Budapest cruise products, times and inclusions with the supplier."
      }
    ],
    "sources": [
      {
        "label": "Budapest Info gastronomy and nightlife",
        "url": "https://www.budapestinfo.hu/en/gastronomy"
      },
      {
        "label": "BKK evening journey planning",
        "url": "https://bkk.hu/en/travel-information/"
      }
    ],
    "places": [
      "dohany-street-synagogue",
      "rumbach-street-synagogue",
      "chain-bridge",
      "hungarian-parliament"
    ],
    "other": [
      "/neighbourhoods/jewish-quarter",
      "/attractions/szimpla-kert",
      "/guides/budapest-bars-nightlife",
      "/guides/danube-cruises",
      "/gastronomy/hungarian-cuisine",
      "/transportation/public-transport"
    ]
  }
];
export const transportationGuides = visitorGuides.filter((g) => g.group === "transportation");
export const gastronomyGuides = visitorGuides.filter((g) => g.group === "gastronomy");
export const findVisitorGuide = (group: VisitorGuide["group"], slug: string) => visitorGuides.find((g) => g.group === group && g.slug === slug);

export const cultureVisitorGuides = visitorGuides.filter((g) => g.group === "culture");

export const practicalVisitorGuides = visitorGuides.filter((g) => g.group === "visit");

// The visitor guides that mention an attraction: it is listed in the guide's `places` or linked from its `other` list.
export const visitorGuidesForPlace = (slug: string): VisitorGuide[] =>
  visitorGuides.filter((g) => g.places.includes(slug) || g.other.includes(`/attractions/${slug}`));
