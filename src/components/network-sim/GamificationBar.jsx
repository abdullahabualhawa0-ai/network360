import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, useLang } from "@/lib/i18n";

import { loadUserGamification, saveUserGamification } from "@/lib/simulatorStorage";

const LEVEL_KEYS = [
  { min: 0, nameKey: "simLevelBeginner", color: "text-muted-foreground" },
  { min: 50, nameKey: "simLevelLearner", color: "text-brand" },
  { min: 150, nameKey: "simLevelAdvanced", color: "text-secondary" },
  { min: 350, nameKey: "simLevelExpert", color: "text-warning" },
  { min: 700, nameKey: "simLevelPro", color: "text-primary" },
];

const BADGE_KEYS = [
  { id: "first_node", icon: "🖥️", nameKey: "simBadgeFirstNode" },
  { id: "first_connection", icon: "🔗", nameKey: "simBadgeFirstConnection" },
  { id: "five_nodes", icon: "🌐", nameKey: "simBadgeFiveNodes" },
  { id: "first_ping", icon: "📡", nameKey: "simBadgeFirstPing" },
  { id: "scenario_done", icon: "🏆", nameKey: "simBadgeScenarioDone" },
];

export function loadGamification() {
  return loadUserGamification();
}

export function saveGamification(data) {
  saveUserGamification(data);
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

  const level =
    [...LEVEL_KEYS].reverse().find((l) => gdata.xp >= l.min) || LEVEL_KEYS[0];
  const nextLevel = LEVEL_KEYS[LEVEL_KEYS.indexOf(level) + 1];
  const progress = nextLevel
    ? ((gdata.xp - level.min) / (nextLevel.min - level.min)) * 100
    : 100;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-[10px] bg-card border border-border text-foreground">
      <Zap size={13} className="text-primary" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-brand">
          {t(level.nameKey)}
        </span>
        <div className="w-20 h-1.5 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
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
            className="absolute top-16 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1.5 rounded-full z-50 bg-primary text-primary-foreground shadow-card"
          >
            ⭐ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}