import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp, isLocked, recordFailure, filterByCode } from "../../shared/security.ts";
import { createSession, schoolUsable } from "../../shared/session.ts";

/**
 * teacherLogin — التحقق من رمز المدرسة + رمز الأستاذ دون Base44 Authentication
 * يعيد جلسة أستاذ تحتوي على بيانات العرض + token + expires_at.
 * الأستاذ يرى فقط بيانات مدرسته.
 */
const WINDOW = 15 * 60 * 1000;
const MAX_FAIL_SCHOOL = 40;
const MAX_FAIL_IP = 25;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const ip = clientIp(req);

    const ipCheck = rateLimit(`teacherLogin:ip:${ip}`, 20, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    const schoolKey = String(body.schoolCode ?? "").trim().slice(0, 64);
    const tCode = String(body.teacherCode ?? "").trim().slice(0, 64);
    if (!schoolKey || !tCode) {
      return Response.json({ error: "أدخل رمز المدرسة ورمز الأستاذ" }, { status: 400 });
    }

    const ipKey = `tl:ip:${ip}`;
    const schoolLockKey = `tl:school:${schoolKey.toUpperCase()}`;
    if (await isLocked(svc, ipKey, MAX_FAIL_IP) || await isLocked(svc, schoolLockKey, MAX_FAIL_SCHOOL)) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    const fail = async () => {
      await recordFailure(svc, ipKey, WINDOW);
      await recordFailure(svc, schoolLockKey, WINDOW);
      return Response.json({ error: "رمز المدرسة أو رمز الأستاذ غير صحيح." }, { status: 404 });
    };

    // 1) المدرسة (موجودة ومفعّلة)
    const schools = await filterByCode(svc, "School", "code", schoolKey, { is_active: true });
    if (schools.length === 0) return fail();
    const school = schools[0];

    // 2) رمز الأستاذ داخل نفس المدرسة
    const teachers = await filterByCode(svc, "Teacher", "teacher_code", tCode, { school_id: school.id });
    if (teachers.length === 0) return fail();
    const teacher = teachers[0];

    // 3) الاشتراك وحالة الحساب
    if (!schoolUsable(school)) {
      return Response.json({ error: "اشتراك المدرسة منتهي — تواصل مع إدارة المدرسة." }, { status: 403 });
    }
    if (teacher.status === "disabled") {
      return Response.json({ error: "حسابك معطّل. تواصل مع إدارة المدرسة." }, { status: 403 });
    }
    if (teacher.status !== "active") {
      return Response.json({ error: "رمز المدرسة أو رمز الأستاذ غير صحيح." }, { status: 403 });
    }

    // 4) جلسة الأستاذ
    const { token, expires_at } = await createSession(svc, "teacher", teacher.id, school.id);
    return Response.json({
      teacher_id: teacher.id,
      school_id: school.id,
      school_code: school.code,
      teacher_code: teacher.teacher_code,
      teacher_name: teacher.full_name || tCode,
      subject: teacher.subject || "",
      preferred_language: teacher.preferred_language || "ar",
      login_at: new Date().toISOString(),
      token,
      expires_at,
    });
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
