import { useState, useEffect } from "react";
import { Zap, Star, Trophy, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "net-gamification";

const BADGES = [
  { id: "first_node", icon: "🖥️", name: "أول جهاز", desc: "أضف جهازك الأول", xp: 10 },
  { id: "first_connection", icon: "🔗", name: "أول ربط", desc: "اربط جهازين", xp: 20 },
  { id: "five_nodes", icon: "🌐", name: "شبكة صغيرة", desc: "أضف 5 أجهزة", xp: 50 },
  { id: "first_ping", icon: "📡", name: "أول Ping", desc: "أرسل packet ناجح", xp: 30 },
  { id: "scenario_done", icon: "🏆", name: "سيناريو مكتمل", desc: "أكمل سيناريو", xp: 100 },
];

const LEVELS = [
  { min: 0, name: "مبتدئ", color: "#64748b" },
  { min: 50, name: "متعلم", color: "#3B82F6" },
  { min: 150, name: "متقدم", color: "#8B5CF6" },
  { min: 350, name: "خبير", color: "#F59E0B" },
  { min: 700, name: "محترف", color: "#EF4444" },
];

export function loadGamification() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"xp":0,"badges":[]}');
  } catch {
    return { xp: 0, badges: [] };
  }
}
export function saveGamification(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
export function awardXP(amount, badgeId) {
  const g = loadGamification();
  g.xp += amount;
  if (badgeId && !g.badges.includes(badgeId)) g.badges.push(badgeId);
  saveGamification(g);
  window.dispatchEvent(new CustomEvent("gamification-update", { detail: g }));
  return g;
}

export default function GamificationBar() {
  const [gdata, setGdata] = useState(loadGamification);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setGdata(e.detail);
      setToast(`+XP earned!`);
      setTimeout(() => setToast(null), 2500);
    };
    window.addEventListener("gamification-update", handler);
    return () => window.removeEventListener("gamification-update", handler);
  }, []);

  const level = [...LEVELS].reverse().find((l) => gdata.xp >= l.min) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel
    ? ((gdata.xp - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
      style={{
        background: "rgba(2,6,23,0.8)",
        border: "1px solid rgba(139,92,246,0.3)",
      }}
    >
      <Zap size={13} style={{ color: level.color }} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold" style={{ color: level.color }}>
          {level.name}
        </span>
        <div
          className="w-20 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono">{gdata.xp} XP</span>
      </div>
      <div className="flex gap-1">
        {BADGES.filter((b) => gdata.badges.includes(b.id)).map((b) => (
          <span key={b.id} title={b.name} className="text-sm cursor-default">
            {b.icon}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-50"
          >
            ⭐ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}