import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Cashfree webhook signature: Base64(HMAC_SHA256(timestamp + rawBody, secret_key))
export async function POST(req: NextRequest) {
  const body = await req.text();
  const timestamp = req.headers.get("x-webhook-timestamp") ?? "";
  const signature = req.headers.get("x-webhook-signature") ?? "";

  if (!process.env.CASHFREE_SECRET_KEY) {
    console.error("CASHFREE_SECRET_KEY not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
    .update(timestamp + body)
    .digest("base64");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Use service role key — webhooks have no user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Handle successful payment (fallback if user's verify call failed)
  if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
    const orderId: string = event.data?.order?.order_id ?? "";
    // Order IDs are formatted: dm_{plan}_{timestamp}
    const parts = orderId.split("_");
    const plan = parts[1];

    if (plan && orderId) {
      // Check if this order was already processed by the client-side verify call
      const { count } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("razorpay_order_id", orderId);

      // Already recorded — nothing to do
      if ((count ?? 0) > 0) {
        return NextResponse.json({ received: true });
      }

      // Not yet recorded — find user by customer_id (which is user.id)
      const customerId: string = event.data?.customer_details?.customer_id ?? "";
      if (!customerId) return NextResponse.json({ received: true });

      const orderAmount: number = event.data?.order?.order_amount ?? 0;
      const cfOrderId: string = String(event.data?.order?.cf_order_id ?? orderId);

      const PLAN_DAYS: Record<string, number> = { trial: 3, gold: 30, platinum: 30 };
      const PREMIUM_PLANS = new Set(["trial", "gold", "platinum"]);
      const BOOST_CREDITS: Record<string, number> = { boost_1: 1, boost_5: 5, boost_10: 10 };

      await supabase.from("payments").insert({
        user_id: customerId,
        plan,
        amount: orderAmount,
        razorpay_order_id: orderId,
        razorpay_payment_id: cfOrderId,
      }).then(() => {});

      if (PREMIUM_PLANS.has(plan)) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (PLAN_DAYS[plan] ?? 30));
        await supabase
          .from("profiles")
          .update({ is_premium: true, premium_expires_at: expiresAt.toISOString() })
          .eq("id", customerId);
      }

      if (plan in BOOST_CREDITS) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("boost_credits")
          .eq("id", customerId)
          .single();
        await supabase
          .from("profiles")
          .update({ boost_credits: (profile?.boost_credits ?? 0) + BOOST_CREDITS[plan] })
          .eq("id", customerId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
