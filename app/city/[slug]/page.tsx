import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, MapPin, Star, Shield, MessageCircle, Users, Check, Zap } from "lucide-react";
import type { Metadata } from "next";
import { CITIES, ALL_CITY_SLUGS } from "@/lib/cities";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALL_CITY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) return { title: "Not Found" };

  const title = `Dating App in ${city.name} — Find Singles in ${city.name} | Dil Milao`;
  const description = `Join ${city.members} singles from ${city.name}, ${city.state} on Dil Milao. India's best dating app for genuine connections. Free to join, filter by city, religion & age.`;

  return {
    title,
    description,
    keywords: [
      `dating app in ${city.name}`,
      `${city.name} dating app`,
      `singles in ${city.name}`,
      `${city.name} dating site`,
      `find match in ${city.name}`,
      `${city.name.toLowerCase()} dating`,
      `Indian dating ${city.name}`,
      `${city.state} dating app`,
    ],
    alternates: { canonical: `https://dil-milao.vercel.app/city/${slug}` },
    openGraph: {
      title: `Find Singles in ${city.name} — Dil Milao`,
      description,
      url: `https://dil-milao.vercel.app/city/${slug}`,
      siteName: "Dil Milao",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Dating App in ${city.name} | Dil Milao`,
      description,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Dating App in ${city.name}`,
    description: `Find singles in ${city.name} on Dil Milao`,
    url: `https://dil-milao.vercel.app/city/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://dil-milao.vercel.app" },
        { "@type": "ListItem", position: 2, name: `Dating in ${city.name}`, item: `https://dil-milao.vercel.app/city/${slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
          <MapPin size={13} />
          <span>{city.name}, {city.state}</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          <span className="text-white">Dating App in</span>
          <br />
          <span className="gradient-text">{city.name}</span>
        </h1>
        <p className="text-base md:text-lg text-white/60 max-w-lg mx-auto mb-4">
          {city.tagline}. Join <strong className="text-white">{city.members} singles</strong> from {city.name} already on Dil Milao.
        </p>
        <p className="text-white/40 text-sm mb-8">
          Filter by city, religion, age & interests — find someone who truly matches you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="btn-primary px-8 py-4 rounded-full text-base font-bold text-white inline-flex items-center gap-2">
            <Heart size={18} fill="white" /> Find Singles in {city.name} — Free
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-full text-base glass text-white/70 hover:text-white transition-colors">
            Already have an account
          </Link>
        </div>
        <p className="text-white/25 text-xs mt-4">No credit card · Free forever · 2 min setup</p>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-14">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 text-center">
          {[
            { n: city.members, l: `Singles in ${city.name}` },
            { n: "4.8★", l: "User Rating" },
            { n: "Free", l: "To Join" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-4">
              <div className="text-xl md:text-3xl font-extrabold gradient-text mb-1">{s.n}</div>
              <div className="text-white/40 text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Dil Milao in this city */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Why <span className="gradient-text">Dil Milao</span> is the Best Dating App in {city.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: <MapPin size={22} className="text-red-400" />, title: `Filter by ${city.name}`, desc: `See only profiles from ${city.name} and nearby areas. No long-distance confusion.` },
              { icon: <Shield size={22} className="text-red-400" />, title: "Verified Profiles", desc: "Photo verification ensures you're meeting real people, not fake accounts." },
              { icon: <MessageCircle size={22} className="text-red-400" />, title: "Chat After Matching", desc: "No unwanted messages. Both users must match before chatting." },
              { icon: <Users size={22} className="text-red-400" />, title: "Indian Values", desc: `Built for Indians in ${city.name} who want genuine connections, not just casual hookups.` },
              { icon: <Star size={22} className="text-red-400" />, title: "Religion & Language Filters", desc: `Filter by religion, mother tongue, and lifestyle to find the right match in ${city.name}.` },
              { icon: <Zap size={22} className="text-red-400" />, title: "Boost Your Profile", desc: `Get 10x more visibility among ${city.name} singles for just ₹49.` },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-5 flex gap-4">
                <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                  <p className="text-white/50 text-sm">{f.desc}</p>
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
            How to Find Your Match in <span className="gradient-text">{city.name}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Sign Up Free", desc: `Create your profile in 2 minutes. Set your location to ${city.name}.` },
              { step: "2", title: "Discover & Like", desc: `Browse verified ${city.name} singles. Like profiles you're interested in.` },
              { step: "3", title: "Match & Chat", desc: "When both of you like each other, it's a match! Start chatting." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full btn-primary flex items-center justify-center text-xl font-bold text-white mb-4">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Love Stories from <span className="gradient-text">{city.name}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {city.testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400" fill="#facc15" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full btn-primary flex items-center justify-center text-xs font-bold text-white">
                    {t.name[0]}
                  </div>
                  <div className="flex items-center gap-1 text-white/50 text-sm">
                    <span className="text-white font-medium">{t.name}</span>
                    <MapPin size={10} />{city.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium teaser */}
      <section className="px-6 pb-16">
        <div className="max-w-xl mx-auto text-center" style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)", border: "1px solid rgba(249,202,36,0.2)", borderRadius: "1.5rem", padding: "2rem" }}>
          <h2 className="text-xl font-bold text-white mb-4">
            Stand out among <span style={{ color: "#f9ca24" }}>{city.name} singles</span>
          </h2>
          <div className="space-y-2 mb-6 text-left">
            {["See who liked your profile", "Unlimited swipes", "Super likes to stand out", `Boost visibility among ${city.name} singles`].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,202,36,0.2)", border: "1px solid rgba(249,202,36,0.4)" }}>
                  <Check size={11} style={{ color: "#f9ca24" }} />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn-primary px-6 py-3 rounded-full text-white font-bold inline-block text-sm">
            Start Free — Try Premium ₹5
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 text-center">
        <div className="max-w-xl mx-auto glass rounded-3xl p-10">
          <Heart size={40} className="text-red-400 mx-auto mb-5 heartbeat" fill="#ff6b6b" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Your match in {city.name} is waiting.
          </h2>
          <p className="text-white/40 text-sm mb-6">Join {city.members} {city.name} singles on Dil Milao. Free forever.</p>
          <Link href="/signup" className="btn-primary px-8 py-3.5 rounded-full text-white font-bold inline-block">
            Find My Match in {city.name}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/25 text-xs">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" fill="#ff6b6b" />
            <span className="text-white/40">Dil Milao</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai"].filter(c => c.toLowerCase() !== city.name.toLowerCase()).map((c) => (
              <Link key={c} href={`/city/${c.toLowerCase()}`} className="hover:text-white/50 transition-colors">
                Dating in {c}
              </Link>
            ))}
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
