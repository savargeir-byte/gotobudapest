import type { HistoricalStory } from "./attraction-editorial";

/**
 * Editorial seeds (1–25 of 50). Each slug belongs to a verified attraction
 * in the existing directory, and source URLs are attached in the aggregator.
 * Traditions are not fabricated to fill a field.
 */
export type HistorySeed = {
  slug: string;
  introduction: string;
  chapters: [heading: string, narrative: string][];
  stories?: HistoricalStory[];
  additionalSources?: { label: string; url: string }[];
};

export const historySeedsA: HistorySeed[] = [
  {
    slug: "hungarian-state-opera",
    introduction: "Budapest's Hungarian State Opera is both a working performance venue and a monument to the city's nineteenth-century cultural ambitions.",
    chapters: [
      ["A palace for a growing capital", "The Neo-Renaissance opera house was designed by Miklós Ybl and opened on 27 September 1884. Its position on Andrássy Avenue helped establish the new boulevard as a showcase of modern Budapest. The building brought opera and ballet into a purpose-built theatre after years of sharing stages with drama."],
      ["Art inside the auditorium", "Painters, sculptors and craftspeople contributed to its celebrated interiors. Károly Lotz's painted ceiling and the ceremonial staircase are as much part of the experience as the stage. A major restoration culminated in the venue's reopening in 2022."]
    ],
    stories: [{
      title: "An opening night the crowd could not resist", kind: "historical-account",
      description: ["The Opera House's own account recalls spectators pushing past guards on the opening day in 1884, eager to see the new building. The excitement became part of the institution's history.", "This is an anecdote documented by the opera company, not a local ghost legend."],
      sourceUrl: "https://www.opera.hu/en/news/the-opera-house/", sourceLabel: "Hungarian State Opera — opening history"
    }],
    additionalSources: [{ label: "Hungarian State Opera — construction history", url: "https://www.opera.hu/en/about-us/building/opera/the-construction-of-the-opera-house/" }]
  },
  {
    slug: "house-of-music-hungary",
    introduction: "The House of Music brings a new architectural chapter to City Park, connecting Hungary's musical heritage with contemporary design.",
    chapters: [
      ["An ambitious new cultural venue", "Opened in January 2022 as part of the Liget Budapest project, the House of Music was designed by Japanese architect Sou Fujimoto. Its unusual roof, glass walls and relationship to the surrounding trees make the building itself a reason to visit."],
      ["More than concert halls", "The institution combines the history of music with exhibitions, education and live events. Its themes reach beyond classical composers to sound technology and popular music, placing Hungarian traditions in an international story."]
    ],
    additionalSources: [{ label: "Liget Budapest — history of House of Music", url: "https://ligetbudapest.hu/en/the-project/house-of-hungarian-music" }]
  },
  {
    slug: "st-stephen-s-hall",
    introduction: "St Stephen's Hall recalls the decorative splendour of the royal palace and the losses that transformed Castle Hill in the twentieth century.",
    chapters: [
      ["A royal interior from the turn of the century", "The room originally belonged to the expanded Royal Palace complex and was designed to celebrate Hungarian craftsmanship and the legacy of the country's first king. Rich timber decoration, ceramics and historical ornament gave the room a ceremonial character."],
      ["Destruction and recreation", "The palace suffered severe wartime damage, and the original hall was lost. The reconstructed room is presented to visitors as part of the Castle Museum's palace heritage, with a separate exhibition and ticketing arrangement from other museum spaces."]
    ],
    additionalSources: [{label:"Budapest History Museum — St Stephen's Hall visitor context",url:"https://www.budapestinfo.hu/en/budapest-history-museum-castle-museum-1"}]
  },
  {
    slug: "museum-of-fine-arts",
    introduction: "The Museum of Fine Arts anchors Heroes' Square with a collection that puts Budapest's artistic identity in a wider European and ancient-world context.",
    chapters: [
      ["Building an international art museum", "The museum was established in the era when Budapest's public institutions were growing rapidly around the Millennium Monument. Its monumental classical-style building faces Heroes' Square, alongside the Kunsthalle exhibition hall."],
      ["Collections from Egypt to European painting", "The museum now brings together ancient Egyptian and classical objects, old masters and later works. Its historic and modern galleries allow visitors to follow contrasting artistic traditions rather than only Hungarian painting."]
    ]
  },
  {
    slug: "andrassy-avenue",
    introduction: "Andrássy Avenue tells the story of how nineteenth-century Budapest designed a capital with imperial-scale ambitions and a distinctive public life.",
    chapters: [
      ["A planned boulevard through Pest", "Created during the city's great period of expansion, the avenue connected the central streets with the developing City Park. Its broad urban design supported prestigious residences, public institutions and an increasingly fashionable cultural district."],
      ["Opera, villas and the underground", "The Hungarian State Opera and later grand villas mark different stretches of the avenue. The Millennium Underground Railway, built for the 1896 festivities, runs beneath the corridor, making architecture and transport part of the same historical route."]
    ]
  },
  {
    slug: "vaci-street",
    introduction: "Váci Street is a busy pedestrian route, but beneath the shops lies the memory of an older commercial Pest shaped by trade and changing city life.",
    chapters: [
      ["From historic street to shopping promenade", "The street belongs to Pest's long-established urban centre. As Budapest modernised, commercial façades, cafés and stores gave the route a central place in the city's public life. Architectural details from different periods survive above contemporary shopfronts."],
      ["A changing public stage", "Today the street joins squares, restaurants and side lanes rather than functioning as a single monument. Its seasonal decorations and street activity reflect the continued role of the centre as a place for promenading, trade and encounters."]
    ]
  },
  {
    slug: "new-york-cafe",
    introduction: "New York Café is a reminder that Budapest's grand coffeehouses were once important meeting places for journalists, writers and cultural life.",
    chapters: [
      ["An ornate café in a growing metropolis", "The café opened within the New York Palace at the end of the nineteenth century. Elaborate ceilings, gilding and large mirrors gave it the kind of theatrical interior that made Budapest's café culture famous."],
      ["Literary life and later restoration", "Coffeehouses became social workplaces where editors and writers exchanged ideas over long afternoons. The palace's story also reflects twentieth-century changes of use and later restoration, which returned the interior to its current lavish appearance."]
    ]
  },
  {
    slug: "shoes-on-the-danube-bank",
    introduction: "Shoes on the Danube Bank is a Holocaust memorial. Its simple forms honour the people murdered beside the river during the Second World War.",
    chapters: [
      ["Remembering victims of persecution", "The memorial consists of sixty pairs of iron shoes positioned beside the river. They evoke the footwear left behind by people shot into the Danube during the Arrow Cross terror in 1944–45, including Jewish victims and others persecuted by the regime."],
      ["A place for quiet remembrance", "The installation uses ordinary men's, women's and children's shoes to make individual lives visible in the landscape of the capital. It is not a decorative attraction: its meaning comes from remembrance of people whose lives were violently taken."]
    ],
    stories: [{
      title: "Why the shoes were left at the river", kind: "historical-account",
      description: ["Shoes were valuable possessions, and the victims were often forced to remove them before being shot. The empty pairs in the monument convey both the economic brutality and human loss of the killings."],
      sourceUrl:"https://www.budapestinfo.hu/en/shoes-on-the-danube-bank",sourceLabel:"Budapest Info — Shoes on the Danube Bank"
    }]
  },
  {
    slug: "gellert-hill-citadella",
    introduction: "The Citadella crowns Gellért Hill, where military history, religious memory and sweeping views meet above Budapest.",
    chapters: [
      ["A fortress after the revolution", "The Habsburg authorities built the Citadella in the aftermath of the Hungarian revolution of 1848–49. Its commanding position above the river gave the fortress a strongly political presence in a city marked by struggles over autonomy."],
      ["Changing meanings on the skyline", "The Liberty Statue and later public use shifted the hill's symbolism from military control towards national memory and sightseeing. Reconstruction has altered access at different times, so past descriptions of interior visits should not be treated as current opening information."]
    ]
  },
  {
    slug: "city-park-varosliget",
    introduction: "Városliget is both a public park and one of Budapest's great museum-and-entertainment landscapes, developed through centuries of urban change.",
    chapters: [
      ["From open land to metropolitan park", "As Pest expanded, the area evolved into a planned green space for recreation. The 1896 millennium celebrations brought major exhibition buildings and commemorative projects, leaving a distinctive mixture of parkland and architectural landmarks."],
      ["A park with many cultural lives", "The park's historic zoo, Vajdahunyad Castle, bathing facilities and lakes have been joined by newer institutions such as the House of Music. Seasonal skating and boating show how the same landscape is used in different ways across the year."]
    ]
  },
  {
    slug: "margaret-island-water-tower",
    introduction: "The Water Tower stands as a striking piece of early modern engineering on Margaret Island, now linking industry, art and the island's leisure culture.",
    chapters: [
      ["A functional landmark above the trees", "Built to supply water for the island, the tall tower became one of its most recognisable structures. Its architecture reflects a time when utility buildings could also be ambitious elements of the city skyline."],
      ["A second life in culture", "Instead of remaining only an infrastructure site, the tower has been used for exhibitions and views, connected to the island's open-air theatre and cultural programmes. Access to these functions varies with events."]
    ]
  },
  {
    slug: "liszt-ferenc-academy-of-music",
    introduction: "The Liszt Academy links the career of one of Hungary's most celebrated composers with the country's concert and music-training traditions.",
    chapters: [
      ["An institution carrying Liszt's name", "Franz Liszt helped establish the music academy tradition in Budapest during the nineteenth century. The institution developed into an internationally known conservatory and concert centre, bringing education and public performance together."],
      ["An architectural stage for music", "The historic academy building serves both students and visiting audiences. Its concert halls, decorative surfaces and performance programme make it a living part of Budapest's musical life, not merely a memorial to a single composer."]
    ]
  },
  {
    slug: "pesti-vigado",
    introduction: "Pesti Vigadó has been part of Budapest's cultural riverfront since the nineteenth century, linking architecture with concerts, meetings and celebrations.",
    chapters: [
      ["A grand gathering place by the river", "The Vigadó developed as a ceremonial and performance venue in the heart of Pest, reflecting the city's growing appetite for major cultural spaces. Its façade and richly decorated rooms were created for public occasions."],
      ["Rebuilding after wartime damage", "The building was badly damaged during the Second World War and remained under reconstruction for decades. It reopened in 1980, and the restored venue has since hosted music, art and other cultural programmes."]
    ]
  },
  {
    slug: "vorosmarty-square",
    introduction: "Vörösmarty Square combines a busy modern shopping area with the memory of Hungarian literary life in the centre of Pest.",
    chapters: [
      ["A square shaped by culture and commerce", "The square takes its present name from the nineteenth-century Hungarian poet Mihály Vörösmarty. The prominent monument to him anchors a public space surrounded by shops, cafés and significant city-centre façades."],
      ["A meeting place through the seasons", "The long association with cafés and street life continues in cultural events and winter markets. The square's changing uses show how a city centre can carry national literary memory while functioning as an everyday meeting place."]
    ]
  },
  {
    slug: "the-1956-monument",
    introduction: "The 1956 Monument remembers the Hungarian Revolution through a deliberately modern sculptural language of resistance and shared purpose.",
    chapters: [
      ["Remembering the uprising", "The monument near City Park commemorates the 1956 Revolution and War of Independence. The work by the i-Ypszilon group was inaugurated on 23 October 2006, fifty years after the revolution began."],
      ["Iron columns as a crowd", "Hundreds of vertical steel elements emerge from the ground and gradually gather into a more united form. Their varying heights and changing surfaces express individuals joining together, while the work's 56-degree geometry refers to 1956."]
    ],
    stories:[{
      title:"The geometry of 1956",kind:"historical-account",
      description:["The monument's axis makes a deliberate 56-degree angle with Dózsa György Road. That numerical detail places the date of the revolution inside the artwork's physical design."],
      sourceUrl:"https://www.budapestinfo.hu/en/the-1956-monument",sourceLabel:"Budapest Info — sculptural symbolism"
    }]
  },
  {
    slug: "gresham-palace",
    introduction: "Gresham Palace is a celebrated example of Budapest Art Nouveau, built for a commercial city and later transformed into a luxury hotel.",
    chapters: [
      ["A prestigious building at the Chain Bridge", "The palace was developed on Széchenyi István Square during the early twentieth century. Its flowing ornament, wrought metalwork and decorated interior reflect the artistic ambitions of the Art Nouveau period."],
      ["Restoration and a new purpose", "Over time the building's uses changed, and extensive restoration helped revive its architectural details. The landmark now houses a hotel, while its exterior continues to define the view towards Chain Bridge."]
    ]
  },
  {
    slug: "hungarian-academy-of-sciences",
    introduction: "The Academy's Danube-facing palace is a monument to Hungarian scholarly life and to the cultural confidence of nineteenth-century Budapest.",
    chapters: [
      ["Science takes a place on the riverfront", "The Academy's monumental headquarters was completed in 1865. The design by Friedrich August Stüler takes inspiration from Renaissance palaces, bringing a distinctive formality to the Danube embankment."],
      ["A cultural landscape beyond research", "The institution has long stood for Hungarian learning and public debate. Its façade is also part of the famous riverside urban landscape, linking scientific heritage with the development of Pest as a capital."]
    ]
  },
  {
    slug: "pal-volgyi-cave",
    introduction: "Pál-völgyi Cave reveals another Budapest beneath the streets: a landscape of limestone passages, unusual shapes and long geological timescales.",
    chapters: [
      ["A natural world under the Buda Hills", "The cave belongs to the limestone and thermal-water landscape of the Buda Hills. Passageways and mineral formations reveal the action of water over very long periods, far removed from the familiar streets and monumental buildings above."],
      ["From discovery to protected visitor route", "Selected parts have become an interpreted natural attraction, with guided access designed to protect the cave environment. The marked visitor route is not the same as unrestricted access to the wider underground system."]
    ]
  },
  {
    slug: "budapest-zoo-botanical-garden",
    introduction: "Budapest Zoo brings together animal care, botanical collections and historic architecture in a City Park institution more than 150 years old.",
    chapters: [
      ["A nineteenth-century public institution", "Established in the nineteenth century, the zoo formed part of Budapest's growing interest in nature, education and leisure. Its location in City Park placed animal collections among the city's other developing public attractions."],
      ["Architecture and changing conservation ideas", "The zoo is known not only for animals but for decorative architecture and planted spaces. Its role has changed with modern approaches to animal welfare, conservation and education; today's exhibits should be judged by current information, not historic conditions."]
    ],
    stories:[{
      title:"From wildlife research to film history",kind:"historical-account",
      description:["Budapest visitor information records visits from internationally known naturalists including Konrad Lorenz and Jane Goodall. It also notes that part of the film Bluebeard, featuring Richard Burton, was shot at the zoo."],
      sourceUrl:"https://www.budapestinfo.hu/en/budapest-zoo",sourceLabel:"Budapest Info — notable visitors"
    }]
  },
  {
    slug: "ludwig-museum",
    introduction: "The Ludwig Museum reflects Budapest's place in modern European art, particularly the exchange between Central European and international ideas.",
    chapters: [
      ["A collection looking beyond national borders", "The museum is named for the Ludwig art-collecting tradition and focuses on modern and contemporary works. Hungarian and international artists are placed in conversation rather than separated into unrelated histories."],
      ["Contemporary culture on the Danube", "Located in the Müpa cultural complex, the museum uses exhibitions and educational programmes to explore art made in changing social and political settings. Its content evolves, which makes the building a different experience across visits."]
    ]
  },
  {
    slug: "kunsthalle",
    introduction: "Kunsthalle, the large exhibition hall on Heroes' Square, represents Budapest's changing art scene rather than a fixed museum collection.",
    chapters: [
      ["An exhibition venue facing Heroes' Square", "The building is part of the monumental cultural setting created around the city's millennium-era development. Its prominent entrance faces the square and complements the Museum of Fine Arts opposite."],
      ["Art that changes with the programme", "Unlike a collection-based museum, Kunsthalle focuses on rotating exhibitions of contemporary Hungarian and international art. The history visitors encounter here is therefore also the history of new artistic ideas as they are presented."]
    ]
  },
  {
    slug: "hungarian-national-gallery",
    introduction: "The Hungarian National Gallery preserves the long story of Hungarian visual art within the imposing buildings of Buda Castle.",
    chapters: [
      ["A national collection in the former palace", "The Gallery took up its present accommodation in Buda Castle in 1975. The palace setting gives medieval religious works, nineteenth-century painting and newer art a striking historical framework."],
      ["Art and institutional change", "The National Gallery and Museum of Fine Arts came under a unified institutional structure in 2012. Their collections tell complementary stories, with the Castle museum retaining its strong emphasis on Hungarian art."]
    ]
  },
  {
    slug: "hungarian-national-museum",
    introduction: "The Hungarian National Museum is closely tied to the story of Hungarian national identity, cultural collecting and the revolutionary year of 1848.",
    chapters: [
      ["A home for the nation's collections", "The museum originated in the nineteenth-century movement to preserve the country's historical and artistic heritage. Its monumental classical-style building and garden became a landmark in the changing urban landscape of Pest."],
      ["A symbolic site in 1848", "The steps outside the museum are strongly associated with the Hungarian Revolution of 1848 and public gatherings linked to its demands. The setting remains a place where museum collections and civic memory overlap."]
    ]
  },
  {
    slug: "city-park-boating-lake",
    introduction: "The City Park lake shows how Budapest has long combined landscaped recreation with architecture and seasonal urban traditions.",
    chapters: [
      ["A lake beside historic park attractions", "The water sits near Vajdahunyad Castle in City Park, surrounded by walking paths and landmark buildings associated with Budapest's late nineteenth-century development."],
      ["One landscape, two seasons", "The lake's leisure uses have shifted with the weather: boating in warmer months and ice skating on its winter surface. The exact opening dates and operating arrangements belong to each season and should be confirmed with the operator."]
    ]
  },
  {
    slug: "city-park-ice-rink",
    introduction: "The open-air rink is one of Budapest's classic winter traditions, turning the lake near Vajdahunyad Castle into a seasonal meeting place.",
    chapters: [
      ["Outdoor skating in the city park", "The site's history is tied to the development of organised recreation in Városliget. The rink grew around the same park landscape whose historic buildings were reshaped by the millennium celebrations."],
      ["A familiar winter scene", "Skaters beneath the park's decorative architecture create one of Budapest's distinctive seasonal views. The rink is not a year-round attraction, and ice conditions, equipment rental and ticketing should always be checked for the actual visit."]
    ]
  }
];
