/**
 * registrationUtils.js — التحقق من رموز المدرسة والطالب عند التسجيل
 * التسلسل: رمز المدرسة موجود؟ → رمز الطالب موجود؟ → تابع لنفس المدرسة؟
 *          → مسجل مسبقاً؟ → الحساب مفعّل؟ → ربط الحساب بحالة Pending Approval
 */
import { base44 } from "@/api/base44Client";

export const UNCLAIMED = "__unclaimed__";

export async function registerStudent({ user, fullName, email, schoolCode, studentCode }) {
  const code = (schoolCode || "").trim();
  const sCode = (studentCode || "").trim();
  if (!code || !sCode) return { ok: false, error: "أدخل رمز المدرسة ورمز الطالب" };

  // 1) هل رمز المدرسة موجود ومفعّل؟
  const schools = await base44.entities.School.filter({ code, is_active: true });
  if (!schools || schools.length === 0) {
    return { ok: false, error: "رمز المدرسة غير صحيح، أو المدرسة غير مفعّلة" };
  }
  const school = schools[0];

  // 2) + 3) هل رمز الطالب موجود؟ وهل تابع لنفس المدرسة؟
  // (البحث داخل مدرسة الرمز فقط — لذلك لا يعمل رمز طالب مع رمز مدرسة أخرى)
  const students = await base44.entities.StudentProfile.filter({
    school_id: school.id,
    student_code: sCode,
  });
  if (!students || students.length === 0) {
    return { ok: false, error: "رمز الطالب غير صحيح لهذه المدرسة" };
  }
  const student = students[0];

  // 4) هل الطالب مسجل مسبقاً؟
  if (student.user_id && student.user_id !== UNCLAIMED) {
    return { ok: false, error: "هذا الرمز مستخدم ومسجل مسبقاً — تواصل مع إدارة مدرستك" };
  }

  // 5) هل الحساب فعال؟
  if (student.status === "rejected" || student.status === "disabled") {
    return { ok: false, error: "حسابك غير مفعّل — راجع إدارة المدرسة" };
  }

  // البيانات صحيحة → ربط الحساب بحالة Pending Approval
  await base44.entities.StudentProfile.update(student.id, {
    user_id: user.id,
    full_name: (fullName || student.full_name || user.full_name || "").trim(),
    email: (email || student.email || user.email || "").trim(),
    status: "pending",
  });

  // حفظ المدرسة على حساب المستخدم (يُستخدم في عزل البيانات على مستوى القاعدة)
  await base44.auth.updateMe({ school_id: school.id }).catch(() => {});

  return { ok: true };
}