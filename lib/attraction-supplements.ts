/**
 * Attractions added after the Sanity migration, shown on the site now and independent of the dataset.
 *
 * Why this exists: once Sanity returns attractions, the website uses them instead of the local list (lib/content.ts).
 * A place written only in the repository would therefore never appear. A supplement is added only when the dataset has
 * NO attraction with the same slug, so the day an editor (or a seed run) creates the document in Studio, Sanity wins and
 * the supplement quietly steps aside. It is deliberately not part of the seed baseline (146 documents), so
 * `sanity:verify` keeps comparing like with like.
 *
 * Rules (same as lib/attraction-long-form.ts): every fact is stated by one of the cited sources and nothing is rounded up;
 * opening hours, prices and booking conditions are never stated; the photograph is one we already hold with its credit
 * (lib/photos.json), of the place itself. No tour, price or availability appears here: bookable products are loaded live
 * by the page and shown only when a provider really lists them.
 */
import { photos } from "./attractions";
import { longFormBodyFrom, type AttractionLongForm } from "./attraction-long-form";
import { textToBlocks } from "./portable-text";
import type { Attraction, AttractionHistory, Photo } from "./types";

type Def = {
  slug: string;
  name: string;
  category: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  sourceUrl: string;
  sourceLabel: string;
  checked: string;
  photoKey: string;
  notice?: string;
  relatedGuides: string[];
  seo: { title: string; description: string };
  longForm: AttractionLongForm;
  history: { intro: string; sections: { heading: string; paragraphs: string[] }[]; sources: { label: string; url: string }[] };
};

const WIKI = (title: string, label: string) => ({ label: `${label} (Wikipedia)`, url: `https://en.wikipedia.org/wiki/${title}` });
const CHECKED = "2026-11-05";

const defs: Def[] = [
  {
    slug: "memento-park",
    name: "Memento Park",
    category: "Museums",
    address: "1223 Budapest, XXII. district, Balatoni út – Szabadkai utca corner",
    coordinates: { latitude: 47.42671, longitude: 18.99990 },
    sourceUrl: "https://www.mementopark.hu/en/information/",
    sourceLabel: "Memento Park",
    checked: CHECKED,
    photoKey: "memento-park",
    relatedGuides: ["budapest-in-3-days", "getting-around-budapest"],
    seo: {
      title: "Memento Park: Budapest's statue park",
      description:
        "Memento Park is Budapest's open-air museum of Communist-era statues (1949–1989), opened in 1993. History, what to see and tickets or tours.",
    },
    longForm: {
      description:
        "An open-air museum on the south-western edge of Budapest that gathers monumental statues and plaques from Hungary's Communist period (1949–1989). It opened in 1993 and was designed by the architect Ákos Eleőd.",
      paragraphs: [
        "Memento Park (Szoborpark in Hungarian) is where Budapest brought the monuments of its Communist era after 1989. Statues and sculpted plaques from the period 1949–1989, among them figures of Lenin, Marx and Engels and of Hungarian Communist leaders, were removed from public places and gathered here, in the 22nd district, south-west of the city centre.",
        "The park was designed by the Hungarian architect Ákos Eleőd, who won the competition announced by the Budapest General Assembly in 1991. It opened as a public open-air museum on 29 June 1993, the second anniversary of the withdrawal of Soviet troops from Hungary. Its statue section is laid out in six oval areas and carries the name of a poem by Gyula Illyés, \"A Sentence About Tyranny\".",
        "Beside the main park, Witness Square holds a re-creation of the tribune of the Stalin monument with the broken bronze boots on top. The boots became a symbol of the 1956 Revolution after the statue was pulled from its pedestal; the 2006 structure is an artistic re-creation by Eleőd, not an exact copy of the original. The official site also lists a photo exhibition, a cinema in a barracks-style building and a warehouse exhibition.",
        "Memento Park is away from the centre, so it works best as its own trip. The official information page describes a public transport route, a private bus and a Trabant transfer, and states that free parking for cars and buses is available during opening hours.",
      ],
      tips: [
        "Plan it as a separate trip rather than a stop between central sights: the park is on the south-western edge of the city.",
        "Check the official information page for ticket conditions, opening days, the current ways to get there and guided tours before you travel; they change.",
        "Tickets and guided tours that are really listed by our booking partners appear on this page when available. Open a product for what is included.",
      ],
      sources: [
        { label: "Memento Park — official information (address, transport, parking)", url: "https://www.mementopark.hu/en/information/" },
        WIKI("Memento_Park", "Memento Park"),
      ],
      checked: CHECKED,
    },
    history: {
      intro:
        "Memento Park was created from the statues and monuments removed from Budapest's public places after the Communist regime ended in 1989.",
      sections: [
        {
          heading: "From removal to open-air museum",
          paragraphs: [
            "After the fall of the Communist regime in Hungary in 1989, many of the Communist statues and monuments were removed at once. They formed the basis of the collection now in the park.",
            "The Budapest General Assembly announced a competition in 1991, which the architect Ákos Eleőd won. The park opened to the public as an open-air museum on 29 June 1993, the second anniversary of the withdrawal of Soviet troops from Hungary.",
          ],
        },
        {
          heading: "Stalin's boots and Witness Square",
          paragraphs: [
            "In 2006 a life-sized re-creation of the tribune of the Stalin monument, with the broken bronze shoes on its pedestal, was built in the park. It is an artistic re-creation by Eleőd, not an accurate copy of the original.",
            "In 2007 a new exhibition hall and a small cinema opened in Witness Square. A photo exhibition there follows the history of the 1956 revolution, the political changes of 1989–1990 and the park itself, with captions in English and Hungarian.",
          ],
        },
      ],
      sources: [
        { label: "Memento Park — official information", url: "https://www.mementopark.hu/en/information/" },
        WIKI("Memento_Park", "Memento Park"),
      ],
    },
  },
  {
    slug: "godollo-royal-palace",
    name: "Royal Palace of Gödöllő",
    category: "Museums",
    address: "2100 Gödöllő, Grassalkovich Palace",
    coordinates: { latitude: 47.59611, longitude: 19.34778 },
    sourceUrl: "https://kiralyikastely.hu/en",
    sourceLabel: "Royal Palace of Gödöllő",
    checked: CHECKED,
    photoKey: "godollo-royal-palace",
    notice:
      "The operator's website announces a full rehabilitation programme for the palace and park, expected to take about nine years. Check the official website for which parts are open on your date before you travel.",
    relatedGuides: ["budapest-in-3-days", "getting-around-budapest"],
    seo: {
      title: "Royal Palace of Gödöllő, near Budapest",
      description:
        "The Royal Palace of Gödöllő, a Baroque palace about 30 km from Budapest, was a favourite home of Queen Elisabeth (Sisi). History and day-trip tours.",
    },
    longForm: {
      description:
        "A large Baroque palace in Gödöllő, north-east of Budapest, built for Count Antal Grassalkovich I in the 18th century. It became a royal residence after 1867 and is closely linked with Queen Elisabeth (Sisi), who loved staying there.",
      paragraphs: [
        "The Royal Palace of Gödöllő, also called the Grassalkovich Palace, is one of the largest monuments of Hungarian palace architecture. It was built for Count Antal Grassalkovich I (1694–1771), a confidant of Empress Maria Theresa. Construction began around 1733 under András Mayerhoffer, a builder from Salzburg who worked in the Baroque and Zopf styles. The palace has a double U shape and stands in a large park.",
        "After the Grassalkovich male line died out in 1841 the palace had several owners. In 1867 it was bought for the crown, and parliament designated it the resting residence of the King of Hungary, which it remained until 1918. Francis Joseph and later Charles IV and the royal family spent several months there every year. Queen Elisabeth especially loved staying in Gödöllő; she spoke Hungarian fluently, and after her death a memorial park was built beside the upper garden.",
        "Between the two world wars the palace was the residence of Regent Miklós Horthy. After 1945 it fell into decay, used by troops and as an old people's home. Protection of the building as a monument began in 1981, and a partial restoration reopened some of its rooms to visitors in 1996.",
        "The museum presents the history of the palace and a permanent exhibition on Queen Elisabeth's life, with her rooms, garden and veranda. The official website also lists the Baroque Theatre, the riding hall and stables, the Horthy bunker, the palace park and the palm house.",
      ],
      tips: [
        "Gödöllő lies about 30 km north-east of the outskirts of Budapest. Wikipedia notes that it can be reached by the suburban railway (HÉV) and by national rail; check the journey planner for today's times.",
        "The operator has announced a multi-year rehabilitation programme for the palace and park. Check the official website for which parts are open before you travel, and for ticket conditions.",
        "Day trips and entry tickets that are really listed by our booking partners appear on this page when available. Open a product for what is included.",
      ],
      sources: [
        { label: "Royal Palace of Gödöllő — official website", url: "https://kiralyikastely.hu/en" },
        WIKI("Royal_Palace_of_G%C3%B6d%C3%B6ll%C5%91", "Royal Palace of Gödöllő"),
        WIKI("G%C3%B6d%C3%B6ll%C5%91", "Gödöllő"),
      ],
      checked: CHECKED,
    },
    history: {
      intro:
        "The palace was begun around 1733 for Count Antal Grassalkovich I and became the resting residence of the King of Hungary after 1867.",
      sections: [
        {
          heading: "A Baroque country seat",
          paragraphs: [
            "Count Antal Grassalkovich I (1694–1771) was a Royal Septemvir, president of the Hungarian Chamber and a confidant of Empress Maria Theresa. He had the palace built under the direction of András Mayerhoffer, who worked in the Baroque and Zopf styles.",
            "The building was enlarged and altered during the 18th century. By the time of the third generation of the family it had eight wings and, besides the living quarters, a church, a theatre, a riding hall, a hothouse, a flower greenhouse and an orangery.",
          ],
        },
        {
          heading: "A royal residence",
          paragraphs: [
            "The male line of the Grassalkovich family died out in 1841. In 1867 the palace was bought for the crown, and a decision of parliament designated it the resting residence of the King of Hungary, a status it kept until 1918.",
            "Queen Elisabeth (1837–1898) loved staying in Gödöllő, where she could converse in Hungarian. After her death a memorial park was built beside the upper garden.",
          ],
        },
        {
          heading: "Decay and restoration",
          paragraphs: [
            "Between the two world wars the palace was the residence of Regent Miklós Horthy. After 1945 it was used by Soviet and Hungarian troops and partly as an old people's home, and it fell into decay.",
            "Protection as a historical monument began in 1981. According to the palace's own history, a partial renovation begun in 1995 opened some rooms to the public in 1996.",
          ],
        },
      ],
      sources: [
        { label: "Royal Palace of Gödöllő — official website", url: "https://kiralyikastely.hu/en" },
        WIKI("Royal_Palace_of_G%C3%B6d%C3%B6ll%C5%91", "Royal Palace of Gödöllő"),
      ],
    },
  },
  {
    slug: "szimpla-kert",
    name: "Szimpla Kert",
    category: "Nightlife",
    address: "Kazinczy utca 14, Budapest VII. district",
    coordinates: { latitude: 47.497, longitude: 19.0634 },
    sourceUrl: "https://szimpla.hu/info.html",
    sourceLabel: "Szimpla Kert",
    checked: CHECKED,
    photoKey: "g-nightlife",
    relatedGuides: ["budapest-bars-nightlife", "downtown-pest-walking-guide"],
    seo: {
      title: "Szimpla Kert: Budapest's original ruin bar",
      description:
        "Szimpla Kert in Budapest's Jewish Quarter pioneered the city's ruin bars. Its story, what to expect and where to find ruin-bar tours.",
    },
    longForm: {
      description:
        "Budapest's best-known ruin bar, in the Jewish Quarter. It opened in 2002, moved in 2004 to a building on Kazinczy Street that was due to be demolished, and is regarded as the pioneer of the city's ruin bars.",
      paragraphs: [
        "Szimpla Kert (\"simple garden\") is a ruin bar, a romkocsma in Hungarian, in the Jewish Quarter, in Budapest's 7th district. A ruin bar makes a bar out of a worn-out or abandoned building. Szimpla is considered the pioneer of the type, and it has grown from a place to find a cheap drink in a relaxed setting into a tourist attraction and community venue.",
        "The first Szimpla opened in 2002, a few blocks from where it is today. In 2004 the four owners moved it to 14 Kazinczy Street, a dilapidated area of former homes and a stove factory that was due to be demolished. The new site opened as Szimpla Kertmozi, using its large courtyard to show underground and indie films.",
        "Beyond the bar itself, Wikipedia lists film screenings, live music, an art gallery, the Kazinczy Living Library, the Szimpla Farmers' Market and a bicycle flea market among the activities held there. The venue publishes its own information and programme, which is the place to check what is on.",
      ],
      tips: [
        "Check the venue's own information page for current opening times, entry arrangements and events: they change, and nothing here is a ticket or a reservation.",
        "The bar stands in the same streets as the Kazinczy Street Orthodox Synagogue and the Dohány Street synagogue complex, so it combines well with a walk through the Jewish Quarter.",
        "People live in the surrounding streets, so keep noise down when you leave at night.",
      ],
      sources: [
        { label: "Szimpla Kert — official information and programme", url: "https://szimpla.hu/info.html" },
        WIKI("Szimpla_Kert", "Szimpla Kert"),
      ],
      checked: CHECKED,
    },
    history: {
      intro:
        "Szimpla Kert began as a small pub in 2002 and became the model for Budapest's ruin bars when its owners saved a building on Kazinczy Street from demolition.",
      sections: [
        {
          heading: "From a first pub to Kazinczy Street",
          paragraphs: [
            "Szimpla Kert is the first ruin pub to open in Budapest. It originally opened in 2002 in a location a few blocks from its present one, with the idea of a relaxed place to socialise and have a drink.",
            "In 2004 a dilapidated area at 14 Kazinczy Street, which had been homes and a stove factory, was set to be demolished. The four owners decided to save it and moved the pub there, because the building offered more space and the atmosphere they wanted. It opened as Szimpla Kertmozi (kertmozi means open-air cinema) because the large courtyard was used to watch underground and indie films.",
          ],
        },
        {
          heading: "A pub that became a community venue",
          paragraphs: [
            "The venue grew into a tourist attraction and community centre. Film showings, live music, an art gallery, the Kazinczy Living Library, the Szimpla Farmers' Market and the Szimpla Bringa bicycle flea market are among the activities held at the bar.",
          ],
        },
      ],
      sources: [
        { label: "Szimpla Kert — official information and programme", url: "https://szimpla.hu/info.html" },
        WIKI("Szimpla_Kert", "Szimpla Kert"),
      ],
    },
  },
];

function build(d: Def): Attraction {
  const photo = photos[d.photoKey] as Photo | undefined;
  const history: AttractionHistory = {
    intro: d.history.intro,
    sections: d.history.sections.map((s, i) => ({
      heading: s.heading,
      body: textToBlocks(s.paragraphs, undefined, `${d.slug}-h${i}`),
    })),
    stories: [],
    sources: d.history.sources,
  };
  return {
    id: d.slug,
    slug: d.slug,
    name: d.name,
    category: d.category,
    description: d.longForm.description,
    body: longFormBodyFrom(d.slug, d.longForm),
    sourceUrl: d.sourceUrl,
    sourceLabel: d.sourceLabel,
    checked: d.checked,
    address: d.address,
    coordinates: d.coordinates,
    notice: d.notice,
    photo,
    history,
    relatedGuides: d.relatedGuides,
    seo: d.seo,
  };
}

export const supplementAttractions: Attraction[] = defs.map(build);

/**
 * The dataset's attractions plus every supplement the dataset does not have yet (matched by slug). A slug present in
 * the dataset always wins, so Studio edits and a later seed run take over without any change here.
 */
export function withSupplements(attractions: Attraction[]): Attraction[] {
  const have = new Set(attractions.map((a) => a.slug));
  return [...attractions, ...supplementAttractions.filter((s) => !have.has(s.slug))];
}
