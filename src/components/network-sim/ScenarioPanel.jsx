import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trophy, X, Lightbulb } from "lucide-react";

export default function ScenarioPanel({ scenario, nodes, connections, onClose, onComplete }) {
  const [showHints, setShowHints] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!scenario || dismissed) return null;

  // Live evaluation of objectives
  const result = scenario.eval(nodes, connections);
  const details = result.details || [];
  const completedCount = details.filter((d) => d.ok).length;
  const totalCount = details.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="absolute top-4 left-4 z-30 w-72 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "rgba(10,14,30,0.96)",
        border: "1px solid rgba(139,92,246,0.35)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{scenario.icon}</span>
          <div>
            <div className="text-xs font-black text-white">{scenario.title}</div>
            <div className="text-[9px]" style={{ color: "rgba(167,139,250,0.7)" }}>
              {scenario.difficulty} • {scenario.xp} XP
            </div>
          </div>
        </div>
        <button onClick={() => { setDismissed(true); onClose?.(); }}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <X size={13} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between text-[9px] mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>
          <span>التقدم</span>
          <span className="font-bold" style={{ color: allDone ? "#34d399" : "#a78bfa" }}>
            {completedCount}/{totalCount} مهمة
          </span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: allDone ? "linear-gradient(90deg,#059669,#34d399)" : "linear-gradient(90deg,#7c3aed,#06b6d4)" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="px-4 pb-2 space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {details.map((task, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-2 py-1.5 px-2 rounded-lg"
            style={{
              background: task.ok ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${task.ok ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.06)"}`,
            }}
            animate={{ opacity: 1 }}
          >
            {task.ok ? (
              <CheckCircle2 size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }} />
            )}
            <span className="text-[11px] leading-snug" style={{ color: task.ok ? "#86efac" : "rgba(148,163,184,0.8)" }}>
              {task.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Hints toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowHints(!showHints)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
          style={{
            background: showHints ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.25)",
            color: "#fbbf24",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb size={11} />
            <span>تلميحات</span>
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
                  <div key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: "rgba(251,191,36,0.8)" }}>
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
            className="mx-4 mb-4 rounded-xl p-3 text-center"
            style={{ background: "linear-gradient(135deg,rgba(5,150,105,0.25),rgba(52,211,153,0.15))", border: "1px solid rgba(52,211,153,0.4)" }}
          >
            <Trophy size={20} className="text-yellow-400 mx-auto mb-1" />
            <div className="text-sm font-black text-green-300">🎉 أحسنت! أكملت السيناريو</div>
            <div className="text-[10px] text-green-400 mt-0.5">+{scenario.xp} XP مكتسبة</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}