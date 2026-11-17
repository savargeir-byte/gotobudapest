import assert from "node:assert/strict";
import test from "node:test";
import { clampDescription, MAX_DESCRIPTION, MAX_TITLE_WITH_SUFFIX, pageMetadata } from "../lib/seo";
import { seoTitleOverrides } from "../lib/seo-overrides";
import { quickAnswersFor } from "../lib/quick-answers";
import type { Attraction } from "../lib/types";

const place = (over: Partial<Attraction> = {}): Attraction =>
  ({
    id: "x",
    slug: "test-place",
    name: "Test Place",
    category: "Landmarks",
    description: "A test place.",
    sourceUrl: "https://example.org/test",
    sourceLabel: "Official site",
    checked: "2026-11-10",
    address: "1 Example Street, Budapest",
    ...over,
  }) as Attraction;

test("descriptions are clamped to the search-result length at a sentence or word end", () => {
  const long = "First sentence of the description is here. " + "word ".repeat(80);
  const c = clampDescription(long);
  assert.ok(c.length <= MAX_DESCRIPTION, String(c.length));
  assert.ok(c.endsWith(".") || c.endsWith("…"));
  assert.equal(clampDescription("Short and fine."), "Short and fine.");
  const sentenceEnd = "A".repeat(100) + ". " + "B".repeat(120);
  assert.equal(clampDescription(sentenceEnd), "A".repeat(100) + ".");
  assert.ok(!/\s…$/.test(clampDescription("word ".repeat(60))), "no dangling space before the ellipsis");
});

test("pageMetadata clamps the description and drops the site name from a title that would be too long", () => {
  const long = pageMetadata({ title: "x".repeat(70), description: "d ".repeat(200), path: "/p" });
  assert.deepEqual(long.title, { absolute: "x".repeat(70) });
  assert.ok((long.description ?? "").length <= MAX_DESCRIPTION);
  const short = pageMetadata({ title: "Short title", description: "Fine.", path: "/p" });
  assert.equal(short.title, "Short title");
  assert.ok("Short title | GoToBudapest".length <= MAX_TITLE_WITH_SUFFIX);
  assert.equal(pageMetadata({ title: "Old | GoToBudapest", description: "d", path: "/p" }).title, "Old");
});

test("experience pages get a title that names the topic, and no two overrides are equal", () => {
  const titles = Object.values(seoTitleOverrides);
  assert.equal(new Set(titles).size, titles.length);
  for (const [path, t] of Object.entries(seoTitleOverrides)) {
    assert.match(path, /^\/experiences\/[a-z-]+$/);
    assert.match(t, /Budapest/);
  }
});

test("quick answers use only page data and never state hours, prices or availability", () => {
  const qa = quickAnswersFor(place({ nameHu: "Teszt Hely" }), {
    neighbourhoods: [{ title: "Terézváros", href: "/neighbourhoods/terezvaros" }],
    nearby: [{ place: { name: "Neighbour One", slug: "n1" }, meters: 420 }],
  });
  const questions = qa.map((q) => q.question);
  assert.deepEqual(questions, [
    "Where is Test Place?",
    "What is Test Place called in Hungarian?",
    "What is near Test Place?",
    "Can I book tickets or a tour for Test Place?",
    "Where can I check opening hours and prices for Test Place?",
  ]);
  assert.match(qa[0].answer, /1 Example Street, Budapest/);
  assert.match(qa[0].answer, /Terézváros/);
  assert.equal(qa[0].href, "/neighbourhoods/terezvaros");
  assert.match(qa[1].answer, /Teszt Hely/);
  assert.match(qa[2].answer, /Neighbour One/);
  for (const q of qa) {
    assert.doesNotMatch(q.answer, /[€$£]\s?\d|\d\s?(EUR|HUF|Ft)\b/);
    assert.doesNotMatch(q.answer, /\b\d{1,2}[:.]\d{2}\b/);
  }
  assert.match(qa[4].answer, /does not publish them/);
  assert.equal(qa[4].href, "https://example.org/test");
});

test("quick answers drop what the data does not hold (no address, no Hungarian name, nothing nearby)", () => {
  const qa = quickAnswersFor(place({ address: undefined }), { neighbourhoods: [], nearby: [] });
  assert.deepEqual(
    qa.map((q) => q.question),
    ["Can I book tickets or a tour for Test Place?", "Where can I check opening hours and prices for Test Place?"],
  );
  const outside = quickAnswersFor(place({ notice: "Test Place lies outside Budapest, so allow time." }), {
    neighbourhoods: [{ title: "Terézváros", href: "/neighbourhoods/terezvaros" }],
    nearby: [],
  });
  assert.match(outside[0].answer, /outside Budapest/);
  assert.doesNotMatch(outside[0].answer, /Terézváros/);
  assert.equal(outside[0].href, undefined);
});
