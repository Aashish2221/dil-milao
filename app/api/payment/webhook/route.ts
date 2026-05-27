import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Razorpay sends webhooks with raw body — must NOT use body parsers.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Verify webhook authenticity
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as {
    event: string;
    payload: {
      subscription?: { entity: { id: string } };
      payment?: { entity: { id: string } };
    };
  };

  // Use service role key — webhooks have no user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const subscriptionId = event.payload.subscription?.entity.id;

  if (event.event === "subscription.charged" && subscriptionId) {
    // Auto-renewal succeeded — extend premium by 30 days from current expiry
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, premium_expires_at")
      .eq("razorpay_subscription_id", subscriptionId)
      .single();

    if (profile) {
      const base =
        profile.premium_expires_at && new Date(profile.premium_expires_at) > new Date()
          ? new Date(profile.premium_expires_at)
          : new Date();
      base.setDate(base.getDate() + 30);

      await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_expires_at: base.toISOString(),
          subscription_status: "active",
        })
        .eq("id", profile.id);

      // Record the renewal payment
      const paymentId = event.payload.payment?.entity.id;
      if (paymentId) {
        try {
          await supabase.from("payments").insert({
            user_id: profile.id,
            plan: "renewal",
            amount: 0,
            razorpay_order_id: subscriptionId,
            razorpay_payment_id: paymentId,
          });
        } catch { /* ignore duplicate payment inserts */ }
      }
    }
  }

  if (event.event === "subscription.cancelled" && subscriptionId) {
    // User cancelled — premium stays until expiry date, but won't renew
    await supabase
      .from("profiles")
      .update({ subscription_status: "cancelled" })
      .eq("razorpay_subscription_id", subscriptionId);
  }

  if (event.event === "subscription.halted" && subscriptionId) {
    // Payment failed repeatedly — mark as halted; premium expires naturally
    await supabase
      .from("profiles")
      .update({ subscription_status: "halted" })
      .eq("razorpay_subscription_id", subscriptionId);
  }

  if (event.event === "subscription.completed" && subscriptionId) {
    // 12-month total_count reached — subscription ends
    await supabase
      .from("profiles")
      .update({ subscription_status: "completed" })
      .eq("razorpay_subscription_id", subscriptionId);
  }

  return NextResponse.json({ received: true });
}
