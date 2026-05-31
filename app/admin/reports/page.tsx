"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flag, ShieldX, CheckCircle, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const ADMIN_EMAIL = "aashishpatil2221@gmail.com";

type Report = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  created_at: string;
  resolved: boolean;
  reporter: { full_name: string; email: string } | null;
  reported: { full_name: string; age: number; city: string; photo_url: string; email: string } | null;
};

const AVATAR_COLORS = ["#ff6b6b", "#6b9eff", "#6bffb8", "#ffb86b", "#b86bff"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { router.push("/login"); return; }

      // Only allow admin email
      if (user.email !== ADMIN_EMAIL) { router.push("/discover"); return; }

      await loadReports(supabase, user.id);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReports(supabase: ReturnType<typeof createClient>, _uid: string) {
    const { data } = await supabase
      .from("reports")
      .select(`
        id, reporter_id, reported_id, reason, created_at, resolved,
        reporter:profiles!reports_reporter_id_fkey(full_name, email),
        reported:profiles!reports_reported_id_fkey(full_name, age, city, photo_url, email)
      `)
      .order("created_at", { ascending: false });

    setReports((data as unknown as Report[]) || []);
    setLoading(false);
  }

  async function handleBan(reportedId: string, reportId: string) {
    if (!confirm("Ban this user? This will delete their profile permanently.")) return;
    setActionLoading(reportId);
    const supabase = createClient();
    await supabase.from("profiles").delete().eq("id", reportedId);
    await supabase.from("reports").update({ resolved: true }).eq("reported_id", reportedId);
    setReports((prev) => prev.filter((r) => r.reported_id !== reportedId));
    setActionLoading(null);
  }

  async function handleResolve(reportId: string) {
    setActionLoading(reportId);
    const supabase = createClient();
    await supabase.from("reports").update({ resolved: true }).eq("id", reportId);
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, resolved: true } : r));
    setActionLoading(null);
  }

  async function handleDelete(reportId: string) {
    setActionLoading(reportId);
    const supabase = createClient();
    await supabase.from("reports").delete().eq("id", reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setActionLoading(null);
  }

  const filtered = reports.filter((r) => {
    if (filter === "pending") return !r.resolved;
    if (filter === "resolved") return r.resolved;
    return true;
  });

  const pendingCount = reports.filter((r) => !r.resolved).length;

  return (
    <div className="min-h-screen pb-10" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Flag size={18} className="text-red-400" />
          <h1 className="text-white font-semibold">Admin — Reports</h1>
        </div>
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold btn-primary text-white">
            {pendingCount} pending
          </span>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["pending", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f ? "btn-primary text-white" : "glass text-white/50 hover:text-white"
              }`}
            >
              {f} {f === "pending" ? `(${pendingCount})` : f === "all" ? `(${reports.length})` : `(${reports.length - pendingCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle size={48} className="text-green-400/30 mx-auto mb-4" />
            <p className="text-white/40">No {filter === "all" ? "" : filter} reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report, i) => (
              <div
                key={report.id}
                className="rounded-2xl p-4"
                style={{
                  background: report.resolved ? "rgba(255,255,255,0.02)" : "rgba(255,107,107,0.04)",
                  border: `1px solid ${report.resolved ? "rgba(255,255,255,0.06)" : "rgba(255,107,107,0.15)"}`,
                }}
              >
                {/* Reason + date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
                    <Flag size={12} /> {report.reason}
                  </span>
                  <div className="flex items-center gap-2">
                    {report.resolved && (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={11} /> Resolved
                      </span>
                    )}
                    <span className="text-white/25 text-xs">
                      {new Date(report.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Reported user */}
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Reported</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative"
                        style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i+1) % AVATAR_COLORS.length]})` }}
                      >
                        {report.reported?.photo_url ? (
                          <Image src={report.reported.photo_url} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {report.reported ? getInitials(report.reported.full_name) : "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{report.reported?.full_name || "Deleted"}</p>
                        <p className="text-white/40 text-xs">{report.reported?.city || "—"}</p>
                      </div>
                    </div>
                    {report.reported_id && (
                      <Link
                        href={`/profile/${report.reported_id}`}
                        target="_blank"
                        className="mt-2 flex items-center gap-1 text-blue-400/60 text-xs hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink size={10} /> View profile
                      </Link>
                    )}
                  </div>

                  {/* Reporter */}
                  <div className="glass rounded-xl p-3">
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Reported by</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        {report.reporter ? getInitials(report.reporter.full_name) : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{report.reporter?.full_name || "Unknown"}</p>
                        <p className="text-white/40 text-xs truncate">{report.reporter?.email || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!report.resolved && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBan(report.reported_id, report.id)}
                      disabled={actionLoading === report.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                    >
                      <ShieldX size={13} /> Ban User
                    </button>
                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={actionLoading === report.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white/70 glass disabled:opacity-40 transition-all hover:text-white"
                    >
                      <CheckCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
                {report.resolved && (
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={actionLoading === report.id}
                    className="flex items-center gap-1.5 text-white/20 text-xs hover:text-white/50 transition-colors"
                  >
                    <Trash2 size={12} /> Delete report
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
