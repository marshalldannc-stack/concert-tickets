import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { amount, orderId } = await request.json();

    const res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: Number(amount).toFixed(2),
        price_currency: "usd",
        order_id: orderId,
        order_description: "Concert Ticket",
      }),
    });

    const data = await res.json();
    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}