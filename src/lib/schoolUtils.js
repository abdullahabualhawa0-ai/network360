/**
 * schoolUtils.js — أدوات عزل بيانات المدارس (Multi-Tenant)
 */
import { base44 } from "@/api/base44Client";

export const GENERAL_SCHOOL = "general";

/** مدرسة الطالب من ملفه الشخصي — أو "general" */
export async function resolveStudentSchool(user) {
  try {
    const profiles = await base44.entities.StudentProfile.filter({ user_id: user.id });
    return profiles?.[0]?.school_id || GENERAL_SCHOOL;
  } catch {
    return GENERAL_SCHOOL;
  }
}

/** مدرسة المعلم/المدير — من حقل admin_email في جدول المدارس */
export async function resolveAdminSchool(user) {
  try {
    const schools = await base44.entities.School.filter({ admin_email: user?.email });
    return schools?.[0]?.id || null;
  } catch {
    return null;
  }
}

/** اسم مدرسة بالمعرف */
export async function getSchoolName(schoolId) {
  if (!schoolId || schoolId === GENERAL_SCHOOL) return "عام";
  try {
    const school = await base44.entities.School.get(schoolId);
    return school?.name || schoolId;
  } catch {
    return schoolId;
  }
}