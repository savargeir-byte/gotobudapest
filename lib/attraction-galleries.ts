import { photos } from "./attractions";

export type GalleryImage = {
  key: string;
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  sanityAssetId?: string;
};

type GallerySeed = {
  key: string;
  photoKey?: string;
  src?: string;
  alt?: string;
  caption: string;
  author?: string;
  license?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  sanityAssetId?: string;
};

const commonsLicense = "https://creativecommons.org/licenses/by-sa/4.0";

/** Museum-provided photographs, checked on Commons and imported into the project's Sanity asset library. */
const hospitalInTheRock: GallerySeed[] = [
  {
    key: "hospital-entrance",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/963dad1a18d7d65313322e354158ec58acf0c515-1280x720.jpg",
    alt: "Entrance to the Hospital in the Rock Nuclear Bunker Museum beneath Budapest Castle Hill",
    caption: "The museum entrance beneath Buda Castle.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_M%C3%BAzeum_bej%C3%A1rata.jpg",
    sanityAssetId: "image-963dad1a18d7d65313322e354158ec58acf0c515-1280x720-jpg",
  },
  {
    key: "hospital-ward",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/bb99e00d9056433f4abc09a2e305e16b99496261-1280x720.jpg",
    alt: "Recreated ward with hospital beds inside the Hospital in the Rock museum",
    caption: "Ward III, recreated as part of the museum's wartime medical exhibition.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:III._sz._k%C3%B3rterem.jpg",
    sanityAssetId: "image-bb99e00d9056433f4abc09a2e305e16b99496261-1280x720-jpg",
  },
  {
    key: "hospital-operating-room",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/fa436d6d8c15caad6db80877fb2230373b58d893-750x600.jpg",
    alt: "Historic surgical operating room display inside Hospital in the Rock",
    caption: "The underground hospital's operating theatre display.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:M%C5%B1t%C5%91.jpg",
    sanityAssetId: "image-fa436d6d8c15caad6db80877fb2230373b58d893-750x600-jpg",
  },
  {
    key: "hospital-doctor",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/4a63354ac40d5ea1e09a0a38029d194d952e134a-1280x850.jpg",
    alt: "Exhibition recreating a military doctor treating a wounded patient in the Hospital in the Rock",
    caption: "The military medicine exhibition brings wartime emergency treatment to life.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Katonaorvos_%C3%A9s_sebes%C3%BClt.jpg",
    sanityAssetId: "image-4a63354ac40d5ea1e09a0a38029d194d952e134a-1280x850-jpg",
  },
  {
    key: "hospital-civil-defence",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/8169b797d62fba4e93498e93bac86459db44d360-1280x853.jpg",
    alt: "Cold War civil defence exhibition inside the Hospital in the Rock bunker",
    caption: "Civil-defence equipment recalls the bunker’s Cold War role.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Polg%C3%A1ri_v%C3%A9delmi_ki%C3%A1ll%C3%ADt%C3%A1s.jpg",
    sanityAssetId: "image-8169b797d62fba4e93498e93bac86459db44d360-1280x853-jpg",
  },
  {
    key: "hospital-nuclear-exhibit",
    src: "https://cdn.sanity.io/images/ut6qxuke/production/e13daff500a6d4e40082dd9e3b8836eef4785445-1280x855.png",
    alt: "Display on atomic warfare at the Hospital in the Rock Nuclear Bunker Museum",
    caption: "A museum display examines the fears and consequences of nuclear warfare.",
    author: "Hospital in the Rock Marketing",
    license: "CC BY-SA 4.0",
    licenseUrl: commonsLicense,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Atombomba_ki%C3%A1ll%C3%ADt%C3%A1s.png",
    sanityAssetId: "image-e13daff500a6d4e40082dd9e3b8836eef4785445-1280x855-png",
  },
];

const gallerySeeds: Record<string, GallerySeed[]> = {
  "hospital-in-the-rock": hospitalInTheRock,
  "fishermans-bastion": [
    { key: "bastion", photoKey: "fishermans-bastion", caption: "The towers and arches of Fisherman's Bastion." },
    { key: "matthias", photoKey: "matthias-church", caption: "Matthias Church, immediately beside the bastion." },
    { key: "square", photoKey: "trinity-square", caption: "Trinity Square links the church and the surrounding Castle District." },
  ],
  "matthias-church": [
    { key: "matthias", photoKey: "matthias-church", caption: "The historic church and its Gothic tower." },
    { key: "trinity", photoKey: "trinity-square", caption: "Trinity Square and the church's striking roofline." },
    { key: "bastion", photoKey: "fishermans-bastion", caption: "The neighbouring Fisherman's Bastion on Castle Hill." },
  ],
  "buda-castle-district": [
    { key: "castle", photoKey: "buda-castle-district", caption: "Aerial view of the Buda Castle palace district." },
    { key: "bastion", photoKey: "fishermans-bastion", caption: "Fisherman's Bastion and the surrounding fortified streets." },
    { key: "promenade", photoKey: "toth-arpad-promenade", caption: "A quieter stroll along Tóth Árpád Promenade." },
  ],
  "szechenyi-thermal-bath": [
    { key: "exterior", photoKey: "szechenyi-thermal-bath", caption: "The Széchenyi bath complex in City Park." },
    { key: "pools", photoKey: "szechenyi-thermal-bath-pools", caption: "The famous outdoor bathing pools." },
    { key: "bathers", photoKey: "g-bath-inside", caption: "Bathers enjoying the Széchenyi outdoor pools." },
  ],
  "hungarian-parliament": [
    { key: "front", photoKey: "hungarian-parliament", caption: "The Parliament facade seen from the opposite bank." },
    { key: "cruise", photoKey: "g-cruise", caption: "A sightseeing boat on the river in front of Parliament." },
    { key: "bridge-view", photoKey: "g-skyline", caption: "The central Danube skyline places Parliament in context." },
  ],
  "chain-bridge": [
    { key: "bridge", photoKey: "chain-bridge", caption: "The bridge's stone gateways and suspension chains." },
    { key: "night", photoKey: "g-nightview", caption: "Chain Bridge illuminated after sunset." },
    { key: "river", photoKey: "g-skyline", caption: "Views of the bridge within the wider Danube skyline." },
  ],
  "great-market-hall": [
    { key: "hall", photoKey: "great-market-hall", caption: "The historic Market Hall's exterior and tiled roof." },
    { key: "stalls", photoKey: "g-market", caption: "Inside the market, beneath the iron roof." },
    { key: "food", photoKey: "g-langos", caption: "Lángos is a popular Hungarian food, shown here as a related dish rather than a specific market stall." },
  ],
  "cafe-gerbeaud": [
    { key: "outside", photoKey: "cafe-gerbeaud", caption: "Café Gerbeaud on Vörösmarty Square." },
    { key: "inside", photoKey: "g-cafe", caption: "Inside the historic Café Gerbeaud." },
  ],
  "gellert-thermal-bath": [
    { key: "building", photoKey: "gellert-thermal-bath", caption: "Gellért Bath's historic exterior. Closed for renovation." },
    { key: "hill", photoKey: "gellert-hill-citadella", caption: "Nearby Gellért Hill gives wider context for this part of Buda." },
  ],
  "margaret-island": [
    { key: "island", photoKey: "margaret-island", caption: "Paths and greenery on Margaret Island." },
    { key: "tower", photoKey: "margaret-island-water-tower", caption: "Margaret Island's historic Water Tower." },
  ],
  "buda-castle-funicular": [
    { key: "funicular", photoKey: "buda-castle-funicular", caption: "The historic funicular on its steep Castle Hill tracks." },
    { key: "palace", photoKey: "buda-castle-district", caption: "Castle Hill and its palace district at the top of the route." },
  ],
  "trinity-square": [
    { key: "square", photoKey: "trinity-square", caption: "The Holy Trinity Column and Matthias Church." },
    { key: "church", photoKey: "matthias-church", caption: "Matthias Church dominates one side of the square." },
  ],
};

function fromSeed(seed: GallerySeed): GalleryImage | undefined {
  if (seed.photoKey) {
    const photo = photos[seed.photoKey];
    if (!photo?.credit) return undefined;
    return {
      key: seed.key,
      src: photo.src1280,
      thumb: photo.src640,
      alt: photo.alt,
      caption: seed.caption,
      author: photo.credit.author,
      license: photo.credit.license,
      licenseUrl: photo.credit.licenseUrl,
      sourceUrl: photo.credit.sourceUrl,
    };
  }
  if (!seed.src || !seed.alt || !seed.author || !seed.license || !seed.licenseUrl || !seed.sourceUrl) return undefined;
  return {
    key: seed.key, src: seed.src, thumb: seed.src,
    alt: seed.alt, caption: seed.caption, author: seed.author,
    license: seed.license, licenseUrl: seed.licenseUrl,
    sourceUrl: seed.sourceUrl, sanityAssetId: seed.sanityAssetId,
  };
}


/** Additional, different-angle images for photographed sacred landmarks. */
const sacredGalleries: Record<string, GallerySeed[]> = {
  "st-elizabeth-church-roses-square": [
    {
      key:"elizabeth-church-facade",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/28b2e81266b9be19bf1f2ab7ee825cb942cf7d84-960x1280.jpg",
      alt:"The neo-Gothic facade and towers of Saint Elizabeth Church in Rózsák tere, Budapest",
      caption:"The church's neo-Gothic architecture above the Square of Roses.",
      author:"User:Pasztilla aka Attila Terbócs",license:"CC BY 2.5",licenseUrl:"https://creativecommons.org/licenses/by/2.5",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Szent_Erzsebet-templom_01.jpg"
    },
    {
      key:"elizabeth-church-details",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/4eb573b0bb63ce65ff19dcf82ee6b05f2532cf09-600x800.jpg",
      alt:"Another view of Saint Elizabeth Church's Gothic Revival architecture in Budapest",
      caption:"A closer look at the historic St Elizabeth church building.",
      author:"User:Pasztilla aka Attila Terbócs",license:"CC BY 2.5",licenseUrl:"https://creativecommons.org/licenses/by/2.5",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Szent_Erzsebet-templom_02.jpg"
    }
  ],
  "st-anne-church-batthyany-square": [
    {
      key:"st-anne-facade",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/5f91ab57f9532a9478c589610336710304f687c8-960x1449.jpg",
      alt:"Baroque facade of St Anne's Church on Batthyány Square, Budapest",
      caption:"St Anne's Church with its decorated Baroque facade.",
      author:"Yelkrokoyade",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Eglise_Sainte-Anne_Budapest.jpg"
    },
    {
      key:"st-anne-mist",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/1a7ad6dd5a9b8cafffd1871eafedfc4768fe4483-960x720.jpg",
      alt:"Historic St Anne's Church emerging through fog in Batthyány Square, Budapest",
      caption:"The church and square on a misty morning.",
      author:"Globetrotter19",license:"CC BY-SA 3.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Saint_Anne_church._Fog._-_Batthy%C3%A1ny_Square,_Budapest.JPG"
    }
  ],
  "inner-city-parish-church-assumption": [
    {
      key:"inner-city-portal",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/cbc9bcd335c0eaddebc2d73b48cb949216f01e0f-960x1516.jpg",
      alt:"Historic stone entrance portal of Budapest's Inner City Parish Church",
      caption:"Architectural detail at the Inner City Parish Church entrance.",
      author:"Dguendel",license:"CC BY 4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Budapest,_the_Inner_City_Parish_Church,_portal.jpg"
    },
    {
      key:"inner-city-altar",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/5dd1b08d6843add0e7e118968d00a8936d5f26ab-960x680.jpg",
      alt:"Choir and main altar in the historic Inner City Parish Church of the Assumption, Budapest",
      caption:"The choir and altar reveal layers of church history inside.",
      author:"Dguendel",license:"CC BY 4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Budapest,_the_Inner_City_Parish_Church,_choir_and_main_altar.jpg"
    }
  ],
  "rumbach-street-synagogue": [
    {
      key:"rumbach-hall-one",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/faf77b658cf60de6f5c8d0a21a3660912706cb97-960x720.jpg",
      alt:"The richly decorated octagonal interior of Rumbach Street Synagogue",
      caption:"The restored octagonal prayer hall at Rumbach Street Synagogue.",
      author:"יעקב",license:"CC0",licenseUrl:"http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Rumbach_Street_Synagogue-interior3414.jpg"
    },
    {
      key:"rumbach-hall-two",
      src:"https://cdn.sanity.io/images/ut6qxuke/production/ed5adc73084f294322df085f9d62232ff74903b8-960x720.jpg",
      alt:"Another architectural view inside Budapest's Rumbach Street Synagogue",
      caption:"A second angle on the sanctuary's colourful decorative scheme.",
      author:"יעקב",license:"CC0",licenseUrl:"http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      sourceUrl:"https://commons.wikimedia.org/wiki/File:Rumbach_Street_Synagogue-interior_3420.jpg"
    }
  ]
};

export function attractionGallery(slug: string): GalleryImage[] {
  return (gallerySeeds[slug] || sacredGalleries[slug] || []).map(fromSeed).filter((photo): photo is GalleryImage => Boolean(photo));
}
