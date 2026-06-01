import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile is set up (has a name)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, age")
        .eq("id", data.user.id)
        .single();

      // New Google user — send to setup
      if (!profile?.full_name || !profile?.age) {
        return NextResponse.redirect(`${origin}/setup`);
      }

      return NextResponse.redirect(`${origin}/discover`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+sign+in+with+Google`);
}
