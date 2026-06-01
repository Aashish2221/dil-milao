"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Compass, MessageCircle, User, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";
import InstallPrompt from "@/components/InstallPrompt";

const links = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/liked-you", label: "Liked You", icon: Star },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUnread(uid: string) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", uid)
        .eq("read", false);
      setUnreadCount(count || 0);
    }

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetchUnread(user.id);

      const channel = supabase
        .channel("navbar-unread")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
          () => fetchUnread(user.id)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
          () => fetchUnread(user.id)
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });

    return () => { cleanup?.(); };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  }

  function isActive(href: string) {
    if (href === "/chat") return pathname === "/chat" || pathname.startsWith("/chat/");
    return pathname === href;
  }

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <>
      {/* Top bar */}
      <header className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-3">
        <Link href="/discover" className="flex items-center gap-2">
          <Heart size={22} fill="#ff6b6b" className="text-red-400 heartbeat" />
          <span className="text-xl font-bold gradient-text">Dil Milao</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white/60 text-xs transition-colors px-2 py-1"
          >
            Logout
          </button>
        </div>
      </header>

      <InstallPrompt />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex justify-around items-center py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const showBadge = href === "/chat" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-red-400" : "text-white/30 hover:text-white/60"
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  fill={active && (href === "/matches" || href === "/chat" || href === "/liked-you") ? "#ff6b6b" : "none"}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
                    {badgeLabel}
                  </span>
                )}
              </div>
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
