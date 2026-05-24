"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Heart, MessageCircle, Zap, X } from "lucide-react";
import { useRouter } from "next/navigation";
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

function NotifIcon({ type }: { type: string }) {
  if (type === "match") return <Heart size={14} fill="#ff6b6b" className="text-red-400" />;
  if (type === "message") return <MessageCircle size={14} className="text-blue-400" />;
  return <Zap size={14} className="text-yellow-400" />;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load recent notifications
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setNotifs(data as Notif[]);

      // Realtime: new notification arrives
      const channel = supabase
        .channel(`notif-bell-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as Notif;
            setNotifs((prev) => [n, ...prev]);
            showBrowserNotif(n);
          }
        )
        .subscribe();

      cleanup = () => supabase.removeChannel(channel);
    }

    init();
    return () => cleanup?.();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function showBrowserNotif(n: Notif) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const title =
      n.type === "match" ? "New Match 💕" :
      n.type === "message" ? "New Message 💬" :
      "New Like ❤️";
    new Notification(`Dil Milao — ${title}`, {
      body: n.message,
      icon: "/favicon.ico",
      tag: n.id,
    });
  }

  async function requestBrowserPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    if (!userId || unread === 0) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleClick(n: Notif) {
    markRead(n.id);
    setOpen(false);
    if (n.type === "message") router.push(`/chat/${n.from_user_id}`);
    else if (n.type === "match") router.push("/matches");
    else router.push("/premium");
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          requestBrowserPermission();
        }}
        className="relative p-2 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold px-0.5 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-[200] overflow-hidden"
          style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-red-400/60 text-xs hover:text-red-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-white/30 text-sm">
                No notifications yet
              </div>
            ) : (
              notifs.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/[0.04] last:border-0 ${
                    !n.read ? "bg-red-500/[0.04]" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a24)" }}
                  >
                    {n.from_name ? getInitials(n.from_name) : <NotifIcon type={n.type} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <NotifIcon type={n.type} />
                      <span className="text-white/80 text-xs font-medium truncate">
                        {n.from_name || "Dil Milao"}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-white/20 text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                  </div>

                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => { setOpen(false); router.push("/notifications"); }}
            className="w-full py-2.5 text-center text-red-400/60 text-xs hover:text-red-400 transition-colors border-t border-white/5"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}
