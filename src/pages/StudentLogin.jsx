import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, AlertTriangle, ShieldCheck, GraduationCap, UserPlus, BookOpen } from "lucide-react";
import { studentLogin, setStudentSession } from "@/lib/studentSession";
import { teacherLogin, setTeacherSession } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";

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

  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const inputStyle = { background: "#F7F9FC", border: "1px solid #E2E8F0" };

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

  const TabButton = ({ id, icon: Icon, label }) => {
    const active = tab === id;
    return (
      <button type="button" onClick={() => { setTab(id); setError(null); }}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{
          background: active ? "#173F5F" : "transparent",
          color: active ? "#fff" : "hsl(var(--muted-foreground))",
        }}>
        <Icon size={13} /> {label}
      </button>
    );
  };

  const Field = ({ value, onChange, label, placeholder }) => (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        required placeholder={placeholder} dir="ltr"
        className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none"
        style={inputStyle} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={direction}
      style={{ background: "#F7F9FC" }}>
      <div className="w-full max-w-md rounded-2xl p-6 bg-white"
        style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(23,63,95,0.08)" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#173F5F" }}>
            <BookOpen className="text-white" size={24} />
          </div>
          <h1 className="font-black text-lg" style={{ color: "#173F5F" }}>{t("appName")}</h1>
          <p className="text-xs mt-1 text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "rgba(23,63,95,0.05)" }}>
          <TabButton id="student" icon={KeyRound} label={t("loginTabStudent")} />
          <TabButton id="teacher" icon={GraduationCap} label={t("loginTabTeacher")} />
          <TabButton id="create" icon={UserPlus} label={t("createAccountTab")} />
        </div>

        {/* Student tab */}
        {tab === "student" && (
          <form onSubmit={submitStudent} className="space-y-3">
            <Field value={sSchoolCode} onChange={setSSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <Field value={sStudentCode} onChange={setSStudentCode} label={t("studentCode")} placeholder="ST10025" />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginPendingNote")}</p>
          </form>
        )}

        {/* Teacher tab */}
        {tab === "teacher" && (
          <form onSubmit={submitTeacher} className="space-y-3">
            <Field value={tSchoolCode} onChange={setTSchoolCode} label={t("schoolCode")} placeholder="SCH2026A" />
            <Field value={tTeacherCode} onChange={setTTeacherCode} label={t("teacherCode")} placeholder={t("teacherCodePlaceholder")} />
            {error && <ErrorBox text={error} />}
            <SubmitButton busy={busy} />
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">{t("loginTeacherSubtitle")}</p>
          </form>
        )}

        {/* Create account tab */}
        {tab === "create" && (
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

        {/* دخول الإدارة / المالك عبر Base44 */}
        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid #E2E8F0" }}>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "#2F6690" }}>
            <ShieldCheck size={13} /> {t("adminLoginLink")}
          </Link>
          <p className="text-[10px] text-muted-foreground mt-1">{t("adminLoginNote")}</p>
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
      className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60"
      style={{ background: "#173F5F" }}>
      {busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : t("loginBtn")}
    </button>
  );
}