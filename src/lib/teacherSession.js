/**
 * teacherSession.js — إدارة جلسة الأستاذ المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: teacher_id, school_id, school_code, teacher_code, teacher_name, subject
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SESSION_KEY = "teacher-session";
const SESSION_EVENT = "teacher-session-change";

export function getTeacherSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
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

/** تسجيل دخول الأستاذ عبر رمز المدرسة + رمز الأستاذ */
export async function teacherLogin(schoolCode, teacherCode) {
  const res = await base44.functions.invoke("teacherLogin", { schoolCode, teacherCode });
  return res.data;
}

/**
 * طبقة الوصول لبيانات الأستاذ — تستدعي دالة studentApi الخلفية مع حقن الجلسة.
 * الأستاثذ يرى فقط بيانات مدرسته (العزل يُفرض في الخادم عبر school_id).
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
    if (e?.status === 401 || e?.data?.error === "Invalid session") {
      clearTeacherSession();
    }
    throw e;
  }
}