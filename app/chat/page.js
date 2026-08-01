"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId] = useState(() => localStorage.getItem("chatUserId") || "user_" + Date.now());
  const [adminTyping, setAdminTyping] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);
  const sentRef = useRef(false);
  const chatEndRef = useRef(null);
  const loadedIds = useRef(new Set());
  const typingTimeout = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      const data = await res.json();
      if (data.length > 0) {
        const newMsgs = data.filter(m => !loadedIds.current.has(m.time + m.text));
        if (newMsgs.length > 0) {
          data.forEach(m => loadedIds.current.add(m.time + m.text));
          const lastAdmin = [...data].reverse().find(m => m.isAdmin);
          if (lastAdmin) setLastActivity(lastAdmin.time);
          setMessages(data);
        }
      }
      const res2 = await fetch(`/api/chat/typing?userId=${userId}`);
      const typing = await res2.json();
      setAdminTyping(typing.typing);
    } catch {}
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text: msg, isAdmin: false }),
    });
    loadMessages();
  };

  const handleTyping = (val) => {
    setText(val);
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, typing: val.length > 0 }),
    });
  };

  useEffect(() => {
    localStorage.setItem("chatUserId", userId);
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const event = searchParams.get("event");
    const date = searchParams.get("date");
    const venue = searchParams.get("venue");
    const city = searchParams.get("city");
    if (event && !sentRef.current) {
      sentRef.current = true;
      setTimeout(() => {
        let msg = `🎫 Price Request\nEvent: ${event}\nDate: ${date || ""}\nVenue: ${venue || ""}${city ? `, ${city}` : ""}\n\nI'd like to know the ticket prices.`;
        sendMessage(msg);
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping]);

  const send = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, typing: false }),
    });
  };

  const timeSince = (t) => {
    if (!t) return "";
    const diff = Math.floor((Date.now() - new Date(t).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
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
      <div className="border border-gray-700 rounded-xl p-4 h-80 overflow-y-auto mb-4 bg-gray-900">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.isAdmin ? "text-left" : "text-right"}`}>
            <span className={`inline-block px-4 py-2 rounded-xl text-sm whitespace-pre-line ${m.isAdmin ? "bg-gray-700 text-gray-200" : "bg-blue-600 text-white"}`}>
              {m.text}
            </span>
          </div>
        ))}
        {adminTyping && (
          <div className="text-left mb-3">
            <span className="inline-block px-4 py-2 rounded-xl text-sm bg-gray-700 text-gray-400 animate-pulse">
              Support is typing...
            </span>
          </div>
        )}
        {messages.length === 0 && !adminTyping && (
          <p className="text-gray-500 text-sm text-center mt-20">Start a conversation — we're here to help!</p>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => handleTyping(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm" placeholder="Type a message..." />
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