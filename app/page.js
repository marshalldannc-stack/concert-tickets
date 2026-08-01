"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [userCity, setUserCity] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (keyword = "", city = "") => {
    setLoading(true);
    let all = [];

    // Ticketmaster
    let tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk&classificationName=music&countryCode=US&size=12`;
    if (keyword) tmUrl += `&keyword=${keyword}`;
    if (city) tmUrl += `&city=${city}`;
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
    let ebUrl = `https://www.eventbriteapi.com/v3/events/search/?token=XZDWD3LKMXFCO45JIQO3&categories=103&location.address=United+States&expand=venue&sort_by=date`;
    if (keyword) ebUrl += `&q=${keyword}`;
    try {
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
          const data = await res.json();
          setUserCity(data.city || "");
          fetchEvents("", data.city || "");
        } catch { fetchEvents(); }
      }, () => fetchEvents());
    } else fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents(search, userCity);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover Live Events</h1>
        <p className="text-gray-400 mb-6">Concerts from Ticketmaster & Eventbrite</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-gray-800 border border-gray-600 rounded-full px-6 py-3 text-white" placeholder="Search artists, venues, cities..." />
          <button type="submit" className="bg-white text-black px-6 py-3 rounded-full font-bold">Search</button>
        </form>
      </div>

      {userCity && <h2 className="text-xl font-bold mb-4">📍 Events near {userCity}</h2>}
      {loading && <p className="text-gray-400 text-center">Loading events...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(e => (
          <Link key={e.id} href={`/events/${e.id}`} className="border border-gray-700 rounded-xl p-4 hover:border-white transition">
            <img src={e.image} alt={e.title} className="w-full h-40 object-cover rounded-lg mb-3" onError={(el) => el.target.style.display = 'none'} />
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