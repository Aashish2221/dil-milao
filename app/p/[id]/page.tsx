import { createClient } from "@supabase/supabase-js";
import { Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

async function getProfile(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("profiles")
    .select("full_name, age, city, state, bio, interests, photo_url")
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return { title: "Profile | Dil Milao" };

  const name = profile.full_name ?? "Someone";
  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const desc = `${name}${profile.age ? `, ${profile.age}` : ""}${location ? ` from ${location}` : ""} is on Dil Milao. Join free and find your match!`;

  return {
    title: `${name} on Dil Milao`,
    description: desc,
    openGraph: {
      title: `${name} on Dil Milao`,
      description: desc,
      url: `https://dil-milao.vercel.app/p/${id}`,
      siteName: "Dil Milao",
      locale: "en_IN",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} on Dil Milao`,
      description: desc,
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) notFound();

  const name = profile.full_name ?? "Someone";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const interests: string[] = profile.interests ?? [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "linear-gradient(135deg, #0a0a0f, #1a0a1e)" }}>
      {/* Glow blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(255,107,107,0.08)", filter: "blur(120px)" }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(238,90,36,0.08)", filter: "blur(100px)" }} />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Heart size={28} fill="#ff6b6b" className="text-red-400 heartbeat" />
        <span className="text-2xl font-bold gradient-text">Dil Milao</span>
      </Link>

      {/* Profile card */}
      <div className="w-full max-w-sm glass rounded-3xl overflow-hidden">
        {/* Photo */}
        <div className="relative w-full aspect-[4/5] bg-white/5">
          {profile.photo_url ? (
            <Image
              src={profile.photo_url}
              alt={name}
              fill
              className="object-cover"
              sizes="400px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/30">
              {initials}
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.3) 50%, transparent 100%)" }} />
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-white text-3xl font-bold">
              {name}{profile.age ? `, ${profile.age}` : ""}
            </h1>
            {location && (
              <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                <MapPin size={12} />{location}
              </p>
            )}
          </div>
        </div>

        {/* Bio & interests */}
        <div className="p-5 space-y-4">
          {profile.bio && (
            <p className="text-white/70 text-sm leading-relaxed">{profile.bio}</p>
          )}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.slice(0, 8).map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full text-white/60" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="pt-2 space-y-3">
            <Link
              href="/signup"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base"
            >
              <Heart size={18} fill="white" />
              Match with {firstName} — Join Free
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-3 rounded-2xl text-white/50 text-sm hover:text-white/80 transition-colors glass"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>

      <p className="text-white/20 text-xs mt-8 text-center">
        Dil Milao · India&apos;s modern dating app · Made with ❤️
      </p>
    </div>
  );
}
