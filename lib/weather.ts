// WMO weather interpretation codes (as used by Open-Meteo) turned into the words and icon shown in the home page
// banner. Codes that the standard does not define give "Conditions unavailable" rather than a guess.
export type Condition = { icon: string; label: string; wet: boolean };

export function describeWeather(code: number | null | undefined, isDay = true): Condition {
  if (typeof code !== "number" || !Number.isFinite(code)) return { icon: "☁️", label: "Conditions unavailable", wet: false };
  if (code === 0) return isDay ? { icon: "☀️", label: "Clear sky", wet: false } : { icon: "🌙", label: "Clear sky", wet: false };
  if (code === 1) return isDay ? { icon: "🌤️", label: "Mainly clear", wet: false } : { icon: "🌙", label: "Mainly clear", wet: false };
  if (code === 2) return { icon: "⛅", label: "Partly cloudy", wet: false };
  if (code === 3) return { icon: "☁️", label: "Overcast", wet: false };
  if (code === 45 || code === 48) return { icon: "🌫️", label: "Fog", wet: false };
  if (code >= 51 && code <= 55) return { icon: "🌦️", label: "Drizzle", wet: true };
  if (code === 56 || code === 57) return { icon: "🌧️", label: "Freezing drizzle", wet: true };
  if (code >= 61 && code <= 65) return { icon: "🌧️", label: "Rain", wet: true };
  if (code === 66 || code === 67) return { icon: "🌧️", label: "Freezing rain", wet: true };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { icon: "🌨️", label: "Snow", wet: true };
  if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Rain showers", wet: true };
  if (code >= 95 && code <= 99) return { icon: "⛈️", label: "Thunderstorm", wet: true };
  return { icon: "☁️", label: "Conditions unavailable", wet: false };
}

// Which suggestion comes first: indoor thermal baths when it is wet or cold, otherwise the Danube.
export function activityOrder(currentC: number, code: number | null | undefined): "baths-first" | "danube-first" {
  return describeWeather(code).wet || currentC < 8 ? "baths-first" : "danube-first";
}
