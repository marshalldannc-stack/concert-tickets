"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [userCity, setUserCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setHistory(saved);
    const q = searchParams.get("q") || "";
    if (q) fetchEvents(q);
  }, []);

  const addToHistory = (term) => {
    if (!term.trim()) return;
    let h = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    h = [term, ...h.filter(t => t !== term)].slice(0, 8);
    localStorage.setItem("searchHistory", JSON.stringify(h));
    setHistory(h);
  };

  const fetchEvents = async (keyword = "", city = "") => {
    setLoading(true);
    let url = `/api/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`;
    try {
      const r = await fetch(url);
      const all = await r.json();
      setEvents(all);
    } catch {}
    setLoading(false);
  };

  const fetchSuggestions = async (keyword) => {
    if (keyword.length < 2) { setSuggestions([]); return; }
    let url = `/api/search?keyword=${encodeURIComponent(keyword)}`;
    try {
      const r = await fetch(url);
      const all = await r.json();
      const sug = all.slice(0, 5).map(e => e.title).concat(
        all.slice(0, 3).map(e => e.artist).filter(Boolean),
        all.slice(0, 3).map(e => e.venue).filter(Boolean),
        all.slice(0, 3).map(e => e.city).filter(Boolean)
      );
      setSuggestions([...new Set(sug)].slice(0, 8));
    } catch { setSuggestions([]); }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
          const data = await res.json();
          setUserCity(data.city || "");
          if (!searchParams.get("q")) fetchEvents("", data.city || "");
        } catch { if (!searchParams.get("q")) fetchEvents(); }
      }, () => { if (!searchParams.get("q")) fetchEvents(); });
    } else { if (!searchParams.get("q")) fetchEvents(); }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    addToHistory(search);
    router.push(`/?q=${encodeURIComponent(search)}`);
    fetchEvents(search, userCity);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (term) => {
    setSearch(term);
    addToHistory(term);
    router.push(`/?q=${encodeURIComponent(term)}`);
    fetchEvents(term, userCity);
    setShowSuggestions(false);
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
        <div className="relative max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <input ref={inputRef} value={search}
              onChange={(e) => { setSearch(e.target.value); fetchSuggestions(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { if (suggestions.length > 0 || search.length >= 2) setShowSuggestions(true); }}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-full px-6 py-3 text-white"
              placeholder="Search artists, venues, cities..." />
            <button type="submit" className="bg-white text-black px-6 py-3 rounded-full font-bold">Search</button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl mt-1 z-20 overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 text-sm text-gray-200 border-b border-gray-700 last:border-0 flex items-center gap-2">
                  🔍 {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && !search && (
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto mt-4">
            {history.map((term, i) => (
              <button key={i} onClick={() => handleSuggestionClick(term)}
                className="bg-gray-800 border border-gray-700 rounded-full px-4 py-1 text-sm text-gray-300 hover:border-white transition">
                🕐 {term}
              </button>
            ))}
            <button onClick={() => { localStorage.removeItem("searchHistory"); setHistory([]); }} className="text-xs text-red-400 underline">clear</button>
          </div>
        )}
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
          <h2 className="text-xl font-bold mb-4">Results for "{search}"</h2>
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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}