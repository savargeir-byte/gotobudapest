import type { HistorySeed } from "./attraction-history-batch-a";

/**
 * Editorial seeds, batch C (7 attractions that had no history). Facts come from the cited encyclopaedia
 * articles; dates the sources give inconsistently are stated as such or left out, and no story or legend is
 * added without a source. Opening hours, prices and booking conditions are never stated here.
 */
const WIKI = (title: string, label: string) => ({ label: `${label} (Wikipedia)`, url: `https://en.wikipedia.org/wiki/${title}` });

export const historySeedsC: HistorySeed[] = [
  {
    slug: "heroes-square",
    introduction:
      "Heroes' Square is a monument built for a national anniversary and then rearranged by every political era that followed, which is why its statues tell as much about the twentieth century as about the Middle Ages.",
    chapters: [
      [
        "A monument for the millennium",
        "The Millennium Monument commemorates the thousandth anniversary of the Hungarian conquest of the Carpathian Basin, dated to 896. Construction began in 1896 and was mostly completed by 1900, and the monument was inaugurated in 1905. The monument was designed by the architect Albert Schickedanz, and the original sculptural commission went to György Zala, who made the statues of the rulers with several assistants. His bronze Archangel Gabriel, holding the Holy Crown and the apostolic double cross, was installed in 1901 on a 36-metre column, after the work had won the Grand Prix at the 1900 Paris Exposition. The square has officially been called Heroes' Square since 1932.",
      ],
      [
        "Statues that followed the politics of the day",
        "The colonnade was planned with Habsburg rulers among its figures. During the Hungarian Soviet Republic of 1919 the Habsburg statues were removed, the monument was draped in red on 1 May 1919 and a red obelisk replaced the Gabriel statue. The rulers' statues were restored in the Horthy era, and the statues of Maria Theresa and Leopold II were destroyed during the siege of Budapest. After the Second World War the Habsburg places were given to figures from Hungary's struggles for independence, including Imre Thököly, Francis II Rákóczi and Lajos Kossuth, added in 1954–55.",
      ],
      [
        "The Memorial Stone and a national funeral",
        "In front of the column stands the Memorial Stone of Heroes, a cenotaph first erected in 1929, removed in 1951 and rebuilt on the same spot in 1956. It is often called the Tomb of the Unknown Soldier, but no remains are interred there. The square has also been a stage for national moments: on 16 June 1989 Imre Nagy, the prime minister of the 1956 revolution, was reburied here.",
      ],
    ],
    // The tradition below was first written up in PR #6 (sources checked to exist and to discuss the monument).
    stories: [
      {
        title: "The archangel, the crown and a royal dream",
        kind: "religious-tradition",
        description: [
          "A tradition about the first Hungarian king tells of the Archangel Gabriel appearing in a dream and encouraging the creation of a Christian kingdom. The figure atop the Millennium Monument holds the Holy Crown and a double cross in reference to that national and religious story.",
          "The dream belongs to a historical religious tradition, not to a documented eyewitness account. The monument illustrates the story through symbolism.",
        ],
        sourceUrl: "https://visithungary.com/articles/the-heroes-square",
        sourceLabel: "Visit Hungary — the monuments and their stories",
      },
    ],
    additionalSources: [
      WIKI("Heroes%27_Square_(Budapest)", "Heroes' Square (Budapest)"),
      { label: "Visit Hungary — Heroes' Square", url: "https://visithungary.com/articles/the-heroes-square" },
      { label: "Liget Budapest — Heroes' Square", url: "https://ligetbudapest.hu/en/heroes-square" },
    ],
  },
  {
    slug: "rudas-thermal-bath",
    introduction:
      "The Rudas Baths are one of the few places in Budapest where you can still bathe in an Ottoman hammam: an octagonal pool under a dome, beside the Danube, that is more than four hundred years old.",
    chapters: [
      [
        "An Ottoman bath on the Danube",
        "The baths were founded in 1571 or 1572 during Ottoman rule, commissioned by Sokollu Mustafa Pasha, who was governor (beylerbey) of Buda from 1566 to 1578. They keep many elements of a hammam, including an Ottoman dome and an octagonal pool, and are described as echoing the monumental Ottoman bath buildings of Istanbul. They stand at Döbrentei tér, on the Buda side of Erzsébet Bridge, at the foot of Gellért Hill.",
      ],
      [
        "Thermal water and a new opening",
        "The thermal water is slightly radioactive and contains sulphate, calcium, magnesium, bicarbonate and a significant amount of fluoride. The complex has six therapy pools and one swimming pool, with temperatures between 10 and 42 degrees Celsius. After a comprehensive interior renovation the baths reopened at the beginning of 2006.",
      ],
    ],
    additionalSources: [WIKI("Rudas_Baths", "Rudas Baths")],
  },
  {
    slug: "lukacs-thermal-bath",
    introduction:
      "The Lukács Baths sit on springs that have been used for bathing for centuries, and the complex still carries traces of its Ottoman past inside its walls.",
    chapters: [
      [
        "Springs used for centuries",
        "According to the bath's own history, thermal baths have been used on this site since at least the twelfth century, reportedly by the Knights Hospitallers. A wall inside the complex is a remnant of a former Ottoman powder mill, the Császár mill, which used the hot spring water as a source of power. The neighbouring Császár Thermal Bath is described as the oldest continuously operating thermal bath in Budapest: it was originally built by Szokoli Mustafa and redesigned in 1844 by József Hild.",
      ],
      [
        "From spa hotel to clinic",
        "The first spa hotel on the site was completed in the 1880s and named after Saint Luke. A drinking-water hall followed in 1937 and a health clinic in 1979. The water is rich in calcium and magnesium hydrogencarbonates and contains a substantial amount of fluoride. Part of the complex belongs to the National Institute of Rheumatology and Physiotherapy. Much of this history rests on the bath's own account, so treat individual dates as the operator's, not as independently verified.",
      ],
    ],
    additionalSources: [WIKI("Luk%C3%A1cs_Baths", "Lukács Baths")],
  },
  {
    slug: "childrens-railway",
    introduction:
      "The Children's Railway in the Buda Hills is a real narrow-gauge railway in which almost every job except driving the train is done by children.",
    chapters: [
      [
        "Built as a Pioneer Railway",
        "Construction began on 11 April 1948. The first section opened on 31 July 1948 and the last on 20 August 1950, so the line is dated 1948–1950. It was originally called the Úttörővasút, the Pioneer Railway, a name tied to the communist-era youth organisation. Today its official designation is MÁV Zrt. Széchenyi-hegy Gyermekvasút, the Children's Railway.",
      ],
      [
        "A working line staffed by children",
        "The 760-millimetre narrow-gauge line runs through the Buda Hills between Széchenyihegy and Hűvösvölgy, a distance of roughly eleven kilometres (the sources give 11.2 and 11.7). Apart from the train driver, the posts are run by children aged 10 to 14 under adult supervision.",
      ],
    ],
    additionalSources: [WIKI("Children%27s_Railway_(Budapest)", "Children's Railway (Budapest)")],
  },
  {
    slug: "vienna-gate",
    introduction:
      "The Vienna Gate looks medieval but is a twentieth-century reconstruction, built to mark an anniversary of the recapture of Buda.",
    chapters: [
      [
        "The Saturday Gate",
        "A gate stood here in the Middle Ages, connecting the Castle with the road to Vienna. It was called the Szombat-kapu, the Saturday Gate, because markets were held in front of it every Saturday. The Ottomans called it Beç kapusu, and it later became known as the Zsidó-kapu, the Jewish Gate.",
      ],
      [
        "Demolished in 1896, rebuilt in 1936",
        "One of its two side gates was removed in the early nineteenth century and the whole gate was demolished in 1896. The present gate was rebuilt in 1936, commemorating the 250th anniversary of the recapture of Buda, and was designed by Jenő Kismarty-Lechner, with inscriptions, ornaments and reliefs, including a running angel, by the sculptor Béla Ohmann. Its value is symbolic rather than defensive, although automatic barriers at the gate now help to limit traffic in the Castle, and two parts of the Bastion Promenade are connected across its top.",
      ],
    ],
    additionalSources: [WIKI("Vienna_Gate", "Vienna Gate")],
  },
  {
    slug: "the-tomb-of-gul-baba",
    introduction:
      "The tomb of Gül Baba is a small domed Ottoman shrine on Rózsadomb, described as the northernmost Islamic pilgrimage site in the world.",
    chapters: [
      [
        "A dervish in Ottoman Buda",
        "Gül Baba was a member of the Bektashi dervish order who died in Ottoman Buda in 1541. His tomb (türbe) was built between 1543 and 1548 by Mehmed Paşa, the beylerbeyi of Buda; it is octagonal with a shallow dome. The tomb became an important pilgrimage site, and the Ottoman traveller Evliya Çelebi reported that more than 200,000 Muslims attended his funeral prayer.",
      ],
      [
        "A chapel, then a national monument",
        "The tomb was not damaged when Habsburg armies took Buda in 1686, and the Jesuits later converted it into a Roman Catholic chapel dedicated to St Joseph. In 1885 the Ottoman government commissioned a Hungarian engineer to restore it; the work was completed in 1914 and the site was declared a national monument. It was restored again in the 1960s and, according to the cited article, in 2018. The tomb stands on Mecset (Mosque) Street in the Rózsadomb district, a short but steep walk from Margaret Bridge.",
      ],
    ],
    stories: [
      {
        title: "The Father of Roses and the name Rose Hill",
        kind: "local-tradition",
        description: [
          "Gül Baba's name is often rendered as 'Father of Roses'. A local tradition connects him with extensive rose gardens on the hillside and says that Rózsadomb, or Rose Hill, received its name from him.",
          "The picturesque story is part of the site's traditional identity; the direct origin of the district name should not be treated as an independently proven fact.",
        ],
        sourceUrl: "https://visithungary.com/articles/tomb-of-gul-baba",
        sourceLabel: "Visit Hungary — Gül Baba and Rose Hill tradition",
      },
      {
        title: "A funeral attended by a sultan?",
        kind: "local-tradition",
        description: [
          "A story associated with Gül Baba says that Sultan Suleiman I personally attended a magnificent funeral following the taking of Buda in 1541.",
          "The account is presented as a legend in descriptions of the monument, not as a confirmed historical detail.",
        ],
        sourceUrl: "https://www.duna-drava.hu/en/tomb-of-gul-baba",
        sourceLabel: "Tomb restoration history — traditional funeral account",
      },
    ],
    additionalSources: [
      WIKI("Tomb_of_G%C3%BCl_Baba", "Tomb of Gül Baba"),
      { label: "Visit Hungary — the Tomb of Gül Baba", url: "https://visithungary.com/articles/tomb-of-gul-baba" },
      { label: "Tomb of Gül Baba restoration background", url: "https://www.duna-drava.hu/en/tomb-of-gul-baba" },
    ],
  },
  {
    slug: "clark-adam-square-and-the-0-km-stone",
    introduction:
      "The Zero Kilometre Stone at Clark Ádám Square is the point from which distances in Hungary are measured, and the spot has held several monuments in its time.",
    chapters: [
      [
        "Kilometre zero",
        "The present sculpture was erected in 1975 and is the work of Miklós Borsos. It is a three-metre limestone monument that represents Kilometre Zero in Hungary, and its pedestal carries the inscription 'KM' for kilometres. It stands in a small park at Clark Ádám Square, at the Buda end of the Chain Bridge, below Buda Castle.",
      ],
      [
        "A spot with a changing monument",
        "The stone was first set at the threshold of the Buda Royal Palace and was moved near the Chain Bridge when the crossing was completed in 1849. A Madonna statue by Eugene Kormendi was set up on the spot in 1932 and destroyed in the Second World War, and a sculpture of a worker stood there from 1953 until the present monument replaced it.",
      ],
    ],
    additionalSources: [WIKI("Zero_Kilometre_Stone_(Budapest)", "Zero Kilometre Stone (Budapest)")],
  },
];
