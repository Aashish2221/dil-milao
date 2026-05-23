"use client";
import { Crown, Heart, Zap, Eye, Star, Check, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const PLANS = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    color: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    features: [
      { text: "10 likes per day", included: true },
      { text: "Basic matching", included: true },
      { text: "Chat with matches", included: true },
      { text: "See who liked you", included: false },
      { text: "Unlimited likes", included: false },
      { text: "Profile boost", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
    ctaStyle: "bg-white/10 text-white/40 cursor-default",
  },
  {
    name: "Gold",
    price: "₹199",
    period: "/month",
    color: "linear-gradient(145deg, #1a1a2e, #16213e)",
    border: "rgba(249,202,36,0.4)",
    badge: "Most Popular",
    features: [
      { text: "Unlimited likes", included: true },
      { text: "Smart matching AI", included: true },
      { text: "Chat with matches", included: true },
      { text: "See who liked you", included: true },
      { text: "1 Profile Boost/month", included: true },
      { text: "Read receipts", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Get Gold — ₹199/mo",
    ctaStyle: "bg-gradient-to-r from-yellow-400 to-orange-400 text-black",
  },
  {
    name: "Platinum",
    price: "₹399",
    period: "/month",
    color: "linear-gradient(145deg, #1a0a2e, #2e1a3e)",
    border: "rgba(255,107,107,0.4)",
    badge: "Best Value",
    features: [
      { text: "Unlimited likes", included: true },
      { text: "Smart matching AI", included: true },
      { text: "Chat with matches", included: true },
      { text: "See who liked you", included: true },
      { text: "5 Profile Boosts/month", included: true },
      { text: "Read receipts", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Platinum — ₹399/mo",
    ctaStyle: "btn-primary text-white",
  },
];

const BOOSTS = [
  { name: "1 Boost", price: "₹49", desc: "Appear at top for 1 hour" },
  { name: "5 Boosts", price: "₹199", desc: "Use anytime, never expire" },
  { name: "10 Boosts", price: "₹349", desc: "Best value pack" },
];

export default function PremiumPage() {
  return (
    <div className="min-h-screen pb-24" style={{ background: "#0a0a0f" }}>
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-10">
          <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Upgrade to <span className="gradient-text">Premium</span>
          </h1>
          <p className="text-white/40 text-sm">Unlock unlimited matches and find your soulmate faster</p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-10">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-5 relative"
              style={{ background: plan.color, border: `1px solid ${plan.border}` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-xl">{plan.name}</h2>
                <div className="text-right">
                  <span className="text-2xl font-extrabold gradient-text">{plan.price}</span>
                  <span className="text-white/40 text-sm">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.included ? "bg-green-500/20" : "bg-white/5"}`}>
                      {f.included ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <span className="w-1.5 h-0.5 bg-white/20 rounded" />
                      )}
                    </div>
                    <span className={`text-sm ${f.included ? "text-white/70" : "text-white/25 line-through"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.ctaStyle}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Boosts */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
            <Zap size={22} className="text-yellow-400" /> Profile Boosts
          </h2>
          <p className="text-white/40 text-sm mb-4">Get 10x more profile views. Be seen by more people right now!</p>
          <div className="grid grid-cols-3 gap-3">
            {BOOSTS.map((boost) => (
              <button
                key={boost.name}
                className="premium-card rounded-xl p-4 text-center hover:scale-105 transition-transform"
              >
                <Zap size={24} className="text-yellow-400 mx-auto mb-2" />
                <div className="text-white font-bold text-lg">{boost.price}</div>
                <div className="text-white/60 text-xs font-medium">{boost.name}</div>
                <div className="text-white/30 text-xs mt-1">{boost.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-green-400" /> Safe & Secure Payments
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/40">
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Powered by Razorpay</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Cancel anytime</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> UPI / Cards / NetBanking</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> 7-day refund policy</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Star size={18} className="text-yellow-400" /> What Premium users say
          </h3>
          {[
            { name: "Rahul, 26", text: "Got 5x more matches in my first week of Gold! Met my girlfriend here.", city: "Pune" },
            { name: "Sneha, 23", text: "Seeing who liked me was a game changer. So worth ₹199!", city: "Bangalore" },
          ].map((t) => (
            <div key={t.name} className="glass rounded-xl p-4">
              <p className="text-white/60 text-sm italic mb-2">&quot;{t.text}&quot;</p>
              <p className="text-white/30 text-xs">— {t.name}, {t.city}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
