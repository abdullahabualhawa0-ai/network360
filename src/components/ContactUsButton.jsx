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
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(23,63,95,0.25)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition-all hover:scale-105">
        <MessageCircle size={15} />
        <span className="hidden sm:inline">{t("contactButton")}</span>
      </button>

      {/* النافذة */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-[4px]"
          onClick={() => setOpen(false)}>

          <motion.div
            initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md rounded-2xl p-5 bg-card text-card-foreground border border-border shadow-[0_24px_60px_rgba(23,63,95,0.25)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
            dir={direction}>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                  <MessageCircle className="text-primary-foreground" size={16} />
                </div>
                <h3 className="text-sm font-black text-primary">{t("contactTitle")}</h3>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* جملة توضيحية بدلاً من نموذج الإرسال */}
            <p className="text-sm leading-relaxed mb-5 text-foreground/75">
              {t("contactInfoMsg")}
            </p>

            {/* البريد + زر النسخ */}
            <div className="flex items-center justify-between gap-2 rounded-xl p-3 bg-secondary/[0.06] border border-secondary/20">
              <div className="flex items-center gap-2 min-w-0">
                <Mail size={15} className="flex-shrink-0 text-secondary dark:text-primary" />
                <span className="text-sm font-bold truncate text-primary" dir="ltr">
                  {contactEmail}
                </span>
              </div>
              <button onClick={copyEmailToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex-shrink-0 border ${
                  copied
                    ? "bg-success/[0.12] text-success border-success/40"
                    : "bg-primary text-primary-foreground border-primary"
                }`}>
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? t("copiedMsg") : t("copyEmailBtn")}
              </button>
            </div>

            {/* رسالة نجاح النسخ */}
            <AnimatePresence>
              {copied &&
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold bg-success/[0.08] border border-success/35 text-success">
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