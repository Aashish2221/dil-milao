import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const PLAN_AMOUNTS: Record<string, number> = {
  trial: 5,
  gold: 199,
  platinum: 399,
  boost_1: 49,
  boost_5: 199,
  boost_10: 349,
};

const PREMIUM_PLANS = new Set(["trial", "gold", "platinum"]);
const PLAN_DAYS: Record<string, number> = { trial: 3, gold: 30, platinum: 30 };
const BOOST_CREDITS: Record<string, number> = { boost_1: 1, boost_5: 5, boost_10: 10 };

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = await req.json();

    const isSubscription = !!razorpay_subscription_id;

    // 1. Verify Razorpay signature
    // Subscriptions: HMAC(payment_id|subscription_id)
    // One-time orders: HMAC(order_id|payment_id)
    const sigBody = isSubscription
      ? `${razorpay_payment_id}|${razorpay_subscription_id}`
      : `${razorpay_order_id}|${razorpay_payment_id}`;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sigBody)
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
      razorpay_order_id: razorpay_order_id ?? razorpay_subscription_id,
      razorpay_payment_id,
    });

    if (paymentError?.code === "23505") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 409 });
    }

    // 4. Grant premium access for subscription plans
    if (PREMIUM_PLANS.has(plan)) {
      // Block trial re-use before granting access
      if (plan === "trial") {
        const { count } = await supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("plan", "trial");
        if ((count ?? 0) > 1) {
          return NextResponse.json({ error: "Trial already used" }, { status: 409 });
        }
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (PLAN_DAYS[plan] ?? 30));

      const premiumUpdate: Record<string, unknown> = {
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
      };

      // Store subscription ID for recurring plans so webhook can find the user
      if (isSubscription && razorpay_subscription_id) {
        premiumUpdate.razorpay_subscription_id = razorpay_subscription_id;
        premiumUpdate.subscription_status = "active";
      }

      await supabase.from("profiles").update(premiumUpdate).eq("id", user.id);
    }

    // 5. Credit boost tokens — activate immediately (30 min window per boost)
    if (plan in BOOST_CREDITS) {
      const credits = BOOST_CREDITS[plan];
      const { data: profile } = await supabase
        .from("profiles")
        .select("boost_credits")
        .eq("id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({ boost_credits: (profile?.boost_credits ?? 0) + credits })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
