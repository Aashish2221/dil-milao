"use client";
import { useState, useEffect } from "react";
import { Share2, Copy, Check, Gift, Users } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function InviteFriends() {
  const [referralCode, setReferralCode] = useState("");
  const [bonusLikes, setBonusLikes] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("profiles").select("referral_code, bonus_likes").eq("id", user.id).single(),
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", user.id),
      ]);

      setReferralCode(profile?.referral_code || "");
      setBonusLikes(profile?.bonus_likes || 0);
      setReferralCount(count || 0);
      setLoading(false);
    }
    load();
  }, []);

  const referralLink = `https://dil-milao.vercel.app/join?ref=${referralCode}`;

  async function handleShare() {
    const text = `Join me on Dil Milao — India's modern dating app! Find genuine connections. Use my link and we both get bonus likes 💕\n${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Dil Milao", text, url: referralLink });
      } catch {}
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) return null;

  return (
    <section className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <Gift size={18} className="text-red-400/70" />
        <span className="text-white font-medium">Invite Friends</span>
        {bonusLikes > 0 && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full btn-primary text-white">
            +{bonusLikes} bonus likes earned!
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Reward explanation */}
        <div className="flex items-start gap-3 mb-4 p-3 rounded-xl" style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)" }}>
          <Gift size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white/80 text-sm font-medium">Get 5 free likes per friend!</p>
            <p className="text-white/40 text-xs mt-0.5">When a friend joins using your link, you both get bonus likes.</p>
          </div>
        </div>

        {/* Stats */}
        {referralCount > 0 && (
          <div className="flex items-center gap-2 mb-4 text-white/50 text-sm">
            <Users size={14} className="text-green-400" />
            <span><span className="text-green-400 font-semibold">{referralCount}</span> friend{referralCount !== 1 ? "s" : ""} joined using your link</span>
          </div>
        )}

        {/* Referral link */}
        <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-white/40 text-xs truncate flex-1 font-mono">
            dil-milao.vercel.app/join?ref={referralCode}
          </span>
          <button onClick={handleCopy} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary"
          >
            <Share2 size={15} /> Share via WhatsApp
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl text-sm text-white/60 glass hover:text-white transition-colors"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
}
