import { NextResponse } from "next/server";
import store from "@/lib/store";

async function notifyAdmin(msg) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `📩 New Message\nUser: ${msg.userId.slice(-8)}\n\n${msg.text}`,
      }),
    });
  } catch {}
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (userId) return NextResponse.json(store.filter(m => m.userId === userId));
  return NextResponse.json(store);
}

export async function POST(request) {
  const body = await request.json();
  const msg = {
    userId: body.userId,
    text: body.text,
    isAdmin: body.isAdmin || false,
    time: new Date().toISOString(),
  };
  store.push(msg);
  if (!msg.isAdmin) notifyAdmin(msg);
  return NextResponse.json({ success: true });
}