import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

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

const CASHFREE_BASE =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

export async function POST(req: NextRequest) {
  try {
    const { orderId, plan } = await req.json();

    if (!orderId || !plan) {
      return NextResponse.json({ error: "Missing orderId or plan" }, { status: 400 });
    }

    // 1. Verify payment status with Cashfree
    const cfRes = await fetch(`${CASHFREE_BASE}/pg/orders/${orderId}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        "x-api-version": "2023-08-01",
      },
    });

    if (!cfRes.ok) {
      return NextResponse.json({ error: "Failed to verify payment with Cashfree" }, { status: 500 });
    }

    const cfOrder = await cfRes.json();

    if (cfOrder.order_status !== "PAID") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 2. Verify amount matches expected plan price
    const expectedAmount = PLAN_AMOUNTS[plan];
    if (!expectedAmount || Number(cfOrder.order_amount) !== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // 3. Get authenticated user from session
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

    // 4. Record payment — unique constraint on order_id prevents double-processing
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: user.id,
      plan,
      amount: expectedAmount,
      razorpay_order_id: orderId,
      razorpay_payment_id: String(cfOrder.cf_order_id ?? orderId),
    });

    if (paymentError?.code === "23505") {
      // Already processed — return success (idempotent)
      return NextResponse.json({ success: true });
    }

    // 5. Grant premium access
    if (PREMIUM_PLANS.has(plan)) {
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

      await supabase
        .from("profiles")
        .update({ is_premium: true, premium_expires_at: expiresAt.toISOString() })
        .eq("id", user.id);
    }

    // 6. Credit boost tokens
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
