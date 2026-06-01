"use client";
import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { Heart } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install_prompt_dismissed";
const DISMISS_DAYS = 7;

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function setDismissed() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const iosDevice = isIOS();
    setIos(iosDevice);

    if (iosDevice) {
      // Show iOS instructions after delay
      const t = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(t);
    }

    // Android/Chrome — wait for beforeinstallprompt
    function onPrompt(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setShow(true), 8000);
      return () => clearTimeout(t);
    }

    // Check if captured before mount
    const early = (window as unknown as Record<string, unknown>).__pwaPrompt as BeforeInstallPromptEvent | undefined;
    if (early) {
      setPrompt(early);
      const t = setTimeout(() => setShow(true), 8000);
      window.addEventListener("appinstalled", () => { setShow(false); setInstalled(true); });
      return () => clearTimeout(t);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => { setShow(false); setInstalled(true); });
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setDismissed();
    setShow(false);
  }

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { setShow(false); setInstalled(true); }
    else dismiss();
  }

  if (!show || installed) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={dismiss} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl px-6 pt-5 pb-10"
        style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

        <button onClick={dismiss} className="absolute top-5 right-5 text-white/30 hover:text-white/60 transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl btn-primary flex items-center justify-center flex-shrink-0">
            <Heart size={28} fill="white" className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Dil Milao</p>
            <p className="text-white/50 text-sm">India&apos;s Dating App</p>
          </div>
        </div>

        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Add Dil Milao to your home screen for faster access, offline support, and a full app experience — no App Store needed.
        </p>

        {ios ? (
          <div className="space-y-3">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">How to install on iPhone</p>
            {[
              { icon: <Share size={15} />, text: 'Tap the Share button at the bottom of Safari' },
              { icon: <span className="text-sm">⊞</span>, text: 'Scroll down and tap "Add to Home Screen"' },
              { icon: <span className="text-sm">✓</span>, text: 'Tap "Add" — done!' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                <span className="text-red-400 flex-shrink-0">{step.icon}</span>
                <span className="text-white/70 text-sm">{step.text}</span>
              </div>
            ))}
            <button onClick={dismiss} className="w-full py-3 rounded-2xl text-white/50 text-sm mt-2">
              Maybe later
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleInstall}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold"
            >
              <Download size={18} /> Install App — Free
            </button>
            <button onClick={dismiss} className="px-5 py-3.5 rounded-2xl glass text-white/50 text-sm hover:text-white transition-colors">
              Later
            </button>
          </div>
        )}
      </div>
    </>
  );
}
