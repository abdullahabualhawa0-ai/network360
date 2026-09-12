import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { History, Trophy, Zap, FlaskConical, RefreshCw, CheckCircle2, Circle, Loader2 } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { SCENARIOS, getLessonInfo } from "@/lib/scenarios";
import { t, useLang } from "@/lib/i18n";
import { topicTitleById } from "@/lib/courseI18n";

const STATUS_MAP = {
  completed: { key: "stCompleted", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.35)" },
  partially_completed: { key: "stPartial", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.35)" },
  in_progress: { key: "stInProgress", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.35)" },
  not_started: { key: "stNotStarted", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)" },
};

function formatDate(d) {
  if (!d) return "—";
  return moment(d).format("YYYY/MM/DD — HH:mm");
}

export default function LabHistory() {
  const { user } = useAuth();
  useLang();
  const [records, setRecords] = useState(null); // null = جاري التحميل
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    setRefreshing(true);
    const rows = await base44.entities.LabHistory.filter(
      { student_id: user.id }, "-last_activity_at", 100
    );
    setRecords(rows || []);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const completedCount = records?.filter((r) => r.status === "completed").length || 0;
  const totalXp = records?.reduce((a, r) => a + (r.xp_earned || 0), 0) || 0;
  const avgScore = records?.length
    ? Math.round(records.reduce((a, r) => a + (r.score || 0), 0) / records.length)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0e7490,#4f46e5)" }}>
              <History className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("historyTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("historySubtitle")}</p>
            </div>
          </div>
          <button onClick={load} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
            {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {t("refresh")}
          </button>
        </div>

        {/* Stats */}
        {records && records.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: t("totalAttempts"), value: records.length, icon: <FlaskConical size={16} />, color: "#06b6d4" },
              { label: t("completedScenarios"), value: completedCount, icon: <CheckCircle2 size={16} />, color: "#34d399" },
              { label: t("totalXp"), value: totalXp, icon: <Zap size={16} />, color: "#fbbf24" },
              { label: t("avgScore"), value: `${avgScore}%`, icon: <Trophy size={16} />, color: "#a78bfa" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-2 mb-1.5" style={{ color: s.color }}>{s.icon}</div>
                <div className="text-xl font-black">{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {records === null && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
            <p className="text-xs text-muted-foreground">{t("loadingHistory")}</p>
          </div>
        )}

        {/* Empty state */}
        {records && records.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <FlaskConical size={44} className="mx-auto mb-4 opacity-40" style={{ color: "hsl(var(--primary))" }} />
            <h2 className="font-black text-lg mb-1">{t("noAttempts")}</h2>
            <p className="text-xs text-muted-foreground mb-5">{t("noAttemptsDesc")}</p>
            <Link to="/scenario-lab"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
              {t("startNow")} 🚀
            </Link>
          </motion.div>
        )}

        {/* Records list */}
        {records && records.length > 0 && (
          <div className="space-y-3">
            {records.map((r, idx) => {
              const scenario = SCENARIOS.find((s) => s.id === r.scenario_id);
              const lesson = scenario ? getLessonInfo(scenario.lessonId) : null;
              const st = STATUS_MAP[r.status] || STATUS_MAP.in_progress;
              const total = r.tasks_total || 0;
              const done = r.tasks_completed || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4"
                  style={{ border: "1px solid hsl(var(--border))" }}>
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    {scenario?.icon || "🧪"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm truncate">{r.scenario_title || scenario?.title || r.scenario_id}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                        {t(st.key)}
                      </span>
                      {r.scenario_difficulty && (
                        <span className="text-[9px] text-muted-foreground">{r.scenario_difficulty}</span>
                      )}
                      {lesson && (
                        <span className="text-[9px] text-muted-foreground">📖 {t("lessonLabel")}: {topicTitleById(lesson.lessonId, lesson.lessonTitle)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: r.status === "completed" ? "linear-gradient(90deg,#059669,#34d399)" : "linear-gradient(90deg,#7c3aed,#06b6d4)",
                          }} />
                      </div>
                      <span className="text-[10px] font-bold flex-shrink-0" style={{ color: st.color }}>
                        {done}/{total} {t("tasksLabel")}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-relaxed">
                      {t("startedAtLabel")}: {formatDate(r.started_at)} • {t("lastActivityLabel")}: {formatDate(r.last_activity_at)}
                      {r.status === "completed" && r.completed_at && (
                        <> • <span style={{ color: "#34d399" }}>{t("completedAtLabel")}: {formatDate(r.completed_at)}</span></>
                      )}
                    </div>
                  </div>

                  {/* Score & XP */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                      <div className="text-sm font-black" style={{ color: "#06b6d4" }}>{r.score || 0}%</div>
                      <div className="text-[8px] text-muted-foreground">{t("scoreLabel")}</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-center" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <div className="text-sm font-black" style={{ color: "#fbbf24" }}>+{r.xp_earned || 0}</div>
                      <div className="text-[8px] text-muted-foreground">XP</div>
                    </div>
                    {r.status !== "completed" && (
                      <Link to="/scenario-lab"
                        className="px-3 py-2 rounded-xl text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
                        {t("continueLabel")}
                      </Link>
                    )}
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