import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, User, GraduationCap, Check, Loader2, School, Mail, LogOut, Shield, Trash2, AlertTriangle, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { studentApi, useStudentSession, clearStudentSession } from "@/lib/studentSession";
import { useTeacherSession, clearTeacherSession, teacherApi } from "@/lib/teacherSession";
import { useSchoolAdminSession, clearSchoolAdminSession } from "@/lib/schoolAdminSession";
import { getLang as getSavedLang, setLang as applyI18nLang, t, useLang, useDir, getLang } from "@/lib/i18n";
import { friendlyError } from "@/lib/errorMessage";

const LANGUAGES = [
  { id: "ar", label: "العربية", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { id: "en", label: "الإنجليزية", native: "English", flag: "🇬🇧", dir: "ltr" },
  { id: "he", label: "العبرية", native: "עברית", flag: "🇮🇱", dir: "rtl" },
];

const PROFILE_STATUS = {
  pending: { key: "settingsStatusPending", cls: "text-warning" },
  approved: { key: "settingsStatusApproved", cls: "text-success" },
  rejected: { key: "settingsStatusRejected", cls: "text-destructive" },
  disabled: { key: "settingsStatusDisabled", cls: "text-muted-foreground" },
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
  const teacherSession = useTeacherSession();

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

  // ── حذف الحساب ──
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  // حسابات الإدارة المسجَّلة بالبريد (Base44 Auth): المالك، ومشرف المدرسة الذي لديه بريد.
  // مشرف المدرسة بالرمز (بدون بريد) يبقى كما هو ويتواصل مع الدعم.
  const isEmailAdmin = isOwner || (isSchoolAdmin && !!active.email);
  const canDelete = isStudent || isTeacher || isEmailAdmin;
  const confirmWord = getLang() === "ar" ? "حذف" : getLang() === "he" ? "מחק" : "DELETE";

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== confirmWord) return;
    setDeleting(true);
    setDeleteMsg(null);
    try {
      if (isStudent) {
        await studentApi("delete", "StudentProfile", { id: active.studentId });
        clearStudentSession();
      } else if (isTeacher) {
        await teacherApi("delete", "Teacher", { id: teacherSession.teacher_id });
        clearTeacherSession();
      } else if (isEmailAdmin) {
        // حذف ذاتي عبر دالة Backend (تتحقق من الهوية وتحذف سجل المستخدم نفسه فقط)
        await base44.functions.invoke("deleteMyAccount", { confirm: true });
      }
      setDeleteMsg({ ok: true, text: t("deleteAccountSuccess") });
      if (isEmailAdmin) {
        // إنهاء الجلسة بعد الحذف ثم التحويل لصفحة الدخول
        setTimeout(() => {
          try { base44.auth.logout("/login"); } catch { window.location.href = "/login"; }
        }, 1500);
      } else {
        setTimeout(() => navigate("/student-login", { replace: true }), 1500);
      }
    } catch (err) {
      setDeleteMsg({ ok: false, text: friendlyError(err) });
    } finally {
      setDeleting(false);
    }
  };

  const statusInfo = profile ? (PROFILE_STATUS[profile.status] || PROFILE_STATUS.pending) : null;

  // تحديد الدور والرمز حسب الجلسة النشطة
  const roleLabel = isStudent ? t("roleStudent")
    : isTeacher ? t("teacherRole")
    : isSchoolAdmin ? t("roleSchoolAdmin")
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary">
            <SettingsIcon className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("settingsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("settingsSubtitle")}</p>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-[16px] p-5 mb-4 bg-card border border-border">
          <div className="flex items-center gap-2 mb-4 text-brand">
            <User size={15} />
            <h2 className="text-sm font-black text-foreground">{t("accountSection")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-[10px] p-3 bg-muted">
              <div className="text-[10px] text-muted-foreground mb-1">{t("nameLabel")}</div>
              <div className="font-bold">{displayName}</div>
            </div>
            <div className="rounded-[10px] p-3 bg-muted">
              <div className="text-[10px] text-muted-foreground mb-1">{codeLabel}</div>
              <div className="font-bold truncate" dir="ltr">{codeValue}</div>
            </div>
            {(isSchoolAdmin || isTeacher) && active.schoolCode && (
              <div className="rounded-[10px] p-3 bg-muted">
                <div className="text-[10px] text-muted-foreground mb-1">{t("schoolCode")}</div>
                <div className="font-bold truncate" dir="ltr">{active.schoolCode}</div>
              </div>
            )}
            <div className="rounded-[10px] p-3 bg-muted">
              <div className="text-[10px] text-muted-foreground mb-1">{t("roleLabel")}</div>
              <div className="font-bold flex items-center gap-1.5">
                {isOwner && <Shield size={12} className="text-brand" />}
                {roleLabel}
              </div>
            </div>
            <div className="rounded-[10px] p-3 bg-muted">
              <div className="text-[10px] text-muted-foreground mb-1">{t("statusLabel")}</div>
              <div className={`font-bold ${statusInfo?.cls || "text-success"}`}>
                {isStudent ? (statusInfo ? t(statusInfo.key) : t("settingsStatusApproved")) : t("settingsRegistered")}
              </div>
            </div>
            {displayEmail !== "—" && (
              <div className="rounded-[10px] p-3 sm:col-span-2 bg-accent">
                <div className="text-[10px] text-muted-foreground mb-1">{t("emailLabel")}</div>
                <div className="font-bold truncate" dir="ltr">{displayEmail}</div>
              </div>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="rounded-[16px] p-5 mb-4 bg-card border border-border">
          <div className="flex items-center gap-2 mb-4 text-brand">
            <GraduationCap size={15} />
            <h2 className="text-sm font-black text-foreground">{t("languageSection")}</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {LANGUAGES.map((l) => {
              const activeLang = lang === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => saveLanguage(l.id)}
                  disabled={saving}
                  className={`rounded-[10px] p-4 text-center transition-all disabled:opacity-60 border ${
                    activeLang
                      ? "bg-accent border-primary"
                      : "bg-muted border-border hover:bg-muted/80"
                  }`}
                >
                  <div className="text-2xl mb-1.5">{l.flag}</div>
                  <div className={`text-xs font-bold ${activeLang ? "text-brand" : "text-foreground"}`}>
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
              <span className="flex items-center gap-1 text-success"><Check size={10} /> {t("saved")}</span>
            ) : null}
          </div>
        </div>

        {/* School — يُخفى للخطة الشخصية */}
        {!isPersonalStudent && (
        <div className="rounded-[16px] p-5 bg-card border border-border">
          <div className="flex items-center gap-2 mb-4 text-brand">
            <School size={15} />
            <h2 className="text-sm font-black text-foreground">{t("schoolSection")}</h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between rounded-[10px] p-3 bg-accent">
            <div>
              <div className="text-xs font-bold text-foreground">{schoolName}</div>
              <div className="text-[10px] text-muted-foreground">
                {isStudent ? t("settingsSchoolLinkedNote") : t("settingsSchoolGeneralNote")}
              </div>
            </div>
            {statusInfo && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-current ${statusInfo.cls}`}>
                {t(statusInfo.key)}
              </span>
            )}
          </motion.div>
        </div>
        )}

        {/* معلومات التواصل — للمالك فقط تعديل */}
        {isOwner && (
          <div className="rounded-[16px] p-5 mt-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-4 text-brand">
              <Mail size={15} />
              <h2 className="text-sm font-black text-foreground">{t("contactSection")}</h2>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{t("contactSectionDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                dir="ltr"
                className="flex-1 px-4 py-2.5 rounded-[10px] text-sm bg-background border border-input focus:outline-none"
              />
              <button
                onClick={saveContactEmail}
                disabled={savingContact || !contactEmail.trim()}
                className="px-4 py-2.5 rounded-[10px] text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {savingContact ? <Loader2 size={12} className="animate-spin" /> : contactSaved ? <Check size={12} /> : null}
                {savingContact ? t("saving") : contactSaved ? t("saved") : t("saveEmail")}
              </button>
            </div>
          </div>
        )}

        {/* حذف الحساب — للطلاب والأساتذة وحسابات الإدارة المسجَّلة بالبريد */}
        {canDelete && (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full mt-3 py-2.5 rounded-[10px] text-xs font-bold flex items-center justify-center gap-2 transition-all border border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={12} /> {t("deleteAccount")}
          </button>
        )}
        {!canDelete && (isSchoolAdmin || isOwner) && (
          <div className="w-full mt-3 py-2.5 px-3 rounded-[10px] text-[10px] text-center text-muted-foreground border border-border">
            {t("deleteAccountNotAvailable")}{" "}
            <Link to="/account-deletion" className="font-bold text-brand hover:underline">{t("legalDeletion")}</Link>
          </div>
        )}

        {/* روابط قانونية (مطلوبة للمتاجر) */}
        <div className="mt-4 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-muted-foreground">
          <Link to="/privacy" className="hover:text-brand hover:underline">{t("legalPrivacy")}</Link>
          <Link to="/terms" className="hover:text-brand hover:underline">{t("legalTerms")}</Link>
          <Link to="/account-deletion" className="hover:text-brand hover:underline">{t("legalDeletion")}</Link>
        </div>

        {/* تسجيل الخروج — لكل الأدوار */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-3 rounded-[10px] text-sm font-black flex items-center justify-center gap-2 transition-all bg-destructive/10 border border-destructive/35 text-destructive hover:bg-destructive/20"
        >
          <LogOut size={14} /> {t("logout")}
        </button>

        {/* نافذة تأكيد حذف الحساب */}
        <AnimatePresence>
          {showDeleteDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-terminal/70"
              onClick={() => !deleting && setShowDeleteDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-[16px] p-6 bg-card text-card-foreground border border-border shadow-card"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-destructive/10 text-destructive">
                      <AlertTriangle size={18} />
                    </div>
                    <h3 className="font-black text-base text-destructive">{t("deleteAccountConfirmTitle")}</h3>
                  </div>
                  {!deleting && (
                    <button onClick={() => setShowDeleteDialog(false)} className="p-1 rounded-[6px] text-muted-foreground hover:text-foreground">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Warning */}
                <p className="text-xs font-bold mb-2 text-foreground">{t("deleteAccountDesc")}</p>
                <p className="text-[11px] mb-4 leading-relaxed text-destructive">{t("deleteAccountWarning")}</p>

                {/* Confirmation input */}
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{t("deleteAccountTypeConfirm")}</label>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={deleting}
                  placeholder={confirmWord}
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-[10px] text-sm font-mono focus:outline-none mb-3 bg-background border border-input"
                />

                {/* Error/Success message */}
                {deleteMsg && (
                  <div className={`mb-3 px-3 py-2 rounded-[10px] text-xs font-bold border ${
                    deleteMsg.ok ? "bg-success/10 border-success/35 text-success" : "bg-destructive/10 border-destructive/35 text-destructive"
                  }`}>
                    {deleteMsg.text}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-[10px] text-xs font-bold transition-all border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {t("cancelBtn")}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText.trim() !== confirmWord}
                    className="flex-1 py-2.5 rounded-[10px] text-xs font-black bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    {t("deleteAccountBtn")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}