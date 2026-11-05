import {test,expect} from "@playwright/test";
test.describe("Visitor information routes",()=>{
 test("homepage links to visitor guides and the money converter",async({page})=>{
   await page.goto("/");
   await expect(page.getByRole("link",{name:/all visitor guides/i})).toBeVisible();
   await expect(page.getByRole("link",{name:/huf currency calculator/i})).toBeVisible();
 });
 test("guides directory exposes transport, food, culture and practical information",async({page})=>{
   await page.goto("/guides");
   await expect(page.getByRole("link",{name:"Transportation ↗"})).toBeVisible();
   await expect(page.getByRole("link",{name:"Food & drink ↗"})).toBeVisible();
   await expect(page.getByRole("link",{name:"Culture ↗"})).toBeVisible();
   await expect(page.getByRole("link",{name:"Visitor tips ↗"})).toBeVisible();
 });
 test("individual guides include actual internal attraction links, photo credit and relevant tours area",async({page})=>{
   await page.goto("/gastronomy/hungarian-cuisine");
   await expect(page.getByRole("heading",{name:/what to eat in budapest/i})).toBeVisible();
   await expect(page.getByRole("link",{name:/great market hall/i}).first()).toBeVisible();
   await expect(page.locator("figcaption a").first()).toBeVisible();
   await expect(page.getByRole("link",{name:/browse relevant tours/i})).toBeVisible();
 });
 test("currency page shows reference-rate converter or transparent unavailable message",async({page})=>{
   await page.goto("/currency");
   await expect(page.getByRole("heading",{name:/hungarian forint/i})).toBeVisible();
   await expect(page.getByRole("heading",{name:"Currency converter"})).toBeVisible();
   await expect(page.getByText(/reference rates|temporarily unavailable/i).first()).toBeVisible();
 });
});
