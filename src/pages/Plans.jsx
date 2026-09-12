import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { PLANS, randomCode } from "@/lib/plans";
import PersonalPlans from "@/components/plans/PersonalPlans";
import SchoolPlans from "@/components/plans/SchoolPlans";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

/**
 * صفحة اختيار الخطة — "إنشاء حساب جديد"
 * لا يُنشأ الحساب قبل اختيار الخطة:
 * - الخطة الشخصية → حساب طالب شخصي فوري
 * - الخطة المدرسية → تسجيل المدرسة (بانتظار تفعيل المالك وتعيين المشرف)
 */
export default function Plans() {
  const { user } = useAuth();
  useLang();
  const [busy, setBusy] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [schoolDone, setSchoolDone] = useState(null);
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
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("P");
      const school = await base44.entities.School.create({
        name: `${user.full_name || "حساب"} — شخصي`,
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
        full_name: user.full_name || "طالب",
        email: user.email,
        status: "approved",
        user_id: user.id,
        approved_by: "self",
        approved_at: new Date().toISOString(),
      });
      // مستخدم مستقل (Personal) — لا يحتاج School Code، ونوع الحساب يُفصل عن مستخدم المدرسة
      await base44.auth.updateMe({ school_id: school.id, account_type: "personal" }).catch(() => {});
      window.location.href = "/";
    } catch {
      setError("تعذر إنشاء الحساب — حاول مجدداً");
      setBusy(null);
    }
  };

  // الخطة المدرسية → تسجيل مدرسة جديدة برمز فريد (بانتظار تفعيل المالك)
  const submitSchool = async (planId) => {
    if (!schoolForm.name.trim()) { setError("أدخل اسم المدرسة أولاً"); return; }
    setBusy(planId);
    setError(null);
    try {
      const code = await uniqueCode("SCH");
      await base44.entities.School.create({
        name: schoolForm.name.trim(),
        code,
        admin_email: schoolForm.email.trim() || user?.email || null,
        is_active: false,
        created_by_id: user?.id,
        subscription_plan: planId,
        student_limit: PLANS[planId].student_limit,
        current_student_count: 0,
        subscription_status: "pending",
      });
      setSchoolDone({ code, plan: PLANS[planId].label });
    } catch {
      setError("تعذر تسجيل المدرسة — حاول مجدداً");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}>
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="font-black text-2xl mb-1">{t("plansTitle")}</h1>
          <p className="text-xs text-muted-foreground">{t("plansSubtitle")}</p>
        </div>

        {schoolDone ? (
          <div className="rounded-2xl p-8 text-center bg-card" style={{ border: "1px solid rgba(52,211,153,0.35)" }}>
            <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: "#34d399" }} />
            <h2 className="font-black text-lg mb-2">تم استلام طلب مدرستك ✓</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              الخطة: <b>{schoolDone.plan}</b>
              <br />
              رمز المدرسة: <span className="font-mono" style={{ color: "#06b6d4" }}>{schoolDone.code}</span>
              <br /><br />
              سيقوم مالك المنصة بتفعيل المدرسة وتعيينك مشرفاً عبر بريدك، عندها يمكنك إضافة طلاب مدرستك برموزهم.
            </p>
          </div>
        ) : (
          <>
            <PersonalPlans
              isStudent={user?.role === "student"}
              hasProfile={hasProfile}
              busy={busy}
              onSelect={startPersonal}
            />
            <SchoolPlans
              busy={busy}
              form={schoolForm}
              setForm={setSchoolForm}
              onSelect={submitSchool}
            />
          </>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}