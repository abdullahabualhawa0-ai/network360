/**
 * session.ts — جلسات دخول حقيقية على الخادم (للطلاب والأساتذة ومشرفي المدارس بالرمز)
 *
 * قبل: الجلسة كانت JSON في المتصفح (student_id + school_id + student_code) وتُقبل كما هي دون انتهاء.
 * الآن: عند الدخول ينشئ الخادم رمزاً عشوائياً (256 بت) ويخزّن هاشه فقط في كيان AuthSession مع تاريخ انتهاء.
 *       كل استدعاء API يرسل الرمز، والخادم يستخرج منه الهوية (subject_id/school_id) ولا يثق بأي معرّف من العميل.
 */

export type SessionRole = "student" | "teacher" | "school_admin";

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_TTL: Record<SessionRole, number> = {
  student: 30 * DAY,
  teacher: 14 * DAY,
  school_admin: 7 * DAY,
};
const MAX_SESSIONS_PER_SUBJECT = 10;

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** ينشئ جلسة ويعيد الرمز الخام (يُرسل للعميل مرة واحدة) وتاريخ الانتهاء */
export async function createSession(svc: any, role: SessionRole, subjectId: string, schoolId: string) {
  const token = randomToken();
  const expires_at = new Date(Date.now() + SESSION_TTL[role]).toISOString();

  // تنظيف انتهازي (في ~ربع عمليات الدخول لتقليل عمليات قاعدة البيانات): احذف المنتهي، وأبقِ أحدث N جلسة لنفس الشخص
  try {
    if (Math.random() > 0.25) throw new Error("skip-cleanup");
    const existing = (await svc.entities.AuthSession.filter({ subject_id: subjectId, role }, "-created_date", 100)) || [];
    const now = Date.now();
    const live: any[] = [];
    for (const s of existing) {
      if (new Date(s.expires_at).getTime() <= now) await svc.entities.AuthSession.delete(s.id).catch(() => {});
      else live.push(s);
    }
    const excess = live.length - (MAX_SESSIONS_PER_SUBJECT - 1);
    if (excess > 0) {
      for (const s of live.slice(live.length - excess)) await svc.entities.AuthSession.delete(s.id).catch(() => {});
    }
  } catch { /* لا نُفشل الدخول بسبب التنظيف */ }

  await svc.entities.AuthSession.create({
    token_hash: await sha256Hex(token),
    role,
    subject_id: subjectId,
    school_id: schoolId,
    expires_at,
  });
  return { token, expires_at };
}

/** يتحقق من جلسة العميل ويعيد سجل الجلسة (المصدر الموثوق للهوية) أو null */
export async function loadSession(svc: any, session: any, role: SessionRole) {
  const token = session?.token;
  if (typeof token !== "string" || token.length !== 64) return null;
  try {
    const rows = await svc.entities.AuthSession.filter({ token_hash: await sha256Hex(token) });
    const rec = rows?.[0];
    if (!rec || rec.role !== role) return null;
    if (new Date(rec.expires_at).getTime() <= Date.now()) {
      await svc.entities.AuthSession.delete(rec.id).catch(() => {});
      return null;
    }
    return rec;
  } catch {
    return null;
  }
}

/** حذف كل جلسات شخص (عند حذف حسابه أو تعطيله) */
export async function deleteSessions(svc: any, subjectId: string) {
  try {
    for (let i = 0; i < 20; i++) {
      const rows = (await svc.entities.AuthSession.filter({ subject_id: subjectId }, undefined, 200)) || [];
      if (rows.length === 0) break;
      for (const r of rows) await svc.entities.AuthSession.delete(r.id).catch(() => {});
    }
  } catch { /* تجاهل */ }
}

/** هل المدرسة صالحة للاستخدام؟ (غير معطّلة وغير منتهية الاشتراك) */
export function schoolUsable(school: any): boolean {
  if (!school) return false;
  if (school.is_active === false) return false;
  if (school.subscription_status === "expired") return false;
  return true;
}

/** حذف كل سجلات كيان تطابق استعلاماً (على دفعات) */
export async function deleteWhere(svc: any, entity: string, query: any) {
  for (let i = 0; i < 40; i++) {
    const rows = (await svc.entities[entity].filter(query, undefined, 200)) || [];
    if (rows.length === 0) break;
    for (const r of rows) await svc.entities[entity].delete(r.id);
  }
}

/** يحصر كائناً في حقول مسموحة فقط (حماية من Mass Assignment) */
export function pick(data: any, fields: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  if (!data || typeof data !== "object") return out;
  for (const f of fields) if (f in data && data[f] !== undefined) out[f] = data[f];
  return out;
}

/** إرجاع الحقول المسموحة فقط من صف (للقراءة) */
export function project(row: any, fields?: string[]) {
  if (!row || !fields) return row;
  return pick(row, fields);
}
