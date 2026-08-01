import { NextResponse } from "next/server";

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
        sourcePrice: tickets.length > 1 ? `From $${tickets[0].price}` : `$${tickets[0].price}`,
        tickets,
        source: "eventbrite",
      });
    }

    // Ticketmaster
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY || "D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk"}`);
    const data = await res.json();
    if (data.errors) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rawMin = data.priceRanges?.[0]?.min || 0;
    const rawMax = data.priceRanges?.[0]?.max || 0;

    let tickets = [];
    if (rawMin > 0 && rawMax > 0 && rawMin === rawMax) {
      tickets = [{ id: "general", name: "General Admission", price: rawMin + 5, color: "bg-blue-600" }];
    } else if (rawMin > 0 && rawMax > 0) {
      tickets = [
        { id: "floor", name: "Floor", price: rawMax + 5, color: "bg-red-600" },
        { id: "lower", name: "Lower Level", price: Math.round((rawMin + rawMax) / 2) + 5, color: "bg-blue-600" },
        { id: "upper", name: "Upper Level", price: rawMin + 5, color: "bg-green-600" },
      ];
    } else {
      tickets = [
        { id: "general", name: "General Admission", price: 99, color: "bg-blue-600" },
        { id: "vip", name: "VIP", price: 199, color: "bg-red-600" },
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
      sourcePrice: rawMin > 0 ? `$${rawMin}${rawMax !== rawMin ? ` - $${rawMax}` : ""} on Ticketmaster` : "Check Ticketmaster",
      tickets,
      source: "ticketmaster",
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}