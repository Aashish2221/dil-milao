import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Amounts in INR (Cashfree uses rupees, not paise)
const AMOUNTS: Record<string, number> = {
  trial: 5,
  gold: 199,
  platinum: 399,
  boost_1: 49,
  boost_5: 199,
  boost_10: 349,
};

const CASHFREE_BASE =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to environment variables." },
        { status: 503 }
      );
    }

    const { plan } = await req.json();
    const amount = AMOUNTS[plan];

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get authenticated user for customer details (required by Cashfree)
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

    const orderId = `dm_${plan}_${Date.now()}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const cfRes = await fetch(`${CASHFREE_BASE}/pg/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: user.id,
          customer_email: user.email ?? "user@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${siteUrl}/premium?order_id=${orderId}&plan=${plan}`,
        },
      }),
    });

    if (!cfRes.ok) {
      const err = await cfRes.json().catch(() => ({}));
      console.error("Cashfree create order error:", err);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const cfData = await cfRes.json();

    return NextResponse.json({
      orderId: cfData.order_id,
      paymentSessionId: cfData.payment_session_id,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
