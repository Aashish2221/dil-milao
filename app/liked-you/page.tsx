"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Lock, Crown, X, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Liker = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  photo_url: string;
  super_like: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  photo_url: string;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function LikerCard({
  liker,
  colorIdx,
  onLikeBack,
  onPass,
}: {
  liker: Liker;
  colorIdx: number;
  onLikeBack: (l: Liker) => void;
  onPass: (id: string) => void;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="profile-card rounded-2xl overflow-hidden">
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}22, ${AVATAR_COLORS[(colorIdx + 2) % AVATAR_COLORS.length]}22)`,
        }}
      >
        {liker.photo_url && !imgErr ? (
          <Image
            src={liker.photo_url}
            alt={liker.full_name}
            fill
            className="object-cover"
            sizes="200px"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(colorIdx + 1) % AVATAR_COLORS.length]})`,
            }}
          >
            {getInitials(liker.full_name)}
          </div>
        )}
        {liker.super_like && (
          <div className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-bold text-black" style={{ background: "#facc15" }}>
            ⭐ Super
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">
          {liker.full_name}, {liker.age}
        </h3>
        {liker.city && (
          <div className="flex items-center gap-1 text-white/30 text-xs mb-2">
            <MapPin size={10} />
            <span className="truncate">{liker.city}</span>
          </div>
        )}
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={() => onPass(liker.id)}
            className="flex-1 h-9 rounded-xl glass flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => onLikeBack(liker)}
            className="flex-[2] h-9 rounded-xl btn-primary flex items-center justify-center gap-1 text-white text-xs font-semibold"
          >
            <Heart size={13} fill="white" /> Like Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LikedYouPage() {
  const router = useRouter();
  const [likers, setLikers] = useState<Liker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at")
        .eq("id", user.id)
        .single();

      const premiumActive =
        profile?.is_premium === true &&
        (!profile.premium_expires_at ||
          new Date(profile.premium_expires_at) > new Date());
      setIsPremium(premiumActive);

      // Always get total count for the teaser number
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("to_user_id", user.id);
      setTotalCount(count || 0);

      // Fetch liker profiles (full list for premium, 3 for teaser)
      const { data: likeRows } = await supabase
        .from("likes")
        .select("from_user_id, super_like")
        .eq("to_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(premiumActive ? 100 : 3);

      if (!likeRows || likeRows.length === 0) {
        setLoading(false);
        return;
      }

      // For premium: filter out people already liked back
      let fromIds = likeRows.map((l) => l.from_user_id);
      if (premiumActive) {
        const { data: myLikes } = await supabase
          .from("likes")
          .select("to_user_id")
          .eq("from_user_id", user.id);
        const alreadyLiked = new Set(myLikes?.map((l) => l.to_user_id) || []);
        fromIds = fromIds.filter((id) => !alreadyLiked.has(id));
      }

      if (fromIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, age, city, photo_url")
        .in("id", fromIds);

      const profileMap: Record<string, ProfileRow> = {};
      profiles?.forEach((p) => {
        profileMap[p.id] = p;
      });

      const superLikeSet = new Set(
        likeRows.filter((l) => l.super_like).map((l) => l.from_user_id)
      );

      setLikers(
        fromIds
          .filter((id) => profileMap[id])
          .map((id) => ({
            id,
            full_name: profileMap[id].full_name || "Unknown",
            age: profileMap[id].age || 0,
            city: profileMap[id].city || "",
            photo_url: profileMap[id].photo_url || "",
            super_like: superLikeSet.has(id),
          }))
      );
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLikeBack(liker: Liker) {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("likes")
      .insert({ from_user_id: userId, to_user_id: liker.id });
    // DB trigger auto-creates the match
    setLikers((prev) => prev.filter((l) => l.id !== liker.id));
    setMatchAlert(liker.full_name.split(" ")[0]);
    setTimeout(() => setMatchAlert(null), 3000);
  }

  function handlePass(likerId: string) {
    setLikers((prev) => prev.filter((l) => l.id !== likerId));
  }

  return (
    <div className="min-h-screen pb-20 app-page" style={{ background: "#0a0a0f" }}>
      <Navbar />

      {matchAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 btn-primary px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-2xl">
          <Heart size={20} fill="white" /> Matched with {matchAlert}!
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Who Liked You</h1>
            <p className="text-white/40 text-sm">
              {isPremium
                ? likers.length > 0
                  ? `${likers.length} people waiting for you`
                  : "No new likes yet"
                : totalCount > 0
                ? `${totalCount} people liked you — unlock to see who`
                : "Upgrade to see who likes you"}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(249,202,36,0.15), rgba(238,90,36,0.15))",
              border: "1px solid rgba(249,202,36,0.25)",
            }}
          >
            <Crown size={18} className="text-yellow-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : !isPremium ? (
          /* Non-premium: blurred teaser + upsell */
          <div>
            {likers.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5 pointer-events-none select-none">
                {likers.map((liker, i) => (
                  <div
                    key={liker.id}
                    className="profile-card rounded-2xl overflow-hidden"
                    style={{ filter: "blur(6px)", opacity: 0.55 }}
                  >
                    <div
                      className="h-44 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}33, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]}33)`,
                      }}
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 1) % AVATAR_COLORS.length]})`,
                        }}
                      >
                        ?
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="h-4 bg-white/15 rounded mb-2" />
                      <div className="h-3 bg-white/8 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="glass rounded-2xl p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(249,202,36,0.15), rgba(238,90,36,0.15))",
                  border: "1px solid rgba(249,202,36,0.3)",
                }}
              >
                <Lock size={24} className="text-yellow-400" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2">
                {totalCount > 0 ? `${totalCount} people liked your profile!` : "Unlock Your Admirers"}
              </h2>
              <p className="text-white/40 text-sm mb-5">
                Upgrade to Premium to see exactly who liked you and like them back instantly.
              </p>
              <a
                href="/premium"
                className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-flex items-center gap-2"
              >
                <Crown size={16} /> Go Premium — ₹199/mo
              </a>
            </div>
          </div>
        ) : likers.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-red-400/20 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-3">No new likes yet</h2>
            <p className="text-white/40 mb-8">
              Keep your profile active and keep swiping — likes are coming!
            </p>
            <a
              href="/discover"
              className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block"
            >
              Go Discover
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {likers.map((liker, i) => (
              <LikerCard
                key={liker.id}
                liker={liker}
                colorIdx={i}
                onLikeBack={handleLikeBack}
                onPass={handlePass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
