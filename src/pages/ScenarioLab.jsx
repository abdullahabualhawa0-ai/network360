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
import { useStudentSession, studentApi } from "@/lib/studentSession";
import { ensureLabRecord, markTaskCompleted } from "../lib/labTracking";
import { t, useLang, getLang } from "@/lib/i18n";
import { topicTitleById } from "@/lib/courseI18n";
import { localizeScenario, scenarioFeedback } from "@/lib/scenarioI18n";
import { loadSimNetwork, setActiveScenarioId } from "@/lib/simulatorStorage";

function getSimNetwork(scenarioId) {
  const data = loadSimNetwork(scenarioId);
  return { nodes: data?.nodes || [], connections: data?.connections || [] };
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
  const session = useStudentSession();
  const lang = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const lessonFilter = searchParams.get("lesson");

  // تحديث عنوان الصفحة عند تغيير اللغة
  useEffect(() => {
    document.title = `${t("scenarioLabTitle")} | ${t("appName")}`;
  }, [lang]);
  const lessonInfo = lessonFilter ? getLessonInfo(lessonFilter) : null;

  // مزامنة التقدم من قاعدة البيانات — سجل فردي لكل طالب (سجل واحد لكل سيناريو)
  useEffect(() => {
    if (!session) { setDbReady(true); return; }
    (async () => {
      try {
        const rows = await studentApi("filter", "LabHistory", {
          query: {}, sort: "-updated_date", limit: 200,
        });
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
  }, [session?.student_id]);

  // إنشاء سجل المحاولة (in_progress) بمجرد فتح السيناريو
  const startLab = async (scenario) => {
    if (!session || !scenario) return;
    try {
      await ensureLabRecord(scenario, scenario.tasks?.length || 0);
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
    if (!session) return;
    try {
      const details = res.details || [];
      let lab = await ensureLabRecord(scenario, details.length);
      for (let i = 0; i < details.length; i++) {
        if (details[i].ok) {
          lab = await markTaskCompleted({
            lab, scenario,
            taskIndex: i, taskLabel: details[i].label,
          });
        }
      }
      // الحالة والدرجة وXP تُحسب في الخادم من المهام المسجّلة فعلياً
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
    const sc = localizeScenario(selected);
    const { nodes, connections } = getSimNetwork(sc.id);
    const res = sc.eval(nodes, connections);
    // نُخزّن النتيجة الخام — الترجمة تتم وقت العرض لتتغير مع اللغة
    setResult(res);
    if (res.passed) persistEvaluation(selected, res);
  };

  // فتح السيناريو في المحاكي — لكل سيناريو جلسة محاكاة مستقلة ونظيفة معزولة للمستخدم
  const openInSimulator = () => {
    if (!selected) return;
    setActiveScenarioId(selected.id);
    navigate("/network-simulator");
  };

  const getAiTip = async () => {
    if (!selected) return;
    setLoadingTip(true);
    setAiTip("");
    const lang = getLang();
    try {
      const { nodes, connections } = getSimNetwork(selected.id);
      const sc = localizeScenario(selected);
      const langName = { ar: "Arabic", en: "English", he: "Hebrew" }[lang] || "Arabic";
      const prompt = `I am a student trying to complete a networking scenario: "${sc.title}".
Objectives: ${sc.objectives.join(", ")}
My current network: ${nodes.length} devices, ${connections.length} connections.
Devices: ${nodes.map((n) => `${n.type}(${n.label})`).join(", ")}

Give me ONE useful hint WITHOUT spoiling the full solution. Two sentences only, in ${langName}.`;
      const tip = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiTip(tip);
    } catch {
      setAiTip(lang === "ar" ? "تعذر الاتصال بالمساعد. تحقق من الاتصال."
        : lang === "he" ? "לא ניתן להתחבר לעוזר. בדקו את החיבור."
        : "Could not connect to the assistant. Check your connection.");
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border bg-background">
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">{t("backHome")}</Link>
              <ChevronLeft size={13} />
              <span className="text-primary">{t("scenarioLabTitle")}</span>
            </div>
            <h1 className="text-3xl font-black mb-2 text-primary">
              {lessonInfo ? t("lessonScenariosTitle") : t("scenarioLabTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lessonInfo ? `${t("lessonScenariosDesc")} — ${lessonInfo.lessonTitle}` : t("scenarioLabSubtitle")}
            </p>
            <p className={`text-[10px] mt-1 ${dbReady ? "text-success" : "text-muted-foreground"}`}>
              {dbReady ? `✓ ${t("syncedNote")}` : t("syncingNote")}
            </p>
            <p className="text-[10px] mt-0.5 text-secondary dark:text-primary">
              {t("diffSortedNote")}
            </p>

            {/* شريط التقدم الكلي */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="flex items-center gap-1 font-bold text-success">
                  <Trophy size={11} /> {t("completedProgress")}
                </span>
                <span className="font-bold text-muted-foreground">{completedCount} / {TOTAL_SCENARIOS} {t("ofScenarios")}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full transition-all duration-700 bg-success"
                  style={{ width: `${Math.round((completedCount / TOTAL_SCENARIOS) * 100)}%` }} />
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
                className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-secondary/[0.07] border border-secondary/25 text-secondary dark:text-primary">
                <ChevronLeft size={12} /> {t("backToAllScenarios")}
              </Link>
            )}

            {available.length === 0 ? (
              /* اكتملت جميع السيناريوهات — لا تعود المكتملة للظهور */
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-12 text-center bg-card border border-success/40">
                <Trophy size={44} className="mx-auto mb-4 text-success" />
                <h2 className="text-xl font-black mb-2 text-success">{t("allCompletedMsg")}</h2>
                <p className="text-xs text-muted-foreground mb-6">
                  {completedCount} / {TOTAL_SCENARIOS} {t("ofScenarios")}
                </p>
                <Link to="/lab-history"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground">
                  <History size={14} /> {t("viewHistory")}
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {available.map((scRaw, i) => {
                  const sc = localizeScenario(scRaw);
                  const rec = dbMap[sc.id];
                  const inProgress = rec && rec.status && rec.status !== "completed";
                  const lesson = getLessonInfo(sc.lessonId);
                  return (
                    <motion.div
                      key={sc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl p-6 cursor-pointer transition-all hover:shadow-card hover:-translate-y-0.5 group bg-card border ${
                        inProgress ? "border-warning/45" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => { setSelected(scRaw); setResult(null); setAiTip(""); setShowHints(false); startLab(scRaw); }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">{sc.icon}</span>
                        <div className="flex items-center gap-2">
                          {inProgress && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-warning/10 text-warning border border-warning/30">
                              {t("continueLabel")} ({rec.score}%)
                            </span>
                          )}
                          {!rec && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-secondary/10 text-secondary dark:text-primary border border-secondary/25">
                              {t("newLabel")}
                            </span>
                          )}
                          <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                            {diffLabel(sc.difficulty)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-black text-lg mb-2 text-primary">{sc.title}</h3>
                      <p className="text-sm mb-3 leading-relaxed text-foreground/70">{sc.desc}</p>
                      {lesson && (
                        <div className="flex items-center gap-1.5 text-[10px] mb-4 text-secondary dark:text-primary">
                          <BookOpen size={11} /> {t("relatedLesson")}: {topicTitleById(lesson.lessonId, lesson.lessonTitle)}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {sc.time}</span>
                          <span className="flex items-center gap-1.5"><Zap size={12} className="text-warning" /> {sc.xp} XP</span>
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-secondary group-hover:text-primary transition-colors">
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
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {t("backToScenarios")}
            </button>

            {/* Scenario Card — نسخة مترجمة */}
            {(() => {
              const sc = localizeScenario(selected);
              return (
            <div className="rounded-2xl p-6 mb-4 bg-card border border-border shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{sc.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-primary">{sc.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                      {diffLabel(sc.difficulty)} • {sc.time} • {sc.xp} XP
                    </span>
                    {(() => {
                      const lesson = getLessonInfo(sc.lessonId);
                      return lesson ? (
                        <Link to={`/topic/${lesson.unitId}/${lesson.lessonId}`}
                          className="text-[10px] flex items-center gap-1 text-secondary dark:text-primary hover:underline">
                          <BookOpen size={10} /> {topicTitleById(lesson.lessonId, lesson.lessonTitle)}
                        </Link>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-5 leading-relaxed text-foreground/75">{sc.desc}</p>

              {/* Objectives with live check */}
              {(() => {
                const { nodes, connections } = getSimNetwork(sc.id);
                const liveResult = sc.eval(nodes, connections);
                const details = liveResult.details || [];
                const tr = localizeScenario(selected);
                const trDetails = details.map((d, i) => ({ ...d, label: tr.checks?.[i]?.label || d.label }));
                const completedCountTasks = trDetails.filter((d) => d.ok).length;
                const totalCount = trDetails.length;
                const pct = totalCount > 0 ? Math.round((completedCountTasks / totalCount) * 100) : 0;
                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-secondary dark:text-primary">{t("objectivesTitle")}</h3>
                      <span className={`text-[10px] font-bold ${pct === 100 ? "text-success" : "text-secondary dark:text-primary"}`}>
                        {completedCountTasks}/{totalCount} {t("completedCount")}
                      </span>
                      </div>
                      <div className="h-1 rounded-full mb-3 bg-muted">
                      <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-success" : "bg-secondary dark:bg-primary"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <ul className="space-y-2">
                      {trDetails.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {d.ok ? (
                            <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
                          )}
                          <span className={d.ok ? "text-success" : "text-foreground/70"}>{d.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={openInSimulator}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground transition-all hover:scale-105">
                  <Play size={14} /> {t("openInSimulator")}
                </button>
                <button onClick={evaluate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-success text-success-foreground transition-all hover:scale-105">
                  <Target size={14} /> {t("evaluate")}
                </button>
                <button onClick={() => setShowHints(!showHints)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 border border-warning/35 text-warning ${showHints ? "bg-warning/20" : "bg-warning/10"}`}>
                  <Lightbulb size={14} /> {t("hints")}
                </button>
                <button onClick={getAiTip} disabled={loadingTip}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-secondary/10 border border-secondary/30 text-secondary dark:text-primary transition-all hover:scale-105 disabled:opacity-60">
                  <Bot size={14} /> {loadingTip ? t("aiThinking") : t("aiHintBtn")}
                </button>
              </div>
            </div>
              );
            })()}

            {/* Hints */}
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl p-5 mb-4 overflow-hidden bg-warning/[0.06] border border-warning/25"
                >
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-warning">
                    <Lightbulb size={14} /> {t("hints")}
                  </h3>
                  <ul className="space-y-2">
                    {localizeScenario(selected).hints.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                        <span className="flex-shrink-0 mt-0.5 text-warning">•</span> {h}
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
                  className="rounded-2xl p-5 mb-4 bg-secondary/[0.05] border border-secondary/25"
                  >
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={14} className="text-secondary" />
                    <h3 className="text-secondary dark:text-primary font-bold text-sm">{t("aiHintBtn")}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{aiTip}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {result && (() => {
                const tr = localizeScenario(selected);
                const trDetails = (result.details || []).map((d, i) => ({
                  ...d,
                  label: tr.checks?.[i]?.label || d.label,
                }));
                const feedback = scenarioFeedback(result.passed);
                return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-6 border ${
                    result.passed ? "bg-success/[0.06] border-success/35" : "bg-destructive/[0.06] border-destructive/35"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${
                      result.passed ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                    }`}>
                      {result.score}%
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${result.passed ? "text-success" : "text-destructive"}`}>
                        {result.passed ? t("passedMsg") : t("failedMsg")}
                      </h3>
                      <p className="text-sm text-foreground/75">{feedback}</p>
                      {result.passed && (
                        <p className="text-[10px] mt-1 text-success">
                          → <Link to="/lab-history" className="underline">{t("viewHistory")}</Link>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {trDetails.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {d.ok ? <CheckCircle2 size={14} className="text-success" /> : <AlertCircle size={14} className="text-destructive" />}
                        <span className={d.ok ? "text-success" : "text-destructive"}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}