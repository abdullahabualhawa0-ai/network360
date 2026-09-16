import { useState } from "react";
import { UserPlus, Loader2, AlertTriangle, User, School as SchoolIcon } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * استبيان المعلومات الأساسية الموحد — يُعرض قبل إكمال التسجيل/الاشتراك.
 * الحقول المطلوبة: الاسم الكامل، البريد، الهاتف، الدولة، نوع التسجيل.
 * للمدرسة يُضاف: اسم المدرسة، اسم المسؤول، عدد الطلاب المتوقع.
 * لا يُكمل التسجيل قبل تعبئة الحقول المطلوبة.
 */
export default function RegistrationSurvey({ initialType = "individual", onSubmit, submitLabel, busy }) {
  useLang();
  const direction = useDir();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    regType: initialType, // "individual" | "school"
    schoolName: "",
    adminName: "",
    expectedStudents: "",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const required = ["fullName", "email", "phone", "country"];
    if (form.regType === "school") required.push("schoolName", "adminName", "expectedStudents");
    for (const k of required) {
      if (!String(form[k] || "").trim()) {
        setError(t("errSurveyRequired"));
        return;
      }
    }
    setError("");
    onSubmit({
      ...form,
      expectedStudents: form.regType === "school" ? Number(form.expectedStudents) || 0 : undefined,
    });
  };

  const inputStyle = { background: "#F7F9FC", border: "1px solid #E2E8F0" };
  const labelCls = "block text-[11px] font-bold text-muted-foreground mb-1.5";
  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none";

  return (
    <div className="rounded-2xl p-6 bg-card mb-6" dir={direction}
      style={{ border: "1px solid rgba(47,102,144,0.25)" }}>
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={16} style={{ color: "#2F6690" }} />
        <h2 className="font-black text-base" style={{ color: "#173F5F" }}>{t("surveyTitle")}</h2>
      </div>
      <p className="text-[11px] text-muted-foreground mb-4">{t("surveySubtitle")}</p>

      {/* نوع التسجيل */}
      <div className="mb-4">
        <label className={labelCls}>{t("surveyRegType")} *</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "individual", icon: User, label: t("surveyTypeIndividual"), color: "#2E7D5B" },
            { id: "school", icon: SchoolIcon, label: t("surveyTypeSchool"), color: "#2F6690" },
          ].map((opt) => {
            const active = form.regType === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => set("regType", opt.id)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: active ? "rgba(47,102,144,0.1)" : "rgba(23,63,95,0.03)",
                  border: `1px solid ${active ? "#2F6690" : "#E2E8F0"}`,
                  color: active ? "#173F5F" : "rgba(31,41,55,0.7)",
                }}>
                <opt.icon size={15} style={{ color: active ? opt.color : "rgba(31,41,55,0.5)" }} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t("surveyFullName")} *</label>
          <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
            className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls}>{t("surveyEmail")} *</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            dir="ltr" className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls}>{t("surveyPhone")} *</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
            dir="ltr" className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls}>{t("surveyCountry")} *</label>
          <input value={form.country} onChange={(e) => set("country", e.target.value)}
            className={inputCls} style={inputStyle} required />
        </div>

        {form.regType === "school" && (
          <>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("surveySchoolName")} *</label>
              <input value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)}
                className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className={labelCls}>{t("surveyAdminName")} *</label>
              <input value={form.adminName} onChange={(e) => set("adminName", e.target.value)}
                className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className={labelCls}>{t("surveyExpectedStudents")} *</label>
              <input type="number" min="1" value={form.expectedStudents}
                onChange={(e) => set("expectedStudents", e.target.value)}
                className={inputCls} style={inputStyle} required />
            </div>
          </>
        )}

        {error && (
          <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "#173F5F" }}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : null}
            {submitLabel || t("surveyContinue")}
          </button>
        </div>
      </form>
    </div>
  );
}