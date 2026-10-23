export type EditorialSection = {
  id: string;
  title: string;
  paragraphs: string[];
};
export type EditorialPage = {
  slug: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  description: string;
  image: "budapest.webp" | "danube.webp" | "city.webp";
  imageAlt: string;
  imageCaption: string;
  intro: string;
  highlights: string[];
  sections: EditorialSection[];
  attractionSlugs: string[];
  guideSlugs: string[];
  sources: { label: string; url: string }[];
  questions: { question: string; answer: string }[];
};

export const neighbourhoods: EditorialPage[] = [
  {
    slug: "castle-district",
    title: "The Castle District",
    subtitle: "Historic lanes, hilltop views and a little room to get lost.",
    eyebrow: "BUDA · DISTRICT I",
    description: "Explore Budapest’s Castle District: Fisherman’s Bastion, Matthias Church, the Royal Palace, walking routes, access tips and nearby sights.",
    image: "budapest.webp",
    imageAlt: "Budapest Castle Hill skyline with Matthias Church and Fisherman’s Bastion",
    imageCaption: "Castle Hill · Buda",
    intro: "High above the Danube, the Castle District rewards slow exploration. Its cobbled streets connect Matthias Church and Fisherman’s Bastion with the palace courtyards, museum entrances and quieter lanes to the north. You do not need a ticket to enjoy the public streets and many of the viewpoints.",
    highlights: ["Allow half a day for a relaxed first visit", "Fisherman’s Bastion has free lower terraces and separately ticketed upper areas", "Build in time for backstreets and viewpoints beyond the main photo stop"],
    sections: [
      { id: "where-to-begin", title: "Start around Trinity Square", paragraphs: [
        "The colourful roof of Matthias Church and the towers of Fisherman’s Bastion make an obvious first stop. Spend time in the surrounding square before choosing whether to visit the church interior or the Bastion’s paid upper areas. Those are separate admissions with their own visitor rules.",
        "From the lower terraces you can look over the Danube towards the Parliament building without purchasing an upper-lookout ticket. The view changes with the light, but the best hour is simply one when you can linger rather than race to the next stop."
      ] },
      { id: "beyond-the-view", title: "Explore the lanes beyond the crowd", paragraphs: [
        "Continue towards Tóth Árpád Promenade for views in the opposite direction, towards the Buda hills. Nearby Vienna Gate and Mary Magdalene Tower reveal a more residential, layered side of the district.",
        "Streets, slopes and some uneven paving make this a place for comfortable shoes. For a shorter visit, choose just Trinity Square, Fisherman’s Bastion and one quiet lane instead of trying to cover every courtyard."
      ] },
      { id: "palace-quarter", title: "Make the palace quarter its own stop", paragraphs: [
        "At the southern end, the Royal Palace area includes the Hungarian National Gallery, the Budapest History Museum, courtyards, Matthias Fountain and Savoyai Terrace. Exhibitions require their own tickets; entering the surrounding public spaces is not the same as visiting a museum.",
        "Castle Garden Bazaar offers a different approach along the slope toward the river. Plan this part of the visit separately if you want to see an exhibition rather than simply enjoy the architecture."
      ] },
      { id: "getting-there", title: "How to get to Castle Hill", paragraphs: [
        "Budapest public transport provides a practical alternative to climbing from the river. BKK lists buses 16, 16A and 116 for the upper Castle area. Check the current journey planner for your starting point and accessibility needs.",
        "The historic funicular runs between Clark Ádám Square and Szent György Square, but has separate tickets and maintenance closures. Check its current service notice rather than assuming it is operating on your date."
      ] }
    ],
    attractionSlugs: ["fishermans-bastion","matthias-church","trinity-square","buda-castle-district","hungarian-national-gallery","budapest-history-museum","matthias-fountain","savoyai-terrace","toth-arpad-promenade","vienna-gate","mary-magdalene-tower","hospital-in-the-rock","buda-castle-funicular","castle-garden-bazaar"],
    guideSlugs: ["buda-castle-district","budapest-in-3-days","getting-around-budapest"],
    sources: [
      { label:"Visit Budavár — Castle District attractions", url:"https://visitbudavar.com/en/attractions" },
      { label:"BKK — Buda Castle Funicular and connections", url:"https://bkk.hu/en/travel-information/special-and-heritage-transport-services/funicular/" },
      { label:"Matthias Church — official information", url:"https://matyas-templom.hu/en/" }
    ],
    questions: [
      {question:"Is the Castle District free to visit?",answer:"Walking the public streets is free. Museums, Matthias Church interiors and the upper lookout at Fisherman’s Bastion may require separate admission."},
      {question:"How much time should I allow?",answer:"A half-day is a useful editorial allowance for the main viewpoints and quieter lanes. Add time for any booked museum or guided visit."}
    ]
  },
  {
    slug: "downtown-pest",
    title: "Downtown Pest",
    subtitle: "Big-city architecture, riverside walks and cafés between the landmarks.",
    eyebrow: "PEST · CITY CENTRE",
    description: "Explore Downtown Pest in Budapest, from Parliament, St Stephen’s Basilica and Chain Bridge to Váci Street, Vörösmarty Square and riverside walks.",
    image: "danube.webp",
    imageAlt: "The Hungarian Parliament on the Danube riverbank in Pest",
    imageCaption: "The Danube embankment · Pest",
    intro: "Downtown Pest is the Budapest of grand façades, lively streets, monumental architecture and easy riverfront wandering. The central neighbourhood, especially District V, is a good base for a first walk: start at Parliament or the basilica, cross the squares between them and finish along the river.",
    highlights: ["A mostly walkable city-centre area", "Combine St Stephen’s Basilica, Chain Bridge and the riverside", "Váci Street and Vörösmarty Square bring cafés and shopping into the mix"],
    sections: [
      { id: "start-at-parliament", title: "Begin at the Parliament and the river", paragraphs: [
        "Start at Kossuth Lajos Square to appreciate the Parliament building from outside. If you want to go inside, plan around a confirmed visitor ticket from the Parliament’s official booking route instead of expecting a walk-in place.",
        "The riverbank nearby includes Shoes on the Danube Bank, a Holocaust memorial. Visit respectfully, leave space for others and treat it as a place of remembrance rather than a photo prop."
      ] },
      { id: "basilica-and-squares", title: "Basilica, city squares and architectural details", paragraphs: [
        "Walk towards St Stephen’s Basilica and the surrounding streets. Whether you enter depends on the current visitor access schedule; you can also enjoy the architecture and the square from outside.",
        "Continue towards Széchenyi István Square to see Gresham Palace and the Chain Bridge approaches. On a shorter visit, that cluster gives you a striking introduction without needing to cross the entire city."
      ] },
      { id: "cafe-streets", title: "Vörösmarty Square and Váci Street", paragraphs: [
        "From the heart of the centre, wander around Vörösmarty Square and Váci Street. These are well-known pedestrian and shopping areas, so take a side street if you want a quieter café stop.",
        "Café Gerbeaud is a historic name on the square. Opening hours, menus, reservation practices and prices can change; check directly before organising your day around any particular venue."
      ] },
      { id: "extend-your-walk", title: "Extend south or cross the Danube", paragraphs: [
        "For a longer walk continue south toward the Great Market Hall, checking current trading hours before visiting. It sits outside the compact District V core and works best as an extension rather than an obligatory stop.",
        "The Chain Bridge makes a natural transition to Buda. You can turn the afternoon into a two-bank experience by following the river or heading towards Castle Hill, but leave enough time for the slopes on the Buda side."
      ] }
    ],
    attractionSlugs: ["hungarian-parliament","shoes-on-the-danube-bank","st-stephens-basilica","chain-bridge","gresham-palace","hungarian-academy-of-sciences","vorosmarty-square","vaci-street","cafe-gerbeaud","pesti-vigado","great-market-hall"],
    guideSlugs: ["downtown-pest-walking-guide","danube-cruises","getting-around-budapest"],
    sources: [
      { label:"Hungarian Parliament — official visitor centre", url:"https://www.parlament.hu/web/visitors" },
      { label:"BKK — public transport network in the city centre", url:"https://bkk.hu/en/journey-planning/maps/public-transport-network-in-the-city-centre" },
      { label:"Budapest official tourism portal", url:"https://www.budapestinfo.hu/en" }
    ],
    questions: [
      {question:"Is Downtown Pest the same as the Jewish Quarter?",answer:"No. The historic city centre is primarily District V; the Jewish Quarter is mainly in neighbouring District VII and deserves a separate visit."},
      {question:"Can I see the main sights on foot?",answer:"Many central sights are close enough for a walking day. Allow extra time for stops, accessibility needs and any booked interiors."}
    ]
  }
];

export const experiencePages: EditorialPage[] = [
  {
    slug:"danube", title:"The Danube, your way", subtitle:"Riverside walks, bridges and Budapest from the water.", eyebrow:"EXPERIENCES · RIVER",
    description:"Discover Budapest’s Danube riverfront, famous bridges, sightseeing cruise options, walking ideas and the best landmarks to look out for.",
    image:"danube.webp", imageAlt:"Budapest Parliament and bridges beside the Danube",imageCaption:"The Danube · Budapest",
    intro:"The Danube is Budapest’s simplest orientation guide: Castle Hill rises above the Buda side, while Parliament and downtown streets sit on the Pest bank. You can enjoy the views on foot for free or consider a sightseeing cruise when you want a different angle.",
    highlights:["Walk a stretch of either embankment before choosing a boat","Check the exact departure pier and route for any cruise","Evening departures vary with season and sunset"],
    sections:[
      {id:"on-foot",title:"Start with the riverfront",paragraphs:["Choose a manageable section rather than trying to walk both embankments in one outing. Parliament, the Chain Bridge and the Castle Hill skyline are useful visual landmarks.","The Shoes on the Danube Bank memorial is a place of remembrance. Give it the attention and respect it deserves."]},
      {id:"on-the-water",title:"Choosing a Danube cruise",paragraphs:["Compare daytime sightseeing boats, evening cruises and longer dining experiences by actual route, boarding location, duration, accessibility and what is included in the ticket. A photo of an illuminated Parliament is not a guarantee of the same view on every departure.","This website does not currently take bookings. Check operator descriptions, cancellation terms and meeting points before paying."]},
      {id:"when-to-go",title:"Enjoy the changing city light",paragraphs:["Daylight helps you see the hills and architectural details; after dark, lit landmarks provide a different atmosphere. Choose a departure for the experience you prefer rather than a fixed 'best time' that ignores season or weather."]},
    ],
    attractionSlugs:["hungarian-parliament","chain-bridge","shoes-on-the-danube-bank","gresham-palace","castle-garden-bazaar","pesti-vigado","fishermans-bastion"],
    guideSlugs:["danube-cruises","downtown-pest-walking-guide","buda-castle-district"],
    sources:[{label:"Budapest official tourism portal",url:"https://www.budapestinfo.hu/en"},{label:"Hungarian Parliament visitor information",url:"https://www.parlament.hu/web/visitors"}],
    questions:[{question:"Do I need a cruise ticket to enjoy the Danube?",answer:"No. The public riverfront and bridges offer excellent views without booking a boat."},{question:"Are all cruises the same?",answer:"No. Check the route, boarding pier, operating dates, inclusions and cancellation conditions for the specific departure."}]
  },
  {
    slug:"thermal-baths", title:"Thermal baths & slow afternoons",subtitle:"Discover Budapest’s bathing culture at your own pace.",eyebrow:"EXPERIENCES · WELLNESS",
    description:"Explore Budapest thermal baths including Széchenyi, Rudas and Lukács, with practical admission tips and the Gellért renovation notice.",
    image:"city.webp",imageAlt:"Budapest city panorama seen across the Danube",imageCaption:"Budapest panorama · not a photograph of a bath",
    intro:"Budapest’s thermal baths range from historic bathing spaces to large indoor and outdoor complexes. Choose the one that fits your day, then check current access rules directly. A famous bath may have different ticket areas, age restrictions and session arrangements.",
    highlights:["Pair Széchenyi with City Park", "Check Rudas session arrangements carefully", "Gellért Bath is closed for renovation"],
    sections:[
      {id:"choose",title:"Choose for your travel group",paragraphs:["Széchenyi pairs naturally with a visit to City Park. Rudas on the Buda side has different access arrangements depending on the day and bathing area, so couples and groups should check the exact session.","Lukács and Veli Bej are alternatives to research if you want a different location or atmosphere. The right choice depends on current conditions and admission rules."]},
      {id:"before-you-book",title:"Check what your ticket includes",paragraphs:["Look for the difference between locker and changing-cabin options, any age restrictions, accessibility provisions and the facilities included in a given ticket.","Pack swimwear, a towel and appropriate footwear. Verify with the operator whether any rentals are offered rather than relying on a dated guide."]},
      {id:"gellert",title:"Gellért is currently closed",paragraphs:["The Gellért Bath operator says the site closed for renovation in October 2025 and currently plans to reopen in 2028. This is not a confirmed reopening date and you should not schedule a current bathing visit there."]},
    ],
    attractionSlugs:["szechenyi-thermal-bath","rudas-thermal-bath","lukacs-thermal-bath","veli-bej-bath","palatinus-bath","gellert-thermal-bath"],
    guideSlugs:["budapest-thermal-baths","getting-around-budapest","budapest-in-3-days"],
    sources:[{label:"Széchenyi Bath — official site",url:"https://www.szechenyibath.hu/"},{label:"Rudas Bath — opening hours",url:"https://www.rudasfurdo.hu/en/opening-hours"},{label:"Gellért Bath — closure notice",url:"https://www.gellertbath.hu/"}],
    questions:[{question:"Is Gellért Bath open?",answer:"No. The official site reports a renovation closure, with a planned reopening in 2028."},{question:"Are Budapest thermal baths suitable for children?",answer:"Admission rules differ by venue and area. Check the operator’s age restrictions for your children before buying."}]
  },
  {
    slug:"food-and-markets",title:"Food, cafés & markets",subtitle:"A taste of the city beyond the postcard views.",eyebrow:"EXPERIENCES · FOOD",
    description:"Explore Budapest markets, cafés and Hungarian food culture, including Great Market Hall, Café Gerbeaud and New York Café, with practical visitor tips.",
    image:"city.webp",imageAlt:"Budapest streets and riverfront from above",imageCaption:"Budapest city panorama · not a photograph of a market",
    intro:"A Budapest city break is as much about stopping for a pastry or browsing market stalls as it is about landmarks. Start with well-established places and leave room for cafés you discover on foot. This is an editorial introduction, not a ranked list of restaurants.",
    highlights:["Browse the Great Market Hall with time to look around", "Pair Vörösmarty Square with a café stop", "Check menus, reservations and current hours directly"],
    sections:[
      {id:"market",title:"A market visit with no rush",paragraphs:["The Great Market Hall is an obvious place to begin exploring food stalls and the everyday variety of Hungarian ingredients. Opening and trading hours can vary by day or stall, so check before travelling across town.","A market is not a single restaurant: compare what individual sellers offer and decide whether you are there to browse, shop or eat."]},
      {id:"cafes",title:"Historic cafés and a little theatre",paragraphs:["Café Gerbeaud on Vörösmarty Square and New York Café are known for elaborate interiors and café culture, but they have very different locations and visitor experiences.","For famous cafés, a table may involve a wait or a reservation depending on the venue’s policies. Browse current menus and booking details on the official website before you go."]},
      {id:"what-to-try",title:"Discover Hungarian flavours",paragraphs:["Look out for gulyás, paprika-rich stews, lángos and pastries such as rétes. Preparation and menus vary by establishment; check ingredient and allergen information with the restaurant.","Build the food stops around the neighbourhood you are already visiting, rather than travelling the city just to tick off an internet list."]},
    ],
    attractionSlugs:["great-market-hall","cafe-gerbeaud","new-york-cafe"],
    guideSlugs:["budapest-food-and-markets","downtown-pest-walking-guide","budapest-bars-nightlife"],
    sources:[{label:"Budapest official tourism portal",url:"https://www.budapestinfo.hu/en"},{label:"Café Gerbeaud — official website",url:"https://gerbeaud.hu/en/"},{label:"New York Café — official website",url:"https://newyorkcafe.hu/en/"}],
    questions:[{question:"Are these the only food places in Budapest?",answer:"No. These are the three currently documented food and market attractions in the site’s curated directory, not an exhaustive list."},{question:"Should I book cafés?",answer:"Check the individual café’s current reservation policy and expected opening hours. They vary by venue."}]
  }
];

export function findNeighbourhood(slug:string){return neighbourhoods.find(p=>p.slug===slug);}
export function findExperience(slug:string){return experiencePages.find(p=>p.slug===slug);}
