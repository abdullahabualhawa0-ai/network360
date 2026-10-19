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

/** هل الخطأ 402 (تعذر تنفيذ الدوال الخلفية على الخطة الحالية)؟ */
export function isPlan402(e) {
  return (e?.status ?? e?.response?.status) === 402;
}

/**
 * تنفيذ العملية مباشرة على قاعدة البيانات — النسخة الاحتياطية عند 402
 * تحاكي أفعال دوال الـAPI: list / filter / get / create / update / delete
 */
export async function directEntityAction(action, entity, payload = {}) {
  const E = base44.entities[entity];
  const { query = {}, data = {}, id, sort, limit } = payload;
  switch (action) {
    case "list": return await E.list(sort, limit);
    case "filter": return await E.filter(query, sort, limit);
    case "get": return await E.get(id);
    case "create": return await E.create(data);
    case "update": return await E.update(id, data);
    case "delete": return await E.delete(id);
    default: throw new Error("Action not supported locally: " + action);
  }
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