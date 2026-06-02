"use client";
import { useState, useEffect } from "react";
import { Crown, Zap, Check, Shield, Star, CheckCircle, AlertCircle, Loader } from "lucide-react";
import Script from "next/script";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";

declare global {
  interface Window {
    Cashfree: new (options: { mode: string }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget?: string }) => Promise<{
        error?: { message: string };
        paymentDetails?: { paymentMessage: string };
        redirect?: boolean;
      }>;
    };
  }
}

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    period: "",
    color: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    features: [
      { text: "3 likes per day", included: true },
      { text: "Basic matching", included: true },
      { text: "Chat with matches", included: true },
      { text: "See who liked you", included: false },
      { text: "Unlimited likes", included: false },
      { text: "Profile boost", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Current Plan",
  },
  {
    id: "gold",
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
    ctaClass: "bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold cursor-pointer hover:opacity-90 transition-all",
  },
  {
    id: "platinum",
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
    ctaClass: "btn-primary text-white",
  },
];

const BOOSTS = [
  { id: "boost_1", name: "1 Boost", price: "₹49", amount: 49, desc: "Appear at top for 1 hour" },
  { id: "boost_5", name: "5 Boosts", price: "₹199", amount: 199, desc: "Use anytime, never expire" },
  { id: "boost_10", name: "10 Boosts", price: "₹349", amount: 349, desc: "Best value pack" },
];

export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumExpires, setPremiumExpires] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [boostCredits, setBoostCredits] = useState(0);
  const [boostActiveUntil, setBoostActiveUntil] = useState<string | null>(null);
  const [activatingBoost, setActivatingBoost] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at, boost_credits, boost_active_until")
        .eq("id", user.id)
        .single();

      if (data?.is_premium) {
        setIsPremium(true);
        setPremiumExpires(data.premium_expires_at);
      }

      // Load latest payment plan + check trial usage
      const { data: payments } = await supabase
        .from("payments")
        .select("plan")
        .eq("user_id", user.id)
        .eq("status", "success")
        .order("created_at", { ascending: false })
        .limit(5);

      const planNames = payments?.map((p) => p.plan) || [];
      setTrialUsed(planNames.includes("trial"));
      const latestPremiumPlan = planNames.find((p) => ["gold", "platinum", "trial"].includes(p));
      if (latestPremiumPlan) setCurrentPlan(latestPremiumPlan);

      setBoostCredits(data?.boost_credits ?? 0);
      if (data?.boost_active_until && new Date(data.boost_active_until) > new Date()) {
        setBoostActiveUntil(data.boost_active_until);
      }
    }
    loadUser();
  }, []);

  async function activateBoost() {
    setActivatingBoost(true);
    setError("");
    try {
      const res = await fetch("/api/boost", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBoostActiveUntil(data.boost_active_until);
      setBoostCredits((c) => Math.max(0, c - 1));
      setSuccess("Boost activated! Your profile is now at the top for 30 minutes. 🚀");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to activate boost");
    }
    setActivatingBoost(false);
  }

  async function openCheckout(planId: string) {
    setPaying(planId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to create order");
      }

      const { orderId, paymentSessionId } = resData;

      const cashfree = new window.Cashfree({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox",
      });

      const result = await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_modal",
      });

      if (result.error) {
        setError(`Payment failed: ${result.error.message}`);
        setPaying(null);
        return;
      }

      if (result.redirect) {
        // Some payment methods do a full redirect — user will return to /premium
        return;
      }

      // Payment completed in modal — verify server-side
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, plan: planId }),
      });

      const planMeta = [...PLANS, ...BOOSTS].find((p) => p.id === planId);
      if (verifyRes.ok) {
        const isPremiumPlan = ["trial", "gold", "platinum"].includes(planId);
        if (isPremiumPlan) {
          setIsPremium(true);
          const days = planId === "trial" ? 3 : 30;
          const exp = new Date();
          exp.setDate(exp.getDate() + days);
          setPremiumExpires(exp.toISOString());
          if (planId === "trial") setTrialUsed(true);
        }
        setSuccess(
          planId === "trial"
            ? "Welcome to Premium! Enjoy 3 days of unlimited features for just ₹5!"
            : isPremiumPlan
              ? `Payment successful! You're now a ${planMeta?.name} member. Enjoy unlimited features!`
              : "Boost purchased! Your profile will appear at the top of feeds."
        );
      } else {
        setError("Payment verification failed. Contact support with your order ID: " + orderId);
      }
      setPaying(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPaying(null);
    }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#0a0a0f" }}>
      <Script src="https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js" strategy="afterInteractive" />
      <Navbar />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Upgrade to <span className="gradient-text">Premium</span>
          </h1>
          <p className="text-white/40 text-sm">Unlock unlimited matches and find your soulmate faster</p>
        </div>

        {/* Active premium banner */}
        {isPremium && premiumExpires && (
          <div className="mb-6 p-4 rounded-2xl"
            style={{ background: "rgba(249,202,36,0.08)", border: "1px solid rgba(249,202,36,0.3)" }}>
            <div className="flex items-center gap-3 mb-2">
              <Crown size={20} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-400 font-semibold text-sm capitalize">
                  You&apos;re a {currentPlan ?? "Premium"} member!
                </p>
                <p className="text-white/40 text-xs">
                  Active until {new Date(premiumExpires).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-black"
                style={{ background: "linear-gradient(135deg, #f9ca24, #f0932b)" }}>
                ACTIVE
              </span>
            </div>
            <p className="text-white/25 text-xs ml-8">
              One-time payment — does not auto-renew. Renew before expiry to keep your benefits.
            </p>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Trial offer — only for users who haven't tried premium yet */}
        {!isPremium && !trialUsed && (
          <div
            className="rounded-2xl px-5 pb-5 pt-7 mb-6 relative"
            style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.15), rgba(238,90,36,0.15))", border: "1px solid rgba(255,107,107,0.4)" }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                New User Offer
              </span>
            </div>
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h2 className="text-white font-bold text-xl">Starter Trial</h2>
                <p className="text-white/40 text-xs mt-0.5">One-time offer for new users</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold gradient-text">₹5</span>
                <span className="text-white/40 text-sm">/3 days</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                "Unlimited likes for 3 days",
                "See who liked you",
                "Smart matching",
                "Chat with all matches",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-green-400" />
                  </div>
                  <span className="text-white/70 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => openCheckout("trial")}
              disabled={paying === "trial"}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying === "trial" ? (
                <><Loader size={16} className="animate-spin" /> Processing...</>
              ) : (
                <>Try Premium — ₹5 for 3 Days</>
              )}
            </button>
          </div>
        )}

        {/* Trial already used notice */}
        {!isPremium && trialUsed && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <CheckCircle size={18} className="text-white/20 flex-shrink-0" />
            <p className="text-white/30 text-sm">You&apos;ve already used the ₹5 trial. Upgrade to a full plan below.</p>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4 mb-10">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl px-5 pb-5 relative ${plan.badge ? "pt-7" : "pt-5"}`}
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
                      {f.included ? <Check size={12} className="text-green-400" /> : <span className="w-1.5 h-0.5 bg-white/20 rounded" />}
                    </div>
                    <span className={`text-sm ${f.included ? "text-white/70" : "text-white/25 line-through"}`}>{f.text}</span>
                  </div>
                ))}
              </div>

              {plan.id === "basic" ? (
                <button disabled className="w-full py-3 rounded-xl font-semibold bg-white/10 text-white/40 cursor-default">
                  {isPremium ? "Free Plan" : "Current Plan"}
                </button>
              ) : (
                <button
                  onClick={() => openCheckout(plan.id)}
                  disabled={paying === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${plan.ctaClass}`}
                >
                  {paying === plan.id ? (
                    <><Loader size={16} className="animate-spin" /> Processing...</>
                  ) : isPremium ? (
                    `Renew ${plan.name} — ${plan.price}/mo`
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Boosts */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <Zap size={22} className="text-yellow-400" /> Profile Boosts
            </h2>
            {boostCredits > 0 && (
              <span className="text-yellow-400/80 text-sm font-semibold">{boostCredits} credit{boostCredits !== 1 ? "s" : ""}</span>
            )}
          </div>
          <p className="text-white/40 text-sm mb-4">Get 10x more profile views right now!</p>

          {/* Activate boost if credits available */}
          {boostCredits > 0 && (
            <div className="glass rounded-xl p-4 mb-4 flex items-center justify-between">
              {boostActiveUntil && new Date(boostActiveUntil) > new Date() ? (
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">🚀 Boost active!</p>
                  <p className="text-white/40 text-xs">
                    Expires {new Date(boostActiveUntil).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-white font-semibold text-sm">You have {boostCredits} boost{boostCredits !== 1 ? "s" : ""}</p>
                    <p className="text-white/40 text-xs">Activates for 30 minutes</p>
                  </div>
                  <button
                    onClick={activateBoost}
                    disabled={activatingBoost}
                    className="btn-primary px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {activatingBoost ? <Loader size={14} className="animate-spin" /> : <Zap size={14} />}
                    Use Boost
                  </button>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BOOSTS.map((boost) => (
              <button
                key={boost.id}
                onClick={() => openCheckout(boost.id)}
                disabled={paying === boost.id}
                className="premium-card rounded-xl p-4 text-center hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0"
              >
                {paying === boost.id ? (
                  <Loader size={20} className="text-yellow-400 sm:mx-auto sm:mb-2 animate-spin" />
                ) : (
                  <Zap size={24} className="text-yellow-400 sm:mx-auto sm:mb-2 flex-shrink-0" />
                )}
                <div className="flex-1 sm:flex-none text-left sm:text-center">
                  <div className="text-white font-bold text-lg leading-tight">{boost.price}</div>
                  <div className="text-white/60 text-xs font-medium">{boost.name}</div>
                  <div className="text-white/30 text-xs mt-0.5 sm:mt-1">{boost.desc}</div>
                </div>
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
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Powered by Cashfree</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> Cancel anytime</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> UPI / Cards / NetBanking</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-400" /> No refunds after purchase</div>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex justify-center gap-6 text-xs text-white/25 mb-6">
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
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
