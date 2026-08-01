import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "chats.json");

export async function GET() {
  let chats = [];
  try {
    if (fs.existsSync(filePath)) chats = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {}
  
  const grouped = {};
  chats.forEach(m => {
    if (!grouped[m.userId]) grouped[m.userId] = [];
    grouped[m.userId].push(m);
  });
  return NextResponse.json(grouped);
}