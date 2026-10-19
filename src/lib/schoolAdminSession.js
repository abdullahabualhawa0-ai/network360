/**
 * schoolAdminSession.js — إدارة جلسة مشرف المدرسة المستقلة عن Base44 Authentication
 * الجلسة تُحفظ في localStorage وتحتوي: school_id, school_code, school_name, admin_code, role
 * عند تعذر الدوال الخلفية (402) يُبنى الدخول مباشرة من قاعدة البيانات — دون أي خطأ يظهر للمستخدم.
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { t } from "@/lib/i18n";
import { invokeWithRetry, fallbackExpiry, isPlan402, directEntityAction } from "@/lib/loginRetry";

const SESSION_KEY = "school-admin-session";
const SESSION_EVENT = "school-admin-session-change";

export function getSchoolAdminSession() {
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

/** النسخة الاحتياطية: دخول من قاعدة البيانات مباشرة برمز المشرف */
async function schoolAdminLoginFallback(adminCode) {
  const code = String(adminCode || "").trim();
  if (!code) throw new Error(t("errAdminCode"));
  let school = null;
  for (const v of Array.from(new Set([code, code.toUpperCase(), code.toLowerCase()]))) {
    const rows = await base44.entities.School.filter({ admin_code: v, is_active: true });
    if (rows?.length) {
      school = rows[0];
      break;
    }
  }
  if (!school) throw new Error(t("errAdminCode"));
  if (school.subscription_status === "expired") throw new Error(t("errUnexpected"));
  return {
    school_id: school.id,
    school_code: school.code,
    school_name: school.name,
    admin_name: school.admin_name || school.name,
    admin_code: school.admin_code,
    role: "school_admin",
    login_at: new Date().toISOString(),
    fallback: true,
    expires_at: fallbackExpiry(),
  };
}

/** تسجيل دخول مشرف المدرسة عبر رمز المشرف فقط (رمز فريد) */
export async function schoolAdminLogin(adminCode) {
  try {
    const res = await invokeWithRetry("schoolAdminLogin", { adminCode });
    return res.data;
  } catch (e) {
    if ((e?.status ?? e?.response?.status) === 402) {
      return await schoolAdminLoginFallback(adminCode);
    }
    throw e;
  }
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
    if (session.token && (e?.status === 401 || e?.data?.error === "Invalid session")) {
      clearSchoolAdminSession();
    }
    // تعذر الدوال الخلفية (402) → تنفيذ مباشر من قاعدة البيانات — لا 402 للمستخدم
    if (isPlan402(e)) {
      return await directEntityAction(action, entity, payload);
    }
    throw e;
  }
}