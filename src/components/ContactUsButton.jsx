import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Loader2, Send, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { t, useLang } from "@/lib/i18n";

// البريد الافتراضي — يُستبدل تلقائياً بقيمة الإعدادات → معلومات التواصل (SystemSetting)
const CONTACT_EMAIL = "edupro.education09@gmail.com";

/**
 * زر "تواصل معنا" عائم في كل الصفحات — يفتح نافذة لإرسال تعليق أو ملاحظة
 * عن التطبيق إلى بريد الدعم عبر SendEmail
 */
export default function ContactUsButton() {
  const { user } = useAuth();
  const session = useStudentSession();
  useLang();
  const [contactEmail, setContactEmail] = useState(CONTACT_EMAIL);
  const [open, setOpen] = useState(false);

  // بريد التواصل قابل للتعديل من: الإعدادات → معلومات التواصل
  useEffect(() => {
    (async () => {
      try {
        const rows = session
          ? await studentApi("filter", "SystemSetting", { query: { key: "contact_email" } })
          : await base44.entities.SystemSetting.filter({ key: "contact_email" });
        if (rows?.[0]?.value) setContactEmail(rows[0].value);
      } catch { /* البريد الافتراضي */ }
    })();
  }, [session?.student_id]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  // نسخ البريد إلى الحافظة — يعمل على Desktop وMobile
  const copyEmailToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(contactEmail);
      } else {
        const ta = document.createElement("textarea");
        ta.value = contactEmail;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* الحافظة غير متاحة */ }
  };

  const send = async () => {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await base44.integrations.Core.SendEmail({
        to: contactEmail,
        subject: `ملاحظة عن التطبيق — ${user?.full_name || user?.email || session?.student_name || session?.student_code || "مستخدم"}`,
        body: `المرسل: ${user?.full_name || session?.student_name || "—"} (${user?.email || session?.student_code || "بدون بريد"})\n\nالملاحظة:\n${text}`
      });
      setSent(true);
      setMessage("");
      setTimeout(() => {setSent(false);setOpen(false);}, 2200);
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
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black text-white transition-all hover:scale-105"
        style={{ background: "#173F5F", boxShadow: "0 6px 18px rgba(23,63,95,0.25)" }}>
        
        <MessageCircle size={15} />
        <span className="hidden sm:inline">{t("contactButton")}</span>
      </button>

      {/* النافذة */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(2,6,23,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => !busy && setOpen(false)}>
          
            <motion.div
            initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 24px 60px rgba(23,63,95,0.25)" }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl">
            
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#173F5F" }}>
                    <MessageCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black" style={{ color: "#173F5F" }}>{t("contactTitle")}</h3>
                    <p className="text-[10px]" style={{ color: "rgba(31,41,55,0.55)" }}>{t("contactDesc")}</p>
                  </div>
                </div>
                <button onClick={() => !busy && setOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X size={15} />
                </button>
              </div>

              {sent ?
            <div className="flex items-center gap-2.5 px-4 py-6 rounded-xl justify-center text-sm font-bold"
            style={{ background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }}>
                  <CheckCircle2 size={18} /> {t("contactSent")}
                </div> :

            <>
                  <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("contactPlaceholder")}
                rows={5}
                dir="rtl"
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none mb-3"
                style={{ background: "#F7F9FC", border: "1px solid #E2E8F0" }} />
              

                  {failed &&
              <div className="px-3 py-3 rounded-xl mb-3"
              style={{ background: "rgba(214,158,46,0.08)", border: "1px solid rgba(214,158,46,0.35)" }}>
                      <div className="flex items-center gap-2 text-[11px] font-bold mb-2" style={{ color: "#D69E2E" }}>
                        <AlertTriangle size={13} /> {t("contactError")}
                      </div>
                      <a
                  href={`mailto:${contactEmail}?subject=${encodeURIComponent("ملاحظة عن التطبيق — " + (user?.full_name || user?.email || "مستخدم"))}&body=${encodeURIComponent(message.trim())}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white"
                  style={{ background: "#D69E2E" }}>
                        <Send size={11} /> {t("contactOpenMail")}
                      </a>
                    </div>
              }

                  <div className="flex gap-2">
                    <button onClick={() => !busy && setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-muted"
                style={{ border: "1px solid #E2E8F0", color: "rgba(31,41,55,0.6)" }}>
                      {t("contactCancel")}
                    </button>
                    <button onClick={send} disabled={!message.trim() || busy}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                style={{ background: "#173F5F" }}>
                      {busy ? <><Loader2 size={12} className="animate-spin" /> {t("contactSending")}</> : <><Send size={12} /> {t("contactSend")}</>}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3">
                    <p className="text-center text-xl truncate font-bold" style={{ color: "#2F6690" }}>
                      {contactEmail}
                    </p>
                    <button onClick={copyEmailToClipboard}
                      title={t("copy")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:bg-muted"
                      style={{ border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690", background: "rgba(47,102,144,0.07)" }}>
                      {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                      {copied ? t("copiedMsg") : t("copy")}
                    </button>
                  </div>
                </>
            }
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}