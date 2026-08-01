import { NextResponse } from "next/server";
import store from "@/lib/store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (userId) return NextResponse.json(store.filter(m => m.userId === userId));
  return NextResponse.json(store);
}

export async function POST(request) {
  const body = await request.json();
  store.push({
    userId: body.userId,
    text: body.text,
    isAdmin: body.isAdmin || false,
    time: new Date().toISOString(),
  });
  return NextResponse.json({ success: true });
}