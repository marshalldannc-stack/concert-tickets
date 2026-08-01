"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function ChatContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [lastActivity, setLastActivity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (session?.user?.email) {
      setUserId(session.user.email);
      localStorage.setItem("chatUserId", session.user.email);
    } else {
      const saved = localStorage.getItem("chatUserId") || "user_" + Date.now();
      setUserId(saved);
      localStorage.setItem("chatUserId", saved);
    }
  }, [session]);

  const loadMessages = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();
      if (data.length > 0) {
        setMessages(data);
        localStorage.setItem(`chat-cache-${userId}`, JSON.stringify(data));
        const lastAdmin = [...data].reverse().find(m => m.isAdmin);
        if (lastAdmin) setLastActivity(lastAdmin.createdAt);
      }
    } catch {}
  };

  const sendMessage = async (msg, image = null) => {
    if (!userId || (!msg.trim() && !image)) return;
    const tempMsg = { id: "temp", userId, text: msg, image, isAdmin: false, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text: msg, image, isAdmin: false }),
    });
    loadMessages();
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await sendMessage("", reader.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!userId) return;
    const cached = localStorage.getItem(`chat-cache-${userId}`);
    if (cached) {
      setMessages(JSON.parse(cached));
      const data = JSON.parse(cached);
      const lastAdmin = [...data].reverse().find(m => m.isAdmin);
      if (lastAdmin) setLastActivity(lastAdmin.createdAt);
    }
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const event = searchParams.get("event");
    if (event && userId) {
      const key = `auto-msg-${event}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "sent");
        const date = searchParams.get("date");
        const venue = searchParams.get("venue");
        const city = searchParams.get("city");
        setTimeout(() => {
          let msg = `🎫 Price Request\nEvent: ${event}\nDate: ${date || ""}\nVenue: ${venue || ""}${city ? `, ${city}` : ""}\n\nI'd like to know the ticket prices.`;
          sendMessage(msg);
        }, 500);
      }
    }
  }, [searchParams, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customer Support</h1>
        <span className="flex items-center gap-1 text-xs">
          <span className={`w-2 h-2 rounded-full ${lastActivity && (Date.now() - new Date(lastActivity).getTime()) < 300000 ? "bg-green-500" : "bg-gray-500"}`}></span>
          <span className="text-gray-400">{lastActivity && (Date.now() - new Date(lastActivity).getTime()) < 300000 ? "Online" : "Offline"}</span>
        </span>
      </div>
      <p className="text-gray-400 mb-4 text-sm">Chat with us — we reply fast!</p>
      {!session && (
        <p className="text-yellow-400 text-xs mb-4">
          ⚠️ <a href="/login" className="underline">Login</a> to save your chat history permanently.
        </p>
      )}
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
          <p className="text-gray-500 text-sm text-center mt-20">Start a conversation — we're here to help!</p>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2 items-center">
        <label className="bg-gray-800 border border-gray-700 rounded-full px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-sm">
          📷
          <input type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={uploading} />
        </label>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm" placeholder="Type a message..." />
        <button onClick={send} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm">Send</button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-400">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}