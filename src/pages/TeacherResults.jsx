import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, Loader2, Inbox, Trophy, Users, Percent } from "lucide-react";
import moment from "moment";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";

export default function TeacherResults() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi("filter", "ExamResult", { sort: "-submission_time", limit: 200 })
      .then((rows) => setResults(rows || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin" style={{ color: "#173F5F" }} />
      </div>
    );
  }

  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
            <FileCheck className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("teacherResultsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("teacherResultsPageDesc")}</p>
          </div>
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

        {/* List */}
        {results.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <Inbox size={40} className="mx-auto mb-3 opacity-40" style={{ color: "#173F5F" }} />
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
        )}
      </div>
    </div>
  );
}