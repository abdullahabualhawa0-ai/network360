import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { t, useDir, useLang } from "@/lib/i18n";

const SCHOOL_LOGO =
  "https://base44.app/api/apps/69d03b21d08930672e1b680e/files/mp/public/69d03b21d08930672e1b680e/56cd31a1e_shufat-school-mark.png";
const APP_LOGO =
  "https://media.base44.com/images/public/69d03b21d08930672e1b680e/67d6360c9_logo.png";

const SEEN_KEY = "net360_splash_seen";
const DURATION_MS = 5200;

/**
 * SplashBanner — بانر افتتاحي يظهر عند أول فتح للتطبيق في الجلسة،
 * متحرك، ويختفي تلقائياً بعد اكتمال التحميل ليظهر التطبيق.
 */
export default function SplashBanner() {
  const direction = useDir();
  useLang();
  const [visible, setVisible] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).has("splash")) return true;
      return !sessionStorage.getItem(SEEN_KEY);
    } catch {
      return false;
    }
  });
  const [appLogoOk, setAppLogoOk] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(false);
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-splash"
          dir={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 bg-background text-foreground select-none overflow-hidden"
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
                  alt={t("appName")}
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
            NETWORK360
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="mt-2 text-sm font-bold text-brand text-center"
          >
            {t("appName")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.4 }}
            className="mt-1 text-[11px] text-muted-foreground text-center"
          >
            {t("appTagline")}
          </motion.p>

          {/* برعاية المدرسة */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45 }}
            className="mt-9 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground">{t("sponsoredBy")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="flex items-center gap-3 rounded-[14px] p-3 bg-card border border-border">
              <motion.img
                src={SCHOOL_LOGO}
                alt={t("sponsorSchoolName")}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.75, type: "spring", stiffness: 150, damping: 15 }}
                className="w-16 h-16 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-black text-foreground leading-tight">
                  {t("sponsorSchoolName")}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {t("sponsorSchoolNote")}
                </div>
              </div>
            </div>
          </motion.div>

          {/* شريط التقدم */}
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
              <Loader2 size={11} className="animate-spin" /> {t("loading")}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}