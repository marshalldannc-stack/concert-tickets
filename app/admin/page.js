"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [phone, setPhone] = useState("+1 (251) 829-7805");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("supportPhone");
    if (saved) setPhone(saved);
  }, []);

  const savePhone = () => {
    localStorage.setItem("supportPhone", phone);
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="space-y-6">
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Reply to Customers</h2>
          <p className="text-gray-400 text-sm mb-4">View and reply to all customer messages in one place.</p>
          <a href="https://dashboard.tawk.to" target="_blank" className="bg-white text-black px-6 py-3 rounded-full font-bold inline-block">Open Chat Dashboard →</a>
        </div>

        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Support Phone Number</h2>
          <p className="text-gray-400 text-sm mb-4">This number is shown to customers when they need urgent help.</p>
          {editing ? (
            <div className="flex gap-2">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white" />
              <button onClick={savePhone} className="bg-green-600 text-white px-4 py-2 rounded-full">Save</button>
              <button onClick={() => setEditing(false)} className="bg-gray-700 text-white px-4 py-2 rounded-full">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">{phone}</p>
              <button onClick={() => setEditing(true)} className="text-blue-400 text-sm">Change</button>
            </div>
          )}
        </div>

        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Quick Links</h2>
          <div className="space-y-2">
            <a href="/admin/pricing" className="text-blue-400 text-sm block">→ Manage Ticket Prices</a>
            <a href="/orders" className="text-blue-400 text-sm block">→ View Orders</a>
            <a href="/events" className="text-blue-400 text-sm block">→ Browse Events</a>
          </div>
        </div>
      </div>
    </div>
  );
}