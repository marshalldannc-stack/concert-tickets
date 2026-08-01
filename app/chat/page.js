"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const event = searchParams.get("event");
    const date = searchParams.get("date");
    const venue = searchParams.get("venue");
    const city = searchParams.get("city");

    if (event) {
      let msg = `🎫 Price Request\nEvent: ${event}`;
      if (date) msg += `\nDate: ${date}`;
      if (venue) msg += `\nVenue: ${venue}${city ? `, ${city}` : ""}`;
      msg += `\n\nI'd like to know the ticket prices for this event.`;
      setMessages([{ text: msg, from: "user" }]);
    }
  }, [searchParams]);

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { text, from: "user" }]);
    setText("");
    // Auto-reply after 1 second
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Thanks! We'll check availability and get back to you with the best price shortly.", from: "admin" }]);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Customer Support</h1>
      <p className="text-gray-400 mb-4">Chat with us for ticket prices and help.</p>
      <div className="border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-4 bg-gray-900">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.from === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-4 py-2 rounded-xl text-sm whitespace-pre-line ${m.from === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}>
              {m.text}
            </span>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-500 text-sm text-center mt-20">Start a conversation — we're here to help!</p>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm" placeholder="Type a message..." />
        <button onClick={send} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Send</button>
      </div>
    </div>
  );
}