/**
 * security.ts — أدوات أمان مشتركة لدوال الـBackend
 * - escapeHtml: تهريب مدخلات المستخدم قبل بنائها داخل HTML (منع HTML/Content Injection)
 * - cleanText: تنظيف وتقصير النصوص القادمة من العميل
 * - rateLimit: تحديد معدل الطلبات (in-memory) لمنع تخمين الرموز (brute-force)
 * - clientIp: استخراج عنوان IP من الطلب
 */

export function escapeHtml(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function cleanText(value: any, maxLength = 200): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * محدّد معدل بسيط داخل الذاكرة لكل مفتاح (IP أو رمز).
 * يعيد { ok: false, retryAfter } عند تجاوز الحد المسموح داخل النافذة الزمنية.
 */
export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

export function clientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for") || headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "";
  const ip = forwarded.split(",")[0]?.trim();
  return ip || "unknown";
}