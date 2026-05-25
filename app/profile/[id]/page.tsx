"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Heart, Star } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

type Profile = {
  full_name: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photo_url: string;
  gender: string;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("full_name, age, city, bio, interests, photo_url, gender")
        .eq("id", id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <p className="text-white/40">Profile not found.</p>
    </div>
  );

  const initials = getInitials(profile.full_name || "?");

  return (
    <div className="min-h-screen pb-8" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold">{profile.full_name}</h1>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Photo */}
        <div className="relative rounded-3xl overflow-hidden mb-4" style={{ height: 400 }}>
          {profile.photo_url && !imgErr ? (
            <Image
              src={profile.photo_url}
              alt={profile.full_name}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw, 448px"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[0]}66, ${AVATAR_COLORS[2]}66)` }}
            >
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center text-6xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[0]}, ${AVATAR_COLORS[1]})` }}
              >
                {initials}
              </div>
            </div>
          )}
          {/* Bottom overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-16"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
          >
            <h2 className="text-2xl font-bold text-white">
              {profile.full_name}, <span style={{ color: "#ff6b6b" }}>{profile.age}</span>
            </h2>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
              <MapPin size={13} />
              <span>{profile.city}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="glass rounded-2xl p-4 mb-4">
            <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-4">
            <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span key={interest} className="px-3 py-1.5 rounded-full text-sm glass text-white/70 border border-white/10">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="glass rounded-2xl p-4 mb-4 space-y-3">
          {profile.gender && (
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm">Gender</span>
              <span className="text-white/70 text-sm">{profile.gender}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Age</span>
            <span className="text-white/70 text-sm">{profile.age}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">City</span>
            <span className="text-white/70 text-sm">{profile.city}</span>
          </div>
        </div>

        {/* Back to discover */}
        <button
          onClick={() => router.back()}
          className="btn-primary w-full py-3 rounded-2xl text-white font-semibold flex items-center justify-center gap-2"
        >
          <Heart size={18} fill="white" /> Back to Discovering
        </button>
      </div>
    </div>
  );
}
