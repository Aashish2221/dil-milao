"use client";
import { useState, useEffect } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type LikedProfile = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  photo_url: string;
  religion: string;
  super_like: boolean;
  matched: boolean;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function LikedCard({ profile, idx }: { profile: LikedProfile; idx: number }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link href={`/profile/${profile.id}`} className="block profile-card rounded-2xl overflow-hidden">
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}22, ${AVATAR_COLORS[(idx + 2) % AVATAR_COLORS.length]}22)` }}
      >
        {profile.photo_url && !imgErr ? (
          <Image
            src={profile.photo_url}
            alt={profile.full_name}
            fill
            className="object-cover"
            sizes="200px"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length]})` }}
          >
            {getInitials(profile.full_name)}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {profile.matched && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white btn-primary">
              <Heart size={9} fill="white" /> Matched
            </span>
          )}
          {profile.super_like && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-black" style={{ background: "#facc15" }}>
              ⭐ Super
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">
          {profile.full_name}, {profile.age}
        </h3>
        <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
          <MapPin size={10} />
          <span className="truncate">{profile.city}</span>
        </div>
        {profile.religion && (
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] glass text-white/50 border border-white/10">
            {profile.religion}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function MyLikesPage() {
  const [liked, setLiked] = useState<LikedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all likes I sent
      const { data: likeRows } = await supabase
        .from("likes")
        .select("to_user_id, super_like")
        .eq("from_user_id", user.id)
        .order("created_at", { ascending: false });

      if (!likeRows || likeRows.length === 0) {
        setLoading(false);
        return;
      }

      const toIds = likeRows.map((l) => l.to_user_id);

      // Fetch who liked me back (to detect matches)
      const { data: likedMeBack } = await supabase
        .from("likes")
        .select("from_user_id")
        .eq("to_user_id", user.id)
        .in("from_user_id", toIds);

      const matchedSet = new Set(likedMeBack?.map((l) => l.from_user_id) || []);

      // Fetch their profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, age, city, photo_url, religion")
        .in("id", toIds);

      const profileMap: Record<string, typeof profiles extends (infer T)[] | null ? T : never> = {};
      profiles?.forEach((p) => { profileMap[p.id] = p; });

      const superSet = new Set(likeRows.filter((l) => l.super_like).map((l) => l.to_user_id));

      const result: LikedProfile[] = toIds
        .filter((id) => profileMap[id])
        .map((id) => ({
          id,
          full_name: profileMap[id].full_name || "Unknown",
          age: profileMap[id].age || 0,
          city: profileMap[id].city || "",
          photo_url: profileMap[id].photo_url || "",
          religion: profileMap[id].religion || "",
          super_like: superSet.has(id),
          matched: matchedSet.has(id),
        }));

      setLiked(result);
      setMatchedCount(result.filter((p) => p.matched).length);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Likes</h1>
          <p className="text-white/40 text-sm">
            {loading ? "Loading..." : liked.length === 0
              ? "You haven't liked anyone yet"
              : `${liked.length} liked • ${matchedCount} matched`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : liked.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-red-400/30" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">No likes yet</h2>
            <p className="text-white/40 text-sm mb-8">Start swiping to see who you&apos;ve liked!</p>
            <Link href="/discover" className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block">
              Start Discovering
            </Link>
          </div>
        ) : (
          <>
            {/* Matched section */}
            {matchedCount > 0 && (
              <div className="mb-5">
                <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Heart size={12} fill="#ff6b6b" className="text-red-400" /> Mutual Matches ({matchedCount})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {liked.filter((p) => p.matched).map((p, i) => (
                    <LikedCard key={p.id} profile={p} idx={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Waiting section */}
            {liked.filter((p) => !p.matched).length > 0 && (
              <div>
                <h2 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Star size={12} className="text-white/40" /> Waiting ({liked.filter((p) => !p.matched).length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {liked.filter((p) => !p.matched).map((p, i) => (
                    <LikedCard key={p.id} profile={p} idx={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
