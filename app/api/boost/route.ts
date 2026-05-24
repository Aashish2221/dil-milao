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
      .select("boost_credits, boost_active_until")
      .eq("id", user.id)
      .single();

    if (!profile || profile.boost_credits < 1) {
      return NextResponse.json({ error: "No boost credits" }, { status: 400 });
    }

    // If a boost is already active, don't consume another credit
    if (profile.boost_active_until && new Date(profile.boost_active_until) > new Date()) {
      return NextResponse.json({ boost_active_until: profile.boost_active_until });
    }

    const boostUntil = new Date();
    boostUntil.setMinutes(boostUntil.getMinutes() + 30);

    await supabase
      .from("profiles")
      .update({
        boost_credits: profile.boost_credits - 1,
        boost_active_until: boostUntil.toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ boost_active_until: boostUntil.toISOString() });
  } catch (err) {
    console.error("Boost error:", err);
    return NextResponse.json({ error: "Failed to activate boost" }, { status: 500 });
  }
}
