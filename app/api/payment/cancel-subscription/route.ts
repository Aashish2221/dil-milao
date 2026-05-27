import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("razorpay_subscription_id, subscription_status")
      .eq("id", user.id)
      .single();

    if (!profile?.razorpay_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    if (profile.subscription_status === "cancelled") {
      return NextResponse.json({ error: "Subscription already cancelled" }, { status: 400 });
    }

    // Cancel at end of current billing cycle (user keeps premium until expiry)
    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${profile.razorpay_subscription_id}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
          ).toString("base64")}`,
        },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description ?? "Razorpay cancellation failed");
    }

    await supabase
      .from("profiles")
      .update({ subscription_status: "cancelled" })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
