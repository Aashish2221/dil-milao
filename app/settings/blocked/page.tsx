"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldX, UserCheck } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

type BlockedUser = {
  blocked_id: string;
  created_at: string;
  profile: {
    full_name: string;
    age: number;
    city: string;
    photo_url: string;
  } | null;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      const { data } = await supabase
        .from("blocks")
        .select(`
          blocked_id,
          created_at,
          profile:profiles!blocks_blocked_id_fkey(full_name, age, city, photo_url)
        `)
        .eq("blocker_id", user.id)
        .order("created_at", { ascending: false });

      setBlocked((data as unknown as BlockedUser[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleUnblock(blockedId: string) {
    if (!myUserId) return;
    setUnblocking(blockedId);
    const supabase = createClient();
    await supabase.from("blocks").delete()
      .eq("blocker_id", myUserId)
      .eq("blocked_id", blockedId);
    setBlocked((prev) => prev.filter((b) => b.blocked_id !== blockedId));
    setUnblocking(null);
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <ShieldX size={18} className="text-white/40" />
          <h1 className="text-white font-semibold">Blocked Users</h1>
        </div>
        {blocked.length > 0 && (
          <span className="text-white/30 text-sm">{blocked.length}</span>
        )}
      </header>

      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : blocked.length === 0 ? (
          <div className="text-center py-20">
            <ShieldX size={48} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">You haven&apos;t blocked anyone</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/30 text-xs mb-4">
              Blocked users won&apos;t appear in your feed and can&apos;t message you. Unblocking lets them appear again.
            </p>
            {blocked.map((b, i) => (
              <div
                key={b.blocked_id}
                className="glass rounded-2xl p-4 flex items-center gap-3"
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})` }}
                >
                  {b.profile?.photo_url ? (
                    <Image src={b.profile.photo_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{b.profile ? getInitials(b.profile.full_name) : "?"}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {b.profile?.full_name || "Deleted user"}
                    {b.profile?.age ? <span className="text-white/40">, {b.profile.age}</span> : null}
                  </p>
                  {b.profile?.city && (
                    <p className="text-white/30 text-xs">{b.profile.city}</p>
                  )}
                  <p className="text-white/20 text-xs mt-0.5">
                    Blocked {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <button
                  onClick={() => handleUnblock(b.blocked_id)}
                  disabled={unblocking === b.blocked_id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 glass hover:text-white transition-all disabled:opacity-40"
                >
                  <UserCheck size={14} />
                  {unblocking === b.blocked_id ? "…" : "Unblock"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
