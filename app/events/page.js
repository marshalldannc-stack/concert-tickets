"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (keyword = "") => {
    setLoading(true);
    let all = [];

    // Ticketmaster
    let tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk&classificationName=music&countryCode=US&size=20`;
    if (keyword) tmUrl += `&keyword=${keyword}`;
    try {
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
          image: e.images?.[0]?.url || "🎵",
          source: "ticketmaster",
        })));
      }
    } catch {}

    // Eventbrite
    try {
      let ebUrl = `https://www.eventbriteapi.com/v3/events/search/?token=XZDWD3LKMXFCO45JIQO3&categories=103&expand=venue&sort_by=date`;
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
          image: e.logo?.url || "🎵",
          source: "eventbrite",
        })));
      }
    } catch {}

    setEvents(all.sort((a, b) => new Date(a.date) - new Date(b.date)));
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white" placeholder="Search artists, venues, cities..." />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-full font-bold">Search</button>
      </form>

      {loading && <p className="text-gray-400 text-center">Loading events...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(e => (
          <Link key={e.id} href={`/events/${e.id}`} className="border border-gray-700 rounded-xl p-4 hover:border-white transition">
            <div className="text-4xl mb-3">🎵</div>
            <h3 className="font-bold text-lg">{e.title}</h3>
            <p className="text-gray-400 text-sm">{e.artist}</p>
            <p className="text-gray-500 text-xs">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {e.venue}, {e.city}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase">{e.source}</p>
          </Link>
        ))}
      </div>
      {!loading && events.length === 0 && <p className="text-gray-400 text-center">No events found.</p>}
    </div>
  );
}