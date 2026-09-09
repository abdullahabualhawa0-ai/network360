import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, GraduationCap, Check, Loader2, School, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getSchoolName } from "@/lib/schoolUtils";
import { getLang as getSavedLang, setLang as applyI18nLang } from "@/lib/i18n";

const LANGUAGES = [
  { id: "ar", label: "العربية", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { id: "en", label: "الإنجليزية", native: "English", flag: "🇬🇧", dir: "ltr" },
  { id: "he", label: "العبرية", native: "עברית", flag: "🇮🇱", dir: "rtl" },
];

const PROFILE_STATUS = {
  pending: { label: "بانتظار موافقة المدرسة", color: "#fbbf24" },
  approved: { label: "حساب موثّق ✓", color: "#34d399" },
  rejected: { label: "تم رفض الحساب", color: "#f87171" },
  disabled: { label: "الحساب معطّل", color: "#94a3b8" },
};

export default function Settings() {
  const { user } = useAuth();
  const [lang, setLang] = useState(getSavedLang);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [schoolName, setSchoolName] = useState("عام");

  // تحميل التفضيلات والملف الشخصي
  useEffect(() => {
    if (!user) return;
    setLang(user.preferred_language || getSavedLang());
    (async () => {
      const profiles = await base44.entities.StudentProfile.filter({ user_id: user.id }).catch(() => []);
      const p = profiles?.[0] || null;
      setProfile(p);
      if (p?.preferred_language && !user.preferred_language) setLang(p.preferred_language);
      if (p?.school_id) {
        const name = await getSchoolName(p.school_id);
        setSchoolName(name);
      }
    })();
  }, [user?.id]);

  // تطبيق اتجاه الواجهة + حفظ التفضيل ليعمل تعدد اللغات في كامل الواجهة
  useEffect(() => {
    applyI18nLang(lang);
  }, [lang]);

  const saveLanguage = async (newLang) => {
    if (!user) return;
    setLang(newLang);
    setSaving(true);
    setSaved(false);
    // حفظ على حساب المستخدم
    await base44.auth.updateMe({ preferred_language: newLang }).catch(() => {});
    // حفظ على ملف الطالب إن وجد
    if (profile?.id) {
      await base44.entities.StudentProfile.update(profile.id, { preferred_language: newLang }).catch(() => {});
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // معلومات التواصل — بريد الدعم قابل للتعديل من المالك فقط (SystemSetting)
  const isAdmin = user?.role === "admin";
  const [contactEmail, setContactEmail] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    base44.entities.SystemSetting.filter({ key: "contact_email" })
      .then((rows) => setContactEmail(rows?.[0]?.value || ""))
      .catch(() => {});
  }, []);

  const saveContactEmail = async () => {
    const v = contactEmail.trim();
    if (!v) return;
    setSavingContact(true);
    setContactSaved(false);
    try {
      const rows = await base44.entities.SystemSetting.filter({ key: "contact_email" });
      if (rows?.length > 0) await base44.entities.SystemSetting.update(rows[0].id, { value: v });
      else await base44.entities.SystemSetting.create({ key: "contact_email", value: v });
      setContactSaved(true);
      setTimeout(() => setContactSaved(false), 2500);
    } catch { /* تعديل البريد متاح للمالك فقط */ }
    setSavingContact(false);
  };

  const statusInfo = profile ? (PROFILE_STATUS[profile.status] || PROFILE_STATUS.pending) : null;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#475569,#334155)" }}>
            <SettingsIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">الإعدادات</h1>
            <p className="text-xs text-muted-foreground">حسابك، لغة الواجهة، ومعلومات مدرستك</p>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl p-5 mb-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <User size={15} />
            <h2 className="text-sm font-black">الحساب</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">الاسم</div>
              <div className="font-bold">{user?.full_name || "—"}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">البريد الإلكتروني</div>
              <div className="font-bold truncate">{user?.email || "—"}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">الدور</div>
              <div className="font-bold">{user?.role === "admin" ? "معلم / مدير" : "طالب"}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">حالة الحساب</div>
              <div className="font-bold" style={{ color: statusInfo?.color || "#34d399" }}>
                {statusInfo?.label || "مسجّل"}
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl p-5 mb-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <GraduationCap size={15} />
            <h2 className="text-sm font-black">لغة الواجهة</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {LANGUAGES.map((l) => {
              const active = lang === l.id;
              return (
                <button key={l.id} onClick={() => saveLanguage(l.id)} disabled={saving}
                  className="rounded-xl p-4 text-center transition-all disabled:opacity-60"
                  style={{
                    background: active ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? "#06b6d4" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: active ? "0 0 14px rgba(6,182,212,0.2)" : "none",
                  }}>
                  <div className="text-2xl mb-1.5">{l.flag}</div>
                  <div className="text-xs font-bold" style={{ color: active ? "#06b6d4" : "hsl(var(--foreground))" }}>
                    {l.native}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-[10px]">
            <span className="text-muted-foreground">
              يتم حفظ تفضيلك تلقائياً وتحديث اتجاه الواجهة
            </span>
            {saving ? (
              <span className="flex items-center gap-1 text-muted-foreground"><Loader2 size={10} className="animate-spin" /> جاري الحفظ...</span>
            ) : saved ? (
              <span className="flex items-center gap-1 text-green-400"><Check size={10} /> تم الحفظ</span>
            ) : null}
          </div>
        </div>

        {/* School */}
        <div className="rounded-2xl p-5 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <School size={15} />
            <h2 className="text-sm font-black">المدرسة</h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div>
              <div className="text-xs font-bold">{schoolName}</div>
              <div className="text-[10px] text-muted-foreground">
                {profile ? "بياناتك (التقدم، النتائج، السيناريوهات) مرتبطة بهذه المدرسة فقط" : "لم يتم إلحاقك بمدرسة بعد — بياناتك على النطاق العام"}
              </div>
            </div>
            {statusInfo && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `color-mix(in srgb, ${statusInfo.color} 12%, transparent)`, color: statusInfo.color }}>
                {statusInfo.label}
              </span>
            )}
          </motion.div>
        </div>

        {/* معلومات التواصل */}
        <div className="rounded-2xl p-5 mt-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4 text-cyan-400">
            <Mail size={15} />
            <h2 className="text-sm font-black">معلومات التواصل</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            البريد الذي تصل إليه ملاحظات المستخدمين عبر زر «تواصل معنا»
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
              disabled={!isAdmin} dir="ltr"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none disabled:opacity-60"
              style={{ border: "1px solid hsl(var(--border))" }} />
            {isAdmin && (
              <button onClick={saveContactEmail} disabled={savingContact || !contactEmail.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
                {savingContact ? <Loader2 size={12} className="animate-spin" /> : contactSaved ? <Check size={12} /> : null}
                {savingContact ? "جاري الحفظ..." : contactSaved ? "تم الحفظ" : "حفظ البريد"}
              </button>
            )}
          </div>
          {!isAdmin && (
            <p className="text-[10px] text-muted-foreground mt-2">تعديل البريد متاح لمالك المنصة فقط</p>
          )}
        </div>
      </div>
    </div>
  );
}