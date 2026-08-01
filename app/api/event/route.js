import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

  try {
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY || "D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk"}`);
    const data = await res.json();
    if (data.errors) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rawMin = data.priceRanges?.[0]?.min || 0;
    const rawMax = data.priceRanges?.[0]?.max || 0;
    const currency = data.priceRanges?.[0]?.currency || "USD";

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
      sourcePrice: rawMin > 0 ? `${currency} ${rawMin}${rawMax !== rawMin ? ` - ${rawMax}` : ""} on Ticketmaster` : "Check Ticketmaster for pricing",
      tickets,
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}