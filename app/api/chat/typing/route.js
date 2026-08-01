import { NextResponse } from "next/server";

global.typingUsers = global.typingUsers || {};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  return NextResponse.json({ typing: global.typingUsers[userId] || false });
}

export async function POST(request) {
  const { userId, typing } = await request.json();
  global.typingUsers[userId] = typing;
  return NextResponse.json({ success: true });
}