import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileCheck, Loader2, AlertCircle, CheckCircle2, XCircle,
  Trophy, Users, Percent, Inbox, RefreshCw, RotateCcw,
} from "lucide-react";
import moment from "moment";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFilter, adminUpdate } from "@/lib/adminData";
import { t, useLang, useDir } from "@/lib/i18n";

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

  const handleToggleRetake = async (r) => {
    if (processing === r.id) return;
    setProcessing(r.id);
    try {
      const nextVal = !r.allow_retake;
      await adminUpdate("ExamResult", r.id, {
        allow_retake: nextVal,
        retake_allowed_at: nextVal ? new Date().toISOString() : null,
        retake_allowed_by: role === "school_admin" ? "School Admin" : "Owner",
      });
      setResults((prev) => prev.map((item) => (item.id === r.id ? { ...item, allow_retake: nextVal } : item)));
    } catch {}
    finally {
      setProcessing(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin text-brand" />
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-main" dir={direction}>
        <div className="text-center">
          <AlertCircle size={36} className="mx-auto mb-3 text-destructive" />
          <h2 className="font-black text-lg mb-2 text-foreground">{t("examResultsRestricted")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("examResultsRestrictedDesc")}</p>
          <Link to="/" className="text-xs font-bold text-brand hover:underline">{t("examResultsBackHome")}</Link>
        </div>
      </div>
    );
  }

  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <FileCheck size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("examResultsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("examResultsDesc")}</p>
            </div>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-[10px] border border-border text-brand hover:bg-accent transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: t("examResultsTotalAttempts"), value: results.length, icon: <FileCheck size={15} />, colorCls: "text-brand" },
            { label: t("examResultsParticipants"), value: studentCount, icon: <Users size={15} />, colorCls: "text-brand" },
            { label: t("examResultsAvgScore"), value: `${avgPct}%`, icon: <Percent size={15} />, colorCls: "text-warning" },
            { label: t("examResultsPassCount"), value: passCount, icon: <Trophy size={15} />, colorCls: "text-success" },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] p-4 bg-card border border-border">
              <div className={`mb-1.5 ${s.colorCls}`}>{s.icon}</div>
              <div className="text-xl font-black text-foreground">{s.value}</div>
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
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all border ${
                tab === tb.id
                  ? "bg-accent border-primary text-brand"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb.label} {tb.dot && <span className="inline-block w-1.5 h-1.5 rounded-full ms-1 bg-warning" />}
            </button>
          ))}
        </div>

        {/* Results tab */}
        {tab === "results" && (
          results.length === 0 ? (
            <div className="rounded-[16px] p-10 text-center bg-card border border-border">
              <Inbox size={40} className="mx-auto mb-3 opacity-40 text-brand" />
              <p className="text-xs text-muted-foreground">{t("examResultsNoResults")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => {
                const passed = (r.percentage || 0) >= 60;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="rounded-[12px] p-3.5 bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-foreground">{r.student_name || r.student_email}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {r.exam_title} • {moment(r.submission_time).format("YYYY/MM/DD HH:mm")}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex-shrink-0">
                      {r.correct_answers}/{r.total_questions} {t("examResultsCorrectShort")}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <div className={`px-3 py-1.5 rounded-[10px] text-sm font-black border ${
                        passed
                          ? "bg-success/10 border-success/35 text-success"
                          : "bg-destructive/10 border-destructive/35 text-destructive"
                      }`}>
                        {r.percentage}%
                      </div>
                      {/* زر السماح بإعادة الامتحان بجانب علامة الطالب */}
                      <button
                        onClick={() => handleToggleRetake(r)}
                        disabled={processing === r.id}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          r.allow_retake
                            ? "bg-success/15 border-success/40 text-success hover:bg-success/25"
                            : "bg-secondary/10 border-secondary/30 text-secondary dark:text-primary hover:bg-secondary/20"
                        }`}
                        title={r.allow_retake ? t("retakeAllowedTooltip") : t("allowRetakeTooltip")}
                      >
                        {processing === r.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : r.allow_retake ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        <span>
                          {r.allow_retake ? t("retakeAllowed") : t("allowRetake")}
                        </span>
                      </button>
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
            <div className="rounded-[16px] p-10 text-center bg-card border border-border">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-40 text-success" />
              <p className="text-xs text-muted-foreground">{t("examResultsNoRequests")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="rounded-[12px] p-3.5 bg-card border border-warning/35 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate text-foreground">{req.student_name || req.student_email}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{t("examResultsWantsAccess")}: {req.exam_title}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => reviewRequest(req, "approved")}
                      disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-success text-success-foreground hover:bg-success/90 disabled:opacity-60"
                    >
                      <CheckCircle2 size={12} /> {t("examResultsApprove")}
                    </button>
                    <button
                      onClick={() => reviewRequest(req, "rejected")}
                      disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold bg-destructive/10 border border-destructive/35 text-destructive hover:bg-destructive/20 disabled:opacity-60"
                    >
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