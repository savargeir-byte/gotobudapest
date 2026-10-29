import { expect, test } from "@playwright/test";
import { getBudapestOffers, resolveOfferContext } from "../lib/budapest-offers";

test("Provider contracts return only Budapest products and preserve affiliate URLs", async () => {
  const saved = {
    tourdesk: process.env.TOURDESK_API_KEY,
    viator: process.env.VIATOR_API_KEY,
    tiqets: process.env.TIQETS_API_KEY,
    campaign: process.env.VIATOR_CAMPAIGN_VALUE,
    switch: process.env.TOURDESK_MARKETPLACE_ENABLED,
  };
  const fetchBefore = globalThis.fetch;
  const calls: Array<{ url: string; headers: Headers; body: unknown }> = [];
  try {
    // TourDesk is paused in the public marketplace by default; this contract keeps the preserved integration under test.
    process.env.TOURDESK_MARKETPLACE_ENABLED = "true";
    process.env.TOURDESK_API_KEY = "tourdesk-test-credential";
    process.env.VIATOR_API_KEY = "viator-test-credential";
    process.env.TIQETS_API_KEY = "tiqets-test-credential";
    process.env.VIATOR_CAMPAIGN_VALUE = "gotobudapest";
    globalThis.fetch = (async (url: RequestInfo | URL, opts: RequestInit = {}) => {
      const href = String(url);
      const headers = new Headers(opts.headers);
      const body: unknown = opts.body ? JSON.parse(String(opts.body)) : undefined;
      calls.push({ url: href, headers, body });
      let response: unknown;
      if (href.includes("/TourSearch")) {
        response = { activities: [
          { uniqueKey: "12-2", title: "Budapest Danube Cruise", description: "A real river experience in Budapest", tourUrl: "https://checkout.tourdesk.is/booking/12-2", photoUrl: "https://media.example.com/budapest.jpg", formattedPrice: "€45" },
          { uniqueKey: "8-1", title: "Tenerife Whale Watching", description: "Tenerife", tourUrl: "https://checkout.tourdesk.is/booking/8-1" },
          { uniqueKey: "99-1", title: "Budapest Tour Dangerous URL", tourUrl: "javascript:alert(1)" },
        ] };
      } else if (href.endsWith("/destinations")) {
        response = { destinations: [
          { destinationId: 499, name: "Budapest", type: "CITY" },
          { destinationId: 16, name: "Vienna", type: "CITY" },
        ] };
      } else if (href.includes("/search/freetext")) {
        response = { products: { results: [
          {
            productCode: "V123", title: "Budapest River Cruise",
            productUrl: "https://www.viator.com/tours/Budapest/V123?campaign-value=gotobudapest",
            description: "Budapest's river by boat",
            pricing: { summary: { fromPrice: 35 }, currency: "EUR" },
          },
          { productCode: "V456", title: "Barcelona Ocean Cruise", productUrl: "https://www.viator.com/tours/Barcelona/V456" },
        ] } };
      } else if (href.includes("/products/search")) {
        response = { products: [
          { productCode: "V789", title: "Budapest Parliament Tour", description: "Explore Budapest",
            destinations: [{ ref: 499, primary: true }],
            productUrl: "https://www.viator.com/tours/Budapest/V789?campaign-value=gotobudapest",
            pricing: { summary: { fromPrice: 42 }, currency: "EUR" } },
          { productCode: "V790", title: "Barcelona Cathedral Tour", description: "Barcelona, Spain",
            destinations: [{ ref: 9, primary: true }],
            productUrl: "https://www.viator.com/tours/Barcelona/V790?campaign-value=gotobudapest" },
        ] };
      } else if (href.includes("api.tiqets.com")) {
        response = { products: [
          { id: "91", title: "Budapest Danube Cruise", city_name: "Budapest", sale_status: "available", product_url: "https://www.tiqets.com/en/budapest/?partner=gotobudapest", price: 25, currency: "EUR" },
          { id: "92", title: "Budapest Museum Ticket", city_name: "Vienna", sale_status: "available", product_url: "https://www.tiqets.com/en/vienna/?partner=gotobudapest" },
          { id: "93", title: "Budapest River Cruise Unavailable", city_name: "Budapest", sale_status: "unavailable", product_url: "https://www.tiqets.com/en/budapest/?partner=gotobudapest" },
        ] };
      } else throw new Error("Unexpected provider endpoint: " + href);
      return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    const result = await getBudapestOffers("experience", "danube");
    expect(result).toBeDefined();
    expect(result?.map((offer) => offer.id)).toEqual(["tourdesk:12-2", "viator:V123", "tiqets:91"]);
    expect(result?.every((offer) => /^https:\/\//.test(offer.bookingUrl))).toBeTruthy();
    expect(result?.find((offer) => offer.provider === "Viator")?.bookingUrl)
      .toBe("https://www.viator.com/tours/Budapest/V123?campaign-value=gotobudapest");
    expect(result?.find((offer) => offer.provider === "Tiqets")?.photo).toBeUndefined();

    const popular = await getBudapestOffers("popular", "");
    expect(popular?.map((offer) => offer.id)).toContain("viator:V789");
    expect(popular?.map((offer) => offer.id)).not.toContain("viator:V790");
    const viatorPopular = calls.find((call) => call.url.includes("/products/search"));
    expect(viatorPopular?.body).toMatchObject({
      filtering: { destination: "499" }, pagination: { start: 1, count: 20 }, currency: "EUR",
    });
    expect(viatorPopular?.headers.get("exp-api-key")).toBe("viator-test-credential");

    const tourSearch = calls.find((call) => call.url.includes("/TourSearch") && (call.body as { geolocation?: unknown })?.geolocation);
    expect(tourSearch?.headers.get("ApiKey")).toBe("tourdesk-test-credential");
    // Discovery probes (page 1, pageSize 20) and then asks the geolocation search (page 0, pageSize 100); it replaced the old free-text page request.
    expect(calls.find((call) => call.url.includes("/TourSearch"))?.body).toEqual({ page: 1, pageSize: 20 });
    expect(tourSearch?.body).toMatchObject({ page: 0, pageSize: 100, geolocation: { lat: 47.4979, lon: 19.0402, radius: 30000 } });
    const viator = calls.find((call) => call.url.includes("/search/freetext"));
    expect(viator?.headers.get("exp-api-key")).toBe("viator-test-credential");
    expect(viator?.body).toMatchObject({ productFiltering: { destination: "499" }, currency: "EUR" });
    const tiqets = calls.find((call) => call.url.includes("api.tiqets.com"));
    expect(tiqets?.headers.get("Authorization")).toBe("Token tiqets-test-credential");
    expect(tiqets?.url).toContain("city_name=Budapest");

    // Publicly supplied slugs cannot create arbitrary provider search terms or URL targets.
    expect(resolveOfferContext("attraction", "../other")).toBeUndefined();
    expect(resolveOfferContext("guide", "not-real")).toBeUndefined();
    expect(resolveOfferContext("popular", "evil")).toBeUndefined();
  } finally {
    globalThis.fetch = fetchBefore;
    if (saved.tourdesk === undefined) delete process.env.TOURDESK_API_KEY;
    else process.env.TOURDESK_API_KEY = saved.tourdesk;
    if (saved.viator === undefined) delete process.env.VIATOR_API_KEY;
    else process.env.VIATOR_API_KEY = saved.viator;
    if (saved.tiqets === undefined) delete process.env.TIQETS_API_KEY;
    else process.env.TIQETS_API_KEY = saved.tiqets;
    if (saved.switch === undefined) delete process.env.TOURDESK_MARKETPLACE_ENABLED;
    else process.env.TOURDESK_MARKETPLACE_ENABLED = saved.switch;
    if (saved.campaign === undefined) delete process.env.VIATOR_CAMPAIGN_VALUE;
    else process.env.VIATOR_CAMPAIGN_VALUE = saved.campaign;
  }
});
