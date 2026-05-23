"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Compass, MessageCircle, User, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase";

const links = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  }

  function isActive(href: string) {
    // /chat should be active for /chat AND /chat/[id]
    if (href === "/chat") return pathname === "/chat" || pathname.startsWith("/chat/");
    return pathname === href;
  }

  return (
    <>
      {/* Top bar */}
      <header className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-3">
        <Link href="/discover" className="flex items-center gap-2">
          <Heart size={22} fill="#ff6b6b" className="text-red-400 heartbeat" />
          <span className="text-xl font-bold gradient-text">Dil Milao</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex justify-around items-center py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-red-400" : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon
                size={22}
                fill={active && (href === "/matches" || href === "/chat") ? "#ff6b6b" : "none"}
              />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
