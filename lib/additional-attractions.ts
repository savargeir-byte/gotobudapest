import type { Attraction } from "./attractions";

/**
 * Sacred-architecture additions sourced from the Hungarian heritage/official
 * tourism references or identified Wikimedia Commons photographs.
 * Each image was individually license-checked and imported into this site's
 * own Sanity Content Lake (project ut6qxuke), preserving photographer credits.
 * Public route content stays source-checked and contains no guessed hours.
 */

type ChurchSeed = {
  slug: string;
  name: string;
  description: string;
  address?: string;
  coord?: [number, number];
  sourceUrl: string;
  sourceLabel: string;
  image: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl?: string;
  commons: string;
};

const churches: ChurchSeed[] = [
  {
    slug:"st-elizabeth-church-roses-square", name:"St Elizabeth Church — Rózsák tere",
    description:"A soaring neo-Gothic church on the Square of Roses, designed by Parliament architect Imre Steindl and dedicated to St Elizabeth of Hungary.",
    address:"1074 Budapest, Rózsák tere",
    sourceUrl:"https://rozsaktere.hu/en/history/",sourceLabel:"St Elizabeth Parish — official history",
    image:"21443e7c84171494978e52b059ec34942cd329e2-960x1280.jpg",
    alt:"St Elizabeth Church with the statue of Saint Elizabeth in Budapest's Square of Roses",
    author:"User:Pasztilla aka Attila Terbócs",license:"CC BY 2.5",licenseUrl:"https://creativecommons.org/licenses/by/2.5",
    commons:"Szent_Erzsebet-templom_03.jpg",
  },
  {
    slug:"st-anne-church-batthyany-square",name:"St Anne's Church — Batthyány Square",
    description:"A twin-towered Baroque church in Buda, facing the river near Batthyány Square, with a richly detailed historic facade.",
    address:"1011 Budapest, Batthyány tér 7",
    coord:[47.505742,19.038394],
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Church_of_St_Anne_in_Budapest_I._district.jpg",sourceLabel:"Wikimedia Commons — verified heritage photo",
    image:"37e60bf95b68589cf53eee0bf7427bc397b07781-960x1440.jpg",
    alt:"Twin towers and facade of St Anne's Church at Batthyány Square, Budapest",
    author:"Szilas",license:"Public domain",commons:"Church_of_St_Anne_in_Budapest_I._district.jpg",
  },
  {
    slug:"inner-city-parish-church-assumption",name:"Inner City Parish Church of the Assumption",
    description:"One of Pest's oldest sacred sites, where Roman remains and later Gothic and Baroque layers tell centuries of city history.",
    address:"1056 Budapest, Március 15. tér",
    sourceUrl:"https://visithungary.com/articles/2000-years-of-history-close-up-in-the-inner-city-parish-church-of-the-assumption",sourceLabel:"Visit Hungary — heritage guide",
    image:"6ffc921bc23139fd03d96b6d5d96ee79fa38c386-960x720.jpg",
    alt:"The Inner City Parish Church of the Assumption near the Danube in central Pest",
    author:"Wizzard",license:"Public domain",commons:"Inner_City_Parish_Church._Budapest_District_V.jpg",
  },
  {
    slug:"deak-square-lutheran-church",name:"Deák Square Lutheran Church",
    description:"An understated historic Lutheran church at one of central Pest's busiest transport squares, associated with architect Mihály Pollack.",
    address:"1052 Budapest, Deák Ferenc tér",
    coord:[47.497222,19.054722],sourceUrl:"https://www.wikidata.org/wiki/Q721281",sourceLabel:"Wikidata — verified place record",
    image:"81275581640177ab1d4856ce5b718569e25a124a-960x973.jpg",
    alt:"Exterior of the Lutheran Church on Deák Ferenc Square in Budapest",
    author:"Misibacsi",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Budapest_Deak_teri_ev_templom_P2220405-lev-1000.jpg",
  },
  {
    slug:"st-emeric-cistercian-church",name:"Saint Emeric Cistercian Church",
    description:"A landmark church near Feneketlen Lake in Újbuda, standing in a quieter neighbourhood away from central tourist crowds.",
    address:"1114 Budapest, Villányi út",
    coord:[47.478692,19.042251],sourceUrl:"https://www.wikidata.org/wiki/Q12354009",sourceLabel:"Wikidata — verified place record",
    image:"a71d2109c72cc38c2241124d74a677e390998f70-960x1260.jpg",
    alt:"Aerial view of Saint Emeric Cistercian Church beside Feneketlen Lake",
    author:"Civertan",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Civertanszent_imre_templom_feneketlenn%C3%A9l.jpg",
  },
  {
    slug:"st-margaret-parish-church-lehel-square",name:"Saint Margaret Parish Church — Lehel Square",
    description:"A distinctive church dedicated to Saint Margaret of Hungary overlooking Lehel Square in northern central Pest.",
    address:"1134 Budapest, Lehel tér",
    coord:[47.5167,19.0606],sourceUrl:"https://www.wikidata.org/wiki/Q1414810",sourceLabel:"Wikidata — verified place record",
    image:"6cd8aa5b20b34816174532777329640d73b822c9-960x1232.jpg",
    alt:"Saint Margaret Parish Church rising above Lehel Square, Budapest",
    author:"Thaler Tamas",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0",commons:"SzentMargitFotoThalerTamas10.jpg",
  },
  {
    slug:"st-ladislaus-church-kobanya",name:"Saint Ladislaus Church — Kőbánya",
    description:"An ornate late-nineteenth-century church in Kőbánya linked to the distinctive architecture of Ödön Lechner.",
    address:"1102 Budapest, Szent László tér",
    coord:[47.4868,19.1329],sourceUrl:"https://bparchiv.hu/leveltari-egyperces-2025-21-a-kobanyai-szent-laszlo-templom/",sourceLabel:"Budapest City Archives — church history",
    image:"261dfe4f2d4d3644fa8f6475ec8678ef0af15634-960x1280.jpg",
    alt:"Saint Ladislaus Church in Budapest's Kőbánya district",
    author:"Globetrotter19",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Saint_Ladislaus_Church_from_Halmos_Street,_2016_Budapest.jpg",
  },
  {
    slug:"obuda-synagogue",name:"Óbuda Synagogue",
    description:"A historic synagogue in the former town of Óbuda, offering a window into Jewish life beyond the central Pest Jewish Quarter.",
    address:"1036 Budapest, Lajos utca",
    coord:[47.536944444,19.045833333],sourceUrl:"https://www.wikidata.org/wiki/Q686855",sourceLabel:"Wikidata — verified place record",
    image:"b92ee172442d8b61c996c63c019c3c77ba40e8cd-960x637.jpg",
    alt:"The historic Óbuda Synagogue in Budapest District III",
    author:"VinceB",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"%C3%93buda_Synagogue_02.JPG",
  },
  {
    slug:"serbian-orthodox-church-downtown-pest",name:"Serbian Orthodox Church — Downtown Pest",
    description:"A historic Serbian Orthodox church tucked into the streets of Pest's fifth district, reflecting the city's multicultural religious past.",
    address:"1056 Budapest, Szerb utca 4",
    coord:[47.4893,19.0573],sourceUrl:"https://www.wikidata.org/wiki/Q725383",sourceLabel:"Wikidata — verified place record",
    image:"dbe32b0938d754e218adfe37d5c5772095703eca-960x745.jpg",
    alt:"Serbian Orthodox Church in Szerb Street, Budapest District V",
    author:"anna schwelung",license:"CC BY 2.5 hu",licenseUrl:"https://creativecommons.org/licenses/by/2.5/hu/deed.en",commons:"G%C3%B6r%C3%B6gkeleti_szerb_templom_(618._sz%C3%A1m%C3%BA_m%C5%B1eml%C3%A9k)_4.jpg",
  },
  {
    slug:"queen-of-heavens-church-ujpest",name:"Queen of Heavens Church — Újpest",
    description:"A prominent parish church in Újpest, representing another layer of Budapest's religious architecture beyond the historic core.",
    address:"1042 Budapest, Szent István tér",
    coord:[47.56236111,19.08861111],sourceUrl:"https://www.wikidata.org/wiki/Q987800",sourceLabel:"Wikidata — verified place record",
    image:"1acd476af3d278391bae22a62564f359d7c04288-960x1440.jpg",
    alt:"Facade of Queen of Heavens Church in Újpest, Budapest",
    author:"Rlevente",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Queen_of_Heavens_Church,_%C3%9Ajpest_001.jpg",
  },
  {
    slug:"holy-family-church-terezvaros",name:"Holy Family Church — Terézváros",
    description:"A historic neighbourhood church on Szondi Street in Terézváros, contrasting with the larger monumental churches of central Pest.",
    address:"1064 Budapest, Szondi utca 67",
    coord:[47.51294,19.06922],sourceUrl:"https://www.wikidata.org/wiki/Q101007210",sourceLabel:"Wikidata — verified place record",
    image:"6e779da0834d1f01af29c799ccaa088deb6053d7-960x1280.jpg",
    alt:"Facade of the Holy Family Church on Szondi Street in Budapest",
    author:"Globetrotter19",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Budapest_Holy_Family_church._Facade._Listed_Monument_ID_7946_-_Budapest_District_VI.,_Szondi_street_67.JPG",
  },
  {
    slug:"armenian-catholic-church-ujbuda",name:"Armenian Catholic Church — Újbuda",
    description:"A modest Armenian Catholic religious site in Újbuda, reflecting Budapest's smaller historic Christian communities.",
    address:"1114 Budapest, Orlay utca 6",
    coord:[47.4822,19.0509],sourceUrl:"https://www.wikidata.org/wiki/Q21076269",sourceLabel:"Wikidata — verified place record",
    image:"b861025cc5984fb87e00edb88450baad58448a04-960x1280.jpg",
    alt:"Bell tower of Armenian Catholic Pastoral Care on Orlay Street in Budapest",
    author:"Globetrotter19",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Armenian_Catholic_Pastoral_Care._Bell_tower_-_Budapest_District_XI.,_Orlay_St.,_6.JPG",
  },
  {
    slug:"pozsonyi-road-reformed-church",name:"Pozsonyi Road Reformed Church",
    description:"A modernist Reformed church near the Danube in District XIII, a contrasting architectural experience to Budapest's Gothic and Baroque landmarks.",
    address:"1137 Budapest, Pozsonyi út",
    coord:[47.5219,19.0531],sourceUrl:"https://www.wikidata.org/wiki/Q1239988",sourceLabel:"Wikidata — verified place record",
    image:"f64a8e6545c46286f574670a77969c59bfe6a91d-960x1469.jpg",
    alt:"Modern church building on Pozsonyi Road in Budapest",
    author:"Karelj",license:"Public domain",commons:"Budapest_modern_church_2.jpg",
  },
  {
    slug:"rumbach-street-synagogue",name:"Rumbach Street Synagogue",
    description:"An octagonal neo-Moorish synagogue in the Jewish Quarter, designed by Otto Wagner and restored as a cultural and religious landmark.",
    address:"1074 Budapest, Rumbach Sebestyén utca 11–13",
    sourceUrl:"https://cja.huji.ac.il/mhs/browser.php?id=24867&mode=set",sourceLabel:"Center for Jewish Art — building history",
    image:"aef7fe620d9dd4c60d8897dee77ecffc2c01445b-960x640.jpg",
    alt:"Inside the restored Rumbach Street Synagogue in Budapest",
    author:"József Rozsnyai",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0",commons:"Rumbach_Street_Synagogue,_Budapest.jpg",
  },
  {
    slug:"kazinczy-street-orthodox-synagogue",name:"Kazinczy Street Orthodox Synagogue",
    description:"A historic Orthodox synagogue in Budapest's Jewish Quarter, known for its richly ornamented sacred architecture.",
    address:"1075 Budapest, Kazinczy utca",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Kazinczy_street_Orthodox_Synagogue,_Budapest.jpg",sourceLabel:"Wikimedia Commons — verified heritage photo",
    image:"e80c8b589045dabaf94aadf0bfc1eee48d86cfd3-960x1560.jpg",
    alt:"Architectural details of the Kazinczy Street Orthodox Synagogue in Budapest",
    author:"Epistola8",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0",commons:"Kazinczy_street_Orthodox_Synagogue,_Budapest.jpg",
  },
  {
    slug:"ujlaki-synagogue",name:"Újlaki Synagogue",
    description:"A historic synagogue in Buda's Újlak area, illustrating the religious and architectural heritage beyond Pest's well-known Jewish Quarter.",
    address:"1023 Budapest, Újlak",
    coord:[47.5216,19.0372],sourceUrl:"https://www.wikidata.org/wiki/Q3508047",sourceLabel:"Wikidata — verified place record",
    image:"60ddac6b4d7e3c198172688ced926deff09167ca-960x878.jpg",
    alt:"Historic Újlaki Synagogue building on Árpád Street in Budapest",
    author:"Globetrotter19",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",commons:"Synagogue,_2018_%C3%9Ajlak.jpg",
  }
];

export const additionalAttractions: Attraction[] = churches.map((a) => {
  const credit = {
    title: `Photograph of ${a.name}`,
    author: a.author,
    license: a.license,
    licenseUrl: a.licenseUrl || "",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:" + a.commons,
  };
  const src = "https://cdn.sanity.io/images/ut6qxuke/production/" + a.image;
  return {
    id: a.slug,
    slug: a.slug,
    name: a.name,
    category: "Sacred architecture",
    description: a.description,
    sourceUrl: a.sourceUrl,
    sourceLabel: a.sourceLabel,
    checked: "2026-10-23",
    ...(a.address ? {address:a.address} : {}),
    ...(a.coord ? {coordinates:{latitude:a.coord[0],longitude:a.coord[1]}} : {}),
    photo: {src640: src,src1280: src,alt:a.alt,credit}
  };
});
