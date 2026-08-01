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

    let tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk&classificationName=music&countryCode=US&size=30`;
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
          image: e.images?.[0]?.url || "",
          source: "ticketmaster",
        })));
      }
    } catch {}

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
          image: e.logo?.url || "",
          source: "eventbrite",
        })));
      }
    } catch {}

    all.sort((a, b) => new Date(a.date) - new Date(b.date));
    setEvents(all);
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

  const now = new Date();
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    const weekEnd = new Date(now.getTime() + 7 * 86400000);
    return d >= now && d <= weekEnd;
  });
  const later = events.filter(e => new Date(e.date) > new Date(now.getTime() + 7 * 86400000));
  const trending = events.slice(0, 6);

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

      {loading && <p className="text-gray-400 text-center">Loading events...</p>}

      {!loading && !search && (
        <>
          {userCity && <h2 className="text-xl font-bold mb-4">📍 Events near {userCity}</h2>}

          {trending.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">🔥 Trending Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trending.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {thisWeek.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">📅 Happening This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {thisWeek.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}

          {later.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">🗓️ Upcoming Shows</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {later.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && search && (
        <section>
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
          {events.length === 0 && <p className="text-gray-400 text-center">No events found.</p>}
        </section>
      )}
    </div>
  );
}

function EventCard({ event }) {
  return (
    <Link href={`/events/${event.id}`} className="border border-gray-700 rounded-xl p-4 hover:border-white transition">
      {event.image ? <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded-lg mb-3" /> : <div className="w-full h-40 bg-gray-800 rounded-lg mb-3 flex items-center justify-center text-4xl">🎵</div>}
      <h3 className="font-bold text-lg">{event.title}</h3>
      <p className="text-gray-400 text-sm">{event.artist}</p>
      <p className="text-gray-500 text-xs">{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {event.venue}, {event.city}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase">{event.source}</p>
    </Link>
  );
}