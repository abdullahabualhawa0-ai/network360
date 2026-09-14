import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getSchoolName } from "@/lib/schoolUtils";
import { registerStudent } from "@/lib/registrationUtils";
import { KeyRound, Loader2, AlertTriangle, LogOut, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { t, useLang } from "@/lib/i18n";

/**
 * تسجيل دخول الطالب — بالرموز فقط (School Code + Student Code)
 * لا بريد، لا كلمة مرور، لا دخول اجتماعي، لا أي وسيلة أخرى.
 */
export default function StudentRegistration({ onRegistered }) {
  const { user } = useAuth();
  useLang();
  const [schoolCode, setSchoolCode] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await registerStudent({
        user,
        schoolCode,
        studentCode,
      });
      if (!res.ok) setError(res.error);
      else onRegistered?.();
    } catch {
      setError(t("errUnexpected"));
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

        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid #E2E8F0" }}>
          <Link to="/plans" className="inline-flex items-center gap-1.5 text-xs font-black"
            style={{ color: "#2F6690" }}>
            <UserPlus size={13} /> {t("createAccount")}
          </Link>
          <p className="text-[10px] text-muted-foreground mt-1">{t("createAccountNote")}</p>

          {/* التسجيل بشكل مستقل بدون مدرسة */}
          <Link to="/plans" className="mt-4 flex items-center gap-2.5 w-full px-4 py-3 rounded-xl transition-all hover:shadow-md"
            style={{ background: "rgba(46,125,91,0.06)", border: "1px solid rgba(46,125,91,0.3)" }}>
            <User size={15} style={{ color: "#2E7D5B" }} />
            <span className="text-right">
              <span className="block text-[11px] font-black" style={{ color: "#2E7D5B" }}>{t("personalOption")}</span>
              <span className="block text-[9px] text-muted-foreground">{t("personalOptionDesc")}</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AccountStatusScreen({ profile, onLogout }) {
  const [schoolName, setSchoolName] = useState("...");
  const { logout } = useAuth();
  useLang();

  useEffect(() => {
    getSchoolName(profile.school_id).then(setSchoolName);
  }, [profile.school_id]);

  const isPending = profile.status === "pending";
  const isRejected = profile.status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: "#F7F9FC" }}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center bg-white"
        style={{
          border: `1px solid ${isPending ? "rgba(214,158,46,0.4)" : "rgba(201,76,76,0.4)"}`,
          boxShadow: "0 4px 20px rgba(23,63,95,0.08)",
        }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: isPending ? "rgba(214,158,46,0.12)" : "rgba(201,76,76,0.12)" }}>
          {isPending ? "⏳" : isRejected ? "🚫" : "⛔"}
        </div>
        <h1 className="font-black text-lg mb-1" style={{ color: "#173F5F" }}>
          {isPending ? t("pendingTitle") : isRejected ? t("rejectedTitle") : t("errDisabled")}
        </h1>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {isPending
            ? `${t("pendingDesc")} (مدرسة «${schoolName}»)`
            : `${t("statusDesc")} (مدرسة «${schoolName}»)`}
        </p>
        <div className="text-[10px] text-muted-foreground mb-5">
          {profile.full_name} • {t("studentCodeLabel")}: {profile.student_code}
        </div>
        <button onClick={() => (onLogout || logout)()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ border: "1px solid #E2E8F0", color: "rgba(31,41,55,0.65)" }}>
          <LogOut size={12} /> {t("logout")}
        </button>
      </div>
    </div>
  );
}

export function FullSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#F7F9FC" }}>
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" }} />
    </div>
  );
}