"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const eventsData = {
  "1": { title: "Summer Jam Festival", date: "Aug 25, 2026", venue: "Madison Square Garden, NYC", tickets: [
    { id: "reg1", name: "General Admission", price: 50 },
    { id: "vip1", name: "VIP Pass", price: 150 },
  ]},
  "2": { title: "Jazz Under the Stars", date: "Sep 10, 2026", venue: "Hollywood Bowl, LA", tickets: [
    { id: "reg2", name: "General Admission", price: 75 },
    { id: "vip2", name: "VIP Pass", price: 200 },
  ]},
  "3": { title: "Electric Nights Tour", date: "Sep 30, 2026", venue: "United Center, Chicago", tickets: [
    { id: "reg3", name: "General Admission", price: 60 },
    { id: "vip3", name: "VIP Pass", price: 180 },
  ]},
};

export default function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const event = eventsData[id];
  const [qty, setQty] = useState({});

  if (!event) return <p>Event not found</p>;

  const updateQty = (ticketId, val) => {
    setQty({ ...qty, [ticketId]: Math.max(0, (qty[ticketId] || 0) + val) });
  };

  const total = event.tickets.reduce((sum, t) => sum + (qty[t.id] || 0) * t.price, 0);

  const checkout = () => {
    const items = event.tickets.filter(t => qty[t.id] > 0).map(t => ({ ...t, qty: qty[t.id] }));
    if (items.length === 0) return alert("Select at least one ticket");
    localStorage.setItem("cart", JSON.stringify({ items, total, event: event.title }));
    router.push("/cart");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-gray-400">{event.date} - {event.venue}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {event.tickets.map((ticket) => (
          <div key={ticket.id} className="border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold">{ticket.name}</h2>
            <p className="text-2xl font-bold mt-2">${ticket.price}</p>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => updateQty(ticket.id, -1)} className="bg-gray-700 w-8 h-8 rounded-full">-</button>
              <span className="text-lg">{qty[ticket.id] || 0}</span>
              <button onClick={() => updateQty(ticket.id, 1)} className="bg-gray-700 w-8 h-8 rounded-full">+</button>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-6">
          <p className="text-xl font-bold">Total: ${total}</p>
          <button onClick={checkout} className="mt-4 bg-green-600 text-white px-8 py-3 rounded-full font-bold">Checkout with Crypto</button>
        </div>
      )}
    </div>
  );
}