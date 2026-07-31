"use client";
import { useState, useEffect } from "react";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const pay = async () => {
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cart.total / 1500, orderId: "order_" + Date.now() }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.invoice_url) window.location.href = data.invoice_url;
    else alert("Payment error. Use support chat.");
  };

  if (!cart) return <p className="text-center mt-10">Cart is empty</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="text-gray-400 mb-2">{cart.event}</p>
      {cart.items.map((item, i) => (
        <div key={i} className="flex justify-between py-2 border-b border-gray-700">
          <span>{item.name} x{item.qty}</span>
          <span>₦{(item.price * item.qty).toLocaleString()}</span>
        </div>
      ))}
      <p className="text-xl font-bold mt-4">Total: ₦{cart.total.toLocaleString()}</p>
      <button onClick={pay} disabled={loading} className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-full font-bold">
        {loading ? "Loading..." : "Pay with Crypto"}
      </button>
      <div className="border-t border-gray-700 pt-6 mt-6">
        <p className="text-sm text-gray-500">Want to pay with card or bank transfer?</p>
        <a href="/chat" className="text-blue-400 underline text-sm">Contact customer support</a>
      </div>
    </div>
  );
}