import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "chats.json");

function readChats() {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {}
  return [];
}

function writeChats(chats) {
  fs.writeFileSync(filePath, JSON.stringify(chats));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const all = readChats();
  if (userId) return NextResponse.json(all.filter(m => m.userId === userId));
  return NextResponse.json(all);
}

export async function POST(request) {
  const body = await request.json();
  const all = readChats();
  all.push({
    userId: body.userId,
    text: body.text,
    isAdmin: body.isAdmin || false,
    time: new Date().toISOString(),
  });
  writeChats(all);
  return NextResponse.json({ success: true });
}