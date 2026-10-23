import type { HistorySeed } from "./attraction-history-batch-a";

/**
 * Editorial seeds (26–50 of 50). Facts are drawn from the named attraction's
 * Budapest Info visitor source and, when supplied, authoritative operator
 * records. Religious traditions are labelled; no generic invented folklore.
 */
export const historySeedsB: HistorySeed[] = [
  {
    slug: "cafe-gerbeaud",
    introduction: "Café Gerbeaud is one of the places where Budapest's tradition of elaborate confectionery meets the social history of its grand city-centre cafés.",
    chapters: [
      ["From Henrik Kugler to Emil Gerbeaud", "Confectioner Henrik Kugler opened a café in Pest in 1858, moving to the square now known as Vörösmarty Square in 1870. The Swiss-born Emil Gerbeaud joined the business in the 1880s and helped turn it into an internationally known name in cakes and chocolates."],
      ["The café through political change", "The business survived war and changes in ownership. After post-war nationalisation, the café operated under the name Vörösmarty before the historic Gerbeaud name returned in 1984. Its continued presence on the square makes it a living part of Budapest's pastry history."]
    ],
    stories: [{
      title: "From paper cake trays to chocolate classics", kind: "historical-account",
      description: ["The confectionery's own chronology credits Kugler with popularising cakes sold on paper trays and Gerbeaud with developing an expansive range of sweets. Its history also describes the introduction of cat's-tongue chocolates and cognac sour cherries to the local confectionery tradition."],
      sourceUrl:"https://gerbeaud.hu/en/gerbeaud-history/",sourceLabel:"Café Gerbeaud — official company timeline"
    }],
    additionalSources:[{label:"Café Gerbeaud — documented history since 1858",url:"https://gerbeaud.hu/en/gerbeaud-history/"}]
  },
  {
    slug: "metropolitan-ervin-szabo-library",
    introduction: "The central Ervin Szabó Library is an unusual Budapest treasure: a public library whose reading rooms occupy a former aristocratic palace.",
    chapters: [
      ["The Wenckheim Palace", "The neo-Baroque Wenckheim Palace was built between 1887 and 1889 to plans by Arthur Meinig. Its ceremonial rooms and lavish decoration reflect the social world of an affluent Budapest family at the end of the nineteenth century."],
      ["A palace becomes a public library", "The Central Library moved into the historic building in 1931. Later restoration and expansion connected it with neighbouring buildings while preserving elaborate interior rooms, transforming private grandeur into a public place of reading and research."]
    ],
    additionalSources:[{label:"Budapest Info — library and Wenckheim Palace history",url:"https://www.budapestinfo.hu/en/metropolitan-ervin-szabo-library"}]
  },
  {
    slug: "museum-of-ethnography",
    introduction: "The Museum of Ethnography explores how everyday objects, dress, ritual and craft reveal the lives of communities in Hungary and beyond.",
    chapters: [
      ["Collecting the stories of daily life", "The museum's long history grew from the idea that folk traditions and material culture deserved the same serious attention as royal collections and fine art. Ethnographic research records both continuities and changes in people's lives."],
      ["A contemporary home at City Park", "The museum's modern building beside Városliget gave the collections a new architectural setting. Its exhibitions connect historic objects to contemporary questions about identity and cultural exchange rather than presenting traditions as frozen in time."]
    ]
  },
  {
    slug: "house-of-terror-museum",
    introduction: "The House of Terror is a memorial museum at Andrássy Avenue 60, confronting the violence and political repression of Hungary's twentieth century.",
    chapters: [
      ["A building marked by two dictatorships", "The address is associated with the Arrow Cross period and the communist-era political police. The institution presents the experience of people persecuted, imprisoned and tortured under dictatorial regimes."],
      ["Turning a difficult history into public memory", "The building was acquired for a memorial museum in 2000, renovated and opened to the public in February 2002. The exhibitions are intended to communicate the human effects of state terror and should be visited with sensitivity to the victims."]
    ],
    additionalSources:[{label:"House of Terror — museum's official history",url:"https://terrorhaza.hu/en/about-the-museum"}]
  },
  {
    slug: "house-of-unicum",
    introduction: "The House of Unicum introduces the history of the Zwack family business and the changing fortunes of a distinctive Hungarian herbal spirit.",
    chapters: [
      ["A family business in Hungarian industry", "The Zwack name became closely associated with Unicum and its herbal-liqueur tradition. The company has passed through very different political and economic periods, providing an unusual window into the country's modern industrial and family-business history."],
      ["Museum, production and inherited identity", "The visitor exhibition presents advertising, family objects and the product's heritage alongside the story of its manufacture. The tasting experience is separate from the wider historical value of the museum, and participation should always be an individual choice."]
    ]
  },
  {
    slug: "underground-railway-museum",
    introduction: "Budapest's underground railway museum tells the story of an urban transport innovation created for a rapidly modernising capital.",
    chapters: [
      ["The Millennium Underground", "The first line of the Budapest underground opened in 1896, serving the boulevard and celebrations of the Hungarian millennium. It was a landmark in continental European electric rapid transit and remains integral to the identity of Andrássy Avenue."],
      ["A museum inside the old tunnel", "A reconstruction of Deák Ferenc Square station in 1955 left a section of the earlier tunnel unused. The museum opened there in 1975, preserving transport equipment and original historical context below today's busy interchange."]
    ]
  },
  {
    slug: "szamos-chocolate-museum",
    introduction: "The Szamos Chocolate Museum places Budapest's love of confectionery in the setting of an exhibition devoted to chocolate and traditional sweetmaking.",
    chapters: [
      ["A specialist collection by Parliament", "The museum near Kossuth Square introduces chocolate as a craft and cultural product rather than simply a dessert. Its displays draw on the traditions of Hungarian confectioners and the changing objects associated with making and enjoying sweets."],
      ["Sweetmaking as everyday heritage", "A visit is a reminder that family businesses, recipes, shop design and packaging can be part of a city's story. Exhibition formats and any tastings can change, so contemporary programme information should be checked separately."]
    ]
  },
  {
    slug: "robert-capa-contemporary-photography-center",
    introduction: "The Robert Capa Centre celebrates the contribution of Hungarian photographers to international visual storytelling, especially documentary images.",
    chapters: [
      ["A centre named for a Budapest-born photographer", "Robert Capa, born in Budapest in 1913, became one of the most influential war photographers of the twentieth century. The photography centre opened during the centenary year of his birth to recognise photographers and the power of their work."],
      ["The camera as historical witness", "The centre presents contemporary exhibitions, often including press and documentary photography. In these images, history is not only a collection of dates but the records of how individuals witnessed moments of conflict, change and ordinary life."]
    ]
  },
  {
    slug: "mai-mano-house",
    introduction: "Mai Manó House is itself a historic photographic artefact: an elaborate nineteenth-century studio created for a professional portrait photographer.",
    chapters: [
      ["A photographer's purpose-built palace", "Hungarian photographer Mai Manó commissioned the building in 1894 on Nagymező Street. Its richly decorated staircases, stained glass and monogrammed ironwork reflect the social standing of studio portrait photography in that era."],
      ["Preserving photographic culture", "The house is now used for photography exhibitions, books and research. Its survival allows visitors to see how the profession once presented itself architecturally as well as through photographs."]
    ],
    stories:[{
      title:"The studio owner's initials in the stairs",kind:"historical-account",
      description:["The visitor account points out the 'MM' monogram on the ornamental staircase railings. It is a small detail that connects today's exhibition visitor with the photographer who had the building made."],
      sourceUrl:"https://www.budapestinfo.hu/en/the-house-of-hungarian-photographers-mai-mano-house-2",sourceLabel:"Budapest Info — Mai Manó House architectural details"
    }]
  },
  {
    slug: "vasarely-museum-budapest",
    introduction: "The Vasarely Museum offers a journey into Op Art, where colour and geometry make a flat image appear to vibrate or move.",
    chapters: [
      ["A Hungarian-born pioneer of optical art", "Victor Vasarely helped shape the twentieth-century movement known as Op Art. His experiments with patterned shapes and colour relationships challenged the viewer's perception without relying on conventional illusionistic painting."],
      ["Art made to be shared", "The Budapest museum introduces his work in Óbuda and explains his ambition to make modern visual art approachable. The collection forms part of a wider story connecting Hungarian artists with the international avant-garde."]
    ]
  },
  {
    slug: "obuda-museum",
    introduction: "Óbuda Museum explores the layered past of the northern Buda district, from Roman settlement to the twentieth-century city.",
    chapters: [
      ["A district older than modern Budapest", "Óbuda incorporates traces of the Roman world alongside later village, town and industrial development. The museum helps explain how separate places came together in the capital formed in 1873."],
      ["Everyday life as a historical source", "Its displays include urban history and collections of objects from ordinary households. The 'Toys in the City' exhibition uses playthings made in Hungary before 1990 to show how family life, design and manufacturing changed."]
    ]
  },
  {
    slug: "hungarian-jewish-museum-and-archives",
    introduction: "The Hungarian Jewish Museum and Archives preserve objects and records that reveal centuries of Jewish life in Hungary.",
    chapters: [
      ["A collection bound to the Jewish Quarter", "The museum is located close to the Dohány Street Synagogue, in an area central to Budapest's Jewish religious and cultural history. Its holdings include objects associated with ritual life, communities, art and documentary memory."],
      ["Preserving lives behind the dates", "The archival role is especially significant in understanding the Holocaust and the complex continuity of Hungarian Jewish communities before and after it. The institution invites consideration of living traditions as well as loss and remembrance."]
    ]
  },
  {
    slug: "hungarian-museum-of-trade-and-tourism",
    introduction: "This museum explores how Hungarian shops, hospitality businesses and visitor culture have shaped everyday life and city streets.",
    chapters: [
      ["The history behind shopfronts", "Trade and hospitality history includes objects easily overlooked elsewhere: shop fittings, signs, menus, packaging, photographs and documents. Together they reveal the changing experiences of customers, staff and travelling visitors."],
      ["Why commercial history matters", "Budapest's cafés, markets and restaurants are tied to wider changes in urban work and leisure. The museum interprets this world through collections and exhibitions, with themes that may change from one visit to another."]
    ]
  },
  {
    slug: "goldberger-textile-collection",
    introduction: "The Goldberger Textile Collection recalls Óbuda's industrial era through one of Hungary's historically important textile enterprises.",
    chapters: [
      ["A factory woven into the district", "The Goldberger company became a well-known name in Hungarian textile manufacturing. The museum collection stands in the former factory premises on Lajos Street, connecting industrial history with the architecture of the workplace."],
      ["Fabric as a record of social change", "Textile production reveals changing tastes, technology, labour and everyday consumption. The Óbuda Museum collection preserves those stories through manufacturing objects and examples of the fabrics associated with the enterprise."]
    ]
  },
  {
    slug: "aquincum-museum",
    introduction: "Aquincum is where Budapest's Roman history becomes tangible, through the surviving streets, baths and public spaces of an ancient settlement.",
    chapters: [
      ["The city of Roman Pannonia", "Aquincum developed as an important Roman centre in the region of present-day Óbuda. Its archaeological remains include residential buildings, spaces for trade and bathing, and traces of the public life of a provincial settlement."],
      ["Excavations turn ruins into evidence", "The museum's ruin garden brings visitors close to the surviving walls of the civilian town. Exhibited finds help interpret how Romans lived, worked, gathered and adopted customs far from Rome itself."]
    ],
    stories:[{
      title:"Why some call Aquincum the Hungarian Pompeii",kind:"historical-account",
      description:["Budapest's official visitor guide notes that the preserved Roman town is sometimes nicknamed the 'Hungarian Pompeii'. The comparison is a modern description of the extensive ruins, not a claim that Aquincum was buried by the eruption at Vesuvius."],
      sourceUrl:"https://www.budapestinfo.hu/en/budapest-history-museum-aquincum-museum",sourceLabel:"Budapest Info — Aquincum archaeological park"
    }]
  },
  {
    slug: "budapest-history-museum",
    introduction: "The Castle Museum uses the layers of Buda's Royal Palace to tell the story of the city from antiquity to the modern era.",
    chapters: [
      ["History within the royal complex", "The museum is housed inside Buda Castle, itself a structure transformed by medieval royal life, Ottoman-era conflict and later rebuilding. Rooms and surviving fragments link physical architecture to the city's changing political role."],
      ["From separate towns to a capital", "The exhibitions explore Aquincum, the medieval city, the Ottoman and Habsburg periods, and the eventual unification of Pest, Buda and Óbuda. Visitors can see how the modern metropolis emerged from communities with distinct histories."]
    ]
  },
  {
    slug: "kiscelli-museum",
    introduction: "Kiscelli Museum occupies an evocative historic complex in Óbuda, where the history of the building adds another layer to its collections.",
    chapters: [
      ["A site with several identities", "The complex's past includes religious use, later military and residential functions and wartime shelter. Its architecture preserves traces of the changing roles that historic buildings can acquire across centuries."],
      ["A home for urban history and art", "As part of the Budapest History Museum, Kiscelli holds collections about the modern city's social and material culture alongside fine art. The museum grounds connect indoor exhibits to the building's complicated past."]
    ]
  },
  {
    slug: "budapest-gallery",
    introduction: "Budapest Gallery connects the city's historic cultural spaces with new visual ideas and contemporary artistic debate.",
    chapters: [
      ["Exhibiting art within the city's history", "The Gallery forms part of Budapest's city-museum network and has presented work by Hungarian and international contemporary artists. Rather than offering one fixed narrative, its temporary programmes track the changing questions explored by artists."],
      ["Óbuda as a cultural setting", "The museum's Óbuda location ties the modern exhibitions to a district with a long Roman, town and industrial heritage. That setting can be part of the experience even when the art on the walls is explicitly contemporary."]
    ]
  },
  {
    slug: "hungarian-railway-history-park",
    introduction: "The Railway History Park preserves the machines and practices that helped connect Hungarian cities, industries and travellers in the age of steam.",
    chapters: [
      ["Railways and the modern nation", "Rail transport transformed the movement of people and goods through Hungary during the nineteenth and twentieth centuries. Engines, carriages and railway infrastructure reflect the engineering ambition that made those connections possible."],
      ["A museum built for large machines", "The Budapest park gathers historic railway equipment in an open-air setting. The vehicles reveal how technology, passenger comfort and industrial design changed, while operational demonstrations and visitor activities depend on the current programme."]
    ]
  },
  {
    slug: "medieval-jewish-prayer-house",
    introduction: "The Medieval Jewish Prayer House offers a rare glimpse of Jewish community life inside Buda's historic Castle District.",
    chapters: [
      ["Jewish life on Castle Hill", "The surviving building is linked to Jewish religious life in the medieval and Ottoman periods. Architectural details and painted inscriptions help reveal a community whose history is not always visible in the district's grander royal buildings."],
      ["A small site with lasting significance", "The Budapest History Museum's interpretation includes historic symbols, writing and related finds. As with other sites of religious heritage, its history should be approached with respect for the people and traditions represented."]
    ],
    additionalSources:[{label:"Budapest Info — history-oriented visit to the Medieval Jewish Prayer House",url:"https://www.budapestinfo.hu/en/things-to-do-in-budapest-for-history-lovers"}]
  },
  {
    slug: "petofi-museum-of-literature",
    introduction: "The Petőfi Museum of Literature brings literary manuscripts and national memory into the historic rooms of Károlyi Palace.",
    chapters: [
      ["A palace for the written word", "The museum is housed in one of Budapest's notable classicist buildings. It collects and interprets writings and objects associated with Hungarian authors, allowing manuscripts and personal possessions to become historical evidence."],
      ["Why the name Petőfi matters", "Sándor Petőfi remains strongly associated with the Hungarian national awakening and 1848 Revolution. A museum named after him also explores a wider range of literary voices, revealing how the country's changing identity has been expressed through literature."]
    ]
  },
  {
    slug: "hungarian-agricultural-museum-and-library",
    introduction: "The Agricultural Museum is housed in Vajdahunyad Castle, a building born from the celebrations of Hungary's millennium in 1896.",
    chapters: [
      ["A romantic castle made for a public exhibition", "The story begins with the 1896 celebrations marking a thousand years of Hungarian statehood. Vajdahunyad Castle gathered architectural references from different periods to present the country's past in a single picturesque setting."],
      ["Farming history in the city park", "The Agricultural Museum and Library use the castle to explore Hungary's agricultural heritage, tools, crops and rural life. The contrast between romantic architecture and practical subjects is part of what makes the visit distinctive."]
    ]
  },
  {
    slug: "hungarian-natural-history-museum",
    introduction: "Budapest's Natural History Museum opens a window into the country's scientific collecting tradition and the diversity of life and geology.",
    chapters: [
      ["A long tradition of collections", "The museum's origins lie in the historic study and preservation of the natural world. Over generations, scientists assembled animal, plant, mineral and fossil collections that support both public understanding and research."],
      ["Objects that reveal deep time", "Exhibitions use specimens and explanations to show how habitats, species and geological landscapes change. Scientific collections hold evidence far older than Budapest itself and remind visitors that the region's natural history is part of a much larger world."]
    ]
  },
  {
    slug: "franz-liszt-memorial-museum-and-research-centre",
    introduction: "The Franz Liszt Memorial Museum keeps the pianist and composer's life close to the city where he helped establish a lasting musical institution.",
    chapters: [
      ["Liszt's Budapest legacy", "Franz Liszt was central to the establishment of the academy of music that carries his name. His connections with Budapest made the city an important centre for his later work, teaching and musical advocacy."],
      ["Remembering a working musician", "The memorial museum is linked to the Liszt Academy and its research centre. Its interpretation considers the composer as a person, performer and teacher rather than only a celebrated name on concert programmes."]
    ]
  },
  {
    slug: "cave-church",
    introduction: "Budapest's Cave Church is a striking place of worship cut into the rock of Gellért Hill, with a twentieth-century history of hardship and return.",
    chapters: [
      ["A church fashioned from the hillside", "The Paulist order developed the cave church in the early twentieth century, and its present nave was completed around 1930. The distinctive interior connects Christian worship with the natural rock of the hill above the Danube."],
      ["Closure and reopening", "During the Second World War, monks provided refuge here to people in danger. The church was forcibly closed and walled up in 1951. It reopened in 1990 and again became a centre for religious life and visitors."]
    ],
    stories:[{
      title:"The cave walls that seemed to open themselves",kind:"local-tradition",
      description:["Budapest's official tourism account preserves a story that, as the passage was being made in the 1920s, parts of the cliff walls fell away almost miraculously, creating the vaulted chamber. This is a local religious building tradition, not a verified supernatural occurrence."],
      sourceUrl:"https://www.budapestinfo.hu/en/the-cave-church",sourceLabel:"Budapest Info — Cave Church history and tradition"
    }],
    additionalSources:[{label:"Budapest Info — the Cave Church",url:"https://www.budapestinfo.hu/en/the-cave-church"}]
  }
];
