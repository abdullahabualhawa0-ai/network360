import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trophy, X, Lightbulb, Save } from "lucide-react";
import { useStudentSession } from "@/lib/studentSession";
import {
  ensureLabRecord, loadTaskStatuses,
  syncLabCounters, markTaskCompleted,
} from "@/lib/labTracking";
import { t, useLang } from "@/lib/i18n";

const safe = (p) => p.catch((e) => console.warn("skip scenario save:", e?.message));

export default function ScenarioPanel({ scenario, nodes, connections, onClose, onComplete }) {
  useLang();
  const [showHints, setShowHints] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const session = useStudentSession();

  // تتبع المهام — سجل محاولة + سجل مستقل لكل مهمة
  const labRef = useRef(null);
  const savedRef = useRef(new Set()); // فهارس المهام المحفوظة كمنجزة
  const [savedDone, setSavedDone] = useState(new Set());
  const [trackingReady, setTrackingReady] = useState(false);

  // تقييم مباشر للبنية الحالية
  const result = scenario?.eval ? scenario.eval(nodes, connections) : null;
  const details = result?.details || [];
  const totalCount = details.length;

  // تهيئة التتبع عند فتح السيناريو
  useEffect(() => {
    let cancelled = false;
    setTrackingReady(false);
    labRef.current = null;
    savedRef.current = new Set();
    setSavedDone(new Set());
    if (!session || !scenario?.eval) return undefined;

    const init = async () => {
      const total = (scenario.eval([], [])?.details || []).length;
      if (cancelled) return;
      const lab = await ensureLabRecord(scenario, total);
      if (cancelled) return;
      const statuses = await loadTaskStatuses(lab.id);
      if (cancelled) return;
      const done = new Set(
        (statuses || []).filter((s) => s.status === "completed").map((s) => s.task_index)
      );
      // مزامنة العدادات مع سجلات المهام الفعلية
      await syncLabCounters(lab, done.size);
      if (cancelled) return;
      labRef.current = lab;
      savedRef.current = done;
      setSavedDone(new Set(done));
      setTrackingReady(true);
    };
    safe(init());
    return () => { cancelled = true; };
  }, [scenario, session?.student_id]);

  // عند إنجاز مهمة جديدة (تحقق مباشر) → حفظها بشكل مستقل
  useEffect(() => {
    if (!trackingReady || !labRef.current || totalCount === 0) return;
    const newly = details
      .map((d, i) => ({ ok: d.ok, label: d.label, i }))
      .filter(({ ok, i }) => ok && !savedRef.current.has(i));
    if (newly.length === 0) return;

    const sync = async () => {
      for (const t of newly) {
        savedRef.current.add(t.i);
        await markTaskCompleted({
          lab: labRef.current,
          scenario, taskIndex: t.i, taskLabel: t.label,
        });
        setSavedDone(new Set(savedRef.current));
      }
      const total = labRef.current?.tasks_total || totalCount;
      if (savedRef.current.size >= total) onComplete?.();
    };
    safe(sync());
  }, [trackingReady, nodes, connections]);

  if (!scenario || dismissed) return null;

  // المهمة منجزة إن تحققت الآن أو حُفظ إنجازها سابقاً (تحديث مستقل لكل مهمة)
  const isDone = (task, i) => task.ok || savedDone.has(i);
  const completedCount = details.reduce((acc, d, i) => acc + (isDone(d, i) ? 1 : 0), 0);
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = totalCount > 0 && completedCount >= totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="absolute top-4 left-4 z-30 w-72 rounded-2xl overflow-hidden bg-card text-card-foreground border border-border shadow-[0_12px_32px_rgba(23,63,95,0.15)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenario.icon}</span>
          <div>
            <div className="text-xs font-black text-primary">{scenario.title}</div>
            <div className="text-[9px] text-secondary/70 dark:text-primary/70">
              {scenario.difficulty} • {scenario.xp} XP
            </div>
          </div>
        </div>
        <button onClick={() => { setDismissed(true); onClose?.(); }}
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <X size={13} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between text-[9px] mb-1.5 text-foreground/60">
          <span>{t("simScenarioProgress")} {trackingReady && <Save size={8} className="inline text-success" />}</span>
          <span className={`font-bold ${allDone ? "text-success" : "text-secondary dark:text-primary"}`}>
            {completedCount}/{totalCount} {t("simScenarioTasks")}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-primary/[0.08]">
          <motion.div
            className={`h-full rounded-full ${allDone ? "bg-success" : "bg-secondary"}`}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="px-4 pb-2 space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {details.map((task, i) => {
          const done = isDone(task, i);
          const savedOnly = done && !task.ok; // منجزة سابقاً ومحفوظة
          return (
            <motion.div
              key={i}
              className={`flex items-start gap-2 py-1.5 px-2 rounded-lg border ${
                done ? "bg-success/[0.06] border-success/25" : "bg-primary/[0.03] border-border"
              }`}
              animate={{ opacity: 1 }}
            >
              {done ? (
                <CheckCircle2 size={13} className="text-success flex-shrink-0 mt-0.5" />
              ) : (
                <Circle size={13} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
              )}
              <span className={`text-[11px] leading-snug flex-1 ${done ? "text-success" : "text-foreground/75"}`}>
                {task.label}
                {savedOnly && (
                  <span className="block text-[8px] mt-0.5 flex items-center gap-0.5 text-success/60">
                    <Save size={7} /> {t("simScenarioSaved")}
                  </span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Hints toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowHints(!showHints)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all border border-warning/30 text-warning ${
            showHints ? "bg-warning/[0.12]" : "bg-warning/[0.06]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb size={11} />
            <span>{t("simScenarioHints")}</span>
          </div>
          {showHints ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-1.5">
                {scenario.hints.map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/70">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mb-4 rounded-xl p-3 text-center bg-success/10 border border-success/40"
          >
            <Trophy size={20} className="text-warning mx-auto mb-1" />
            <div className="text-sm font-black text-success">{t("simScenarioSuccess")}</div>
            <div className="text-[10px] text-success mt-0.5">+{scenario.xp} {t("simScenarioXpEarned")}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}