"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Conversation = {
  id: string;          // matched user's profile ID
  full_name: string;
  age: number;
  last_message: string;
  last_time: string;
  unread: number;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatListPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Step 1: Get all matches with their profile info
      const { data: matchRows } = await supabase
        .from("matches")
        .select("matched_user_id, matched_at")
        .eq("user_id", user.id)
        .order("matched_at", { ascending: false });

      if (!matchRows || matchRows.length === 0) { setLoading(false); return; }

      const matchedIds = matchRows.map((m) => m.matched_user_id);

      // Step 2: Get profiles for all matched users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, age")
        .in("id", matchedIds);

      const profileMap: Record<string, { full_name: string; age: number }> = {};
      profiles?.forEach((p) => { profileMap[p.id] = p; });

      // Step 3: For each match, get the latest message and unread count
      const conversations = await Promise.all(
        matchRows.map(async (match) => {
          const otherId = match.matched_user_id;

          const { data: msgs } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .or(
              `and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),` +
              `and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`
            )
            .order("created_at", { ascending: false })
            .limit(1);

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("sender_id", otherId)
            .eq("read", false);

          return {
            id: otherId,
            full_name: profileMap[otherId]?.full_name || "Unknown",
            age: profileMap[otherId]?.age || 0,
            last_message: msgs?.[0]?.content || "Say hello! 👋",
            last_time: msgs?.[0]?.created_at || match.matched_at,
            unread: unreadCount || 0,
          };
        })
      );

      // Sort by latest message time
      conversations.sort((a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime());
      setConvos(conversations);
      setLoading(false);
    }
    loadConversations();
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-white/40 text-sm">Chat with your matches</p>
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
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})` }}
                  >
                    {getInitials(convo.full_name)}
                  </div>
                  {convo.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white font-bold">
                      {convo.unread}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-white font-semibold">{convo.full_name}, {convo.age}</h3>
                    <span className="text-white/30 text-xs">{formatTime(convo.last_time)}</span>
                  </div>
                  <p className={`text-sm truncate ${convo.unread > 0 ? "text-white/80 font-medium" : "text-white/40"}`}>
                    {convo.last_message}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Go to matches shortcut */}
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
