"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [qty, setQty] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=D1foAk71GwmcUoAIVYGKtmKxC0IyQiUk`)
      .then(r => r.json())
      .then(data => {
        const priceMin = data.priceRanges?.[0]?.min || 59;
        const priceMax = data.priceRanges?.[0]?.max || 199;
        const currency = data.priceRanges?.[0]?.currency || "USD";
        setEvent({
          title: data.name,
          artist: data._embedded?.attractions?.[0]?.name || "Various Artists",
          date: data.dates.start.localDate,
          time: data.dates.start.localTime,
          venue: data._embedded?.venues?.[0]?.name || "TBA",
          city: data._embedded?.venues?.[0]?.city?.name || "",
          image: data.images?.[0]?.url,
          priceRange: `${currency} ${priceMin} - ${priceMax}`,
          tickets: [
            { id: "floor", name: "Floor / Standing", price: Math.round(priceMax * 0.8), section: "Floor" },
            { id: "lower", name: "Lower Level", price: Math.round((priceMin + priceMax) / 2), section: "100 Level" },
            { id: "upper", name: "Upper Level", price: Math.round(priceMin * 1.1), section: "300 Level" },
          ],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading event...</p>;
  if (!event) return <p className="text-center mt-20">Event not found.</p>;

  const updateQty = (ticketId, val) => setQty({ ...qty, [ticketId]: Math.max(0, (qty[ticketId] || 0) + val) });
  const total = event.tickets.reduce((sum, t) => sum + (qty[t.id] || 0) * t.price, 0);

  const checkout = () => {
    const items = event.tickets.filter(t => qty[t.id] > 0).map(t => ({ ...t, qty: qty[t.id] }));
    if (items.length === 0) return alert("Select at least one ticket");
    localStorage.setItem("cart", JSON.stringify({ items, total, event: event.title }));
    router.push("/cart");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {event.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-xl mb-6" />}
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-gray-400 text-lg">{event.artist}</p>
      <p className="text-gray-500">
        {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        {event.time && ` • ${event.time.slice(0, 5)}`}
      </p>
      <p className="text-gray-500">{event.venue}{event.city ? `, ${event.city}` : ""}</p>
      <p className="text-sm text-gray-400 mt-2">Price range: {event.priceRange}</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Select Seats</h2>
        {event.tickets.map(ticket => (
          <div key={ticket.id} className="border border-gray-700 rounded-xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{ticket.name}</h3>
                <p className="text-gray-400 text-sm">Section: {ticket.section}</p>
                <p className="text-2xl font-bold mt-1">${ticket.price}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => updateQty(ticket.id, -1)} className="bg-gray-700 w-10 h-10 rounded-full text-xl">-</button>
                <span className="text-xl w-6 text-center font-bold">{qty[ticket.id] || 0}</span>
                <button onClick={() => updateQty(ticket.id, 1)} className="bg-gray-700 w-10 h-10 rounded-full text-xl">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-6 sticky bottom-0 bg-black pb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-2xl font-bold">Total: ${total}</p>
            <p className="text-gray-400">{Object.values(qty).reduce((a, b) => a + b, 0)} tickets</p>
          </div>
          <button onClick={checkout} className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-500">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}