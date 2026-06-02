import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Subscriptions are handled as one-time orders via Cashfree.
// Use /api/payment/create-order instead.
export async function POST() {
  return NextResponse.json(
    { error: "Use /api/payment/create-order for one-time payments." },
    { status: 410 }
  );
}
