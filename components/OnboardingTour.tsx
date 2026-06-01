"use client";
import { useState, useEffect } from "react";
import { Heart, X, Star, ChevronRight } from "lucide-react";

const STORAGE_KEY = "onboarding_v1_done";

const STEPS = [
  {
    emoji: "👋",
    title: "Welcome to Dil Milao!",
    body: "Let's show you how to find your match in 30 seconds.",
    hint: null,
    arrow: null,
  },
  {
    emoji: null,
    title: "Like or Skip profiles",
    body: "Swipe right or tap ❤️ to like. Swipe left or tap ✕ to skip.",
    hint: "Both of you must like each other to match and chat.",
    arrow: "bottom-center" as const,
    highlightIcon: <div className="flex items-center gap-6">
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.2)", border: "2px solid rgba(239,68,68,0.6)" }}>
        <X size={24} className="text-red-400" />
      </div>
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,107,107,0.2)", border: "2px solid rgba(255,107,107,0.6)" }}>
        <Heart size={24} fill="#ff6b6b" className="text-red-400" />
      </div>
    </div>,
  },
  {
    emoji: null,
    title: "Super Like to stand out ⭐",
    body: "Tap the star to Super Like — they'll see your profile first and know you're really interested.",
    hint: "You get 1 Super Like per day for free.",
    arrow: "bottom-center" as const,
    highlightIcon: <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(249,202,36,0.2)", border: "2px solid rgba(249,202,36,0.6)" }}>
      <Star size={24} fill="#f9ca24" className="text-yellow-400" />
    </div>,
  },
  {
    emoji: null,
    title: "Browse photos & read the bio",
    body: "Tap the left or right side of the photo to browse more pictures. Tap the profile card to read the full bio.",
    hint: null,
    arrow: "top-center" as const,
    highlightIcon: null,
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {}
  }, []);

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[55] pointer-events-none" style={{ background: "rgba(0,0,0,0.65)" }} />

      {/* Tooltip card — positioned differently per step */}
      <div
        className="fixed z-[56] left-4 right-4 mx-auto max-w-sm"
        style={
          current.arrow === "top-center"
            ? { top: "52%" }
            : current.arrow === "bottom-center"
            ? { bottom: "120px" }
            : { top: "50%", transform: "translateY(-50%)" }
        }
      >
        {/* Arrow pointing down (toward bottom buttons) */}
        {current.arrow === "bottom-center" && (
          <div className="flex justify-center mb-1 animate-bounce">
            <div className="w-0 h-0" style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "14px solid rgba(255,255,255,0.15)" }} />
          </div>
        )}

        <div
          className="rounded-3xl p-6 pointer-events-auto"
          style={{ background: "linear-gradient(145deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {/* Step dots */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: i === step ? 20 : 6, background: i === step ? "#ff6b6b" : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
            <button onClick={finish} className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Skip tour
            </button>
          </div>

          {/* Content */}
          {current.emoji && (
            <div className="text-4xl mb-3">{current.emoji}</div>
          )}

          {current.highlightIcon && (
            <div className="flex justify-center mb-4">{current.highlightIcon}</div>
          )}

          <h3 className="text-white font-bold text-lg mb-2">{current.title}</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-3">{current.body}</p>

          {current.hint && (
            <p className="text-white/35 text-xs mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              💡 {current.hint}
            </p>
          )}

          <button
            onClick={next}
            className="btn-primary w-full py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          >
            {isLast ? "Let's go! 🎉" : (
              <>Next <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        {/* Arrow pointing up (toward card) */}
        {current.arrow === "top-center" && (
          <div className="flex justify-center mt-1 animate-bounce">
            <div className="w-0 h-0" style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "14px solid rgba(255,255,255,0.15)" }} />
          </div>
        )}
      </div>
    </>
  );
}
