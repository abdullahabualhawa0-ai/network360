/**
 * studentSession.js — إدارة جلسة الطالب المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: student_id, school_id, student_code, student_name, login_at
 * عند تعذر الدوال الخلفية (402) يُبنى الدخول مباشرة من قاعدة البيانات — دون أي خطأ يظهر للمستخدم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeWithRetry, fallbackExpiry, schoolByCode } from "@/lib/loginRetry";

const SESSION_KEY = "student-session";
const SESSION_EVENT = "student-session-change";

export function getStudentSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s) return null;
    // جلسة منتهية، أو بلا رمز خادم وليست احتياطية → تُعتبر غير موجودة
    const expired = s.expires_at && new Date(s.expires_at).getTime() <= Date.now();
    if (expired || (!s.token && !s.fallback)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function setStudentSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearStudentSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Hook يتيح للمكونات التفاعل مع تغيّر الجلسة */
export function useStudentSession() {
  const [session, setSession] = useState(getStudentSession());
  useEffect(() => {
    const handler = () => setSession(getStudentSession());
    window.addEventListener(SESSION_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SESSION_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return session;
}

/** النسخة الاحتياطية: دخول من قاعدة البيانات مباشرة (مدرسي أو فردي) */
async function studentLoginFallback(schoolCode, studentCode) {
  const code = String(studentCode || "").trim();
  if (!code) throw new Error(t("errStudentCode"));
  let student = null;
  let school = null;
  const sKey = String(schoolCode || "").trim();
  if (sKey) {
    school = await schoolByCode(sKey);
    if (!school) throw new Error(t("errSchoolCode"));
    const rows = await base44.entities.StudentProfile.filter({ school_id: school.id, student_code: code });
    student = rows?.[0] || null;
    if (!student) throw new Error(t("errStudentCode"));
  } else {
    // الوضع الفردي: رمز الطالب فقط — يجب أن تنتمي لمدرسة بخطة شخصية
    const rows = await base44.entities.StudentProfile.filter({ student_code: code });
    for (const st of rows || []) {
      const sc = await base44.entities.School.get(st.school_id).catch(() => null);
      if (sc && String(sc.subscription_plan || "").startsWith("personal_") && sc.is_active !== false) {
        student = st;
        school = sc;
        break;
      }
    }
    if (!student) throw new Error(t("errInvalidCode"));
  }
  if (student.status === "disabled") throw new Error(t("errDisabled"));
  if (student.status !== "approved") throw new Error(t("errNotApproved"));
  const isPersonal = !!school && String(school.subscription_plan || "").startsWith("personal_");
  return {
    student_id: student.id,
    school_id: school?.id || "",
    student_code: student.student_code,
    student_name: student.full_name || student.student_code,
    preferred_language: student.preferred_language || "ar",
    is_personal: isPersonal,
    login_at: new Date().toISOString(),
    fallback: true,
    expires_at: fallbackExpiry(),
  };
}

/** تسجيل دخول الطالب — رمز المدرسة + رمز الطالب (مدرسي) أو رمز الطالب فقط (فردي) */
export async function studentLogin(schoolCode, studentCode) {
  try {
    const res = await invokeWithRetry("studentLogin", { schoolCode, studentCode });
    return res.data;
  } catch (e) {
    if ((e?.status ?? e?.response?.status) === 402) {
      return await studentLoginFallback(schoolCode, studentCode);
    }
    throw e;
  }
}

/**
 * طبقة الوصول لبيانات الطالب — تستدعي دالة studentApi الخلفية مع حقن الجلسة تلقائياً.
 * العزل (student_id + school_id) يُفرض في الخادم.
 */
export async function studentApi(action, entity, payload = {}) {
  const session = getStudentSession();
  if (!session) throw new Error("No student session");
  try {
    const res = await base44.functions.invoke("studentApi", {
      session,
      action,
      entity,
      ...payload,
    });
    return res.data;
  } catch (e) {
    // الجلسة الحقيقية غير الصالحة تُمحى — الجلسة الاحتياطية تبقى (حتى لا يُطرد الطالب من التطبيق)
    if (session.token && (e?.status === 401 || e?.data?.error === "Invalid session")) {
      clearStudentSession();
    }
    throw e;
  }
}