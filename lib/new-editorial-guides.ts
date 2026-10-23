import type { Guide } from "./guides";

export const newEditorialGuides: Guide[] = [
  {
    slug: "downtown-pest-walking-guide",
    title: "Downtown Pest walking guide: Parliament, Basilica and the Danube",
    shortTitle: "A walk through Downtown Pest",
    category: "Neighbourhoods",
    description: "A relaxed self-guided walk through Budapest's central Pest sights, from Parliament to St Stephen's Basilica, Vörösmarty Square and the Chain Bridge.",
    image: "danube.webp",
    imageAlt: "Hungarian Parliament rising above the Danube on the Pest riverbank",
    updated: "2026-10-23",
    intro: "Downtown Pest rewards wandering. Its central streets put architectural landmarks, historic cafés and the Danube within reach of one another. This self-guided route follows a loose north-to-south line through the city centre, leaving plenty of room for cafés, interior visits and unexpected detours. It is not a timed tour.",
    highlights: [
      "Start at Kossuth Square for the Parliament exterior",
      "Continue to St Stephen's Basilica and Széchenyi István Square",
      "Finish around Vörösmarty Square and the river, or extend to the Great Market Hall"
    ],
    sections: [
      {
        id: "starting-point",
        title: "Start at Parliament and Kossuth Square",
        paragraphs: [
          "The Hungarian Parliament building is one of Budapest's defining riverfront landmarks. Start outside on Kossuth Lajos Square, where you can appreciate the building's scale without an interior ticket. If you want a guided visit inside, arrange the correct admission separately through the official visitor service.",
          "A little farther along the embankment, Shoes on the Danube Bank commemorates people murdered on the riverbank during the Holocaust. Visit in a quiet, respectful spirit; it is not simply another photo stop."
        ],
        bullets: [
          "Check Parliament entry and security rules before your date.",
          "Keep the memorial visit unhurried and respectful."
        ]
      },
      {
        id: "basilica",
        title: "Find your way towards St Stephen's Basilica",
        paragraphs: [
          "Walk into the city-centre streets and make St Stephen's Basilica your next landmark. The surrounding square is inviting even if you choose not to enter. Religious services, visitor entry and any additional areas such as lookouts may follow separate rules.",
          "Take a little time on the surrounding streets rather than treating the route as a direct dash between monuments. The city centre is as much about its façades and corner cafés as its headline sights."
        ]
      },
      {
        id: "bridge",
        title: "Head towards Chain Bridge and the river",
        paragraphs: [
          "From the basilica area, continue towards Széchenyi István Square and the Chain Bridge approaches. Gresham Palace is a useful architectural landmark on the square; the bridge opens the view towards the Buda hills and the Castle District opposite.",
          "You can cross to Buda if your day has enough time, or stay on the Pest side to continue along the river. The view back across the Danube is one of the simplest pleasures of this route."
        ]
      },
      {
        id: "vaci",
        title: "Choose your café stop around Vörösmarty Square",
        paragraphs: [
          "Vörösmarty Square and nearby Váci Street make an easy final city-centre cluster. The streets are popular with visitors and shoppers; a short turn into the smaller surrounding lanes offers a change of pace.",
          "Café Gerbeaud is a historic option on the square. Check its current menu and reservation rules on the official website if you plan to stop, rather than assuming a particular price or available table."
        ]
      },
      {
        id: "extension",
        title: "Extend the walk towards the Great Market Hall",
        paragraphs: [
          "If you still have energy, continue south towards the Great Market Hall for a different atmosphere. This takes you beyond the compact core of District V, so allow extra time and check market trading hours.",
          "For a shorter day, end at the river and enjoy the view. Many visitors get more from a shorter walk and an unplanned pause than from squeezing in one more distant sight."
        ],
        bullets: [
          "This is a suggested walking sequence, not calculated live directions.",
          "Check accessible transport options and venue entrances individually.",
          "Plan around confirmed admissions, not guessed opening times."
        ]
      }
    ],
    faqs: [
      {
        question: "Can I walk between the main Downtown Pest sights?",
        answer: "Yes, the central landmarks in this guide lend themselves to a walking visit. Adapt the length to your pace and mobility needs."
      },
      {
        question: "Do I need to buy tickets for the whole route?",
        answer: "No. The public streets and riverfront are open to explore without a tour ticket. Individual interiors and venues have separate admission arrangements."
      },
      {
        question: "Is the Jewish Quarter part of this walk?",
        answer: "Not directly. The Jewish Quarter is mainly in nearby District VII; this route concentrates on the central Pest area, particularly District V."
      }
    ],
    sources: [
      {label:"Hungarian Parliament — official visitor information",url:"https://www.parlament.hu/web/visitors"},
      {label:"BKK — public transport network in the centre",url:"https://bkk.hu/en/journey-planning/maps/public-transport-network-in-the-city-centre"},
      {label:"Budapest official tourism portal",url:"https://www.budapestinfo.hu/en"}
    ],
    related: ["buda-castle-district","danube-cruises","getting-around-budapest"]
  },
  {
    slug: "budapest-food-and-markets",
    title: "Budapest food and markets: first-time guide to cafés and local flavours",
    shortTitle: "Markets, cafés & local flavours",
    category: "Food & markets",
    description: "Discover the Great Market Hall, famous Budapest cafés, classic Hungarian dishes and practical tips for a food-focused city break.",
    image: "city.webp",
    imageAlt: "Budapest city skyline and the Danube",
    imageCaption: "Budapest city panorama — not a photograph of the food venues in this article.",
    updated: "2026-10-23",
    intro: "A good Budapest food day does not need a perfect checklist. Try a market, make time for a café and order a dish that interests you. This guide focuses on a small number of documented venues already in our directory, plus useful pointers for discovering Hungarian flavours at your own pace. It is not a restaurant ranking or a personal tasting review.",
    highlights: [
      "Go to the Great Market Hall to browse food stalls and ingredients",
      "Consider Café Gerbeaud and New York Café for very different historic interiors",
      "Check menu prices, allergens and reservations with each venue"
    ],
    sections: [
      {
        id: "great-market-hall",
        title: "Start with the Great Market Hall",
        paragraphs: [
          "The Great Market Hall is an easy introduction to Budapest's market culture. Browse before buying and take time to compare stalls. Traditional ingredients, everyday produce and food-to-go can share the same building, but traders and selections change.",
          "Market hours may differ from typical restaurant hours and can change around holidays. Verify the official opening information for your visit; avoid planning a final-day market stop around a guessed schedule."
        ]
      },
      {
        id: "gerbeaud",
        title: "A café stop near Vörösmarty Square",
        paragraphs: [
          "Café Gerbeaud is a well-known historic café in central Pest. Its location makes it a convenient addition to a stroll around Vörösmarty Square and Váci Street.",
          "The atmosphere may be a reason to visit as much as the menu. Check the current menu and booking arrangements directly, and decide whether the experience fits your budget and appetite."
        ]
      },
      {
        id: "new-york-cafe",
        title: "The theatrical interiors of New York Café",
        paragraphs: [
          "New York Café offers an ornate setting away from the compact District V core. It works best as a deliberate stop in a wider city walk rather than an assumed quick detour from the river.",
          "Popular historic cafés may have waits or their own admission and reservation policies. Always verify the current arrangements with the venue instead of relying on old travel videos."
        ]
      },
      {
        id: "hungarian-dishes",
        title: "What to look for on a Hungarian menu",
        paragraphs: [
          "Gulyás is a familiar starting point, alongside paprika-seasoned dishes, lángos and pastries such as rétes. These names describe broad traditions, not a promise that every café or stall will serve them in the same way.",
          "If you have food allergies or other dietary requirements, ask the venue about the specific preparation and ingredients. Translations and menus can be incomplete."
        ]
      },
      {
        id: "make-it-local",
        title: "Leave room for your own discoveries",
        paragraphs: [
          "A market breakfast, riverside walk and afternoon coffee often make more sense than travelling across the city for three famous venues in one day. Choose stops close to where you already plan to be.",
          "Treat this guide as an editorial starting point. GoToBudapest currently has three detailed food-and-market attraction entries, and those are not an exhaustive account of Budapest dining."
        ]
      }
    ],
    faqs: [
      {
        question: "Is this a list of the best restaurants in Budapest?",
        answer: "No. It is a curated introduction to markets and historic cafés, not a quality ranking or first-hand review of every venue."
      },
      {
        question: "Do I need a booking for a famous café?",
        answer: "Reservation rules vary by venue and date. Use the official venue site for current details."
      },
      {
        question: "Can I rely on fixed food prices in travel guides?",
        answer: "No. Check the venue's current menu and any service charges before ordering."
      }
    ],
    sources: [
      {label:"Budapest official destination portal",url:"https://www.budapestinfo.hu/en"},
      {label:"Café Gerbeaud — official website",url:"https://gerbeaud.hu/en/"},
      {label:"New York Café — official website",url:"https://newyorkcafe.hu/en/"}
    ],
    related: ["downtown-pest-walking-guide","budapest-bars-nightlife","budapest-in-3-days"]
  }
];
