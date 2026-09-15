/**
 * studentSession.js — إدارة جلسة الطالب المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: student_id, school_id, student_code, student_name, login_at
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SESSION_KEY = "student-session";
const SESSION_EVENT = "student-session-change";

export function getStudentSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
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

/** تسجيل دخول الطالب عبر رمز المدرسة + رمز الطالب */
export async function studentLogin(schoolCode, studentCode) {
  const res = await base44.functions.invoke("studentLogin", { schoolCode, studentCode });
  return res.data;
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
    // إن كانت الجلسة غير صالحة، امحها
    if (e?.status === 401 || e?.data?.error === "Invalid session") {
      clearStudentSession();
    }
    throw e;
  }
}