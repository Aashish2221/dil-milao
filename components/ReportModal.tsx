"use client";
import { useState } from "react";
import { Flag, X } from "lucide-react";
import { createClient } from "@/lib/supabase";

const REASONS = [
  "Fake profile",
  "Inappropriate photos",
  "Harassment or abuse",
  "Spam or scam",
  "Underage user",
  "Other",
];

type Props = {
  reportedId: string;
  reportedName: string;
  onClose: () => void;
  onReported?: () => void;
};

export default function ReportModal({ reportedId, reportedName, onClose, onReported }: Props) {
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    await supabase.from("reports").upsert({
      reporter_id: user.id,
      reported_id: reportedId,
      reason: selected,
    });

    setDone(true);
    setSubmitting(false);
    setTimeout(() => {
      onClose();
      onReported?.();
    }, 1800);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {done ? (
          <div className="text-center py-4">
            <Flag size={36} className="text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Report submitted</p>
            <p className="text-white/40 text-sm">Thank you for keeping Dil Milao safe.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Report {reportedName}</h3>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>

            <p className="text-white/40 text-sm mb-4">Why are you reporting this profile?</p>

            <div className="space-y-2 mb-5">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    selected === reason
                      ? "btn-primary text-white"
                      : "glass text-white/60 hover:text-white"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
