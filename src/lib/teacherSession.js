/**
 * teacherSession.js — إدارة جلسة الأستاذ المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: teacher_id, school_id, school_code, teacher_code, teacher_name, subject
 * عند تعذر الدوال الخلفية (402) يُبنى الدخول مباشرة من قاعدة البيانات — دون أي خطأ يظهر للمستخدم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeWithRetry, fallbackExpiry, schoolByCode, isPlan402, directEntityAction } from "@/lib/loginRetry";

const SESSION_KEY = "teacher-session";
const SESSION_EVENT = "teacher-session-change";

export function getTeacherSession() {
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

export function setTeacherSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearTeacherSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Hook يتيح للمكونات التفاعل مع تغيّر الجلسة */
export function useTeacherSession() {
  const [session, setSession] = useState(getTeacherSession());
  useEffect(() => {
    const handler = () => setSession(getTeacherSession());
    window.addEventListener(SESSION_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SESSION_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return session;
}

/** النسخة الاحتياطية: دخول من قاعدة البيانات مباشرة */
async function teacherLoginFallback(schoolCode, teacherCode) {
  const sKey = String(schoolCode || "").trim();
  const tCode = String(teacherCode || "").trim();
  if (!sKey || !tCode) throw new Error(t("errTeacherCode"));
  const school = await schoolByCode(sKey);
  if (!school) throw new Error(t("errTeacherCode"));
  const rows = await base44.entities.Teacher.filter({ school_id: school.id, teacher_code: tCode });
  const teacher = rows?.[0] || null;
  if (!teacher || teacher.status !== "active") throw new Error(t("errTeacherCode"));
  return {
    teacher_id: teacher.id,
    school_id: school.id,
    school_code: school.code,
    teacher_code: teacher.teacher_code,
    teacher_name: teacher.full_name || tCode,
    subject: teacher.subject || "",
    preferred_language: teacher.preferred_language || "ar",
    login_at: new Date().toISOString(),
    fallback: true,
    expires_at: fallbackExpiry(),
  };
}

/** تسجيل دخول الأستاذ عبر رمز المدرسة + رمز الأستاذ */
export async function teacherLogin(schoolCode, teacherCode) {
  try {
    const res = await invokeWithRetry("teacherLogin", { schoolCode, teacherCode });
    return res.data;
  } catch (e) {
    if ((e?.status ?? e?.response?.status) === 402) {
      return await teacherLoginFallback(schoolCode, teacherCode);
    }
    throw e;
  }
}

/**
 * طبقة الوصول لبيانات الأستاذ — تستدعي دالة teacherApi الخلفية مع حقن الجلسة.
 * الأستاذ يرى فقط بيانات مدرسته (العزل يُفرض في الخادم عبر school_id).
 */
export async function teacherApi(action, entity, payload = {}) {
  const session = getTeacherSession();
  if (!session) throw new Error("No teacher session");
  try {
    const res = await base44.functions.invoke("teacherApi", {
      session,
      action,
      entity,
      ...payload,
    });
    return res.data;
  } catch (e) {
    if (session.token && (e?.status === 401 || e?.data?.error === "Invalid session")) {
      clearTeacherSession();
    }
    // تعذر الدوال الخلفية (402) → تنفيذ مباشر من قاعدة البيانات — لا 402 للمستخدم
    if (isPlan402(e)) {
      return await directEntityAction(action, entity, payload);
    }
    throw e;
  }
}