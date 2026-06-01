import Link from "next/link";
import { Heart, Trophy, Users, Gift, Zap, Star, Check, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Dil Milao Campus Ambassador | Earn While You Help Others Find Love",
  description: "Join the Dil Milao Ambassador Program. Represent India's fastest-growing dating app at your college, earn rewards, and help your friends find genuine connections.",
  keywords: ["Dil Milao ambassador", "campus ambassador India", "dating app ambassador", "earn money college India", "campus representative dating app"],
  alternates: { canonical: "https://dil-milao.vercel.app/ambassador" },
  openGraph: {
    title: "Become a Dil Milao Campus Ambassador",
    description: "Represent India's fastest-growing dating app at your college. Earn rewards and help your friends find love.",
    url: "https://dil-milao.vercel.app/ambassador",
    siteName: "Dil Milao",
    locale: "en_IN",
    type: "website",
  },
};

const PERKS = [
  { icon: <Gift size={22} className="text-red-400" />, title: "Exclusive Referral Link", desc: "Your own custom invite link. Every signup through your link earns you bonus likes and rewards." },
  { icon: <Trophy size={22} className="text-yellow-400" />, title: "Monthly Leaderboard Prizes", desc: "Top ambassador each month wins ₹500 Amazon voucher + lifetime premium access." },
  { icon: <Star size={22} className="text-blue-400" />, title: "Ambassador Badge", desc: "Verified Ambassador badge on your profile — stand out from the crowd." },
  { icon: <Users size={22} className="text-green-400" />, title: "Private Ambassador Group", desc: "Join our WhatsApp group with other ambassadors. Get early access to features and direct support." },
  { icon: <Zap size={22} className="text-orange-400" />, title: "Free Premium Access", desc: "All ambassadors get free premium while they remain active (min. 5 referrals/month)." },
  { icon: <Heart size={22} fill="#ff6b6b" className="text-red-400" />, title: "Help Your College Find Love", desc: "Be the reason your friends find genuine connections. Real impact, real people." },
];

const STEPS = [
  { n: "01", title: "Apply Below", desc: "Fill in your name, college, city, and WhatsApp number. Takes 2 minutes." },
  { n: "02", title: "Get Approved", desc: "We review your application and send your custom referral link within 24 hours." },
  { n: "03", title: "Share & Earn", desc: "Share your link in college groups, stories, and with friends. Earn rewards for every signup." },
];

const FAQS = [
  { q: "Do I need any experience?", a: "No. If you're active on social media and want to help your college find genuine connections, you're perfect for this." },
  { q: "How much can I earn?", a: "Top ambassadors earn ₹2,000–₹5,000/month in vouchers and rewards. Active ambassadors get free premium worth ₹999/month." },
  { q: "How many referrals do I need?", a: "Minimum 5 referrals/month to stay active. Top ambassadors get 50–100 referrals/month easily from college groups." },
  { q: "Can I do this from any city?", a: "Yes! We're looking for ambassadors from every major Indian city and college." },
];

export default function AmbassadorPage() {
  const whatsappLink = "https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20become%20a%20Dil%20Milao%20Campus%20Ambassador!%20My%20name%20is%20____%2C%20college%3A%20____%2C%20city%3A%20____.";

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

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-orange-300 mb-6">
          <Trophy size={14} className="text-yellow-400" />
          Campus Ambassador Program
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
          <span className="text-white">Help Your College</span>
          <br />
          <span className="gradient-text">Find Love & Get Paid</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto mb-4">
          Become an official Dil Milao Ambassador at your college. Share your link, earn rewards, and help your friends find genuine connections.
        </p>
        <p className="text-white/35 text-sm mb-8">
          Open to students from any college in India · Completely free to join
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary px-8 py-4 rounded-full text-lg font-bold text-white inline-flex items-center gap-2"
        >
          <span>Apply on WhatsApp</span>
          <ArrowRight size={18} />
        </a>
        <p className="text-white/25 text-xs mt-4">Takes 2 minutes · Response within 24 hours</p>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-14">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 text-center">
          {[
            { n: "500+", l: "Active Ambassadors" },
            { n: "₹5K", l: "Top Monthly Earning" },
            { n: "50+", l: "Colleges Covered" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-4">
              <div className="text-xl md:text-3xl font-extrabold gradient-text mb-1">{s.n}</div>
              <div className="text-white/40 text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            What You <span className="gradient-text">Get</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PERKS.map((p) => (
              <div key={p.title} className="glass rounded-2xl p-5 flex gap-4">
                <div className="flex-shrink-0 mt-0.5">{p.icon}</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                  <p className="text-white/50 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full btn-primary flex items-center justify-center text-xl font-bold text-white mb-4">
                  {s.n}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards table */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Rewards <span className="gradient-text">Per Referral</span>
          </h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 px-5 py-3 border-b border-white/5 text-white/40 text-xs font-semibold uppercase tracking-wider">
              <span>Milestone</span>
              <span className="text-center">Referrals</span>
              <span className="text-right">Reward</span>
            </div>
            {[
              { tier: "Starter", count: "5+/month", reward: "Free Premium", color: "text-white/60" },
              { tier: "Active", count: "15+/month", reward: "₹250 voucher", color: "text-blue-400" },
              { tier: "Pro", count: "30+/month", reward: "₹500 voucher", color: "text-purple-400" },
              { tier: "🏆 Top Ambassador", count: "50+/month", reward: "₹1,000 + Trophy", color: "text-yellow-400" },
            ].map((row) => (
              <div key={row.tier} className="grid grid-cols-3 px-5 py-4 border-b border-white/5 last:border-0">
                <span className={`text-sm font-semibold ${row.color}`}>{row.tier}</span>
                <span className="text-center text-white/60 text-sm">{row.count}</span>
                <span className="text-right text-white/80 text-sm font-medium">{row.reward}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Common <span className="gradient-text">Questions</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="glass rounded-2xl p-5">
                <p className="text-white font-semibold mb-2 text-sm">{faq.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 text-center">
        <div className="max-w-xl mx-auto glass rounded-3xl p-10">
          <Trophy size={40} className="text-yellow-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-white mb-2">Ready to become an Ambassador?</h2>
          <p className="text-white/40 text-sm mb-6">Apply on WhatsApp — we respond within 24 hours.</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-8 py-3.5 rounded-full text-white font-bold inline-flex items-center gap-2"
          >
            Apply Now on WhatsApp <ArrowRight size={16} />
          </a>
          <p className="text-white/20 text-xs mt-4">Free to join · For college students across India</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-white/25 text-xs">
          <Link href="/" className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" fill="#ff6b6b" />
            <span className="text-white/40">Dil Milao</span>
          </Link>
          <div className="flex gap-5">
            <Link href="/blog" className="hover:text-white/50 transition-colors">Blog</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          </div>
          <p>© 2026 Dil Milao</p>
        </div>
      </footer>
    </div>
  );
}
