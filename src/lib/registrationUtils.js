/**
 * registrationUtils.js — التحقق من رموز المدرسة والطالب عند التسجيل
 * التسلسل: رمز المدرسة موجود؟ → رمز الطالب موجود؟ → تابع لنفس المدرسة؟
 *          → مسجل مسبقاً؟ → الحساب مفعّل؟ → ربط الحساب بحالة Pending Approval
 */
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";

export const UNCLAIMED = "__unclaimed__";

export async function registerStudent({ user, fullName, email, schoolCode, studentCode }) {
  const code = (schoolCode || "").trim();
  const sCode = (studentCode || "").trim();
  if (!code || !sCode) return { ok: false, error: "أدخل رمز المدرسة ورمز الطالب" };

  // 1) هل رمز المدرسة موجود ومفعّل؟ (تحقق من قاعدة البيانات — لا يعتمد على الواجهة)
  const schools = await base44.entities.School.filter({ code, is_active: true });
  if (!schools || schools.length === 0) {
    return { ok: false, error: t("errSchoolCode") };
  }
  const school = schools[0];

  // 2) هل رمز الطالب موجود في هذه المدرسة؟
  const students = await base44.entities.StudentProfile.filter({
    school_id: school.id,
    student_code: sCode,
  });
  let student = students?.[0] || null;

  // 3) إن لم يوجد — هل هو طالب تابع لمدرسة أخرى؟ → بيانات غير متطابقة
  if (!student) {
    const elsewhere = await base44.entities.StudentProfile.filter({ student_code: sCode });
    if (elsewhere && elsewhere.some((s) => s.school_id !== school.id)) {
      return { ok: false, error: t("errMismatch") };
    }
    return { ok: false, error: t("errStudentCode") };
  }

  // 4) نفس المستخدم يعيد الدخول برمزه → دخول طبيعي بلا تغيير الحالة
  if (student.user_id && student.user_id !== UNCLAIMED && student.user_id === user.id) {
    return { ok: true };
  }

  // 5) الرمز مرتبط بحساب مستخدم آخر
  if (student.user_id && student.user_id !== UNCLAIMED) {
    return { ok: false, error: t("errTaken") };
  }

  // 6) حالة الحساب (رمز غير مُفعّل من الإدارة)
  if (student.status === "disabled") {
    return { ok: false, error: t("errDisabled") };
  }
  if (student.status === "rejected") {
    return { ok: false, error: t("errNotApproved") };
  }

  // البيانات صحيحة → ربط الحساب بحالة Pending Approval
  await base44.entities.StudentProfile.update(student.id, {
    user_id: user.id,
    full_name: (fullName || student.full_name || user.full_name || "").trim(),
    email: (email || student.email || user.email || "").trim(),
    status: "pending",
  });

  // حفظ المدرسة ونوع الحساب على حساب المستخدم (يُستخدم في عزل البيانات على مستوى القاعدة)
  // account_type = school → مستخدم تابع لمدرسة (مقابل personal للمستخدم المستقل)
  await base44.auth.updateMe({ school_id: school.id, account_type: "school" }).catch(() => {});

  return { ok: true };
}