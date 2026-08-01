"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (keyword = "") => {
    setLoading(true);
    let url = `/api/search?keyword=${encodeURIComponent(keyword)}`;
    try {
      const r = await fetch(url);
      const all = await r.json();
      setEvents(all);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(search); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/events?q=${encodeURIComponent(search)}`);
    fetchEvents(search);
  };

  const now = new Date();
  const thisWeek = events.filter(e => {
    const d = new Date(e.date);
    return d >= now && d <= new Date(now.getTime() + 7 * 86400000);
  });
  const later = events.filter(e => new Date(e.date) > new Date(now.getTime() + 7 * 86400000));
  const trending = events.slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Events</h1>
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white" placeholder="Search artists, venues, cities..." />
        <button type="submit" className="bg-white text-black px-4 py-2 rounded-full font-bold">Search</button>
      </form>

      {loading && <p className="text-gray-400 text-center">Loading events...</p>}

      {!loading && !search && (
        <>
          {trending.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">🔥 Trending</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trending.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
          {thisWeek.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">📅 This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {thisWeek.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
          {later.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">🗓️ Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {later.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && search && (
        <section>
          <h2 className="text-xl font-bold mb-4">Results for "{search}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
          {events.length === 0 && <p className="text-gray-400">Nothing found.</p>}
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

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-400">Loading events...</div>}>
      <EventsContent />
    </Suspense>
  );
}