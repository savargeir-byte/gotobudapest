import assert from "node:assert/strict";
import test from "node:test";
import { activityOrder, describeWeather } from "../lib/weather";

test("WMO codes map to the right words: 3 is overcast, snow showers are snow, undefined codes are unavailable", () => {
  assert.equal(describeWeather(0).label, "Clear sky");
  assert.equal(describeWeather(1).label, "Mainly clear");
  assert.equal(describeWeather(2).label, "Partly cloudy");
  assert.equal(describeWeather(3).label, "Overcast");
  assert.equal(describeWeather(45).label, "Fog");
  assert.equal(describeWeather(53).label, "Drizzle");
  assert.equal(describeWeather(66).label, "Freezing rain");
  assert.equal(describeWeather(73).label, "Snow");
  assert.equal(describeWeather(85).label, "Snow");
  assert.equal(describeWeather(81).label, "Rain showers");
  assert.equal(describeWeather(96).label, "Thunderstorm");
  for (const bad of [68, 69, 78, 79, 90, 100, -1]) assert.equal(describeWeather(bad).label, "Conditions unavailable", String(bad));
  assert.equal(describeWeather(null).label, "Conditions unavailable");
  assert.equal(describeWeather(undefined).label, "Conditions unavailable");
});

test("night uses a moon for clear skies", () => {
  assert.equal(describeWeather(0, false).icon, "🌙");
  assert.equal(describeWeather(0, true).icon, "☀️");
});

test("baths come first when it is wet or cold, otherwise the Danube", () => {
  assert.equal(activityOrder(20, 0), "danube-first");
  assert.equal(activityOrder(20, 61), "baths-first");
  assert.equal(activityOrder(3, 0), "baths-first");
  assert.equal(activityOrder(12, null), "danube-first");
});
