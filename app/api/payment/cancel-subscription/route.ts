import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Payments are one-time (no auto-renewal). Nothing to cancel.
export async function POST() {
  return NextResponse.json(
    { error: "No active subscription to cancel. Payments do not auto-renew." },
    { status: 410 }
  );
}
