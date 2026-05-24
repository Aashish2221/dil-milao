import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Amounts in paise (1 INR = 100 paise)
const AMOUNTS: Record<string, number> = {
  gold: 19900,      // ₹199
  platinum: 39900,  // ₹399
  boost_1: 4900,    // ₹49
  boost_5: 19900,   // ₹199
  boost_10: 34900,  // ₹349
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const amount = AMOUNTS[plan];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${plan}_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id, amount, currency: "INR" });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
