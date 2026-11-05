import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";
import { useDir } from "@/lib/i18n";

const SCHOOL_LOGO =
  "https://base44.app/api/apps/69d03b21d08930672e1b680e/files/mp/public/69d03b21d08930672e1b680e/1ee1deca8_shufat-school-logo.png";
const APP_LOGO =
  "https://media.base44.com/images/public/69d03b21d08930672e1b680e/67d6360c9_logo.png";

const SEEN_KEY = "net360_splash_seen";
const DURATION_MS = 5200;

/**
 * SplashBanner — بانر افتتاحي يظهر عند أول فتح للتطبيق في الجلسة،
 * متحرك وتفاعلي (نقرة للتخطي)، ثم يختفي ويظهر التطبيق.
 */
export default function SplashBanner() {
  const direction = useDir();
  const [visible, setVisible] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).has("splash")) return true;
      return !sessionStorage.getItem(SEEN_KEY);
    } catch {
      return false;
    }
  });
  const [appLogoOk, setAppLogoOk] = useState(true);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-splash"
          dir={direction}
          role="button"
          tabIndex={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={dismiss}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") dismiss();
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 bg-background text-foreground cursor-pointer select-none overflow-hidden"
        >
          {/* شعار التطبيق مع حلقات متحركة */}
          <div className="relative w-[176px] h-[176px] flex items-center justify-center mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border border-border"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary" />
            </motion.div>
            <motion.div
              className="absolute inset-6 rounded-full border border-dashed border-border"
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="w-[104px] h-[104px] rounded-full flex items-center justify-center bg-card border border-border p-3"
            >
              {appLogoOk ? (
                <img
                  src={APP_LOGO}
                  alt="شعار التطبيق"
                  className="w-full h-full object-contain"
                  onError={() => setAppLogoOk(false)}
                />
              ) : (
                <span className="text-2xl font-black text-brand">N360</span>
              )}
            </motion.div>
          </div>

          {/* اسم البرنامج */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-center"
          >
            شبكتي
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="mt-2 text-xs sm:text-sm font-bold tracking-[0.35em] text-brand"
            dir="ltr"
          >
            NETWORK360
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-1.5 text-[11px] text-muted-foreground text-center"
          >
            مبادئ الشبكات — من الأساسيات إلى الإعدادات المتقدمة
          </motion.p>

          {/* برعاية المدرسة */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45 }}
            className="mt-9 w-full max-w-sm"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground">برعاية</span>
              <span className="h-px flex-1 bg-border" />
            </motion.div>
            <div className="flex items-center gap-3 rounded-[14px] p-3 bg-card border border-border">
              <motion.img
                src={SCHOOL_LOGO}
                alt="شعار مدرسة شعفاط الشاملة للبنين"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.75, type: "spring", stiffness: 150, damping: 15 }}
                className="w-14 h-14 rounded-[10px] object-contain bg-black flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-black text-foreground leading-tight">
                  مدرسة شعفاط الشاملة للبنين
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  الراعي الرسمي لتطبيق شبكتي
                </div>
              </div>
            </div>
          </motion.div>

          {/* شريط التقدم + تلميح */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-10 inset-x-0 px-10 flex flex-col items-center gap-2"
          >
            <div className="w-44 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
              />
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
              <MousePointerClick size={11} /> اضغط في أي مكان للمتابعة
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}