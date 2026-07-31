"use client";
import { useState, useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("orders") || "[]";
    setOrders(JSON.parse(saved));
  }, []);

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.event.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-full px-4 py-2 mb-6 text-white"
        placeholder="Search by order ID or event name..."
      />
      {filtered.length === 0 ? (
        <p className="text-gray-400">No orders found.</p>
      ) : (
        filtered.map((order, i) => (
          <div key={i} className="border border-gray-700 rounded-xl p-4 mb-4">
            <p className="font-bold">{order.event}</p>
            <p className="text-gray-400">Status: {order.status}</p>
            <p className="text-gray-400">Total: ${order.total}</p>
            <p className="text-sm text-gray-500">Order ID: {order.id}</p>
          </div>
        ))
      )}
    </div>
  );
}