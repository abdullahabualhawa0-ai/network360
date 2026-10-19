/**
 * teacherSession.js — إدارة جلسة الأستاذ المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: teacher_id, school_id, school_code, teacher_code, teacher_name, subject
 * لا تُنشأ الجلسة إلا بعد التحقق من الرموز في الخادم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeCodeLogin } from "@/lib/loginRetry";

const SESSION_KEY = "teacher-session";
const SESSION_EVENT = "teacher-session-change";

export function getTeacherSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s) return null;
    // تُرفض الجلسات المحلية القديمة التي لم تصدر عن الخادم.
    const expiresAt = Date.parse(s.expires_at);
    if (typeof s.token !== "string" || !s.token || !s.teacher_id || !s.school_id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
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

/** تسجيل دخول الأستاذ عبر رمز المدرسة + رمز الأستاذ، بتحقق من الخادم فقط. */
export async function teacherLogin(schoolCode, teacherCode) {
  const school = String(schoolCode || "").trim();
  const code = String(teacherCode || "").trim();
  if (!school) throw new Error(t("errSchoolCode"));
  if (!code) throw new Error(t("errTeacherCode"));
  return invokeCodeLogin("teacherLogin", { schoolCode: school, teacherCode: code }, "teacher_id");
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
    if ((e?.status ?? e?.response?.status) === 401 || (e?.data?.error ?? e?.response?.data?.error) === "Invalid session") {
      clearTeacherSession();
    }
    throw e;
  }
}