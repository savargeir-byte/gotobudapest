import { test, expect } from "@playwright/test";

const newSacredSites = [
  "st-elizabeth-church-roses-square",
  "st-anne-church-batthyany-square",
  "inner-city-parish-church-assumption",
  "deak-square-lutheran-church",
  "st-emeric-cistercian-church",
  "st-margaret-parish-church-lehel-square",
  "st-ladislaus-church-kobanya",
  "obuda-synagogue",
  "serbian-orthodox-church-downtown-pest",
  "queen-of-heavens-church-ujpest",
  "holy-family-church-terezvaros",
  "armenian-catholic-church-ujbuda",
  "pozsonyi-road-reformed-church",
  "rumbach-street-synagogue",
  "kazinczy-street-orthodox-synagogue",
  "ujlaki-synagogue"
];

test("all 16 new sacred places include a source-backed story, a proper photograph and SEO metadata",async({page})=>{
  for(const slug of newSacredSites){
    const response=await page.goto(`/attractions/${slug}`,{waitUntil:"domcontentloaded"});
    expect(response?.status(),slug).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".attraction-history")).toBeVisible();
    await expect(page.locator(".attraction-history-sources a").first()).toHaveAttribute("href",/^https:\/\//);
    await expect(page.locator(".article-hero img")).toHaveAttribute("src",/cdn\.sanity\.io\/images\/ut6qxuke\/production\//);
    await expect(page.locator(".article-hero img")).toHaveAttribute("alt",/\S+/);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,`Overflow ${slug}`).toBeLessThanOrEqual(1);
  }
});

test("St Elizabeth's bread and roses is labelled as a religious tradition",async({page})=>{
  await page.goto("/attractions/st-elizabeth-church-roses-square");
  await expect(page.getByRole("heading",{name:"The miracle of the roses"})).toBeVisible();
  await expect(page.locator(".attraction-story-kind")).toContainText("RELIGIOUS TRADITION");
});

test("churches are visible as a searchable directory category",async({page})=>{
  await page.goto("/attractions");
  await page.getByRole("button",{name:"Sacred architecture"}).click();
  await expect(page.getByRole("status")).toContainText("16 places");
  await expect(page.getByRole("link",{name:"Rumbach Street Synagogue"})).toBeVisible();
  await expect(page.getByRole("link",{name:"St Elizabeth Church — Rózsák tere"})).toBeVisible();
});

test("the public sitemap includes all new heritage routes",async({request})=>{
  const response=await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml=await response.text();
  for(const slug of newSacredSites)expect(xml).toContain(`/attractions/${slug}`);
});
