import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// type is one of "match" | "message" | "like" — maps to notif_* columns
const NOTIF_PREF_COLUMN: Record<string, string> = {
  match: "notif_matches",
  message: "notif_messages",
  like: "notif_likes",
};

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to_user_id, title, body, url, type } = await req.json();
  if (!to_user_id || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check if the recipient has this notification type enabled
  if (type && NOTIF_PREF_COLUMN[type]) {
    const col = NOTIF_PREF_COLUMN[type];
    const { data: prefs } = await supabase
      .from("profiles")
      .select(col)
      .eq("id", to_user_id)
      .single();
    if (prefs && (prefs as unknown as Record<string, unknown>)[col] === false) {
      return NextResponse.json({ ok: true, sent: 0, skipped: "user preference" });
    }
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, auth, p256dh")
    .eq("user_id", to_user_id);

  if (!subs || subs.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const payload = JSON.stringify({ title, body, url: url || "/discover" });
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
        payload
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ ok: true, sent });
}
