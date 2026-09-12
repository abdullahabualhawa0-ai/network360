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
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(6,182,212,0.25)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl"
      style={{ background: "#020617" }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "rgba(10,16,36,0.98)", border: "1px solid rgba(6,182,212,0.25)" }}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="font-black text-lg text-white">{t("loginTitle")}</h1>
          <p className="text-xs mt-1 text-slate-400">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("schoolCode")}</label>
            <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)}
              required placeholder="SCH2026A" dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white font-mono focus:outline-none"
              style={inputStyle} />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">{t("studentCode")}</label>
            <input value={studentCode} onChange={(e) => setStudentCode(e.target.value)}
              required placeholder="ST10025" dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white font-mono focus:outline-none"
              style={inputStyle} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
              <AlertTriangle size={13} /> {error}
            </div>
          )}

          <button type="submit" disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
            {busy ? <Loader2 size={15} className="animate-spin mx-auto" /> : t("loginBtn")}
          </button>
        </form>

        <p className="text-[10px] text-center mt-4 text-slate-500 leading-relaxed">
          {t("loginPendingNote")}
        </p>

        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link to="/plans" className="inline-flex items-center gap-1.5 text-xs font-black"
            style={{ color: "#06b6d4" }}>
            <UserPlus size={13} /> {t("createAccount")}
          </Link>
          <p className="text-[10px] text-slate-500 mt-1">{t("createAccountNote")}</p>

          {/* التسجيل بشكل مستقل بدون مدرسة */}
          <Link to="/plans" className="mt-4 flex items-center gap-2.5 w-full px-4 py-3 rounded-xl transition-all hover:brightness-110"
            style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <User size={15} style={{ color: "#34d399" }} />
            <span className="text-right">
              <span className="block text-[11px] font-black" style={{ color: "#34d399" }}>{t("personalOption")}</span>
              <span className="block text-[9px] text-slate-500">{t("personalOptionDesc")}</span>
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
      style={{ background: "#020617" }}>
      <div className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "rgba(10,16,36,0.98)",
          border: `1px solid ${isPending ? "rgba(251,191,36,0.35)" : "rgba(248,113,113,0.35)"}`,
        }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: isPending ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)" }}>
          {isPending ? "⏳" : isRejected ? "🚫" : "⛔"}
        </div>
        <h1 className="font-black text-lg text-white mb-1">
          {isPending ? t("pendingTitle") : isRejected ? t("rejectedTitle") : t("errDisabled")}
        </h1>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {isPending
            ? `${t("pendingDesc")} (مدرسة «${schoolName}»)`
            : `${t("statusDesc")} (مدرسة «${schoolName}»)`}
        </p>
        <div className="text-[10px] text-slate-500 mb-5">
          {profile.full_name} • {t("studentCodeLabel")}: {profile.student_code}
        </div>
        <button onClick={() => (onLogout || logout)()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
          <LogOut size={12} /> {t("logout")}
        </button>
      </div>
    </div>
  );
}

export function FullSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#020617" }}>
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: "3px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }} />
    </div>
  );
}