"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;
const COLORS = ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-purple-600"];

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const cached = sessionStorage.getItem(`ev-${id}`);
    if (cached) { setEvent(JSON.parse(cached)); setLoading(false); return; }
    fetch(`/api/event?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setEvent(data);
        sessionStorage.setItem(`ev-${id}`, JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-400">Loading...</div>;
  if (!event) return <div className="text-center mt-20 text-gray-400">Event not found.</div>;

  const toggleSeat = (sectionId, row, seat) => {
    const key = `${sectionId}-${row}${seat}`;
    setSelected(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const total = selected.reduce((sum, s) => {
    const sectionId = s.split("-")[0];
    const section = event.tickets?.find(t => t.id === sectionId);
    return sum + (section?.price || 0);
  }, 0);

  const checkout = () => {
    if (selected.length === 0) return alert("Select at least one seat");
    const items = event.tickets.filter(t => selected.some(s => s.startsWith(t.id))).map(t => ({
      name: t.name,
      price: t.price,
      qty: selected.filter(s => s.startsWith(t.id)).length,
    }));
    localStorage.setItem("cart", JSON.stringify({ items, total, event: event.title }));
    router.push("/cart");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {event.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />}
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-gray-400 text-lg">{event.artist}</p>
      <p className="text-gray-500">
        {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        {event.time && ` • ${event.time.slice(0, 5)}`}
      </p>
      <p className="text-gray-500">{event.venue}{event.city ? `, ${event.city}` : ""}</p>

      {event.tickets ? (
        <div className="mt-8 space-y-6">
          {event.tickets.map((ticket, idx) => {
            const sectionSeats = selected.filter(s => s.startsWith(ticket.id));
            return (
              <div key={ticket.id} className="border border-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{ticket.name}</h3>
                    <p className="text-2xl font-bold">${ticket.price}<span className="text-sm text-gray-400">/ea</span></p>
                  </div>
                  <p className="text-gray-400 text-sm">{sectionSeats.length} selected — ${sectionSeats.length * ticket.price}</p>
                </div>
                <div className="mb-4 text-center text-gray-500 text-xs border border-gray-700 py-2 rounded-lg">🎤 STAGE</div>
                <div className="space-y-1">
                  {ROWS.map(row => (
                    <div key={row} className="flex items-center gap-1">
                      <span className="text-gray-600 w-5 text-[10px]">{row}</span>
                      <div className="flex gap-1 flex-1 justify-center">
                        {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map(seat => {
                          const key = `${ticket.id}-${row}${seat}`;
                          const isSelected = selected.includes(key);
                          return (
                            <button key={seat} onClick={() => toggleSeat(ticket.id, row, seat)}
                              className={`w-6 h-6 rounded-t-md text-[9px] font-bold transition ${isSelected ? `${COLORS[idx % 4]} text-white` : "bg-gray-800 hover:bg-gray-600 text-gray-500"}`}>
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-gray-600 w-5 text-[10px]">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 border border-gray-700 rounded-xl p-8 text-center">
          <p className="text-xl font-bold mb-2">Price on Request</p>
          <p className="text-gray-400 mb-6">Contact us for the best price on this event.</p>
          <a href="/chat" className="bg-white text-black px-8 py-3 rounded-full font-bold inline-block">Request Price via Chat</a>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-6 sticky bottom-0 bg-black pb-6">
          <p className="text-2xl font-bold">Total: ${total}</p>
          <p className="text-gray-400 text-sm mb-4">{selected.length} seats selected</p>
          <button onClick={checkout} className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg">
            Checkout with Crypto
          </button>
        </div>
      )}
    </div>
  );
}