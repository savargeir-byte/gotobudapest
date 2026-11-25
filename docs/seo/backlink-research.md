# GoToBudapest backlink research

Research date: 2026-11-17. Method: web search plus fetching every page listed below (WebFetch and curl). Nothing was contacted, nothing was posted, and no repository or website was touched.

Rules applied: no purchased links, no PBNs, no link exchanges, no mass or automated outreach, no fake personas, no invented facts. Where I could not verify something it is marked UNVERIFIED and collected in section 8.

Our domain: staging https://gotobudapest.vercel.app, canonical https://www.gotobuda.com (verified live, HTTP 200; apex gotobuda.com redirects to www; sitemap lists 303 URLs: 220 attraction pages, 35 neighbourhood guides, 9 guides, 9 /visit pages, 7 /transportation pages, 6 /culture, 5 /gastronomy, 4 /experiences).

---

## 0. Read this first: three things that will hurt outreach unless fixed (recommendations only, I did not change anything)

1. **No visible About, contact or affiliate-disclosure page.** The homepage, /essentials, /currency, /guides/downtown-pest-walking-guide and the attraction pages I fetched show no About link, no named author (bylines are "GoToBudapest editorial" or absent), no contact details and no affiliate disclosure. The sitemap contains no such page either. Every recipient who checks us will look for these. /transportation/accessible-travel does say "Tours and tickets are supplied by Viator or Tiqets", which is the only disclosure-like text I found. Before any outreach: an About page naming who runs the site, a contact route, and a plain affiliate disclosure. Several competitors have these (hungaryunlocked.com has /affiliate-disclosure/, budapest-trip.com has /about/ and /affiliate-disclosure/).
2. **The "Hungarian name and pronunciation" angle is not currently true for the whole site.** /attractions/hungarian-parliament has no Hungarian name and no pronunciation guidance. Some pages do give the Hungarian name (Vérmező page: "Magyar jakobinusok emlékköve"; Újlak synagogue: "Frankel Leó úti zsinagóga"; Kerepesi: "Fiumei Úti Sírkert"; Wekerle: "Wekerletelep"). No URL in the sitemap relates to pronunciation. So do not pitch pronunciation until it exists (see asset B in section 5).
3. **The accessibility page is generic.** /transportation/accessible-travel (and /essentials) says explicitly that GoToBudapest "cannot confirm accessibility at individual venues". It is honest and sourced (BKK, Budapest Info) but it adds little beyond what BKK and wheelchairtravel.org already publish, so I would not use it as an outreach asset to accessibility sites until we build verified data (asset C).

---

## 1. Directories, resource pages and "useful links" pages

### 1A. Pages with verified dead or hijacked links (also covers section 3)

| Priority | Source page (fetched) | Why it matters | Contact route |
|---|---|---|---|
| 1 | https://univet.hu/en/student-support-services-at-univet-budapest/useful-links-info/culture-and-leisure/ | University of Veterinary Medicine Budapest student page, "Living in Hungary and Budapest info" plus "Top sights" link lists. Several verified-broken entries (section 3). Current-ish: footer links a 2026 issue. | General address info@univet.hu (shown as "info[PUT_AT_HERE]univet.hu" on https://univet.hu/en/contact/); phone +36 1 478 4100. No webmaster address. |
| 2 | https://media.elte.hu/mcluhan/budapest-guide.html (copies at https://film.elte.hu/scsmi2011/bpguide.html and https://mmi.elte.hu/euscreen/budapest-guide.html, not opened by me beyond the search snippets) | ELTE 2011 conference microsite (McLuhan 100), "Budapest Guide" with about 25 outbound links, at least 6 verified dead or hijacked plus 5 soft-failing bath links (section 3). Footer is (c)2011, so this is probably abandoned. | https://media.elte.hu/mcluhan/contact.html names András Müllner and Zsófia Buglya and gives only a postal address (ELTE Dept of Media and Communication, 1088 Budapest, Múzeum krt. 6-8). No email. Low odds. |

### 1B. Pages that list Budapest/Hungary resources but where I could not confirm a route or a fit

- https://visithungary.com/articles/useful-links (301 to https://csodasmagyarorszag.hu/articles/useful-links, which returned HTTP 500 twice). The official Hungarian Tourism Agency list. I could not read it. I found no public "submit your site" route. The Qualified Partner programme (visithungary.com/kiemeltpartner, kp@visithungary.com) requires a Hungarian-registered business, and the 2026 application window quoted in search was 2-18 March 2026. Treat official bodies (Visit Hungary, https://www.budapestinfo.hu/en) as not accepting independent guides. budapestinfo.hu/en shows no contact, partner or submission link at all.
- https://uni-bge.hu/en/useful-and-practical-information-for-incoming-erasmus-students (Budapest University of Economics and Business Erasmus page). Fetched. Only Budapest-related outbound links are BKK and a 2020-era airport COVID page (https://www.bud.hu/en/covid_19). That URL returned 403 to curl, which may be bot-blocking, so I cannot call it dead. Contacts are faculty Erasmus coordinators only. Weak fit, not pursued.
- https://www.studyinhungary.hu/living-in-hungary/menu/useful-links.html returned 404 itself.
- University guides (ELTE student guides, ESN Corvinus survival guide, BME Welcome Guide 2026 PDF) exist, but they are PDFs and student-run documents with no public link-suggestion route that I could verify. Not pursued.
- Library guides (KU https://guides.lib.ku.edu/hungary, UCLA https://guides.library.ucla.edu/hungarian, USC) turned up in search only; I did not open them. Library subject guides sometimes accept suggestions from the guide's librarian, but they are country/business/language guides, not travel. UNVERIFIED, low fit.

### 1C. Directory-type sites that I would NOT use

- Generic "submit your site" directories, article directories, and "best Budapest blogs" aggregator lists that sell placement (the bloggers.feedspot.com lists in the search results are aggregator profiles). They are low-value and risk looking manipulative.
- Wikivoyage: it is a community-edited wiki with its own listing rules, and I have not verified its external-link policy in this session. Do not add links. Not a link-building tool, same logic as Wikipedia.
- Tripadvisor/Fodor's forums and r/budapest: genuine answers to questions are fine, link-dropping is not. I did not check r/budapest's self-promotion rules; check before ever posting.

---

## 2. Editorial and publication targets, with the specific gap our content fills

Ordered by my estimate of (relevance x likelihood of a reply x honest fit).

| # | Target | What I verified | Gap our content fills (and limits) | Route |
|---|---|---|---|---|
| 1 | **JGuide Europe, Budapest page** https://jguideeurope.org/en/region/hungary/budapest/ (Jewish heritage guide supported by the Jacques and Jacqueline Lévy-Willard Foundation) | Page lists 8 Budapest sites (Medieval House of Prayer, Dohány, Rumbach, Kazinczy, Mazsihisz centre, Bálint Ház, Miksa Róth Museum, Kozma Street cemetery) and a "Contribute" form for places/facts not yet listed. | Its list has no Újlak (Frankel Leó) synagogue and no Óbuda synagogue. We have /attractions/ujlaki-synagogue (consecrated 8 Aug 1888, architect Sándor Fellner, 1928 residential block built around it, courtyard plaque 2014, sources incl. community site frankel.hu) and /attractions/obuda-synagogue. Limit: JGuide is a heritage directory, so the ask is a "further reading" link or correction suggestion, not a guarantee. I did not open our Óbuda page; check its sources before pitching it. | Contribute form and https://jguideeurope.org/en/contact-us/ |
| 2 | **We Love Budapest** https://welovebudapest.com | Its "Accessible Budapest" mobility guide (11 Nov 2019) carries its own warning "updated more than a year ago", cites 2019-era prices, and links the Gellért Bath entry to the Budapest Zoo page. Editorial principles page says businesses cannot request changes except factual corrections. | We can offer a factual correction (the wrong Gellért link) and, if they want, the BKK-sourced page. Honest limit: our accessibility page is generic (section 0), so lead with the correction, not a link request. | ajanlom@welovebudapest.com (venue suggestions), info@welovebudapest.com, form/page https://welovebudapest.com/en/contact |
| 3 | **Love from Hungary** https://lovefromhungary.com (Julia Kravianszky, licensed private guide) | Active: posts 9 Nov 2026 (Danube Bend day trip) and 26 Oct 2026 (1956 revolution). No resources page or blogroll. | Her 1956 and Danube Bend posts overlap our /attractions/the-1956-monument, /attractions/memento-park, /attractions/fiumei-road-national-graveyard-kerepesi and /visit/budapest-day-trips. A cited-source reference list is the angle. Limit: she sells tours, so we are adjacent to her business; no promise of a link. | https://lovefromhungary.com/contact-budapest-private-tour-guide/ (email and form listed there) |
| 4 | **Info-Budapest** https://info-budapest.com (author Lóránt Dénes) | Has a "Budapest Info" directory-style menu, "hardly known sights" section, newest posts April 2025, footer "@2020" so partly stale. | Verified-sources history pages for lesser-known places. Limit: site is partly dated, authority unknown, I did not assess its quality beyond the homepage. | Contact form at https://info-budapest.com/contact-us/ (no email shown; it invites reports of mistakes and topic requests) |
| 5 | **Wekerlei Társaskör** (residents' association, Wekerletelep) https://wekerletelep.hu/wekerletelep-tortenete/ | Hungarian-only site, no English version, no links section. We cite them as a source on /attractions/wekerle-estate-wekerletelep. | An English-language visitor page that uses their history page as a source and tells visitors to respect residents. English coverage already exists (We Love Budapest 2020, Budapest Times, Wikipedia, industrialheritagehungary.com), so our gap is the documented source disagreements (1908 vs 1909 start; 44 vs 48 house types), not coverage. Relationship, not a link ask. | wekerleitarsaskor@gmail.com, office hours Mon/Wed/Thu 17:00-19:00 at Kós Károly tér 10 (from their page) |
| 6 | **Budapest100 (KEK)** https://budapest100.hu/en/ | English pages exist; we cite https://budapest100.hu/house/szent-istvan-park/ on our Újlipótváros page. Active (news 15 Sep 2026). No links page. | A courtesy note that we cite them; link is unlikely and not the point. | budapest100@kek.org.hu |
| 7 | **Daily News Hungary** https://dailynewshungary.com | /write-for-us/ says: pitch first, original unpublished work, no AI content, no sponsored content, "external links ... DA 60+" and two internal links. | Only worth it once we have an original-data asset (section 5). A news site will not run a generic guide. Our affiliate model must be disclosed; their "no sponsored content" rule means no promotional angle at all. | info@dailynewshungary.com (pitch by email first) |
| 8 | **Offbeat Budapest** https://www.offbeatbudapest.com (Tas Tóbiás) | Neighbourhood overview (29 Sep 2025) covers 8 districts (I, V, VI, VII, VIII, IX, XI, XIII). Jewish synagogues/cemeteries article (1 Sep 2025) has 10 entries and cites no outside sources; it omits Újlak synagogue. | Our 35 neighbourhood guides cover far more areas, with named sources (e.g. Újlipótváros cites Budapest100, the XIII district site and Wikipedia). No contact form or email; only Substack/Instagram/Facebook. A single personal note through their newsletter reply or Instagram is legitimate; nothing mass. | Substack/Instagram only |
| 9 | **Hungary Unlocked** https://hungaryunlocked.com | Active (guides dated 15-17 Nov 2026), has contact, about, accessibility, /affiliate-disclosure/, stats pages (/budapest-tourism-statistics/, /budapest-thermal-baths-statistics/). | Direct competitor in format. I found no verified gap to offer. Low priority; only if we later publish a data asset they would want to cite. | /contact/ |
| 10 | **WheelchairTravel.org Budapest guide** https://wheelchairtravel.org/budapest/ (John Morris) | Guide links BKK, Paratrans and venue sites; no last-updated date. | Nothing yet: our accessibility page is generic. Revisit after asset C. | Newsletter/social/"Work with John" page only; no correction email |
| - | Budapest By Locals https://www.budapestbylocals.com ; Justbudapest https://justbudapest.com ; Budapest-trip.com | Verified existence and contact (BBL has a contact form at /message/; Justbudapest and Budapest-trip show none). All are commercial competitors with affiliate or booking links. | No gap identified. Not recommended. | - |
| - | Expat Arrivals, Expat Exchange, Expat Focus, XpatLoop | Expat Arrivals and Expat Focus returned 403 to fetch; XpatLoop and Expat Exchange only seen in search snippets. | UNVERIFIED. These sit in section 8. | - |

Official bodies (Hungarian Tourism Agency/Visit Hungary, Budapest Info): no public route for independent guides (see 1B). Do not expect a link.

---

## 3. Broken-link opportunities (each dead URL fetched or DNS-checked on 2026-11-17)

Method: curl with the Windows revocation check disabled, plus nslookup against 8.8.8.8 to confirm NXDOMAIN. Timeouts or expired certificates were NOT counted as dead (est.hu, greatsynagogue.hu, gotohungary.com all excluded).

### 3A. Source: https://univet.hu/en/student-support-services-at-univet-budapest/useful-links-info/culture-and-leisure/

| Dead or hijacked URL on that page | Evidence | Our replacement | Honesty note |
|---|---|---|---|
| http://www.en.bazilika.biz (labelled Basilica) | www.en.bazilika.biz: NXDOMAIN at 8.8.8.8. The bare host en.bazilika.biz 301s to https://www.old.bazilika.biz/en. | https://www.gotobuda.com/attractions/st-stephens-basilica (HTTP 200) | The right primary replacement is the basilica's official site https://www.bazilikabudapest.hu/en (our own guide cites it). Our page is a supplementary, independent history page, not a substitute for the official site. |
| http://www.en.budapestinfo.hu | NXDOMAIN at 8.8.8.8 | None of ours is a true equivalent. Correct fix is https://www.budapestinfo.hu/en (official). | Mention only as part of a helpful list; do not ask them to swap it for us. |
| http://www.visitbudapest.travel | Currently 301s to https://intriguehouse.com/, a DIY/home-decor site ("Intrigue House: Curiosity Meets Craft"). Unrelated to Budapest. | None; correct replacement is budapestinfo.hu/en. | It is not a 404; it is a domain now serving unrelated content, which is a more important reason to fix it. |

### 3B. Source: https://media.elte.hu/mcluhan/budapest-guide.html (2011 microsite, copy pages listed in 1A)

| Dead or unrelated URL | Evidence | Our replacement | Honesty note |
|---|---|---|---|
| http://www.gellertbath.com/ | HTTP 410 Gone | https://www.gotobuda.com/attractions/gellert-thermal-bath (200) | Our page does not show live prices or hours; the Gellért is also closed for renovation (Offbeat Budapest says until early 2029; I have not verified this against an official source, so check our own page before citing it). |
| http://www.budapestgyogyfurdoi.hu/en/szechenyi/prices, /lukacs/prices, /kiraly/prices, /palatinus/prices, /romai/prices | Now land on the Hungarian homepage https://www.budapestgyogyfurdoi.hu/hu (soft failure) | Ours: /attractions/szechenyi-thermal-bath, /attractions/lukacs-thermal-bath (both 200). No verified Király/Palatinus/Római page of ours. | They linked to price pages; we do not show prices. Weak equivalent. |
| http://www.budapestinfo.org/ | Redirects to https://www.budapestinfo.org/ and the final URL ended on gamereactor.eu/online-kaszino, an online-casino page (I saw the final URL, not the content). | None of ours. | Hijacked domain; worth reporting for that reason. |
| http://english.budapest.hu/Engine.aspx | NXDOMAIN | None | - |
| http://hungary.usembassy.gov/tourist_advisory.html | NXDOMAIN | None | - |
| http://www.budapestsun.com/ | DNS SERVFAIL at 8.8.8.8 (likely dead; weaker evidence) | None | - |
| http://old.hdke.hu/index.php?changelang=eng (Holocaust Memorial Center) | NXDOMAIN | I did not check whether we have a Holocaust Memorial Center page. | - |

Realistic odds: Univet is a live, current page with a general info address, so it is worth one polite note. The ELTE microsite is a 2011 event page with a postal address only; treat as near-zero.

### 3C. Pages I looked at that had no broken-link opportunity for us

- https://www.studyinhungary.hu/living-in-hungary/menu/useful-links.html: the page itself is a 404.
- Univet links to welovebudapest.com pages with "-2" slugs; these redirect (200) to current pages, so they are not dead.

---

## 4. Unlinked-mention search

I searched for "gotobuda.com", "GoToBudapest", "gotobudapest.vercel.app" and "Go To Budapest" with and without quotes.

Result: none found. The searches returned unrelated results (a Buda.com crypto client on GitHub, generic Budapest guides). I opened no page that mentions us, so there are no unlinked mentions to reclaim.

Caveat: the search tool I used is a general web search (US-focused), not a link index. This is "none found by this method", not proof that none exist. Recommended low-effort follow-ups for the team: Google Search Console Links report, Bing Webmaster Tools, a Google Alert on "gotobuda" and "GoToBudapest", and a periodic search for "GoIceTravel" (the sister site that the footer links) in case mentions of the group exist.

---

## 5. Linkable assets

### 5A. Existing pages that deserve outreach (each fetched on 2026-11-17)

Ranked by how defensible the claim is.

1. **/attractions/vermezo-hungarian-jacobins-memorial** (https://www.gotobuda.com/attractions/vermezo-hungarian-jacobins-memorial). Sourced to Budavár municipality, hu.wikipedia and en.wikipedia. Distinctive: it flags a source conflict (20 May vs 20 March for the 1795 executions) instead of picking one, gives the Hungarian name, and notes the Béla Kun memorial moved to Memento Park in 1991. Checked 2026-11-09.
2. **/attractions/wekerle-estate-wekerletelep**. Sources: residents' association history page, Kispest municipality, Wikipedia. Distinctive: Kós Károly square dates (competition 1912, Kós leaves autumn 1913), protection history (1980s, 2011) and explicit source disagreements (1908/1909; 44 vs 48 house types). Checked 2026-11-09.
3. **/attractions/fiumei-road-national-graveyard-kerepesi**. Dated timeline 1847-2016 from the National Heritage Institute and hu.wikipedia, with the 1958 vs 1959 Workers' Movement Pantheon discrepancy noted. Checked 2026-11-09.
4. **/attractions/the-tomb-of-gul-baba**. Separates verified dates (1541, 1543-48, 1686, 1885-1914, 2018) from legend ("Father of Roses", Suleiman's funeral); five sources incl. Budapest Info and Duna-Drava. Checked 2026-10-29.
5. **/attractions/ujlaki-synagogue** (and the Jewish heritage set: dohany-street, rumbach-street, kazinczy-street-orthodox, obuda, kozma-street-jewish-cemetery). Gap against Offbeat Budapest and JGuide Europe (section 2). Checked 2026-10-29 for Újlak.
6. **The 35 neighbourhood guides** (e.g. /neighbourhoods/ujlipotvaros with six sources incl. Budapest100 and the district municipality). Coverage is broader than Offbeat Budapest's 8-district overview (verified). Individual quality varies; I only read Újlipótváros.
7. **/guides/downtown-pest-walking-guide** (updated 29 Oct 2026, 14 sources, 9 of them Wikipedia). Good as a route guide, but Wikipedia-heavy sourcing is a credibility weakness for outreach to historians or journalists.
8. **/currency** (live reference rates dated 2026-11-16 from Frankfurter, with MNB link). Useful tool-like page, but rates are indicative only and there is no author or update history.

Weak as outreach assets right now: /transportation/accessible-travel, /essentials, /attractions/hungarian-parliament (no Hungarian name or pronunciation; sourced to official parliament.hu PDF and visitor centre, otherwise solid), /visit/budapest-day-trips (sourced to Budapest Info, BKK, kiralyikastely.hu, otherwise thin).

### 5B. Additional original assets (worth building; all from facts we can source)

**A. "Where Budapest guidebook facts disagree": a register of documented source conflicts.**
- Data: every date, number or attribution we have already flagged where primary or official sources disagree (Vérmező 20 May/20 March; Wekerle 1908/1909 and 44/48 house types; Kerepesi 1958/1959). Add the primary source for each (municipal archive, heritage institute, Hungaricana library scans).
- Why cite it: guidebook writers and local journalists repeat these figures; a dated, sourced list of "which sources say what" is rare and quotable. It also shows our editorial method.
- Verify: for each entry, locate the primary document or the institution's current statement, and record who we asked and when. Do not publish a "correct answer" unless a primary source settles it.

**B. Hungarian names and pronunciation for Budapest places.**
- Data: for each of the 220 attractions, the Hungarian name, what the name means literally, how to say it in plain respelling, plus the street-word key (utca, út, tér, körút).
- Why cite it: visitors, language teachers and expat sites ask for this; my searches turned up pronunciation of "Budapest" but no attraction-by-attraction guide (search results also disagreed on stress, which is a reason to get it right).
- Verify: Hungarian names from official institution sites, not Wikipedia; pronunciation reviewed by a native speaker; cross-check with the Hungarian orthography authority and Forvo-style recordings.

**C. Verified step-free access table for Budapest transport and top sights.**
- Data: per metro/tram/HÉV station or attraction, step-free route status taken only from BKK's accessibility pages and each operator's own statement, with the date checked.
- Why cite it: accessibility blogs and relocation guides currently cite a 2019 We Love Budapest article that is itself flagged as outdated.
- Verify: BKK accessibility information (https://bkk.hu/en/travel-information/accessibility/), venue statements, a phone or email reply for anything we cannot confirm. Never publish "accessible" for a venue we cannot confirm; state "unconfirmed" and date it.

**D. Neighbourhood-to-district reference: 35 neighbourhoods against Budapest's 23 districts, with Hungarian names and the year each area joined the city.**
- Data: neighbourhood name, district number, Hungarian name, and the 1873 unification / 1950 Greater Budapest incorporation history where it applies (we already use the 1950 Kispest and Újlipótváros joining dates on pages).
- Why cite it: search results show neighbourhood confusion (e.g. Rákóczi tér as an unofficial area inside District VIII, Újlipótváros as part of District XIII); a clean table helps writers.
- Verify: Budapest municipal and KSH (Hungarian Central Statistical Office) district data, Budapest City Archives, district municipality sites.

**E. "What is closed or under renovation" tracker, dated.**
- Data: attractions and baths that are closed or partly closed (e.g. Gellért Baths, reported closed since 1 October 2025 by budapest-trip.com and until early 2029 by Offbeat Budapest, neither of which I have confirmed with an official source), with the official notice and date checked.
- Why cite it: visitors and journalists need one dated list; sites currently contradict each other and quietly go stale.
- Verify: official operator notices only; show the "checked on" date; commit to a re-check schedule or do not publish.

---

## 6. Platforms where a presence is appropriate

| Platform | Verdict |
|---|---|
| Wikipedia | NOT a link-building tool. Do not edit it to add or reorder links to us. Normal sourced improvements are fine only if made as a genuine editor without promotional intent, and our own page citing Wikipedia does not make us a source for it. |
| Wikidata | Not appropriate for the website itself: a small new guide would not meet notability or structural-need criteria. Adding sourced facts to place items (for example Hungarian labels) is ordinary community editing and should not include our URL as a reference unless it is genuinely the best source (it is not; cite the institution). |
| OpenStreetMap | Appropriate only for accurate map data we have verified (for example step-free entrance, name:hu). Do NOT put our URL in a place's website tag; that tag is for the venue's own site. |
| Google Business Profile | Not appropriate. We are an online guide with no physical premises or service area; a profile would be misleading. |
| Google Search Console and Bing Webmaster Tools | Appropriate and useful for indexing and for finding existing links and mentions. Not link building. |
| Brand social accounts (Facebook, Instagram, Pinterest, YouTube) | Fine for a brand presence; links are nofollow and low value. |
| Journalist-query services (for example Connectively-style or Qwoted-style) | Only after the About page and a named expert exist; do not answer queries we cannot genuinely help with. UNVERIFIED which services are still operating. |
| Tripadvisor / Fodor's / r/budapest | Answer real questions with real answers; no link dropping; read each community's self-promotion rules first. |
| Wikivoyage | Not appropriate to add links; I did not verify its policy this session. |
| Visit Hungary / Budapest Info partner programmes | Not available to us as far as I could verify (see 1B). |

---

## 7. Outreach drafts (10 most promising)

Common notes for whoever sends these:
- Send each one only once, by hand, from a real named person who can be found on an About page. Do not send until section 0 is fixed.
- Placeholders in [square brackets] must be filled by the sender. Nothing below has been sent.
- Affiliate disclosure line used where relevant: "GoToBudapest links to partner tours and tickets and may earn a commission if a reader books; the guide pages themselves are not paid placements." Confirm this wording matches the final site disclosure.

### Draft 1: Univet (resource page, broken links)  DRAFT - NOT SENT
To: info@univet.hu (ask them to pass it to whoever maintains the student information pages)
Subject: Three outdated links on your "Culture and leisure" student page

Hello,

I was reading the "Living in Hungary and Budapest info" section on https://univet.hu/en/student-support-services-at-univet-budapest/useful-links-info/culture-and-leisure/ and noticed some links that no longer work as intended:

- www.en.bazilika.biz (Basilica): the www.en host no longer resolves. The basilica's current official site is https://www.bazilikabudapest.hu/en
- www.en.budapestinfo.hu: no longer resolves; the official city site is https://www.budapestinfo.hu/en
- www.visitbudapest.travel: it now redirects to an unrelated home-decor website.

If it helps your students, we also publish an independent, sourced history page for the basilica at https://www.gotobuda.com/attractions/st-stephens-basilica, and a guide to the neighbourhoods around the main sights. I would only suggest it as an addition after you have fixed the official links, and I understand if you prefer to keep the list official-only. GoToBudapest links to partner tours and tickets and may earn a commission if a reader books; the guide pages are not paid placements.

Thank you for keeping the page up to date.
[Name], [role], GoToBudapest, [About page URL]

### Draft 2: JGuide Europe (Contribute form)  DRAFT - NOT SENT
To: via https://jguideeurope.org/en/contact-us/ (or the Contribute form on the Budapest page)
Subject: Possible additions to the Budapest page: Újlak and Óbuda synagogues

Hello,

Your Budapest page lists eight sites. Two Budapest synagogue sites with active histories are not on it: the Újlak synagogue on Frankel Leó út 49 (consecrated 8 August 1888, designed by Sándor Fellner, surrounded by a residential block completed in 1928) and the Óbuda synagogue.

We run an independent Budapest guide with sourced pages on both, including the Hungarian names, visiting notes (these are working congregations, contact first), and links to the congregation's own site: https://www.gotobuda.com/attractions/ujlaki-synagogue and https://www.gotobuda.com/attractions/obuda-synagogue. [Confirm the Óbuda page's sources before sending.] I am not asking you to link to us. If you add the sites, the congregation's own pages (for example https://frankel.hu) are the best source. If you find a mistake on our pages, please tell me and I will correct it. GoToBudapest links to partner tours and may earn a commission; the heritage pages are editorial.

[Name], [role], GoToBudapest

### Draft 3: We Love Budapest (correction + resource)  DRAFT - NOT SENT
To: info@welovebudapest.com (editorial contact; venue suggestions go to ajanlom@welovebudapest.com)
Subject: Correction on your 2019 "Accessible Budapest" mobility guide

Hello,

Your "Accessible Budapest: a mobility guide to Hungary's capital" (11 November 2019) is still a useful reference, and it carries your own notice that it may be out of date. One factual point I noticed: the Gellért Bath entry links to the Budapest Zoo venue page. Other details that may have changed since 2019 are the equipment rental prices, the metro line 3 renovation status, and HÉV vehicle accessibility.

For your readers' current transport information, BKK's accessibility pages are the authoritative source (https://bkk.hu/en/travel-information/accessibility/). We have a short independent guide to planning step-free routes that points to those sources at https://www.gotobuda.com/transportation/accessible-travel. It is general guidance rather than a venue-by-venue audit, so I am not suggesting it replaces yours. I am writing mainly so the correction gets to you. GoToBudapest links to partner tours and tickets and may earn a commission; this page is not a paid placement.

[Name], [role], GoToBudapest

### Draft 4: Love from Hungary (guide-blogger)  DRAFT - NOT SENT
To: via https://lovefromhungary.com/contact-budapest-private-tour-guide/
Subject: Sourced reference pages for your 1956 and Danube Bend posts

Hello Julia,

I enjoyed your recent posts on the 1956 revolution (26 Oct 2026) and the Danube Bend day trip (9 Nov 2026). We run an independent Budapest guide with cited sources on each page and a "checked on" date. Pages you might find useful as references for readers: https://www.gotobuda.com/attractions/the-1956-monument, https://www.gotobuda.com/attractions/fiumei-road-national-graveyard-kerepesi (dated timeline from the National Heritage Institute, with a 1958/1959 source discrepancy we flag rather than hide) and https://www.gotobuda.com/visit/budapest-day-trips.

As a licensed local guide you will spot errors faster than we can, so corrections are as welcome as a link. I am not asking for a link, only whether any of these would genuinely help your readers. GoToBudapest links to partner tours and tickets and may earn a commission; these pages are editorial.

[Name], [role], GoToBudapest

### Draft 5: Info-Budapest (resource-style site)  DRAFT - NOT SENT
To: via https://info-budapest.com/contact-us/ (form)
Subject: Sourced history pages for lesser-known Budapest places

Hello Lóránt,

Your "hardly known sights" section is a good fit for what we publish. We have independent, cited pages with the Hungarian names for places such as the Tomb of Gül Baba (https://www.gotobuda.com/attractions/the-tomb-of-gul-baba, which separates dated facts from legend), Wekerletelep (https://www.gotobuda.com/attractions/wekerle-estate-wekerletelep) and the Vérmező Jacobins' memorial. If you think any would help your readers, I would be glad for you to reference them; if you notice mistakes, please tell me. We link to partner tours and may earn commission; these pages are not paid placements.

[Name], [role], GoToBudapest

### Draft 6: Wekerlei Társaskör (relationship; Hungarian version recommended)  DRAFT - NOT SENT
To: wekerleitarsaskor@gmail.com
Subject: English-language visitor page that cites your history of Wekerletelep

Dear Wekerlei Társaskör,

We publish an independent English-language guide to Budapest. Our page on Wekerletelep (https://www.gotobuda.com/attractions/wekerle-estate-wekerletelep) uses your history page (https://wekerletelep.hu/wekerletelep-tortenete/) as a main source, tells visitors it is a residential area (stay on public streets, no photographing gardens), and notes where sources differ (for example 44 or 48 house types). Please tell us about any error and we will correct it. If you would find an English-language reference useful for visitors who write to you, you are welcome to point to it; we ask for nothing in return. We link to partner tours elsewhere on the site and may earn commission; this page is editorial. [Send a Hungarian translation, reviewed by a native speaker, alongside this.]

[Name], [role], GoToBudapest

### Draft 7: Budapest100 / KEK (relationship)  DRAFT - NOT SENT
To: budapest100@kek.org.hu
Subject: We cite Budapest100 on our Újlipótváros guide

Hello,

We use the Budapest100 page on Szent István park (https://budapest100.hu/house/szent-istvan-park/) as one of the sources for our Újlipótváros neighbourhood guide (https://www.gotobuda.com/neighbourhoods/ujlipotvaros). I wanted you to know we cite your research, and to ask whether you would like us to correct anything or add a note about the annual festival. No link requested. We link to partner tours elsewhere on the site and may earn commission; the neighbourhood guide is editorial.

[Name], [role], GoToBudapest

### Draft 8: Daily News Hungary (pitch only after asset A or C exists)  DRAFT - NOT SENT
To: info@dailynewshungary.com (their /write-for-us/ asks for an email pitch first)
Subject: Pitch: Where Budapest guidebook facts disagree (with sources)

Hello,

I would like to pitch an original, unpublished article, not sponsored and not AI-generated: a short list of Budapest facts where municipal, heritage-institute and encyclopedia sources disagree (for example the date of the 1795 Jacobin executions at Vérmező, or whether the Kerepesi Workers' Movement Pantheon was completed in 1958 or 1959), with the primary source for each. [Replace with the finished asset and its numbers.] It would link to the primary sources and two DailyNewsHungary articles. I am from GoToBudapest, an independent guide that earns affiliate commission from partner tours; the article would carry no promotion. If your readers would not find it useful, I will not follow up.

[Name], [role], GoToBudapest

### Draft 9: ELTE McLuhan microsite (old broken links)  DRAFT - NOT SENT
To: ELTE Department of Media and Communication, 1088 Budapest, Múzeum krt. 6-8 (postal only per https://media.elte.hu/mcluhan/contact.html). Low odds; send only if someone can find an email.
Subject: Broken links on the 2011 Budapest Guide page

Hello András Müllner and Zsófia Buglya,

On https://media.elte.hu/mcluhan/budapest-guide.html several links no longer work: www.gellertbath.com returns "410 Gone", www.budapestinfo.org now redirects to an unrelated gambling page, and english.budapest.hu, hungary.usembassy.gov and old.hdke.hu no longer resolve. If the page is still meant to be used, the official city site is https://www.budapestinfo.hu/en. We publish an independent Budapest guide and would be happy to be a supplementary reference for the Gellért Baths (https://www.gotobuda.com/attractions/gellert-thermal-bath), though the official site should come first. We link to partner tours and may earn commission.

[Name], [role], GoToBudapest

### Draft 10: Offbeat Budapest (single personal note via the newsletter/Instagram)  DRAFT - NOT SENT
To: Tas Tóbiás, via the Substack reply route or Instagram (no email found)
Subject: Újlak synagogue and 35 neighbourhood guides

Hello Tas,

Your Jewish Budapest synagogue list (1 Sep 2025) is the most thorough I found. It does not include the Újlak (Frankel Leó) synagogue; we have a sourced page at https://www.gotobuda.com/attractions/ujlaki-synagogue (built 1887-88, architect Fellner, Neolog congregation, community site frankel.hu), if it is useful. We also publish guides to 35 neighbourhoods, many outside the eight districts your overview covers, each with named sources. I am not asking for a link; I would value corrections. GoToBudapest links to partner tours and may earn a commission, but these pages are editorial.

[Name], [role], GoToBudapest

---

## 8. What I could not verify

- Whether any of the senders and addresses will respond; no one was contacted.
- Whether the site's About/contact/affiliate pages exist anywhere I did not look (they are not in the sitemap and not linked from the pages I fetched).
- Visit Hungary's own "useful links" page (https://csodasmagyarorszag.hu/articles/useful-links): HTTP 500 twice. Its link list is unknown.
- Expat Arrivals (403), Expat Focus recommended-blogs page (403), Expat Exchange, XpatLoop: only seen in search snippets.
- Library subject guides (KU, UCLA, USC): seen in search snippets only.
- BGE Erasmus page's bud.hu/en/covid_19 link: 403 to curl, so possibly bot-blocking rather than dead.
- ELTE copy pages (film.elte.hu, mmi.elte.hu): seen in search only; I tested links only from media.elte.hu.
- est.hu, greatsynagogue.hu, gotohungary.com (timeouts or expired certificate from my network; not counted as dead).
- Gellért Baths closure date, and anything else in section 5B-E, was taken from other sites; none was checked against an official source.
- Óbuda synagogue page content on our site (not opened).
- English-language coverage depth for each neighbourhood (I compared only Újlipótváros, Wekerle and Újlak).
- Wikivoyage's external-link policy, r/budapest self-promotion rules, and current availability of journalist-query services.
- Whether the sender can disclose the Viator/Tiqets affiliate wording: the only text I saw is on /transportation/accessible-travel and /visit/budapest-day-trips ("supplied by Viator or Tiqets").
- Domain authority or traffic of any target; I did not use SEO tools.
