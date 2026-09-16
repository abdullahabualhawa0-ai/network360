import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { PLANS, randomCode } from "@/lib/plans";
import PersonalPlans from "@/components/plans/PersonalPlans";
import SchoolPlans from "@/components/plans/SchoolPlans";
import RegistrationSurvey from "@/components/RegistrationSurvey";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * صفحة اختيار الخطة — "إنشاء حساب جديد"
 * يجب تعبئة استبيان المعلومات الأساسية قبل إكمال التسجيل/الاشتراك.
 */
export default function Plans() {
  const { user } = useAuth();
  useLang();
  const direction = useDir();
  const [busy, setBusy] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [schoolDone, setSchoolDone] = useState(null);
  const [survey, setSurvey] = useState(null); // بيانات الاستبيان — null = لم يُعبّأ بعد
  const [schoolForm, setSchoolForm] = useState({ name: "", email: user?.email || "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "student") return;
    base44.entities.StudentProfile.filter({ user_id: user.id })
      .then((rows) => setHasProfile((rows || []).length > 0))
      .catch(() => setHasProfile(false));
  }, [user?.id, user?.role]);

  const uniqueCode = async (prefix) => {
    let code = randomCode(prefix);
    while ((await base44.entities.School.filter({ code })).length > 0) code = randomCode(prefix);
    return code;
  };

  // الخطة الشخصية → إنشاء مدرسة شخصية (طالب واحد) + ملف طالب معتمد فورًا
  const startPersonal = async (planId) => {
    if (!survey) return;
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("P");
      const school = await base44.entities.School.create({
        name: `${survey.fullName || user?.full_name || "حساب"} — شخصي`,
        code,
        is_active: true,
        created_by_id: user.id,
        subscription_plan: planId,
        student_limit: 1,
        current_student_count: 0,
        subscription_status: "active",
      });
      let sCode = randomCode("STU-");
      while ((await base44.entities.StudentProfile.filter({ school_id: school.id, student_code: sCode })).length > 0) {
        sCode = randomCode("STU-");
      }
      await base44.entities.StudentProfile.create({
        school_id: school.id,
        student_code: sCode,
        full_name: survey.fullName || user?.full_name || "طالب",
        email: survey.email || user?.email,
        status: "approved",
        user_id: user.id,
        approved_by: "self",
        approved_at: new Date().toISOString(),
        phone: survey.phone,
        country: survey.country,
      });
      await base44.auth.updateMe({ school_id: school.id, account_type: "personal" }).catch(() => {});
      window.location.href = "/";
    } catch {
      setError(t("errCreateAccount"));
      setBusy(null);
    }
  };

  // الخطة المدرسية → تسجيل مدرسة جديدة برمز فريد (بانتظار تفعيل المالك)
  const submitSchool = async (planId) => {
    if (!survey) return;
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("SCH");
      await base44.entities.School.create({
        name: (survey.schoolName || schoolForm.name || "").trim(),
        code,
        admin_email: survey.email || schoolForm.email.trim() || user?.email || null,
        is_active: false,
        created_by_id: user?.id,
        subscription_plan: planId,
        student_limit: PLANS[planId].student_limit,
        current_student_count: 0,
        subscription_status: "pending",
        admin_name: survey.adminName,
        contact_phone: survey.phone,
        country: survey.country,
        expected_students: survey.expectedStudents,
      });
      setSchoolDone({ code, plan: PLANS[planId].label });
      // إشعار مالك المنصة بطلب تسجيل مدرسة جديد
      base44.functions.invoke("notifyOwnerRegistration", {
        schoolName: (survey.schoolName || schoolForm.name || "").trim(),
        schoolCode: code,
        adminName: survey.adminName || survey.fullName || "",
        adminEmail: survey.email || schoolForm.email.trim() || user?.email || "",
        planLabel: PLANS[planId].label,
      }).catch(() => {});
    } catch {
      setError(t("errRegisterSchool"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "#173F5F" }}>
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="font-black text-2xl mb-1">{t("plansTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("plansSubtitle")}</p>
        </div>

        {schoolDone ? (
          <div className="rounded-2xl p-8 text-center bg-card" style={{ border: "1px solid rgba(46,125,91,0.35)" }}>
            <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "#2E7D5B" }} />
            <h2 className="font-black text-lg mb-2">{t("schoolReceivedTitle")}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("schoolReceivedPlan")}: <b>{schoolDone.plan}</b>
              <br />
              {t("schoolReceivedCode")}: <span className="font-mono" style={{ color: "#2F6690" }}>{schoolDone.code}</span>
              <br /><br />
              {t("schoolReceivedNote")}
            </p>
          </div>
        ) : !survey ? (
          // الخطوة 1: استبيان المعلومات الأساسية — إلزامي قبل اختيار الخطة
          <RegistrationSurvey
            initialType="individual"
            onSubmit={(data) => setSurvey(data)}
          />
        ) : (
          // الخطوة 2: عرض خطة واحدة فقط حسب نوع التسجيل المختار في الاستبيان
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground">
                {survey.regType === "school" ? t("schoolPlanSection") : t("personalPlanSection")}
              </span>
              <button onClick={() => setSurvey(null)}
                className="text-[11px] font-bold hover:underline" style={{ color: "#2F6690" }}>
                {t("back")} ←
              </button>
            </div>
            {survey.regType === "school" ? (
              <SchoolPlans
                busy={busy}
                form={{ name: survey.schoolName || "", email: survey.email || "" }}
                setForm={setSchoolForm}
                onSelect={submitSchool}
              />
            ) : (
              <PersonalPlans
                isStudent={user?.role === "student"}
                busy={busy}
                onSelect={startPersonal}
              />
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
            style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}