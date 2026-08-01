import { NextResponse } from "next/server";

let priceCache = {};

function getCached(id) {
  const c = priceCache[id];
  if (c && Date.now() - c.time < 3600000) return c.data;
  return null;
}

function setCache(id, data) {
  priceCache[id] = { data, time: Date.now() };
}

async function scrapePrice(url) {
  try {
    const res = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BRIGHTDATA_API_KEY || "5f2440f9-b848-4324-9119-0ee735dbbc83"}`,
      },
      body: JSON.stringify({ url, format: "raw" }),
    });
    const html = await res.text();
    const minMatch = html.match(/"min":(\d+\.?\d*)/);
    const maxMatch = html.match(/"max":(\d+\.?\d*)/);
    if (minMatch) {
      return {
        min: parseFloat(minMatch[1]),
        max: maxMatch ? parseFloat(maxMatch[1]) : parseFloat(minMatch[1]),
      };
    }
  } catch {}
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

  try {
    // Eventbrite
    if (id.startsWith("eb-")) {
      const ebId = id.replace("eb-", "");
      const res = await fetch(`https://www.eventbriteapi.com/v3/events/${ebId}/?token=${process.env.EVENTBRITE_API_KEY || "XZDWD3LKMXFCO45JIQO3"}&expand=venue,ticket_classes`);
      const data = await res.json();
      if (data.error) return NextResponse.json({ error: "Not found" }, { status: 404 });

      let tickets = [];
      if (data.ticket_classes?.length) {
        tickets = data.ticket_classes.map((tc, i) => ({
          id: `tc-${tc.id}`,
          name: tc.name || "General Admission",
          price: Math.round(tc.cost?.major_value || 50),
          color: ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600"][i % 4],
        }));
      }
      if (!tickets.length) tickets = [{ id: "ga", name: "General Admission", price: 50, color: "bg-blue-600" }];

      return NextResponse.json({
        title: data.name?.text || "Event",
        artist: data.summary || "Live Event",
        date: data.start?.local?.split("T")[0] || "TBA",
        time: data.start?.local?.split("T")[1]?.slice(0, 5) || "",
        venue: data.venue?.name || "TBA",
        city: data.venue?.city || "",
        image: data.logo?.url || "",
        tickets,
        source: "eventbrite",
      });
    }

    // Check cache
    const cached = getCached(id);

    // Ticketmaster API
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY || "D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk"}`);
    const data = await res.json();
    if (data.errors) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let tickets = [];
    let rawMin = data.priceRanges?.[0]?.min || 0;
    let rawMax = data.priceRanges?.[0]?.max || 0;

    // If no API price, use cache or scrape
    if (rawMin === 0) {
      let scraped = cached || (data.url ? await scrapePrice(data.url) : null);
      if (scraped && !cached) setCache(id, scraped);
      if (scraped) {
        rawMin = scraped.min;
        rawMax = scraped.max;
      }
    }

    if (rawMin > 0) {
      if (rawMin === rawMax || rawMax === 0) {
        tickets = [{ id: "ga", name: "Ticket", price: Math.round(rawMin), color: "bg-blue-600" }];
      } else {
        tickets = [
          { id: "low", name: "Standard", price: Math.round(rawMin), color: "bg-blue-600" },
          { id: "high", name: "Premium", price: Math.round(rawMax), color: "bg-red-600" },
        ];
      }
    }

    return NextResponse.json({
      title: data.name,
      artist: data._embedded?.attractions?.[0]?.name || "Various Artists",
      date: data.dates.start.localDate,
      time: data.dates.start.localTime,
      venue: data._embedded?.venues?.[0]?.name || "TBA",
      city: data._embedded?.venues?.[0]?.city?.name || "",
      image: data.images?.[0]?.url,
      tickets: tickets.length ? tickets : null,
      source: "ticketmaster",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}