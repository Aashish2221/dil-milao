"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { Suspense } from "react";

function JoinRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = params.get("ref");

  useEffect(() => {
    if (ref) {
      // Store referral code in sessionStorage so signup page can read it
      sessionStorage.setItem("referral_code", ref);
    }
    router.replace("/signup");
  }, [ref, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "linear-gradient(135deg, #0a0a0f, #1a0a1e)" }}>
      <Heart size={48} fill="#ff6b6b" className="text-red-400 heartbeat" />
      <p className="text-white/60 text-sm">Taking you to sign up…</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <Heart size={48} fill="#ff6b6b" className="text-red-400 heartbeat" />
      </div>
    }>
      <JoinRedirect />
    </Suspense>
  );
}
