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
  // تفضيل الترويسات الموثوقة من البروكسي/الطرفية (غير قابلة للتلاعب من العميل)
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // الخوادم الوسيطة تُلحق IP العميل المتصل في نهاية السلسلة، بينما العنصر الأول قابل للتزوير
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }

  return "unknown";
}

/* ───────────────────────── حماية دائمة (Persistent) ─────────────────────────
 * المحدّد الذي في الذاكرة (rateLimit) يُصفَّر عند إعادة تشغيل الدالة ولا يُشارَك بين النسخ.
 * هذه الدوال تخزّن العدّادات في كيان RateLimit (service role) فتصمد وتُشارَك.
 * كلها fail-open: إذا تعذّر الوصول للكيان لا نمنع المستخدمين الشرعيين.
 */
const cleanKey = (k: string) => String(k || "").toLowerCase().slice(0, 180);

/** هل المفتاح مقفول (وصل للحد داخل النافذة الزمنية)؟ */
export async function isLocked(svc: any, key: string, max: number): Promise<boolean> {
  try {
    const rows = await svc.entities.RateLimit.filter({ key: cleanKey(key) });
    const row = rows?.[0];
    if (!row) return false;
    if (new Date(row.reset_at).getTime() <= Date.now()) return false;
    return (row.count || 0) >= max;
  } catch {
    return false;
  }
}

/** يزيد عدّاد المفتاح (يبدأ نافذة جديدة إذا انتهت السابقة). يعيد العدد الحالي بعد الزيادة. */
export async function recordHit(svc: any, key: string, windowMs: number): Promise<number> {
  try {
    const k = cleanKey(key);
    const rows = await svc.entities.RateLimit.filter({ key: k });
    const row = rows?.[0];
    const now = Date.now();
    if (!row) {
      await svc.entities.RateLimit.create({ key: k, count: 1, reset_at: new Date(now + windowMs).toISOString() });
      return 1;
    }
    if (new Date(row.reset_at).getTime() <= now) {
      await svc.entities.RateLimit.update(row.id, { count: 1, reset_at: new Date(now + windowMs).toISOString() });
      return 1;
    }
    const next = (row.count || 0) + 1;
    await svc.entities.RateLimit.update(row.id, { count: next });
    return next;
  } catch {
    return 0;
  }
}

/** تسجيل محاولة فاشلة — اسم بديل أوضح للاستخدام في الدخول */
export const recordFailure = recordHit;

export async function clearFailures(svc: any, key: string): Promise<void> {
  try {
    const rows = await svc.entities.RateLimit.filter({ key: cleanKey(key) });
    for (const r of rows || []) await svc.entities.RateLimit.delete(r.id);
  } catch { /* تجاهل */ }
}

/**
 * البحث برمز مع التسامح في حالة الأحرف: يجرّب النص كما هو ثم الأحرف الكبيرة ثم الصغيرة.
 * (لوحات مفاتيح الجوال تغيّر حالة الحرف الأول فيفشل الدخول برمز صحيح.)
 */
export async function filterByCode(svc: any, entity: string, field: string, code: string, extra: any = {}): Promise<any[]> {
  const raw = String(code ?? "").trim();
  const variants = Array.from(new Set([raw, raw.toUpperCase(), raw.toLowerCase()])).filter(Boolean);
  for (const v of variants) {
    const rows = await svc.entities[entity].filter({ ...extra, [field]: v });
    if (rows && rows.length > 0) return rows;
  }
  return [];
}