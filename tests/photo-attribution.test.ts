import assert from "node:assert/strict";
import test from "node:test";
import { creditLinks, sourceLabelFor } from "../lib/photo-attribution";

test("a licensed Wikimedia photograph keeps its licence link and a Wikimedia Commons source link", () => {
  const r = creditLinks({
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  });
  assert.equal(r.licenseHref, "https://creativecommons.org/licenses/by/3.0");
  assert.equal(r.sourceHref, "https://commons.wikimedia.org/wiki/File:Example.jpg");
  assert.equal(r.sourceLabel, "Wikimedia Commons");
});

test("an owner photograph without URLs yields no links at all, never an empty anchor", () => {
  for (const c of [{ license: "Used with permission", licenseUrl: "", sourceUrl: "" }, { license: "Used with permission" }]) {
    const r = creditLinks(c);
    assert.equal(r.licenseHref, undefined);
    assert.equal(r.sourceHref, undefined);
  }
});

test("only https URLs become links; the licence link falls back to the source, never the other way round", () => {
  assert.equal(creditLinks({ licenseUrl: "javascript:alert(1)", sourceUrl: "" }).licenseHref, undefined);
  assert.equal(creditLinks({ licenseUrl: "http://example.com/a", sourceUrl: "" }).licenseHref, undefined);
  assert.equal(creditLinks({ licenseUrl: "", sourceUrl: "https://example.com/photo" }).licenseHref, "https://example.com/photo");
  assert.equal(creditLinks({ licenseUrl: "https://example.com/licence", sourceUrl: "" }).sourceHref, undefined);
});

test("the source link is named after where it goes; unknown hosts are just 'Source'", () => {
  assert.equal(sourceLabelFor("https://commons.wikimedia.org/wiki/File:X.jpg"), "Wikimedia Commons");
  assert.equal(sourceLabelFor("https://www.example.com/x"), "Source");
  assert.equal(creditLinks({ sourceUrl: "https://flickr.com/p/1" }).sourceLabel, "Source");
});
