"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageCircle, Zap, Trash2, CheckCheck, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Notif = {
  id: string;
  type: "message" | "match" | "like";
  from_user_id: string;
  from_name: string | null;
  message: string;
  read: boolean;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function NotifIcon({ type }: { type: string }) {
  if (type === "match")
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,107,107,0.15)" }}>
        <Heart size={16} fill="#ff6b6b" className="text-red-400" />
      </div>
    );
  if (type === "message")
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(107,158,255,0.15)" }}>
        <MessageCircle size={16} className="text-blue-400" />
      </div>
    );
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(249,202,36,0.15)" }}>
      <Zap size={16} className="text-yellow-400" />
    </div>
  );
}

function typeLabel(type: string) {
  if (type === "match") return "Match";
  if (type === "message") return "Message";
  return "Like";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifs((data as Notif[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    if (!userId || unread === 0) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotif(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  async function clearAll() {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("user_id", userId);
    setNotifs([]);
  }

  function handleNotifClick(n: Notif) {
    markRead(n.id);
    if (n.type === "message") router.push(`/chat/${n.from_user_id}`);
    else if (n.type === "match") router.push("/matches");
    else router.push("/premium");
  }

  // Group notifications by date
  const groups: { label: string; items: Notif[] }[] = [];
  notifs.forEach((n) => {
    const label = formatDate(n.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  });

  return (
    <div className="min-h-screen pb-24 app-page" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unread > 0 && (
              <p className="text-white/40 text-sm">{unread} unread</p>
            )}
          </div>
          {notifs.length > 0 && (
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-1.5 rounded-full glass"
                >
                  <CheckCheck size={14} />
                  All read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-full glass"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && notifs.length === 0 && (
          <div className="text-center py-20">
            <Bell size={56} className="text-white/10 mx-auto mb-5" />
            <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-white/40 text-sm">Notifications for matches, messages, and likes will appear here.</p>
          </div>
        )}

        {/* Grouped notification list */}
        {!loading && groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl p-4 flex items-start gap-4 transition-all ${
                    !n.read
                      ? "border border-red-500/15"
                      : "border border-white/5"
                  }`}
                  style={{ background: !n.read ? "rgba(255,107,107,0.04)" : "rgba(255,255,255,0.02)" }}
                >
                  {/* Left: avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a24)" }}
                  >
                    {n.from_name ? getInitials(n.from_name) : <Bell size={16} className="text-white" />}
                  </div>

                  {/* Middle: content */}
                  <button
                    onClick={() => handleNotifClick(n)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <NotifIcon type={n.type} />
                      <span className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                        {typeLabel(n.type)}
                      </span>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      )}
                    </div>
                    {n.from_name && (
                      <p className="text-white font-medium text-sm mb-0.5">{n.from_name}</p>
                    )}
                    <p className="text-white/60 text-sm leading-relaxed">{n.message}</p>
                    <p className="text-white/20 text-xs mt-1.5">{timeAgo(n.created_at)}</p>
                  </button>

                  {/* Right: delete */}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="text-white/15 hover:text-white/40 transition-colors flex-shrink-0 mt-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
