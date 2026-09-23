import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, ChevronDown, CheckCircle2 } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

function calcReadTime(text) {
  const words = text?.split(/\s+/).length || 0;
  if (words < 200) return 45;
  if (words < 500) return 60;
  if (words < 900) return 90;
  return 120;
}

export default function ReadingGate({ content, children }) {
  useLang();
  const readTime = calcReadTime(content);
  const [elapsed, setElapsed] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setElapsed(0);
    setUnlocked(false);
    setShowQuiz(false);
  }, [content]);

  useEffect(() => {
    if (unlocked) return;
    const id = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= readTime) { setUnlocked(true); clearInterval(id); return readTime; }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [readTime, unlocked, content]);

  const pct = Math.min((elapsed / readTime) * 100, 100);
  const remaining = readTime - elapsed;

  if (showQuiz) return <>{children}</>;

  return (
    <>
      {/* Reading timer bar at top */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen size={14} className="text-primary" />
                <span>{t("readGateHint")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-mono text-primary">
                <Clock size={13} />
                <span>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock button */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-6 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 text-sm text-success mb-3">
              <CheckCircle2 size={16} />
              <span>{t("readGateReady")}</span>
            </div>
            <motion.button
              onClick={() => setShowQuiz(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-bold text-base hover:shadow-lg transition-shadow"
            >
              <CheckCircle2 size={18} />
              {t("readGateStartQuiz")}
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}