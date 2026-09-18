import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileCheck, Loader2, AlertCircle, CheckCircle2, XCircle,
  Trophy, Users, Percent, Inbox, RefreshCw,
} from "lucide-react";
import moment from "moment";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFilter, adminUpdate } from "@/lib/adminData";
import { t, useLang, useDir } from "@/lib/i18n";

const REQ_PENDING = { color: "#D69E2E", bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.35)" };

export default function ExamResults() {
  const { isLoading, role, school_id } = useAdminAuth();
  useLang();
  const direction = useDir();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState([]);
  const [schoolId, setSchoolId] = useState("general");
  const [processing, setProcessing] = useState(null);

  const isAdmin = role === "admin" || role === "school_admin";

  const load = async () => {
    if (!isAdmin) { setLoading(false); return; }
    const sid = school_id || "general";
    setSchoolId(sid);
    const [rs, reqs] = await Promise.all([
      adminFilter("ExamResult", { school_id: sid }, "-submission_time", 200),
      adminFilter("ExamAccessRequest", { school_id: sid, status: "pending" }, "-created_date", 100),
    ]);
    setResults(rs || []);
    setPending(reqs || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoading) return;
    load();
  }, [isLoading, isAdmin]);

  const reviewRequest = async (req, status) => {
    setProcessing(req.id);
    await adminUpdate("ExamAccessRequest", req.id, {
      status,
      reviewed_at: new Date().toISOString(),
    });
    const reqs = await adminFilter("ExamAccessRequest", { school_id: schoolId, status: "pending" }, "-created_date", 100);
    setPending(reqs || []);
    setProcessing(null);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center">
          <AlertCircle size={36} className="mx-auto mb-3" style={{ color: "#C94C4C" }} />
          <h2 className="font-black text-lg mb-2">{t("examResultsRestricted")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("examResultsRestrictedDesc")}</p>
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{t("examResultsBackHome")}</Link>
        </div>
      </div>
    );
  }

  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
              <FileCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("examResultsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("examResultsDesc")}</p>
            </div>
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-colors"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: t("examResultsTotalAttempts"), value: results.length, icon: <FileCheck size={15} />, color: "#2F6690" },
            { label: t("examResultsParticipants"), value: studentCount, icon: <Users size={15} />, color: "#3A86A8" },
            { label: t("examResultsAvgScore"), value: `${avgPct}%`, icon: <Percent size={15} />, color: "#D69E2E" },
            { label: t("examResultsPassCount"), value: passCount, icon: <Trophy size={15} />, color: "#2E7D5B" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <div style={{ color: s.color }} className="mb-1.5">{s.icon}</div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: "results", label: `${t("examResultsTabResults")} (${results.length})` },
            { id: "requests", label: `${t("examResultsTabRequests")} (${pending.length})`, dot: pending.length > 0 },
          ].map((tb) => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === tb.id ? "rgba(47,102,144,0.1)" : "rgba(47,102,144,0.03)",
                border: `1px solid ${tab === tb.id ? "#2F6690" : "hsl(var(--border))"}`,
                color: tab === tb.id ? "#2F6690" : "hsl(var(--muted-foreground))",
              }}>
              {tb.label} {tb.dot && <span className="inline-block w-1.5 h-1.5 rounded-full ms-1" style={{ background: "#D69E2E" }} />}
            </button>
          ))}
        </div>

        {/* Results tab */}
        {tab === "results" && (
          results.length === 0 ? (
            <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <Inbox size={40} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
              <p className="text-xs text-muted-foreground">{t("examResultsNoResults")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => {
                const passed = (r.percentage || 0) >= 60;
                return (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3"
                    style={{ border: "1px solid hsl(var(--border))" }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{r.student_name || r.student_email}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {r.exam_title} • {moment(r.submission_time).format("YYYY/MM/DD HH:mm")}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex-shrink-0">
                      {r.correct_answers}/{r.total_questions} {t("examResultsCorrectShort")}
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-sm font-black flex-shrink-0"
                      style={{
                        background: passed ? "rgba(46,125,91,0.1)" : "rgba(201,76,76,0.1)",
                        border: `1px solid ${passed ? "rgba(46,125,91,0.3)" : "rgba(201,76,76,0.3)"}`,
                        color: passed ? "#2E7D5B" : "#C94C4C",
                      }}>
                      {r.percentage}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        )}

        {/* Requests tab */}
        {tab === "requests" && (
          pending.length === 0 ? (
            <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-40" style={{ color: "#2E7D5B" }} />
              <p className="text-xs text-muted-foreground">{t("examResultsNoRequests")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((req) => (
                <div key={req.id}
                  className="rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{ border: `1px solid ${REQ_PENDING.border}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{req.student_name || req.student_email}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{t("examResultsWantsAccess")}: {req.exam_title}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => reviewRequest(req, "approved")} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                      style={{ background: "#2E7D5B" }}>
                      <CheckCircle2 size={12} /> {t("examResultsApprove")}
                    </button>
                    <button onClick={() => reviewRequest(req, "rejected")} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60"
                      style={{ background: REQ_PENDING.bg, border: `1px solid ${REQ_PENDING.border}`, color: "#C94C4C" }}>
                      <XCircle size={12} /> {t("examResultsReject")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}