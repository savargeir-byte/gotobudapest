import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800;

// Open-Meteo public forecast; no user location, credentials or cookies.
const FORECAST = "https://api.open-meteo.com/v1/forecast?latitude=47.4979&longitude=19.0402&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code&timezone=Europe%2FBudapest&forecast_days=1";

export async function GET() {
  try {
    const response = await fetch(FORECAST, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Forecast provider unavailable");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") throw new Error("Invalid forecast");
    const payload = data as {
      current?: { temperature_2m?: number; weather_code?: number; is_day?: number; time?: string };
      daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; weather_code?: number[]; sunset?: string[] };
    };
    const c = payload.current;
    const d = payload.daily;
    if (!c || !d || !Number.isFinite(c.temperature_2m) ||
        !Number.isFinite(d.temperature_2m_max?.[0]) ||
        !Number.isFinite(d.temperature_2m_min?.[0]) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(d.time?.[0] || "")) throw new Error("Incomplete forecast");
    return NextResponse.json({
      city: "Budapest", date: d.time![0], current: Math.round(c.temperature_2m!),
      max: Math.round(d.temperature_2m_max![0]), min: Math.round(d.temperature_2m_min![0]),
      code: Number.isFinite(c.weather_code) ? c.weather_code : Number.isFinite(d.weather_code?.[0]) ? d.weather_code![0] : null,
      isDay: c.is_day !== 0,
      sunset: d.sunset?.[0] ?? null,
      source: "Open-Meteo", updated: c.time || null
    }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900" } });
  } catch {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
