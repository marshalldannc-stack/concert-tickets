import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url") || "https://www.ticketmaster.com/eagles-live-at-sphere-las-vegas-nevada-09-18-2026/event/1700649D8707EA93";
  
  const apiKey = "5f2440f9-b848-4324-9119-0ee735dbbc83";
  const res = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ zone: "web_unlocker1", url, format: "raw" }),
  });
  const html = await res.text();
  
  const priceMatches = html.match(/\$[\d,]+/g) || [];
  
  return NextResponse.json({ 
    htmlLength: html.length,
    priceMatches: priceMatches.slice(0, 20),
    fullHtml: html.substring(0, 5000)
  });
}