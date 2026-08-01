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
    const floorPrice = rawMax > 0 ? rawMax + 5 : 204;
    const lowerPrice = rawMax > 0 && rawMin > 0 ? Math.round((rawMin + rawMax) / 2) + 5 : 104;
    const upperPrice = rawMin > 0 ? rawMin + 5 : 64;

    return NextResponse.json({
      title: data.name,
      artist: data._embedded?.attractions?.[0]?.name || "Various Artists",
      date: data.dates.start.localDate,
      time: data.dates.start.localTime,
      venue: data._embedded?.venues?.[0]?.name || "TBA",
      city: data._embedded?.venues?.[0]?.city?.name || "",
      image: data.images?.[0]?.url,
      sourcePrice: rawMin > 0 ? `Starting at $${rawMin} on Ticketmaster` : "Check Ticketmaster for pricing",
      tickets: [
        { id: "floor", name: "Floor", price: floorPrice, color: "bg-red-600" },
        { id: "lower", name: "Lower Level", price: lowerPrice, color: "bg-blue-600" },
        { id: "upper", name: "Upper Level", price: upperPrice, color: "bg-green-600" },
      ],
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}