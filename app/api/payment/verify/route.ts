import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const PLAN_AMOUNTS: Record<string, number> = {
  gold: 199,
  platinum: 399,
  boost_1: 49,
  boost_5: 199,
  boost_10: 349,
};

const PREMIUM_PLANS = new Set(["gold", "platinum"]);

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      await req.json();

    // 1. Verify Razorpay signature — prevents tampered/fake payments
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Get the authenticated user from session cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Record payment — unique constraint on razorpay_payment_id blocks replays
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      plan,
      amount: PLAN_AMOUNTS[plan] ?? 0,
      razorpay_order_id,
      razorpay_payment_id,
    });

    if (paymentError?.code === "23505") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 409 });
    }

    // 4. Grant premium access for subscription plans
    if (PREMIUM_PLANS.has(plan)) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabase
        .from("profiles")
        .update({ is_premium: true, premium_expires_at: expiresAt.toISOString() })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
