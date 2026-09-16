import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, CheckCircle2, Copy, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { t, useLang, useDir } from "@/lib/i18n";

// البريد الافتراضي — يُستبدل تلقائياً بقيمة الإعدادات → معلومات التواصل (SystemSetting)
const CONTACT_EMAIL = "edupro.education09@gmail.com";

/**
 * زر "تواصل معنا" عائم في كل الصفحات.
 * نسخة مبسطة: لا نموذج إرسال ولا منطق Backend — فقط عرض البريد وزر نسخه.
 */
export default function ContactUsButton() {
  const { user } = useAuth();
  const session = useStudentSession();
  useLang();
  const direction = useDir();
  const [contactEmail, setContactEmail] = useState(CONTACT_EMAIL);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
          onClick={() => setOpen(false)}>

          <motion.div
            initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 24px 60px rgba(23,63,95,0.25)" }}
            onClick={(e) => e.stopPropagation()}
            dir={direction}>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#173F5F" }}>
                  <MessageCircle className="text-white" size={16} />
                </div>
                <h3 className="text-sm font-black" style={{ color: "#173F5F" }}>{t("contactTitle")}</h3>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* جملة توضيحية بدلاً من نموذج الإرسال */}
            <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(31,41,55,0.75)" }}>
              {t("contactInfoMsg")}
            </p>

            {/* البريد + زر النسخ */}
            <div className="flex items-center justify-between gap-2 rounded-xl p-3"
              style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={15} className="flex-shrink-0" style={{ color: "#2F6690" }} />
                <span className="text-sm font-bold truncate" dir="ltr" style={{ color: "#173F5F" }}>
                  {contactEmail}
                </span>
              </div>
              <button onClick={copyEmailToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex-shrink-0"
                style={{
                  background: copied ? "rgba(46,125,91,0.12)" : "#173F5F",
                  color: copied ? "#2E7D5B" : "#FFFFFF",
                  border: copied ? "1px solid rgba(46,125,91,0.4)" : "1px solid #173F5F",
                }}>
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? t("copiedMsg") : t("copyEmailBtn")}
              </button>
            </div>

            {/* رسالة نجاح النسخ */}
            <AnimatePresence>
              {copied &&
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold"
                  style={{ background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }}>
                  <CheckCircle2 size={12} /> {t("copiedMsg")}
                </motion.div>
              }
            </AnimatePresence>
          </motion.div>
        </motion.div>
        }
      </AnimatePresence>
    </>);
}