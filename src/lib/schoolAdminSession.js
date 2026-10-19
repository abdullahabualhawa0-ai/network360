/**
 * schoolAdminSession.js — إدارة جلسة مشرف المدرسة المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: school_id, school_code, school_name, admin_code, role
 * لا تُنشأ الجلسة إلا بعد التحقق من الرمز في الخادم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeCodeLogin } from "@/lib/loginRetry";

const SESSION_KEY = "school-admin-session";
const SESSION_EVENT = "school-admin-session-change";

export function getSchoolAdminSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s) return null;
    // تُرفض الجلسات المحلية القديمة التي لم تصدر عن الخادم.
    const expiresAt = Date.parse(s.expires_at);
    if (typeof s.token !== "string" || !s.token || !s.school_id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
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

/** تسجيل دخول مشرف المدرسة عبر رمز المشرف، بتحقق من الخادم فقط. */
export async function schoolAdminLogin(adminCode) {
  const code = String(adminCode || "").trim();
  if (!code) throw new Error(t("errAdminCode"));
  return invokeCodeLogin("schoolAdminLogin", { adminCode: code }, "school_id");
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
    if ((e?.status ?? e?.response?.status) === 401 || (e?.data?.error ?? e?.response?.data?.error) === "Invalid session") {
      clearSchoolAdminSession();
    }
    throw e;
  }
}