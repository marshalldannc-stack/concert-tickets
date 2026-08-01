"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function ChatContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const autoSent = useRef(false);

  useEffect(() => {
    const id = session?.user?.email || localStorage.getItem("chatUserId") || "guest_" + Date.now();
    localStorage.setItem("chatUserId", id);
    setUserId(id);
  }, [session]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/chat?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
    const interval = setInterval(() => {
      fetch(`/api/chat?userId=${userId}`)
        .then(r => r.json())
        .then(data => setMessages(data));
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const event = searchParams.get("event");
    if (event && !autoSent.current) {
      autoSent.current = true;
      const date = searchParams.get("date") || "";
      const venue = searchParams.get("venue") || "";
      const city = searchParams.get("city") || "";
      const msg = `🎫 Price Request\nEvent: ${event}\nDate: ${date}\nVenue: ${venue}${city ? `, ${city}` : ""}\n\nI'd like to know the ticket prices.`;
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: msg, isAdmin: false }),
      });
    }
  }, [userId, searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !userId) return;
    const msg = text;
    setText("");
    setMessages(prev => [...prev, { id: "tmp", userId, text: msg, isAdmin: false, createdAt: new Date().toISOString() }]);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text: msg, isAdmin: false }),
    });
    const res = await fetch(`/api/chat?userId=${userId}`);
    const data = await res.json();
    setMessages(data);
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = reader.result;
      setMessages(prev => [...prev, { id: "tmp", userId, image: img, isAdmin: false, createdAt: new Date().toISOString() }]);
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: "", image: img, isAdmin: false }),
      });
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();
      setMessages(data);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <p className="text-center mt-20 text-gray-400">Loading chat...</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2">Customer Support</h1>
      <p className="text-gray-400 mb-1 text-sm">📞 Urgent? Call/Text: <span className="text-white font-bold">+1 (251) 829-7805</span></p>
      <p className="text-gray-400 mb-4 text-sm">We reply within minutes.</p>
      <div className="border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-4 bg-gray-900">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.isAdmin ? "text-left" : "text-right"}`}>
            {m.image ? (
              <img src={m.image} alt="uploaded" className="max-w-[200px] rounded-xl inline-block" />
            ) : (
              <span className={`inline-block px-4 py-2 rounded-xl text-sm whitespace-pre-line ${m.isAdmin ? "bg-gray-700 text-gray-200" : "bg-blue-600 text-white"}`}>
                {m.text}
              </span>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-20">No messages yet. Send us a message!</p>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="bg-gray-800 border border-gray-700 rounded-full px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-sm">
          📷
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
        </label>
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