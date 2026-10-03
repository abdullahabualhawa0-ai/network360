import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, CheckCircle2, AlertTriangle, User, School as SchoolIcon, Loader2, ArrowRight } from "lucide-react";
import { t, useLang, useDir, setLang, getLang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * صفحة التسجيل الجديدة — بدون دفع.
 * 1) اختيار نوع التسجيل (فردي / مدرسي)
 * 2) تعبئة بيانات الطلب
 * 3) إرسال الطلب → حفظ RegistrationRequest + إشعار المالك
 * لا تُعرض الخطط أو الأسعار أو بوابات الدفع.
 */
export default function Plans() {
  useLang();
  const direction = useDir();
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    return type === "individual" ? "individual" : type === "school" ? "school" : "type";
  }); // type | individual | school | done
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // نموذج فردي
  const [indForm, setIndForm] = useState({ fullName: "", email: "", phone: "", country: "" });
  // نموذج مدرسي
  const [schForm, setSchForm] = useState({
    schoolName: "", adminName: "", fullName: "", email: "", phone: "", country: "",
    expectedStudents: "", expectedTeachers: "",
  });

  // styles moved to module scope (see Field below) to avoid re-creating the
  // component on every render, which was causing inputs to lose focus.

  const submitIndividual = async (e) => {
    e.preventDefault();
    if (!indForm.fullName.trim() || !indForm.email.trim() || !indForm.phone.trim() || !indForm.country.trim()) {
      setError(t("regErrRequired"));
      return;
    }
    if (!EMAIL_RE.test(indForm.email.trim())) {
      setError(t("regErrEmail"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await base44.entities.RegistrationRequest.create({
        request_type: "individual",
        full_name: indForm.fullName.trim(),
        email: indForm.email.trim(),
        phone: indForm.phone.trim(),
        country: indForm.country.trim(),
        status: "new",
      });
      base44.functions.invoke("notifyOwnerRegistration", {
        requestType: "individual",
        fullName: indForm.fullName.trim(),
        email: indForm.email.trim(),
        phone: indForm.phone.trim(),
        country: indForm.country.trim(),
      }).catch(() => {});
      setStep("done");
    } catch {
      setError(t("regErrSubmit"));
    } finally {
      setBusy(false);
    }
  };

  const submitSchool = async (e) => {
    e.preventDefault();
    const req = ["schoolName", "adminName", "fullName", "email", "phone", "country", "expectedStudents", "expectedTeachers"];
    for (const k of req) {
      if (!String(schForm[k] || "").trim()) {
        setError(t("regErrRequired"));
        return;
      }
    }
    if (!EMAIL_RE.test(schForm.email.trim())) {
      setError(t("regErrEmail"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await base44.entities.RegistrationRequest.create({
        request_type: "school",
        full_name: schForm.fullName.trim(),
        email: schForm.email.trim(),
        phone: schForm.phone.trim(),
        country: schForm.country.trim(),
        school_name: schForm.schoolName.trim(),
        admin_name: schForm.adminName.trim(),
        expected_students: Number(schForm.expectedStudents) || 0,
        expected_teachers: Number(schForm.expectedTeachers) || 0,
        status: "new",
      });
      base44.functions.invoke("notifyOwnerRegistration", {
        requestType: "school",
        fullName: schForm.fullName.trim(),
        email: schForm.email.trim(),
        phone: schForm.phone.trim(),
        country: schForm.country.trim(),
        schoolName: schForm.schoolName.trim(),
        expectedStudents: schForm.expectedStudents,
        expectedTeachers: schForm.expectedTeachers,
      }).catch(() => {});
      setStep("done");
    } catch {
      setError(t("regErrSubmit"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      {/* شريط علوي بسيط مع زر اللغة */}
      <div className="max-w-3xl mx-auto px-4 pt-4 flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "#173F5F" }}>
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="font-black text-2xl mb-1">{t("regTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("regSubtitle")}</p>
        </div>

        {/* الخطوة 1: اختيار النوع */}
        {step === "type" && (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <TypeCard
              icon={User}
              title={t("regTypeIndividual")}
              desc={t("regTypeIndividualDesc")}
              color="#2E7D5B"
              onClick={() => { setStep("individual"); setError(null); }}
            />
            <TypeCard
              icon={SchoolIcon}
              title={t("regTypeSchool")}
              desc={t("regTypeSchoolDesc")}
              color="#2F6690"
              onClick={() => { setStep("school"); setError(null); }}
            />
          </div>
        )}

        {/* الخطوة 2أ: نموذج فردي */}
        {step === "individual" && (
          <div className="max-w-2xl mx-auto">
            <BackBar onBack={() => { setStep("type"); setError(null); }} />
            <div className="rounded-2xl p-6 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <h2 className="font-black text-base mb-1" style={{ color: "#173F5F" }}>{t("regIndividualTitle")}</h2>
              <p className="text-[11px] text-muted-foreground mb-4">{t("regIndividualDesc")}</p>
              <form onSubmit={submitIndividual} className="grid sm:grid-cols-2 gap-3">
                <Field label={`${t("regFullName")} *`} value={indForm.fullName} onChange={(v) => setIndForm({ ...indForm, fullName: v })} required />
                <Field label={`${t("regEmail")} *`} type="email" dir="ltr" value={indForm.email} onChange={(v) => setIndForm({ ...indForm, email: v })} required />
                <Field label={`${t("regPhone")} *`} dir="ltr" value={indForm.phone} onChange={(v) => setIndForm({ ...indForm, phone: v })} required />
                <Field label={`${t("regCountry")} *`} value={indForm.country} onChange={(v) => setIndForm({ ...indForm, country: v })} required />
                <ErrorRow error={error} />
                <div className="sm:col-span-2">
                  <button type="submit" disabled={busy}
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "#173F5F" }}>
                    {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                    {busy ? t("regSubmitting") : t("regSubmit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* الخطوة 2ب: نموذج مدرسي */}
        {step === "school" && (
          <div className="max-w-2xl mx-auto">
            <BackBar onBack={() => { setStep("type"); setError(null); }} />
            <div className="rounded-2xl p-6 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <h2 className="font-black text-base mb-1" style={{ color: "#173F5F" }}>{t("regSchoolTitle")}</h2>
              <p className="text-[11px] text-muted-foreground mb-4">{t("regSchoolDesc")}</p>
              <form onSubmit={submitSchool} className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Field label={`${t("regSchoolName")} *`} value={schForm.schoolName} onChange={(v) => setSchForm({ ...schForm, schoolName: v })} required />
                </div>
                <div>
                  <Field label={`${t("regAdminName")} *`} value={schForm.adminName} onChange={(v) => setSchForm({ ...schForm, adminName: v })} required />
                </div>
                <div className="sm:col-span-2 mt-1 mb-1">
                  <div className="text-[11px] font-bold" style={{ color: "#2F6690" }}>{t("regContactPerson")}</div>
                </div>
                <Field label={`${t("regFullName")} *`} value={schForm.fullName} onChange={(v) => setSchForm({ ...schForm, fullName: v })} required />
                <Field label={`${t("regEmail")} *`} type="email" dir="ltr" value={schForm.email} onChange={(v) => setSchForm({ ...schForm, email: v })} required />
                <Field label={`${t("regPhone")} *`} dir="ltr" value={schForm.phone} onChange={(v) => setSchForm({ ...schForm, phone: v })} required />
                <Field label={`${t("regCountry")} *`} value={schForm.country} onChange={(v) => setSchForm({ ...schForm, country: v })} required />
                <Field label={`${t("regExpectedStudents")} *`} type="number" min="1" value={schForm.expectedStudents} onChange={(v) => setSchForm({ ...schForm, expectedStudents: v })} required />
                <div>
                  <Field label={`${t("regExpectedTeachers")} *`} type="number" min="1" value={schForm.expectedTeachers} onChange={(v) => setSchForm({ ...schForm, expectedTeachers: v })} required />
                  <p className="text-[10px] text-muted-foreground mt-1">{t("regExpectedTeachersHint")}</p>
                </div>
                <ErrorRow error={error} />
                <div className="sm:col-span-2">
                  <button type="submit" disabled={busy}
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: "#173F5F" }}>
                    {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                    {busy ? t("regSubmitting") : t("regSubmit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* الخطوة 3: نجاح */}
        {step === "done" && (
          <div className="max-w-lg mx-auto rounded-2xl p-8 text-center bg-card" style={{ border: "1px solid rgba(46,125,91,0.35)" }}>
            <CheckCircle2 size={44} className="mx-auto mb-3" style={{ color: "#2E7D5B" }} />
            <h2 className="font-black text-lg mb-2">{t("regSuccessTitle")}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">{t("regSuccessMsg")}</p>
            <button onClick={() => { window.location.href = "/student-login"; }}
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: "#173F5F" }}>
              {t("regBackToLogin")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const _inputStyle = { background: "#F7F9FC", border: "1px solid #E2E8F0" };
const _labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";
const _inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none";

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className={_labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className={_inputCls} style={_inputStyle} {...props} />
    </div>
  );
}

function TypeCard({ icon: Icon, title, desc, color, onClick }) {
  return (
    <button onClick={onClick}
      className="rounded-2xl p-6 text-start bg-card transition-all hover:scale-[1.02]"
      style={{ border: `1px solid hsl(var(--border))` }}>
      <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}40` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-black text-base mb-1">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{desc}</p>
      <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color }}>
        {t("regSubmit")} <ArrowRight size={12} />
      </span>
    </button>
  );
}

function BackBar({ onBack }) {
  return (
    <button onClick={onBack}
      className="text-[11px] font-bold hover:underline mb-3 flex items-center gap-1" style={{ color: "#2F6690" }}>
      ← {t("regBack")}
    </button>
  );
}

function ErrorRow({ error }) {
  if (!error) return null;
  return (
    <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
      style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
      <AlertTriangle size={13} /> {error}
    </div>
  );
}