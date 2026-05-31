"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Conversation = {
  id: string;
  full_name: string;
  age: number;
  photo_url: string;
  last_message: string;
  last_time: string;
  unread: number;
  last_sender_me: boolean;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86400000) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatListPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  async function loadConversations(uid: string) {
    const supabase = createClient();

    const { data: matchRows } = await supabase
      .from("matches")
      .select("matched_user_id, matched_at")
      .eq("user_id", uid)
      .order("matched_at", { ascending: false });

    if (!matchRows || matchRows.length === 0) { setLoading(false); return; }

    const matchedIds = matchRows.map((m) => m.matched_user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, age, photo_url")
      .in("id", matchedIds);

    const profileMap: Record<string, { full_name: string; age: number; photo_url: string }> = {};
    profiles?.forEach((p) => { profileMap[p.id] = p; });

    const conversations = await Promise.all(
      matchRows.map(async (match) => {
        const otherId = match.matched_user_id;

        const { data: msgs } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .or(
            `and(sender_id.eq.${uid},receiver_id.eq.${otherId}),` +
            `and(sender_id.eq.${otherId},receiver_id.eq.${uid})`
          )
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", uid)
          .eq("sender_id", otherId)
          .eq("read", false);

        const lastMsg = msgs?.[0];
        return {
          id: otherId,
          full_name: profileMap[otherId]?.full_name || "Unknown",
          age: profileMap[otherId]?.age || 0,
          photo_url: profileMap[otherId]?.photo_url || "",
          last_message: lastMsg?.content || "Say hello! 👋",
          last_time: lastMsg?.created_at || match.matched_at,
          unread: unreadCount || 0,
          last_sender_me: lastMsg?.sender_id === uid,
        };
      })
    );

    conversations.sort((a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime());
    setConvos(conversations);
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    let uid = "";

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      uid = user.id;
      setMyUserId(uid);
      loadConversations(uid);

      // Realtime: refresh list when new messages arrive
      const channel = supabase
        .channel("chat-list-updates")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` },
          () => loadConversations(uid)
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalUnread = convos.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-white/40 text-sm">Chat with your matches</p>
          </div>
          {totalUnread > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold btn-primary text-white">
              {totalUnread} new
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : convos.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle size={64} className="text-white/10 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-3">No conversations yet</h2>
            <p className="text-white/40 mb-8">Match with someone to start chatting!</p>
            <Link href="/matches" className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block">
              View Matches
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {convos.map((convo, i) => (
              <Link
                key={convo.id}
                href={`/chat/${convo.id}`}
                className="profile-card rounded-2xl p-4 flex items-center gap-4 block"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})` }}
                  >
                    {convo.photo_url ? (
                      <Image src={convo.photo_url} alt={convo.full_name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{getInitials(convo.full_name)}</span>
                    )}
                  </div>
                  {convo.unread > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-bold">
                      {convo.unread > 9 ? "9+" : convo.unread}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`font-semibold truncate ${convo.unread > 0 ? "text-white" : "text-white/80"}`}>
                      {convo.full_name}, {convo.age}
                    </h3>
                    <span className="text-white/30 text-xs ml-2 flex-shrink-0">{formatTime(convo.last_time)}</span>
                  </div>
                  <p className={`text-sm truncate ${convo.unread > 0 ? "text-white/80 font-medium" : "text-white/40"}`}>
                    {convo.last_sender_me ? <span className="text-white/30">You: </span> : null}
                    {convo.last_message}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {convos.length > 0 && (
          <div className="mt-8 glass rounded-2xl p-4 flex items-center gap-3">
            <Heart size={20} fill="#ff6b6b" className="text-red-400" />
            <p className="text-white/60 text-sm flex-1">Have more matches waiting!</p>
            <Link href="/matches" className="btn-primary px-4 py-2 rounded-full text-white text-sm font-medium">
              View
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
