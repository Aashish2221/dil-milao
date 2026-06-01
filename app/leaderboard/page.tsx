"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Users, Gift, Share2, Crown } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

type LeaderEntry = {
  user_id: string;
  full_name: string;
  photo_url: string | null;
  referral_count: number;
  bonus_likes: number;
};

type MyRank = {
  rank: number;
  referral_count: number;
  bonus_likes: number;
} | null;

const PRIZES = [
  { rank: 1, emoji: "🥇", label: "Top Inviter", reward: "100 bonus likes + Gold badge" },
  { rank: 2, emoji: "🥈", label: "Super Inviter", reward: "75 bonus likes + Silver badge" },
  { rank: 3, emoji: "🥉", label: "Great Inviter", reward: "50 bonus likes + Bronze badge" },
];

const RANK_COLORS = ["#f9ca24", "rgba(255,255,255,0.6)", "#cd7f32"];

function Avatar({ name, photo, size = 40 }: { name: string; photo: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  if (photo && !err) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg, #ff6b6b, #ee5a24)", fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      const [{ data: lb }, { data: profile }] = await Promise.all([
        supabase.rpc("get_referral_leaderboard"),
        supabase.from("profiles").select("referral_code, bonus_likes").eq("id", user.id).single(),
      ]);

      const list: LeaderEntry[] = lb ?? [];
      setLeaders(list);
      setReferralCode(profile?.referral_code ?? "");

      const myIndex = list.findIndex((e) => e.user_id === user.id);
      if (myIndex !== -1) {
        setMyRank({ rank: myIndex + 1, referral_count: list[myIndex].referral_count, bonus_likes: list[myIndex].bonus_likes });
      } else {
        // Not in top 20 — fetch own referral count
        const { count } = await supabase
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", user.id);
        if ((count ?? 0) > 0) {
          setMyRank({ rank: 20, referral_count: count ?? 0, bonus_likes: profile?.bonus_likes ?? 0 });
        }
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleShare() {
    const link = `https://dil-milao.vercel.app/join?ref=${referralCode}`;
    const text = `Join me on Dil Milao 💕 Use my link and we both get bonus likes!\n${link}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Join Dil Milao", text, url: link }); } catch {}
    } else {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#0a0a0f" }}>
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <Trophy size={18} className="text-yellow-400" />
        <h1 className="text-white font-semibold">Invite Leaderboard</h1>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-white text-xl font-bold mb-1">Top Inviters This Month</h2>
          <p className="text-white/40 text-sm">Invite friends to climb the ranks and win bonus likes!</p>
        </div>

        {/* Prizes */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Gift size={16} className="text-red-400/70" />
            <span className="text-white font-medium text-sm">Monthly Prizes</span>
          </div>
          <div className="divide-y divide-white/5">
            {PRIZES.map((prize) => (
              <div key={prize.rank} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-2xl">{prize.emoji}</span>
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-semibold">{prize.label}</p>
                  <p className="text-white/40 text-xs">{prize.reward}</p>
                </div>
                <span className="text-white/20 text-xs font-mono">#{prize.rank}</span>
              </div>
            ))}
          </div>
        </section>

        {/* My rank card (if participating) */}
        {myRank && (
          <section className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(238,90,36,0.1))", border: "1px solid rgba(255,107,107,0.2)" }}>
            <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              #{myRank.rank}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">Your Rank</p>
              <p className="text-white/50 text-xs">{myRank.referral_count} friend{myRank.referral_count !== 1 ? "s" : ""} invited · {myRank.bonus_likes} bonus likes earned</p>
            </div>
            <button
              onClick={handleShare}
              className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold flex-shrink-0"
            >
              <Share2 size={13} />
              {copied ? "Copied!" : "Share"}
            </button>
          </section>
        )}

        {/* Leaderboard */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Users size={16} className="text-white/40" />
            <span className="text-white font-medium text-sm">Top Inviters</span>
          </div>

          {leaders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-white/30 text-sm">No referrals yet — be the first!</p>
              <button onClick={handleShare} className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold inline-flex items-center gap-2">
                <Share2 size={14} /> Invite Friends
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaders.map((entry, i) => {
                const isMe = entry.user_id === myUserId;
                const isTop3 = i < 3;
                return (
                  <div
                    key={entry.user_id}
                    className="flex items-center gap-4 px-5 py-3.5"
                    style={isMe ? { background: "rgba(255,107,107,0.06)" } : undefined}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center flex-shrink-0">
                      {isTop3 ? (
                        <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                      ) : (
                        <span className="text-white/30 text-sm font-mono">#{i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={entry.full_name} photo={entry.photo_url} size={38} />
                      {isTop3 && (
                        <Crown size={12} className="absolute -top-1 -right-1" style={{ color: RANK_COLORS[i] }} />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isMe ? "text-red-400" : "text-white/80"}`}>
                        {entry.full_name}{isMe ? " (You)" : ""}
                      </p>
                      <p className="text-white/35 text-xs">{entry.bonus_likes} bonus likes earned</p>
                    </div>

                    {/* Count */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm" style={isTop3 ? { color: RANK_COLORS[i] } : undefined}>
                        {entry.referral_count}
                      </p>
                      <p className="text-white/25 text-xs">friend{entry.referral_count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Share CTA */}
        {referralCode && (
          <button
            onClick={handleShare}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm"
          >
            <Share2 size={16} />
            {copied ? "Link Copied!" : "Share Your Invite Link — Climb the Ranks"}
          </button>
        )}
      </div>
    </div>
  );
}
