import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw, ChevronDown } from "lucide-react";

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

/**
 * PullToRefresh — يلف المحتوى القابل للتمرير ويتيح التحديث بالسحب لأسفل.
 * يستخدم Framer Motion لتتبع الإيماءة وعرض مؤشر السحب.
 * @param {function} onRefresh - دالة التحديث (async)
 * @param {ReactNode} children - محتوى الصفحة
 */
export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const [refreshing, setRefreshing] = useState(false);
  const pull = useMotionValue(0);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  const indicatorHeight = useTransform(pull, [0, PULL_THRESHOLD], [0, 40]);
  const indicatorOpacity = useTransform(pull, [0, PULL_THRESHOLD * 0.4, PULL_THRESHOLD], [0, 0.4, 1]);
  const rotate = useTransform(pull, [0, PULL_THRESHOLD], [180, 0]);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    if (window.scrollY <= 0) {
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pullingRef.current || refreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) { pull.set(0); return; }
    pull.set(Math.min(delta * 0.5, MAX_PULL));
  }, [refreshing, pull]);

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    if (pull.get() >= PULL_THRESHOLD) {
      setRefreshing(true);
      pull.set(50);
      try { await onRefresh?.(); } finally {
        setRefreshing(false);
        pull.set(0);
      }
    } else {
      pull.set(0);
    }
  }, [onRefresh, pull]);

  return (
    <div className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      <motion.div style={{ height: indicatorHeight, opacity: indicatorOpacity }}
        className="flex items-center justify-center overflow-hidden">
        <motion.div style={{ rotate }}>
          {refreshing
            ? <RefreshCw size={20} className="animate-spin" style={{ color: "#2F6690" }} />
            : <ChevronDown size={20} style={{ color: "#2F6690" }} />}
        </motion.div>
      </motion.div>
      <motion.div style={{ y: pull }}>
        {children}
      </motion.div>
    </div>
  );
}