"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);
  const autoSent = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) setMessages(JSON.parse(saved));
    
    const event = searchParams.get("event");
    if (event && !autoSent.current) {
      autoSent.current = true;
      const date = searchParams.get("date") || "";
      const venue = searchParams.get("venue") || "";
      const city = searchParams.get("city") || "";
      const msg = `🎫 Price Request\nEvent: ${event}\nDate: ${date}\nVenue: ${venue}${city ? `, ${city}` : ""}\n\nI'd like to know the ticket prices.`;
      const newMsg = { id: Date.now(), text: msg, from: "user", time: new Date().toISOString() };
      const updated = [...JSON.parse(localStorage.getItem("chatMessages") || "[]"), newMsg];
      localStorage.setItem("chatMessages", JSON.stringify(updated));
      setMessages(updated);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now(), text, from: "user", time: new Date().toISOString() };
    const updated = [...messages, newMsg];
    localStorage.setItem("chatMessages", JSON.stringify(updated));
    setMessages(updated);
    setText("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2">Customer Support</h1>
      <p className="text-gray-400 mb-1 text-sm">📞 Urgent? Call/Text: <span className="text-white font-bold">+1 (251) 829-7805</span></p>
      <p className="text-gray-400 mb-4 text-sm">We reply within minutes.</p>
      <div className="border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-4 bg-gray-900">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.from === "admin" ? "text-left" : "text-right"}`}>
            <span className={`inline-block px-4 py-2 rounded-xl text-sm whitespace-pre-line ${m.from === "admin" ? "bg-gray-700 text-gray-200" : "bg-blue-600 text-white"}`}>
              {m.text}
            </span>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-20">No messages yet. Send us a message!</p>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm" placeholder="Type a message..." />
        <button onClick={send} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Send</button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-400">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}