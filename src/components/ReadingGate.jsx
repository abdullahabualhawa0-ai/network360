import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, ChevronDown, CheckCircle2 } from "lucide-react";

function calcReadTime(text) {
  const words = text?.split(/\s+/).length || 0;
  if (words < 200) return 45;
  if (words < 500) return 60;
  if (words < 900) return 90;
  return 120;
}

export default function ReadingGate({ content, children }) {
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
            className="mb-6 bg-gradient-to-l from-primary/5 to-secondary/5 border border-primary/15 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen size={14} className="text-primary" />
                <span>اقرأ الشرح أولاً قبل الأسئلة</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-mono text-primary">
                <Clock size={13} />
                <span>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-l from-primary to-secondary rounded-full"
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
            <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3">
              <CheckCircle2 size={16} />
              <span>انتهى وقت القراءة — أنت مستعد للاختبار!</span>
            </div>
            <motion.button
              onClick={() => setShowQuiz(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-l from-primary to-secondary text-white font-bold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
            >
              <CheckCircle2 size={18} />
              اختبر نفسك
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}