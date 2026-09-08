import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Loader2, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { t, useLang } from "@/lib/i18n";

const CONTACT_EMAIL = "edupro.education09@gmail.com";

/**
 * زر "تواصل معنا" عائم في كل الصفحات — يفتح نافذة لإرسال تعليق أو ملاحظة
 * عن التطبيق إلى بريد الدعم عبر SendEmail
 */
export default function ContactUsButton() {
  const { user } = useAuth();
  useLang();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const send = async () => {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await base44.integrations.Core.SendEmail({
        to: CONTACT_EMAIL,
        subject: `ملاحظة عن التطبيق — ${user?.full_name || user?.email || "مستخدم"}`,
        body: `المرسل: ${user?.full_name || "—"} (${user?.email || "بدون بريد"})\n\nالملاحظة:\n${text}`,
      });
      setSent(true);
      setMessage("");
      setTimeout(() => { setSent(false); setOpen(false); }, 2200);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* الزر العائم */}
      <button
        onClick={() => setOpen(true)}
        title={t("contactButton")}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-white transition-all hover:scale-105 hover:brightness-110"
        style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)", boxShadow: "0 8px 24px rgba(6,182,212,0.3)" }}
      >
        <MessageCircle size={15} />
        <span className="hidden sm:inline">{t("contactButton")}</span>
      </button>

      {/* النافذة */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,0.75)", backdropFilter: "blur(4px)" }}
            onClick={() => !busy && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-md rounded-2xl p-5"
              style={{ background: "rgba(6,12,30,0.98)", border: "1px solid rgba(6,182,212,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
                    <MessageCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black" style={{ color: "#06b6d4" }}>{t("contactTitle")}</h3>
                    <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.7)" }}>{t("contactDesc")}</p>
                  </div>
                </div>
                <button onClick={() => !busy && setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <X size={15} />
                </button>
              </div>

              {sent ? (
                <div className="flex items-center gap-2.5 px-4 py-6 rounded-xl justify-center text-sm font-bold"
                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.35)", color: "#6ee7b7" }}>
                  <CheckCircle2 size={18} /> {t("contactSent")}
                </div>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("contactPlaceholder")}
                    rows={5}
                    dir="rtl"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none resize-none mb-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)" }}
                  />

                  {failed && (
                    <div className="px-3 py-3 rounded-xl mb-3"
                      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.35)" }}>
                      <div className="flex items-center gap-2 text-[11px] font-bold mb-2" style={{ color: "#fbbf24" }}>
                        <AlertTriangle size={13} /> {t("contactError")}
                      </div>
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("ملاحظة عن التطبيق — " + (user?.full_name || user?.email || "مستخدم"))}&body=${encodeURIComponent(message.trim())}`}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white"
                        style={{ background: "linear-gradient(90deg,#d97706,#f59e0b)" }}>
                        <Send size={11} /> {t("contactOpenMail")}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => !busy && setOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
                      style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                      {t("contactCancel")}
                    </button>
                    <button onClick={send} disabled={!message.trim() || busy}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }}>
                      {busy ? <><Loader2 size={12} className="animate-spin" /> {t("contactSending")}</> : <><Send size={12} /> {t("contactSend")}</>}
                    </button>
                  </div>

                  <p className="text-[9px] text-center mt-3" style={{ color: "rgba(148,163,184,0.5)" }}>
                    edupro.education09@gmail.com
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}