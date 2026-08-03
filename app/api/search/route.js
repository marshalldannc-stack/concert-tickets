import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const city = searchParams.get("city") || "";

  let all = [];

  try {
    let tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY || "D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk"}&classificationName=music,comedy&countryCode=US&size=50`;
    if (keyword) tmUrl += `&keyword=${keyword}`;
    if (city) tmUrl += `&city=${city}`;
    const r = await fetch(tmUrl);
    const d = await r.json();
    if (d._embedded?.events) {
      all = all.concat(d._embedded.events.map(e => ({
        id: e.id,
        title: e.name,
        artist: e._embedded?.attractions?.[0]?.name || "Various Artists",
        date: e.dates.start.localDate,
        venue: e._embedded?.venues?.[0]?.name || "TBA",
        city: e._embedded?.venues?.[0]?.city?.name || "TBA",
        image: e.images?.[0]?.url || "",
        source: "ticketmaster",
      })));
    }
  } catch {}

  try {
    let ebUrl = `https://www.eventbriteapi.com/v3/events/search/?token=${process.env.EVENTBRITE_API_KEY}&categories=103&expand=venue&sort_by=date`;
    if (keyword) ebUrl += `&q=${keyword}`;
    const r = await fetch(ebUrl);
    const d = await r.json();
    if (d.events) {
      all = all.concat(d.events.map(e => ({
        id: `eb-${e.id}`,
        title: e.name.text,
        artist: e.summary || "Live Event",
        date: e.start.local?.split("T")[0] || "TBA",
        venue: e.venue?.name || "TBA",
        city: e.venue?.city || "TBA",
        image: e.logo?.url || "",
        source: "eventbrite",
      })));
    }
  } catch {}

  return NextResponse.json(all.sort((a, b) => new Date(a.date) - new Date(b.date)));
}