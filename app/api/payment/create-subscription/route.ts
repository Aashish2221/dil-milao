import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

// Create these plans once in the Razorpay dashboard, then paste their IDs here via env vars:
//   RAZORPAY_PLAN_ID_GOLD     — ₹199/month
//   RAZORPAY_PLAN_ID_PLATINUM — ₹399/month
const PLAN_IDS: Record<string, string | undefined> = {
  gold: process.env.RAZORPAY_PLAN_ID_GOLD,
  platinum: process.env.RAZORPAY_PLAN_ID_PLATINUM,
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    const planId = PLAN_IDS[plan];

    if (!planId) {
      return NextResponse.json(
        { error: `Plan not configured. Set RAZORPAY_PLAN_ID_${plan.toUpperCase()} in environment variables.` },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment not configured. Add Razorpay keys to environment variables." },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12, // up to 12 monthly renewals
      quantity: 1,
    });

    return NextResponse.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error("create-subscription error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
