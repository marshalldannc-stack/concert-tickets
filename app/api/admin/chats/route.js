import { NextResponse } from "next/server";
import store from "@/lib/store";

export async function GET() {
  const grouped = {};
  store.forEach(m => {
    if (!grouped[m.userId]) grouped[m.userId] = [];
    grouped[m.userId].push(m);
  });
  return NextResponse.json(grouped);
}