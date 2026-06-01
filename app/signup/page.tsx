"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, User, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";

async function handleGoogleSignup() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

const currentYear = new Date().getFullYear();
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calcAge(year: number, month: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - month;
  if (monthDiff < 0) age--;
  return age;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralCode] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("referral_code") || "" : ""
  );

  const age = birthYear && birthMonth ? calcAge(parseInt(birthYear), parseInt(birthMonth) - 1) : null;
  const tooYoung = age !== null && age < 18;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (tooYoung || age === null) {
      setError("You must be 18 or older to join Dil Milao.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (signupError) {
      setError(signupError.message);
      setLoading(false);
    } else {
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: name,
          age,
        });

        // Process referral if code was stored
        if (referralCode) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .neq("id", data.user.id)
            .single();
          if (referrer) {
            await supabase.from("referrals").insert({
              referrer_id: referrer.id,
              referred_id: data.user.id,
            });
            await supabase.rpc("increment_bonus_likes", { uid: referrer.id, amount: 5 });
          }
          sessionStorage.removeItem("referral_code");
        }
      }
      router.push("/setup");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "linear-gradient(135deg, #0a0a0f, #1a0a1e)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <Heart size={32} fill="#ff6b6b" className="text-red-400 heartbeat" />
            <span className="text-3xl font-bold gradient-text">Dil Milao</span>
          </Link>
          <p className="text-white/40 mt-3 text-sm">Join 2 lakh+ Indians looking for love!</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Create Free Account</h1>

          {/* Google signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-5 font-semibold text-white/80 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-white/60 text-sm mb-1 flex items-center gap-1">
                <Calendar size={14} /> Date of Birth <span className="text-red-400">*</span>
                <span className="text-white/20 font-normal ml-1">(must be 18+)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-red-400/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1)} className="bg-gray-900">{m}</option>
                  ))}
                </select>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-red-400/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-gray-900">Year</option>
                  {Array.from({ length: 63 }, (_, i) => currentYear - 18 - i).map((y) => (
                    <option key={y} value={String(y)} className="bg-gray-900">{y}</option>
                  ))}
                </select>
              </div>
              {tooYoung && (
                <p className="text-red-400/80 text-xs mt-1">You must be at least 18 years old to join.</p>
              )}
              {age !== null && !tooYoung && (
                <p className="text-green-400/60 text-xs mt-1">Age verified: {age} years old</p>
              )}
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p className="text-white/30 text-xs">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-white/50 hover:text-white/70 underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-white/50 hover:text-white/70 underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading || tooYoung || !birthYear || !birthMonth}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold mt-2 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
