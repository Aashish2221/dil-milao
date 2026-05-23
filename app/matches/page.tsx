"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Match = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  bio: string;
  matched_at: string;
};

const DEMO_MATCHES: Match[] = [
  { id: "m1", full_name: "Priya Sharma", age: 24, city: "Mumbai", bio: "Software engineer who loves Bollywood music.", matched_at: "2026-05-22T10:00:00Z" },
  { id: "m2", full_name: "Ananya Patel", age: 22, city: "Bangalore", bio: "Graphic designer, coffee addict, dog lover.", matched_at: "2026-05-21T15:30:00Z" },
  { id: "m3", full_name: "Kavya Reddy", age: 26, city: "Hyderabad", bio: "Doctor by day, foodie by night.", matched_at: "2026-05-20T08:00:00Z" },
];

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Step 1: get match records
      const { data: matchRows } = await supabase
        .from("matches")
        .select("id, matched_user_id, matched_at")
        .eq("user_id", user.id)
        .order("matched_at", { ascending: false });

      if (!matchRows || matchRows.length === 0) { setLoading(false); return; }

      // Step 2: load profiles for matched users
      const matchedIds = matchRows.map((m) => m.matched_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, age, city, bio")
        .in("id", matchedIds);

      const profileMap: Record<string, Omit<Match, "matched_at">> = {};
      profiles?.forEach((p) => { profileMap[p.id] = p; });

      // Step 3: combine — use matched_user_id as id so chat URL is correct
      setMatches(
        matchRows.map((m) => ({
          id: m.matched_user_id,           // ← this is the correct user ID for chat
          full_name: profileMap[m.matched_user_id]?.full_name || "Unknown",
          age: profileMap[m.matched_user_id]?.age || 0,
          city: profileMap[m.matched_user_id]?.city || "",
          bio: profileMap[m.matched_user_id]?.bio || "",
          matched_at: m.matched_at,
        }))
      );
      setLoading(false);
    }
    loadMatches();
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Your Matches</h1>
          <p className="text-white/40 text-sm">{matches.length} people liked you back!</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-red-400/20 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-3">No matches yet</h2>
            <p className="text-white/40 mb-8">Keep discovering and liking profiles to get matches!</p>
            <Link href="/discover" className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block">
              Discover People
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* New matches row */}
            <div className="mb-6">
              <h2 className="text-white/60 text-sm font-medium mb-3">New Matches</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {matches.slice(0, 5).map((match, i) => (
                  <Link key={match.id} href={`/chat/${match.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-red-400"
                      style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})` }}
                    >
                      {getInitials(match.full_name)}
                    </div>
                    <span className="text-white/60 text-xs truncate w-16 text-center">
                      {match.full_name.split(" ")[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Match list */}
            <h2 className="text-white/60 text-sm font-medium mb-3">All Matches</h2>
            {matches.map((match, i) => (
              <Link
                key={match.id}
                href={`/chat/${match.id}`}
                className="profile-card rounded-2xl p-4 flex items-center gap-4 block"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})` }}
                >
                  {getInitials(match.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{match.full_name}, {match.age}</h3>
                    <span className="text-white/30 text-xs">{timeAgo(match.matched_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs mb-1">
                    <MapPin size={10} />
                    <span>{match.city}</span>
                  </div>
                  <p className="text-white/40 text-sm truncate">{match.bio}</p>
                </div>
                <div className="btn-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

