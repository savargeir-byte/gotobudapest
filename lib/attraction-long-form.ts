/**
 * Long-form visitor writing for the most important attractions: an expanded summary, the main text
 * ("About ..."), practical points and the sources the facts come from.
 *
 * Rules for this file:
 *  - Every number, date and name is stated by the cited sources. Figures that the sources give
 *    inconsistently are left out, and nothing is rounded up to sound better.
 *  - Opening hours, prices and booking conditions change; they are never stated here. The text sends the
 *    reader to the official source instead.
 *  - A story or tradition is never presented as established history; the existing histories in
 *    attraction-editorial.ts carry the documented stories, and this file does not repeat them.
 *
 * It migrates 1:1 into the Sanity attraction fields `description` and `body` (see scripts/sanity-seed.ts).
 */
export type AttractionLongForm = {
  description: string;
  paragraphs: string[];
  tips: string[];
  sources: { label: string; url: string }[];
  checked: string;
};

const WIKI = (title: string, label?: string) => ({
  label: `${label ?? title.replace(/_/g, " ")} (Wikipedia)`,
  url: `https://en.wikipedia.org/wiki/${title}`,
});

export const attractionLongForm: Record<string, AttractionLongForm> = {
  "hungarian-parliament": {
    description:
      "The neo-Gothic seat of Hungary's National Assembly stands on the Pest bank of the Danube. Designed by Imre Steindl and completed in 1904, it is one of Budapest's most recognisable buildings.",
    paragraphs: [
      "Few buildings define the Budapest riverfront as clearly as the Hungarian Parliament. Its long, lace-like facade, steep spires and central dome stand on the Pest bank of the Danube, facing Buda across the water. The building was designed by Imre Steindl, who won an international competition for the commission. Work began in 1885, the building was inaugurated in 1896, the year of Hungary's millennium celebrations, and it was fully completed in 1904.",
      "The style is Gothic Revival, crowned by a dome in the Renaissance Revival manner. The scale is easiest to grasp in the commonly cited figures: about 268 metres long, 123 metres wide and 96 metres high, with 691 rooms, ten courtyards, 29 staircases and some 242 sculptures inside and out. Construction is said to have used around 40 million bricks and 40 kilograms of gold, and the stained glass and glass mosaics are the work of Miksa Róth.",
      "At the heart of the plan is a sixteen-sided domed hall. On one side lies the chamber of the lower house, where the National Assembly meets; on the other, the former upper house chamber, now used for conferences and ceremonies. Since 2000 the Holy Crown of Hungary has been displayed in the central hall, and it is the main reason many visitors join a guided tour.",
      "Inside, a visit takes you up the ornamental main staircase beneath painted ceilings, past a bust of the architect, and into the ceremonial hall. Visits are arranged through the official visitor centre, which sets the languages, times and prices, so check its website before you plan the day.",
    ],
    tips: [
      "For the best photographs, stand on the Buda embankment or look from the river; from Kossuth Lajos tér you see only the entrance side.",
      "Guided visits are arranged through the official visitor centre (latogatokozpont.parlament.hu): check languages, dates and ticket conditions there.",
      "Kossuth Lajos tér station (Metro line 2) and tram line 2 stop beside the building.",
      "Nearby: the Shoes on the Danube Bank memorial and St. Stephen's Basilica are both a short walk away.",
    ],
    sources: [
      WIKI("Hungarian_Parliament_Building", "Hungarian Parliament Building"),
      { label: "Parliament visitor centre (official)", url: "https://latogatokozpont.parlament.hu" },
      { label: "Budapest Info — Parliament", url: "https://www.budapestinfo.hu/en/parliament" },
    ],
    checked: "2026-10-29",
  },

  "buda-castle-district": {
    description:
      "Castle Hill is the historic heart of Buda: a UNESCO-listed ridge of palace, churches and museums above the Danube, rebuilt after sieges and war, with views across the river to Pest.",
    paragraphs: [
      "The first royal residence on Castle Hill was built between 1247 and 1265 under King Béla IV. Over the following centuries the palace was extended again and again: under Sigismund in the 1410s and 1420s, and, after his marriage to Beatrice of Naples in 1476, by Matthias Corvinus, who rebuilt it in an early Renaissance style.",
      "Buda fell to the Ottomans in 1541, and the siege that ended Ottoman rule in 1686 destroyed the medieval palace. A small Baroque palace followed in the 18th century and was enlarged under Maria Theresa, finished in 1769. After fires in the 1849 siege the palace was rebuilt and expanded in the late 19th century to designs associated with Miklós Ybl and Alajos Hauszmann, and the Royal Palace was officially inaugurated in 1912.",
      "The siege of Budapest in 1944–45 left the palace in ruins. Its post-war reconstruction, carried out from 1952 to 1966 in a simplified Baroque style, gave the building the outline and the dome you see today, and the medieval fortifications were rebuilt as well.",
      "Today the palace houses the Hungarian National Gallery, the Budapest History Museum and the National Széchényi Library. The streets around it, with Matthias Church, Fisherman's Bastion, Trinity Square and the Hospital in the Rock, form the Buda Castle Quarter, which is part of the UNESCO World Heritage listing 'Budapest, including the Banks of the Danube, the Buda Castle Quarter and Andrássy Avenue', inscribed in 1987.",
      "The district is compact and best explored on foot. Many visitors spend a half-day on the terraces, Matthias Church and Fisherman's Bastion, and add a museum or the Hospital in the Rock to make a full day.",
    ],
    tips: [
      "The Castle Hill Funicular climbs from Clark Ádám tér beside the Chain Bridge; walking up from the river is the alternative.",
      "The museums in the palace have their own tickets and opening days: check each one before you go.",
      "Matthias Church, Fisherman's Bastion and the Hospital in the Rock are all within a few minutes' walk of the palace.",
    ],
    sources: [
      WIKI("Buda_Castle", "Buda Castle"),
      { label: "Budapest Info — Buda Castle District", url: "https://www.budapestinfo.hu/en/the-buda-castle-district-and-its-surroundings" },
    ],
    checked: "2026-10-29",
  },

  "fishermans-bastion": {
    description:
      "Fisherman's Bastion is a fairy-tale neo-Romanesque terrace of towers and arcades on Castle Hill, built between 1895 and 1902, with some of the best panoramic views over the Danube and Pest.",
    paragraphs: [
      "Fisherman's Bastion looks like a medieval fortress but is a product of the 19th century. It was designed by Frigyes Schulek, the architect who also led the restoration of the neighbouring Matthias Church, and built between 1895 and 1902 in the neo-Romanesque style. Its white towers, stairways and arcades were conceived as a decorative lookout terrace rather than as a working defensive wall.",
      "Its seven towers are traditionally said to represent the seven Magyar tribes that settled in the Carpathian Basin in 895. The name is most likely linked to the fishermen's quarter (Halászváros, 'Fishtown') below the hill; the popular explanation that a fishermen's guild defended this stretch of the city walls is also often repeated, but the quarter is the likelier source, so treat the name as an association rather than a precise historical record.",
      "In front of the church stands the bronze equestrian statue of Saint Stephen, the first king of Hungary, by the sculptor Alajos Stróbl. Stróbl began it in 1896 and finished it in 1906, and it was unveiled on 21 May 1906 on a neo-Romanesque pedestal designed by Schulek.",
      "The views are the reason most people come: from the terraces you look over the Danube to Margaret Island, Gellért Hill and the whole of Pest, with the Parliament building prominent on the far bank. Fisherman's Bastion is part of the Buda Castle Quarter in Budapest's UNESCO World Heritage listing, inscribed in 1987.",
    ],
    tips: [
      "Early morning and late evening are the quietest times; the terraces face east across the river.",
      "Check the visitor source for which terraces are open and whether a ticket is needed at the time of your visit: access arrangements have changed over the years.",
      "Matthias Church is next door, so the two fit naturally into one visit.",
    ],
    sources: [
      WIKI("Fisherman%27s_Bastion", "Fisherman's Bastion"),
      { label: "Budapest Info — Fisherman's Bastion", url: "https://www.budapestinfo.hu/en/fishermans-bastion" },
    ],
    checked: "2026-10-29",
  },

  "matthias-church": {
    description:
      "Matthias Church is Buda's coronation church: a Gothic building of the 13th century, a mosque under Ottoman rule, and a showpiece of 19th-century restoration with a richly painted interior.",
    paragraphs: [
      "The church that crowns Castle Hill has served more than one faith and several rulers. Béla IV, between 1255 and 1269, replaced an older, smaller church with a three-nave basilica. Tradition credits an earlier foundation by Saint Stephen in 1015, but the sources note there is no clear evidence for it. The church takes its popular name from Matthias Corvinus, who built the south-west bell tower, one of the finest pieces of Gothic architecture in Hungary, and who married here in 1463 and 1476.",
      "It was also the coronation church of Hungary's later monarchs. Franz Joseph I and Elisabeth were crowned here in 1867, when Franz Liszt's Coronation Mass was first performed, and Charles IV and Queen Zita followed on 30 December 1916.",
      "After the Ottomans took Buda the church was converted into a mosque, which it remained from 1541 to 1686. After the siege of 1686 the Jesuits restored it in Baroque style. The building you see today is largely the result of the restoration led by the architect Frigyes Schulek between 1874 and 1896, which gave it its steep Gothic spire and gargoyles.",
      "Inside, the walls and vaults are covered with painted decoration, including murals by Bertalan Székely and Károly Lotz, with stained glass designed by them. The medieval crypt houses the Ecclesiastical Art Museum, and the church is also a concert venue, so a visit can combine sightseeing with music.",
    ],
    tips: [
      "Check opening arrangements before you go: the church is a place of worship and can close for services and events.",
      "Fisherman's Bastion and the equestrian statue of Saint Stephen are directly beside the church.",
      "Look up: the painted vaults and the pulpit reward a slow visit.",
    ],
    sources: [
      WIKI("Matthias_Church", "Matthias Church"),
      { label: "Budapest Info — Matthias Church", url: "https://www.budapestinfo.hu/en/matthias-church-1" },
    ],
    checked: "2026-10-29",
  },

  "st-stephens-basilica": {
    description:
      "Budapest's largest church, named for Hungary's first king, took more than fifty years to build. Its 96-metre dome has a panoramic viewing platform, and the building is also a venue for organ concerts.",
    paragraphs: [
      "St. Stephen's Basilica is dedicated to Stephen I, the first king of Hungary, whose mummified right hand is kept in a reliquary inside. Construction began in 1851 and continued for fifty-four years. The first architect, József Hild, designed it in the neoclassical style; after his death in 1867 Miklós Ybl altered the plan toward the neo-Renaissance, and the work was completed by József Kauser. A dome collapse during construction forced much of the work to be rebuilt from the ground up, which is part of why it took so long.",
      "At 96 metres the basilica is as tall as the Hungarian Parliament Building, and the two are often described as the city's equally high landmarks. The ground plan is a Greek cross. Pope Pius XI gave the church the title of basilica minor in 1931, and it is a co-cathedral of the Roman Catholic Archdiocese of Esztergom–Budapest.",
      "Visitors can also go up to the dome: it can be reached by lift or by 364 steps, and from the top there are panoramic views over the city.",
      "The basilica is also one of the city's regular concert venues, with organ concerts and other music programmes. Ticket options for the dome and the concerts differ, so check the official source for the current programme.",
    ],
    tips: [
      "The dome is reached by lift or 364 steps; the view is wide in clear weather.",
      "Concert and dome tickets are separate from entering the church: check the current options before you go.",
      "The Danube and the Hungarian Parliament are a short walk away.",
    ],
    sources: [
      WIKI("St._Stephen's_Basilica", "St. Stephen's Basilica"),
      { label: "Budapest Info — St. Stephen's Basilica", url: "https://www.budapestinfo.hu/en/st-stephens-basilica-en" },
    ],
    checked: "2026-10-29",
  },

  "heroes-square": {
    description:
      "Heroes' Square is Budapest's great ceremonial space: the Millennium Monument with the seven chieftains and kings of Hungary, flanked by the Museum of Fine Arts and the Műcsarnok at the head of Andrássy Avenue.",
    paragraphs: [
      "At the end of Andrássy Avenue, Heroes' Square marks the thousandth anniversary of the Magyar settlement of the Carpathian Basin in 896. Construction of the Millennium Monument began in 1896 and was mostly completed by 1900, though the monument was inaugurated in 1905. The square has been officially called Heroes' Square since 1932.",
      "At the centre rises a 36-metre column topped by a bronze statue of the Archangel Gabriel holding the Holy Crown of Hungary and the apostolic double cross, by the sculptor György Zala. It won the Grand Prix at the 1900 Paris Exposition. At the base of the column ride seven mounted figures of the Magyar chieftains, led by Árpád.",
      "Behind the column, a curving two-part colonnade carries statues of Hungarian rulers and leading figures. The line-up has been changed by history: the Habsburg statues were removed during the Hungarian Soviet Republic of 1919, rulers' statues were restored in the Horthy era, some were destroyed during the siege of Budapest in World War II, and after the war the Habsburg places were given to leaders of Hungary's struggles for independence, including Imre Thököly, Francis II Rákóczi and Lajos Kossuth in 1954–55.",
      "In front of the column is the Memorial Stone of Heroes, a cenotaph first erected in 1929, removed in 1951 and rebuilt on the same spot in 1956. It is often called the Tomb of the Unknown Soldier, but no remains are buried there. The square has also been the stage for national moments: Imre Nagy was reburied here on 16 June 1989.",
      "The square is framed by the Museum of Fine Arts on one side and the Műcsarnok (Hall of Art) on the other, and the municipal park, with its Vajdahunyad Castle copy, begins right behind the monument. Heroes' Square is part of the UNESCO World Heritage listing 'Andrássy Avenue and the Underground' within the wider Budapest site, inscribed in 1987 and extended in 2002.",
    ],
    tips: [
      "Metro line 1, the Millennium Underground, stops at Hősök tere: it is the quickest way here from the city centre.",
      "Combine it with the Museum of Fine Arts, the Műcsarnok, City Park, Vajdahunyad Castle and the Széchenyi Thermal Bath, which are all within walking distance.",
      "Statues and restoration works change over time: check recent news if a particular monument matters to your visit.",
    ],
    sources: [
      WIKI("Heroes%27_Square_(Budapest)", "Heroes' Square (Budapest)"),
      { label: "Budapest Info — Heroes' Square", url: "https://www.budapestinfo.hu/en/heroes-square" },
    ],
    checked: "2026-10-29",
  },

  "szechenyi-thermal-bath": {
    description:
      "The Széchenyi Thermal Bath in City Park is a vast neo-Baroque bathing palace of indoor and outdoor pools fed by two thermal springs, open since 1913.",
    paragraphs: [
      "The Széchenyi Thermal Bath opened in June 1913 and covers a total area of 6,220 square metres. It was designed by Győző Czigler, who died in 1905; construction began in 1909 under Ede Dvorák and Kálmán Gerster. The yellow neo-Baroque building, with its domes and courtyards, stands in City Park, close to Heroes' Square.",
      "The baths are fed by two thermal springs. The first was reached by Vilmos Zsigmondy's artesian well, drilled between 1868 and 1878 in City Park, which found water at 74.5 °C at a depth of about 970 metres. A second spring, discovered in 1938 at 1,256 metres, supplies water at 77 °C. The bath was planned as the 'Artesian spa' and was named after István Széchenyi when it opened.",
      "Today the complex has three outdoor and fifteen indoor pools, along with saunas and steam rooms. Outdoor pool temperatures range from 27 to 38 °C, and the indoor pools from 18 to 38 °C. The main swimming and thermal sections are open to men and women together.",
      "The bath has been expanded over time: an extension designed by Imre Francsek Jr. was completed in 1927, a thermal section and a day hospital were added in the 1960s, and a full renovation ran from 1999 to 2009.",
    ],
    tips: [
      "Metro line 1 (the yellow Millennium Underground) stops at Széchenyi fürdő, right beside the entrance.",
      "Ticket types, cabins and lockers, and opening hours vary: check the operator's website and book ahead in busy seasons.",
      "Bring or hire a swimsuit, towel and flip-flops according to the ticket you choose.",
    ],
    sources: [
      WIKI("Sz%C3%A9chenyi_thermal_bath", "Széchenyi thermal bath"),
      { label: "Budapest Info — Széchenyi Thermal Bath", url: "https://www.budapestinfo.hu/en/szechenyi-medicinal-bath-and-swimming-pool-en" },
    ],
    checked: "2026-10-29",
  },

  "gellert-thermal-bath": {
    description:
      "The Gellért Thermal Bath is Budapest's Art Nouveau bath beside the Danube at the foot of Gellért Hill. Built in 1912–1918 with the Hotel Gellért, it is currently reported closed for refurbishment.",
    paragraphs: [
      "The Gellért Thermal Bath belongs to the Hotel Gellért, on the Buda bank next to the Liberty Bridge. It was built between 1912 and 1918 in the Secession (Art Nouveau) style, and both the bath and the hotel opened in 1918. The main hall, with its gallery and glass roof, and the mosaic-tiled thermal pools are among the city's best-known interiors.",
      "The site has a long bathing history. References to healing waters here go back to the 13th century, a hospital stood on the site in the Middle Ages, and baths were built under Ottoman rule. The old name, Sárosfürdő, 'muddy bath', recalls the mineral mud that settled at the bottom of the pools. The water, at about 35–40 °C, contains calcium, magnesium, hydrocarbonate and other minerals.",
      "The complex was extended in 1927 with an outdoor artificial wave pool, and in 1934 a thermal bath under a glass dome was installed in the hotel's former winter garden. Near the end of World War II the bath's Art Nouveau women's section was bombed, destroying its pyrogranite facade and wooden dressing rooms, and the post-war repairs were plainer. All pools became mixed-gender in 2013.",
      "Important for planning: the bath is reported to have closed in October 2025 for a long refurbishment, with reopening planned for 2028. Because dates like these can change, check the operator's official website for the current status before you build a visit around it. Budapest has other thermal baths in the meantime, including the Széchenyi, Rudas and Lukács baths.",
    ],
    tips: [
      "Check the current opening status first: the bath is reported closed for refurbishment until 2028.",
      "The Liberty Bridge and Gellért Hill (with the Citadella) are directly beside the building.",
      "Széchenyi, Rudas and Lukács are the nearest alternatives if you want a thermal bath meanwhile.",
    ],
    sources: [
      WIKI("Gell%C3%A9rt_Baths", "Gellért Baths"),
      { label: "Budapest Info — Gellért Thermal Bath", url: "https://www.budapestinfo.hu/en/saint-gellert-medicinal-bath-and-swimming-pool" },
    ],
    checked: "2026-10-29",
  },

  "dohany-street-synagogue": {
    description:
      "The Dohány Street Synagogue, built in 1854–1859 in Moorish Revival style, is the largest synagogue in Europe. It is the centre of Budapest's Jewish quarter, with a museum, memorial park and Heroes' Temple.",
    paragraphs: [
      "The Dohány Street Synagogue was built between 1854 and 1859 and consecrated on 6 September 1859. Ludwig Förster designed the exterior in the Moorish Revival and Romantic Historicist style, and Frigyes Feszl designed the interior. The twin towers, striped brickwork and rose window make it one of the most distinctive buildings in the city centre.",
      "It is described as the largest synagogue in Europe, seating about 3,000 people, with separate seating for men and in the women's galleries. The original organ, built in 1859, was played by Franz Liszt and Camille Saint-Saëns; the current mechanical organ was built in 1996.",
      "The synagogue stands at the edge of the area that became the Budapest Ghetto in 1944, and it sheltered many people during that winter. More than two thousand people who died in the winter of 1944–45 are buried in its courtyard. The Raoul Wallenberg Holocaust Memorial Park at the rear holds the Holocaust Tree of Life memorial (the Memorial of the Hungarian Jewish Martyrs) by the sculptor Imre Varga.",
      "The complex also includes the Heroes' Temple, added in 1931 and designed by László Vágó and Ferenc Faragó to commemorate Hungarian Jews who died in World War I, and the Jewish Museum, attached in 1931 and standing on the plot where Theodor Herzl's house once stood.",
      "A visit combines a place of worship with a memorial. Check the current visiting rules before you go, since the synagogue can close for services and Jewish holidays and may ask visitors to follow dress and security instructions.",
    ],
    tips: [
      "Check the current opening times, ticket options and visiting rules on the official source before you go.",
      "The streets around the synagogue formed the edge of the Budapest Ghetto in 1944; the Jewish Museum and the memorial park are part of the same complex.",
      "Heroes' Temple, the Jewish Museum and the Wallenberg Memorial Park can be visited as part of the same site: ask what your ticket includes.",
    ],
    sources: [
      WIKI("Dohány_Street_Synagogue", "Dohány Street Synagogue"),
      { label: "Budapest Info — Dohány Street Synagogue", url: "https://www.budapestinfo.hu/en/dohany-street-synagogue-5" },
    ],
    checked: "2026-10-29",
  },

  "house-of-terror-museum": {
    description:
      "The House of Terror at Andrássy út 60 is a museum and memorial to the victims of the fascist and communist regimes in 20th-century Hungary, in the building used by both the Arrow Cross and the ÁVH.",
    paragraphs: [
      "The House of Terror stands at Andrássy Avenue 60. In the 20th century the building was used by two oppressive regimes: the Arrow Cross Party, the Hungarian fascists, and the ÁVH, the communist state security police. It opened as a museum on 24 February 2002, after a foundation bought the building in December 2000 and carried out a year-long renovation.",
      "The interior, the exhibition halls and the facade were designed by Attila Ferenczfy-Kovács. The black structure framing the building, with its blade-like walls, is intentionally stark among the pale facades of Andrássy Avenue, and photographs of victims are displayed on the outside.",
      "The permanent exhibition covers Hungary's relations with Nazi Germany and the Soviet Union and the Arrow Cross and ÁVH years, and it serves as a memorial to the people who were detained, interrogated, tortured or killed in the building. In the basement you can see reconstructed cells like those the ÁVH used for prisoners. A T-55 tank is also displayed, carrying photographs of victims of Hungarian communism.",
      "The museum's presentation has been discussed by historians; some critics argue that it presents Hungary mainly as a victim of foreign occupiers and gives too little attention to Hungarians' own roles in those regimes. It is a good idea to read other sources on the period and treat the museum as one perspective on a contested history.",
      "The subject matter is serious and some displays are disturbing, so allow time and consider whether the visit is suitable for young children.",
    ],
    tips: [
      "Check the current opening days, ticket types and exhibition status on the museum's official website before your visit.",
      "Some displays are disturbing: consider whether the visit suits younger children.",
      "Andrássy Avenue is a UNESCO-listed boulevard; Oktogon and the Opera House are within walking distance.",
    ],
    sources: [
      WIKI("House_of_Terror", "House of Terror"),
      { label: "Budapest Info — House of Terror Museum", url: "https://www.budapestinfo.hu/en/house-of-terror-museum" },
    ],
    checked: "2026-10-29",
  },

  "great-market-hall": {
    description:
      "The Great Market Hall at Fővám tér is Budapest's largest indoor market: a steel-and-brick hall opened in 1897 with a colourful tiled roof, selling produce, paprika and local food across three floors.",
    paragraphs: [
      "The Great Market Hall (Nagyvásárcsarnok) was designed and built by Samu Pecz and opened with a ceremony on 15 February 1897. It stands at Fővám tér, at the end of Váci utca on the Pest side of the Liberty Bridge. The steel structure covers around 10,000 square metres, behind a brick facade with a neo-Gothic entrance gate, and the roof is covered in colourful Zsolnay tiles from Pécs.",
      "Inside, the stalls are spread over three floors. On the ground floor you find fresh produce, meat, pastries, sweets, spices and spirits, together with the food souvenirs visitors take home: paprika, Tokaji wine, Túró Rudi, kolbász sausage and salami. The upper level has eateries and souvenir stalls, and the basement holds fishmongers, pickled-vegetable stalls and some specialist butchers.",
      "The hall was heavily damaged in World War II and then deteriorated. A thorough renovation began in 1991 and the market reopened in 1997. In 1999 it received the FIABCI Prix d'Excellence.",
      "It works both as a place for local shoppers and as a sightseeing stop. Go earlier in the day for the fresh produce and a calmer atmosphere; the upper-floor food stalls are popular at lunchtime.",
    ],
    tips: [
      "Opening days and hours vary: check the current times before you go.",
      "Prices differ from stall to stall, especially for food souvenirs: compare before you buy.",
      "The Liberty Bridge, Váci utca and the Gellért Thermal Bath are close by.",
    ],
    sources: [
      WIKI("Great_Market_Hall", "Great Market Hall"),
      { label: "Budapest Info — Great Market Hall", url: "https://www.budapestinfo.hu/en/great-market-hall" },
    ],
    checked: "2026-10-29",
  },

  "margaret-island": {
    description:
      "Margaret Island is a 2.5-kilometre park in the middle of the Danube, largely closed to cars, with gardens, a music fountain, a Japanese garden, a water tower, pools and a running track.",
    paragraphs: [
      "Margaret Island lies in the Danube in central Budapest, between Margaret Bridge to the south and Árpád Bridge to the north. It is about 2.5 kilometres long and 500 metres wide, with an area of around 0.965 square kilometres. In its present form it was created at the end of the 19th century by joining three smaller islands, the Festő, Fürdő and Nyulak islands, to control the river's flow.",
      "Before the 14th century it was known as the Island of Rabbits. Its modern name comes from Saint Margaret (1242–1270), the daughter of King Béla IV, who lived in the Dominican convent on the island. Religious houses dominated the island until the 16th century; during the Ottoman wars the monks and nuns fled and the buildings were destroyed. It became a resort of the palatines in the 18th century and was declared a public garden in 1908.",
      "Today it is a public park in the middle of the city. Since the 1980s, cars have been banned except for one bus line, taxis and service traffic, so you can walk, run or cycle in peace. A rubber-coated running track is about 5.35 kilometres long. You can rent four-person pedal carts and small electric cars.",
      "Among the sights are the Music Fountain and the Music Well, the Japanese Garden, a small zoo, the Centennial Memorial of 1973 by István Kiss, and the octagonal Art Nouveau water tower of 1911. The island also has large sports and bathing facilities, including the Palatinus open-air swimming complex and the Alfréd Hajós sports pool, and an open-air theatre.",
    ],
    tips: [
      "The island lies between Margaret Bridge and Árpád Bridge; private cars are not allowed, so arrive on foot or by public transport.",
      "Pedal carts and small electric cars can be rented on the island if you do not want to walk its whole length.",
      "Bring a swimsuit if you plan to use the Palatinus open-air complex: check the current opening dates.",
    ],
    sources: [
      WIKI("Margaret_Island", "Margaret Island"),
      { label: "Budapest Info — Margaret Island", url: "https://www.budapestinfo.hu/en/margaret-island-1" },
    ],
    checked: "2026-10-29",
  },
};

// ---------------------------------------------------------------------------------------------
// Portable Text for the page and for the Sanity seed (same shape, deterministic keys: idempotent).
// ---------------------------------------------------------------------------------------------
import type { PtBlock } from "./types";

const block = (key: string, text: string, extra: Partial<PtBlock> = {}): PtBlock => ({
  _type: "block",
  _key: key,
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: `${key}-s`, text, marks: [] }],
  ...extra,
});

export function longFormBody(slug: string): PtBlock[] | undefined {
  const lf = attractionLongForm[slug];
  if (!lf) return undefined;
  const key = (suffix: string) => `${slug}-lf-${suffix}`;
  const out: PtBlock[] = lf.paragraphs.map((p, i) => block(key(`p${i}`), p));
  if (lf.tips.length) {
    out.push(block(key("tips-h"), "Good to know", { style: "h3" }));
    lf.tips.forEach((t, i) => out.push(block(key(`t${i}`), t, { listItem: "bullet", level: 1 })));
  }
  out.push(block(key("src-h"), "Sources", { style: "h3" }));
  lf.sources.forEach((s, i) => {
    const mark = key(`l${i}`);
    out.push({
      _type: "block",
      _key: key(`s${i}`),
      style: "normal",
      listItem: "bullet",
      level: 1,
      markDefs: [{ _key: mark, _type: "link", href: s.url }],
      children: [{ _type: "span", _key: `${mark}-s`, text: s.label, marks: [mark] }],
    });
  });
  out.push(block(key("checked"), `Facts checked against these sources on ${lf.checked}. Opening hours, prices and booking conditions change: confirm them with the official source before you travel.`));
  return out;
}
