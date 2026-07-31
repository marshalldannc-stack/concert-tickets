"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { text, from: "user" }]);
    setText("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Customer Support</h1>
      <p className="text-gray-400 mb-4">Send a message and we'll reply shortly.</p>
      <div className="border border-gray-700 rounded-xl p-4 h-64 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === "user" ? "text-right" : ""}`}>
            <span className={`inline-block px-3 py-2 rounded-xl ${m.from === "user" ? "bg-blue-600" : "bg-gray-700"}`}>{m.text}</span>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-500 text-sm">No messages yet.</p>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white" placeholder="Type a message..." />
        <button onClick={send} className="bg-white text-black px-4 py-2 rounded-full">Send</button>
      </div>
    </div>
  );
}