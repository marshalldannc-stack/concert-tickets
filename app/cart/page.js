"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const removeItem = (index) => {
    const newCart = { ...cart };
    newCart.items.splice(index, 1);
    if (newCart.items.length === 0) {
      localStorage.removeItem("cart");
      setCart(null);
      return;
    }
    newCart.total = newCart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart(null);
  };

  const pay = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cart.total, orderId: "order_" + Date.now() }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.invoice_url) {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push({ id: "order_" + Date.now(), event: cart.event, total: cart.total, status: "Paid" });
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.removeItem("cart");
      window.location.href = data.invoice_url;
    } else {
      alert("Payment error. Use support chat.");
    }
  };

  if (!cart) return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Cart is Empty</h1>
      <p className="text-gray-400 mb-6">Add some tickets to get started.</p>
      <Link href="/events" className="bg-white text-black px-6 py-3 rounded-full font-bold">Browse Events</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="text-red-400 text-sm underline">Clear all</button>
      </div>
      <p className="text-gray-400 mb-4">{cart.event}</p>
      
      {cart.items.map((item, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-700">
          <div>
            <p className="font-bold">{item.name}</p>
            <p className="text-sm text-gray-400">{item.qty} x ${item.price}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-bold">${item.price * item.qty}</p>
            <button onClick={() => removeItem(i)} className="text-red-400 text-lg hover:text-red-300">✕</button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-6">
        <p className="text-xl font-bold">Total</p>
        <p className="text-2xl font-bold">${cart.total}</p>
      </div>

      <button onClick={pay} disabled={loading} className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-full font-bold text-lg">
        {loading ? "Loading..." : "Pay with Crypto"}
      </button>

      <Link href="/events" className="block text-center text-blue-400 mt-4 text-sm">← Continue Shopping</Link>

      <div className="border-t border-gray-700 pt-6 mt-6">
        <p className="text-sm text-gray-500">Want to pay with card or bank transfer?</p>
        <Link href="/chat" className="text-blue-400 underline text-sm">Contact customer support</Link>
      </div>
    </div>
  );
}