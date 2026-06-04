import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Zap, Target, Clock, CheckCircle2,
  AlertCircle, Play, Bot, Lightbulb, ArrowRight
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SCENARIOS } from "../lib/scenarios";

const STORAGE_KEY = "scenario-progress";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

export default function ScenarioLab() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [loadingTip, setLoadingTip] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const navigate = useNavigate();

  const getSimNetwork = () => {
    try {
      const s = JSON.parse(localStorage.getItem("network-simulator-state") || "{}");
      return { nodes: s.nodes || [], connections: s.connections || [] };
    } catch { return { nodes: [], connections: [] }; }
  };

  const evaluate = () => {
    if (!selected) return;
    const { nodes, connections } = getSimNetwork();
    const res = selected.eval(nodes, connections);
    setResult(res);
    if (res.passed) {
      const prog = { ...progress, [selected.id]: { score: res.score, completedAt: new Date().toISOString() } };
      setProgress(prog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
    }
  };

  const openInSimulator = () => {
    if (!selected) return;
    // Store only the ID to avoid losing eval functions via JSON serialization
    localStorage.setItem("active-scenario-id", selected.id);
    navigate("/network-simulator");
  };

  const getAiTip = async () => {
    if (!selected) return;
    setLoadingTip(true);
    setAiTip("");
    try {
      const { nodes, connections } = getSimNetwork();
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
              <Link to="/" className="hover:text-purple-300 transition-colors">الرئيسية</Link>
              <ChevronLeft size={13} />
              <span className="text-purple-300">Scenario Lab</span>
            </div>
            <h1 className="text-3xl font-black mb-2" style={{
              background: "linear-gradient(135deg,#a78bfa,#06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              🧪 مختبر السيناريوهات
            </h1>
            <p className="text-slate-400 text-sm">سيناريوهات عملية حقيقية — نفّذها على محاكي الشبكة واحصل على تقييم فوري</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SCENARIOS.map((sc, i) => {
              const done = progress[sc.id];
              return (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.015] hover:shadow-2xl group"
                  style={{
                    background: "rgba(12,20,40,0.9)",
                    border: done ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(139,92,246,0.18)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = done ? "rgba(34,197,94,0.55)" : "rgba(139,92,246,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = done ? "rgba(34,197,94,0.35)" : "rgba(139,92,246,0.18)"; }}
                  onClick={() => { setSelected(sc); setResult(null); setAiTip(""); setShowHints(false); }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{sc.icon}</span>
                    <div className="flex items-center gap-2">
                      {done && (
                        <span className="text-[10px] bg-green-400/10 text-green-400 border border-green-400/30 px-2 py-0.5 rounded-full font-bold">
                          ✓ {done.score}%
                        </span>
                      )}
                      <span className={`text-[10px] border px-2.5 py-0.5 rounded-full font-bold ${sc.diffColor}`}>
                        {sc.difficulty}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-black text-white text-lg mb-2">{sc.title}</h3>
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">{sc.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {sc.time}</span>
                      <span className="flex items-center gap-1.5"><Zap size={12} className="text-yellow-400" /> {sc.xp} XP</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                      <Play size={12} /> ابدأ <ArrowRight size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => { setSelected(null); setResult(null); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              العودة للسيناريوهات
            </button>

            {/* Scenario Card */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: "rgba(12,20,40,0.95)", border: "1px solid rgba(139,92,246,0.28)", backdropFilter: "blur(16px)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selected.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-white">{selected.title}</h2>
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${selected.diffColor}`}>
                    {selected.difficulty} • {selected.time} • {selected.xp} XP
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-5 leading-relaxed">{selected.desc}</p>

              {/* Objectives with live check */}
              {(() => {
                const { nodes, connections } = getSimNetwork();
                const liveResult = selected.eval(nodes, connections);
                const details = liveResult.details || [];
                const completedCount = details.filter((d) => d.ok).length;
                const totalCount = details.length;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">الأهداف</h3>
                      <span className="text-[10px] font-bold" style={{ color: pct === 100 ? "#34d399" : "rgba(167,139,250,0.8)" }}>
                        {completedCount}/{totalCount} مكتمل
                      </span>
                    </div>
                    {/* Progress */}
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
                <button
                  onClick={openInSimulator}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
                >
                  <Play size={14} /> افتح في المحاكي
                </button>
                <button
                  onClick={evaluate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:brightness-110"
                  style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
                >
                  <Target size={14} /> تقييم الحل
                </button>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ background: showHints ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
                >
                  <Lightbulb size={14} /> تلميحات
                </button>
                <button
                  onClick={getAiTip}
                  disabled={loadingTip}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}
                >
                  <Bot size={14} /> {loadingTip ? "جاري التفكير..." : "تلميح AI"}
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
                    <Lightbulb size={14} /> تلميحات السيناريو
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
                    <h3 className="text-purple-400 font-bold text-sm">تلميح المساعد الذكي</h3>
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
                        {result.passed ? "🎉 ممتاز! اجتزت السيناريو" : "❌ لم تجتز السيناريو بعد"}
                      </h3>
                      <p className="text-slate-300 text-sm">{result.feedback}</p>
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