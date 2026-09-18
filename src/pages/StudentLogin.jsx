import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, AlertTriangle, GraduationCap, UserPlus, BookOpen, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { studentLogin, setStudentSession } from "@/lib/studentSession";
import { teacherLogin, setTeacherSession } from "@/lib/teacherSession";
import { schoolAdminLogin, setSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang, useDir } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  // حقول المشرف
  const [aSchoolCode, setASchoolCode] = useState("");
  const [aAdminCode, setAAdminCode] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" }} />
      </div>
    );
  }

  // inputStyle moved to module scope (see LoginField below)

  const submitStudent = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await studentLogin(sSchoolCode, sStudentCode);
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
      const session = await schoolAdminLogin(aSchoolCode, aAdminCode);
      setSchoolAdminSession(session);
      navigate("/admin/school-students", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={direction}
      style={{ background: "#F7F9FC" }}>
      {/* زر تغيير اللغة — ثابت أعلى الصفحة */}
      <div className="fixed top-4 end-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl p-6 bg-white"
        style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(23,63,95,0.08)" }}>
        {/* Header — مع رابط دخول المشرف جنب اسم المنصة */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#173F5F" }}>
            <BookOpen className="text-white" size={24} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-black text-lg" style={{ color: "#173F5F" }}>{t("appName")}</h1>
            <button type="button" onClick={() => { setShowAdminLogin(!showAdminLogin); setTab("student"); setError(null); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: showAdminLogin ? "#173F5F" : "rgba(23,63,95,0.06)",
                color: showAdminLogin ? "#fff" : "hsl(var(--muted-foreground))",
                border: "1px solid rgba(23,63,95,0.15)",
              }}>
              <Shield size={10} /> {t("adminLoginLink")}
            </button>
          </div>
          <p className="text-xs mt-1 text-muted-foreground">{showAdminLogin ? t("loginAdminSubtitle") : t("loginSubtitle")}</p>
        </div>

        {/* Tabs — تُخفى عند تفعيل دخول المشرف */}
        {!showAdminLogin && (
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "rgba(23,63,95,0.05)" }}>
          <TabButton id="student" active={tab === "student"} icon={KeyRound} label={t("loginTabStudent")} onClick={() => { setTab("student"); setError(null); }} />
          <TabButton id="teacher" active={tab === "teacher"} icon={GraduationCap} label={t("loginTabTeacher")} onClick={() => { setTab("teacher"); setError(null); }} />
          <TabButton id="create" active={tab === "create"} icon={UserPlus} label={t("createAccountTab")} onClick={() => { setTab("create"); setError(null); }} />
        </div>
        )}

        {/* Admin login — يظهر بدلاً من التبويبات عند تفعيله */}
        {showAdminLogin && (
          <form onSubmit={submitAdmin} className="space-y-3">
            <LoginField value={aSchoolCode} onChange={setASchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <LoginField value={aAdminCode} onChange={setAAdminCode} label={t("adminCode")} placeholder={t("adminCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginAdminSubtitle")}</p>
          </form>
        )}

        {/* Student tab */}
        {tab === "student" && !showAdminLogin && (
          <form onSubmit={submitStudent} className="space-y-3">
            <LoginField value={sSchoolCode} onChange={setSSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <LoginField value={sStudentCode} onChange={setSStudentCode} label={t("studentCode")} placeholder="ST10025" />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginPendingNote")}</p>
          </form>
        )}

        {/* Teacher tab */}
        {tab === "teacher" && !showAdminLogin && (
          <form onSubmit={submitTeacher} className="space-y-3">
            <LoginField value={tSchoolCode} onChange={setTSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <LoginField value={tTeacherCode} onChange={setTTeacherCode} label={t("teacherCode")} placeholder={t("teacherCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginTeacherSubtitle")}</p>
          </form>
        )}

        {/* Create account tab */}
        {tab === "create" && !showAdminLogin && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
              <UserPlus size={22} className="mx-auto mb-2" style={{ color: "#2F6690" }} />
              <p className="text-xs text-muted-foreground leading-relaxed">{t("createAccountPrompt")}</p>
            </div>
            <Link to="/plans"
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "#173F5F" }}>
              <UserPlus size={15} /> {t("goPlans")}
            </Link>
          </div>
        )}

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
      className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60"
      style={{ background: "#173F5F" }}>
      {busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : t("loginBtn")}
    </button>
  );
}

const _inputStyle = { background: "#F7F9FC", border: "1px solid #E2E8F0" };

function LoginField({ value, onChange, label, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        required placeholder={placeholder} dir="ltr"
        className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none"
        style={_inputStyle} />
    </div>
  );
}

function TabButton({ id, active, icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
      style={{
        background: active ? "#173F5F" : "transparent",
        color: active ? "#fff" : "hsl(var(--muted-foreground))",
      }}>
      <Icon size={13} /> {label}
    </button>
  );
}