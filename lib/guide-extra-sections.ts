import type { GuideSection } from "./guides";

/**
 * Additional sections appended to existing guides (lib/guides.ts assembles them). Every figure and date is
 * stated by the sources named in docs/RELEASE_STATUS.md and lib/attraction-long-form.ts; opening hours, prices
 * and booking conditions are never stated here, and the text points to the official source instead.
 */
export const guideExtraSections: Record<string, GuideSection[]> = {
  "budapest-in-3-days": [
    {
      id: "landmarks-at-a-glance",
      title: "The landmarks on this route, at a glance",
      paragraphs: [
        "A few facts help you pace the three days. The Hungarian Parliament was begun in 1885, inaugurated in 1896 for the millennium celebrations and completed in 1904; you see its interior on a guided visit arranged through the official visitor centre. St. Stephen's Basilica is 96 metres tall, as tall as Parliament, and its dome can be reached by lift or by 364 steps.",
        "Heroes' Square marks the thousandth anniversary of the Magyar settlement: the Millennium Monument was begun in 1896 and inaugurated in 1905. Széchenyi Thermal Bath opened in June 1913 and is fed by two thermal springs, one at 74 °C and one at 77 °C. The Great Market Hall at Fővám tér opened on 15 February 1897.",
      ],
      bullets: [
        "Parliament: arrange a guided visit through the official visitor centre before you travel.",
        "Basilica: the dome is a separate ticket from the church; check the current options.",
        "Széchenyi: the nearest Metro line 1 stop is Széchenyi fürdő, beside the entrance.",
      ],
    },
  ],
  "budapest-thermal-baths": [
    {
      id: "bath-history",
      title: "Where these baths come from",
      paragraphs: [
        "Budapest's bathing culture is older than any of the buildings you will visit. The Rudas Baths were founded in 1571 or 1572 under Ottoman rule, commissioned by Sokollu Mustafa Pasha, and still keep an Ottoman dome and an octagonal pool. The Lukács Baths say that thermal baths have been used on their site since at least the twelfth century, reportedly by the Knights Hospitallers.",
        "The two best-known buildings are much younger. The Széchenyi Thermal Bath opened in June 1913 in a neo-Baroque palace designed by Győző Czigler, and the Gellért Thermal Bath was built between 1912 and 1918 in the Secession (Art Nouveau) style, together with its hotel. Gellért is reported to be closed for refurbishment, so confirm its status before you plan around it.",
      ],
    },
  ],
  "buda-castle-district": [
    {
      id: "castle-hill-timeline",
      title: "Castle Hill in a few dates",
      paragraphs: [
        "The first royal residence on Castle Hill was built between 1247 and 1265 under Béla IV. Matthias Corvinus rebuilt the palace in an early Renaissance style after his marriage to Beatrice of Naples in 1476. Buda fell to the Ottomans in 1541, and the siege that ended Ottoman rule in 1686 destroyed the medieval palace. A Baroque palace was finished in 1769, the Royal Palace was officially inaugurated in 1912, and the siege of 1944–45 left it in ruins before the post-war reconstruction of 1952–1966. The Castle Quarter was inscribed on the UNESCO World Heritage List in 1987.",
        "Two small stops reward a detour. The Vienna Gate at the northern end of the district was rebuilt in 1936, to a design by Jenő Kismarty-Lechner, to mark the 250th anniversary of the recapture of Buda. And at the bottom of the hill, at Clark Ádám tér beside the Chain Bridge, stands the Zero Kilometre Stone, a three-metre limestone sculpture by Miklós Borsos erected in 1975.",
      ],
    },
  ],
  "danube-cruises": [
    {
      id: "what-you-see-from-the-water",
      title: "What you can expect to see from the water",
      paragraphs: [
        "Most central routes pass the same set of landmarks, but confirm on your booking which ones your boat actually passes. On the Pest bank, the Hungarian Parliament is about 268 metres long and 96 metres high. On Castle Hill across the river, the Royal Palace, first built between 1247 and 1265, now houses the Hungarian National Gallery, the Budapest History Museum and the National Széchényi Library, with Matthias Church and Fisherman's Bastion (built 1895–1902) above the embankment.",
        "Margaret Island, about 2.5 kilometres long, lies between Margaret Bridge and Árpád Bridge, and routes that go that far north or south may show it. Daytime cruises show detail and colour; evening cruises show the illuminated buildings: choose by the view you most want.",
      ],
    },
  ],
  "downtown-pest-walking-guide": [
    {
      id: "stops-with-a-story",
      title: "Three stops with a story",
      paragraphs: [
        "St. Stephen's Basilica took fifty-four years to build, from 1851, and is 96 metres tall. It was given the title of basilica minor in 1931. The Dohány Street Synagogue was built between 1854 and 1859 and is described as the largest synagogue in Europe, with seating for about 3,000 people; the Raoul Wallenberg Holocaust Memorial Park lies behind it, and the Heroes' Temple and the Jewish Museum belong to the same complex.",
        "The House of Terror at Andrássy út 60 opened as a museum on 24 February 2002. It is a memorial to the victims of the fascist and communist regimes in 20th-century Hungary, in a building used by both the Arrow Cross and the ÁVH, and some displays are disturbing. Check the opening arrangements of all three before you plan the day, and allow time rather than rushing the memorials.",
      ],
    },
  ],
};
