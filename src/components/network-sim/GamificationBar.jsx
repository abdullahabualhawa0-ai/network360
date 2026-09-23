import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, useLang } from "@/lib/i18n";

const STORAGE_KEY = "net-gamification";

const BADGE_KEYS = [
  { id: "first_node", icon: "🖥️", nameKey: "simBadgeFirstNode" },
  { id: "first_connection", icon: "🔗", nameKey: "simBadgeFirstConnection" },
  { id: "five_nodes", icon: "🌐", nameKey: "simBadgeFiveNodes" },
  { id: "first_ping", icon: "📡", nameKey: "simBadgeFirstPing" },
  { id: "scenario_done", icon: "🏆", nameKey: "simBadgeScenarioDone" },
];

const LEVEL_KEYS = [
  { min: 0, nameKey: "simLevelBeginner", color: "#64748B" },
  { min: 50, nameKey: "simLevelLearner", color: "#2F6690" },
  { min: 150, nameKey: "simLevelAdvanced", color: "#3A86A8" },
  { min: 350, nameKey: "simLevelExpert", color: "#D69E2E" },
  { min: 700, nameKey: "simLevelPro", color: "#173F5F" },
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
  useLang();
  const [gdata, setGdata] = useState(loadGamification);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setGdata(e.detail);
      setToast(t("simXpEarned"));
      setTimeout(() => setToast(null), 2500);
    };
    window.addEventListener("gamification-update", handler);
    return () => window.removeEventListener("gamification-update", handler);
  }, []);

  const level = [...LEVEL_KEYS].reverse().find((l) => gdata.xp >= l.min) || LEVEL_KEYS[0];
  const nextLevel = LEVEL_KEYS[LEVEL_KEYS.indexOf(level) + 1];
  const progress = nextLevel
    ? ((gdata.xp - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
      }}
    >
      <Zap size={13} style={{ color: level.color }} />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold" style={{ color: level.color }}>
          {t(level.nameKey)}
        </span>
        <div
          className="w-20 h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(23,63,95,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{gdata.xp} XP</span>
      </div>
      <div className="flex gap-1">
        {BADGE_KEYS.filter((b) => gdata.badges.includes(b.id)).map((b) => (
          <span key={b.id} title={t(b.nameKey)} className="text-sm cursor-default">
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
            className="absolute top-16 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-50"
            style={{ background: "#D69E2E", color: "#FFFFFF" }}
          >
            ⭐ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}