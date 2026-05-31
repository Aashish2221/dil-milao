"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, User, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";

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
