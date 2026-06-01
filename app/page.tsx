import Link from "next/link";
import { Heart, Star, Shield, Zap, Users, MessageCircle, MapPin, Check, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import StickySignupBar from "@/components/StickySignupBar";

export const metadata: Metadata = {
  title: "Dil Milao — Indian Dating App | Find Your Match",
  description: "India's modern dating app for ages 18–30. Connect with genuine Indians, filter by state/city/religion, and find real love. Free to join. 2 lakh+ users.",
  keywords: ["Indian dating app", "dating app India", "dil milao", "Indian matchmaking", "dating site India", "meet Indian singles", "Hindi dating app", "shaadi app"],
  alternates: { canonical: "https://dil-milao.vercel.app" },
  openGraph: {
    title: "Dil Milao — Find Your Dil Ka Rishta",
    description: "India's modern dating app. Filter by state, city, religion & age. Real connections, Indian values. Free forever.",
    url: "https://dil-milao.vercel.app",
    siteName: "Dil Milao",
    images: [{ url: "https://dil-milao.vercel.app/og-image.png", width: 1200, height: 630, alt: "Dil Milao — Indian Dating App" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dil Milao — Indian Dating App",
    description: "Find your perfect match. India's modern dating app for genuine connections.",
    images: ["https://dil-milao.vercel.app/og-image.png"],
  },
};

const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Pune",
    text: "Met my now-boyfriend here in just 2 weeks. Genuine profiles, no fake bots!",
    rating: 5,
  },
  {
    name: "Rahul M.",
    city: "Bangalore",
    text: "Love the filter by state — found someone from my hometown. We're meeting next month!",
    rating: 5,
  },
  {
    name: "Ananya K.",
    city: "Hyderabad",
    text: "Finally an Indian dating app that respects privacy and values. 10/10 would recommend.",
    rating: 5,
  },
];

const FEATURES = [
  {
    icon: <Shield size={32} className="text-red-400" />,
    title: "Verified Profiles",
    desc: "Phone + photo verification so you meet real people, not fake accounts.",
  },
  {
    icon: <Heart size={32} className="text-red-400" fill="#ff6b6b" />,
    title: "Smart Matching",
    desc: "Filter by state, city, religion, age and interests — not just looks.",
  },
  {
    icon: <MessageCircle size={32} className="text-red-400" />,
    title: "Private Chat",
    desc: "Chat only when both of you match. Safe, private, and fun messaging.",
  },
  {
    icon: <Users size={32} className="text-red-400" />,
    title: "Indian Community",
    desc: "Built specifically for young Indians who understand our culture and values.",
  },
  {
    icon: <Zap size={32} className="text-red-400" />,
    title: "Boost Feature",
    desc: "Get 10x more visibility for just ₹49. Appear at the top of everyone's feed.",
  },
  {
    icon: <Star size={32} className="text-red-400" />,
    title: "Premium Perks",
    desc: "See who liked you, unlimited swipes, and priority support from ₹199/month.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Heart className="heartbeat text-red-400" size={28} fill="#ff6b6b" />
          <span className="text-2xl font-bold gradient-text">Dil Milao</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-5 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup" className="btn-primary px-5 py-2 rounded-full text-sm font-semibold text-white">
            Join Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12 fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-orange-300 mb-4">
          <TrendingUp size={14} />
          <span>🔥 <strong>1,200+ new profiles</strong> joined this week</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="text-white">Find Your</span>
          <br />
          <span className="gradient-text">Dil Ka Rishta</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-6">
          Connect with genuine Indians aged 18–30. Modern dating, real connections, Indian values.
        </p>
        {/* City trust row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-white/35 text-xs">
          {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Jaipur"].map((city) => (
            <span key={city} className="flex items-center gap-1">
              <MapPin size={9} />{city}
            </span>
          ))}
          <span className="text-white/20">& 500+ more cities</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary px-8 py-4 rounded-full text-lg font-bold text-white inline-flex items-center gap-2 heartbeat">
            <Heart size={20} fill="white" /> Join Free — Find Matches Now
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-full text-lg font-medium glass text-white/80 hover:text-white transition-colors">
            Already have an account
          </Link>
        </div>
        <p className="text-white/30 text-sm mt-5">No credit card • Takes 2 minutes • 100% free</p>
      </section>

      {/* Floating profile cards */}
      <section className="px-6 pb-16 overflow-hidden">
        <div className="max-w-sm mx-auto flex gap-4 justify-center items-end">
          {[
            { name: "Priya, 23", city: "Mumbai", color: "#ff6b6b", rotate: "-4deg", mt: "0px" },
            { name: "Amit, 26", city: "Delhi", color: "#f9ca24", rotate: "0deg", mt: "-20px" },
            { name: "Neha, 24", city: "Bangalore", color: "#6b9eff", rotate: "4deg", mt: "0px" },
          ].map((card) => (
            <div
              key={card.name}
              className="profile-card rounded-2xl p-4 flex-1 text-center"
              style={{ transform: `rotate(${card.rotate})`, marginTop: card.mt }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${card.color}88, ${card.color}44)`, border: `2px solid ${card.color}66` }}
              >
                {card.name[0]}
              </div>
              <p className="text-white text-xs font-semibold">{card.name}</p>
              <p className="text-white/40 text-xs flex items-center justify-center gap-0.5 mt-0.5">
                <MapPin size={9} />{card.city}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-full text-sm font-semibold text-white">
            <Heart size={14} fill="white" /> 3 new matches today!
          </div>
        </div>
      </section>

      {/* Live activity ticker */}
      <section className="pb-10 overflow-hidden">
        <div className="relative">
          <div className="flex gap-6 animate-marquee whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
            {[
              "💕 Rahul from Delhi matched with Priya",
              "🌟 Sneha from Mumbai got 18 likes today",
              "💬 Arjun & Kavya started chatting",
              "❤️ Riya from Bangalore found her match",
              "🎉 Vikram joined from Hyderabad",
              "💕 Ananya from Pune matched with Rohit",
              "🌟 Meera from Chennai got 24 likes today",
              "💬 Siddharth & Pooja started chatting",
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-white/40 text-sm flex-shrink-0">
                {item}
                <span className="text-white/15 mx-2">•</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              "💕 Rahul from Delhi matched with Priya",
              "🌟 Sneha from Mumbai got 18 likes today",
              "💬 Arjun & Kavya started chatting",
              "❤️ Riya from Bangalore found her match",
              "🎉 Vikram joined from Hyderabad",
              "💕 Ananya from Pune matched with Rohit",
              "🌟 Meera from Chennai got 24 likes today",
              "💬 Siddharth & Pooja started chatting",
            ].map((item, i) => (
              <span key={`b-${i}`} className="inline-flex items-center gap-2 text-white/40 text-sm flex-shrink-0">
                {item}
                <span className="text-white/15 mx-2">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3 md:gap-6 text-center">
          {[
            { number: "2L+", label: "Active Users" },
            { number: "50K+", label: "Happy Couples" },
            { number: "4.8★", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 md:p-6">
              <div className="text-2xl md:text-4xl font-extrabold gradient-text mb-1">{stat.number}</div>
              <div className="text-white/50 text-xs md:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14">
            Why <span className="gradient-text">Dil Milao?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="profile-card rounded-2xl p-6">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-14">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Sign up free, add your photos, bio and interests in 2 minutes." },
              { step: "02", title: "Discover & Match", desc: "Browse profiles. Like someone — if they like you back, it's a match!" },
              { step: "03", title: "Chat & Meet", desc: "Start chatting with your matches. Plan your first date!" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full btn-primary flex items-center justify-center text-2xl font-bold text-white mb-4">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14">
            Real <span className="gradient-text">Love Stories</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="profile-card rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400" fill="#facc15" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full btn-primary flex items-center justify-center text-xs font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/40 text-xs flex items-center gap-0.5">
                      <MapPin size={9} />{t.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium teaser */}
      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto" style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)", border: "1px solid rgba(249,202,36,0.25)", borderRadius: "1.5rem", padding: "2.5rem 2rem" }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
            Start with <span style={{ color: "#f9ca24" }}>₹5 Trial</span>
          </h2>
          <div className="space-y-3 mb-8">
            {[
              "See exactly who liked your profile",
              "Unlimited swipes every day",
              "Super likes to stand out",
              "Boost visibility 10x with Boost credits",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,202,36,0.2)", border: "1px solid rgba(249,202,36,0.4)" }}>
                  <Check size={11} style={{ color: "#f9ca24" }} />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/signup" className="btn-primary px-8 py-3 rounded-full text-white font-bold inline-flex items-center gap-2">
              Try Premium — ₹5 for 3 days
            </Link>
            <p className="text-white/30 text-xs mt-3">No auto-renewal. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12">
          <Heart size={48} className="text-red-400 mx-auto mb-6 heartbeat" fill="#ff6b6b" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your match is already here.
          </h2>
          <p className="text-white/50 mb-3">Join 2 lakh+ Indians already on Dil Milao. 100% free.</p>
          <p className="text-orange-300/70 text-sm mb-8">⏳ New profiles from your city join every day — don&apos;t miss them.</p>
          <Link href="/signup" className="btn-primary px-10 py-4 rounded-full text-lg font-bold text-white inline-block">
            Create Free Account
          </Link>
          <p className="text-white/25 text-xs mt-4">2 minutes to set up • No credit card needed</p>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <StickySignupBar />

      {/* Marquee keyframe */}
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10 pb-24 md:pb-10">
        <div className="max-w-4xl mx-auto space-y-6 text-white/30 text-sm">
          {/* City links for SEO */}
          <div className="text-center">
            <p className="text-white/20 text-xs mb-3 uppercase tracking-wider">Dating App by City</p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[
                ["mumbai", "Mumbai"],
                ["delhi", "Delhi"],
                ["bangalore", "Bangalore"],
                ["hyderabad", "Hyderabad"],
                ["pune", "Pune"],
                ["chennai", "Chennai"],
                ["kolkata", "Kolkata"],
                ["jaipur", "Jaipur"],
                ["ahmedabad", "Ahmedabad"],
                ["lucknow", "Lucknow"],
                ["chandigarh", "Chandigarh"],
                ["surat", "Surat"],
              ].map(([slug, name]) => (
                <Link key={slug} href={`/city/${slug}`} className="hover:text-white/60 transition-colors">
                  Dating in {name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-red-400" fill="#ff6b6b" />
              <span className="font-semibold text-white/50">Dil Milao</span>
            </div>
            <div className="flex gap-6">
              <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/login" className="hover:text-white/60 transition-colors">Login</Link>
            </div>
            <p>© 2026 Dil Milao. Made with ❤️ for India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
