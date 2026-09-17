/**
 * schoolAdminSession.js — إدارة جلسة مشرف المدرسة المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: school_id, school_code, school_name, admin_code, role
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SESSION_KEY = "school-admin-session";
const SESSION_EVENT = "school-admin-session-change";

export function getSchoolAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSchoolAdminSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearSchoolAdminSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Hook يتيح للمكونات التفاعل مع تغيّر الجلسة */
export function useSchoolAdminSession() {
  const [session, setSession] = useState(getSchoolAdminSession());
  useEffect(() => {
    const handler = () => setSession(getSchoolAdminSession());
    window.addEventListener(SESSION_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(SESSION_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return session;
}

/** تسجيل دخول مشرف المدرسة عبر رمز المدرسة + رمز المشرف */
export async function schoolAdminLogin(schoolCode, adminCode) {
  const res = await base44.functions.invoke("schoolAdminLogin", { schoolCode, adminCode });
  return res.data;
}

/**
 * طبقة الوصول لبيانات مشرف المدرسة — تستدعي دالة schoolAdminApi الخلفية مع حقن الجلسة.
 * العزل (school_id) يُفرض في الخادم.
 */
export async function schoolAdminApi(action, entity, payload = {}) {
  const session = getSchoolAdminSession();
  if (!session) throw new Error("No school admin session");
  try {
    const res = await base44.functions.invoke("schoolAdminApi", {
      session,
      action,
      entity,
      ...payload,
    });
    return res.data;
  } catch (e) {
    if (e?.status === 401 || e?.data?.error === "Invalid session") {
      clearSchoolAdminSession();
    }
    throw e;
  }
}