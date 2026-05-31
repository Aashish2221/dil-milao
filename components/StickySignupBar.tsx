"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function StickySignupBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 md:hidden"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,10,15,0.98) 30%)" }}
    >
      <Link
        href="/signup"
        className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base"
      >
        <Heart size={18} fill="white" />
        Find Your Match — Join Free
      </Link>
    </div>
  );
}
