import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { visitorGuides } from "../lib/visitor-guides";

const photos = JSON.parse(readFileSync("lib/photos.json","utf8")) as Record<string,{src640:string;src1280:string;credit?:{license:string;licenseUrl:string;sourceUrl:string}}>;
const attractions = JSON.parse(readFileSync("lib/attractions.json","utf8")) as Array<{slug:string}>;
const attractionSlugs = new Set(attractions.map(a=>a.slug));
const categories = new Set(["cruises","baths","walking","food","tickets","daytrips","transfers","sightseeing","nightlife","family"]);
test("visitor content spans transport, food, culture and practical planning",()=>{
 assert.equal(visitorGuides.length,23);
 assert.deepEqual(Object.fromEntries(["transportation","gastronomy","culture","visit"].map(group=>[group,visitorGuides.filter(g=>g.group===group).length])),
 {transportation:6,gastronomy:4,culture:5,visit:8});
 const paths=visitorGuides.map(g=>"/"+g.group+"/"+g.slug);
 assert.equal(new Set(paths).size,paths.length,"duplicate guide route");
});
test("every visitor guide has real licensed imagery, substantial text, sources and linked places",()=>{
 for(const g of visitorGuides){
  const photo=photos[g.photoKey];
  assert.ok(photo,"missing image: "+g.slug+"/"+g.photoKey);
  assert.ok(photo.src640 && photo.src1280 && photo.credit?.sourceUrl && photo.credit.license, "missing image credit: "+g.slug);
  assert.ok(g.description.length>=65 && g.intro.length>=90,"thin introduction: "+g.slug);
  assert.ok(g.sections.length>=3 && g.sections.every(s=>s.paragraphs.length>=1 && s.paragraphs.every(p=>p.length>=95)), "thin section: "+g.slug);
  assert.ok(g.places.length>=3 && g.other.length>=3 && g.sources.length>=1,"missing useful cross-links: "+g.slug);
  assert.ok(g.places.every(slug=>attractionSlugs.has(slug)), "broken attraction link: "+g.slug);
  assert.ok(g.other.every(s=>s.startsWith("/") && !s.includes("//")),"invalid internal route: "+g.slug);
  assert.ok(g.sources.every(s=>s.url.startsWith("https://")),"invalid source: "+g.slug);
  assert.ok(categories.has(g.tourContext.category??""),"unknown marketplace category: "+g.slug);
 }
});
