"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const eventsData = {
  "1": { title: "Afrobeats Fest 2026", date: "Aug 15, 2026", venue: "Eko Hotel, Lagos", tickets: [
    { id: "reg1", name: "Regular", price: 5000 },
    { id: "vip1", name: "VIP", price: 15000 },
  ]},
  "2": { title: "Lagos Jazz Night", date: "Sep 2, 2026", venue: "Terra Kulture, Lagos", tickets: [
    { id: "reg2", name: "Regular", price: 10000 },
    { id: "vip2", name: "VIP", price: 25000 },
  ]},
  "3": { title: "Amapiano Explosion", date: "Sep 20, 2026", venue: "Balmoral Convention Center", tickets: [
    { id: "reg3", name: "Regular", price: 7500 },
    { id: "vip3", name: "VIP", price: 20000 },
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
            <p className="text-2xl font-bold mt-2">₦{ticket.price.toLocaleString()}</p>
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
          <p className="text-xl font-bold">Total: ₦{total.toLocaleString()}</p>
          <button onClick={checkout} className="mt-4 bg-green-600 text-white px-8 py-3 rounded-full font-bold">Checkout with Crypto</button>
        </div>
      )}
    </div>
  );
}