import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { studentLogin, setStudentSession } from "@/lib/studentSession";
import { t, useLang } from "@/lib/i18n";

/**
 * صفحة تسجيل دخول الطالب — الرموز فقط (School Code + Student Code)
 * لا بريد، لا كلمة مرور، لا دخول اجتماعي، لا Base44 Authentication.
 * هذه هي الصفحة الأولى للزائر غير المسجل في جلسة طالب.
 */
export default function StudentLogin() {
  useLang();
  const navigate = useNavigate();
  const [schoolCode, setSchoolCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await studentLogin(schoolCode, studentCode);
      setStudentSession(session);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.data?.error || err?.message || t("errUnexpected"));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    background: "#F7F9FC",
    border: "1px solid #E2E8F0",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: "#F7F9FC" }}>
      <div className="w-full max-w-md rounded-2xl p-6 bg-white"
        style={{ border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(23,63,95,0.08)" }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "#173F5F" }}>
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="font-black text-lg" style={{ color: "#173F5F" }}>{t("loginTitle")}</h1>
          <p className="text-xs mt-1 text-muted-foreground">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{t("schoolCode")}</label>
            <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)}
              required placeholder="SCH2026A" dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">{t("studentCode")}</label>
            <input value={studentCode} onChange={(e) => setStudentCode(e.target.value)}
              required placeholder="ST10025" dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground font-mono focus:outline-none"
              style={inputStyle} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
              <AlertTriangle size={13} /> {error}
            </div>
          )}

          <button type="submit" disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60"
            style={{ background: "#173F5F" }}>
            {busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : t("loginBtn")}
          </button>
        </form>

        <p className="text-[10px] text-center mt-4 text-muted-foreground leading-relaxed">
          {t("loginPendingNote")}
        </p>

        {/* دخول الإدارة / المعلمين عبر Base44 */}
        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid #E2E8F0" }}>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "#2F6690" }}>
            <ShieldCheck size={13} /> دخول الإدارة / المعلمين
          </Link>
          <p className="text-[10px] text-muted-foreground mt-1">لإدارة المدارس والطلاب والامتحانات</p>
        </div>
      </div>
    </div>
  );
}