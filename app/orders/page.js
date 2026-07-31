"use client";
import { useState, useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("orders") || "[]";
    setOrders(JSON.parse(saved));
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-400">No orders yet.</p>
      ) : (
        orders.map((order, i) => (
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