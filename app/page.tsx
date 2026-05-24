"use client";
import Link from "next/link";
import { Heart, Star, Shield, Zap, Users, MessageCircle } from "lucide-react";

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

      {/* Hero Section */}
      <section className="text-center px-6 pt-20 pb-24 fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-orange-300 mb-8">
          <Zap size={14} />
          India&apos;s fastest growing dating app
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="text-white">Find Your</span>
          <br />
          <span className="gradient-text">Dil Ka Rishta</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10">
          Connect with genuine Indians aged 18–30. Modern dating, real connections, Indian values.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary px-8 py-4 rounded-full text-lg font-bold text-white inline-flex items-center gap-2">
            <Heart size={20} fill="white" /> Start Matching — Free
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-full text-lg font-medium glass text-white/80 hover:text-white transition-colors">
            I already have an account
          </Link>
        </div>
        <p className="text-white/30 text-sm mt-5">No credit card needed • Free forever</p>
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
            {[
              {
                icon: <Shield size={32} className="text-red-400" />,
                title: "Verified Profiles",
                desc: "Phone + photo verification so you meet real people, not fake accounts.",
              },
              {
                icon: <Heart size={32} className="text-red-400" fill="#ff6b6b" />,
                title: "Smart Matching",
                desc: "Our AI matches you by interests, location, and compatibility — not just looks.",
              },
              {
                icon: <MessageCircle size={32} className="text-red-400" />,
                title: "Private Chat",
                desc: "Chat only when both of you match. Safe, private, and fun messaging.",
              },
              {
                icon: <Users size={32} className="text-red-400" />,
                title: "Indian Community",
                desc: "Built specifically for young Indians. Understand our culture and values.",
              },
              {
                icon: <Zap size={32} className="text-red-400" />,
                title: "Boost Feature",
                desc: "Get 10x more visibility for just ₹49. Appear at the top of feeds.",
              },
              {
                icon: <Star size={32} className="text-red-400" />,
                title: "Premium Perks",
                desc: "See who liked you, unlimited swipes, and priority support from ₹199/month.",
              },
            ].map((f) => (
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

      {/* CTA */}
      <section className="px-6 pb-24 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-12">
          <Heart size={48} className="text-red-400 mx-auto mb-6 heartbeat" fill="#ff6b6b" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your match?
          </h2>
          <p className="text-white/50 mb-8">Join 2 lakh+ Indians already on Dil Milao. It&apos;s free.</p>
          <Link href="/signup" className="btn-primary px-10 py-4 rounded-full text-lg font-bold text-white inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-white/30 text-sm">
        <p>© 2026 Dil Milao. Made with love for India.</p>
      </footer>
    </div>
  );
}
