"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [conversations, setConversations] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [reply, setReply] = useState("");
  const [newMsg, setNewMsg] = useState(false);

  const loadChats = async () => {
    const res = await fetch("/api/admin/chats");
    const data = await res.json();
    setConversations(data);
    setNewMsg(true);
    setTimeout(() => setNewMsg(false), 2000);
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendReply = async () => {
    if (!reply.trim() || !activeUser) return;
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser, text: reply, isAdmin: true }),
    });
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_email: activeUser, reply_text: reply }),
    });
    setReply("");
    loadChats();
  };

  const userIds = Object.keys(conversations);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
        {newMsg && <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">New</span>}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Active Chats</h2>
          <p className="text-3xl font-bold mt-2">{userIds.length}</p>
        </div>
        <div className="border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-bold">Manual Pricing</h2>
          <a href="/admin/pricing" className="text-blue-400 text-sm mt-2 block">Manage Prices</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-gray-700 rounded-xl p-4">
          <h2 className="font-bold mb-3 text-sm">Conversations</h2>
          {userIds.length === 0 && <p className="text-gray-500 text-xs">No chats yet</p>}
          {userIds.map(uid => (
            <button key={uid} onClick={() => setActiveUser(uid)}
              className={`w-full text-left p-2 rounded-lg mb-1 text-xs ${activeUser === uid ? "bg-blue-600" : "hover:bg-gray-800"}`}>
              {uid.includes("@") ? uid : `User ${uid.slice(-6)}`}
            </button>
          ))}
        </div>
        <div className="border border-gray-700 rounded-xl p-4 md:col-span-3">
          {activeUser ? (
            <>
              <h2 className="font-bold mb-3 text-sm">Chat</h2>
              <div className="h-80 overflow-y-auto mb-4 bg-gray-900 rounded-lg p-3">
                {(conversations[activeUser] || []).map((m, i) => (
                  <div key={i} className={`mb-2 ${m.isAdmin ? "text-left" : "text-right"}`}>
                    {m.image ? (
                      <img src={m.image} className="max-w-[200px] rounded-xl inline-block" />
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-xl text-sm whitespace-pre-line ${m.isAdmin ? "bg-gray-700" : "bg-blue-600"}`}>
                        {m.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-white text-sm" placeholder="Reply to user..." />
                <button onClick={sendReply} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold">Send</button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20">👈 Select a conversation to reply</p>
          )}
        </div>
      </div>
    </div>
  );
}