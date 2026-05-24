"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Edit3, LogOut, Crown, Heart, Zap, Settings } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

type Profile = {
  full_name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  email: string;
  photo_url: string;
};

type Stats = {
  matches: number;
  likesSent: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ matches: 0, likesSent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Load profile data
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || "Your Name",
          age: 0,
          city: "",
          bio: "",
          interests: [],
          email: user.email || "",
          photo_url: "",
        });
      }

      // Load real stats from Supabase
      const [{ count: matchCount }, { count: likesCount }] = await Promise.all([
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("from_user_id", user.id),
      ]);

      setStats({
        matches: matchCount || 0,
        likesSent: likesCount || 0,
      });

      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen pb-24 app-page" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            {profile?.photo_url ? (
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-red-400/30 mx-auto">
                <Image
                  src={profile.photo_url}
                  alt={profile.full_name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border-4 border-red-400/30"
                style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a24)" }}
              >
                {initials}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white">
            {profile?.full_name}
            {profile?.age ? <span className="gradient-text">, {profile.age}</span> : null}
          </h1>
          {profile?.city && (
            <div className="flex items-center justify-center gap-1 text-white/40 text-sm mt-1">
              <MapPin size={14} />
              <span>{profile.city}</span>
            </div>
          )}
        </div>

        {/* Real stats from Supabase */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Matches", value: stats.matches, icon: <Heart size={16} fill="#ff6b6b" className="text-red-400" /> },
            { label: "Likes Sent", value: stats.likesSent, icon: <Zap size={16} className="text-yellow-400" /> },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-white font-bold text-2xl">{s.value}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="glass rounded-2xl p-5 mb-4">
          <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">About Me</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            {profile?.bio || "No bio yet. Tap Edit Profile to add one!"}
          </p>
        </div>

        {/* Interests */}
        {profile?.interests && profile.interests.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-4">
            <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 rounded-full text-xs glass text-white/60 border border-white/10">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button
            onClick={() => router.push("/setup")}
            className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:border-white/20 transition-colors text-left"
          >
            <Edit3 size={18} className="text-white/50" />
            <span className="text-white/70 font-medium">Edit Profile</span>
          </button>

          <button
            onClick={() => router.push("/premium")}
            className="w-full rounded-xl p-4 flex items-center gap-3 text-left"
            style={{ background: "linear-gradient(135deg, rgba(249,202,36,0.1), rgba(238,90,36,0.1))", border: "1px solid rgba(249,202,36,0.2)" }}
          >
            <Crown size={18} className="text-yellow-400" />
            <div className="flex-1">
              <span className="text-white font-medium">Upgrade to Premium</span>
              <p className="text-white/30 text-xs">Unlimited likes, see who liked you</p>
            </div>
            <span className="text-yellow-400 text-sm font-semibold">₹199/mo</span>
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:border-white/20 transition-colors text-left"
          >
            <Settings size={18} className="text-white/50" />
            <span className="text-white/70 font-medium">Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:border-red-400/20 transition-colors text-left"
          >
            <LogOut size={18} className="text-red-400/60" />
            <span className="text-red-400/60 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
