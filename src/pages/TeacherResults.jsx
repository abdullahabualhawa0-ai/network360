import { useState, useEffect } from "react";
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
        <Loader2 size={30} className="animate-spin text-brand" />
      </div>
    );
  }

  const avgPct = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : 0;
  const passCount = results.filter((r) => (r.percentage || 0) >= 60).length;
  const studentCount = new Set(results.map((r) => r.student_id)).size;

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
            <FileCheck size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl text-foreground">{t("teacherResultsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("teacherResultsPageDesc")}</p>
          </div>
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

        {/* List */}
        {results.length === 0 ? (
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
                  <div className={`px-3 py-1.5 rounded-[10px] text-sm font-black flex-shrink-0 border ${
                    passed
                      ? "bg-success/10 border-success/35 text-success"
                      : "bg-destructive/10 border-destructive/35 text-destructive"
                  }`}>
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