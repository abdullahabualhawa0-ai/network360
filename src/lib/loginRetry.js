/**
 * loginRetry.js — أدوات مشتركة لتسجيل الدخول
 * • invokeWithRetry: يستدعي الدالة الخلفية ويعيد المحاولة تلقائياً عند 402 (حد استخدام مؤقت)
 * • النسخة الاحتياطية: تُبنى الجلسة من قاعدة البيانات مباشرة بدون دوال خلفية — لا يظهر للمستخدم أي 402
 */
import { base44 } from "@/api/base44Client";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** استدعاء دالة خلفية مع إعادة محاولة عند 402 فقط (حتى 3 محاولات) */
export async function invokeWithRetry(name, payload, tries = 3) {
  let lastErr = null;
  for (let i = 0; i < tries; i++) {
    try {
      return await base44.functions.invoke(name, payload);
    } catch (e) {
      lastErr = e;
      const status = e?.status ?? e?.response?.status;
      if (status !== 402) throw e;
      await sleep(600 * (i + 1));
    }
  }
  throw lastErr;
}

/** صلاحية الجلسة الاحتياطية (12 ساعة) */
export function fallbackExpiry() {
  return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
}

/** بحث المدرسة برمزها (غير حساس لحالة الأحرف) — مفعّلة فقط */
export async function schoolByCode(code) {
  for (const v of Array.from(new Set([code, code.toUpperCase(), code.toLowerCase()]))) {
    const rows = await base44.entities.School.filter({ code: v, is_active: true });
    if (rows?.length) return rows[0];
  }
  return null;
}