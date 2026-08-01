"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [view, setView] = useState("sections");

  useEffect(() => {
    fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk`)
      .then(r => r.json())
      .then(data => {
        const rawMin = data.priceRanges?.[0]?.min || 0;
        const rawMax = data.priceRanges?.[0]?.max || 0;
        const floorPrice = rawMax > 0 ? rawMax : 199;
        const lowerPrice = rawMax > 0 && rawMin > 0 ? Math.round((rawMin + rawMax) / 2) : 99;
        const upperPrice = rawMin > 0 ? rawMin : 59;
        const currency = data.priceRanges?.[0]?.currency || "USD";
        setEvent({
          title: data.name,
          artist: data._embedded?.attractions?.[0]?.name || "Various Artists",
          date: data.dates.start.localDate,
          time: data.dates.start.localTime,
          venue: data._embedded?.venues?.[0]?.name || "TBA",
          city: data._embedded?.venues?.[0]?.city?.name || "",
          image: data.images?.[0]?.url,
          sourcePrice: rawMin > 0 ? `${currency} ${rawMin} - ${rawMax}` : "See Ticketmaster",
          tickets: [
            { id: "floor", name: "Floor", price: floorPrice, color: "bg-red-600" },
            { id: "lower", name: "Lower Level", price: lowerPrice, color: "bg-blue-600" },
            { id: "upper", name: "Upper Level", price: upperPrice, color: "bg-green-600" },
          ],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading event...</p>;
  if (!event) return <p className="text-center mt-20">Event not found.</p>;

  const toggleSeat = (row, seat) => {
    const key = `${row}-${seat}`;
    setSelected(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]);
  };

  const currentSection = view !== "sections" ? event.tickets.find(t => t.id === view) : null;
  const selectedInSection = currentSection ? selected.filter(s => s.startsWith(currentSection.id)) : [];
  const sectionPrices = {};
  event.tickets.forEach(t => { sectionPrices[t.id] = t.price; });
  
  const total = selected.reduce((sum, s) => {
    const section = event.tickets.find(t => s.startsWith(t.id));
    return sum + (section ? section.price : 0);
  }, 0);

  const checkout = () => {
    if (selected.length === 0) return alert("Select at least one seat");
    const items = event.tickets.filter(t => selected.some(s => s.startsWith(t.id))).map(t => ({
      ...t,
      qty: selected.filter(s => s.startsWith(t.id)).length,
      seats: selected.filter(s => s.startsWith(t.id)).map(s => s.replace(`${t.id}-`, ""))
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
      <p className="text-sm text-gray-400 mt-1">Ticketmaster: {event.sourcePrice}</p>

      {view === "sections" ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Choose Section</h2>
          <div className="grid grid-cols-1 gap-4">
            {event.tickets.map(ticket => (
              <button key={ticket.id} onClick={() => setView(ticket.id)} className="border border-gray-700 rounded-xl p-6 text-left hover:border-white transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{ticket.name}</h3>
                    <p className="text-2xl font-bold mt-1">${ticket.price}<span className="text-sm text-gray-400">/seat</span></p>
                  </div>
                  <span className="text-gray-400 text-sm">Select seats →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <button onClick={() => setView("sections")} className="text-blue-400 mb-4">← Back to sections</button>
          <h2 className="text-xl font-bold mb-1">{currentSection.name}</h2>
          <p className="text-2xl font-bold">${currentSection.price}<span className="text-sm text-gray-400">/seat</span></p>
          <p className="text-gray-400 text-sm mt-2 mb-6">Tap seats to select. {selectedInSection.length} selected — ${selectedInSection.length * currentSection.price}</p>
          
          <div className="mb-8 text-center text-gray-500 text-sm border border-gray-700 py-3 rounded-lg">🎤 STAGE</div>
          
          <div className="space-y-2">
            {ROWS.map(row => (
              <div key={row} className="flex items-center gap-2">
                <span className="text-gray-500 w-6 text-xs">{row}</span>
                <div className="flex gap-1 flex-1 justify-center">
                  {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map(seat => {
                    const key = `${currentSection.id}-${row}${seat}`;
                    const isSelected = selected.includes(key);
                    return (
                      <button
                        key={seat}
                        onClick={() => toggleSeat(row, seat)}
                        className={`w-7 h-7 rounded-t-lg text-[10px] font-bold transition ${
                          isSelected ? `${currentSection.color} text-white` : "bg-gray-800 hover:bg-gray-600 text-gray-400"
                        }`}
                        title={`${currentSection.name} Row ${row} Seat ${seat} - $${currentSection.price}`}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
                <span className="text-gray-500 w-6 text-xs">{row}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-6 sticky bottom-0 bg-black pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold">Total: ${total}</p>
              <p className="text-gray-400 text-sm">{selected.length} seats selected</p>
            </div>
          </div>
          <button onClick={checkout} className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-500">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}