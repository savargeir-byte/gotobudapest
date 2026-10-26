import { expandedAttractionEditorial } from "./attraction-editorial-expanded";

/**
 * Research-backed histories and associated stories for existing attractions.
 *
 * A story is not necessarily folklore: type distinguishes documented accounts
 * from established local traditions and from beliefs attributed to communities.
 * No automatic generated legend is used for places with no supporting source.
 *
 * This static catalogue is intentionally structured to migrate 1:1 into Sanity
 * attraction fields: historySections, legendsAndStories, and sources.
 */
export type HistoricalSection = { heading: string; paragraphs: string[] };
export type HistoricalStory = {
  title: string;
  kind: "historical-account" | "local-tradition" | "religious-tradition";
  description: string[];
  sourceUrl: string;
  sourceLabel: string;
};
export type AttractionEditorial = {
  introduction: string;
  historySections: HistoricalSection[];
  stories?: HistoricalStory[];
  sources: { label: string; url: string }[];
};
export const attractionEditorial: Record<string, AttractionEditorial> = {
  "hospital-in-the-rock": {
    introduction: "Deep beneath Buda Castle, a former emergency hospital traces Budapest's wartime siege, the 1956 Revolution and the anxious decades of the Cold War. The underground rooms tell a very human story of medicine, improvisation and survival.",
    historySections: [
      { heading: "A hospital built into the Castle Hill caves", paragraphs: [
        "The natural limestone cave network beneath Buda Castle was adapted to shelter residents during air raids. Construction of an underground emergency hospital began in 1941, and it opened on 20 February 1944. Its facilities included three wards and an operating theatre.",
        "During the siege of Budapest in 1944–45, its beds and connecting passages filled with wounded civilians and soldiers. Medical staff worked amid shortages and difficult conditions, while the subterranean location helped protect the hospital from bombing above."
      ]},
      { heading: "Back to emergency care in 1956", paragraphs: [
        "The hospital reopened during the Hungarian Revolution of October 1956. Its doctors treated wounded people from both civilian and military backgrounds, and the space also sheltered families. The facility continued treating patients until December of that year."
      ]},
      { heading: "From hospital to nuclear bunker and museum", paragraphs: [
        "Between 1958 and 1962, the complex was adapted for a possible nuclear or chemical emergency. New ventilation, filtration and backup power systems reflected the anxieties of the Cold War. The facility remained a controlled civil-defence site for decades.",
        "The underground complex was eventually opened to the public as a museum, with permanent exhibition operations from 2008. Today it offers an unusual way to understand twentieth-century Budapest through the stories of patients, volunteers and medical staff."
      ]}
    ],
    stories: [
      {title: "The surgeon who wore a recovered bullet",kind:"historical-account",description:[
        "The museum's historical account describes Dr András Máthé, who worked here during the 1956 Revolution. According to the museum, he wore a bullet on a necklace that he had removed from an injured patient's head. It is a striking account of the dangerous surgeries performed underground.",
        "This is presented as an account recorded by the museum, not as a supernatural legend."
      ],sourceUrl:"https://hospitalintherock.eu/en/history",sourceLabel:"Hospital in the Rock — historical accounts"},
      {title:"A persistent myth about Soviet flamethrowers",kind:"historical-account",description:[
        "The museum specifically disputes a story that Soviet troops burned out the Hospital in the Rock with flamethrowers in 1945. Its official history says this confusion relates to fighting elsewhere in the wider cave system, not the hospital wards.",
        "A responsible guide should distinguish this documented correction from the dramatic version of the story."
      ],sourceUrl:"https://hospitalintherock.eu/en/history",sourceLabel:"Hospital in the Rock — history and misconceptions"}
    ],
    sources:[{label:"Hospital in the Rock — official history",url:"https://hospitalintherock.eu/en/history"},{label:"Hospital in the Rock — exhibitions",url:"https://hospitalintherock.eu/en/exhibitions"}]
  },
  "fishermans-bastion": {
    introduction: "Fisherman's Bastion may look like a medieval fortress, but its fairy-tale terraces belong to the great nineteenth-century reshaping of Buda Castle. Its towers frame some of Budapest's most recognisable views.",
    historySections:[
      {heading:"A picturesque lookout above an older wall",paragraphs:[
        "The present bastion was built around the turn of the twentieth century as part of the wider restoration of the Castle Hill area near Matthias Church. Rather than an active military fortress, it became a monumental terrace overlooking Pest and the Danube.",
        "The neo-Romanesque towers and arcades recall medieval architecture, helping visitors imagine the older Castle District while enjoying a modern public viewpoint."
      ]},
      {heading:"Why the fishermen?",paragraphs:[
        "The name is commonly connected with the medieval fishermen's guild said to have defended this stretch of the walls. The Castle District's historical institute notes that a neighbouring area called the Town of Fishermen offers another likely origin.",
        "Both explanations link the monument to the riverside settlement beneath Castle Hill, showing how local place names preserve older layers of the city."
      ]}
    ],
    stories:[{title:"The seven towers and the Magyar tribes",kind:"local-tradition",description:[
      "The Bastion's seven towers are conventionally interpreted as symbols of the seven Magyar tribal leaders associated with the Hungarian conquest of the Carpathian Basin.",
      "The towers are architectural symbolism rather than the remains of seven medieval guard posts."
    ],sourceUrl:"https://www.budapest.com/en/locations/fishermans-bastion",sourceLabel:"Budapest destination information"}],
    sources:[{label:"Research Centre for the Humanities — Fishermen's Bastion history",url:"https://budavar.abtk.hu/en/streets-squares-buildings/fishermen-s-bastion.html"},{label:"Budapest visitor information",url:"https://www.budapest.com/en/locations/fishermans-bastion"}]
  },
  "matthias-church":{
    introduction:"Behind Matthias Church's patterned roof is a long history of coronations, royal celebrations, religious changes and painstaking restoration on Castle Hill.",
    historySections:[
      {heading:"Medieval roots and royal ceremonies",paragraphs:[
        "The Church of Our Lady on Buda Castle Hill is documented as under construction in the mid-thirteenth century. King Matthias Corvinus was closely associated with the church and celebrated both of his marriages here.",
        "During Ottoman control of Buda in the sixteenth and seventeenth centuries, the church was used as a mosque. It was returned to Christian worship after the reconquest of Buda in 1686."
      ]},
      {heading:"A church rebuilt for a new age",paragraphs:[
        "In the nineteenth century, architect Frigyes Schulek oversaw a major restoration that reshaped the building's appearance. Franz Joseph and Elisabeth were crowned Hungarian king and queen in 1867, and Hungary's last king, Charles IV, was crowned here in 1916.",
        "Damage during the Second World War led to further restoration. The church remains both an active place of worship and a major historical landmark."
      ]}
    ],
    stories:[{title:"A coronation crown that mattered",kind:"historical-account",description:[
      "In 1309 Charles I was crowned in the church with a provisional crown. The church's own historical account notes that his kingship required a later coronation with the Holy Crown of Hungary.",
      "The episode reflects how the correct crown and ceremony were central to the legitimacy of medieval Hungarian rule."
    ],sourceUrl:"https://matyas-templom.hu/en/history-of-the-church/",sourceLabel:"Matthias Church official chronology"}],
    sources:[{label:"Matthias Church — official history",url:"https://matyas-templom.hu/en/history-of-the-church/"}]
  },
  "st-stephens-basilica":{
    introduction:"One of Budapest's grandest churches, St Stephen's Basilica brings together nineteenth-century architecture and the story of Hungary's first king.",
    historySections:[
      {heading:"Building a monumental city church",paragraphs:[
        "Construction extended across several generations and changes in architectural leadership. The building was completed and dedicated in 1905, becoming an unmistakable landmark of central Pest.",
        "Its dome and richly decorated interior helped establish it as one of the city's major ceremonial spaces. Repairs and restoration have followed damage during the twentieth century."
      ]},
      {heading:"A national and religious symbol",paragraphs:[
        "The basilica is dedicated to Stephen I, the first king of Hungary. It houses the Holy Right, a relic traditionally identified as the king's preserved right hand, which remains important to Hungarian Catholic devotion."
      ]}
    ],
    stories:[{title:"The Holy Right: a centuries-old religious tradition",kind:"religious-tradition",description:[
      "The basilica tells the remarkable story of the Holy Right: according to Catholic tradition, the relic survived successive relocations and periods of concealment before being returned to public veneration.",
      "This is a religious tradition associated with a preserved relic; claims of miraculous qualities belong to the tradition, not to verified scientific findings."
    ],sourceUrl:"https://old.bazilika.biz/en/holy-right",sourceLabel:"St Stephen's Basilica — the Holy Right"}],
    sources:[{label:"St Stephen's Basilica — history",url:"https://it.bazilika.biz/en/history-of-the-church"},{label:"St Stephen's Basilica — Holy Right",url:"https://old.bazilika.biz/en/holy-right"}]
  },
  "hungarian-parliament":{
    introduction:"The Parliament's ornate riverfront silhouette reflects Budapest's emergence as a major European capital at the end of the nineteenth century.",
    historySections:[
      {heading:"A purpose-built home for the legislature",paragraphs:[
        "Parliament's building programme began in the 1880s following an architectural competition won by Imre Steindl. The neo-Gothic design combined a dramatic riverside facade with ceremonial chambers and extensive interior decoration.",
        "The legislature held special sessions in the partly completed complex for the 1896 millennium celebrations. Regular sittings began in 1902, and the building was finished in 1904."
      ]}
    ],
    stories:[{title:"An architect who did not live to see his building completed",kind:"historical-account",description:[
      "Parliament's own historical guide records that Imre Steindl continued supervising the complex project despite declining health, and died shortly before the completed building could be inaugurated.",
      "His design nonetheless became one of the most recognisable symbols of Budapest."
    ],sourceUrl:"https://www.parlament.hu/documents/1779743/1846295/angol.pdf/038a18a7-97ce-11de-4f14-a45c61073d29?t=1547810099000",sourceLabel:"Hungarian Parliament — construction history"}],
    sources:[{label:"Hungarian Parliament — official construction history",url:"https://www.parlament.hu/documents/1779743/1846295/angol.pdf/038a18a7-97ce-11de-4f14-a45c61073d29?t=1547810099000"}]
  },
  "szechenyi-thermal-bath":{
    introduction:"Széchenyi Thermal Bath's yellow neo-Baroque buildings are part of a bathing tradition made possible by deep thermal-water exploration in City Park.",
    historySections:[
      {heading:"From artesian drilling to grand bathhouse",paragraphs:[
        "The bath's roots reach back to the work of mining engineer Vilmos Zsigmondy, whose deep drilling revealed thermal waters beneath City Park. An earlier artesian bath was operating in the area by 1881.",
        "The present Széchenyi complex opened in 1913 from plans by architect Győző Czigler. It was expanded in 1927 with outdoor bathing areas and went through further changes during the twentieth century."
      ]}
    ],
    sources:[{label:"Széchenyi Bath — official history",url:"https://www.szechenyibath.hu/past-and-present"}]
  },
  "chain-bridge":{
    introduction:"Budapest's Chain Bridge became a lasting symbol of the connection between Buda and Pest long before the two cities were formally united.",
    historySections:[
      {heading:"The bridge that changed how the city crossed the Danube",paragraphs:[
        "The Széchenyi Chain Bridge was the first permanent bridge connecting Buda and Pest across the Danube. It helped replace seasonal crossings with a reliable link between the growing communities on either bank.",
        "The suspension bridge and its stone gateways remain central to the city's urban identity. The bridge was destroyed during the Second World War and later rebuilt."
      ]}
    ],
    sources:[{label:"Budapest tourist information — Chain Bridge",url:"https://www.budapestinfo.hu/en/chain-bridge"}]
  },
  "great-market-hall":{
    introduction:"Budapest's Great Market Hall is more than a souvenir stop: it represents the modernisation of the city's everyday food trade at the end of the nineteenth century.",
    historySections:[
      {heading:"A grand new home for market life",paragraphs:[
        "The hall was created during the period when Budapest was expanding its infrastructure and public buildings. Its vast iron-supported interior and striking roof turned the shopping of food into part of the city's architectural story.",
        "Today, visitors encounter market stalls and Hungarian products under one of the city's distinctive historic interiors. Trading patterns vary, so the experience can differ by day."
      ]}
    ],
    sources:[{label:"Budapest destination information",url:"https://www.budapestinfo.hu/en/central-market-hall"}]
  },
  "dohany-street-synagogue":{
    introduction:"The Dohány Street Synagogue stands at the heart of Budapest's Jewish history and is one of the city's most distinctive religious buildings.",
    historySections:[
      {heading:"A landmark of the nineteenth-century Jewish community",paragraphs:[
        "The synagogue was constructed in the nineteenth century as Budapest's Jewish population expanded. Its distinctive Moorish Revival architecture and monumental scale distinguish it from the city's many churches.",
        "The synagogue and surrounding memorial spaces now connect worship, historic preservation and remembrance of Jewish life and the Holocaust."
      ]}
    ],
    sources:[{label:"Dohány Street Synagogue — Jewish heritage visitor information",url:"https://jewishtourhungary.com/"}]
  },
  "buda-castle-district":{
    introduction:"Castle Hill has served as a royal, administrative and residential centre for centuries. Its present skyline contains medieval foundations, baroque rebuilding and modern reconstruction.",
    historySections:[
      {heading:"Layers of a hilltop capital",paragraphs:[
        "The Castle District grew around the medieval royal residence of Buda and the fortified streets above the Danube. Successive rulers, sieges and political changes reshaped its buildings and the surrounding walls.",
        "Today the palace courtyards, historic lanes, churches and viewpoints preserve different moments of Budapest's history in a compact area."
      ]}
    ],
    sources:[{label:"Visit Budavár — heritage and sights",url:"https://visitbudavar.com/en/attractions"}]
  },
  "buda-castle-funicular":{
    introduction:"The short funicular trip to Castle Hill is itself a piece of Budapest transport history.",
    historySections:[
      {heading:"A nineteenth-century route up the hill",paragraphs:[
        "The Buda Castle Funicular provides a direct historic connection between Clark Ádám Square by the Chain Bridge and the Castle Hill palace area. It offers an alternative to climbing the steep slopes on foot.",
        "Its operation and ticketing are separate from ordinary public transport, and services may pause for maintenance."
      ]}
    ],
    sources:[{label:"BKK — official Castle Funicular information",url:"https://bkk.hu/en/travel-information/special-and-heritage-transport-services/funicular/"}]
  },
  "gellert-thermal-bath":{
    introduction:"The Gellért bathhouse is one of Budapest's grand Art Nouveau bathing landmarks, known as much for its architectural interiors as for its pools.",
    historySections:[
      {heading:"Architecture and bathing culture",paragraphs:[
        "The bath developed around thermal springs on the Buda side of the Danube, combining ornate interiors with pools and wellness facilities. Its built setting forms part of Budapest's long spa tradition.",
        "The operator announced a closure for major renovation beginning in October 2025. This attraction's historic significance does not mean it can currently be booked for bathing."
      ]}
    ],
    sources:[{label:"Gellért Bath — official closure notice",url:"https://www.gellertbath.hu/"}]
  },
  "margaret-island":{
    introduction:"Margaret Island is Budapest's great green space in the middle of the Danube, with layers of recreation, religious history and parkland.",
    historySections:[
      {heading:"From historic island to urban retreat",paragraphs:[
        "The island occupies a wide stretch of the Danube between Buda and Pest. Medieval religious communities once lived here, and the ruins of their buildings remain among the island's walking routes.",
        "Its parks, pathways and leisure attractions now provide a quieter contrast to the surrounding city."
      ]}
    ],
    sources:[{label:"Budapest destination information",url:"https://www.budapestinfo.hu/en"}]
  }
};
export function getAttractionEditorial(slug: string) {
  return attractionEditorial[slug] ?? expandedAttractionEditorial[slug];
}
