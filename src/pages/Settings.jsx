import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, GraduationCap, Check, Loader2, School, Mail, LogOut, Shield } from "lucide-react";
import BackButton from "@/components/BackButton";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { studentApi, useStudentSession, clearStudentSession } from "@/lib/studentSession";
import { useTeacherSession, clearTeacherSession } from "@/lib/teacherSession";
import { useSchoolAdminSession, clearSchoolAdminSession } from "@/lib/schoolAdminSession";
import { getLang as getSavedLang, setLang as applyI18nLang, t, useLang, useDir } from "@/lib/i18n";

const LANGUAGES = [
  { id: "ar", label: "العربية", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { id: "en", label: "الإنجليزية", native: "English", flag: "🇬🇧", dir: "ltr" },
  { id: "he", label: "العبرية", native: "עברית", flag: "🇮🇱", dir: "rtl" },
];

const PROFILE_STATUS = {
  pending: { key: "settingsStatusPending", color: "#D69E2E" },
  approved: { key: "settingsStatusApproved", color: "#2E7D5B" },
  rejected: { key: "settingsStatusRejected", color: "#C94C4C" },
  disabled: { key: "settingsStatusDisabled", color: "#64748B" },
};

/**
 * يحدد الدور الحقيقي والمصدر الموحد للحقيقة من جميع الجلسات الممكنة.
 * الأولوية: Base44 auth (admin/school_admin) → schoolAdminSession → teacherSession → studentSession
 */
function useActiveRole() {
  const { user } = useAuth();
  const studentSession = useStudentSession();
  const teacherSession = useTeacherSession();
  const schoolAdminSession = useSchoolAdminSession();

  if (user?.role === "admin") {
    return { role: "owner", code: null, name: user.full_name || user.email, email: user.email, schoolId: null };
  }
  if (user?.role === "school_admin") {
    return { role: "school_admin", code: null, name: user.full_name || user.email, email: user.email, schoolId: user.data?.school_id };
  }
  if (schoolAdminSession) {
    return { role: "school_admin", code: schoolAdminSession.admin_code, name: schoolAdminSession.school_name, email: null, schoolId: schoolAdminSession.school_id, schoolName: schoolAdminSession.school_name, schoolCode: schoolAdminSession.school_code };
  }
  if (teacherSession) {
    return { role: "teacher", code: teacherSession.teacher_code, name: teacherSession.teacher_name, email: null, schoolId: teacherSession.school_id, schoolCode: teacherSession.school_code, subject: teacherSession.subject };
  }
  if (studentSession) {
    return { role: "student", code: studentSession.student_code, name: studentSession.student_name, email: null, schoolId: studentSession.school_id, studentId: studentSession.student_id };
  }
  return { role: null };
}

export default function Settings() {
  const navigate = useNavigate();
  useLang();
  const direction = useDir();
  const active = useActiveRole();
  const studentSession = useStudentSession();

  const isStudent = active.role === "student";
  const isTeacher = active.role === "teacher";
  const isSchoolAdmin = active.role === "school_admin";
  const isOwner = active.role === "owner";
  const isAdmin = isOwner; // تعديل البريد للمالك فقط
  // الخطة الشخصية: لا تُظهر قسم المدرسة
  const isPersonalStudent = isStudent && !!studentSession?.is_personal;

  const [lang, setLang] = useState(getSavedLang);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [schoolName, setSchoolName] = useState(t("schoolGeneral"));

  // جلب ملف الطالب واسم مدرسته
  useEffect(() => {
    if (!isStudent) return;
    (async () => {
      try {
        const p = await studentApi("get", "StudentProfile", { id: active.studentId });
        setProfile(p);
        const school = await studentApi("get", "School", { id: active.schoolId });
        if (school?.name) setSchoolName(school.name);
      } catch { /* عرض الحد الأدنى */ }
    })();
  }, [isStudent, active.studentId, active.schoolId]);

  // جلب اسم مدرسة الأستاذ/المشرف
  useEffect(() => {
    if (isStudent || isOwner) return;
    if (active.schoolName) { setSchoolName(active.schoolName); return; }
    if (!active.schoolId) return;
    (async () => {
      try {
        const school = isStudent
          ? await studentApi("get", "School", { id: active.schoolId })
          : await base44.entities.School.get(active.schoolId);
        if (school?.name) setSchoolName(school.name);
      } catch { /* */ }
    })();
  }, [isStudent, isOwner, active.schoolId, active.schoolName]);

  useEffect(() => { applyI18nLang(lang); }, [lang]);

  const saveLanguage = async (newLang) => {
    setLang(newLang);
    setSaving(true);
    setSaved(false);
    if (isStudent && profile?.id) {
      await studentApi("update", "StudentProfile", { id: profile.id, data: { preferred_language: newLang } }).catch(() => {});
    } else if (active.role === "owner" || active.role === "school_admin") {
      await base44.auth.updateMe({ preferred_language: newLang }).catch(() => {});
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // معلومات التواصل
  const [contactEmail, setContactEmail] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = isStudent
          ? await studentApi("filter", "SystemSetting", { query: { key: "contact_email" } })
          : await base44.entities.SystemSetting.filter({ key: "contact_email" });
        setContactEmail(rows?.[0]?.value || "");
      } catch { /* */ }
    })();
  }, [isStudent]);

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
    } catch { /* */ }
    setSavingContact(false);
  };

  const handleLogout = () => {
    if (isStudent) { clearStudentSession(); navigate("/student-login", { replace: true }); }
    else if (isTeacher) { clearTeacherSession(); navigate("/student-login", { replace: true }); }
    else if (isSchoolAdmin && !active.email) { clearSchoolAdminSession(); window.location.href = "/login"; }
    else { base44.auth.logout("/login"); }
  };

  const statusInfo = profile ? (PROFILE_STATUS[profile.status] || PROFILE_STATUS.pending) : null;

  // تحديد الدور والرمز حسب الجلسة النشطة
  const roleLabel = isStudent ? t("roleStudent")
    : isTeacher ? t("teacherRole")
    : isSchoolAdmin ? t("adminLoginLink")
    : isOwner ? t("roleAdmin")
    : "—";

  const codeLabel = isStudent ? t("studentCodeLabel")
    : isTeacher ? t("teacherCode")
    : isSchoolAdmin ? t("adminCode")
    : isOwner ? t("emailLabel")
    : "";

  const codeValue = isStudent ? (profile?.student_code || active.code)
    : isTeacher ? active.code
    : isSchoolAdmin ? (active.code || "—")
    : isOwner ? (active.email || "—")
    : "—";

  const displayName = isStudent ? (profile?.full_name || active.name)
    : active.name || "—";

  const displayEmail = isStudent ? (profile?.email || "—")
    : active.email || (isTeacher || isSchoolAdmin ? "—" : "—");

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-4">
          <BackButton fallback={isStudent ? "/" : isTeacher ? "/teacher/dashboard" : "/admin/schools"} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
            <SettingsIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("settingsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("settingsSubtitle")}</p>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl p-5 mb-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: "#2F6690" }}>
            <User size={15} />
            <h2 className="text-sm font-black">{t("accountSection")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ background: "rgba(23,63,95,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">{t("nameLabel")}</div>
              <div className="font-bold">{displayName}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(23,63,95,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">{codeLabel}</div>
              <div className="font-bold truncate" dir="ltr">{codeValue}</div>
            </div>
            {(isSchoolAdmin || isTeacher) && active.schoolCode && (
              <div className="rounded-xl p-3" style={{ background: "rgba(23,63,95,0.03)" }}>
                <div className="text-[10px] text-muted-foreground mb-1">{t("schoolCode")}</div>
                <div className="font-bold truncate" dir="ltr">{active.schoolCode}</div>
              </div>
            )}
            <div className="rounded-xl p-3" style={{ background: "rgba(23,63,95,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">{t("roleLabel")}</div>
              <div className="font-bold flex items-center gap-1.5">
                {isOwner && <Shield size={12} style={{ color: "#173F5F" }} />}
                {roleLabel}
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(23,63,95,0.03)" }}>
              <div className="text-[10px] text-muted-foreground mb-1">{t("statusLabel")}</div>
              <div className="font-bold" style={{ color: statusInfo?.color || "#2E7D5B" }}>
                {isStudent ? (statusInfo ? t(statusInfo.key) : t("settingsStatusApproved")) : t("settingsRegistered")}
              </div>
            </div>
            {displayEmail !== "—" && (
              <div className="rounded-xl p-3 sm:col-span-2" style={{ background: "rgba(23,63,95,0.03)" }}>
                <div className="text-[10px] text-muted-foreground mb-1">{t("emailLabel")}</div>
                <div className="font-bold truncate" dir="ltr">{displayEmail}</div>
              </div>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl p-5 mb-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: "#2F6690" }}>
            <GraduationCap size={15} />
            <h2 className="text-sm font-black">{t("languageSection")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {LANGUAGES.map((l) => {
              const activeLang = lang === l.id;
              return (
                <button key={l.id} onClick={() => saveLanguage(l.id)} disabled={saving}
                  className="rounded-xl p-4 text-center transition-all disabled:opacity-60"
                  style={{
                    background: activeLang ? "rgba(47,102,144,0.1)" : "rgba(23,63,95,0.03)",
                    border: `1px solid ${activeLang ? "#2F6690" : "#E2E8F0"}`,
                  }}>
                  <div className="text-2xl mb-1.5">{l.flag}</div>
                  <div className="text-xs font-bold" style={{ color: activeLang ? "#173F5F" : "hsl(var(--foreground))" }}>
                    {l.native}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-[10px]">
            <span className="text-muted-foreground">{t("langNote")}</span>
            {saving ? (
              <span className="flex items-center gap-1 text-muted-foreground"><Loader2 size={10} className="animate-spin" /> {t("saving")}</span>
            ) : saved ? (
              <span className="flex items-center gap-1" style={{ color: "#2E7D5B" }}><Check size={10} /> {t("saved")}</span>
            ) : null}
          </div>
        </div>

        {/* School — يُخفى للخطة الشخصية */}
        {!isPersonalStudent && (
        <div className="rounded-2xl p-5 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2 mb-4" style={{ color: "#2F6690" }}>
            <School size={15} />
            <h2 className="text-sm font-black">{t("schoolSection")}</h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-xl p-3"
            style={{ background: "rgba(23,63,95,0.03)" }}>
            <div>
              <div className="text-xs font-bold">{schoolName}</div>
              <div className="text-[10px] text-muted-foreground">
                {isStudent ? t("settingsSchoolLinkedNote") : t("settingsSchoolGeneralNote")}
              </div>
            </div>
            {statusInfo && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `color-mix(in srgb, ${statusInfo.color} 12%, transparent)`, color: statusInfo.color }}>
                {t(statusInfo.key)}
              </span>
            )}
          </motion.div>
        </div>
        )}

        {/* معلومات التواصل — للمالك فقط تعديل */}
        {isOwner && (
          <div className="rounded-2xl p-5 mt-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2 mb-4" style={{ color: "#2F6690" }}>
              <Mail size={15} />
              <h2 className="text-sm font-black">{t("contactSection")}</h2>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{t("contactSectionDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} dir="ltr"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
              <button onClick={saveContactEmail} disabled={savingContact || !contactEmail.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: "#173F5F" }}>
                {savingContact ? <Loader2 size={12} className="animate-spin" /> : contactSaved ? <Check size={12} /> : null}
                {savingContact ? t("saving") : contactSaved ? t("saved") : t("saveEmail")}
              </button>
            </div>
          </div>
        )}

        {/* تسجيل الخروج — لكل الأدوار */}
        <button onClick={handleLogout}
          className="w-full mt-4 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all"
          style={{ border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C", background: "rgba(201,76,76,0.05)" }}>
          <LogOut size={14} /> {t("logout")}
        </button>
      </div>
    </div>
  );
}