import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileCheck, Loader2, AlertCircle, CheckCircle2, XCircle,
  Trophy, Users, Percent, Inbox, RefreshCw,
} from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { resolveAdminSchool, GENERAL_SCHOOL } from "@/lib/schoolUtils";

const REQ_PENDING = { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" };

export default function ExamResults() {
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("results"); // results | requests
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);
  const [processing, setProcessing] = useState(null);

  const isAdmin = user?.role === "admin";

  const load = async () => {
    if (!isAdmin) { setLoading(false); return; }
    const sid = (await resolveAdminSchool(user)) || GENERAL_SCHOOL;
    setSchoolId(sid);
    // عزل المدارس: نتائج وطلبات مدرسة المعلم فقط
    const [rs, reqs] = await Promise.all([
      base44.entities.ExamResult.filter({ school_id: sid }, "-submission_time", 200),
      base44.entities.ExamAccessRequest.filter({ school_id: sid, status: "pending" }, "-created_date", 100),
    ]);
    setResults(rs || []);
    setPending(reqs || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoadingAuth) return;
    load();
  }, [isLoadingAuth, isAdmin]);

  const reviewRequest = async (req, status) => {
    setProcessing(req.id);
    await base44.entities.ExamAccessRequest.update(req.id, {
      status,
      reviewed_by: user.email,
      reviewed_at: new Date().toISOString(),
    });
    const reqs = await base44.entities.ExamAccessRequest.filter({ school_id: schoolId, status: "pending" }, "-created_date", 100);
    setPending(reqs || []);
    setProcessing(null);
  };

  if (isLoadingAuth || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        <p className="text-xs text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">وصول مقيّد</h2>
          <p className="text-xs text-muted-foreground mb-5">هذه الصفحة للمعلمين والمديرين فقط.</p>
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#059669,#4f46e5)" }}>
              <FileCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">نتائج الامتحانات</h1>
              <p className="text-xs text-muted-foreground">نتائج وطلبات دخول طلاب مدرستك فقط</p>
            </div>
          </div>
          <button onClick={load} className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "إجمالي المحاولات", value: results.length, icon: <FileCheck size={15} />, color: "#06b6d4" },
            { label: "عدد المشاركين", value: studentCount, icon: <Users size={15} />, color: "#a78bfa" },
            { label: "متوسط النتائج", value: `${avgPct}%`, icon: <Percent size={15} />, color: "#fbbf24" },
            { label: "ناجحون (60%+)", value: passCount, icon: <Trophy size={15} />, color: "#34d399" },
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
            { id: "results", label: `النتائج (${results.length})` },
            { id: "requests", label: `طلبات الدخول (${pending.length})`, dot: pending.length > 0 },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === t.id ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${tab === t.id ? "rgba(6,182,212,0.4)" : "hsl(var(--border))"}`,
                color: tab === t.id ? "#06b6d4" : "hsl(var(--muted-foreground))",
              }}>
              {t.label} {t.dot && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />}
            </button>
          ))}
        </div>

        {/* Results tab */}
        {tab === "results" && (
          results.length === 0 ? (
            <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <Inbox size={40} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(var(--primary))" }} />
              <p className="text-xs text-muted-foreground">لا توجد نتائج بعد — بانتظار تأدية الطلاب</p>
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
                      {r.correct_answers}/{r.total_questions} صحيحة
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-sm font-black flex-shrink-0"
                      style={{
                        background: passed ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                        border: `1px solid ${passed ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                        color: passed ? "#34d399" : "#f87171",
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
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-40 text-green-400" />
              <p className="text-xs text-muted-foreground">لا توجد طلبات دخول معلقة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((req) => (
                <div key={req.id}
                  className="rounded-xl p-3.5 bg-card flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{ border: `1px solid ${REQ_PENDING.border}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{req.student_name || req.student_email}</div>
                    <div className="text-[10px] text-muted-foreground truncate">يرغب بالدخول إلى: {req.exam_title}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => reviewRequest(req, "approved")} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
                      <CheckCircle2 size={12} /> موافقة
                    </button>
                    <button onClick={() => reviewRequest(req, "rejected")} disabled={processing === req.id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-60"
                      style={{ background: REQ_PENDING.bg, border: `1px solid ${REQ_PENDING.border}`, color: "#f87171" }}>
                      <XCircle size={12} /> رفض
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