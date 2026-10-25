import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Sparkles, CheckCircle2, AlertTriangle, User, School as SchoolIcon, Loader2, ArrowRight } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";
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
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [hp, setHp] = useState("");

  const [indForm, setIndForm] = useState({ fullName: "", email: "", phone: "", country: "" });
  const [schForm, setSchForm] = useState({
    schoolName: "", adminName: "", fullName: "", email: "", phone: "", country: "",
    expectedStudents: "", expectedTeachers: "",
  });

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
      await sendRegistration({
        requestType: "individual",
        fullName: indForm.fullName.trim(),
        email: indForm.email.trim(),
        phone: indForm.phone.trim(),
        country: indForm.country.trim(),
        website: hp,
      }, {
        request_type: "individual",
        full_name: indForm.fullName.trim(),
        email: indForm.email.trim(),
        phone: indForm.phone.trim(),
        country: indForm.country.trim(),
        status: "new",
      });
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
      await sendRegistration({
        requestType: "school",
        fullName: schForm.fullName.trim(),
        email: schForm.email.trim(),
        phone: schForm.phone.trim(),
        country: schForm.country.trim(),
        schoolName: schForm.schoolName.trim(),
        expectedStudents: schForm.expectedStudents,
        expectedTeachers: schForm.expectedTeachers,
        website: hp,
      }, {
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
      setStep("done");
    } catch {
      setError(t("regErrSubmit"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      {/* شريط علوي بسيط مع زر اللغة */}
      <div className="max-w-3xl mx-auto px-4 pt-4 flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-[12px] mx-auto mb-3 flex items-center justify-center bg-primary">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
          <h1 className="font-black text-2xl mb-1 text-foreground">{t("regTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("regSubtitle")}</p>
        </div>

        {/* الخطوة 1: اختيار النوع */}
        {step === "type" && (
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <TypeCard
              icon={User}
              title={t("regTypeIndividual")}
              desc={t("regTypeIndividualDesc")}
              tone="success"
              onClick={() => { setStep("individual"); setError(null); }}
            />
            <TypeCard
              icon={SchoolIcon}
              title={t("regTypeSchool")}
              desc={t("regTypeSchoolDesc")}
              tone="brand"
              onClick={() => { setStep("school"); setError(null); }}
            />
          </div>
        )}

        {/* الخطوة 2أ: نموذج فردي */}
        {step === "individual" && (
          <div className="max-w-2xl mx-auto">
            <BackBar onBack={() => { setStep("type"); setError(null); }} />
            <div className="rounded-[16px] p-6 bg-card border border-border">
              <h2 className="font-black text-base mb-1 text-brand">{t("regIndividualTitle")}</h2>
              <p className="text-[11px] text-muted-foreground mb-4">{t("regIndividualDesc")}</p>
              <form onSubmit={submitIndividual} className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="website"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <Field label={`${t("regFullName")} *`} value={indForm.fullName} onChange={(v) => setIndForm({ ...indForm, fullName: v })} required />
                <Field label={`${t("regEmail")} *`} type="email" dir="ltr" value={indForm.email} onChange={(v) => setIndForm({ ...indForm, email: v })} required />
                <Field label={`${t("regPhone")} *`} dir="ltr" value={indForm.phone} onChange={(v) => setIndForm({ ...indForm, phone: v })} required />
                <Field label={`${t("regCountry")} *`} value={indForm.country} onChange={(v) => setIndForm({ ...indForm, country: v })} required />
                <ErrorRow error={error} />
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-[44px] py-3 rounded-[10px] text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                    {busy ? t("regSubmitting") : t("regSubmit")}
                  </button>
                </div>
                <p className="sm:col-span-2 text-[11px] text-muted-foreground text-center leading-relaxed">
                  {t("regConsentNote")}{" "}
                  <Link to="/privacy" className="font-bold text-brand hover:underline">{t("legalPrivacy")}</Link>
                  {" · "}
                  <Link to="/terms" className="font-bold text-brand hover:underline">{t("legalTerms")}</Link>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* الخطوة 2ب: نموذج مدرسي */}
        {step === "school" && (
          <div className="max-w-2xl mx-auto">
            <BackBar onBack={() => { setStep("type"); setError(null); }} />
            <div className="rounded-[16px] p-6 bg-card border border-border">
              <h2 className="font-black text-base mb-1 text-brand">{t("regSchoolTitle")}</h2>
              <p className="text-[11px] text-muted-foreground mb-4">{t("regSchoolDesc")}</p>
              <form onSubmit={submitSchool} className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="website"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />
                <div className="sm:col-span-2">
                  <Field label={`${t("regSchoolName")} *`} value={schForm.schoolName} onChange={(v) => setSchForm({ ...schForm, schoolName: v })} required />
                </div>
                <div>
                  <Field label={`${t("regAdminName")} *`} value={schForm.adminName} onChange={(v) => setSchForm({ ...schForm, adminName: v })} required />
                </div>
                <div className="sm:col-span-2 mt-1 mb-1">
                  <div className="text-[11px] font-bold text-brand">{t("regContactPerson")}</div>
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
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-[44px] py-3 rounded-[10px] text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : null}
                    {busy ? t("regSubmitting") : t("regSubmit")}
                  </button>
                </div>
                <p className="sm:col-span-2 text-[11px] text-muted-foreground text-center leading-relaxed">
                  {t("regConsentNote")}{" "}
                  <Link to="/privacy" className="font-bold text-brand hover:underline">{t("legalPrivacy")}</Link>
                  {" · "}
                  <Link to="/terms" className="font-bold text-brand hover:underline">{t("legalTerms")}</Link>
                </p>
              </form>
            </div>
          </div>
        )}

        {/* الخطوة 3: نجاح */}
        {step === "done" && (
          <div className="max-w-lg mx-auto rounded-[16px] p-8 text-center bg-card border border-success/40">
            <CheckCircle2 size={44} className="mx-auto mb-3 text-success" />
            <h2 className="font-black text-lg mb-2 text-foreground">{t("regSuccessTitle")}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">{t("regSuccessMsg")}</p>
            <button
              onClick={() => { window.location.href = "/student-login"; }}
              className="px-6 py-2.5 rounded-[10px] text-sm font-black bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("regBackToLogin")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendRegistration(payload, legacyEntityData) {
  try {
    const res = await base44.functions.invoke("notifyOwnerRegistration", payload);
    if (res?.data?.created === true) return;
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 400 || status === 429) throw err;
  }
  await base44.entities.RegistrationRequest.create(legacyEntityData);
}

const _labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";
const _inputCls = "w-full px-4 py-2.5 rounded-[10px] text-sm text-foreground bg-background border border-input focus:outline-none";

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className={_labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className={_inputCls} {...props} />
    </div>
  );
}

function TypeCard({ icon: Icon, title, desc, tone, onClick }) {
  const tones = {
    success: "bg-success/10 border-success/30 text-success",
    brand: "bg-accent border-border text-brand",
  };
  return (
    <button
      onClick={onClick}
      className="rounded-[16px] p-6 text-start bg-card border border-border transition-all hover:bg-accent"
    >
      <div className={`w-12 h-12 rounded-[10px] mb-3 flex items-center justify-center border ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <h3 className="font-black text-base mb-1 text-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{desc}</p>
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand">
        {t("regSubmit")} <ArrowRight size={12} />
      </span>
    </button>
  );
}

function BackBar({ onBack }) {
  return (
    <button
      onClick={onBack}
      className="text-[11px] font-bold text-brand hover:underline mb-3 flex items-center gap-1"
    >
      ← {t("regBack")}
    </button>
  );
}

function ErrorRow({ error }) {
  if (!error) return null;
  return (
    <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-xs font-bold bg-destructive/10 border border-destructive/35 text-destructive">
      <AlertTriangle size={13} /> {error}
    </div>
  );
}