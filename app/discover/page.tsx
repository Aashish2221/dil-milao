"use client";
import { useState, useEffect } from "react";
import { Heart, X, Star, MapPin, Zap } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo_url: string;
};

const DEMO_PROFILES: Profile[] = [
  {
    id: "1",
    full_name: "Priya Sharma",
    age: 24,
    city: "Mumbai",
    bio: "Software engineer who loves Bollywood music and weekend treks. Looking for someone to explore the city with!",
    interests: ["Travel", "Bollywood", "Fitness", "Coffee", "Trekking", "Technology"],
    photo_url: "",
  },
  {
    id: "2",
    full_name: "Ananya Patel",
    age: 22,
    city: "Bangalore",
    bio: "Graphic designer, coffee addict, dog lover. If you love art and long conversations, we'll get along perfectly!",
    interests: ["Art", "Coffee", "Photography", "Music", "Reading", "Yoga"],
    photo_url: "",
  },
  {
    id: "3",
    full_name: "Kavya Reddy",
    age: 26,
    city: "Hyderabad",
    bio: "Doctor by day, foodie by night. Biryani > everything else. Loves exploring new restaurants.",
    interests: ["Cooking", "Travel", "Movies", "Dancing", "Fitness", "Reading"],
    photo_url: "",
  },
  {
    id: "4",
    full_name: "Meera Nair",
    age: 23,
    city: "Chennai",
    bio: "Classical dancer and startup enthusiast. Passionate about Indian culture and modern tech.",
    interests: ["Dancing", "Technology", "Art", "Yoga", "Photography", "Cricket"],
    photo_url: "",
  },
];

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

// Demo profiles have ids like "1","2" which are not real UUIDs
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isRealProfile(id: string) {
  return UUID_REGEX.test(id);
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>(DEMO_PROFILES);
  const [current, setCurrent] = useState(0);
  const [action, setAction] = useState<"like" | "skip" | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchAlert, setMatchAlert] = useState(false);
  const FREE_LIKES = 10;

  useEffect(() => {
    async function loadProfiles() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get today's like count from Supabase (for free limit)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: todayLikes } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("from_user_id", user.id)
        .gte("created_at", todayStart.toISOString());
      if (todayLikes) setLikeCount(todayLikes);

      // Get IDs the user already liked
      const { data: likedRows } = await supabase
        .from("likes")
        .select("to_user_id")
        .eq("from_user_id", user.id);

      const alreadyLikedIds = likedRows?.map((l) => l.to_user_id) || [];

      // Build query — exclude self and already-liked users
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .limit(20);

      if (alreadyLikedIds.length > 0) {
        query = query.not("id", "in", `(${alreadyLikedIds.join(",")})`);
      }

      const { data } = await query;
      if (data && data.length > 0) setProfiles(data);
    }
    loadProfiles();
  }, []);

  async function handleAction(type: "like" | "skip") {
    if (type === "like" && !isPremium && likeCount >= FREE_LIKES) return;
    setAction(type);

    if (type === "like" && userId && profiles[current]) {
      const toUserId = profiles[current].id;

      // Only save to Supabase if this is a real profile (valid UUID), not demo data
      if (isRealProfile(toUserId)) {
        const supabase = createClient();

        await supabase.from("likes").insert({
          from_user_id: userId,
          to_user_id: toUserId,
        });

        // Check if it's a mutual match
        const { data: mutualLike } = await supabase
          .from("likes")
          .select("id")
          .eq("from_user_id", toUserId)
          .eq("to_user_id", userId)
          .maybeSingle();

        if (mutualLike) {
          setMatchAlert(true);
          setTimeout(() => setMatchAlert(false), 3000);
        }
      }

      setLikeCount((c) => c + 1);
    }

    setTimeout(() => {
      setAction(null);
      setCurrent((c) => c + 1);
    }, 400);
  }

  const profile = profiles[current];
  const isDone = current >= profiles.length;
  const isDemo = profile && !isRealProfile(profile.id);

  return (
    <div className="min-h-screen pb-20" style={{ background: "#0a0a0f" }}>
      <Navbar />

      {/* Match Alert */}
      {matchAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 btn-primary px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 shadow-2xl">
          <Heart size={20} fill="white" /> It&apos;s a Match! Check your matches!
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Discover</h1>
            <p className="text-white/40 text-sm">Find your perfect match</p>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs">Likes used</div>
            <div className="text-sm font-semibold">
              <span className="gradient-text">{likeCount}</span>
              <span className="text-white/30">/{isPremium ? "∞" : FREE_LIKES}</span>
            </div>
          </div>
        </div>

        {isDone ? (
          <div className="text-center py-20">
            <Heart size={64} className="text-red-400/30 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;ve seen everyone!</h2>
            <p className="text-white/40 mb-8">Check back later for new profiles, or go Premium for priority access.</p>
            <button onClick={() => setCurrent(0)} className="btn-primary px-8 py-3 rounded-full text-white font-semibold">
              Start Over
            </button>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div
              className={`profile-card rounded-3xl overflow-hidden mb-6 transition-all duration-300 ${
                action === "like" ? "translate-x-8 rotate-3 opacity-70" :
                action === "skip" ? "-translate-x-8 -rotate-3 opacity-70" : ""
              }`}
            >
              {/* Photo / Avatar */}
              <div
                className="h-72 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[current % AVATAR_COLORS.length]}22, ${AVATAR_COLORS[(current + 2) % AVATAR_COLORS.length]}22)` }}
              >
                {profile.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[current % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(current + 1) % AVATAR_COLORS.length]})` }}
                  >
                    {getInitials(profile.full_name)}
                  </div>
                )}
                {/* Like/Skip overlay */}
                {action === "like" && (
                  <div className="absolute top-6 left-6 rotate-[-20deg] border-4 border-green-400 text-green-400 font-extrabold text-2xl px-4 py-1 rounded-xl">
                    LIKE
                  </div>
                )}
                {action === "skip" && (
                  <div className="absolute top-6 right-6 rotate-[20deg] border-4 border-red-400 text-red-400 font-extrabold text-2xl px-4 py-1 rounded-xl">
                    SKIP
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    {profile.full_name}, <span className="gradient-text">{profile.age}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-white/40 text-sm mb-3">
                  <MapPin size={14} />
                  <span>{profile.city}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests?.map((interest) => (
                    <span key={interest} className="px-3 py-1 rounded-full text-xs glass text-white/60">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo notice */}
            {isDemo && (
              <div className="mb-4 px-4 py-2 rounded-xl text-center text-xs text-yellow-400/70 glass border border-yellow-400/10">
                Sample profile — invite friends to see real matches!
              </div>
            )}

            {/* Action Buttons */}
            {!isPremium && likeCount >= FREE_LIKES ? (
              <div className="glass rounded-2xl p-5 text-center">
                <Zap size={32} className="text-yellow-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Daily limit reached!</p>
                <p className="text-white/40 text-sm mb-4">Upgrade to Premium for unlimited likes</p>
                <a href="/premium" className="btn-primary px-8 py-3 rounded-full text-white font-semibold inline-block">
                  Go Premium ₹199/mo
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => handleAction("skip")}
                  className="skip-btn w-16 h-16 rounded-full flex items-center justify-center"
                >
                  <X size={28} className="text-white/60" />
                </button>
                <button
                  onClick={() => handleAction("like")}
                  className="heart-btn w-20 h-20 rounded-full flex items-center justify-center"
                >
                  <Heart size={36} fill="white" className="text-white" />
                </button>
                <button className="skip-btn w-16 h-16 rounded-full flex items-center justify-center">
                  <Star size={24} className="text-yellow-400" />
                </button>
              </div>
            )}

            {/* Progress */}
            <p className="text-center text-white/20 text-xs mt-4">
              {current + 1} of {profiles.length} profiles
            </p>
          </>
        )}
      </div>
    </div>
  );
}
