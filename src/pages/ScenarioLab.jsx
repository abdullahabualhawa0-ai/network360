import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Zap, Target, Clock, CheckCircle2,
  AlertCircle, Play, Bot, Lightbulb, ArrowRight, Trophy, BookOpen, History
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  SCENARIOS, SORTED_SCENARIOS, TOTAL_SCENARIOS,
  DIFF_LABEL_KEYS, getScenarioById, getLessonInfo,
} from "../lib/scenarios";
import { useAuth } from "@/lib/AuthContext";
import { resolveSchoolId, ensureLabRecord, markTaskCompleted } from "../lib/labTracking";
import { t, useLang } from "@/lib/i18n";

/** حالة المحاكاة محفوظة لكل سيناريو في جلسة مستقلة (Simulation Session) */
export const simStateKey = (scenarioId) => (scenarioId ? `network-simulator-state-s${scenarioId}` : "network-simulator-state");

function getSimNetwork(scenarioId) {
  try {
    const s = JSON.parse(localStorage.getItem(simStateKey(scenarioId)) || "{}");
    return { nodes: s.nodes || [], connections: s.connections || [] };
  } catch { return { nodes: [], connections: [] }; }
}

export default function ScenarioLab() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);
  const [dbMap, setDbMap] = useState({}); // scenario_id → { score, status, tasks... }
  const [dbReady, setDbReady] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const lessonFilter = searchParams.get("lesson");
  const lessonInfo = lessonFilter ? getLessonInfo(lessonFilter) : null;

  // مزامنة التقدم من قاعدة البيانات — سجل فردي لكل طالب (سجل واحد لكل سيناريو)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const schoolId = await resolveSchoolId(user);
        const rows = await base44.entities.LabHistory.filter(
          { student_id: user.id, school_id: schoolId }, "-updated_date", 200
        );
        const map = {};
        for (const r of rows || []) {
          map[r.scenario_id] = {
            score: r.score || 0,
            status: r.status,
            tasksCompleted: r.tasks_completed || 0,
            tasksTotal: r.tasks_total || 0,
            completedAt: r.completed_at || r.updated_date,
          };
        }
        setDbMap(map);
      } catch { /* يبقى العرض المحلي حتى تكتمل المزامنة */ }
      finally { setDbReady(true); }
    })();
  }, [user?.id]);

  // إنشاء سجل المحاولة (in_progress) بمجرد فتح السيناريو
  const startLab = async (scenario) => {
    if (!user || !scenario) return;
    try {
      const schoolId = await resolveSchoolId(user);
      await ensureLabRecord(user, schoolId, scenario, scenario.tasks?.length || 0);
    } catch { /* بدون تتبع سحابي هذه المرة */ }
  };

  // فتح سيناريو مباشرة عبر ?open= (من صفحة الدرس)
  useEffect(() => {
    if (!dbReady) return;
    const openId = searchParams.get("open");
    if (openId && !selected) {
      const sc = getScenarioById(openId);
      if (sc) {
        setSelected(sc);
        setResult(null);
        setAiTip("");
        setShowHints(false);
        startLab(sc);
      }
    }
  }, [dbReady]); // eslint-disable-line

  // تتبع فردي لكل مهمة: تُعلَّم المهام المنجزة واحدة واحدة (بلا تكرار) وتتحدّث العدادات تلقائياً
  const persistEvaluation = async (scenario, res) => {
    if (!user) return;
    try {
      const schoolId = await resolveSchoolId(user);
      const details = res.details || [];
      let lab = await ensureLabRecord(user, schoolId, scenario, details.length);
      for (let i = 0; i < details.length; i++) {
        if (details[i].ok) {
          lab = await markTaskCompleted({
            lab, user, schoolId, scenario,
            taskIndex: i, taskLabel: details[i].label,
          });
        }
      }
      if (res.passed) {
        const now = new Date().toISOString();
        await base44.entities.LabHistory.update(lab.id, {
          status: "completed",
          score: typeof res.score === "number" ? res.score : lab.score,
          xp_earned: scenario.xp || lab.xp_earned || 0,
          completed_at: lab.completed_at || now,
          last_activity_at: now,
        });
      }
      // تحديث الخريطة المحلية — المكتمل يختفي من القائمة النشطة فوراً
      setDbMap((prev) => ({
        ...prev,
        [scenario.id]: {
          score: res.score,
          status: res.passed ? "completed" : "partially_completed",
          tasksCompleted: details.filter((d) => d.ok).length,
          tasksTotal: details.length,
          completedAt: res.passed ? new Date().toISOString() : null,
        },
      }));
    } catch { /* محفوظ محلياً وستتم المزامنة في الزيارة القادمة */ }
  };

  const evaluate = () => {
    if (!selected) return;
    const { nodes, connections } = getSimNetwork(selected.id);
    const res = selected.eval(nodes, connections);
    setResult(res);
    if (res.passed) persistEvaluation(selected, res);
  };

  // فتح السيناريو في المحاكي — لكل سيناريو جلسة محاكاة مستقلة ونظيفة
  const openInSimulator = () => {
    if (!selected) return;
    localStorage.setItem("active-scenario-id", selected.id);
    navigate("/network-simulator");
  };

  const getAiTip = async () => {
    if (!selected) return;
    setLoadingTip(true);
    setAiTip("");
    try {
      const { nodes, connections } = getSimNetwork(selected.id);
      const prompt = `أنا طالب أحاول إكمال سيناريو: "${selected.title}".
الأهداف: ${selected.objectives.join(", ")}
شبكتي الحالية: ${nodes.length} جهاز، ${connections.length} اتصال.
الأجهزة: ${nodes.map((n) => `${n.type}(${n.label})`).join(", ")}

أعطني تلميحاً واحداً مفيداً بدون إفساد الحل كاملاً. جملتين فقط بالعربية.`;
      const tip = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiTip(tip);
    } catch {
      setAiTip("تعذر الاتصال بالمساعد. تحقق من الاتصال.");
    } finally {
      setLoadingTip(false);
    }
  };

  // ── القوائم المحسوبة ──
  const completedIds = new Set(
    Object.entries(dbMap).filter(([, v]) => v.status === "completed").map(([id]) => id)
  );
  const completedCount = [...completedIds].filter((id) => SCENARIOS.some((s) => s.id === id)).length;
  // قاعدة عدم التكرار: المكتمل يُخفى من القائمة النشطة ويستبدله غيره — ويبقى في السجل
  const availableBase = SORTED_SCENARIOS.filter((s) => !completedIds.has(s.id));
  const available = lessonFilter
    ? availableBase.filter((s) => s.lessonId === lessonFilter)
    : availableBase;

  const backToList = () => {
    setSelected(null);
    setResult(null);
    if (searchParams.get("open")) {
      const next = new URLSearchParams(searchParams);
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
  };

  const diffLabel = (d) => t(DIFF_LABEL_KEYS[d] || "diffMedium");

  return (
    <div className="min-h-screen" style={{ background: "#020617" }}>
      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d1117 0%,#1a0533 50%,#0d1117 100%)", borderBottom: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: "rgba(139,92,246,0.65)" }}>
              <Link to="/" className="hover:text-purple-300 transition-colors">{t("backHome")}</Link>
              <ChevronLeft size={13} />
              <span className="text-purple-300">{t("scenarioLabTitle")}</span>
            </div>
            <h1 className="text-3xl font-black mb-2" style={{
              background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              🧪 {lessonInfo ? t("lessonScenariosTitle") : t("scenarioLabTitle")}
            </h1>
            <p className="text-slate-400 text-sm">
              {lessonInfo ? `${t("lessonScenariosDesc")} — ${lessonInfo.lessonTitle}` : t("scenarioLabSubtitle")}
            </p>
            <p className="text-[10px] mt-1" style={{ color: dbReady ? "rgba(52,211,153,0.75)" : "rgba(148,163,184,0.6)" }}>
              {dbReady ? `✓ ${t("syncedNote")}` : t("syncingNote")}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(167,139,250,0.7)" }}>
              {t("diffSortedNote")}
            </p>

            {/* شريط التقدم الكلي */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="flex items-center gap-1 font-bold" style={{ color: "#34d399" }}>
                  <Trophy size={11} /> {t("completedProgress")}
                </span>
                <span className="font-bold text-slate-400">{completedCount} / {TOTAL_SCENARIOS} {t("ofScenarios")}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((completedCount / TOTAL_SCENARIOS) * 100)}%`, background: "linear-gradient(90deg,#059669,#34d399)" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selected ? (
          <>
            {/* فلتر الدرس */}
            {lessonInfo && (
              <Link to="/scenario-lab"
                className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }}>
                <ChevronLeft size={12} /> {t("backToAllScenarios")}
              </Link>
            )}

            {available.length === 0 ? (
              /* اكتملت جميع السيناريوهات — لا تعود المكتملة للظهور */
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-12 text-center"
                style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(52,211,153,0.35)" }}>
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-xl font-black mb-2" style={{ color: "#34d399" }}>{t("allCompletedMsg")}</h2>
                <p className="text-xs text-slate-400 mb-6">
                  {completedCount} / {TOTAL_SCENARIOS} {t("ofScenarios")}
                </p>
                <Link to="/lab-history"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
                  <History size={14} /> {t("viewHistory")}
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {available.map((sc, i) => {
                  const rec = dbMap[sc.id];
                  const inProgress = rec && rec.status && rec.status !== "completed";
                  const lesson = getLessonInfo(sc.lessonId);
                  return (
                    <motion.div
                      key={sc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.015] hover:shadow-2xl group"
                      style={{
                        background: "rgba(12,20,40,0.9)",
                        border: inProgress ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(139,92,246,0.18)",
                        backdropFilter: "blur(12px)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = inProgress ? "rgba(251,191,36,0.55)" : "rgba(139,92,246,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = inProgress ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.18)"; }}
                      onClick={() => { setSelected(sc); setResult(null); setAiTip(""); setShowHints(false); startLab(sc); }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">{sc.icon}</span>
                        <div className="flex items-center gap-2">
                          {inProgress && (
                            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                              ⏳ {t("continueLabel")} ({rec.score}%)
                            </span>
                          )}
                          {!rec && (
                            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-full font-bold">
                              {t("newLabel")}
                            </span>
                          )}
                          <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                            {diffLabel(sc.difficulty)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-black text-white text-lg mb-2">{sc.title}</h3>
                      <p className="text-slate-400 text-sm mb-3 leading-relaxed">{sc.desc}</p>
                      {lesson && (
                        <div className="flex items-center gap-1.5 text-[10px] mb-4" style={{ color: "rgba(6,182,212,0.8)" }}>
                          <BookOpen size={11} /> {t("relatedLesson")}: {lesson.lessonTitle}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {sc.time}</span>
                          <span className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" /> {sc.xp} XP</span>
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                          <Play size={12} /> {inProgress ? t("continueLabel") : t("startLabel")} <ArrowRight size={11} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button onClick={backToList}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {t("backToScenarios")}
            </button>

            {/* Scenario Card */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: "rgba(12,20,40,0.95)", border: "1px solid rgba(139,92,246,0.28)", backdropFilter: "blur(16px)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selected.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-white">{selected.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${selected.diffColor}`}>
                      {diffLabel(selected.difficulty)} • {selected.time} • {selected.xp} XP
                    </span>
                    {(() => {
                      const lesson = getLessonInfo(selected.lessonId);
                      return lesson ? (
                        <Link to={`/topic/${lesson.unitId}/${lesson.lessonId}`}
                          className="text-[10px] flex items-center gap-1 hover:underline" style={{ color: "#06b6d4" }}>
                          <BookOpen size={10} /> {lesson.lessonTitle}
                        </Link>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">{selected.desc}</p>

              {/* Objectives with live check */}
              {(() => {
                const { nodes, connections } = getSimNetwork(selected.id);
                const liveResult = selected.eval(nodes, connections);
                const details = liveResult.details || [];
                const completedCountTasks = details.filter((d) => d.ok).length;
                const totalCount = details.length;
                const pct = totalCount > 0 ? Math.round((completedCountTasks / totalCount) * 100) : 0;
                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{t("objectivesTitle")}</h3>
                      <span className="text-[10px] font-bold" style={{ color: pct === 100 ? "#34d399" : "rgba(167,139,250,0.8)" }}>
                        {completedCountTasks}/{totalCount} {t("completedCount")}
                      </span>
                    </div>
                    <div className="h-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#059669,#34d399)" : "linear-gradient(90deg,#7c3aed,#06b6d4)" }} />
                    </div>
                    <ul className="space-y-2">
                      {details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {d.ok ? (
                            <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }} />
                          )}
                          <span style={{ color: d.ok ? "#86efac" : "rgba(148,163,184,0.75)" }}>{d.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={openInSimulator}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
                  <Play size={14} /> {t("openInSimulator")}
                </button>
                <button onClick={evaluate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                  <Target size={14} /> {t("evaluate")}
                </button>
                <button onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ background: showHints ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
                  <Lightbulb size={14} /> {t("hints")}
                </button>
                <button onClick={getAiTip} disabled={loadingTip}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                  <Bot size={14} /> {loadingTip ? t("aiThinking") : t("aiHintBtn")}
                </button>
              </div>
            </div>

            {/* Hints */}
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl p-5 mb-4 overflow-hidden"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                    <Lightbulb size={14} /> {t("hints")}
                  </h3>
                  <ul className="space-y-2">
                    {selected.hints.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "rgba(251,191,36,0.85)" }}>
                        <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Tip */}
            <AnimatePresence>
              {aiTip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.28)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-purple-400" />
                    <h3 className="text-purple-400 font-bold text-sm">{t("aiHintBtn")}</h3>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{aiTip}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: result.passed ? "rgba(5,150,105,0.07)" : "rgba(239,68,68,0.07)",
                    border: `1px solid ${result.passed ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                      style={{ background: result.passed ? "linear-gradient(135deg,#059669,#34d399)" : "linear-gradient(135deg,#dc2626,#ef4444)", color: "white" }}>
                      {result.score}%
                    </div>
                    <div>
                      <h3 className="text-lg font-black" style={{ color: result.passed ? "#34d399" : "#f87171" }}>
                        {result.passed ? `🎉 ${t("passedMsg")}` : `❌ ${t("failedMsg")}`}
                      </h3>
                      <p className="text-slate-300 text-sm">{result.feedback}</p>
                      {result.passed && (
                        <p className="text-[10px] mt-1" style={{ color: "#34d399" }}>
                          → <Link to="/lab-history" className="underline">{t("viewHistory")}</Link>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {d.ok ? <CheckCircle2 size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                        <span style={{ color: d.ok ? "#86efac" : "#fca5a5" }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}