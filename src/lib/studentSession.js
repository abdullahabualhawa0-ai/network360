/**
 * studentSession.js — إدارة جلسة الطالب المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: student_id, school_id, student_code, student_name, login_at
 * لا تُنشأ الجلسة إلا بعد التحقق من الرموز في الخادم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeCodeLogin } from "@/lib/loginRetry";

const SESSION_KEY = "student-session";
const SESSION_EVENT = "student-session-change";

export function getStudentSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s) return null;
    // تُرفض الجلسات المحلية القديمة التي لم تصدر عن الخادم.
    const expiresAt = Date.parse(s.expires_at);
    if (typeof s.token !== "string" || !s.token || !s.student_id || !s.school_id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
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

/** تسجيل دخول الطالب — لا يُحفظ أي دخول قبل التحقق من الخادم. */
export async function studentLogin(schoolCode, studentCode) {
  const code = String(studentCode || "").trim();
  const school = String(schoolCode || "").trim();
  if (!code) throw new Error(t("errStudentCode"));
  if (schoolCode != null && !school) throw new Error(t("errSchoolCode"));
  return invokeCodeLogin("studentLogin", { schoolCode: school || null, studentCode: code }, "student_id");
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
    if ((e?.status ?? e?.response?.status) === 401 || (e?.data?.error ?? e?.response?.data?.error) === "Invalid session") {
      clearStudentSession();
    }
    throw e;
  }
}