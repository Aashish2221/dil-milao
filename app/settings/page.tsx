"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Lock, Trash2, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);
  const [pwStatus, setPwStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function sendPasswordReset() {
    setPwStatus("sending");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setPwStatus("error"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setPwStatus(error ? "error" : "sent");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setDeleting(false); return; }

    // Delete profile (cascades to likes, matches, messages via FK)
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen app-page" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold">Settings</h1>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4 pb-20">

        {/* Notifications */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Bell size={18} className="text-white/40" />
            <span className="text-white font-medium">Notifications</span>
          </div>
          {[
            { label: "New matches", value: notifMatches, set: setNotifMatches },
            { label: "New messages", value: notifMessages, set: setNotifMessages },
            { label: "Someone liked you", value: notifLikes, set: setNotifLikes },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0">
              <span className="text-white/60 text-sm">{label}</span>
              <button
                onClick={() => set((v) => !v)}
                className={`w-11 h-6 rounded-full transition-all relative ${value ? "btn-primary" : "bg-white/10"}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                  style={{ left: value ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>
          ))}
        </section>

        {/* Account */}
        <section className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <ShieldCheck size={18} className="text-white/40" />
            <span className="text-white font-medium">Account</span>
          </div>

          {/* Change password */}
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-white/40" />
                <span className="text-white/70 text-sm">Change Password</span>
              </div>
              <ChevronRight size={16} className="text-white/20" />
            </div>
            {pwStatus === "idle" && (
              <button
                onClick={sendPasswordReset}
                className="ml-7 text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                Send reset link to my email
              </button>
            )}
            {pwStatus === "sending" && <p className="ml-7 text-xs text-white/30">Sending…</p>}
            {pwStatus === "sent" && <p className="ml-7 text-xs text-green-400/70">Reset link sent! Check your inbox.</p>}
            {pwStatus === "error" && <p className="ml-7 text-xs text-red-400/70">Failed to send. Try again.</p>}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} className="text-white/40" />
            <span className="text-white/70 text-sm">Log Out</span>
          </button>

          {/* Delete account */}
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
            >
              <Trash2 size={16} className="text-red-400/60" />
              <span className="text-red-400/60 text-sm">Delete Account</span>
            </button>
          ) : (
            <div className="px-5 py-4">
              <p className="text-white/60 text-sm mb-3">
                This permanently deletes your profile, matches, and messages. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl glass text-white/50 text-sm hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="text-white/15 text-xs text-center pt-2">Dil Milao · Made with ❤️ in India</p>
      </div>
    </div>
  );
}
