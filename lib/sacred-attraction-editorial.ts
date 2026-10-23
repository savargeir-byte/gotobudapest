import type { AttractionEditorial } from "./attraction-editorial";

/**
 * Historically cautious entries for photographed sacred heritage sights.
 * Only document local legends when a source explicitly records the tradition.
 */
export const sacredAttractionEditorial: Record<string, AttractionEditorial> = {
  "st-elizabeth-church-roses-square":{
    introduction:"The great twin towers of St Elizabeth's Church rise above Rózsák tere, the Square of Roses. Its name remembers both a medieval Hungarian saint and a story about generosity.",
    historySections:[
      {heading:"A larger parish church for a growing district",paragraphs:[
        "Erzsébetváros became an independent parish in 1881. Its first church soon proved too small for the district, and architect Imre Steindl — also the designer of the Hungarian Parliament — was selected to create a much larger neo-Gothic church.",
        "The foundation stone was laid in the 1890s, and the new church was consecrated on 16 May 1901. After wartime damage, the building was repaired and eventually underwent a broad late-twentieth-century restoration."
      ]},
      {heading:"The Square of Roses",paragraphs:[
        "A statue of St Elizabeth was placed in front of the church in 1932, when the square took the name Rózsák tere. The image of roses links the local streetscape to a devotional tradition associated with the saint."
      ]}
    ],
    stories:[{title:"The miracle of the roses",kind:"religious-tradition",description:[
      "According to a traditional story about Saint Elizabeth of Hungary, she was secretly carrying bread to people in need when asked what was in her bundle. She said that it contained roses. On opening the bundle, the bread was said to have turned into roses.",
      "This is a religious legend illustrating charity, not an independently verifiable historical event. The square's rose imagery preserves the tradition."
    ],sourceUrl:"https://visithungary.com/articles/where-the-roses-bloom-st-elizabeth-of-hungary-parish-church",sourceLabel:"Visit Hungary — St Elizabeth and the roses"}],
    sources:[{label:"St Elizabeth Parish — official history",url:"https://rozsaktere.hu/en/history/"},{label:"Visit Hungary — tradition of the roses",url:"https://visithungary.com/articles/where-the-roses-bloom-st-elizabeth-of-hungary-parish-church"}]
  },
  "st-anne-church-batthyany-square":{
    introduction:"St Anne's Church faces the Danube from Batthyány Square, where its Baroque twin towers are a familiar part of the Buda riverbank skyline.",
    historySections:[{heading:"Baroque Buda beside the Danube",paragraphs:[
      "The church belongs to the eighteenth-century reshaping of Buda after the Ottoman period. Historic photo documentation identifies it as a church dating from the 1760s.",
      "Its position near the river makes it a natural architectural stop when exploring Batthyány Square or taking in views of the Parliament from across the water."
    ]}],
    sources:[{label:"Wikimedia Commons — verified St Anne's Church photograph and historical caption",url:"https://commons.wikimedia.org/wiki/File:Church_of_St_Anne_in_Budapest_I._district.jpg"}]
  },
  "inner-city-parish-church-assumption":{
    introduction:"The Inner City Parish Church of the Assumption preserves stories reaching back through the oldest layers of Pest, from Roman remains to medieval kings and the Ottoman era.",
    historySections:[
      {heading:"A church above older city foundations",paragraphs:[
        "The site contains layers of architecture from successive eras. Official Hungarian destination material identifies traces of the Roman period and recalls the parish's long history since the early centuries of Christian Hungary.",
        "The building changed across the centuries, reflecting Gothic and later styles. During Ottoman rule it was used as a mosque before returning to Christian worship."
      ]},
      {heading:"Part of Pest's civic life",paragraphs:[
        "The church has connections with important religious and political events. Franz Liszt was among those associated with its musical life, and ceremonies tied it to Budapest's nineteenth-century emergence as a capital."
      ]}
    ],
    stories:[{title:"Saint Gerard and the city's earliest Christian memories",kind:"historical-account",description:[
      "According to the Hungarian tourism authority's history of the church, Bishop Gerard was buried here in 1046 before his remains were later moved. The detail links the present-day church with the earliest centuries of the Hungarian kingdom."
    ],sourceUrl:"https://visithungary.com/articles/2000-years-of-history-close-up-in-the-inner-city-parish-church-of-the-assumption",sourceLabel:"Visit Hungary — Inner City Parish Church history"}],
    sources:[{label:"Visit Hungary — Inner City Parish Church",url:"https://visithungary.com/articles/2000-years-of-history-close-up-in-the-inner-city-parish-church-of-the-assumption"}]
  },
  "deak-square-lutheran-church":{
    introduction:"Deák Square Lutheran Church is a quieter architectural landmark at one of central Pest's busiest intersections, where a religious community shares the square with the city's major transport lines.",
    historySections:[{heading:"A classical church in the expanding city",paragraphs:[
      "The church was built in the early nineteenth century to designs associated with architect Mihály Pollack, with later facade work by József Hild. Its restrained exterior contrasts with the ornate churches and secular landmarks nearby.",
      "The site is part of the history of Lutheran worship in Pest and remains an important urban landmark."
    ]}],
    sources:[{label:"Wikimedia Commons — Deák Square Lutheran Church photo record",url:"https://commons.wikimedia.org/wiki/File:Budapest_Deak_teri_ev_templom_P2220405-lev-1000.jpg"}]
  },
  "st-emeric-cistercian-church":{
    introduction:"Saint Emeric Church near Feneketlen Lake introduces another face of Budapest's religious landscape beyond the crowded historic centre.",
    historySections:[{heading:"A sacred landmark in Újbuda",paragraphs:[
      "The church stands by the neighbourhood around Feneketlen Lake. Its prominent building and surrounding streets make it a natural architectural point of interest on a walk through southern Buda.",
      "The dedication to Saint Emeric recalls a figure from Hungary's early Christian royal history; check parish information before arranging an interior visit."
    ]}],
    sources:[{label:"Wikidata — site identification and location",url:"https://www.wikidata.org/wiki/Q12354009"}]
  },
  "st-margaret-parish-church-lehel-square":{
    introduction:"The Church of Saint Margaret marks Lehel Square in northern Pest, a landmark dedicated to one of Hungary's best-known medieval saints.",
    historySections:[{heading:"A church and a changing neighbourhood",paragraphs:[
      "Standing close to the square and its surrounding urban streets, the church is part of the area's layered social and religious history.",
      "Its dedication to Saint Margaret of Hungary connects an everyday city landmark to a figure remembered in Hungarian religious tradition."
    ]}],
    sources:[{label:"Wikidata — Saint Margaret Parish Church",url:"https://www.wikidata.org/wiki/Q1414810"}]
  },
  "st-ladislaus-church-kobanya":{
    introduction:"Saint Ladislaus Church shows how Hungarian architects experimented with historic and national decorative forms in the late nineteenth century.",
    historySections:[{heading:"Ödön Lechner's Kőbánya landmark",paragraphs:[
      "Budapest City Archives traces the commission of this church to the 1890s and the work of architect Ödön Lechner. His designs combined Gothic-inspired forms with distinctive decorative ideas.",
      "The building became one of Kőbánya's outstanding religious and architectural landmarks, set apart from the best-known riverside monuments."
    ]}],
    stories:[{title:"Several designs before one church",kind:"historical-account",description:[
      "The city's archive describes how Lechner reworked his proposal more than once while responding to the church's commissioners. This story of creative disagreement offers a glimpse behind the finished architecture."
    ],sourceUrl:"https://bparchiv.hu/leveltari-egyperces-2025-21-a-kobanyai-szent-laszlo-templom/",sourceLabel:"Budapest City Archives"}],
    sources:[{label:"Budapest City Archives — St Ladislaus Church",url:"https://bparchiv.hu/leveltari-egyperces-2025-21-a-kobanyai-szent-laszlo-templom/"}]
  },
  "obuda-synagogue":{
    introduction:"The Óbuda Synagogue is a reminder that Jewish heritage in Budapest reaches far beyond the better-known streets of the central Jewish Quarter.",
    historySections:[{heading:"Jewish heritage in the old town of Óbuda",paragraphs:[
      "Óbuda developed as a separate community before the unification of Budapest in the nineteenth century. Its historic synagogue marks part of that community's Jewish religious heritage.",
      "A visit can be paired with exploration of older Óbuda, while visitor access and any event schedules should be confirmed directly."
    ]}],
    sources:[{label:"Wikidata — Óbuda Synagogue",url:"https://www.wikidata.org/wiki/Q686855"}]
  },
  "serbian-orthodox-church-downtown-pest":{
    introduction:"A Serbian Orthodox church close to the heart of Pest offers a glimpse of Budapest's multicultural history beyond its more celebrated Roman Catholic landmarks.",
    historySections:[{heading:"A place of Orthodox worship in Pest",paragraphs:[
      "The church's historic location on Szerb Street reflects the religious and cultural presence of Serbian communities in the city.",
      "The building is worth noticing on a walk through the old streets of southern central Pest, even when interior access is limited by services."
    ]}],
    sources:[{label:"Wikidata — Serbian Orthodox Church, Budapest",url:"https://www.wikidata.org/wiki/Q725383"}]
  },
  "queen-of-heavens-church-ujpest":{
    introduction:"The Queen of Heavens Church is a major landmark of Újpest, beyond the central districts usually shown in first-time Budapest guides.",
    historySections:[{heading:"Sacred architecture beyond the city centre",paragraphs:[
      "Its prominent facade anchors part of Újpest's townscape. The church tells a different story of Budapest: the distinct neighbourhoods that developed outside the historic Buda and Pest cores.",
      "The church's current schedule and interior access should be checked with the local parish."
    ]}],
    sources:[{label:"Wikidata — Queen of Heavens Church",url:"https://www.wikidata.org/wiki/Q987800"}]
  },
  "holy-family-church-terezvaros":{
    introduction:"The Holy Family Church on Szondi Street is part of the intimate network of neighbourhood religious buildings in Terézváros.",
    historySections:[{heading:"A church on Szondi Street",paragraphs:[
      "The building is recorded among Budapest's historic religious properties and presents a quieter contrast to the monumental basilica and royal churches elsewhere in the city.",
      "Its location makes it a possible architecture stop on a walk through District VI."
    ]}],
    sources:[{label:"Wikidata — Holy Family Church",url:"https://www.wikidata.org/wiki/Q101007210"}]
  },
  "armenian-catholic-church-ujbuda":{
    introduction:"This small Armenian Catholic site in Újbuda reveals one of the religious communities that helped shape Budapest's varied cultural identity.",
    historySections:[{heading:"A community landmark on Orlay Street",paragraphs:[
      "The bell tower and associated religious site stand in the Orlay Street area of Újbuda. Rather than a major tourist complex, this place is interesting for visitors studying Budapest's lesser-known Christian communities.",
      "As an active or former community site, access should never be assumed from the presence of a photographed building."
    ]}],
    sources:[{label:"Wikidata — Armenian Catholic Church, Budapest",url:"https://www.wikidata.org/wiki/Q21076269"}]
  },
  "pozsonyi-road-reformed-church":{
    introduction:"Pozsonyi Road Reformed Church adds a modern architectural contrast to the Baroque and neo-Gothic church buildings often associated with Budapest.",
    historySections:[{heading:"A modern church by the northern Pest riverfront",paragraphs:[
      "The church is located near the Danube in District XIII and reflects the area's more modern urban fabric.",
      "Its restrained lines provide a worthwhile contrast for travellers exploring different periods and traditions in the city's religious architecture."
    ]}],
    sources:[{label:"Wikidata — Pozsonyi Road Reformed Church",url:"https://www.wikidata.org/wiki/Q1239988"}]
  },
  "rumbach-street-synagogue":{
    introduction:"Rumbach Street Synagogue is one of Budapest's most significant Jewish architectural landmarks, with an octagonal prayer hall and a neo-Moorish design.",
    historySections:[{heading:"Otto Wagner's richly decorated synagogue",paragraphs:[
      "The synagogue was completed in 1872 for the city's Status Quo Ante Jewish community. Designed by Otto Wagner, the building combines a distinctive octagonal hall with decorative architectural references inspired by Moorish forms.",
      "A major restoration was completed by 2021, helping revive the site for religious, museum and cultural use."
    ]}],
    stories:[{title:"An octagonal room that became a cultural venue",kind:"historical-account",description:[
      "Architectural research records how the restored central prayer space can be adapted for events as well as religious use. Its careful restoration reflects changing approaches to preserving Jewish heritage in Budapest."
    ],sourceUrl:"https://cja.huji.ac.il/mhs/browser.php?id=24867&mode=set",sourceLabel:"Center for Jewish Art — Rumbach Street Synagogue"}],
    sources:[{label:"Center for Jewish Art — Rumbach Synagogue history",url:"https://cja.huji.ac.il/mhs/browser.php?id=24867&mode=set"}]
  },
  "kazinczy-street-orthodox-synagogue":{
    introduction:"The Kazinczy Street Orthodox Synagogue adds another architectural and spiritual layer to the Jewish Quarter, alongside the more famous Dohány and Rumbach Street sites.",
    historySections:[{heading:"A heritage building within the Jewish Quarter",paragraphs:[
      "The synagogue is associated with Budapest's Orthodox Jewish community and its religious traditions.",
      "Its ornamented architectural details offer a different visual experience from nearby Jewish heritage buildings. Current access and photography rules should be confirmed with the venue."
    ]}],
    sources:[{label:"Wikimedia Commons — Kazinczy Street Synagogue photographs",url:"https://commons.wikimedia.org/wiki/File:Kazinczy_street_Orthodox_Synagogue,_Budapest.jpg"}]
  },
  "ujlaki-synagogue":{
    introduction:"The Újlaki Synagogue shows how the city's Jewish architectural history reaches into the Buda neighbourhoods.",
    historySections:[{heading:"A historic Jewish landmark in Újlak",paragraphs:[
      "This synagogue building forms part of the architectural history of north-central Buda. Historical photo records identify its historic design and location.",
      "Its story is best understood alongside other synagogues across Budapest rather than treating the central Jewish Quarter as the city's only place of Jewish history."
    ]}],
    sources:[{label:"Wikidata — Újlaki Synagogue",url:"https://www.wikidata.org/wiki/Q3508047"}]
  }
};
