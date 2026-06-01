import Link from "next/link";
import { Heart, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Dating Tips & Advice for Indians | Dil Milao Blog",
  description: "Expert dating tips, relationship advice, and guides for Indians. Learn how to find love on dating apps, write the perfect profile, and build genuine connections.",
  keywords: ["Indian dating tips", "dating advice India", "relationship tips India", "dating app tips", "how to find love India"],
  alternates: { canonical: "https://dil-milao.vercel.app/blog" },
  openGraph: {
    title: "Dating Tips & Advice for Indians | Dil Milao Blog",
    description: "Expert dating tips and relationship advice for young Indians.",
    url: "https://dil-milao.vercel.app/blog",
    siteName: "Dil Milao",
    locale: "en_IN",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Dating Apps": "rgba(255,107,107,0.15)",
  "Dating Tips": "rgba(107,158,255,0.15)",
  "Relationships": "rgba(107,255,184,0.15)",
  "Safety": "rgba(249,202,36,0.15)",
};

const CATEGORY_TEXT: Record<string, string> = {
  "Dating Apps": "#ff6b6b",
  "Dating Tips": "#6b9eff",
  "Relationships": "#6bffb8",
  "Safety": "#f9ca24",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="heartbeat text-red-400" size={26} fill="#ff6b6b" />
          <span className="text-xl font-bold gradient-text">Dil Milao</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="btn-primary px-4 py-2 rounded-full text-sm font-semibold text-white">Join Free</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Dating <span className="gradient-text">Tips & Advice</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Expert guides for Indians navigating modern dating — from writing the perfect profile to finding a genuine relationship.
          </p>
        </div>

        {/* Featured post */}
        <Link href={`/blog/${featured.slug}`} className="block mb-10 glass rounded-3xl overflow-hidden hover:border-red-400/20 transition-all group" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: CATEGORY_COLORS[featured.category] ?? "rgba(255,255,255,0.1)", color: CATEGORY_TEXT[featured.category] ?? "white" }}>
                {featured.category}
              </span>
              <span className="text-white/25 text-xs flex items-center gap-1"><Clock size={11} />{featured.readTime}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-red-300 transition-colors">
              {featured.title}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">{featured.description}</p>
            <span className="text-red-400 text-sm font-semibold">Read article →</span>
          </div>
        </Link>

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="glass rounded-2xl p-6 hover:border-white/15 transition-all group" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: CATEGORY_COLORS[post.category] ?? "rgba(255,255,255,0.1)", color: CATEGORY_TEXT[post.category] ?? "white" }}>
                  {post.category}
                </span>
                <span className="text-white/25 text-xs flex items-center gap-1"><Clock size={10} />{post.readTime}</span>
              </div>
              <h2 className="text-base font-bold text-white mb-2 group-hover:text-red-300 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-white/40 text-xs leading-relaxed line-clamp-3">{post.description}</p>
              <span className="text-red-400/70 text-xs font-semibold mt-3 inline-block">Read →</span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center glass rounded-3xl p-10">
          <Heart size={36} className="text-red-400 mx-auto mb-4 heartbeat" fill="#ff6b6b" />
          <h2 className="text-2xl font-bold text-white mb-2">Ready to put these tips into action?</h2>
          <p className="text-white/40 text-sm mb-6">Join 2 lakh+ Indians on Dil Milao. Free forever.</p>
          <Link href="/signup" className="btn-primary px-8 py-3 rounded-full text-white font-bold inline-block">
            Find My Match — Join Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-white/25 text-xs">
          <Link href="/" className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" fill="#ff6b6b" />
            <span className="text-white/40">Dil Milao</span>
          </Link>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/signup" className="hover:text-white/50 transition-colors">Sign Up</Link>
          </div>
          <p>© 2026 Dil Milao</p>
        </div>
      </footer>
    </div>
  );
}
