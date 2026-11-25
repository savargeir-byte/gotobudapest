import assert from "node:assert/strict";
import test from "node:test";
import { classify, contradictsCategory, inCategory } from "../lib/marketplace/categories";

// A live inspection found river cruises listed under "thermal baths". The cause was in the rules, not in any one product:
// famous bath names (Széchenyi, Gellért) are also the Chain Bridge, the hill and the statue a cruise passes, and the
// summary text could add a second main activity to a product whose title says what it is.

test("a river cruise that passes Széchenyi or Gellért landmarks is a cruise, not a bath", () => {
  for (const title of [
    "Budapest: Danube Sightseeing Cruise under the Széchenyi Chain Bridge",
    "Budapest: Evening River Cruise with Views of Gellért Hill and the Liberty Statue",
    "Budapest: Gellért Monument and Parliament Boat Trip",
  ]) {
    const cats = classify(title);
    assert.ok(cats.includes("cruises"), title);
    assert.ok(!cats.includes("baths"), title);
    assert.equal(inCategory(title, "baths"), false, title);
  }
});

test("a summary that mentions a bath cannot turn a cruise into a bath", () => {
  const cats = classify("Budapest: Danube River Cruise with Welcome Drink", "Afterwards relax in a thermal bath such as Széchenyi or Gellért.");
  assert.ok(cats.includes("cruises"));
  assert.ok(!cats.includes("baths"));
});

test("real baths are still baths, by what they are or by a bath name next to a bath word", () => {
  for (const title of [
    "Széchenyi Thermal Bath: Full-Day Entry Ticket",
    "Budapest: Lukács Spa Admission",
    "Rudas Baths Day Pass",
    "Gellért Thermal Bath Entry with Locker",
    "Budapest: Wellness and Sauna Experience",
  ]) {
    assert.ok(classify(title).includes("baths"), title);
  }
  assert.ok(classify("Széchenyi Day Pass").includes("baths"));
});

test("a genuine combination keeps both categories because its title says so", () => {
  const cats = classify("Budapest: Danube Cruise and Thermal Bath Combo Ticket");
  assert.ok(cats.includes("cruises"));
  assert.ok(cats.includes("baths"));
});

test("when the title names no main activity the summary is still read", () => {
  assert.ok(classify("Budapest Highlights Day", "Includes a Danube boat cruise.").includes("cruises"));
});

test("provider-tagged results are only dropped when the title names a different main activity", () => {
  assert.equal(contradictsCategory("Budapest: Danube Sightseeing Cruise under the Széchenyi Chain Bridge", "baths"), true);
  assert.equal(contradictsCategory("Széchenyi Thermal Bath: Full-Day Entry Ticket", "baths"), false);
  assert.equal(contradictsCategory("Budapest: Danube Cruise and Thermal Bath Combo Ticket", "baths"), false);
  assert.equal(contradictsCategory("A mystery product", "baths"), false);
  // Only main-activity categories are policed this way.
  assert.equal(contradictsCategory("Budapest: Danube Cruise", "walking"), false);
});
