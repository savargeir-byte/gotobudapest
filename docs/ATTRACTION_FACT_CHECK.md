# Attraction fact-check (T-013)

Claim-by-claim check of all 116 attraction pages. Phase 17 (2026-11-02) checked every claim; Phase 18 (2026-11-02) resolved the claims that stayed uncertain and added coordinates and addresses. The checks were made by model-based researchers who opened the cited pages or named the search result they used; **no human editor has signed this off**. The evidence URL of every claim is in `docs/fact-check/attraction-fact-check.json`. A valid URL or a passing structural test does not make a claim true, and a claim that was softened or removed is not counted as verified.

| Attraction status | Attractions | Meaning |
| --- | --- | --- |
| VERIFIED | 36 | every checked claim supported as written |
| CORRECTED | 61 | errors or unsupported claims were fixed or removed in the content source; nothing open remains |
| UNCERTAIN | 19 | at least one claim is still unconfirmed or is kept only with an attribution or caveat in the text |
| BLOCKED | 0 | no reliable evidence reachable |

| Claim finding | Claims |
| --- | --- |
| VERIFIED | 1326 |
| CORRECTED | 147 |
| REMOVED | 11 |
| QUALIFIED | 13 |
| UNCERTAIN | 14 |
| BLOCKED | 0 |

1511 claims in total; 212 text, address and coordinate corrections recorded and applied to the content sources. REMOVED: the claim was deleted because no support was found. QUALIFIED: the claim stays, worded with an explicit attribution or caveat.

Limits: official pages were often unreadable to the checkers (Parliament sites show a CAPTCHA, UNESCO returns 403, budapestinfo.hu pages return only a title). Claims that rest on Wikipedia alone or on a search excerpt are marked in the JSON note and listed below. Whether a venue is open today is deliberately not stated on the site and was not verified.

## Phase 18: the six attractions that stayed uncertain

### City Park Ice Rink (`city-park-ice-rink`) — UNCERTAIN

The completion year of the Francsek main building is 1895 per the rink's own history page, Hungarian Wikipedia (rink and Korcsolyacsarnok articles), budapestcity.org and Octogon; 1893 survives only in English Wikipedia and a 2012 blog. Text changed from 1893 to 1895 with attribution and a note that some sources give 1893; the 1909 'world championships' claim and the 'stable building' wording were also corrected.

### Franz Liszt Memorial Museum and Research Centre (`franz-liszt-memorial-museum-and-research-centre`) — CORRECTED

The desk and the donations are now supported by the museum's own documents: a Ludwig Bösendorfer desk whose pull-out three-octave keyboard replaces the middle drawer, and named relatives and pupils who gave memorabilia (not 'friends'). Two further problems were found and fixed: the Academy taught in this building from 1879, not late 1875 (the museum's About page contradicts its own news page), and an unsupported interpretive sentence in the history section was replaced with the documented permanent and temporary exhibitions.

### Hungarian Natural History Museum (`hungarian-natural-history-museum`) — UNCERTAIN

The riding hall, Alfa cinema and 1992 fire sequence is now supported by two independent Hungarian secondary sources (Hungarian Wikipedia, whose museum and Ludovika articles both state it, and a welovebudapest cinema-history article), but no museum, Ludovika University or archive primary source could be opened, so the sentence is rewritten with attribution and the 1990 closure versus 1992 fire nuance. Address and coordinates are fine; all other history claims were verified.

### Millenáris Park (`millenaris-park`) — UNCERTAIN

The Széllkapu view claim is stated verbatim by the official Millenáris about-us page, so it is kept but now attributed to the official site and worded as 'towards' (not 'over'), because no independent source lists the landmarks. The address field held only a name and now has the official street address; coordinates are confirmed.

### Rumbach Street Synagogue (`rumbach-street-synagogue`) — UNCERTAIN

Hungarian Wikipedia (and a tourism site that appears to copy it) does state greyish-yellow plaster, red brick stripes, blue enamelled bricks, lotus carvings and the Jachin/Boaz symbolism, but English Wikipedia, CJA and the building's official/heritage pages do not repeat them, and other visitor descriptions give a different palette (cream, red and green; red and yellow brick bands); the text is now attributed and hedged. Address 11-13, coordinates and the current-use statement are confirmed.

### Szamos Chocolate Museum (`szamos-chocolate-museum`) — UNCERTAIN

The official Szamos site (szamos.hu/csokolademuzeum) lists the Chocolate Museum at Kossuth Lajos ter 10, upper floor of Szamos Cafe, with online-booked guided tours; an independent guide dated 8 Oct 2026 describes it as operating. The official page itself is undated, so the text says it is listed and asks visitors to check current details. Coordinates moved to the OSM node for the museum (about 65 m from the old point); the 2017/2020-only wording, the 80 kg marzipan figure and the 'make your own bar' claim were replaced with official-site wording.

## Per attraction

| Attraction | Status | Claims | Corrections | Summary |
| --- | --- | --- | --- | --- |
| Andrássy Avenue (`andrassy-avenue`) | UNCERTAIN | 14 | 4 | Core dates, UNESCO listing, metro and street renamings check out; the 1885 naming year was qualified (sources say 1885 or 1886) and the unsupported 'financed b… |
| Aquaworld Resort Budapest (`aquaworld-resort-budapest`) | CORRECTED | 11 | 2 | Opening date, dome size, hotel size, slide numbers and transport match Polin and Just Budapest, but the '17-metre slide tower' misreads the source, which says … |
| Aquincum Museum (`aquincum-museum`) | CORRECTED | 12 | 4 | Roman history, 1894 opening, water organ and WWII damage are supported; the 'more than a million objects' figure belongs to the Budapest History Museum, not Aq… |
| Armenian Catholic Church — Újbuda (`armenian-catholic-church-ujbuda`) | CORRECTED | 10 | 2 | Facts are supported by the Budapest City Archives study, NCRegister and Commons; the 'second family' quotation misrepresents the source ('first family') and wa… |
| Bartók Béla Boulevard (`bartok-bela-boulevard`) | CORRECTED | 10 | 1 | Street names, dates, transport history and venues match Hungarian Wikipedia and We Love Budapest, but the claim that Bartók left Hungary after the First World … |
| Buda Castle District (`buda-castle-district`) | CORRECTED | 14 | 2 | Medieval and 19th-century palace history verified; the 1952-1966 reconstruction dates and 'medieval fortifications rebuilt' were unsupported and reworded. Phas… |
| Buda Castle Funicular (`buda-castle-funicular`) | VERIFIED | 10 | 0 | Technical data, chronology and ownership claims all match Wikipedia, Industrial Heritage Hungary and BKV; the 1986 date conflict is already handled by giving o… |
| Budapest Gallery (`budapest-gallery`) | VERIFIED | 8 | 0 | Institutional history, address, Bear House building history, Patzay display and Varga Collection all supported by Hungarian Wikipedia, museum.hu and My Art Gui… |
| Budapest History Museum — Castle Museum (`budapest-history-museum`) | CORRECTED | 18 | 6 | Core facts (Building E, Lion Courtyard, Gothic Hall, 1974 sculpture find, 1887/1967 dates) verified; one unsupported claim (reconstructed facade in King's Cell… |
| Budapest Music Center (`budapest-music-center`) | VERIFIED | 10 | 0 | Founding, BMC Records, library figures, building history, architects and the jazz club/hall acoustics all match BMC's own site and the Graphisoft case study. |
| Budapest Zoo & Botanical Garden (`budapest-zoo-botanical-garden`) | CORRECTED | 18 | 3 | Zoo history, dates, architects and WWII facts match the zoo's own history page, but the Lorenz/Goodall/Bluebeard story could not be confirmed anywhere and was … |
| Café Gerbeaud (`cafe-gerbeaud`) | CORRECTED | 17 | 2 | Dates, people and interior claims match the official timeline and Wikipedia; 'Swiss-trained' was wrong (Gerbeaud was born in Geneva and trained in many capital… |
| Castle Garden Bazaar (`castle-garden-bazaar`) | UNCERTAIN | 15 | 3 | Ybl, 1875-1883, Youth Park, restoration dates and 2014 reopening are confirmed, but the claim of cannonballs dating from the 1686 recapture is unsupported and … |
| Cave Church (`cave-church`) | CORRECTED | 16 | 8 | Long-form text is mostly supported and already notes source differences, but the description and history sections stated closure and reopening dates too firmly… |
| Chain Bridge (`chain-bridge`) | VERIFIED | 12 | 0 | All checked dates, names, dimensions and the tongue legend match Wikipedia, the Adam Clark article and budapest.com; coordinates match OSM. |
| Children’s Railway (`childrens-railway`) | VERIFIED | 9 | 0 | Gauge, length (with the 11.2/11.7 discrepancy flagged), dates, ages, Guinness 2015, stops and tunnel all match Wikipedia, We Love Budapest and Daily News Hunga… |
| Cinema Mystica Budapest (`cinema-mystica`) | CORRECTED | 10 | 1 | Venue, installations, anniversary figures and Parisi Udvar architecture check out; the monument-date and chronology of the arcade emptying were qualified or co… |
| City Park Boating Lake (`city-park-boating-lake`) | CORRECTED | 11 | 1 | Fleet counts, lake size, events, the lake's origin and the seasonal rink cycle are all supported by the cited sources; the operator is correctly left unnamed. |
| City Park Ice Rink (`city-park-ice-rink`) | UNCERTAIN | 21 | 2 | Almost every date and figure matches Wikipedia, but the completion year of the Francsek main building is unresolved (1893 vs 1894/1895); the text already quali… |
| City Park (Városliget) (`city-park-varosliget`) | UNCERTAIN | 12 | 3 | Park history, Vajdahunyad Castle, institutions and Liget Budapest openings are supported; the park's size was qualified because sources give 970 m (Wikipedia) … |
| Clark Ádám Square and the 0 km Stone (`clark-adam-square-and-the-0-km-stone`) | UNCERTAIN | 16 | 5 | Core facts (names, 1912 renaming, Borsos 1975, 3 m limestone) verified; the fate of the 1932 Madonna and the demolition date of the Ybl savings-bank building w… |
| Deák Square Lutheran Church (`deak-square-lutheran-church`) | VERIFIED | 10 | 0 | Architect, dates, façade, interior furnishings, courtyard reliefs and history all match Hungarian Wikipedia and We Love Budapest. |
| Dohány Street Synagogue (`dohany-street-synagogue`) | CORRECTED | 16 | 2 | Dates, size, memorial and complex details verified on Wikipedia; one wording fix because Wikipedia says Feszl only partly designed the interior. Phase 18: The … |
| Ferenc Hopp Museum of Asiatic Arts (`ferenc-hopp-museum-of-asiatic-arts`) | CORRECTED | 12 | 1 | Biography, bequest, collection history and garden verified; the claim that Hopp's will required an associated research institute is unsupported and was removed. |
| Fisherman’s Bastion (`fishermans-bastion`) | UNCERTAIN | 14 | 3 | Construction dates, architect, towers tradition and name origin check out, but the coordinates were about 520 m too far north and the statue's unveiling date (… |
| Fradi Museum (`fradi-museum`) | CORRECTED | 10 | 1 | Club, stadium and museum facts check out against Wikipedia, Fradi.hu and We Love Budapest, except the claim that Stadion Albert Flórián was 'used from 1974 to … |
| Franz Liszt Memorial Museum and Research Centre (`franz-liszt-memorial-museum-and-research-centre`) | CORRECTED | 23 | 4 | Core facts (apartment 1881-1886, Old Academy 1875-1907, 1986 opening, instruments, 1925 memorial room) verified on the museum's own site; two minor details (ke… |
| Garden of Philosophers (`garden-of-philosophers`) | CORRECTED | 15 | 5 | Figures, location, Wagner biography, 2001 unveiling, widow's gift and 2006-07 thefts are supported; the unsourced 'Gellért Hill reservoir' detail was removed. … |
| Gellért Hill & Citadella (`gellert-hill-citadella`) | UNCERTAIN | 15 | 3 | Hill, Citadella, Liberty Statue and Cave Church claims match Wikipedia; one unsupported tip claim ('visit in daylight') attributed to a guide was removed, and … |
| Gellért Thermal Bath (`gellert-thermal-bath`) | CORRECTED | 13 | 2 | Opening date, expansions, historical background and the closure (since 1 October 2025, reopening planned 2028) are supported; the minor detail of the bombed wo… |
| Goldberger Textile Collection (`goldberger-textile-collection`) | UNCERTAIN | 11 | 4 | Company history and Leo Goldberger dates are verified against Wikipedia; the Tamási slipper-workshop end date conflicts between sources, the floors detail was … |
| Great Market Hall (`great-market-hall`) | CORRECTED | 14 | 1 | Identity, architect, opening date, Zsolnay roof and FIABCI award are supported, but the reopening year is disputed (1994 vs 1997) so it was qualified. Phase 18… |
| Gresham Palace (`gresham-palace`) | VERIFIED | 13 | 0 | Architects, dates, decoration makers, wartime use, restoration and ownership history all match Wikipedia and We Love Budapest; address and coordinates confirme… |
| Heroes’ Square (`heroes-square`) | VERIFIED | 13 | 0 | Monument dates, sculptors, political changes, Memorial Stone and UNESCO details all match Wikipedia, Visit Hungary and Liget Budapest; coordinates match OSM. |
| Holy Family Church — Terézváros (`holy-family-church-terezvaros`) | VERIFIED | 12 | 0 | All checked dates, names and events are supported by the FSZEK page and Hungarian Wikipedia; only source attribution in the prose is loose. |
| Hospital in the Rock (`hospital-in-the-rock`) | CORRECTED | 19 | 1 | Nearly all dates, names and figures match the museum's own history page; the closure month differs between sources (July vs June 1945) and is now qualified. Ph… |
| House of Music Hungary (`house-of-music-hungary`) | UNCERTAIN | 12 | 0 | Design, opening, roof, spaces and programme claims match Archinect, Apollo and Liget Budapest; the address and coordinates match OSM. |
| House of Terror Museum (`house-of-terror-museum`) | VERIFIED | 12 | 0 | Dates, architect, building history, outdoor and basement displays and the criticism are all supported by the museum's page and Wikipedia. Phase 18: Andrássy Av… |
| House of Unicum (`house-of-unicum`) | VERIFIED | 10 | 0 | Exhibition content, company history, legend wording and dates are supported by muzej.hu, We Love Budapest, McDaniel College and Wikipedia. |
| Hungarian Academy of Sciences (`hungarian-academy-of-sciences`) | CORRECTED | 14 | 1 | Founding, architect, dates, sculpture programme and address are confirmed by the Academy's own page, but the Holló relief and Schickedanz vault statements were… |
| Hungarian Agricultural Museum and Library (`hungarian-agricultural-museum-and-library`) | CORRECTED | 13 | 1 | Castle, founding and rebuilding chronology verified against hu/en Wikipedia; the description wrongly implies the museum has been housed in the castle since 189… |
| Hungarian Heritage House (`hungarian-heritage-house`) | CORRECTED | 14 | 3 | Building, dates, architects, 2001 founding, 1972 dance house and ensemble facts are verified; one sentence listing activities (festival co-partnering, concert … |
| Hungarian Jewish Museum and Archives (`hungarian-jewish-museum-and-archives`) | CORRECTED | 12 | 3 | Core history, architects, 1942 rescue and 2014 reunification are verified; the address field gave the Wesselény visitor-entrance street rather than the officia… |
| Hungarian Museum of Trade and Tourism (`hungarian-museum-of-trade-and-tourism`) | VERIFIED | 9 | 0 | Founding, former Fortuna Inn home, exhibitions, Krudy rooms, collections and address all matched the museum.hu pages and 5 Perc Angol article. |
| Hungarian National Gallery (`hungarian-national-gallery`) | UNCERTAIN | 14 | 1 | Founding, move, palace chronology and crypt facts are supported by the gallery's page and Wikipedia; the Munkácsy work claim was narrowed and the 2012 merger i… |
| Hungarian National Museum (`hungarian-national-museum`) | CORRECTED | 16 | 6 | Founding history, building, institutional changes and permanent displays are supported, but the museum's own page says Petőfi did not recite the Nemzeti dal on… |
| Hungarian Natural History Museum (`hungarian-natural-history-museum`) | UNCERTAIN | 21 | 2 | History, address and coordinates verified, but the riding-hall/Alfa Cinema/1992 fire sentence rests on a single secondary source and was left flagged. Phase 18… |
| Hungarian Parliament (`hungarian-parliament`) | CORRECTED | 11 | 2 | Architecture, dimensions and Holy Crown facts verified; the 1902 'regular sittings' claim and Steindl's death 'shortly before inauguration' were unsupported an… |
| Hungarian Railway History Park (`hungarian-railway-history-park`) | CORRECTED | 11 | 2 | Text claims verified against Wikipedia (en/hu), but the address field was a placeholder and the coordinates sit about 170-190 m from the Wikipedia/OSM position… |
| Hungarian State Opera (`hungarian-state-opera`) | CORRECTED | 18 | 5 | Most facts verified, but the royal box statue location, the details of the 2017-2022 restoration, and one unsourced history sentence were corrected or removed.… |
| IKONO Budapest (`ikono-budapest`) | CORRECTED | 12 | 1 | Address field was just the venue name and was corrected to Vaci utca 27; network, opening and artist claims check out, with 'mirror maze' only lightly supporte… |
| Inner City Parish Church of the Assumption (`inner-city-parish-church-assumption`) | CORRECTED | 11 | 1 | Nearly all claims check out; the 1867 oath sequence is contested (parish says before the coronation, Visit Hungary says after) so the long-form sentence was qu… |
| Kazinczy Street Orthodox Synagogue (`kazinczy-street-orthodox-synagogue`) | UNCERTAIN | 17 | 4 | Main facts are well supported, but the 1913 facade change is described as plainer in Hungarian Wikipedia and as more ornate in English Wikipedia, so it was qua… |
| Kiscelli Museum (`kiscelli-museum`) | CORRECTED | 12 | 3 | Building history, address and collections largely verified; dissolution year and Schmidt purchase year qualified because sources differ, and a mis-attributed t… |
| Kopaszi-gát (`kopaszi-gat`) | VERIFIED | 11 | 0 | Dam dates, flood figures, Konstantinápoly Budapesten, lake filling, 2006 redevelopment, BudaPart and MOL Campus facts all match the cited sources. |
| Kunsthalle (`kunsthalle`) | CORRECTED | 15 | 1 | Core facts (1877 founding, 1896 building, Schickedanz/Herczog attribution, apse, 1995 renovation, address) check out; an unsupported Capa Center branch claim a… |
| Light Art Museum (LAM) (`light-art-museum-lam`) | UNCERTAIN | 12 | 4 | Building facts are verified, but the closure notice is outdated: an October 2026 article and the museum's own site show the museum open with a new exhibition, … |
| Liszt Ferenc Academy of Music (`liszt-ferenc-academy-of-music`) | VERIFIED | 13 | 0 | Founding, architects, 1907 move, decoration, teachers, 2015 Grand Prix and address/coordinates all check out against Wikipedia, Visit Hungary, European Heritag… |
| Ludwig Museum (`ludwig-museum`) | CORRECTED | 16 | 4 | Founding chronology, space and NFT claims check out against the museum's own pages; two over-specific claims (chocolate business wording, named pop-art works) … |
| Lukács Thermal Bath (`lukacs-thermal-bath`) | CORRECTED | 19 | 6 | The address field holds a website instead of a street address, the 'present bath dates from the 1880s' wording overstates, and the tram tip (Zsigmond tér) is u… |
| Lupa Beach (`lupa-beach`) | CORRECTED | 7 | 2 | Quarry origin, Gerendai, the 2016 opening and 2017 expansion are supported, but 'northern edge of Budakalász' misplaces the lake (it lies in Budakalász just no… |
| Madame Tussauds Budapest (`madame-tussauds-budapest`) | CORRECTED | 12 | 3 | Opening date, size, address, craftsmanship and Wurm House facts check out; the 1835 'first exhibition' claim was imprecise and the 'other sites lack' claim uns… |
| Mai Manó House (`mai-mano-house`) | CORRECTED | 15 | 1 | Building history, architects, Mai biography and operator are supported by the official site and library page; the post-war school, showroom and Car Club senten… |
| Margaret Island (`margaret-island`) | UNCERTAIN | 13 | 0 | Size, formation from three islands, naming, car restrictions, running track and landmarks all match Wikipedia; Budapest Info pages could not be read (render ti… |
| Margaret Island Water Tower (`margaret-island-water-tower`) | VERIFIED | 13 | 0 | All technical data, designers, dates, status and island facts match the official tower site and Wikipedia; coordinates match OSM within about 30 m. |
| BudaTower – Mary Magdalene Tower (`mary-magdalene-tower`) | CORRECTED | 17 | 3 | All checked history claims (parish, Gothic church and tower, Ottoman use, Franciscans, 1792 coronation, 1817, 1920, 1945 damage, 1950 demolition, 2025 closure)… |
| Matthias Church (`matthias-church`) | CORRECTED | 12 | 3 | Core dates and coronations check out, but the tower attribution, the crypt museum wording and the 1309 crown story were not supported as written and were corre… |
| Matthias Fountain (`matthias-fountain`) | VERIFIED | 10 | 0 | Style, sculptor, 1899-1904 chronology, figures, Trevi nickname, war damage and 2010 restoration all match English Wikipedia, Buda Castle history and Visit Buda… |
| Medieval Jewish Prayer House (`medieval-jewish-prayer-house`) | CORRECTED | 9 | 1 | Dating dispute, rediscovery, Scheiber, Great Synagogue and 2018 reopening all verified and properly worded; only the description's 'tombstones in the gateway' … |
| Metropolitan Ervin Szabó Library (`metropolitan-ervin-szabo-library`) | CORRECTED | 13 | 2 | Palace and library facts match the library's own history page and Wikipedia; the history section's '1887' construction start is unsupported and is changed to c… |
| Millenáris Park (`millenaris-park`) | UNCERTAIN | 22 | 3 | Ganz history, demolition, opening, Europa Nostra award, exhibitions, address and Building E are confirmed; the Széllkapu views over the Castle District and Bud… |
| Müpa Budapest (`mupa-budapest`) | CORRECTED | 10 | 1 | Dates, designers, acoustics, organ, awards and address check out; the concert hall seat count differs between sources, so the text now says so. |
| Museum of Ethnography (`museum-of-ethnography`) | CORRECTED | 15 | 2 | Building, architect, dates and collection figures are supported; the claim that calls for a building dated to the 1880s was not found in any source and is remo… |
| Museum of Fine Arts (`museum-of-fine-arts`) | CORRECTED | 15 | 1 | History, dates, address and coordinates verified against Finestre sull'Arte, We Love Budapest, Wikipedia and OSM; only the unconfirmed 'focus on Italian art' q… |
| Museum of Illusions (`museum-of-illusions`) | VERIFIED | 11 | 0 | Franchise history, founders, 2021 Budapest opening, exhibit list and the conflicting 2026 closure/reopening reports all match the cited sources and are already… |
| National Dance Theatre (`national-dance-theatre`) | CORRECTED | 12 | 4 | Address, opening date, building details and Carmelite/Castle Theatre history are confirmed, but the claims that Bozsik Yvette Company is listed as resident, th… |
| New York Café (`new-york-cafe`) | CORRECTED | 10 | 2 | Building history, architects, sculptor, renamings and reopening confirmed; the exact month of the 2001 sale is disputed between sources and was generalised, an… |
| Normafa (`normafa`) | CORRECTED | 14 | 4 | The cogwheel railway opening year (1871) is wrong (it opened in 1874) and the 1972 Children's Railway stop move to serve Hotel Olimpia is unsupported; the rest… |
| Óbuda Museum (`obuda-museum`) | CORRECTED | 10 | 2 | Zichy Mansion, permanent exhibition and 1927 predecessor facts are verified; the history text wrongly put Roman settlement in the museum's scope and the toy ex… |
| Óbuda Synagogue (`obuda-synagogue`) | CORRECTED | 11 | 1 | Almost everything is supported by the official site and Hungarian Wikipedia; one tip misattributed a 1730s 'largest community' claim to English Wikipedia, whic… |
| Pál-völgyi Cave (`pal-volgyi-cave`) | VERIFIED | 12 | 0 | Discovery, origin, length figures, route facts and visitor-centre claim are supported by the park authority, Showcaves.com and Telex; conflicting length figure… |
| Palatinus Bath (`palatinus-bath`) | VERIFIED | 13 | 0 | Opening 1919/1921, 1937 Janáky-Szőke expansion, wave pool, art, 2016-17 Archikon reconstruction and year-round indoor section are supported by We Love Budapest… |
| Pesti Vigadó (`pesti-vigado`) | CORRECTED | 15 | 2 | Core building history verified, but the Liszt/Rákóczi March premiere claim is contested by other sources and the 1980 reopening date conflicts with the Vigadó'… |
| Petőfi Museum of Literature (`petofi-museum-of-literature`) | CORRECTED | 12 | 5 | Museum history, address, coordinates and collections verified, but the palace chronology (Batthyány arrest date, confiscation, gallery years, architects) had c… |
| Pozsonyi Road Reformed Church (`pozsonyi-road-reformed-church`) | VERIFIED | 9 | 0 | Dates, architects, construction problems, war damage and the basement rescue story are all supported by the parish site, WeLoveBudapest and Hungarian Wikipedia. |
| Queen of Heavens Church — Újpest (`queen-of-heavens-church-ujpest`) | VERIFIED | 9 | 0 | Parish history, 1875-1881 neo-Gothic build by Kauser, bell details and the Szent István tér facts are supported by Hungarian Wikipedia and We Love Budapest. |
| Robert Capa Contemporary Photography Center (`robert-capa-contemporary-photography-center`) | CORRECTED | 18 | 4 | Centre facts match the official site and Wikipedia; 'centenary of Capa's birth' is loosely worded (it is the centenary year), and the Lechner and Rippl-Rónai a… |
| Római Open-Air Bath (`romai-open-air-bath`) | CORRECTED | 12 | 2 | 1964 and 2000 renovation facts, the BKK Roman/King Matthias statements (correctly worded as tradition), the Telex 2021 beach item and the H5 HÉV stops all matc… |
| Rudas Thermal Bath (`rudas-thermal-bath`) | CORRECTED | 16 | 2 | Ottoman history, architecture, 2006 reopening, Red Heat and the October 2026 apron-bathing listing are supported; the tip about the Garden of Philosophers 'beh… |
| Rumbach Street Synagogue (`rumbach-street-synagogue`) | UNCERTAIN | 20 | 2 | Core facts (Wagner, dates, decline, 2021 reopening, mixed use) are supported, but the colour/ornament details of the facade (greyish-yellow plaster, blue ename… |
| Savoyai Terrace (`savoyai-terrace`) | VERIFIED | 10 | 0 | Statue history (Róna, built for Zenta, bought for the palace, 1900), Prince Eugene's biography and the post-1945 changes are all supported by Mandadb, Hungary … |
| Serbian Orthodox Church — Downtown Pest (`serbian-orthodox-church-downtown-pest`) | VERIFIED | 10 | 0 | Church history, Mayerhoffer, 1733/1752 dates, iconostasis, gate, garden wall and 1949 loss of St Demetrius are supported by English and Hungarian Wikipedia; 20… |
| Shoes on the Danube Bank (`shoes-on-the-danube-bank`) | CORRECTED | 10 | 2 | Memorial facts, creators, dates, victim figures and sign text match Wikipedia; the Károly Szabó rescue wording was corrected and the photo alt text 'bronze' ch… |
| St Anne's Church — Batthyány Square (`st-anne-church-batthyany-square`) | VERIFIED | 10 | 0 | Parish history, 1740-1761 construction, builders, 1870 landfill steps and the Jehmlich organ are all supported; the 1761/1762 difference is correctly shown as … |
| St Elizabeth Church — Rózsák tere (`st-elizabeth-church-roses-square`) | VERIFIED | 11 | 0 | All checked dates, names, numbers and the roses legend are supported by the parish history page and Visit Hungary; the 1931/1932 statue discrepancy is already … |
| Saint Emeric Cistercian Church (`st-emeric-cistercian-church`) | VERIFIED | 10 | 0 | Architect, style, 1938 consecration, Cistercian return in 1989, renovations, lake history and coordinates all supported by Hungarian Wikipedia, Wikidata and th… |
| Saint Ladislaus Church — Kőbánya (`st-ladislaus-church-kobanya`) | VERIFIED | 10 | 0 | Lechner commission history, 83 m tower with only the Basilica taller, Zsolnay features, dates and the flagged source discrepancies are supported by the City Ar… |
| Saint Margaret Parish Church — Lehel Square (`st-margaret-parish-church-lehel-square`) | VERIFIED | 10 | 0 | Architect, Zsámbék model, 1931-1933 build, consecration date, artists, 1944 renaming, renovations and the Szent Margit tér detail are all supported by Hungaria… |
| St. Stephen's Hall (`st-stephen-s-hall`) | CORRECTED | 16 | 3 | Almost all claims match We Love Budapest and Budapest.com, but the Holy Crown / last ceremonial use sentence misstated the chronology and was rewritten. Phase … |
| St. Stephen’s Basilica (`st-stephens-basilica`) | VERIFIED | 12 | 0 | Dates, architects, height, steps, title and Holy Right story all match Wikipedia and the basilica's own history pages; wording is properly hedged. |
| Szamos Chocolate Museum (`szamos-chocolate-museum`) | UNCERTAIN | 17 | 6 | Collection and Mátyás Szamos biography are supported by the 2017 and 2020 articles, but the museum's current status could not be verified and the description a… |
| Széchenyi Thermal Bath (`szechenyi-thermal-bath`) | CORRECTED | 12 | 1 | Dates, architects, springs and pool figures match Wikipedia and the official site; only the second spring's depth differs between sources and is now qualified. |
| The 1956 Monument (`the-1956-monument`) | CORRECTED | 13 | 2 | Dedication, designers, Stalin-statue site and controversy are supported, but the history text overstated the design ('hundreds of elements', varying heights/su… |
| The Tabán (`the-taban`) | CORRECTED | 18 | 5 | Most history is supported, but the 'spa quarter / temporary park' claim could not be confirmed in any source opened, the medieval 'village under the castle' wo… |
| The Tomb of Gül Baba (`the-tomb-of-gul-baba`) | CORRECTED | 17 | 1 | Construction dates, architecture, chapel conversion, 1885-1914 restoration and the 2018 inauguration are supported; 'now the property of the Republic of Turkey… |
| Tóth Árpád Promenade (`toth-arpad-promenade`) | CORRECTED | 9 | 2 | Description, views, cherries, Bástya sétány history and the poet's dates are supported; one overbroad statement about the fortifications was replaced with what… |
| Trinity Square (`trinity-square`) | VERIFIED | 9 | 0 | Square history, column chronology (1694 decision to 11 June 1713 inauguration), sculptors, saints and reliefs all match the Castle District heritage site; only… |
| Tropicarium – The “Shark Zoo” (`tropicarium-the-shark-zoo`) | VERIFIED | 9 | 0 | Opening date, size, history, exhibits and visitor notes all match the official site, the history page and Budappest; only the construction-materials detail res… |
| Újlak Synagogue — Frankel Leó Street (`ujlaki-synagogue`) | VERIFIED | 10 | 0 | Dates, architects, dimensions, residential building, war and renovation facts and the film appearance are supported by Hungarian Wikipedia; address, coordinate… |
| Underground Railway Museum (`underground-railway-museum`) | UNCERTAIN | 16 | 4 | Line history and museum details match BKV and Wikipedia; two unsupported details (2.7 m depth, 1960s fill-in plans) are removed and the address 'Erzsébet tér 1… |
| Váci Street (`vaci-street`) | VERIFIED | 10 | 0 | The street's description, name origin, post-1686 history, house-number highlights and clip-joint warning all match the Wikipedia and We Love Budapest sources. |
| Vasarely Museum Budapest (`vasarely-museum-budapest`) | CORRECTED | 15 | 2 | Museum location, Vasarely biography and sister museums are supported; the '1968 donation' and '1982 given to the city' claims are not found and are replaced wi… |
| Veli Bej Bath (`veli-bej-bath`) | UNCERTAIN | 17 | 6 | Address, Hild reconstruction, Hospitallers and restoration dates are supported; two statements needed fixing (the 'oldest Ottoman bath' superlative conflicts w… |
| Vienna Gate (`vienna-gate`) | VERIFIED | 12 | 0 | Names, rebuild chronology (1723/1849/1850/1896/1936), architect, sculptor, memorials and nearby sights all confirmed by the Castle District heritage site, Wiki… |
| Vörösmarty Square (`vorosmarty-square`) | VERIFIED | 12 | 0 | Square layout, name history, metro station facts, UNESCO listing and Gerbeaud history all match Wikipedia, with Gerbeaud and coordinates cross-checked via OSM. |
| Zugliget Chairlift (`zugliget-chairlift`) | VERIFIED | 10 | 0 | Opening date, dimensions, history dates, restrictions and naming-contest story all match BKK, BKV and Visit Hungary. |

## Corrections made

### Andrássy Avenue (`andrassy-avenue`)

- "It was named in 1885 after Gyula Andrássy, the Prime Minister described as the main supporter of the plan, and most of the palaces along it were finished by 1884." → "It was named after Gyula Andrássy, the Prime Minister described as the main supporter of the plan, in 1885 or 1886 depending on the source, and most of the palaces along it were f…"  
  Reason: Sources conflict on the year of naming (Wikipedia 1885, Budapest heritage entry 1886).  
  Evidence: https://fszek.hu/en/Entities/110/0601anzix-wahrmann-palota
- "The palaces were designed by leading architects of the day, with Miklós Ybl among the foremost, and were financed by banking houses." → "The palaces were designed by leading architects of the day, led by Miklós Ybl."  
  Reason: The bank-financing claim is not supported; WLB describes a state-owned building company that sold plots and built or financed many of the palaces.  
  Evidence: https://en.wikipedia.org/wiki/Andr%C3%A1ssy_%C3%BAt
- "UNESCO's own statement says that from 1872 the avenue radically transformed the urban structure of Pest." → "A summary of the UNESCO listing says that from 1872 the avenue radically transformed the urban structure of Pest."  
  Reason: UNESCO's page could not be opened; the wording was confirmed only on a secondary page quoting UNESCO.  
  Evidence: https://worldheritagesites.net/?p=15928
- address: 1065 Budapest, Andrássy út → 1061 Budapest, Andrássy út  
  Reason: Postcode 1065 does not occur on the avenue in OSM (1061, 1062, 1067, 1068); 1061 is the Opera-end section where the coordinates lie.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Andr%C3%A1ssy+%C3%BAt+Budapest&format=json&limit=5&addressdetails=1

### Aquaworld Resort Budapest (`aquaworld-resort-budapest`)

- "Six of the giant slides start from a 17-metre tower reached by a glass lift or stairs" → "Six giant slides start from a slide tower next to the dome, reached by a glass lift or stairs, and the highest rides begin from 17 metres up"  
  Reason: The source gives 17 m as the highest start height, not the height of the tower.  
  Evidence: https://polin.com.tr/news/central-europes-largest-indoor-waterpark-aquaworld-budapest-hungary-opened-its-doors
- "six giant slides start from a slide tower 17 metres high that is reached by a glass lift or by stairs" → "six giant slides start from a slide tower next to the dome that is reached by a glass lift or by stairs, and the highest ride begins from 17 metres up"  
  Reason: Same correction in the history text: 17 m is the highest start height, not stated as the tower height.  
  Evidence: https://polin.com.tr/news/central-europes-largest-indoor-waterpark-aquaworld-budapest-hungary-opened-its-doors

### Aquincum Museum (`aquincum-museum`)

- "Wikipedia says the museum holds more than a million objects." → "Wikipedia says the Budapest History Museum, to which Aquincum belongs, holds more than a million objects."  
  Reason: The million-object figure refers to the Budapest History Museum as a whole.  
  Evidence: https://en.wikipedia.org/wiki/Aquincum_Museum
- address: (none) → 1031 Budapest, Szentendrei út 135.  
  Reason: Address was missing; official site gives it.  
  Evidence: https://www.aquincum.hu/en/
- coordinates: (none) → 47.5636435,19.0497159  
  Reason: Coordinates were missing; OSM address point for Aquincumi Múzeum, Szentendrei út 135.  
  Evidence: https://nominatim.openstreetmap.org/search?format=json&q=Aquincum+Museum+Szentendrei+ut+135+Budapest
- "Budapest's official visitor guide notes that the preserved Roman town is sometimes nicknamed the 'Hungarian Pompeii'." → "Travel guides such as We Love Budapest describe the open-air archaeological site as 'the Hungarian Pompeii', a nickname rather than an official title."  
  Reason: The cited Budapest Info page does not contain the nickname; We Love Budapest does.  
  Evidence: https://welovebudapest.com/en/toplist/2018/08/22/roman-budapest-6-ancient-sites-in-our-modern-city/

### Armenian Catholic Church — Újbuda (`armenian-catholic-church-ujbuda`)

- "as if to a second family" → "as if to their first family"  
  Reason: The study's quoted interviewee says 'mintha első családunkba' (as if to our first family), not 'second family'.  
  Evidence: https://leveltarimozaikok.bparchiv.hu/wp-content/uploads/2024/04/BLM_2024_06.pdf
- "as in a second family" → "as if it were their first family"  
  Reason: Same quotation in the history section; the original says 'first family' (első családunk).  
  Evidence: https://leveltarimozaikok.bparchiv.hu/wp-content/uploads/2024/04/BLM_2024_06.pdf

### Bartók Béla Boulevard (`bartok-bela-boulevard`)

- "and left Hungary after the First World War" → "and emigrated from Hungary in 1940"  
  Reason: Bartók left Hungary for the United States in October 1940, not after the First World War.  
  Evidence: https://holocaustmusic.ort.org/resistance-and-exile/bela-bartok/

### Buda Castle District (`buda-castle-district`)

- "Its post-war reconstruction, carried out from 1952 to 1966 in a simplified Baroque style, gave the building the outline and the dome you see today, and the medieval fortifications…" → "Its post-war reconstruction, externally complete by 1966 although the interiors were finished only in the 1980s, took a simplified Baroque form and gave the building the outline a…"  
  Reason: Wikipedia says the palace was rebuilt by 1966 with interiors ready in the 1980s; no source seen for 1952 or for rebuilt medieval fortifications; sources mention medieval rooms unearthed and reconstructed in the 1950s-60s.  
  Evidence: https://en.wikipedia.org/wiki/Buda_Castle
- "The Castle District grew around the medieval royal residence of Buda and the fortified streets above the Danube." → "The Castle District began as a walled town on Castle Hill, founded by King Béla IV after the Mongol invasion of 1241–42, and the royal court soon settled in the growing town."  
  Reason: Source says the fortified town was founded first and later accommodated the royal court; the old wording implied the reverse and was not stated by any source.  
  Evidence: https://budavar.abtk.hu/en/the-history-of-the-site/the-history-of-buda-to-1541.html

### Budapest History Museum — Castle Museum (`budapest-history-museum`)

- "stretches of castle wall, a room devoted to the Corvina library and a reconstructed medieval façade inside the King's Cellar" → "stretches of castle wall and a room devoted to the Corvina library"  
  Reason: Reconstructed facade in the King's Cellar is not supported by any source opened.  
  Evidence: https://hungaryunlocked.com/budapest-history-museum-castle-museum-guide/
- "many were never finished, because the workshop broke up before the work was complete" → "many were never finished; one guide says the workshop broke up before the work was done, though the reasons remain unclear"  
  Reason: Cause is a hypothesis; source itself says reasons are unclear.  
  Evidence: https://hungaryunlocked.com/budapest-history-museum-castle-museum-guide/
- "follows about a thousand years of the city from Aquincum to the fall of communism" → "follows about a thousand years of the city's history"  
  Reason: Sources disagree on the exhibition's endpoints (fall of communism vs present).  
  Evidence: https://xpatloop.com/channels/2013/12/now-on---light---shadow--the-1-000-year-history-of-budapest.html
- address: (none) → 1014 Budapest, Szent György tér 2.  
  Reason: Address was missing; official Castle Museum site and OSM give it.  
  Evidence: https://www.varmuzeum.hu/en/
- coordinates: (none) → 47.4954582,19.0404987  
  Reason: Coordinates were missing; OSM point for the Budapest History Museum at Szent György tér 2.  
  Evidence: https://nominatim.openstreetmap.org/search?format=json&q=Szent+Gy%C3%B6rgy+t%C3%A9r+2+Budapest
- "The exhibitions explore Aquincum, the medieval city, the Ottoman and Habsburg periods, and the eventual unification of Pest, Buda and Óbuda." → "The permanent exhibitions explore Roman Aquincum, the medieval royal palace, the Ottoman wars, the fusion of Buda, Pest and Óbuda and the city's rapid growth around 1900."  
  Reason: Tightened to what the Hungarian museums portal and the museum's own exhibition list state.  
  Evidence: https://www.museum.hu/museum/14/Budapest_History_Museum

### Budapest Zoo & Botanical Garden (`budapest-zoo-botanical-garden`)

- "Budapest visitor information records visits from internationally known naturalists including Konrad Lorenz and Jane Goodall. It also notes that part of the film Bluebeard, featuri…" → "Budapest visitor information is cited for visits from internationally known naturalists including Konrad Lorenz and Jane Goodall, and for the claim that part of the film Bluebeard…"  
  Reason: No independent source found for the visits or for a Bluebeard shoot at the zoo (Wikipedia's film page names only Budapest and Rome as filming locations); claim qualified rather than stated as fact.  
  Evidence: https://en.wikipedia.org/wiki/Bluebeard_(1972_film) ; https://zoobudapest.com/en/history-of-the-zoo/
- "Budapest visitor information is cited for visits from internationally known naturalists including Konrad Lorenz and Jane Goodall, and for the claim that part of the film Bluebeard…" → "The zoo's own history page says it has welcomed many renowned biologists, from Nobel laureate Konrad Lorenz to Joy Adamson, as well as several international film stars, among them…"  
  Reason: Rewritten to what the zoo's history page states; Jane Goodall and the Bluebeard shoot are unsupported and removed.  
  Evidence: https://zoobudapest.com/en/history-of-the-zoo/
- "From wildlife research to film history" → "Scientists and film stars among the visitors"  
  Reason: Story title no longer implies a film was made at the zoo.  
  Evidence: https://zoobudapest.com/en/history-of-the-zoo/

### Café Gerbeaud (`cafe-gerbeaud`)

- "the Swiss-trained pastry maker Emil Gerbeaud" → "the Swiss-born confectioner Emil Gerbeaud"  
  Reason: Gerbeaud was born in Geneva and trained across eleven European capitals; 'Swiss-trained' is inaccurate.  
  Evidence: https://en.wikipedia.org/wiki/Caf%C3%A9_Gerbeaud
- "One guide notes that Váci utca begins at the square and that a metro station is right in front of the café." → "Váci utca, the pedestrian shopping street, begins at the square, and the Vörösmarty tér station of the M1 metro lies beneath it."  
  Reason: Replaced an alt-text-based 'right in front' wording with what Wikipedia and the guide support.  
  Evidence: https://en.wikipedia.org/wiki/V%C3%B6r%C3%B6smarty_t%C3%A9r_(Budapest_Metro)

### Castle Garden Bazaar (`castle-garden-bazaar`)

- "and cannonballs thought to date from the 1686 recapture of Buda" → "and a cannonball linked to the sieges of Buda"  
  Reason: No source ties the excavated cannonballs to 1686; the 2012 excavation report mentions a cannonball linked to the sieges.  
  Evidence: https://hvg.hu/ingatlan/20121019_Kozepkori_romokat_talaltak_a_Varkert_Baza
- "and cannonballs likely from 1686" → "and a cannonball linked to the sieges of Buda"  
  Reason: Same as above (history text).  
  Evidence: https://hvg.hu/ingatlan/20121019_Kozepkori_romokat_talaltak_a_Varkert_Baza
- "Archaeological finds from the excavations are displayed in the south wing; check the official site for what is currently on show." → "Archaeological finds from the excavations were shown in the southern palaces when the building reopened in 2014; check the official site for what is currently on show."  
  Reason: Only the 2014 display in the southern palaces is documented; current display is unconfirmed.  
  Evidence: https://infostart.hu/kultura/2014/03/29/ybl-emlekev---a-varkert-bazarral-egyutt-harom-kiallitas-is-nyilik-625924

### Cave Church (`cave-church`)

- "it was walled up under communism and reconsecrated in the 1990s" → "it was walled up under communism and reopened as that era ended"  
  Reason: Sources date the reopening between 1989 and 1992; 'reconsecrated in the 1990s' is not reliably supported.  
  Evidence: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill_Cave ; https://aleteia.org/2018/03/08/an-early-20th-century-church-built-in-a-budapest-cave
- "We Love Budapest dates the wall to 1960, while Visit Hungary says only that it came in the 1950s." → "Sources differ on the date: We Love Budapest says the wall dates to 1960, Visit Hungary says only the 1950s, and Wikipedia and Aleteia say the cave was sealed in 1951."  
  Reason: Adds the 1951 date given by two other sources and flags the discrepancy.  
  Evidence: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill_Cave ; https://aleteia.org/2018/03/08/an-early-20th-century-church-built-in-a-budapest-cave
- "The wall was demolished in the 1990s, and the Pauline order restored and reconsecrated the church." → "The wall was demolished as communist rule ended (Wikipedia gives 1989, Visit Hungary the 1990s), and the Pauline order restored the church."  
  Reason: Reopening date varies by source; 'reconsecrated in the 1990s' unsupported.  
  Evidence: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill_Cave ; https://visithungary.com/articles/a-sacred-site-of-budapest-the-magnificent-cave-church
- "The Paulist order developed the cave church in the early twentieth century, and its present nave was completed around 1930." → "The Pauline order developed the cave church in the early twentieth century; the sources give 1926 for its consecration and 1931 for the completion of construction."  
  Reason: Terminology: the order is Pauline, not Paulist; dates given as the sources state them.  
  Evidence: https://welovebudapest.com/en/article/2016/12/23/budapest-s-historic-cave-church-is-a-landmark-carved-in-stone/ ; https://visithungary.com/articles/a-sacred-site-of-budapest-the-magnificent-cave-church
- "The church was forcibly closed and walled up in 1951. It reopened in 1990 and again became a centre for religious life and visitors." → "The church was closed and sealed with a concrete wall in 1951, according to Wikipedia and Aleteia. The wall came down as communist rule ended, and sources date the reopening betwe…"  
  Reason: Reopening year '1990' is not supported; sources give 1989, 1991 or 1992.  
  Evidence: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill_Cave ; https://aleteia.org/2018/03/08/an-early-20th-century-church-built-in-a-budapest-cave
- "The cave walls that seemed to open themselves" → "The hermit Iván and the healing waters"  
  Reason: Original story could not be found in the cited source; replaced with the legend recorded by We Love Budapest.  
  Evidence: https://welovebudapest.com/en/article/2016/12/23/budapest-s-historic-cave-church-is-a-landmark-carved-in-stone/
- "Budapest's official tourism account preserves a story that, as the passage was being made in the 1920s, parts of the cliff walls fell away almost miraculously, creating the vaulte…" → "We Love Budapest records a legend of a hermit named Iván who healed the sick with the bubbling waters at the cave's entrance."  
  Reason: Cited Budapest Info page could not be shown to contain the original story; replaced with a verified legend.  
  Evidence: https://welovebudapest.com/en/article/2016/12/23/budapest-s-historic-cave-church-is-a-landmark-carved-in-stone/
- "This is a local religious building tradition, not a verified supernatural occurrence." → "This is a legend, not a documented event."  
  Reason: Matches the replaced story.  
  Evidence: https://welovebudapest.com/en/article/2016/12/23/budapest-s-historic-cave-church-is-a-landmark-carved-in-stone/

### Cinema Mystica Budapest (`cinema-mystica`)

- "It became a historic monument in 1976 and emptied out for years after popular shops such as the Jégbüfé ice-cream parlour and a hologram shop moved out." → "According to Hungarian Wikipedia it became a listed monument in 1976 (a 2018 We Love Budapest article gives 1967 for heritage protection), and the arcade stood largely empty for y…"  
  Reason: Monument date differs between sources; the Jegbufe closed in 2015 because of the renovation rather than before the building emptied.  
  Evidence: https://hu.wikipedia.org/wiki/P%C3%A1risi_udvar

### City Park Boating Lake (`city-park-boating-lake`)

- "A 2026-season announcement lists 32 pedal boats, 10 rowboats and 10 stand-up paddleboards at the lakeside, and mentions summer events such as paddleboard yoga and salsa evenings o…" → "The lakeside operator rents pedal boats and, depending on the water level, rowboats and stand-up paddleboards in season, and the shore hosts summer events such as paddleboard yoga…"  
  Reason: No 2026 announcement could be found; the quoted fleet matches a 2023 article, and rowboats and paddleboards are only available at higher water levels. Cautious wording avoids a stale fleet count.  
  Evidence: https://welovebudapest.com/cikk/2023/7/5/szabadido-varosligeti-to-csonakazas-vizibicikli-sup

### City Park Ice Rink (`city-park-ice-rink`)

- "A wooden cottage burned down in 1874 and was replaced by a stable building designed by Ödön Lechner, and in 1893, Wikipedia says, a neo-baroque main building designed by Imre Fran…" → "A wooden pavilion burned down in 1874 and was replaced by a skating hall designed by Ödön Lechner. The present neo-baroque main building, designed by Imre Francsek, followed in 18…"  
  Reason: Rink's own history page and several Hungarian sources date Francsek's building to 1895; 1893 is a minority date. Lechner's building was a skating hall, not a 'stable'; its opening year differs by source so none is stated.  
  Evidence: https://mujegpalya.hu/rolunk/
- "Championships followed: the European Figure Skating Championships were held at the rink in 1895 and the World Figure Skating Championships in 1909, Hungary's first world event of …" → "Championships followed: according to Hungarian Wikipedia the rink hosted the European Figure Skating Championships in 1895 and 1909 and world figure skating championships in 1929,…"  
  Reason: hu.wikipedia lists 1909 as a European championship at the rink and world championships in 1929, 1935 and 1939; the 1909 Worlds were split between Stockholm and Budapest (ladies only), and 'first world event' is unsupported.  
  Evidence: https://hu.wikipedia.org/wiki/Városligeti_Műjégpálya

### City Park (Városliget) (`city-park-varosliget`)

- "a rectangle of about 1,400 by 970 metres" → "a rectangle about 1.4 kilometres long and just under a kilometre wide"  
  Reason: Sources conflict on the width (970 m vs 900 m); a rounded statement is true under both.  
  Evidence: https://www.budapest.net/budapest-city-park
- "measuring about 1,400 by 970 metres" → "about 1.4 kilometres long and just under a kilometre wide"  
  Reason: Same conflict between sources on the park's width.  
  Evidence: https://www.budapest.net/budapest-city-park
- "the ice rink to 1870, the first performance in the circus building to 1891 and Gundel Restaurant to 1894;" → "the ice rink to 1870 and Gundel Restaurant to 1894, and gives 1891 for the first performance in the circus building, although its Capital Circus article dates the original buildin…"  
  Reason: Wikipedia's own articles and other sources disagree on 1889 vs 1891 for the first circus building; text now says so instead of stating 1891 as fact.  
  Evidence: https://en.wikipedia.org/wiki/Capital_Circus_of_Budapest

### Clark Ádám Square and the 0 km Stone (`clark-adam-square-and-the-0-km-stone`)

- "The Budai Takarékpénztár building, designed by Miklós Ybl, was hit by a bomb in the Second World War and was completely demolished in 1949 while the roundabout was being built; a …" → "The Budai Takarékpénztár building, designed by Miklós Ybl, was hit by a bomb in the Second World War. Hungarian Wikipedia says it was demolished in 1949 while the roundabout was b…"  
  Reason: Sources conflict on demolition date; the original stated 1949 and 'completely demolished' as fact.  
  Evidence: https://hu.wikipedia.org/wiki/Clark_%C3%81d%C3%A1m_t%C3%A9r ; https://welovebudapest.com/cikk/2024/04/18/latnivalok-es-kultura-a-ter-aminek-egyszerre-tobb-neve-is-volt-es-ahonnan-minden-ut-indul-a-clark-adam-ter-tortenete/
- "It was not the first monument on the spot: in 1932 a Madonna statue by Körmendi became the first official monument, which the Second World War destroyed, and from 1953 until the p…" → "It was not the first monument on the spot: in 1932 a statue of the Virgin Mary by Körmendi, put up by the Hungária Automobil Club, was the first monument here. Sources differ on i…"  
  Reason: Fate of the 1932 statue is disputed; 'first official monument' is not supported (sources say 'first monument').  
  Evidence: https://en.wikipedia.org/wiki/Zero_Kilometre_Stone ; https://welovebudapest.com/cikk/2024/04/18/latnivalok-es-kultura-a-ter-aminek-egyszerre-tobb-neve-is-volt-es-ahonnan-minden-ut-indul-a-clark-adam-ter-tortenete/ ; https://budappest.com/celebrating-50-years-of-budapests-iconic-0-kilometer-stone/
- "A Madonna statue by Eugene Kormendi was set up on the spot in 1932 and destroyed in the Second World War, and a sculpture of a worker stood there from 1953 until the present monum…" → "A Madonna statue by Eugene Kormendi was set up on the spot in 1932; English Wikipedia says it was destroyed in the Second World War, but other sources say it survived the siege an…"  
  Reason: Fate of the 1932 statue is disputed between sources.  
  Evidence: https://welovebudapest.com/cikk/2024/04/18/latnivalok-es-kultura-a-ter-aminek-egyszerre-tobb-neve-is-volt-es-ahonnan-minden-ut-indul-a-clark-adam-ter-tortenete/
- "The stone was first set at the threshold of the Buda Royal Palace and was moved near the Chain Bridge when the crossing was completed in 1849." → "According to English Wikipedia, the stone was first set at the threshold of the Buda Royal Palace and was moved near the Chain Bridge when the crossing was completed in 1849."  
  Reason: Single, weakly cited source (article tagged as needing citations); attribute it.  
  Evidence: https://en.wikipedia.org/wiki/Zero_Kilometre_Stone
- "According to English Wikipedia, the stone was first set at the threshold of the Buda Royal Palace and was moved near the Chain Bridge when the crossing was completed in 1849." → "The country's road zero point is said to have first been marked at the threshold of the Buda Royal Palace. HVG says the milestone was later moved near the newly opened Chain Bridg…"  
  Reason: The move is independently reported by HVG without a year; only English Wikipedia gives 1849, so attribute each part.  
  Evidence: https://hvg.hu/elet/201831_nulladik_kilometerpontok

### Dohány Street Synagogue (`dohany-street-synagogue`)

- "and Frigyes Feszl designed the interior" → "and Frigyes Feszl was responsible for part of the interior design"  
  Reason: Wikipedia says the interior design is only 'partly by Frigyes Feszl'.  
  Evidence: https://en.wikipedia.org/wiki/Dohány_Street_Synagogue
- "since the synagogue can close for services and Jewish holidays and may ask visitors to follow dress and security instructions." → "since the complex is closed to visitors every Saturday and, according to visitor guides, on Jewish holidays, and the community asks visitors to cover their shoulders and knees, me…"  
  Reason: Replaces vague wording with what the official community and tour pages state about Saturday closure, dress code and security check; holiday closure attributed to guides.  
  Evidence: https://dohany-zsinagoga.hu/?p=2271

### Ferenc Hopp Museum of Asiatic Arts (`ferenc-hopp-museum-of-asiatic-arts`)

- ", with an associated research institute," → ""  
  Reason: Research-institute condition in the will is not supported by any source opened.  
  Evidence: https://hu.wikipedia.org/wiki/Hopp_Ferenc_(m%C5%B1gy%C5%B1jt%C5%91)

### Fisherman’s Bastion (`fishermans-bastion`)

- coordinates: 47.506973322428586,19.033476697438378 → 47.5023,19.0347  
  Reason: Dossier coordinates lie about 520 m north of the Bastion.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Halászbástya+Budapest&format=json&limit=3
- "Stróbl began it in 1896 and finished it in 1906, and it was unveiled on 21 May 1906 on a neo-Romanesque pedestal designed by Schulek." → "Stróbl began it in 1896, and it was unveiled in 1906 on a neo-Romanesque pedestal designed by Schulek."  
  Reason: The exact day (21 May 1906) and separate completion year are not supported; sources give 1896 start and 1906 unveiling only.  
  Evidence: https://en.wikipedia.org/wiki/Fisherman%27s_Bastion
- "Early morning and late evening are the quietest times; the terraces face east across the river." → "Visitor guides describe early morning and evening as calmer times to come; the terraces look east across the Danube towards Pest."  
  Reason: Quietness is a guide opinion, not a measured fact; orientation confirmed.  
  Evidence: https://www.budapest-trip.com/guides/fishermans-bastion-guide/

### Fradi Museum (`fradi-museum`)

- "The club's earlier home was the Üllői út stadium, which opened in 1911 and was later known as Stadion Albert Flórián, used from 1974 to 2014." → "The club's earlier home was the Üllői út stadium, where it had played since 1911; it was later known as Stadion Albert Flórián and was demolished in 2013."  
  Reason: Wikipedia gives 1911 as the year the club began playing there, not an opening year, and 1974 as the end of an upgrade, not a period of use; no '1974 to 2014' span is stated.  
  Evidence: https://en.wikipedia.org/wiki/Ferencv%C3%A1ros_Stadion

### Franz Liszt Memorial Museum and Research Centre (`franz-liszt-memorial-museum-and-research-centre`)

- "Look for the writing desk made for him by the piano maker Ludwig Bösendorfer, which has a keyboard built into the middle for composing." → "Look for the walnut writing desk in the corner of the study-bedroom, made for him by his friend the piano maker Ludwig Bösendorfer, with a pull-out three-octave keyboard in place …"  
  Reason: Museum's own article describes the desk as a walnut piece with a pull-out three-octave keyboard in the middle-drawer position; the 'for composing' wording is softened to the museum's account (Liszt composed in his head and used the keyboard to check runs and …  
  Evidence: https://lisztmuseum.hu/data/lfm_ismerjuk_meg_egyutt/lfm_komponaloiroasztal.pdf
- "Memorabilia and manuscripts from his relatives, pupils and friends have also been added to the collection over the decades." → "Documents and memorabilia from relatives and pupils, among them Eduard Liszt, Jenő Hubay and István Thomán, have also been added over the decades, together with later purchases an…"  
  Reason: The museum names relatives and pupils as donors but never friends; the named donors and the purchases and bequests are supported by the museum and Liszt Academy pages.  
  Evidence: https://uni.lisztacademy.hu/about-us/the-liszt-ferenc-memorial-museum-114423
- "occupies the building in which the Academy of Music taught from late 1875 to mid-1907." → "occupies the building in which the Academy of Music taught from 1879 to mid-1907, after its first four years in a building on Hal tér."  
  Reason: The Academy opened in November 1875 on Hal tér and moved to the Sugár út (Andrássy út) building in 1879; the museum's About page wording 'late 1875' conflicts with its own news page and the Academy's history page.  
  Evidence: https://lisztmuseum.hu/news/the-old-academy-of-music-building-opened-145-years-ago-126581
- "Its interpretation considers the composer as a person, performer and teacher rather than only a celebrated name on concert programmes." → "Its permanent exhibition fills the entrance room, Liszt's study-bedroom and the drawing room, while the former dining room and the ground-floor foyer host temporary Liszt exhibiti…"  
  Reason: The original sentence was an unsupported claim about the museum's approach; replaced with the exhibition layout documented by the museum.  
  Evidence: https://lisztmuseum.hu/aboutus/about-us-119918

### Garden of Philosophers (`garden-of-philosophers`)

- "The Budapest sources describe eight life-size bronze figures facing a shared centre, standing above the Gellért Hill reservoir." → "The Budapest sources describe eight life-size bronze figures facing a shared centre."  
  Reason: The reservoir detail is not in any source opened.  
  Evidence: https://xpatloop.com/channels/2023/06/insiders-guide-garden-of-philosophers-in-budapest.html
- "The sources read do not say whether the figures were later replaced, so ask locally or check the current state before making this a destination in itself." → "Közterkép and a Budapest city blog report that the three figures were later recast from moulds provided by Wagner's widow and that the full set of eight was back in place by 2010."  
  Reason: Replacement is documented.  
  Evidence: https://www.kozterkep.hu/1873/filozofiai-kert
- "Check which figures are currently in place, because three were reported stolen in 2007 and the sources read do not say what happened afterwards." → "Three figures were stolen in 2007, but they were recast and the full set of eight was back in place by 2010, and a 2023 guide describes all eight."  
  Reason: Replacement is documented.  
  Evidence: https://www.kozterkep.hu/1873/filozofiai-kert
- "The sources read do not say what happened afterwards." → "Közterkép says the three figures were recast in Japan in 2009 from moulds provided by Wagner's widow, and a Budapest city blog says the Budapest and Buda Castle district municipal…"  
  Reason: Replacement is documented.  
  Evidence: https://www.kozterkep.hu/1873/filozofiai-kert
- coordinates: (none) → 47.48928,19.03939  
  Reason: Coordinates missing; supplied from OSM.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Filoz%C3%B3fusok+kertje+Budapest&format=json

### Gellért Hill & Citadella (`gellert-hill-citadella`)

- "One guide says the paths are steep with many steps, so they are not ideal for strollers, and advises visiting in daylight." → "One guide says the paths are steep with many steps, so they are not ideal for strollers."  
  Reason: The cited guide gives no daylight advice; only the steep paths and stroller warning could be confirmed.  
  Evidence: https://www.budapestbylocals.com/budapest-gellert-hill.html
- "that a land register of 1789 records 128 hectares," → "that a land register of 1789 is said to record 128 hectares of vineyard on the hill (a figure it cites from a 2007 Hungarian study of the lost vineyards of Buda),"  
  Reason: The 128-hectare figure is a secondary citation that could not be confirmed against the register itself, so the wording attributes it.  
  Evidence: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill
- "Check the official Citadella site for current access to the fortress and exhibition, as sources disagree on whether parts have been open or under renovation." → "Check the official Citadella site for current access to the fortress and the Bastion of Freedom exhibition before you go."  
  Reason: The Citadella reopened on 5 April 2026 after its renovation, so the remark that sources disagree on whether parts are under renovation is stale. Replacement is about 8 words shorter; recheck the 35-70 word description limit if this sentence is in the descript…  
  Evidence: https://xpatloop.com/channels/2026/03/budapest-landmark-reborn-citadella-reopens-to-public-this-march.html

### Gellért Thermal Bath (`gellert-thermal-bath`)

- address: (none) → H-1114 Budapest, Kelenhegyi út 2.  
  Reason: Address was missing; this is the address given on the bath's official site.  
  Evidence: https://www.gellertbath.hu/
- coordinates: (none) → 47.4838,19.0523  
  Reason: Coordinates were missing; point is the Hotel Gellért building (Wikipedia 47.48379, 19.05233), within about 60 m of Nominatim's Kelenhegyi út 2.  
  Evidence: https://en.wikipedia.org/wiki/Hotel_Gell%C3%A9rt

### Goldberger Textile Collection (`goldberger-textile-collection`)

- "and a workshop that made traditional slippers until 1991." → "and, according to the museum, a Tamási workshop that made traditional slippers until 1991."  
  Reason: The 1991 end date comes only from the museum listing; another report says 1980.  
  Evidence: https://infostart.hu/kultura/2014/02/09/visszakerult-tamasiba-a-tutyikeszito-muhely-614292
- "another, the Tamási workshop, presents the last textile manufactures, including tutyi (closed slippers worn by ethnic Germans) made in the Rittinger Workshop in Tamási until 1991." → "another, a Tamási workshop display, is described as presenting the last textile manufactures, including tutyi (closed slippers worn by ethnic Germans) made in the Rittinger Worksh…"  
  Reason: Sources conflict on the end date and on whether the display remains in Óbuda.  
  Evidence: https://infostart.hu/kultura/2014/02/09/visszakerult-tamasiba-a-tutyikeszito-muhely-614292
- "The building is over 200 years old: the ground floor housed a cloth-painting business and the first floor was used by the Goldberger family." → "The building is over 200 years old according to the museum's profile, and the museum says the family's first workshop opened in the present building at the end of the 18th century."  
  Reason: The ground-floor/first-floor use could not be confirmed; replaced with what the museum states.  
  Evidence: https://www.museum.hu/museum/85/Museum_of_Textil_And_Clothing_Industry_Textilmuseum/exhibition
- "larger machines from the Fibre Museum's store are planned for the exhibition space." → "several large machines from the museum's store are planned for display after reconstruction."  
  Reason: 'Fibre Museum' is not in the museum.hu source.  
  Evidence: https://www.museum.hu/museum/85/Museum_of_Textil_And_Clothing_Industry_Textilmuseum/exhibition

### Great Market Hall (`great-market-hall`)

- "A thorough renovation began in 1991 and the market reopened in 1997." → "A thorough renovation began in 1991 when the hall was closed; Hungarian sources give 1994 for the end of the reconstruction, while English Wikipedia says the market reopened in 19…"  
  Reason: Reopening year is disputed; the 1997 date is not supported by Hungarian Wikipedia or Daily News Hungary, which give 1994.  
  Evidence: https://hu.wikipedia.org/wiki/Nagyv%C3%A1s%C3%A1rcsarnok ; https://dailynewshungary.com/central-market-hall-120-years-old/ ; https://en.wikipedia.org/wiki/Great_Market_Hall

### Hospital in the Rock (`hospital-in-the-rock`)

- "The hospital closed in July 1945." → "The museum's history page gives July 1945 as the closing date, while another account says June 1945."  
  Reason: Sources conflict on the closure month.  
  Evidence: https://welovebudapest.com/cikk/2024/03/01/latnivalok-es-kultura-sziklakorhaz-atombunker-muzeum-80-eves-tortenete/

### Hungarian Academy of Sciences (`hungarian-academy-of-sciences`)

- "Inside, the ceremonial hall has a coved vault designed by Albert Schickedanz, with triptychs by Károly Lotz on its east and west walls showing St Stephen and King Matthias, and a …" → "Inside, the ceremonial hall has a coved vault whose ornamental elements were designed by Albert Schickedanz, with triptychs by Károly Lotz on its east and west walls showing St St…"  
  Reason: The Academy's own page says Schickedanz designed the vault's ornamental elements, and that the Holló relief is in the vestibule and commemorates Queen Elizabeth's death, with imagery glorifying the Compromise.  
  Evidence: https://mta.hu/english/about-mta-105677

### Hungarian Agricultural Museum and Library (`hungarian-agricultural-museum-and-library`)

- "Since the museum was founded in the same year, it has housed the national collection on farming, hunting, fishing and food." → "The museum was founded in the same year and holds the national collection on agriculture, hunting, fishing and related food-industry material."  
  Reason: The museum was not continuously in the castle since 1896 (castle demolished 1899, museum back 1904); profile wording aligned with hu.wikipedia.  
  Evidence: https://hu.wikipedia.org/wiki/Magyar_Mez%C5%91gazdas%C3%A1gi_M%C3%BAzeum

### Hungarian Heritage House (`hungarian-heritage-house`)

- "Other activities include co-partnering with music festivals, running a concert venue, adult education courses, a Museum of Applied Hungarian Folk Art and folklore documentation su…" → "Other activities include folk craft training, folk music and dance camps and a museum, according to the institute's own website."  
  Reason: Original list of activities could not be confirmed on the institute's pages; replaced with what is stated.  
  Evidence: https://hagyomanyokhaza.hu/en/node/8745
- "Wikipedia adds that in November 2011 UNESCO recognised the táncház method as a way of reviving and safeguarding traditional dance teaching." → "UNESCO's own page says the táncház method was selected in 2011 for its Register of Good Safeguarding Practices, as a Hungarian model for transmitting intangible heritage."  
  Reason: Wikipedia names the wrong UNESCO list; the official UNESCO page gives the Register of Good Safeguarding Practices, 2011.  
  Evidence: https://ich.unesco.org/en/BSP/tanchaz-method-a-hungarian-model-for-the-transmission-of-intangible-cultural-heritage-00515
- coordinates: (none) → 47.50309,19.03818  
  Reason: Coordinates missing; supplied from OSM for the Budai Vigadó.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Hagyom%C3%A1nyok+H%C3%A1za+Budapest+Corvin+t%C3%A9r+8&format=json

### Hungarian Jewish Museum and Archives (`hungarian-jewish-museum-and-archives`)

- address: H-1075 Budapest, Wesselény utca 7. → H-1075 Budapest, Dohány utca 2.  
  Reason: Official address is Dohány utca 2 (matches the longForm text); Wesselény utca 7 is a visitor-entrance address.  
  Evidence: https://www.milev.hu/hungarian-jewish-museum.html
- "Theodor Herzl's childhood home" → "Theodor Herzl's birthplace"  
  Reason: Wikipedia says the building was constructed on the plot of the house where Herzl was born; 'childhood home' is not stated.  
  Evidence: https://en.wikipedia.org/wiki/Doh%C3%A1ny_Street_Synagogue
- "The synagogue-related collection also includes the silver trowel used to lay the keystone in 1859." → "According to Wikipedia, the silver trowel used to lay the synagogue's keystone is kept at the museum."  
  Reason: The 1859 date for the keystone laying is unsupported.  
  Evidence: https://en.wikipedia.org/wiki/Doh%C3%A1ny_Street_Synagogue

### Hungarian National Gallery (`hungarian-national-gallery`)

- "Mihály Munkácsy is represented by Christ in front of Pilate, dated 1881, and Csontváry by Ruins of the Ancient Theatre at Taormina." → "The museum's catalogue lists a version of Mihály Munkácsy's Christ before Pilate, dated 1881."  
  Reason: Catalogue confirms a version, marked not on display; the larger painting is in Debrecen; Taormina claim unverified.  
  Evidence: https://en.mng.hu/?p=120223

### Hungarian National Museum (`hungarian-national-museum`)

- "Wikipedia adds that his poem Nemzeti dal was recited on the front steps." → "the museum adds that, contrary to later tradition, he did not recite the Nemzeti dal there, although popular tradition (repeated by Wikipedia) places its reading on the front step…"  
  Reason: The museum's own history page explicitly says Petőfi did not recite the National Song, so the steps story must be worded as tradition.  
  Evidence: https://mnm.hu/en/about-museum
- "Its steps are tied to the revolution of 15 March 1848" → "The area in front of it is tied to the revolution of 15 March 1848"  
  Reason: Museum confirms Petőfi addressed the crowd in front of the building but not the steps; steps are a tradition.  
  Evidence: https://mnm.hu/en/about-museum
- "The steps outside the museum are strongly associated with" → "The area in front of the museum is strongly associated with"  
  Reason: Same as above; avoids stating the steps tradition as fact.  
  Evidence: https://mnm.hu/en/about-museum
- "lies in the district behind the museum" → "is a short walk from the museum"  
  Reason: Vague and unverified location wording; coordinates show it is a few hundred metres away.  
  Evidence: https://en.wikipedia.org/wiki/Metropolitan_Ervin_Szab%C3%B3_Library
- "Ágoston Kubinyi, the museum's first director, is credited with protecting the original manuscript of the poem during the War of Independence." → "Ágoston Kubinyi, who directed the museum from 1843, was entrusted that morning by Petőfi and Jókai with two freshly printed leaflets, the Nemzeti dal and the Twelve Points, and in…"  
  Reason: The 'first director' and 'original manuscript' claims are unsupported; the museum names Miller as first director in 1812, and a Hungarian government profile of Kubinyi describes the leaflets and the safe-conduct.  
  Evidence: https://2010-2014.kormany.hu/download/0/90/41000/Kubinyi%20%C3%81goston%20ismertet%C5%91.pdf
- "and the national holiday is still commemorated in front of the museum each year." → "and the central state commemoration of the national holiday is held in front of the museum each year."  
  Reason: Tightened to the museum's own wording.  
  Evidence: https://mnm.hu/en/about-museum

### Hungarian Natural History Museum (`hungarian-natural-history-museum`)

- "It was originally the Ludovika riding hall and later the Alfa Cinema, which burned in 1992." → "Hungarian sources describe it as the former covered riding hall of the Ludovika, which housed the Alfa cinema after the Second World War; one cinema history says the cinema closed…"  
  Reason: Claim rested on a single secondary source; now attributed to Hungarian sources, with the 1990 closure and 1992 fire made explicit. No museum or archive primary source could be reached.  
  Evidence: https://hu.wikipedia.org/wiki/Magyar_Term%C3%A9szettudom%C3%A1nyi_M%C3%BAzeum
- "in 1818 the botanical department began with the herbarium of Pál Kitaibel" → "in 1818 the botanical department began with the plant collection of Pál Kitaibel"  
  Reason: Hungarian Wikipedia says Kitaibel's plant collection (növénygyűjtemény) was bought in 1818; the word herbarium is not used by the source.  
  Evidence: https://hu.wikipedia.org/wiki/Magyar_Term%C3%A9szettudom%C3%A1nyi_M%C3%BAzeum

### Hungarian Parliament (`hungarian-parliament`)

- "Regular sittings began in 1902, and the building was finished in 1904." → "The keys to the building were handed over in 1902, and it was fully completed in 1904."  
  Reason: No source found for 'regular sittings began in 1902'; Wikipedia states the keys were handed over in 1902 and completion came in 1904.  
  Evidence: https://en.wikipedia.org/wiki/Hungarian_Parliament_Building
- "Parliament's own historical guide records that Imre Steindl continued supervising the complex project despite declining health, and died shortly before the completed building coul…" → "Imre Steindl went blind before the building was completed and died in 1902, two years before it was fully finished in 1904."  
  Reason: The attributed official guide could not be opened to confirm the wording; Wikipedia gives Steindl's death in 1902 and completion in 1904, and sources conflict on how close the death was to an 'inauguration'.  
  Evidence: https://en.wikipedia.org/wiki/Imre_Steindl

### Hungarian Railway History Park (`hungarian-railway-history-park`)

- address: Hungarian Railway History Park → Tatai út 95, 1142 Budapest  
  Reason: Address field contained the attraction name, not an address.  
  Evidence: https://hu.wikipedia.org/wiki/Magyar_Vas%C3%BAtt%C3%B6rt%C3%A9neti_Park
- coordinates: 47.54253164798794,19.09566754251122 → 47.5410717,19.0969917  
  Reason: Stored point is roughly 170-190 m from the OSM and Wikipedia positions of the park (limit about 150 m).  
  Evidence: https://nominatim.openstreetmap.org/search?q=Magyar+Vas%C3%BAtt%C3%B6rt%C3%A9neti+Park+Budapest&format=json&limit=3

### Hungarian State Opera (`hungarian-state-opera`)

- "and the royal box carries sculptures representing the four operatic voices" → "and the boxes beside the royal box carry sculptures representing the four operatic voices"  
  Reason: The Opera's own site places the four voice statues in the boxes neighbouring the royal box rather than in the royal box itself.  
  Evidence: https://opera.hu/en/about-us/building/opera/royal-box
- "uncovered original wall colours and materials, renewed pipework and structure, connected the orchestra pit to the auditorium and installed new stage machinery" → "restored the gold paint and other original decorative surfaces, improved the basement waterproofing and building services, rebuilt the orchestra pit to improve the acoustics and r…"  
  Reason: Budapest Times describes restored gold paint and doorframes, improved basement insulation, a rebuilt mobile orchestra pit for acoustics and replacement of the 1984 stage machinery; it does not support 'uncovered original wall colours', 'renewed structure' or …  
  Evidence: https://www.budapesttimes.hu/arts/opera-house-about-to-burst-into-song-again/
- " The building brought opera and ballet into a purpose-built theatre after years of sharing stages with drama." → ""  
  Reason: No source found for this statement about prior shared stages; the sentence is removed and the remaining paragraph stays grammatical.  
  Evidence: https://www.opera.hu/en/about-us/building/opera/the-construction-of-the-opera-house/
- "A sweeping main staircase was designed to let audiences show off their gowns." → "According to Wikipedia, the vast, sweeping main staircase allowed ladies to show off their new gowns."  
  Reason: Wikipedia is the only source found for this; wording tightened to match it and attributed.  
  Evidence: https://en.wikipedia.org/wiki/Hungarian_State_Opera_House
- "Its position on Andrássy Avenue helped establish the new boulevard as a showcase of modern Budapest." → "Its position on Andrássy Avenue helped establish the new boulevard as a showcase of modern Budapest. It gave the opera company a dedicated home; until then opera had been staged a…"  
  Reason: Restores the removed idea in the form the sources actually support (opera only, no ballet claim).  
  Evidence: https://www.opera.hu/en/about-us/building/opera/the-construction-of-the-opera-house/

### IKONO Budapest (`ikono-budapest`)

- address: IKONO Budapest → 1052 Budapest, Váci utca 27.  
  Reason: Address field contained only the venue name; official site gives Váci utca 27 and We Love Budapest adds the 1052 postcode.  
  Evidence: https://ikono.global/en/budapest

### Inner City Parish Church of the Assumption (`inner-city-parish-church-assumption`)

- "Franz Joseph took an oath in front of the church in 1867 before his coronation" → "Franz Joseph took the royal oath in front of the church in 1867, though sources differ on whether this was before or after his coronation"  
  Reason: Visit Hungary says the oath in the square followed the coronation; the parish history says it preceded it. The sequence is disputed between the two cited sources.  
  Evidence: https://visithungary.com/articles/2000-years-of-history-close-up-in-the-inner-city-parish-church-of-the-assumption

### Kazinczy Street Orthodox Synagogue (`kazinczy-street-orthodox-synagogue`)

- "in July 1913 the architects submitted a plainer facade to cut costs." → "in July 1913 the architects submitted a revised facade design, which Hungarian Wikipedia describes as plainer and cheaper, although English Wikipedia describes the change as makin…"  
  Reason: Sources conflict on the character of the 1913 facade change; the original stated the plainer version as fact.  
  Evidence: https://en.wikipedia.org/wiki/Kazinczy_Street_Synagogue,_Budapest
- "the Löffler brothers submitted a revised, plainer facade with lower material costs" → "the Löffler brothers submitted a revised facade design, which Hungarian Wikipedia describes as plainer with lower material costs (English Wikipedia describes the change as more or…"  
  Reason: Same conflict between Hungarian and English Wikipedia, as in the longForm text.  
  Evidence: https://hu.wikipedia.org/wiki/Kazinczy_utcai_zsinag%C3%B3ga_(Budapest)
- "The budget was 650,000 korona, and the detailed plans were approved on 8 November 1910." → "The detailed plans were approved on 8 November 1910."  
  Reason: Currency amount removed to meet the no-prices/currency rule (claim itself is in hu.wikipedia).  
  Evidence: https://hu.wikipedia.org/wiki/Kazinczy_utcai_zsinag%C3%B3ga_(Budapest)
- coordinates: (none) → 47.49857,19.06246  
  Reason: Coordinates missing; supplied from OSM (Sász-Chevra Zsinagóga), consistent with Hungarian Wikipedia.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Kazinczy+utca+Budapest+VII+zsinag%C3%B3ga&format=json

### Kiscelli Museum (`kiscelli-museum`)

- "In 1784 the religious orders were dissolved and the complex passed to the state chamber." → "In the 1780s, under Joseph II, the order was dissolved; sources give 1783 or 1784."  
  Reason: Sources differ on the year; 'state chamber' unsupported.  
  Evidence: https://hu.wikipedia.org/wiki/Kiscelli_M%C3%BAzeum
- "In 1911 the Viennese furniture manufacturer and collector Miksa Schmidt bought the neglected property, restored it and used part of it as a showroom, and for a long time it was ca…" → "Around 1911 (sources give 1910 or 1911) the Viennese furniture manufacturer and collector Miksa Schmidt bought the property and converted it into a mansion, and for a long time it…"  
  Reason: Purchase year differs between sources; showroom use and 'neglected property restored' not supported.  
  Evidence: https://telekomspots.hu/en/venues/82/kiscelli-museum
- "The museum's own site lists" → "A visitor guide lists"  
  Reason: The official museum.hu listing has no transport information; the routes come from a visitor guide.  
  Evidence: https://hungaryunlocked.com/kiscelli-museum-budapest-guide/

### Kunsthalle (`kunsthalle`)

- "in 1983 an exhibition from Vienna's Museum of Modern Art was shown here, which led Peter and Irene Ludwig to begin talks about a contemporary art museum in the city, and the Capa …" → "in 1983 the exhibition Universal Art since 1960 came here from Vienna, and its success prompted talks about a contemporary art museum in Budapest."  
  Reason: 'Museum of Modern Art' not supported; Capa Center branch claim unsupported by any source opened.  
  Evidence: https://www.ludwigmuseum.hu/en/node/192

### Light Art Museum (LAM) (`light-art-museum-lam`)

- "Reports announced a temporary closure in mid-2026, so check the museum's site first." → "A June 2026 report announced a temporary closure, but the museum's site now lists a new exhibition, EGO, from October 2026; check it for current status."  
  Reason: Closure notice is outdated: museum site and a 12 Oct 2026 article show EGO running from October 2026 to February 2027.  
  Evidence: https://lightartmuseum.hu/
- "A June 2026 article reported that the museum was temporarily closing at the end of June 2026 as its exhibition More than Human ended, and gave no reopening date." → "A June 2026 article reported that the museum was temporarily closing at the end of June 2026 as its exhibition More than Human ended, with no date for a full reopening; the museum…"  
  Reason: Add the later reopening evidence.  
  Evidence: https://welovebudapest.com/cikk/2026/10/12/light-art-museum-budapest-ego-kiallitas/
- "Check the official LAM site (lam.xyz) first: a June 2026 report announced a temporary closure with no reopening date." → "Check the official LAM site (lightartmuseum.hu) first: a June 2026 report announced a temporary closure, but the site now lists a new exhibition, EGO, from October 2026."  
  Reason: Outdated closure tip; lam.xyz redirects to lightartmuseum.hu.  
  Evidence: https://lightartmuseum.hu/
- "A June 2026 article reported that the museum would temporarily close at the end of June 2026 and gave no reopening date, so check the official site for its current status." → "A June 2026 article reported that the museum would temporarily close at the end of June 2026 and gave no reopening date; the museum's website and an October 2026 article later des…"  
  Reason: Add the later reopening evidence.  
  Evidence: https://welovebudapest.com/cikk/2026/10/12/light-art-museum-budapest-ego-kiallitas/

### Ludwig Museum (`ludwig-museum`)

- "and joined his wife Irene's family chocolate business" → "and ran a chocolate business"  
  Reason: Museum says he ran the family chocolate business; the 'wife Irene's family' detail is not stated by the museum.  
  Evidence: https://www.ludwigmuseum.hu/en/node/29878
- "The museum names Warhol's Single Elvis, Rauschenberg's Hedge, Oldenburg's Lingerie Counter and Lichtenstein's Vicki among its American pop art, and Hungarian artists such as Lászl…" → "The museum names Warhol, Lichtenstein and Oldenburg among the American and British pop artists whose emblematic works the Ludwigs brought to Budapest, and Hungarian artists such a…"  
  Reason: Specific work titles could not be confirmed on any museum page; artist names are confirmed.  
  Evidence: https://www.ludwigmuseum.hu/en/node/1436
- address: (none) → H-1095 Budapest, Komor Marcell u. 1.  
  Reason: Address was missing; the Ludwig Museum is in the Müpa building at Komor Marcell u. 1.  
  Evidence: https://en.wikipedia.org/wiki/M%C3%BCpa_Budapest
- coordinates: (none) → 47.4694,19.0714  
  Reason: Coordinates were missing; point lies between the Wikipedia Müpa point and the Nominatim Ludwig Museum point (both within about 50 m).  
  Evidence: https://nominatim.openstreetmap.org/search?q=Komor+Marcell+utca+1+Budapest&format=json

### Lukács Thermal Bath (`lukacs-thermal-bath`)

- address: www.lukacsfurdo.hu → H-1023 Budapest, Frankel Leó út 25-29.  
  Reason: The address field contained a website, not an address.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Luk%C3%A1cs+f%C3%BCrd%C5%91+Frankel+Le%C3%B3+%C3%BAt+25+Budapest&format=json&limit=3
- "and the present complex dates mainly from the 1880s" → "and the present complex developed from the 1880s onward"  
  Reason: The complex grew in stages (1884 purchase, 1893 company, 1921 redesign giving its current form), so 'dates mainly from the 1880s' overstates.  
  Evidence: https://hu.wikipedia.org/wiki/Luk%C3%A1cs_f%C3%BCrd%C5%91
- "The present bath dates from the mid-1880s." → "The present bath grew from development that began in the mid-1880s."  
  Reason: Same as above: the current form dates from later work, including Hikisch's 1920s redesign described in the same paragraph.  
  Evidence: https://hu.wikipedia.org/wiki/Luk%C3%A1cs_f%C3%BCrd%C5%91
- "Trams 4 and 6 to Zsigmond tér are listed by one guide as about a two-minute walk, and Batthyány tér on the M2 line is about ten minutes on foot." → "Budapest by Locals lists trams 4 and 6 to Margit híd, budai hídfő and trams 17, 19 and 41 to Komjádi Béla utca as the stops for the neighbouring Veli Bej Bath; check BKK's journey…"  
  Reason: The Zsigmond tér tram stop and the walking times could not be confirmed in any source; replaced with directions seen at a source for the adjacent bath.  
  Evidence: https://www.budapestbylocals.com/veli-bej-bath/
- "Budapest by Locals lists trams 4 and 6 to Margit híd, budai hídfő and trams 17, 19 and 41 to Komjádi Béla utca as the stops for the neighbouring Veli Bej Bath; check BKK's journey…" → "The bath's official site lists trams 4, 6, 17 and 19, buses 9 and 109 and the HÉV suburban railway (Margit híd stop) as ways to reach it; check BKK's journey planner for the best …"  
  Reason: Use the bath's own transport information rather than directions written for the neighbouring Veli Bej Bath.  
  Evidence: https://www.lukacsfurdo.hu/en
- "the National Institute of Rheumatology has operated there since 1951, which is why Lukács still combines medical treatment with bathing" → "the rheumatology institute based there from 1951 has since been reorganised, while Lukács still combines medical treatment with bathing"  
  Reason: The institute was merged in 2021 and integrated into Semmelweis University in 2025, so "has operated there since 1951" is no longer accurate.  
  Evidence: https://www.economx.hu/magyar-gazdasag/reumatologiai-es-immunologiai-klinika-semmelweis-egyetem-integracio-betegellatas-egeszsegugy.805219.html

### Lupa Beach (`lupa-beach`)

- "on the northern edge of Budakalász just beyond the Budapest city limits" → "in Budakalász, just north of the Budapest city limits"  
  Reason: 'Northern edge of Budakalász' misplaces the beach: sources and OSM put it in Budakalász just north of Budapest.  
  Evidence: https://welovebudapest.com/en/article/2017/05/30/soak-up-summery-seaside-vibes-near-budapest-as-lupa-beach-reopens/
- "on the northern edge of Budakalász just north of the Budapest city limits" → "in Budakalász, just north of the Budapest city limits"  
  Reason: Same fix in the long-form paragraph.  
  Evidence: https://welovebudapest.com/en/article/2017/05/30/soak-up-summery-seaside-vibes-near-budapest-as-lupa-beach-reopens/

### Madame Tussauds Budapest (`madame-tussauds-budapest`)

- "Her first exhibition opened in London in 1835." → "Her first permanent exhibition opened on Baker Street in London in 1835."  
  Reason: 1835 is the opening of her first permanent exhibition after decades of touring; she exhibited in London from 1802.  
  Evidence: https://en.wikipedia.org/wiki/Marie_Tussaud
- "According to a Budapest Times report, the first Madame Tussauds exhibition opened in London in 1835." → "According to Wikipedia, she opened her first permanent exhibition on Baker Street in London in 1835, after decades of touring."  
  Reason: Make the 1835 date precise (permanent exhibition, Baker Street).  
  Evidence: https://en.wikipedia.org/wiki/Marie_Tussaud
- "its Hungarian figures give it a local character that other Madame Tussauds sites lack." → "its 17 Hungarian figures, out of 51 in total according to We Love Budapest, give it a local character."  
  Reason: The claim that other sites lack local character is unsupported; replaced with a sourced figure count.  
  Evidence: https://welovebudapest.com/en/article/2023/05/24/sights-culture-madame-tussauds-budapest-opening-photos/

### Mai Manó House (`mai-mano-house`)

- " After the war the building housed a school and a showroom, and then a branch of the Hungarian Car Club for about 30 years." → ""  
  Reason: Not supported by the official site, the library page or We Love Budapest.  
  Evidence: https://fszek.hu/en/Entities/110/0601anzix-mai-mano

### BudaTower – Mary Magdalene Tower (`mary-magdalene-tower`)

- "Sources say the tower has been closed, so check its status." → "The tower reopened to visitors in July 2025 under district council management, so check its current status."  
  Reason: Tower closed in February 2025 but officially reopened on 15 July 2025.  
  Evidence: https://dailynewshungary.com/budapest-600-year-old-tower-reopens/
- "A news report says the tower opened to tourists in 2017, but that the district council withdrew the previous operator's concession in early 2025 and that the tower would be closed…" → "A news report says the tower opened to tourists in 2017, that the district council withdrew the previous operator's concession in early 2025 and the tower closed in February 2025,…"  
  Reason: The closure described as upcoming ended with the official reopening on 15 July 2025.  
  Evidence: https://dailynewshungary.com/budapest-600-year-old-tower-reopens/
- "A 2025 news report says the tower was closed to visitors while the owner, the first district council, planned a new use." → "A July 2025 news report says the tower reopened on 15 July 2025, run by its owner, the first district council, as a broader cultural venue after a closure that began in February 2…"  
  Reason: The report that it was closed is superseded by the 15 July 2025 reopening.  
  Evidence: https://dailynewshungary.com/budapest-600-year-old-tower-reopens/

### Matthias Church (`matthias-church`)

- "who built the south-west bell tower, one of the finest pieces of Gothic architecture in Hungary, and who married here in 1463 and 1476" → "whose coat of arms on the south-west bell tower dates its rebuilding to 1470 (the earlier tower had collapsed in 1384), and who married here in 1463 and 1476"  
  Reason: Sources say the south tower collapsed in 1384 and was rebuilt in 1470 according to Matthias's coat of arms; the official chronology only mentions the coat of arms, so 'built' overstates his role.  
  Evidence: https://en.wikipedia.org/wiki/Matthias_Church
- "The medieval crypt houses the Ecclesiastical Art Museum" → "The Ecclesiastical Art Museum begins in the crypt"  
  Reason: Wikipedia says the museum begins in the crypt but notes the crypt dates from 1780 and was renewed in neo-Gothic style; the official chronology says only that the museum was set up in the church in 1964. 'Medieval crypt' is unsupported.  
  Evidence: https://en.wikipedia.org/wiki/Matthias_Church
- "In 1309 Charles I was crowned in the church with a provisional crown. The church's own historical account notes that his kingship required a later coronation with the Holy Crown o…" → "In 1309 Charles I was crowned in the church; the church's own chronology calls the crown provisional, while other sources describe a newly consecrated crown. His coronation with t…"  
  Reason: The official chronology says 'provisional crown' in 1309 but does not mention a later Holy Crown coronation; Wikipedia says a new crown was used in 1309 and the Holy Crown coronation was in Székesfehérvár on 27 August 1310. Sources differ on the 1309 crown, s…  
  Evidence: https://en.wikipedia.org/wiki/Charles_I_of_Hungary

### Medieval Jewish Prayer House (`medieval-jewish-prayer-house`)

- "tombstones in the gateway" → "tombstones in a side room off the gateway"  
  Reason: Heritage register places the tombstones in the room to the left of the gateway, not in the gateway.  
  Evidence: https://budavar.abtk.hu/en/streets-squares-buildings/tancsics-mihaly-street/tancsics-mihaly-street-26.html

### Metropolitan Ervin Szabó Library (`metropolitan-ervin-szabo-library`)

- "was built between 1887 and 1889 to plans by Arthur Meinig" → "was completed in 1889 to plans by Artúr Meinig"  
  Reason: The 1887 start date is not supported by the library's history page or Wikipedia; both give completion in 1889. Name spelling aligned with the longForm text.  
  Evidence: https://fszek.hu/en/kozponti/0801palota-tortenete
- "Later restoration and expansion connected it with neighbouring buildings while preserving elaborate interior rooms," → "Restoration and expansion, completed in 2001, added a new building on Baross utca and renewed the small palace on Reviczky utca, forming one library complex around the palace whil…"  
  Reason: Makes the vague claim concrete and matches the library's own description of the complex.  
  Evidence: https://epa.hu/01300/01367/00009/pdf/03fszek.pdf

### Millenáris Park (`millenaris-park`)

- "a suspended garden with views over Margit körút." → "a suspended garden that, according to the official site, looks towards Margit körút and the Castle District."  
  Reason: Official wording is 'views towards', and the landmarks are the official site's claim, so attribute it; the original also dropped the Castle District.  
  Evidence: https://2023.millenaris.hu/en/about-us
- "a suspended garden, reached by a panoramic lift, looks over Margit körút, the Castle District and the Buda hills." → "a suspended garden, reached by a panoramic lift, offers views towards Margit körút, the Castle District and the Buda Hills, according to the official Millenáris site."  
  Reason: Claim is supported only by the official site; reworded from 'looks over' to 'views towards' and attributed.  
  Evidence: https://2023.millenaris.hu/en/about-us
- address: Millenáris Park → Kis Rókus utca 16-20, 1024 Budapest  
  Reason: Address field held only the name; official street address added.  
  Evidence: https://2023.millenaris.hu/en/about-us

### Müpa Budapest (`mupa-budapest`)

- "with about 1,656 seats according to Wikipedia" → "with about 1,656 seats according to Wikipedia, although other sources give 1,699"  
  Reason: Sources disagree on the seat count (1,656 vs 1,699).  
  Evidence: https://concertobudapest.hu/palace-of-arts

### Museum of Ethnography (`museum-of-ethnography`)

- ", since calls for a suitable building dated back to the 1880s" → ""  
  Reason: The 1880s claim is not supported by Papageno, the museum page or Wikipedia; the remaining sentence (debt of 150 years) is quoted from the director and stays grammatical.  
  Evidence: https://papageno.hu/english/news/2022/05/the-new-building-of-the-museum-of-ethnography-was-inaugurated/
- "Sources differ on when it became fully independent: Wikipedia gives 1947, while a 2022 news report says 1892." → "According to the museum's own history page, it became independent of the Hungarian National Museum in 1947."  
  Reason: The museum's official history gives 1947 and does not mention 1892, so the 'sources differ' hedge is no longer needed.  
  Evidence: https://neprajz.hu/en/muzeumrol/a-muzeum-tortenete.html

### Museum of Fine Arts (`museum-of-fine-arts`)

- "The Old Master paintings number about three thousand, with a focus on Italian art, and include" → "The Old Master paintings number about three thousand and include"  
  Reason: 'Focus on Italian art' is not stated in any source read; removed as unsupported.  
  Evidence: https://www.finestresullarte.info/en/travelnotebooks/9985vn_the-szepma-veszeti-muzeum-in-budapest-hungary-s-largest-art-museum.php

### National Dance Theatre (`national-dance-theatre`)

- "The theatre's site lists resident and guest companies, including the Bozsik Yvette Company, as well as programmes for children, dance education and dance courses." → "The theatre's programme features productions by companies such as Fitos Dezső Társulat and Duda Éva Társulat."  
  Reason: The official site does not mention the Bozsik Yvette Company, does not mark any company as resident, and the education/courses claim was not seen.  
  Evidence: https://www.tancszinhaz.hu/en
- "The programme and the building's closed days change, so the official calendar is the place to confirm what is on." → "The programme changes, so the official calendar is the place to confirm what is on."  
  Reason: The official site lists no closed days, only box-office hours.  
  Evidence: https://www.tancszinhaz.hu/en
- "Check the official site for the current performance calendar, tickets and the building's closed days, since the theatre lists specific closures." → "Check the official site for the current performance calendar and tickets, since the programme changes."  
  Reason: No specific closures are listed on the official site.  
  Evidence: https://www.tancszinhaz.hu/en
- "A Hungarian account says the National Dance Theatre opened in the building on that date as successor to the Táncfórum." → "A Hungarian account says the National Dance Theatre began operating in the building on that date."  
  Reason: The Hungarian source supports the 1 December 2001 start but does not mention the Táncfórum.  
  Evidence: https://hu.wikipedia.org/wiki/V%C3%A1rsz%C3%ADnh%C3%A1z_(Budapest)

### New York Café (`new-york-cafe`)

- "In February 2001 the Hungarian government sold the building to the Italian hotel group Boscolo" → "In early 2001 the Hungarian government sold the building to the Italian hotel group Boscolo"  
  Reason: Sources conflict on the month (February per Wikipedia, January per another source).  
  Evidence: https://en.wikipedia.org/wiki/Anantara_New_York_Palace_Budapest_Hotel
- address: New York Café → Erzsébet körút 9-11, 1073 Budapest  
  Reason: Address field only repeated the venue name; the building is at Erzsébet körút 9-11, 1073 Budapest.  
  Evidence: https://nominatim.openstreetmap.org/search?q=New+York+Palace+Erzsébet+körút+9+Budapest&format=json&limit=3

### Normafa (`normafa`)

- "The cogwheel railway opened in 1871 and was extended to Széchenyi-hegy in 1890." → "The cogwheel railway opened in 1874 and was extended to Széchenyi-hegy in 1890."  
  Reason: The Budapest cog-wheel railway opened on 24 June 1874, not 1871; the 1890 extension is correct.  
  Evidence: https://en.wikipedia.org/wiki/Budapest_Cog-wheel_Railway
- "In 1972 the Children's Railway stop was moved up to serve the Hotel Olimpia, which has since been demolished." → "The Hotel Olimpia, opened in 1972 on the Normafa plateau, was later demolished, and the Eötvös Loránd Park now occupies its site."  
  Reason: No source links the Children's Railway stop's move to the hotel; a Fortepan caption dates the stop's relocation to 1973. The hotel facts (1972 handover, park on its site) are supported.  
  Evidence: https://welovebudapest.com/en/article/2020/02/20/changes-afoot-for-popular-buda-getaway-normafa-1
- "Sporting life halted during the Second World War and later revived." → "The district's page says the flourishing sporting life was halted by the Second World War but soon revived."  
  Reason: Statement is from the hegyvidek.hu page; Hungarian Wikipedia describes the war period differently, so attribute it.  
  Evidence: https://hegyvidek.hu/english/recreation/normafa
- coordinates: (none) → 47.50271,18.96614  
  Reason: Coordinates missing; supplied.  
  Evidence: https://hu.wikipedia.org/wiki/Normafa

### Óbuda Museum (`obuda-museum`)

- "from Roman settlement to the twentieth-century city" → "from its medieval royal days to the 1970s"  
  Reason: The museum's exhibition covers the Middle Ages to the 1970s, not the Roman period.  
  Evidence: https://museum.hu/exhibition/13502/obuda_-_Three_Faces_of_a_Town
- "The 'Toys in the City' exhibition uses playthings made in Hungary before 1990 to show how family life, design and manufacturing changed." → "The 'Toys in the City' (Játék a városban) exhibition, which the museum calls Budapest's only permanent toy-history exhibition, presents Hungarian toys through the theme of the cit…"  
  Reason: The 'before 1990' scope and the family-life/design/manufacturing framing are not supported by the museum's description.  
  Evidence: https://www.museum.hu/muzeum/63/obudai_Muzeum/kiallitas

### Óbuda Synagogue (`obuda-synagogue`)

- "Pair the visit with a walk around Óbuda, which English Wikipedia says had the largest Jewish community in Hungary in the 1730s." → "Pair the visit with a walk around Óbuda; English Wikipedia says that when the synagogue was built, Óbuda's was the largest Jewish community in Hungary."  
  Reason: English Wikipedia ties the 'largest Jewish community in Hungary' statement to the time the synagogue was built (completed 1821), not to the 1730s, which is only when the congregation was founded.  
  Evidence: https://en.wikipedia.org/wiki/%C3%93buda_Synagogue

### Pesti Vigadó (`pesti-vigado`)

- "After the 1838 flood Franz Liszt gave the first post-flood concert in the Redoute and premiered his Rákóczi March there." → "According to Hungary Today, Franz Liszt gave the first concert in the Redoute after the 1838 flood and played his Rákóczi March there for the first time, but other sources credit …"  
  Reason: Claim stated as fact but sources conflict on who gave the flood-relief concert and where/when the Rákóczi March was first played in Pest.  
  Evidence: https://welovebudapest.com/cikk/2023/07/07/latnivalok-es-kultura-egy-eltunt-balterem-nyomaban-a-pesti-vigado-elodje-a-redoute/ ; https://hungarytoday.hu/emblematic-budapest-building-of-the-romantic-era-turns-160/
- "Reconstruction began in 1968, and it reopened on 12 March 1980 with 660-seat and 200-seat halls." → "Reconstruction began in 1968, and the rebuilt hall opened to the public on 15 March 1980 according to the Vigadó's own history page; Hungary Today gives 12 March and mentions 660-…"  
  Reason: Official Vigadó history page (and hu.wikipedia) give 15 March 1980; the 12 March date and seat counts come only from Hungary Today.  
  Evidence: https://vigado.hu/en/a-pesti-vigado-tortenete

### Petőfi Museum of Literature (`petofi-museum-of-literature`)

- "It was rebuilt in 1832 to plans by A. P. Riegl and József Hofrichter." → "It was rebuilt from 1832 to designs by the Viennese architect Anton Pius Riegl, with József Hofrichter leading the construction, and the new palace was inaugurated in 1841."  
  Reason: Sources describe different roles for Riegl, Hofrichter and Koch and give 1841 for completion.  
  Evidence: https://hu.wikipedia.org/wiki/K%C3%A1rolyi-palota_(Belv%C3%A1ros)
- "On 8 January 1849 Lajos Batthyány" → "In January 1849 Lajos Batthyány"  
  Reason: Sources disagree on the exact date (8, 9 or 13 January).  
  Evidence: https://hu.wikipedia.org/wiki/K%C3%A1rolyi-palota_(Belv%C3%A1ros)
- "After he emigrated in 1919 the state confiscated the palace, and from 1929 it came under the control of the capital city." → "After he emigrated in 1919 the state confiscated the palace (a heritage register dates this to 1920), and the capital took over the building in the late 1920s, in 1928 or 1929 dep…"  
  Reason: Conflicting dates between sources.  
  Evidence: https://pim.hu/en/history-mansion
- "The Municipal Art Gallery was based there for twenty years from 1930." → "The capital's picture gallery was based there until 1953, and the Petőfi Museum moved in four years later."  
  Reason: 1930 start is not supported (sources give 1928, 1932 or 1933); end year 1953 is supported.  
  Evidence: https://pim.hu/en/history-mansion
- "In the Second World War the building escaped major damage, but its furnishings and artworks were looted or auctioned." → "Hungarian Wikipedia records auctions of the family's art in 1932 and of a library in 1937."  
  Reason: No source supports the WWII damage or looting statement.  
  Evidence: https://hu.wikipedia.org/wiki/K%C3%A1rolyi-palota_(Belv%C3%A1ros)

### Robert Capa Contemporary Photography Center (`robert-capa-contemporary-photography-center`)

- "established in 2013 on the centenary of Robert Capa's birth" → "established in 2013, the centenary year of Robert Capa's birth"  
  Reason: Capa was born in 1913; the centre opened in the centennial year, not on the centenary itself.  
  Evidence: https://en.wikipedia.org/wiki/Robert_Capa_Contemporary_Photography_Center
- "opened on 3 December 2013, the centenary of Robert Capa's birth" → "opened on 3 December 2013, in the centenary year of Robert Capa's birth"  
  Reason: Same wording issue in the long text.  
  Evidence: https://en.wikipedia.org/wiki/Robert_Capa_Contemporary_Photography_Center
- "The staircase has a large stained-glass window by Miksa Róth based on designs by the painter József Rippl-Rónai, and the stone benches were designed by Ödön Lechner." → "The staircase has a large stained-glass window by Miksa Róth."  
  Reason: Rippl-Rónai designs and Lechner benches rest on a single secondary source; only the Róth window is confirmed.  
  Evidence: https://en.wikipedia.org/wiki/Robert_Capa_Contemporary_Photography_Center
- "The staircase has a large stained-glass window by Miksa Róth." → "The staircase has a large glass window by Miksa Róth, based on designs by the painter József Rippl-Rónai, and the stone benches were designed by Ödön Lechner."  
  Reason: The centre's own history page states both the Rippl-Rónai designs and the Lechner benches; they were removed earlier only because a Wikipedia-level source was missing.  
  Evidence: https://capacenter.hu/en/about-the-center/

### Római Open-Air Bath (`romai-open-air-bath`)

- "but swimming is not allowed there and only wading is" → "but swimming was not allowed there at the time and only wading was; check the posted rules for the current season"  
  Reason: The Plázs is now an authorised natural bathing place (2026 permit), so a present-tense ban cannot be confirmed.  
  Evidence: https://obuda.hu/wp-content/uploads/2026/06/UZEMELTETESI-SZABALYZAT-2026.pdf
- "The Danube riverside beach at Római-part is a separate site where swimming is not allowed." → "The Danube riverside beach at Római-part is a separate, seasonal site run by the Óbuda district with its own rules on bathing, so check the notices on site before going in."  
  Reason: Present-tense swimming ban cannot be confirmed for 2026; the beach is an authorised seasonal bathing place.  
  Evidence: https://obuda.hu/wp-content/uploads/2026/06/UZEMELTETESI-SZABALYZAT-2026.pdf

### Rudas Thermal Bath (`rudas-thermal-bath`)

- "The Garden of Philosophers is on the hillside behind the baths and can be added to the same outing." → "The baths stand at the foot of Gellért Hill, so the hill is close by for a walk before or after your visit."  
  Reason: No source places the Garden of Philosophers directly behind the baths; the foot-of-Gellért-Hill location is stated by Wikipedia.  
  Evidence: https://en.wikipedia.org/wiki/Rudas_Baths
- "Tram 2 along the Buda embankment, which We Love Budapest mentions, passes near the bath at the foot of Gellért Hill." → "The bath's official site lists trams 19, 41, 56 and 56A and several bus lines as ways to reach Döbrentei tér; check BKK's journey planner for the best route."  
  Reason: The cited article gives no tram directions and tram 2 does not run on the Buda embankment; official transport list used instead.  
  Evidence: https://www.rudasfurdo.hu/en

### Rumbach Street Synagogue (`rumbach-street-synagogue`)

- "and they are topped with lotus carvings and small domed towers that resemble minarets." → "and, according to Hungarian Wikipedia, they are topped with lotus-flower carvings and continue in small domed towers that resemble minarets."  
  Reason: Lotus carvings are only found in Hungarian Wikipedia; attribute rather than state as established fact.  
  Evidence: https://hu.wikipedia.org/wiki/Rumbach_utcai_zsinag%C3%B3ga
- "The plaster is greyish-yellow with red brick stripes and blue enamelled bricks." → "Sources describe the colours of the restored facade differently, so the exact palette is left unstated here; according to Hungarian Wikipedia, its central part carries the two tab…"  
  Reason: Colour details come from a single lineage (Hungarian Wikipedia) and conflict with other descriptions; removed rather than stated (editor decision in Phase 18). The tablets of Moses detail is attributed.  
  Evidence: https://hu.wikipedia.org/wiki/Rumbach_utcai_zsinag%C3%B3ga

### Shoes on the Danube Bank (`shoes-on-the-danube-bank`)

- "On 8 January 1945, Károly Szabó and 20 policemen broke into an Arrow Cross house and freed the people who had been forced toward the riverbank;" → "On 8 January 1945, Károly Szabó and 20 policemen with drawn bayonets rescued the occupants of a building on Vadász Street whom an Arrow Cross brigade had forced toward the river;"  
  Reason: Source describes a rescue of the occupants of a building on Vadász Street; it does not say they broke into an Arrow Cross house.  
  Evidence: https://en.wikipedia.org/wiki/Shoes_on_the_Danube_Bank
- "Rows of bronze shoes on the stone edge" → "Rows of iron shoes on the stone edge"  
  Reason: The memorial's shoes are cast iron; the body text says iron and the alt text said bronze.  
  Evidence: https://en.wikipedia.org/wiki/Shoes_on_the_Danube_Bank

### St. Stephen's Hall (`st-stephen-s-hall`)

- "In December 1916 the Holy Crown was taken out here before the coronation of Karl I, and the following day was the last time the room played a ceremonial role." → "In December 1916, the day before the coronation of Karl I, the chest holding the Holy Crown was opened in the hall before the crown was taken to Matthias Church; this was the last…"  
  Reason: Source says the crown was handled the day before the coronation and that this was the last ceremonial use; the draft implied the last use was the following day.  
  Evidence: http://welovebudapest.com/en/article/2021/08/23/sights-culture-sparkling-st-stephen-s-hall-now-fully-renovated-and-free-to-visit-all-week
- address: (none) → Budapest, Szent György tér 2, 1014  
  Reason: Address was missing; Budapest.com and OSM both give Szent György tér 2, 1014 (same format as the Buda Castle District entry).  
  Evidence: https://www.budapest.com/en/locations/saint-stephens-hall-in-buda-castle
- coordinates: (none) → 47.49516,19.04006  
  Reason: Coordinates were missing; Wikidata Q108289391 (47.4951618, 19.0400589) and OSM Nominatim (47.4951425, 19.0401663) agree within about 10 m.  
  Evidence: https://www.wikidata.org/wiki/Special:EntityData/Q108289391.json

### Szamos Chocolate Museum (`szamos-chocolate-museum`)

- "Sources date from 2017 and 2020, so confirm the current status first." → "The official Szamos site lists it with guided tours booked online, but check current details before visiting."  
  Reason: Official site now reached; it lists the museum and online tour booking. Wording stays cautious because the official page is undated.  
  Evidence: https://szamos.hu/csokolademuzeum
- "and the available accounts were written in 2017 and 2020, so check its current status before planning a visit." → "and the official Szamos site now lists it as a visitor attraction with online-booked guided tours, so check that site for current details before planning a visit."  
  Reason: Replaces the outdated-sources caveat with what the official site shows.  
  Evidence: https://szamos.hu/csokolademuzeum
- "Visitors in that account made their own chocolate bar there." → "According to the official Szamos site, visitors can also try making a chocolate product and take it home."  
  Reason: Official wording differs from the 2017 account (own chocolate bar).  
  Evidence: https://szamos.hu/csokolademuzeum
- "including an 80-kilogram marzipan replica of Jean-Étienne Liotard's painting The Chocolate Girl" → "including a large marzipan replica of Jean-Étienne Liotard's painting The Chocolate Girl, about 78 kilograms according to the Szamos site"  
  Reason: Official site gives about 78 kg; the Budapest Times figure of 80 kg differs.  
  Evidence: https://szamos.hu/csokolademuzeum
- "The published accounts of the tour date from 2017 and 2020, so check the official Szamos site for whether the museum is currently open and what it includes." → "Guided tours are booked online through the official Szamos site. Scheduled public tours are reported to be in Hungarian, with English offered to pre-arranged groups, so check this…"  
  Reason: Practical, sourced booking and language information replaces the generic caveat.  
  Evidence: https://hungaryunlocked.com/chocolate-tours-at-the-chocolate-museum-a-delightful-leisure-program/
- coordinates: 47.50574116898458,19.04858100019525 → 47.50557,19.04774  
  Reason: OSM node for Szamos Csokolademuzeum at Kossuth Lajos ter 10 is 47.5055686, 19.0477431; old point was about 65 m away.  
  Evidence: https://nominatim.openstreetmap.org/search?q=Kossuth+Lajos+t%C3%A9r+10+Budapest&format=json&limit=3

### Széchenyi Thermal Bath (`szechenyi-thermal-bath`)

- "discovered in 1938 at 1,256 metres" → "discovered in 1938 at a depth of roughly 1,240 to 1,256 metres (sources differ)"  
  Reason: Wikipedia gives 1,256 m while visithungary gives 1,240 m for the 77 C well.  
  Evidence: https://visithungary.com/articles/interesting-facts-that-few-people-know-about-budapests-iconic-thermal-bath

### The 1956 Monument (`the-1956-monument`)

- "Hundreds of vertical steel elements emerge from the ground and gradually gather into a more united form. Their varying heights and changing surfaces express individuals joining to…" → "Many vertical steel columns, in rusted and stainless steel, rise in an increasingly dense wedge. One description reads them as people gathering in growing numbers and merging into…"  
  Reason: 'Hundreds', 'varying heights' and 'changing surfaces' are not supported by any source checked; HVG and Manchester History support the rewritten wording.  
  Evidence: https://hvg.hu/itthon/20061023_felavattak ; https://manchesterhistory.net/architecture/2000/1956monument.html
- "The monument's axis makes a deliberate 56-degree angle with Dózsa György Road. That numerical detail places the date of the revolution inside the artwork's physical design." → "The memorial is described as a wedge at a 56-degree angle, and a tourism source says its axis makes that angle with Dózsa György Road. The number alludes to the year of the revolu…"  
  Reason: The 56-degree wedge is supported by HVG, but the specific angle with Dózsa György Road rests on a single tourism page, so it is attributed rather than stated as fact.  
  Evidence: https://hvg.hu/itthon/20061023_felavattak

### The Tabán (`the-taban`)

- "The area had been planned as a spa quarter, but a temporary park was created instead." → "Hungarian Wikipedia says the planned new district was never built because of the Second World War, and that the area was landscaped as a public park in the 1960s."  
  Reason: Spa-quarter and temporary-park claim could not be confirmed in any source opened.  
  Evidence: https://hu.wikipedia.org/wiki/Tab%C3%A1n_(Budapest)
- "The area had been considered for a spa quarter, but a temporary park was created instead." → "Hungarian Wikipedia says the planned new district was never built because of the Second World War, and that the area was landscaped as a public park in the 1960s."  
  Reason: Spa-quarter and temporary-park claim could not be confirmed in any source opened.  
  Evidence: https://hu.wikipedia.org/wiki/Tab%C3%A1n_(Budapest)
- "Wikipedia dates the main clearance to 1933 to 1934 and the last surrounding buildings to 1938." → "The English Wikipedia article on the Church of St Demetrius dates the main clearance to 1933 to 1934 and the last surrounding buildings to 1938, while Hungarian Wikipedia says the…"  
  Reason: English Wikipedia's Tabán article gives only 'the 1930s'; the exact dates come from the St Demetrius article and sources differ.  
  Evidence: https://en.wikipedia.org/wiki/Church_of_Saint_Demetrius,_Budapest ; https://hu.wikipedia.org/wiki/Tab%C3%A1n_(Budapest)
- "In the Middle Ages the Tabán was a village under Buda Castle." → "In the Middle Ages the Tabán lay outside the walls and became a suburb of Buda, according to Hungarian Wikipedia."  
  Reason: Source describes a suburb outside the walls, not a village under the castle.  
  Evidence: https://hu.wikipedia.org/wiki/Tab%C3%A1n_(Budapest)
- "The Rác Thermal Bath is nearby but was listed as closed on the Visit Buda Castle page; check the official sites for current opening times." → "The Rác Thermal Bath is nearby but has been closed for refurbishment for many years, and its reopening is still only a plan, so check the operator before counting on it."  
  Reason: The bath is still closed in 2026; "current opening times" suggests it is open.  
  Evidence: https://444.hu/2026/01/15/kozbeszerzesi-eljarast-irtak-ki-a-tobb-mint-20-eve-zarva-tarto-rac-furdo-felujitasara

### The Tomb of Gül Baba (`the-tomb-of-gul-baba`)

- "The tomb was restored again in the 1960s and the 1990s and is now the property of the Republic of Turkey." → "The tomb was restored again in the 1960s and the 1990s."  
  Reason: Current Turkish state ownership could not be confirmed in any source opened; sentence kept grammatical without it.  
  Evidence: https://visithungary.com/articles/tomb-of-gul-baba

### Tóth Árpád Promenade (`toth-arpad-promenade`)

- "The English Wikipedia article on Buda Castle notes that the medieval fortifications around the castle were rebuilt in their entirety in the 1950s and 1960s after the war, although…" → "The English Wikipedia article on Buda Castle describes a reconstruction of the castle's fortifications from the 1950s to 1966, and its article on the Bastion Promenade says the pr…"  
  Reason: 'Rebuilt in their entirety' was not supported; replaced with the sourced statements.  
  Evidence: https://en.wikipedia.org/wiki/Buda_Castle ; https://en.wikipedia.org/wiki/Bastion_Promenade
- "It is named after the poet Árpád Tóth (1886-1928), a lyric poet associated with the Nyugat circle." → "It is named after the poet Árpád Tóth (1886-1928), a lyric poet associated with the Nyugat circle; the Castle District heritage site says the lane received its present name in 194…"  
  Reason: Adds the naming date given by the Castle District heritage site.  
  Evidence: https://budavar.abtk.hu/en/streets-squares-buildings/toth-arpad-lane.html

### Underground Railway Museum (`underground-railway-museum`)

- "The station under Deák Ferenc tér was only 2.7 metres deep and sat on a sharp curve, so in the 1950s the route was diverted" → "The station under Deák Ferenc tér sat on a sharp curve, so in the 1950s the route was diverted"  
  Reason: The 2.7 m depth is not supported by the sources fetched; the curve and 1950s diversion are.  
  Evidence: https://en.wikipedia.org/wiki/Millennium_Underground_Railway
- " In the 1960s, plans to fill it in were replaced by a proposal to create a metro exhibition there." → ""  
  Reason: Not found in BKV or Wikipedia; removed as unsupported.  
  Evidence: https://en.wikipedia.org/wiki/Underground_Railway_Museum_(Budapest)
- address: Budapest, Erzsébet tér 14, 1051 → Budapest, Deák Ferenc tér (pedestrian subway), 1052  
  Reason: Official BKV page and ERIH place the museum in the Deák tér pedestrian underpass, postcode 1052; Erzsébet tér 14 is not supported.  
  Evidence: https://bkv.hu/en/millennium_underground_museum
- "The station under Deák Ferenc tér sat on a sharp curve, so in the 1950s the route was diverted, leaving an 80-metre section of the old tunnel empty and walled off." → "According to Wikipedia, the original station under Deák Ferenc tér lay only about 2.7 metres below the surface and sat on a sharp curve, so in the 1950s the route was diverted, le…"  
  Reason: Both the depth and the fill-in-then-exhibition episode are stated in English Wikipedia; the earlier audit missed them. Sole source, so attributed; tunnel length differs between the English (80 m) and Hungarian (60 m) Wikipedia articles.  
  Evidence: https://en.wikipedia.org/wiki/Underground_Railway_Museum_(Budapest)

### Vasarely Museum Budapest (`vasarely-museum-budapest`)

- "One account describes a 1968 donation to the Museum of Fine Arts, and the collection was given to the city in 1982." → "One guide notes that Vasarely gave works to the Museum of Fine Arts several times after 1959."  
  Reason: The 1968 and 1982 dates were not found in any fetched source; MyArtGuides gives the 'several times after 1959' donations.  
  Evidence: https://myartguides.com/artspaces/museums/budapest/vasarely-museum
- "Sources differ on how many works are held, with some giving more than 400 and others far fewer, so treat any single figure with caution." → "The collection is usually described as numbering more than 400 works, a figure that includes both original pieces and reproduced editions."  
  Reason: No opened source gives a much lower holdings figure; Wikipedia, MyArtGuides and Xpatloop (411 original and reproduced works) agree on more than 400.  
  Evidence: https://xpatloop.com/channels/2012/01/xploring-budapest--victor-vasarely-museum.html

### Veli Bej Bath (`veli-bej-bath`)

- "The same source calls it the oldest and most beautiful Ottoman bath in Budapest." → "The same source calls it the oldest and most beautiful Ottoman bath in Budapest, a superlative that sits uneasily with the Rudas Bath, which Wikipedia dates to 1571 or 1572."  
  Reason: The 'oldest' claim conflicts with the earlier founding date given for Rudas; it must be presented as one source's claim, not a fact.  
  Evidence: https://en.wikipedia.org/wiki/Rudas_Baths
- "including steam rooms, saunas and a jacuzzi" → "including saunas and a jacuzzi"  
  Reason: The source lists a Finnish sauna, an infrared sauna and a jacuzzi; steam rooms are not mentioned.  
  Evidence: https://dailynewshungary.com/es/veli-bej-bath-a-hidden-turkish-gem-of-budapest/
- "A small Ottoman bath dating from 1574-75, set inside" → "A small Ottoman bath of the 1570s, set inside"  
  Reason: The exact year is stated by the Hospitaller order (1574-75) but another source gives 1570-1572, so the description uses the decade.  
  Evidence: http://www.irgalmasrend.hu/site/velibej/toertnet
- "According to Budapest by Locals it was built in 1574-75 by Sokollu Mustafa Pasha, and it survived the recapture of Buda in 1686." → "According to Budapest by Locals it was built in 1574-75 by Sokollu Mustafa Pasha, a builder and year the Hospitaller order's own history page also gives, while another Hungarian l…"  
  Reason: Adds the institutional source and the conflicting date, and keeps the 1686 claim attributed to its single source.  
  Evidence: http://www.irgalmasrend.hu/site/velibej/toertnet
- "An Ottoman bath of 1574 to 1575" → "An Ottoman bath of the 1570s"  
  Reason: Heading matches the qualified date.  
  Evidence: http://www.irgalmasrend.hu/site/velibej/toertnet
- "and that it survived the recapture of Buda in 1686. The page notes that Buda had" → "and that it survived the recapture of Buda in 1686. The Hospitaller order's own history page gives the same builder and the deciphered year 1574-75, while another Hungarian local-…"  
  Reason: Records the independent institutional source and the alternative date in the history section.  
  Evidence: http://www.irgalmasrend.hu/site/velibej/toertnet

## Claims still open (uncertain, qualified or blocked)

### Andrássy Avenue (`andrassy-avenue`)

- QUALIFIED: UNESCO statement: from 1872 the avenue radically transformed Pest's urban structure; part of Budapest WH site, extended 2002 — whc.unesco.org pages return 403 and the nomination PDF is unreadable scans. worldheritagesites.net (opened) says the avenue, added in 2002, 'radically transformed the urban structure of Pest', and a search snippet attributes the exact sentence to UNESCO's per… (https://worldheritagesites.net/?p=15928)

### Castle Garden Bazaar (`castle-garden-bazaar`)

- UNCERTAIN: Archaeological finds from the excavations were shown in the southern palaces when the building reopened in 2014; check the official site for what is currently on show. — Phase 19: no current official source reachable. No current page on archaeological finds in the Várkert Bazár southern palaces found; the sentence already tells the visitor to check the official site, so no change needed.

### City Park Ice Rink (`city-park-ice-rink`)

- UNCERTAIN: A renovation between 2009 and 2011 restored the main building to its 1926 state — 2009-2011 renovation confirmed by hu.wikipedia Korcsolyacsarnok. The '1926 state' detail comes from en.wikipedia citing hir24.hu, which I did not open. The rink site says the hall was expanded in 1926 under Ferenc Paulheim Jr. Left unchanged. (https://en.wikipedia.org/wiki/City_Park_Ice_Rink)

### City Park (Városliget) (`city-park-varosliget`)

- QUALIFIED: Zoo and Botanical Garden 1866; ice rink 1870; Gundel 1894; circus building first performance 1891 — Wikipedia City Park lists: 'Budapest Zoo, opened in 1866', ice rink 'originally opened in 1870', 'Budapest Circus Building, where the first performance was held in 1891', 'Gundel Restaurant, opened in 1894'. The zoo's own history page confirms opening on 9 Au… (https://en.wikipedia.org/wiki/City_Park_(Budapest))

### Clark Ádám Square and the 0 km Stone (`clark-adam-square-and-the-0-km-stone`)

- QUALIFIED: Stone first set at threshold of Buda Royal Palace and moved near Chain Bridge when crossing completed in 1849 — HVG: 'A budavári királyi palota küszöbe jelentette egykor a magyarországi utak középpontját' and the milestone was brought down 'a frissen felavatott Lánchíd közelébe'. No year given. English Wikipedia states 1849 (its only reference does not cover this). bud… (https://hvg.hu/elet/201831_nulladik_kilometerpontok)

### Fisherman’s Bastion (`fishermans-bastion`)

- QUALIFIED: Terraces face east across the river; early morning/late evening quietest — budapest-trip.com describes the view as 'looking east across the Danube' with Parliament on the horizon and calls early morning and evening noticeably calmer; Wikipedia gives panoramic views over the Danube, Margaret Island, Gellért Hill and Pest. Orientation… (https://www.budapest-trip.com/guides/fishermans-bastion-guide/)
- UNCERTAIN: Built between 1895 and 1902 — The Research Centre for the Humanities page says reconstruction began in 1899 and finished in 1902 (floodlighting 1928); the site text says 1895-1902 as in the previous audit (Wikipedia). Not an open claim and not changed; the editors may want to say 'complet… (https://budavar.abtk.hu/en/streets-squares-buildings/fishermen-s-bastion.html)

### Gellért Hill & Citadella (`gellert-hill-citadella`)

- QUALIFIED: Vineyards from 18th century; 1789 land register records 128 hectares; cave found in 2007 with gypsum, calcite, aragonite crystals — Wikipedia: 'From the 18th century the hillsides were covered with vineyards'; 'According to the 1789 land register vineyards covered 128 hectares' (footnote 5: 'Eltűnt budai szőlők nyomában', vol. 3, 2007, p. 52); 'In January 2007, a new cave was discovered u… (https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill)

### Goldberger Textile Collection (`goldberger-textile-collection`)

- UNCERTAIN: One covers the history of textile printing; another, a Tamási workshop display, is described as presenting the last textile manufactures, including tutyi (closed slippers worn by ethnic Germans) made… — Phase 19: no current official source reachable. No official current page reachable via search; permanent exhibition opened September 2013 and a museum calendar listed Tuesday-Sunday opening in January 2026. Attributed, already tells visitors to che

### House of Music Hungary (`house-of-music-hungary`)

- UNCERTAIN: The subterranean level holds permanent and temporary exhibitions as well as a sound dome that creates a hologram-like aural environment, inspired by a concept from the composer Karlheinz Stockhausen. — Phase 19: no current official source reachable. Official House of Music site did not load (expired certificate; zeneahaza.hu not found). Descriptive of a permanent feature; low risk, no change proposed.

### Hungarian National Gallery (`hungarian-national-gallery`)

- UNCERTAIN: Late Gothic altarpieces on display in the palace — Currently on display in Buda Castle (fifteen largely complete winged altarpieces). The telekomspots listing says the late medieval works 'will be transferred to the Museum of Fine Arts after restoration' with no date; text is correct today but may need revisi… (https://en.mng.hu/?p=262)

### Hungarian Natural History Museum (`hungarian-natural-history-museum`)

- QUALIFIED: Exhibition building was originally the Ludovika riding hall, later Alfa Cinema, which burned in 1992 — hu.wikipedia (museum article) says the exhibition building was 'eredetileg a Ludovika fedett lovardája volt', 'majd az Alfa Mozi üzemelt benne', 'amely 1992-ben leégett'. The hu.wikipedia Ludovika Akadémia article repeats 'Budapest ostroma után a Ludovika fed… (https://hu.wikipedia.org/wiki/Magyar_Term%C3%A9szettudom%C3%A1nyi_M%C3%BAzeum)

### Kazinczy Street Orthodox Synagogue (`kazinczy-street-orthodox-synagogue`)

- QUALIFIED: Address '1075 Budapest, Kazinczy utca' (no house number); no coordinates in dossier — Hungarian Wikipedia: 'Kazinczy utca 29-31. szám alatt' (coordinates 47.4983, 19.0625); WeLoveBudapest Hungarian page: 'Kazinczy utca 27-29'; OSM: synagogue (Sász-Chevra) at 47.49857, 19.06246 in postcode 1075, ELTE building next door at 23-27. Official site k… (https://hu.wikipedia.org/wiki/Kazinczy_utcai_zsinag%C3%B3ga_(Budapest))

### Light Art Museum (LAM) (`light-art-museum-lam`)

- UNCERTAIN: A March 2026 guide advises that visitors sensitive to light should ask staff about a safer route because some installations use strobes and loud audio. — Phase 19: no current official source reachable. Official page does not mention strobes or light-sensitivity guidance (asks to contact info@lam.xyz). Sentence is attributed and cautious; no edit needed. (https://lightartmuseum.hu)

### Margaret Island (`margaret-island`)

- UNCERTAIN: Margaret Island is a 2.5-kilometre park in the middle of the Danube, largely closed to cars, with gardens, a music fountain, a Japanese garden, a water tower, pools and a running track. — Phase 19: no current official source reachable. No 2026 source on the car rule found (2026 BKK items only show event bus routing). "Largely closed to cars" is cautious and low risk.
- QUALIFIED: The island lies between Margaret Bridge and Árpád Bridge; private cars are not allowed, so arrive on foot or by public transport. — The firm 'private cars are not allowed' was softened to 'motor traffic is restricted ... check the current access rules'; no current official rule was found.

### Millenáris Park (`millenaris-park`)

- QUALIFIED: Suspended garden looks over Margit körút, the Castle District and the Buda hills — Official page: 'From this elevated level, visitors can enjoy views towards Margit körút, the Castle District, and the Buda Hills.' The garden is reached by a panoramic elevator. Greenroofs.com only says 'park vistas'; Hungarian press only repeats the same phr… (https://2023.millenaris.hu/en/about-us)

### Rumbach Street Synagogue (`rumbach-street-synagogue`)

- UNCERTAIN: After decades of decay it was restored and reopened in 2021, and sources describe it as serving as a synagogue, a museum and a concert hall. — Phase 19: no current official source reachable. Statement is attributed to "sources". A 2026 ticket-seller page shows visitor opening in 2026 and says hours can change because of use as a concert venue; official site not reached. Wording is safe as

### Szamos Chocolate Museum (`szamos-chocolate-museum`)

- QUALIFIED: Current status (open or not) — Official Szamos page for the Csokolademuzeum exists, gives the address Kossuth Lajos ter 10, 1055 Budapest (Szamos Cafe, upper floor), offers online tour booking, school groups, team building and gift cards, and mentions no closure. szamos.hu also lists 'Szam… (https://szamos.hu/csokolademuzeum)
- UNCERTAIN: Six rooms on the guided tour; Biedermeier Sweet Salon; historical machines — Already attributed to a 2017 description in the text; the official page does not repeat room details, so left as attributed. (https://welovebudapest.com/en/article/2017/05/31/go-on-a-delicious-tour-inside-budapest-s-szamos-chocolate-museum/)

### Underground Railway Museum (`underground-railway-museum`)

- QUALIFIED: Station under Deák tér 2.7 m deep — Verbatim: 'This original station was constructed with two side platforms, at a depth of just 2.7 metres (8 ft 10 in).' The Deák Ferenc tér metro station article also says about 2.7 m. BKV, showcaves and ERIH do not mention depth, so it is restored as 'accordi… (https://en.wikipedia.org/wiki/Underground_Railway_Museum_(Budapest))
- QUALIFIED: In the 1960s plans to fill the tunnel were replaced by a metro exhibition proposal — Verbatim: 'At first it was planned to fill it in, but then it was suggested that a metro exhibition be organized in it' (in the 1960s underpass-works context); the station article repeats it. No BKV or Hungarian source states it, so it is restored with attrib… (https://en.wikipedia.org/wiki/Underground_Railway_Museum_(Budapest))
- UNCERTAIN: Old tunnel section left empty is 80 metres long — English Wikipedia says 80 m; Hungarian Wikipedia says the museum sits in a disused 60 m section and the station moved about 40 m. Text now says the length is given differently. (https://hu.wikipedia.org/wiki/Földalatti_Vasúti_Múzeum)
- UNCERTAIN: Address given as 'Deák Ferenc tér (pedestrian subway), 1052' — Hungarian Wikipedia gives 'Erzsébet tér 14' (the Transport Museum's formal address) in the Deák tér underpass; BKV and English Wikipedia place it in the Deák tér pedestrian subway with no street number; OSM lists postcode 1051. Current wording is safe for vis… (https://hu.wikipedia.org/wiki/Földalatti_Vasúti_Múzeum)

### Veli Bej Bath (`veli-bej-bath`)

- QUALIFIED: Built 1574-75 by Sokollu Mustafa Pasha; survived 1686 recapture of Buda — The Hospitaller order's history page: 'Szokollu Musztafa, Buda leghíresebb pasája (1566-78) ekkor fejezte be a hódoltság legszebben megépített fürdőjét' and 'a megfejthető évszám, ami a Veli bej fürdőre vonatkozik, a következő: 1574-75'. Budapest100 (https://… (http://www.irgalmasrend.hu/site/velibej/toertnet)
- UNCERTAIN: 1806: bath became the property of the Hospitaller order — The order's page says Count István Marczibányi gave the restored building to the order in 1806 (plaque 'Az ápolatlan betegeknek szenteltetett 1806'); Budapest100 says he bought it and donated the management right. The year is solid; the exact legal form is no… (http://www.irgalmasrend.hu/site/velibej/toertnet)
- UNCERTAIN: Hild reconstruction 1841-48 (one source 1842) — Budapest100 gives 1841-1844/45; the order's page says only 'early 1840s'. Existing text already says the sources differ on dates. (https://budapest100.hu/house/frankel-leo-ut-31-33/)

## Source problems found

- `andrassy-avenue`: https://www.budapestinfo.hu/en/andrassy-avenue — Page content is only the title; cannot support the descriptive claims.; https://budappest.com/andrassy150-budapests-grand-boulevard-turns-150-in-style/ — Supports the anniversary and the Kodály Körönd / Liszt Square mentions only; it contains no name changes, architects or exact inauguration …; https://whc.unesco.org/en/list/400/ — Returned HTTP 403 when fetched; the UNESCO quote could not be confirmed directly.; https://whc.unesco.org/en/list/400/ — Returns HTTP 403 to automated fetch; the UNESCO wording could not be checked at source.
- `aquincum-museum`: https://en.wikipedia.org/wiki/Aquincum — Does not cover the 1778 discovery or Maria Theresa; those claims are supported by Mandadb and The Past instead.; https://www.budapestinfo.hu/en/budapest-history-museum-aquincum-museum — Page content is only a keyword list; does not itself show the Hungarian Pompeii nickname text.; https://www.budapestinfo.hu/en/budapest-history-museum-aquincum-museum — Content is only a title; it does not contain the Hungarian Pompeii nickname that the story cites it for. Suggest changing the story's sourc…
- `bartok-bela-boulevard`: https://www.budapestinfo.hu/en/discover-bartok-bela-boulevard-the-locals-favourite — Not opened in this check (Budapest Info pages return only titles).
- `buda-castle-district`: https://www.budapestinfo.hu/en/the-buda-castle-district-and-its-surroundings — Returned only a title when fetched; not usable as evidence.; https://visitbudavar.com/en/attractions — Supports courtyards, streets, churches and viewpoints but not the statement that the district grew around the medieval royal residence.; https://visitbudavar.com/en/attractions — Lists attractions only; it has no general history of the district, so it does not support historical statements about the district's origin…; https://www.budapestinfo.hu/en/the-buda-castle-district-and-its-surroundings — Fetch returned only the page title with no body text, so it could not be used to verify anything.
- `buda-castle-funicular`: https://www.budapestinfo.hu/en/buda-castle-funicular-bkv — Not opened in this check; claims were verified against Wikipedia, Industrial Heritage Hungary and bkk.hu instead.
- `budapest-gallery`: https://www.museum.hu/museum/12/Budapest_Gallery_Exhibition_Hall — Page is internally inconsistent (158 vs 159 Lajos utca); 158 confirmed by two other sources.
- `budapest-history-museum`: https://www.budapestinfo.hu/en/budapest-history-museum-castle-museum-1 — Page fetched with no body text (title only); cannot support any claim.; https://hu.wikipedia.org/wiki/Budapesti_T%C3%B6rt%C3%A9neti_M%C3%BAzeum — Supports 1887/1967/branches but does not mention the 1974 find or the exhibitions.; https://www.budapestinfo.hu/en/budapest-history-museum-castle-museum-1 — Content is only a title; it cannot support the exhibition-content sentence it is attached to. varmuzeum.hu and museum.hu are better sources…
- `budapest-music-center`: https://www.budapestinfo.hu/en/budapest-music-center — Not opened in this check (Budapest Info pages return only titles).
- `budapest-zoo-botanical-garden`: https://www.budapestinfo.hu/en/budapest-zoo — JavaScript shell; could not be opened, so the notable-visitors story (Lorenz, Goodall, Bluebeard) could not be verified against the source …; https://en.wikipedia.org/wiki/Budapest_Zoo_and_Botanical_Garden — Cited as support but gives 15 survivors of 2,000 animals vs the zoo's two dozen of 2,500; the text already flags the difference.; https://www.budapestinfo.hu/en/budapest-zoo — Page content does not mention Lorenz, Goodall, Bluebeard or Burton (fetch returns only the title). The story's sourceUrl/sourceLabel ('Buda…
- `cafe-gerbeaud`: https://www.budapestbylocals.com/gerbeaud-cafe/ — Source supports only the 1858 founding and general history; it also says the Gerbeaud family bought the café back in 1984, which conflicts …; https://www.budapestinfo.hu/en/cafe-gerbeaud — Page content returned empty to the fetch tool; could not be used to verify anything.; https://www.budapestbylocals.com/gerbeaud-cafe/ — Supports Váci utca starting at the square but not the product list; the metro mention is only in an image alt text.
- `castle-garden-bazaar`: https://visitbudavar.com/en/attractions/#varkert-bazar-kert — Supports the garden features (Triton Fountain, rose garden, walls) but not the history claims it is attached to; those are supported by var…; https://varkertbazar.hu/en/node/20 — Covers only the 1870s plan, 1875-1883 build, Stróbl 1884, closure 1984 and decree 1375/2011, not the Youth Park, excavation finds or reopen…; https://en.wikipedia.org/wiki/Buda_Castle — Gives the bazaar's building years as 1875-1882, one year different from the official 1875-1883 used in the text.; https://hu.wikipedia.org/wiki/V%C3%A1rkert_Bazár — URL contains an unencoded accented character (Bazár); the page loads but an encoded form (V%C3%A1rkert_Baz%C3%A1r) is safer.
- `cave-church`: https://www.budapestinfo.hu/en/the-cave-church — Page content was not retrievable beyond its title, so neither the history nor the 'walls fell away' story could be verified. The story entr…; https://welovebudapest.com/en/article/2016/12/23/budapest-s-historic-cave-church-is-a-landmark-carved-in-stone/ — States that after the Soviet-backed troops left the church was consecrated again by the Pauline order but gives no year; does not mention t…; https://www.budapestinfo.hu/en/the-cave-church — Page returns only its title with no body text, so it supports nothing; listed in history.sources. Remove it or replace it with the We Love …
- `chain-bridge`: https://www.budapestinfo.hu/en/chain-bridge — Could not be opened with content in this check (only titles returned for budapestinfo.hu pages); it is the only source for the history sect…
- `childrens-railway`: https://www.budapestinfo.hu/en/a-unique-experience-in-the-world-take-a-ride-on-the-childrens-railway — Not opened in this check (Budapest Info pages return only titles).; https://en.wikipedia.org/wiki/Children%27s_Railway_(Budapest) — Works but is a redirect to Budapest_Children%27s_Railway (the URL used in longForm); consider using the canonical URL.
- `cinema-mystica`: https://welovebudapest.com/en/article/2023/07/11/latnivalok-es-kultura-immerziv-kiallitohely-cinema-mystica-kiallitas-parisi-udvar/ — The English-path version returns 404; the listed Hungarian /cikk/ URL works and supports the claims.; https://welovebudapest.com/en/article/2019/06/03/budapest-s-ornate-parisi-udvar-now-open-for-business/ — Does not mention 1976, the Jegbufe or the hologram shop; those need the 2018 We Love Budapest article and Hungarian Wikipedia.
- `city-park-ice-rink`: https://en.wikipedia.org/wiki/City_Park_Ice_Rink — Gives 1893 for the main building without noting other dates; the 'other sources differ' phrasing in the dossier rests on search results (he…; https://www.budapest.net/budapest-city-park — Does not mention the 1870 rink (not attached to that claim in this entry).; https://www.budapestinfo.hu/en/city-park-ice-rink — Fetched page returned only the title, no history or building content, so it cannot support any claim; used as sourceUrl and as the only his…; https://visithungary.com/articles/5-fun-facts-interesting-things-about-the-city-park — Not opened; relevance to the rink's claims not verified.; https://budappest.com/the-varosliget-boating-lake-opens-soon-for-summer/ — Not opened; used for the summer boating-lake claim. Suggest adding https://mujegpalya.hu/rolunk/ and https://hu.wikipedia.org/wiki/Korcsoly…
- `city-park-varosliget`: https://www.budapestinfo.hu/en/city-park — Page not readable (title only).; https://www.budapest.net/budapest-city-park — Gives the park as 1,400 by 900 m, conflicting with the 970 m figure; does not mention the boundaries, Ukurföld, circus, or Liget Budapest.; https://en.wikipedia.org/wiki/Capital_Circus_of_Budapest — Not currently in the attraction's sources; consider adding it to support the circus date discussion.
- `clark-adam-square-and-the-0-km-stone`: https://en.wikipedia.org/wiki/Zero_Kilometre_Stone_(Budapest) — Works only as a redirect to https://en.wikipedia.org/wiki/Zero_Kilometre_Stone; consider using the canonical URL.; https://visitbudavar.com/en/attractions/#clark-adam-ter — Supports only the symbolic starting point / numbering claim, not the history (1932, 1953, 1975, 1849) it is listed against.; https://commons.wikimedia.org/wiki/File:Clark_%C3%81d%C3%A1m_t%C3%A9r_,_Budapest_-_panoramio.jpg — Commons metadata lists Buda Castle Tunnel as the depicted item and gives no visual description; the alt text ('circular flowerbed...') coul…; https://en.wikipedia.org/wiki/Zero_Kilometre_Stone_(Budapest) — In history.sources; the article is titled Zero Kilometre Stone and the longForm source uses https://en.wikipedia.org/wiki/Zero_Kilometre_St…
- `dohany-street-synagogue`: https://jewishtourhungary.com/ — The page opened gave only a one-line statement that it is Europe's largest synagogue; it does not support the history section's claims abou…; https://www.budapestinfo.hu/en/dohany-street-synagogue-5 — Not opened in this check.; https://jewishtourhungary.com/ — Attached to the history section's general claims but is a ticketing/tour page; it only supports the Saturday closure, not the nineteenth-ce…; https://www.budapestinfo.hu/en/dohany-street-synagogue-5 — Fetch returned only the page title with no body text, so it could not be used to verify anything.
- `ferenc-hopp-museum-of-asiatic-arts`: https://hu.wikipedia.org/wiki/Hopp_Ferenc_%C3%81zsiai_M%C5%B1v%C3%A9szeti_M%C3%BAzeum — Does not mention Felvinczi Takacs, Zichy, Schwaiger, or the garden statues and pagodas; those come from the We Love Budapest article. It al…
- `fishermans-bastion`: https://www.budapestinfo.hu/en/fishermans-bastion — Page not readable (title only).; https://www.budapest.com/en/locations/fishermans-bastion — Supports the seven-tower tradition but does not name Schulek or mention the statue detail; do not use it for the architect or the statue.; https://budavar.abtk.hu/en/streets-squares-buildings/fishermen-s-bastion.html — Describes six towers (five small and one larger) and 'neo-Gothic', and says alterations began in 1899: differs from the seven-tower/neo-Rom…; n/a (dossier field) — The top-level 'description' for this attraction (about 12 words) is shorter than the 35-70 word rule; the longForm description is separate …
- `franz-liszt-memorial-museum-and-research-centre`: https://lisztmuseum.hu/aboutus/about-us-119918 — Gives 'late 1875 until mid-1907' for use of the Vörösmarty utca building, which contradicts the museum's own news page (move in 1879) and t…; https://www.budapestinfo.hu/en/franz-liszt-memorial-museum-and-research-centre — Cited as the history source but not opened during this pass; it supports only generic claims. Consider adding https://lisztmuseum.hu/aboutu…
- `garden-of-philosophers`: https://hvg.hu/kultura/20070427_harom_szobor — Article text gives no exact date; April 2007 is inferred from the URL.; https://xpatloop.com/channels/2023/06/insiders-guide-garden-of-philosophers-in-budapest.html — Does not mention the widow or a reservoir; the widow's gift comes from HVG.; https://xpatloop.com/channels/2023/06/insiders-guide-garden-of-philosophers-in-budapest.html — Lists all eight figures as present but says nothing about the theft or replacement. Suggest adding https://www.kozterkep.hu/1873/filozofiai…
- `gellert-hill-citadella`: https://en.wikipedia.org/wiki/Gell%C3%A9rt_Hill — The fetched summary did not show the cave church, the statue, or the Vata uprising details (these are in the Gerard of Csanád and Gellért H…; https://www.budapestinfo.hu/en/gellert-hill-and-the-citadel — Page not readable (title only).
- `gellert-thermal-bath`: https://www.gellertbath.hu/ — Supports the closure notice only, not the history it is attached to in the history sources list.; https://gellertbath.hu/past-and-present-of-gellert-bath — Not in the dossier's source list; useful official history page (supports 1918 opening, 1927 and 1934 additions).
- `goldberger-textile-collection`: https://www.museum.hu/museum/85/Museum_of_Textil_And_Clothing_Industry_Textilmuseum — Profile page does not mention the shop or cafe, or an explicit link to the Obuda Museum; the exhibition page and the Goldberger page do. Th…
- `great-market-hall`: https://www.budapestinfo.hu/en/great-market-hall — Page is a JavaScript shell; content could not be retrieved by WebFetch, so claims attributed to it could not be checked against it.; https://www.budapestinfo.hu/en/central-market-hall — History source slug differs from the entry's own sourceUrl (great-market-hall); returned only a generic site title, could not confirm it ex…; https://www.budapestinfo.hu/en/great-market-hall — Fetches return only the page title (content not available to the fetch tool); cannot be used as evidence for any claim.; https://www.budapestinfo.hu/en/central-market-hall — Different slug from the main sourceUrl (great-market-hall); likely a stale or wrong URL in the history sources.
- `gresham-palace`: https://www.budapestinfo.hu/en/gresham-palace — JavaScript shell; could not be opened; history text unchecked against it but consistent with verified facts.
- `heroes-square`: https://ligetbudapest.hu/en/heroes-square — Supports the monument description, the 1989 reburial and the Memorial Stone but does not give the dates 1896/1900/1905, Schickedanz, Zala o…; https://www.budapestinfo.hu/en/heroes-square — Not opened in this check.
- `holy-family-church-terezvaros`: https://hu.wikipedia.org/wiki/Szent_Csal%C3%A1d-templom_(Budapest) — The prose attributes the foundation stone date, 1933 vicarage, Sármány, 1948 reconsecration, Barba, Rosa Mystica and Boromisza to Hungarian…
- `hospital-in-the-rock`: https://www.hospitalintherock.com/ — Page does not state that visits are guided-only and does not call guest reviews 'moving' (editorial wording); supports address and foundati…; https://www.budapestinfo.hu/en/hospital-in-the-rock-nuclear-bunker-museum-1 — Fetch returned only the title; content could not be used to verify anything.; https://hospitalintherock.eu/en/exhibitions — Not fetched (not needed for any checked claim).; https://hospitalintherock.com/ — Home page does not itself say guided-only; the /information page does. Consider citing https://hospitalintherock.com/information for the gu…
- `house-of-music-hungary`: https://www.budapestinfo.hu/en/the-house-of-music-hungary — Returned only title and keywords; no content to check.; https://ligetbudapest.hu/en/the-project/house-of-hungarian-music — Opens, but supports only architect, January 2022 opening, perforated roof and City Park; it does not mention levels, sound dome or stage as…
- `house-of-terror-museum`: https://terrorhaza.hu/en/about-the-museum — Page does not name the Arrow Cross or ÁVH (it speaks of 'two bloody periods'), so it does not by itself support the 'Arrow Cross and ÁVH' w…
- `hungarian-academy-of-sciences`: https://mta.hu/english/about-mta-105677 — Page supports the architecture claims but not the 1845 name change nor the street address; those rest on Wikipedia/OSM.; https://www.budapestinfo.hu/en/hungarian-academy-of-sciences — JavaScript shell; could not be opened.
- `hungarian-agricultural-museum-and-library`: https://en.wikipedia.org/wiki/Vajdahunyad_Castle — Does not mention the 1991 monument status, Gate Tower or relocation; hu.wikipedia supplies those.
- `hungarian-heritage-house`: https://xpatloop.com/channels/2021/02/hungarian-heritage-house-celebrates-jubilee.html — Confirms 20th/70th anniversaries and shared seat only; does not describe the ensemble as 'part of' the institute (the institute's own page …; https://en.wikipedia.org/wiki/T%C3%A1nch%C3%A1z — Does not give the date or place of the first táncház; the 1972 claim is supported only by the institute's dance house page.; https://visitbudavar.com/en/attractions/#hagyomanyok-haza — Supports only the 'living folk tradition, dance performances, concerts, exhibitions, craft programmes' summary, not the building history.; https://en.wikipedia.org/wiki/T%C3%A1nch%C3%A1z — Names the wrong UNESCO list (Urgent Safeguarding) for the 2011 inscription; the official UNESCO entry is on the Register of Good Safeguardi…
- `hungarian-jewish-museum-and-archives`: https://www.milev.hu/hungarian-jewish-museum.html — Supports address, architects, 1942 rescue and archives but not Herzl, rimonim, Roman gravestone, trowel or 2014 merger; those are covered b…; https://www.budapestinfo.hu/en/hungarian-jewish-museum-and-archives-2025 — Page content is only a keyword list giving both Wesselény utca 7 and Dohány utca 2 as addresses.
- `hungarian-national-gallery`: https://en.mng.hu/?p=294 — Confirms history, crypt facts and 'independent since 1957'; does not cover Master MS, Munkácsy or the 2012 merger (which it appears to cont…; https://en.wikipedia.org/wiki/Hungarian_National_Gallery — Article describes the 2012 merger only as a proposal and does not state a 1975 move; used only for founding facts.; https://www.budapestinfo.hu/en/hungarian-national-gallery-1 — Not fetched; no claim relied on it.
- `hungarian-national-museum`: https://mnm.hu/en/about-museum — Supports the founding history and 1848 but states that Petőfi did NOT recite the National Song there; says nothing about the steps, floors,…; https://en.wikipedia.org/wiki/Metropolitan_Ervin_Szab%C3%B3_Library — Does not say the palace is behind the National Museum; only coordinates and district are given.
- `hungarian-natural-history-museum`: https://en.wikipedia.org/wiki/Hungarian_Natural_History_Museum — Does not support the 2024 branch status, the 1992 cinema fire or the 2010 relocation talk (hu.wikipedia covers the first and last).; https://www.budapestinfo.hu/en/hungarian-natural-history-museum — Not re-opened in this pass; the history.sources entry is a generic visitor-information page and does not support the detailed history in lo…
- `hungarian-parliament`: https://www.parlament.hu/documents/1779743/1846295/angol.pdf/038a18a7-97ce-11de-4f14-a45c61073d29?t=1547810099000 — Returned a CAPTCHA page, so it could not be read; the Steindl story attributed to it could not be confirmed there.; https://latogatokozpont.parlament.hu — Returned a CAPTCHA page; not verifiable from here.; https://www.budapestinfo.hu/en/parliament — Not opened in this check.
- `hungarian-railway-history-park`: https://en.wikipedia.org/wiki/Hungarian_Railway_History_Park — Gives no street address, depot history, Opaks or Haman Kato details; those are only on hu.wikipedia. It also lists the park in the 13th dis…
- `hungarian-state-opera`: https://www.opera.hu/en/about-us/building/opera/the-construction-of-the-opera-house/ — Confirms the 1873 competition, 1875 permit, Mainz chandelier and the 1884 opening, but says nothing on the hydraulic stage, painters, Mahle…; https://welovebudapest.com/en/article/2014/04/29/the-hungarian-opera-house-in-three-acts-the-building — Flagged as possibly outdated and says the house opened in 1887 (an error versus 27 Sept 1884 on opera.hu and Wikipedia); the dossier does n…; https://www.budapestinfo.hu/en/hungarian-state-opera — Not opened in this check.; https://welovebudapest.com/en/article/2014/04/29/the-hungarian-opera-house-in-three-acts-the-building — Does not contain the staircase-and-gowns statement (the longForm sources list it as if it did); Wikipedia is the actual source for that sen…
- `ikono-budapest`: https://www.budapestinfo.hu/en/ikono-budapest-1 — Page content is only a keyword list (address, cities, artists, ball pit, mirror maze, light painting) with no explanatory text; it cannot s…; https://www.budapestinfo.hu/en/ikono-budapest-1 — Page content returns little beyond keywords; not useful for the mirror maze claim (We Love Budapest venue page is the usable source).
- `kazinczy-street-orthodox-synagogue`: https://kazinczyutcaizsinagoga.hu/ — Official site linked from Wikipedia refused the connection (ECONNREFUSED) on both http and https during this check, so the address could no…
- `kiscelli-museum`: https://hungaryunlocked.com/kiscelli-museum-budapest-guide/ — Gives no end year for construction and no dissolution year; those come from hu.wikipedia.; https://hu.wikipedia.org/wiki/Budapesti_T%C3%B6rt%C3%A9neti_M%C3%BAzeum — Listed under Kiscelli sources but does not support any Kiscelli building-history claim.
- `kopaszi-gat`: https://www.budapestinfo.hu/en/kopaszi-gat-eng — Page returns only its title to the fetcher; could not be checked.; https://budappest.com/budapest-tourist-attractions/kopaszi-gat-budapests-revitalized-waterfront-gem/ — Supports 2007 park, materials and tram 1 route, but the playground it mentions is at Flava Beach across the bay, not in Kopaszi-gát (the pl…; https://welovebudapest.com/cikk/2026/07/19/kopaszi-gat-tortenete-ujbuda-budapart/ — Does not mention the 2015 sale, ADEPT or Foster + Partners; those are supported by the Guiding Architects article.
- `kunsthalle`: https://www.mucsarnok.hu/english/kunsthalle/history.php — Names only Schickedanz (spelled 'Schikedanz'); does not mention the 1983 exhibition, Ludwig or the Capa Center.; https://www.budapestinfo.hu/en/kunsthalle-en — Not fetched; no claim depended on it.
- `light-art-museum-lam`: https://budappest.com/budapest-tourist-attractions/light-art-museum-budapest-where-art-meets-science/ — Does not support the 'around thirty-five works', Moholy-Nagy or zeppelin details (it calls LAM 'one of the first' light art spaces, not the…; https://welovebudapest.com/cikk/2022/10/20/latnivalok-es-kultura-light-art-museum-fenymuveszeti-muzeum-hold-utca/ — Gives no September 2022 opening month; the month comes from the Telex sponsored article.
- `liszt-ferenc-academy-of-music`: https://www.budapestinfo.hu/en/liszt-ferenc-academy-of-music — JavaScript shell; could not be opened by WebFetch, so the history text could not be compared against it.
- `ludwig-museum`: https://www.ludwigmuseum.hu/en/node/768 — Page is the 2005 exhibition 'Works on the Edge'; supports space, 'only museum' claim and artists, but not the pop-art work titles, NFT or V…; https://www.ludwigmuseum.hu/en/node/192 — Timeline page does not contain 21 March 1989, 14 March 2005 or 22 July 1996 in its body (these are supported by node/29878 and Wikipedia in…; https://www.budapestinfo.hu/en/ludwig-museum — Not fetched; listed as the history source but no history claim depends on it.
- `lukacs-thermal-bath`: https://en.wikipedia.org/wiki/Luk%C3%A1cs_Baths — Does not mention ICOMOS, gratitude plaques, or any public-transport details, so those claims rest on the Mandadb and Budappest sources.
- `lupa-beach`: https://xpatloop.com/channels/2016/07/sziget-founder-opens-budapest-beach.html — Does not name Budakalász; supports quarry, swimming ban, opening date and lease only.; https://welovebudapest.com/en/article/2017/05/30/soak-up-summery-seaside-vibes-near-budapest-as-lupa-beach-reopens/ — Does not mention road 11 or Szentendre; that detail is from Just Budapest only.
- `madame-tussauds-budapest`: https://www.budapestinfo.hu/en/madame-tussauds-budapest-1 — Page content fetched is only a keyword list; it does not itself support the specific claims (tunnel, craftspeople). The claims are supporte…
- `mai-mano-house`: https://fszek.hu/en/Entities/110/0601anzix-mai-mano — Supports architects, builder, permit dates, Weisz and Arizona Club; does not mention the post-war school, showroom or Car Club.; https://www.budapestinfo.hu/en/the-house-of-hungarian-photographers-mai-mano-house-2 — Fetch returns only the page title, no body text; the MM monogram story cites it but could only be verified via the FSZEK page. Consider add…
- `margaret-island`: https://www.budapestinfo.hu/en/margaret-island-1 — Fetch returns only the title 'Margitsziget' (page content not readable), so it could not be used to confirm any claim.; https://www.budapestinfo.hu/en — History source is the generic site root, not specific to the island's history; not checkable.
- `margaret-island-water-tower`: https://www.budapestinfo.hu/en/margaret-island-water-tower — JavaScript shell; content could not be retrieved. The history text is generic and consistent with verified facts, but could not be checked …
- `mary-magdalene-tower`: https://www.budapestinfo.hu/en/budatower-en — Page returned only its title when fetched, so it could not be used to check any claim.
- `matthias-church`: https://matyas-templom.hu/en/history-of-the-church/ — Does not state the later Holy Crown coronation, does not mention Béla IV's 1255-1269 rebuild, and does not place the museum in a crypt; the…; https://www.budapestinfo.hu/en/matthias-church-1 — Not checked; budapestinfo.hu pages returned only titles in this check.
- `matthias-fountain`: https://en.wikipedia.org/wiki/Buda_Castle — Page is very long and was read only in part; wording that Hauszmann's north wing 'doubled the Baroque palace' was not individually confirme…
- `medieval-jewish-prayer-house`: https://www.budapestinfo.hu/en/things-to-do-in-budapest-for-history-lovers — Listed in history sources; not opened or checked.
- `metropolitan-ervin-szabo-library`: https://www.budapestinfo.hu/en/metropolitan-ervin-szabo-library — Not opened; listed in history sources but unchecked.; https://fszek.hu/en/kozponti/0801palota-tortenete — Confirms the extension and 12 September 2001 reopening but does not mention the neighbouring Reviczky utca and Baross utca buildings.
- `millenaris-park`: https://www.budapestinfo.hu/en/millenaris-park-eng — Page returns only its title to the fetcher, so claims could not be checked against it.; https://en.wikipedia.org/wiki/Millen%C3%A1ris_(park) — Wikipedia says 'six acres'; the official site says nearly six hectares, so Wikipedia does not support the area claim (the official site doe…; https://www.budapestinfo.hu/en/millenaris-park-eng — Page returns only the title 'Millenáris Park' when fetched; none of the Széllkapu, view or address claims can be read there. Official Mille…; https://www.greenroofs.com/2023/09/07/featured-project-millenaris-szellkapu-gate-of-winds-park-green-walls-3-dimensional-hanging-garden/ — Opens, but only says 'park vistas' from the hanging garden; it does not name Margit körút, the Castle District or the Buda hills, and does …
- `mupa-budapest`: https://www.budapestinfo.hu/en/mupa-budapest — Not opened in this check (Budapest Info pages return only titles).
- `museum-of-ethnography`: https://papageno.hu/english/news/2022/05/the-new-building-of-the-museum-of-ethnography-was-inaugurated/ — Supports architect, dates and the director's quote but not the roof garden, pixel facade or 7,000 m2 (those are on the museum's page).
- `museum-of-fine-arts`: https://www.budapestinfo.hu/en/the-museum-of-fine-arts-1 — Page renders no readable content; unusable as a source.
- `museum-of-illusions`: https://www.budapestinfo.hu/en/museum-of-illusions-2025 — Page returned only its title when fetched; not usable to check claims.
- `national-dance-theatre`: https://www.budapestinfo.hu/en/national-dance-theatre — Not opened in this check (Budapest Info pages return only titles).; https://www.tancszinhaz.hu/en — Does not mention the Bozsik Yvette Company or any closed days, so it does not support those parts of the longForm text (now corrected).
- `new-york-cafe`: https://www.budapestinfo.hu/en/new-york-cafe — Page not readable (title only).; https://en.wikipedia.org/wiki/New_York_Caf%C3%A9 — Redirects to the hotel article; the interior detail (frescoes, marble columns) is not in it but is in Sunshine Seeker, which supports it.
- `normafa`: https://hegyvidek.hu/english/recreation/normafa — Says the cogwheel railway was built in 1871; the line actually opened in 1874, so this source does not support the original date. It does n…; https://www.budapestinfo.hu/en/wonderful-normafa-what-to-do-in-sunny-weather — Not opened in this check (Budapest Info pages return only titles).
- `obuda-museum`: https://www.budapestinfo.hu/en/obuda-museum1 — Page is only a keyword list (Zichy mansion outbuilding, two exhibition titles); it does not describe the exhibitions.; https://www.museum.hu/museum/63/Museum_of_obuda — Lists only the Three Faces exhibition and does not mention the toy exhibition or the Goldberger collection; the Hungarian museum.hu exhibit…
- `pal-volgyi-cave`: https://www.budapestinfo.hu/en/pal-volgyi-cave-en — JavaScript shell; could not be opened.; https://www.dunaipoly.hu/en/places/interpretation-sites/pal-volgyi-cave — Page is the national park operator's (cave operator) page, not the 'cave's own site'; it gives the tour length of 500 m but no total system…
- `palatinus-bath`: https://hu.wikipedia.org/wiki/Palatinus_Strandf%C5%91rd%C5%91 — Does not name Archikon or the Arvé/Nagy designers, although the history text attributes the 2016-17 reconstruction detail to it; those name…
- `pesti-vigado`: https://www.budapestinfo.hu/en/pesti-vigado — JavaScript shell; could not be opened. History section text is consistent with verified facts but could not be compared to it.; https://vir.vigado.hu/web/en/timeline-of-pesti-vigado — Page works but is thin: it supports 1833, 1865, 2014 and 27 May 2017 only, and does not contain the 1859, 1860, 1945, 1954, 1968, 1980, 200…; https://visithungary.com/articles/a-cultural-centre-for-one-and-a-half-centuries-the-pesti-vigado — Supports the venue list and terrace views, but not the Rákóczi March, Brahms, seat counts or 2017 exhibition; those are attached to the wid…
- `petofi-museum-of-literature`: https://hu.wikipedia.org/wiki/Pet%C5%91fi_Irodalmi_M%C3%BAzeum — Does not contain the architect, Batthyany-arrest or Municipal Gallery details; those need the Karolyi-palota article or PIM history page.; https://en.wikipedia.org/wiki/Pet%C5%91fi_Literary_Museum — Short article; supports address, founding and collections only.
- `robert-capa-contemporary-photography-center`: https://en.wikipedia.org/wiki/Ernst_Museum — Does not mention Lajos Ernst's death, the Kunsthalle branch, name changes, Rippl-Rónai or Lechner; it cannot back those statements. The off…
- `rumbach-street-synagogue`: https://en.wikipedia.org/wiki/Rumbach_Street_Synagogue — Does not contain the facade colour, lotus, Jachin/Boaz or Alhambra-capital details; it supports only the Dome of the Rock homage, brick mat…; https://cja.huji.ac.il/mhs/browser.php?id=24867&mode=set — Supports architect, style, brick, octagonal plan, address and current use, but gives no facade colour or ornament detail. It is also used a…
- `savoyai-terrace`: https://en.wikipedia.org/wiki/Buda_Castle — Does not describe the horseshoe staircase or the name 'Savoyai terrace' (calls it the Danube terrace); the staircase claim rests on Mandadb…
- `shoes-on-the-danube-bank`: https://www.budapestinfo.hu/en/shoes-on-the-danube-bank — Page not readable (title only); it is cited as the source for the 'Why the shoes were left at the river' story, but the story is supported …; https://alle.travel/en/budapest/pages/shoes-on-the-danube-memorial-budapest-s-silent-tribute-to-loss — Does not mention a bench or the exact months December-January; use Wikipedia for those.
- `st-elizabeth-church-roses-square`: https://rozsaktere.hu/en/history/ — Duplicated three times in the history sources list (once under the generic 'visitor information' label); cosmetic only.
- `st-stephen-s-hall`: https://welovebudapest.com/en/article/2021/8/23/sights-culture-sparkling-st-stephen-s-hall-now-fully-renovated-and-free-to-visit-all-week — Returns a 301 redirect to the zero-padded date path (/2021/08/23/); works but could be updated.; https://www.budapestinfo.hu/en/st-stephens-hall-en — Budapest Info pages render only a title; cannot support any claim. Same for the Castle Museum page used in the history sources.
- `st-stephens-basilica`: https://www.budapestinfo.hu/en/st-stephens-basilica-en — Page returned only its title when fetched, so it could not be used to check any claim.
- `szamos-chocolate-museum`: https://welovebudapest.com/en/article/2017/05/31/go-on-a-delicious-tour-inside-budapest-s-szamos-chocolate-museum/ — Dated 2017; says tastings at each stop, which may not apply today.; https://www.budapesttimes.hu/arts/delectable-museum-delivers-sweeter-promises/ — 2020 article is dated; supports collection history but not current status or coordinates. Official page https://szamos.hu/csokolademuzeum a…; https://www.budapestinfo.hu/en/szamos-chocolate-museum — Not opened in this pass; used as sourceUrl and history source, only generic text attached to it.
- `szechenyi-thermal-bath`: https://www.szechenyibath.hu/past-and-present — Supports Zsigmondy, 1881 artesian bath, 1913 opening by Czigler, 1927 extension and 1960s additions, but not drilling dates, spring tempera…; https://www.budapestinfo.hu/en/szechenyi-medicinal-bath-and-swimming-pool-en — Fetch returned only the page title; could not be used for verification.
- `the-1956-monument`: https://www.budapestinfo.hu/en/the-1956-monument — JavaScript shell; could not be opened. The story 'The geometry of 1956' cites it for sculptural symbolism but it could not be checked there.; https://war-memorial.net/1956-revolution-memorial-in-Budapest-1.363 — Only supports 'heated debate' and the 50th-anniversary dedication; it does not mention the government commission, i-ypszilon, Stalin statue…
- `the-taban`: https://en.wikipedia.org/wiki/Tab%C3%A1n — Does not mention Rácváros/Raitzenstadt, the 600 families, 1696 census, 1810 fire, 1838 flood or demolition years; those come from the St De…; https://welovebudapest.com/en/article/2018/12/11/tales-of-the-taban-budapest-s-long-lost-balkan-quarter/ — Does not mention the Montmartre comparison, the 600 families, 1696 census or Kereszt Street, though it is listed as a source for the Tabán …
- `the-tomb-of-gul-baba`: https://www.duna-drava.hu/en/tomb-of-gul-baba — Supports the legend of the sultan at the funeral and construction/restoration dates (1960-61, 1996, work from 2016) but does not mention a …; https://visithungary.com/articles/tomb-of-gul-baba — Supports the Rose Hill tradition but does not give 1541 or any funeral account; also says the name comes from a rose worn on his turban.; https://en.wikipedia.org/wiki/Tomb_of_G%C3%BCl_Baba — Lists restorations only in the 1960s and 2018 (not the 1990s) and does not state current ownership; a Wikipedia-only reading would not supp…
- `toth-arpad-promenade`: https://www.timeout.com/hu/budapest/latnivalok/toth-arpad-setany — Hungarian-language page; supports views, cherries, Görgei statue and defensive-passage origin as used.
- `trinity-square`: https://commons.wikimedia.org/wiki/File:Budapest,_Budai_V%C3%A1r,_vissza%C3%A9p%C3%ADtett_P%C3%A9nz%C3%BCgyminiszt%C3%A9rium,_8.jpg — File title is 'rebuilt Ministry of Finance' (categorised under Szentháromság tér); structured data does not say it shows the Holy Trinity C…
- `tropicarium-the-shark-zoo`: https://pw.wzd.cz/zoo/eu/hu/budapest-to/history-of-the-tropicarium/ — Third-party directory copy of the operator's history text, last updated 2010; fine for early history but not for current facts.
- `ujlaki-synagogue`: https://frankel.hu — The community site supports prayer times, contacts and the rabbi but does not state 'Neolog' or 'Ashkenazi'; those come from Hungarian Wiki…
- `underground-railway-museum`: https://en.wikipedia.org/wiki/Millennium_Underground_Railway — Labelled 'Budapest Metro Line M1' but the article is the Millennium Underground Railway page; content supports the claims. Its infobox and …; https://www.showcaves.com/english/hu/subterranea/Millennium.html — Gives no depth, no 1960s fill-in plan and no coordinates; not usable for those claims.
- `vaci-street`: https://www.budapestinfo.hu/en/vaci-street — Page returns no readable content; the history section's only source cannot be checked.
- `vasarely-museum-budapest`: https://kassakmuzeum.hu/en/zichy-castle — Supports the mansion's baroque history and that it hosts the Kassák, Óbuda and Vasarely museums, but contains none of the Vasarely donation…; https://kassakmuzeum.hu/en/zichy-castle — Not relevant to the coordinates claim it was attached to; it does not give coordinates. OSM Nominatim was used instead.
- `veli-bej-bath`: https://justbudapest.com/veli-bej-baths/ — Does not name the builder or give an address and mentions a capacity of 80 but no age limit; supports only the 1574 date, octagonal pool an…; https://justbudapest.com/veli-bej-baths/ — Not opened in this pass; earlier audit notes it gives 1574 without a builder. The Hospitaller order's page (http://www.irgalmasrend.hu/site…
- `vorosmarty-square`: https://www.budapestinfo.hu/en/vorosmarty-square — JavaScript shell; could not be opened. History text (cafés, winter markets) could not be checked against it.
- `zugliget-chairlift`: https://www.budapestinfo.hu/en/zugliget-chairlift — Page returns only its title to the fetcher; could not be checked.; https://bkv.hu/en/content/the_history_of_zugliget_chairlift_en — Gives only 'built in 1970', no exact opening day; the 20 August 1970 date comes from BKK, which is correctly attributed in the text.

## Time-sensitive visitor statements, re-checked 2026-11-02 (Phase 19)

232 sentences about closures, reopenings, rules, procedures and routes were re-checked against current operator or official pages (model-based re-check of time-sensitive sentences against current operator or official pages): CURRENT 74, OUTDATED 8, UNVERIFIED 14, not time-sensitive (history or generic advice) 136. 12 corrections were applied. Evidence URLs: docs/phase19/time-sensitive-review.json. This is model-based; no human editor has signed it off.

Corrections:

- getting-around-budapest: The reorganisation is no longer upcoming; BKK says it took effect on the night of 1 to 2 July 2026, and the page describes the metro as having extended (not all-night) operating hours. (https://bkk.hu/utazasi-informaciok/kozossegi-kozlekedes/ejszakai-kozlekedes/)
- getting-around-budapest: The night-route reorganisation announced for summer 2026 took effect on the night of 1 to 2 July 2026. (https://bkk.hu/utazasi-informaciok/kozossegi-kozlekedes/ejszakai-kozlekedes/)
- danube-cruises: The Telex article on the record-low Danube and restrictions on the Budapest section is dated 28 July 2026. (https://telex.hu/belfold/2026/07/28/duna-vizallas-rekord-alacsony-klimavaltozas-aszaly-fotok-kepek-budapest-es-kornyeke)
- gellert-hill-citadella: The Citadella reopened on 5 April 2026 after its renovation, so the remark that sources disagree on whether parts are under renovation is stale. Replacement is about 8 words shorter; recheck the 35-70 word description limit if this sentenc… (https://xpatloop.com/channels/2026/03/budapest-landmark-reborn-citadella-reopens-to-public-this-march.html)
- city-park-boating-lake: No 2026 announcement could be found; the quoted fleet matches a 2023 article, and rowboats and paddleboards are only available at higher water levels. Cautious wording avoids a stale fleet count. (https://welovebudapest.com/cikk/2023/7/5/szabadido-varosligeti-to-csonakazas-vizibicikli-sup)
- mary-magdalene-tower: Tower closed in February 2025 but officially reopened on 15 July 2025. (https://dailynewshungary.com/budapest-600-year-old-tower-reopens/)
- mary-magdalene-tower: The closure described as upcoming ended with the official reopening on 15 July 2025. (https://dailynewshungary.com/budapest-600-year-old-tower-reopens/)
- mary-magdalene-tower: The report that it was closed is superseded by the 15 July 2025 reopening. (https://dailynewshungary.com/budapest-600-year-old-tower-reopens/)
- lukacs-thermal-bath: The institute was merged in 2021 and integrated into Semmelweis University in 2025, so "has operated there since 1951" is no longer accurate. (https://www.economx.hu/magyar-gazdasag/reumatologiai-es-immunologiai-klinika-semmelweis-egyetem-integracio-betegellatas-egeszsegugy.805219.html)
- romai-open-air-bath: The Plázs is now an authorised natural bathing place (2026 permit), so a present-tense ban cannot be confirmed. (https://obuda.hu/wp-content/uploads/2026/06/UZEMELTETESI-SZABALYZAT-2026.pdf)
- romai-open-air-bath: Present-tense swimming ban cannot be confirmed for 2026; the beach is an authorised seasonal bathing place. (https://obuda.hu/wp-content/uploads/2026/06/UZEMELTETESI-SZABALYZAT-2026.pdf)
- the-taban: The bath is still closed in 2026; "current opening times" suggests it is open. (https://444.hu/2026/01/15/kozbeszerzesi-eljarast-irtak-ki-a-tobb-mint-20-eve-zarva-tarto-rac-furdo-felujitasara)

Still UNVERIFIED (no current source reachable; the wording stays cautious):

- house-of-music-hungary: The subterranean level holds permanent and temporary exhibitions as well as a sound dome that creates a hologram-like aural environment, inspired by a concept …
- margaret-island: Margaret Island is a 2.5-kilometre park in the middle of the Danube, largely closed to cars, with gardens, a music fountain, a Japanese garden, a water tower, …
- margaret-island: The island lies between Margaret Bridge and Árpád Bridge; private cars are not allowed, so arrive on foot or by public transport.
- city-park-boating-lake: A 2026-season announcement lists 32 pedal boats, 10 rowboats and 10 stand-up paddleboards at the lakeside, and mentions summer events such as paddleboard yoga …
- szamos-chocolate-museum: Scheduled public tours are reported to be in Hungarian, with English offered to pre-arranged groups, so check this when booking.
- robert-capa-contemporary-photography-center: It holds more than 900 Capa prints, shows permanent displays on Capa and André Kertész, and runs temporary exhibitions, workshops and the annual Capa Grand Pri…
- light-art-museum-lam: A March 2026 guide advises that visitors sensitive to light should ask staff about a safer route because some installations use strobes and loud audio.
- goldberger-textile-collection: One covers the history of textile printing; another, a Tamási workshop display, is described as presenting the last textile manufactures, including tutyi (clos…
- goldberger-textile-collection: Sewing machines, scale models and authentic copies of equipment give a physical idea of how patterned cloth was produced, and several large machines from the m…
- hungarian-railway-history-park: Visitors can also try handcars and a locomotive simulator, see a model railway, or ride the miniature railway that has run in the grounds since 2006.
- romai-open-air-bath: According to Telex, a free public Danube beach at Római-part opened in 2021, the first legal one since 1973, but swimming is not allowed there and only wading …
- romai-open-air-bath: The Danube riverside beach at Római-part is a separate site where swimming is not allowed.
- castle-garden-bazaar: Archaeological finds from the excavations were shown in the southern palaces when the building reopened in 2014; check the official site for what is currently …
- rumbach-street-synagogue: After decades of decay it was restored and reopened in 2021, and sources describe it as serving as a synagogue, a museum and a concert hall.

## Guides (T-012)

| Guide | Claims checked | Corrections |
| --- | --- | --- |
| danube-cruises | 16 | 1 |
| budapest-thermal-baths | 15 | 4 |
| buda-castle-district | 17 | 0 |
| downtown-pest-walking-guide | 19 | 2 |
| budapest-in-3-days | 17 | 2 |

Details: `docs/fact-check/guide-fact-check.json`.
