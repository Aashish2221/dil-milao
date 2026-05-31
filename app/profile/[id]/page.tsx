"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Heart, MoreVertical, ShieldX, Flag } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import ReportModal from "@/components/ReportModal";

type Profile = {
  full_name: string;
  age: number;
  city: string;
  state: string;
  bio: string;
  interests: string[];
  photo_url: string;
  gender: string;
  religion: string;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgErr, setImgErr] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: userData }, { data }, { data: extraPhotos }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("profiles")
          .select("full_name, age, city, state, bio, interests, photo_url, gender, religion")
          .eq("id", id)
          .single(),
        supabase
          .from("profile_photos")
          .select("photo_url, sort_order")
          .eq("user_id", id)
          .order("sort_order", { ascending: true }),
      ]);
      setMyUserId(userData.user?.id ?? null);
      setProfile(data);
      if (extraPhotos?.length) {
        setPhotos(extraPhotos.map((p: { photo_url: string }) => p.photo_url));
      } else if (data?.photo_url) {
        setPhotos([data.photo_url]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleBlock() {
    if (!myUserId || !id) return;
    if (!confirm("Block this person? They won't appear in your feed and can't contact you.")) return;
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.from("blocks").insert({ blocker_id: myUserId, blocked_id: id });
    router.back();
  }

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
  const isOwnProfile = myUserId === id;

  return (
    <div className="min-h-screen pb-8" style={{ background: "#0a0a0f" }}>
      {showReport && (
        <ReportModal
          reportedId={id as string}
          reportedName={profile.full_name}
          onClose={() => setShowReport(false)}
          onReported={() => router.back()}
        />
      )}

      {/* Header */}
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold flex-1">{profile.full_name}</h1>

        {!isOwnProfile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-11 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[150px]"
                style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <button
                  onClick={() => { setMenuOpen(false); setShowReport(true); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-white/50 text-sm hover:bg-white/5 transition-colors"
                >
                  <Flag size={14} /> Report
                </button>
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-400 text-sm hover:bg-white/5 transition-colors border-t border-white/5"
                >
                  <ShieldX size={14} /> Block
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Photo carousel */}
        <div className="relative rounded-3xl overflow-hidden mb-4" style={{ height: 400 }}>
          {photos.length > 0 && !imgErr ? (
            <Image
              src={photos[photoIndex]}
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

          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                onClick={() => { setPhotoIndex((i) => Math.max(0, i - 1)); setImgErr(false); }}
              />
              <button
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                onClick={() => { setPhotoIndex((i) => Math.min(photos.length - 1, i + 1)); setImgErr(false); }}
              />
              {/* Dot indicators */}
              <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 z-20 px-4">
                {photos.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className="flex-1 h-0.5 rounded-full transition-all"
                    style={{ background: dotIdx === photoIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)", maxWidth: 40 }}
                  />
                ))}
              </div>
            </>
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
              <span>{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
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
          {profile.religion && (
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm">Religion</span>
              <span className="text-white/70 text-sm">{profile.religion}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-sm">Age</span>
            <span className="text-white/70 text-sm">{profile.age}</span>
          </div>
          {profile.state && (
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm">State</span>
              <span className="text-white/70 text-sm">{profile.state}</span>
            </div>
          )}
          {profile.city && (
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-sm">District</span>
              <span className="text-white/70 text-sm">{profile.city}</span>
            </div>
          )}
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
