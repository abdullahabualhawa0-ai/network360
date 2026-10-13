import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, AlertTriangle, GraduationCap, UserPlus, BookOpen, Shield, User, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { studentLogin, setStudentSession, clearStudentSession } from "@/lib/studentSession";
import { teacherLogin, setTeacherSession, clearTeacherSession } from "@/lib/teacherSession";
import { schoolAdminLogin, setSchoolAdminSession, clearSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang, useDir } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageLoader from "@/components/PageLoader";

/**
 * صفحة الدخول الموحّدة — ثلاثة تبويبات:
 *  1) طالب: School Code + Student Code
 *  2) أستاذ: School Code + Teacher Code
 *  3) إنشاء حساب: رابط لصفحة الخطط (Personal / School)
 * لا بريد، لا كلمة مرور، لا دخول اجتماعي للطلاب والأساتذة.
 * دخول الإدارة/المالك عبر Base44 يبقى متاحًا عبر الرابط السفلي.
 */
export default function StudentLogin() {
  useLang();
  const direction = useDir();
  const navigate = useNavigate();
  const [tab, setTab] = useState("student");

  // حقول الطالب
  const [sSchoolCode, setSSchoolCode] = useState("");
  const [sStudentCode, setSStudentCode] = useState("");
  // حقول الأستاذ
  const [tSchoolCode, setTSchoolCode] = useState("");
  const [tTeacherCode, setTTeacherCode] = useState("");
  // حقول المشرف — رمز واحد فقط
  const [aAdminCode, setAAdminCode] = useState("");
  // حقول الطالب الفردي — رمز واحد فقط
  const [iStudentCode, setIStudentCode] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showIndividualLogin, setShowIndividualLogin] = useState(false);

  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // المالك (Base44 auth) لا يرى صفحة دخول الطلاب — يُوجّه للوحة الإدارة
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        base44.auth.me().then((u) => {
          if (u?.role === "admin") navigate("/admin/schools", { replace: true });
          else setChecking(false);
        }).catch(() => setChecking(false));
      } else setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return <PageLoader fullScreen />;
  }

  // inputStyle moved to module scope (see LoginField below)

  const submitStudent = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await studentLogin(sSchoolCode, sStudentCode);
      clearTeacherSession();
      clearSchoolAdminSession();
      setStudentSession(session);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  const submitIndividual = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await studentLogin(null, iStudentCode);
      clearTeacherSession();
      clearSchoolAdminSession();
      setStudentSession(session);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  const submitTeacher = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await teacherLogin(tSchoolCode, tTeacherCode);
      clearStudentSession();
      clearSchoolAdminSession();
      setTeacherSession(session);
      navigate("/teacher/dashboard", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  const submitAdmin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await schoolAdminLogin(aAdminCode);
      clearStudentSession();
      clearTeacherSession();
      setSchoolAdminSession(session);
      navigate("/admin/school-students", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground" dir={direction}>
      {/* زر تغيير اللغة — ثابت أعلى الصفحة */}
      <div className="fixed top-4 end-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl p-6 bg-card border border-border shadow-[0_4px_20px_rgba(23,63,95,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
        {/* Header — مع رابط دخول المشرف جنب اسم المنصة */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-primary">
            <BookOpen className="text-primary-foreground" size={24} />
          </div>
          <h1 className="font-black text-lg text-primary">{t("appName")}</h1>
          <p className="text-xs mt-1 text-muted-foreground">
            {showAdminLogin ? t("loginAdminSubtitle") : showIndividualLogin ? t("individualLoginSubtitle") : t("loginSubtitle")}
          </p>
          {/* خيارات الدخول الأخرى — أزرار بحجم لمس مريح (≥44px) بدل الأزرار الصغيرة */}
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => { setShowIndividualLogin(!showIndividualLogin); setShowAdminLogin(false); setTab("student"); setError(null); }}
              aria-pressed={showIndividualLogin}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                showIndividualLogin ? "bg-success text-white border-success" : "bg-success/[0.06] text-foreground/70 border-success/25"
              }`}>
              <User size={14} /> {t("individualLoginLink")}
            </button>
            <button type="button" onClick={() => { setShowAdminLogin(!showAdminLogin); setShowIndividualLogin(false); setTab("student"); setError(null); }}
              aria-pressed={showAdminLogin}
              className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                showAdminLogin ? "bg-primary text-primary-foreground border-primary" : "bg-primary/[0.06] text-foreground/70 border-primary/20"
              }`}>
              <Shield size={14} /> {t("adminLoginLink")}
            </button>
          </div>
        </div>

        {/* Tabs — تُخفى عند تفعيل دخول المشرف أو الدخول الفردي */}
        {!showAdminLogin && !showIndividualLogin && (
        <div className="flex gap-1 p-1 rounded-xl mb-4 bg-primary/5">
          <TabButton id="student" active={tab === "student"} icon={KeyRound} label={t("loginTabStudent")} onClick={() => { setTab("student"); setError(null); }} />
          <TabButton id="teacher" active={tab === "teacher"} icon={GraduationCap} label={t("loginTabTeacher")} onClick={() => { setTab("teacher"); setError(null); }} />
          <TabButton id="create" active={tab === "create"} icon={UserPlus} label={t("createAccountTab")} onClick={() => { setTab("create"); setError(null); }} />
        </div>
        )}

        {/* Admin login — يظهر بدلاً من التبويبات عند تفعيله */}
        {showAdminLogin && (
          <form onSubmit={submitAdmin} className="space-y-3">
            <button type="button" onClick={() => { setShowAdminLogin(false); setError(null); }}
              className="flex items-center gap-1 text-[11px] font-bold mb-1 transition-all" style={{ color: "#2F6690" }}>
              <ArrowLeft size={12} className="rotate-180" /> {t("back")}
            </button>
            <LoginField value={aAdminCode} onChange={setAAdminCode} label={t("adminCode")} placeholder={t("adminCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginAdminSubtitle")}</p>
          </form>
        )}

        {/* Individual login — رمز واحد فقط للخطة الشخصية */}
        {showIndividualLogin && (
          <form onSubmit={submitIndividual} className="space-y-3">
            <button type="button" onClick={() => { setShowIndividualLogin(false); setError(null); }}
              className="flex items-center gap-1 text-[11px] font-bold mb-1 transition-all" style={{ color: "#2E7D5B" }}>
              <ArrowLeft size={12} className="rotate-180" /> {t("back")}
            </button>
            <LoginField value={iStudentCode} onChange={setIStudentCode} label={t("individualCode")} placeholder={t("individualCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("individualLoginSubtitle")}</p>
          </form>
        )}

        {/* Student tab */}
        {tab === "student" && !showAdminLogin && !showIndividualLogin && (
          <form onSubmit={submitStudent} className="space-y-3">
            <LoginField value={sSchoolCode} onChange={setSSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <LoginField value={sStudentCode} onChange={setSStudentCode} label={t("studentCode")} placeholder="ST10025" />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginPendingNote")}</p>
          </form>
        )}

        {/* Teacher tab */}
        {tab === "teacher" && !showAdminLogin && !showIndividualLogin && (
          <form onSubmit={submitTeacher} className="space-y-3">
            <LoginField value={tSchoolCode} onChange={setTSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <LoginField value={tTeacherCode} onChange={setTTeacherCode} label={t("teacherCode")} placeholder={t("teacherCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginTeacherSubtitle")}</p>
          </form>
        )}

        {/* Create account tab */}
        {tab === "create" && !showAdminLogin && !showIndividualLogin && (
          <div className="space-y-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
              <UserPlus size={22} className="mx-auto mb-2" style={{ color: "#2F6690" }} />
              <p className="text-xs text-muted-foreground leading-relaxed">{t("createAccountPrompt")}</p>
            </div>
            <Link to="/plans?type=individual"
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "#2E7D5B" }}>
              <User size={15} /> {t("regTypeIndividual")}
            </Link>
            <Link to="/plans?type=school"
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "#173F5F" }}>
              <BookOpen size={15} /> {t("regTypeSchool")}
            </Link>
          </div>
        )}

        {/* روابط قانونية — مطلوبة لمتاجر التطبيقات */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-center gap-x-4 gap-y-2 flex-wrap text-[11px] text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary underline-offset-2 hover:underline">{t("legalPrivacy")}</Link>
          <Link to="/terms" className="hover:text-primary underline-offset-2 hover:underline">{t("legalTerms")}</Link>
          <Link to="/account-deletion" className="hover:text-primary underline-offset-2 hover:underline">{t("legalDeletion")}</Link>
        </div>

      </div>
    </div>
  );
}

function ErrorBox({ text }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
      style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
      <AlertTriangle size={13} /> {text}
    </div>
  );
}

function SubmitButton({ busy }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full min-h-[44px] py-3 rounded-xl text-sm font-black bg-primary text-primary-foreground transition-all disabled:opacity-60">
      {busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : t("loginBtn")}
    </button>
  );
}

function LoginField({ value, onChange, label, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{label}</label>
      {/* الرموز: لا تصحيح تلقائي ولا حرف كبير تلقائي (لوحات الجوال كانت تغيّر الحرف الأول فيفشل الدخول) */}
      <input value={value} onChange={(e) => onChange(e.target.value)}
        required placeholder={placeholder} dir="ltr"
        autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} inputMode="text"
        className="w-full px-4 py-3 rounded-xl text-sm text-foreground font-mono focus:outline-none bg-background border border-border focus:border-primary" />
    </div>
  );
}

function TabButton({ id, active, icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
      }`}>
      <Icon size={13} /> {label}
    </button>
  );
}