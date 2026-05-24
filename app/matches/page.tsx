"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, MapPin, MoreVertical, UserX, ShieldX, Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import ReportModal from "@/components/ReportModal";
import { createClient } from "@/lib/supabase";

type Match = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  bio: string;
  photo_url: string;
  matched_at: string;
  unread: number;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function Avatar({
  match,
  size,
  colorIdx,
}: {
  match: Match;
  size: number;
  colorIdx: number;
}) {
  const [err, setErr] = useState(false);
  const sizeClass = size === 64 ? "w-16 h-16 text-xl" : "w-14 h-14 text-lg";
  if (match.photo_url && !err) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 relative`}>
        <Image
          src={match.photo_url}
          alt={match.full_name}
          fill
          className="object-cover"
          sizes="64px"
          onError={() => setErr(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(colorIdx + 1) % AVATAR_COLORS.length]})` }}
    >
      {getInitials(match.full_name)}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function MatchMenu({
  matchId,
  onUnmatch,
  onBlock,
  onReport,
}: {
  matchId: string;
  onUnmatch: (id: string) => void;
  onBlock: (id: string) => void;
  onReport: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors flex-shrink-0"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[160px]"
          style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={(e) => { e.preventDefault(); setOpen(false); onUnmatch(matchId); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-orange-400 text-sm hover:bg-white/5 transition-colors"
          >
            <UserX size={15} /> Unmatch
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setOpen(false); onBlock(matchId); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-red-400 text-sm hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <ShieldX size={15} /> Block
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setOpen(false); onReport(matchId); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-white/40 text-sm hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <Flag size={15} /> Report
          </button>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    async function loadMatches() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMyUserId(user.id);

      const { data: matchRows } = await supabase
        .from("matches")
        .select("id, matched_user_id, matched_at")
        .eq("user_id", user.id)
        .order("matched_at", { ascending: false });

      if (!matchRows || matchRows.length === 0) { setLoading(false); return; }

      const matchedIds = matchRows.map((m) => m.matched_user_id);

      const [{ data: profiles }, { data: unreadMsgs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, age, city, bio, photo_url")
          .in("id", matchedIds),
        supabase
          .from("messages")
          .select("sender_id")
          .eq("receiver_id", user.id)
          .eq("read", false),
      ]);

      const profileMap: Record<string, Omit<Match, "matched_at" | "unread">> = {};
      profiles?.forEach((p) => { profileMap[p.id] = p; });

      const unreadMap: Record<string, number> = {};
      unreadMsgs?.forEach((m) => {
        unreadMap[m.sender_id] = (unreadMap[m.sender_id] || 0) + 1;
      });

      setMatches(
        matchRows.map((m) => ({
          id: m.matched_user_id,
          full_name: profileMap[m.matched_user_id]?.full_name || "Unknown",
          age: profileMap[m.matched_user_id]?.age || 0,
          city: profileMap[m.matched_user_id]?.city || "",
          bio: profileMap[m.matched_user_id]?.bio || "",
          photo_url: profileMap[m.matched_user_id]?.photo_url || "",
          matched_at: m.matched_at,
          unread: unreadMap[m.matched_user_id] || 0,
        }))
      );
      setLoading(false);
    }
    loadMatches();
  }, []);

  async function removeMatchFromDB(otherId: string) {
    if (!myUserId) return;
    const supabase = createClient();
    // Delete both directions of the match
    await supabase.from("matches").delete()
      .or(`and(user_id.eq.${myUserId},matched_user_id.eq.${otherId}),and(user_id.eq.${otherId},matched_user_id.eq.${myUserId})`);
    // Delete the conversation
    await supabase.from("messages").delete()
      .or(`and(sender_id.eq.${myUserId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myUserId})`);
  }

  async function handleUnmatch(otherId: string) {
    if (!confirm("Unmatch with this person? Your conversation will also be deleted.")) return;
    await removeMatchFromDB(otherId);
    setMatches((prev) => prev.filter((m) => m.id !== otherId));
  }

  function handleReport(otherId: string) {
    const match = matches.find((m) => m.id === otherId);
    if (match) setReportTarget({ id: otherId, name: match.full_name });
  }

  async function handleBlock(otherId: string) {
    if (!confirm("Block this person? They won't be able to contact you and you won't see them again.")) return;
    if (!myUserId) return;
    const supabase = createClient();
    // Block them
    await supabase.from("blocks").insert({ blocker_id: myUserId, blocked_id: otherId });
    // Also remove match + messages
    await removeMatchFromDB(otherId);
    setMatches((prev) => prev.filter((m) => m.id !== otherId));
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      {reportTarget && (
        <ReportModal
          reportedId={reportTarget.id}
          reportedName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}

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
                    <div className="border-2 border-red-400 rounded-full">
                      <Avatar match={match} size={64} colorIdx={i} />
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
              <div key={match.id} className="profile-card rounded-2xl p-4 flex items-center gap-4">
                <Avatar match={match} size={56} colorIdx={i} />

                <Link href={`/chat/${match.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${match.unread > 0 ? "text-white" : "text-white/80"}`}>
                      {match.full_name}, {match.age}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {match.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                          {match.unread > 99 ? "99+" : match.unread}
                        </span>
                      )}
                      <span className="text-white/30 text-xs">{timeAgo(match.matched_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs mb-1">
                    <MapPin size={10} />
                    <span>{match.city}</span>
                  </div>
                  <p className={`text-sm truncate ${match.unread > 0 ? "text-white/60 font-medium" : "text-white/40"}`}>{match.bio}</p>
                </Link>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/chat/${match.id}`}
                    className="btn-primary w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <MessageCircle size={18} className="text-white" />
                  </Link>
                  <MatchMenu
                    matchId={match.id}
                    onUnmatch={handleUnmatch}
                    onBlock={handleBlock}
                    onReport={handleReport}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
