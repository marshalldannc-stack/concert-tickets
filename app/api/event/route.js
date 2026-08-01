import { NextResponse } from "next/server";

let priceCache = {};

function getCachedPrice(id) {
  const cached = priceCache[id];
  if (cached && Date.now() - cached.time < 3600000) return cached.price;
  return null;
}

function setCachedPrice(id, price) {
  priceCache[id] = { price, time: Date.now() };
}

async function scrapeTicketmasterPrice(url) {
  try {
    const res = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BRIGHTDATA_API_KEY || "5f2440f9-b848-4324-9119-0ee735dbbc83"}`,
      },
      body: JSON.stringify({
        url,
        format: "raw",
      }),
    });
    const html = await res.text();
    const match = html.match(/"min":(\d+\.?\d*)/);
    const match2 = html.match(/"max":(\d+\.?\d*)/);
    if (match) {
      return { min: parseFloat(match[1]), max: match2 ? parseFloat(match2[1]) : parseFloat(match[1]) };
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
      if (data.ticket_classes) {
        tickets = data.ticket_classes.map((tc, i) => ({
          id: `tc-${tc.id}`,
          name: tc.name || "General Admission",
          price: Math.round(tc.cost?.major_value || 50) + 5,
          color: ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600"][i % 4],
        }));
      }
      if (tickets.length === 0) tickets = [{ id: "ga", name: "General Admission", price: 50, color: "bg-blue-600" }];

      return NextResponse.json({
        title: data.name?.text || "Event",
        artist: data.summary || "Live Event",
        date: data.start?.local?.split("T")[0] || "TBA",
        time: data.start?.local?.split("T")[1]?.slice(0, 5) || "",
        venue: data.venue?.name || "TBA",
        city: data.venue?.city || "",
        image: data.logo?.url || "",
        sourcePrice: `From $${tickets[0].price}`,
        tickets,
        source: "eventbrite",
      });
    }

    // Check cache first
    const cachedPrice = getCachedPrice(id);
    let scrapedPrice = cachedPrice;

    // Ticketmaster API
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY || "D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk"}`);
    const data = await res.json();
    if (data.errors) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let rawMin = data.priceRanges?.[0]?.min || 0;
    let rawMax = data.priceRanges?.[0]?.max || 0;

    // If no prices from API, try scraping
    if (rawMin === 0 && data.url) {
      if (!scrapedPrice) {
        scrapedPrice = await scrapeTicketmasterPrice(data.url);
        if (scrapedPrice) setCachedPrice(id, scrapedPrice);
      }
      if (scrapedPrice) {
        rawMin = scrapedPrice.min;
        rawMax = scrapedPrice.max;
      }
    }

    // Fallback to manual pricing
    if (rawMin === 0) {
      const manualPrices = {}; // In production, load from DB
      const manual = manualPrices[id] || { price: 99 };
      rawMin = manual.price;
      rawMax = manual.price;
    }

    let tickets = [];
    if (rawMin === rawMax) {
      tickets = [{ id: "general", name: "General Admission", price: rawMin + 5, color: "bg-blue-600" }];
    } else {
      tickets = [
        { id: "floor", name: "Floor", price: rawMax + 5, color: "bg-red-600" },
        { id: "lower", name: "Lower Level", price: Math.round((rawMin + rawMax) / 2) + 5, color: "bg-blue-600" },
        { id: "upper", name: "Upper Level", price: rawMin + 5, color: "bg-green-600" },
      ];
    }

    return NextResponse.json({
      title: data.name,
      artist: data._embedded?.attractions?.[0]?.name || "Various Artists",
      date: data.dates.start.localDate,
      time: data.dates.start.localTime,
      venue: data._embedded?.venues?.[0]?.name || "TBA",
      city: data._embedded?.venues?.[0]?.city?.name || "",
      image: data.images?.[0]?.url,
      sourcePrice: rawMin > 0 ? `$${rawMin}${rawMax !== rawMin ? ` - $${rawMax}` : ""} live from Ticketmaster` : "$99 default",
      tickets,
      source: "ticketmaster",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}