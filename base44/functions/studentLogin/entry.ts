import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp, isLocked, recordFailure, filterByCode } from "../../shared/security.ts";
import { createSession, schoolUsable } from "../../shared/session.ts";

/**
 * studentLogin — تسجيل دخول الطالب دون Base44 Authentication
 *
 * وضعان:
 *  1) طالب مدرسة: schoolCode + studentCode (الوضع التقليدي)
 *  2) طالب فردي (خطة شخصية): studentCode فقط — يُبحث عالمياً ويُتحقق أن مدرسته بخطة شخصية
 *
 * يعيد جلسة طالب تحتوي على بيانات العرض + token (رمز جلسة عشوائي يُخزَّن هاشه في الخادم) + expires_at.
 *
 * الحماية من التخمين:
 *  - حدود صارمة ومتعددة: لكل IP، ولكل مدرسة (ذاكرة + عدّاد دائم)، ولكل رمز طالب.
 *  - رسالة فشل واحدة لكل الحالات (رمز غير موجود / معلّق / مرفوض / معطّل) حتى لا يمكن
 *    التأكد من وجود رمز طالب بالتجربة.
 *  - البحث بالرمز غير حساس لحالة الأحرف (لوحات الجوال تغيّر الحرف الأول).
 */
const WINDOW = 15 * 60 * 1000;
const MAX_FAIL_IP = 8;
const MAX_FAIL_SCHOOL = 20;
const MAX_FAIL_CODE = 5;

const GENERIC_ERROR = "رمز الطالب غير صحيح أو الحساب غير مفعّل. تواصل مع إدارة المدرسة.";
const LOCKED_ERROR = "محاولات كثيرة — حاول لاحقاً.";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { schoolCode, studentCode } = body;
    const ip = clientIp(req);

    if (!rateLimit(`studentLogin:ip:${ip}`, 12, 10 * 60 * 1000).ok) {
      return Response.json({ error: LOCKED_ERROR }, { status: 429 });
    }
    if (!studentCode || !String(studentCode).trim()) {
      return Response.json({ error: "أدخل رمز الطالب" }, { status: 400 });
    }
    const sCode = String(studentCode).trim().slice(0, 64);
    const schoolKey = String(schoolCode || "").trim().slice(0, 64);

    if (schoolKey && !rateLimit(`studentLogin:school:${schoolKey.toUpperCase()}`, 30, 10 * 60 * 1000).ok) {
      return Response.json({ error: LOCKED_ERROR }, { status: 429 });
    }

    const ipKey = `sl:ip:${ip}`;
    const schoolLockKey = `sl:school:${schoolKey.toUpperCase()}`;
    const codeLockKey = `sl:code:${schoolKey.toUpperCase()}:${sCode.toUpperCase()}`;

    if (
      await isLocked(svc, ipKey, MAX_FAIL_IP) ||
      (schoolKey && await isLocked(svc, schoolLockKey, MAX_FAIL_SCHOOL)) ||
      await isLocked(svc, codeLockKey, MAX_FAIL_CODE)
    ) {
      return Response.json({ error: LOCKED_ERROR }, { status: 429 });
    }

    // فشل موحّد: نفس الرسالة ونفس رمز الحالة لكل الحالات، مع تسجيل المحاولة في كل العدّادات
    const fail = async () => {
      await recordFailure(svc, ipKey, WINDOW);
      if (schoolKey) await recordFailure(svc, schoolLockKey, WINDOW);
      await recordFailure(svc, codeLockKey, WINDOW);
      return Response.json({ error: GENERIC_ERROR }, { status: 404 });
    };

    // ── الوضع الفردي: لا يوجد schoolCode → ابحث عالمياً برمز الطالب ──
    if (!schoolKey) {
      const students = await filterByCode(svc, "StudentProfile", "student_code", sCode);
      if (students.length === 0) return await fail();
      const student = students[0];

      const school = await svc.entities.School.get(student.school_id).catch(() => null);
      const isPersonal = !!school && typeof school.subscription_plan === "string"
        && school.subscription_plan.startsWith("personal_");
      if (!school || !isPersonal || school.is_active === false) return await fail();
      if (!schoolUsable(school)) return await fail();
      if (student.status !== "approved") return await fail();

      return Response.json(await buildSession(svc, student, school, true));
    }

    // ── الوضع المدرسي: schoolCode + studentCode ──
    const schools = await filterByCode(svc, "School", "code", schoolKey, { is_active: true });
    if (schools.length === 0) return await fail();
    const school = schools[0];

    // حالة الاشتراك تُفحص قبل البحث عن الطالب: الرسالة تخص المدرسة لا صحة رمز الطالب
    if (!schoolUsable(school)) {
      return Response.json({ error: "اشتراك المدرسة منتهي — تواصل مع إدارة المدرسة." }, { status: 403 });
    }

    const students = await filterByCode(svc, "StudentProfile", "student_code", sCode, { school_id: school.id });
    if (students.length === 0) return await fail();
    const student = students[0];
    if (student.status !== "approved") return await fail();

    const isPersonal = typeof school.subscription_plan === "string"
      && school.subscription_plan.startsWith("personal_");
    return Response.json(await buildSession(svc, student, school, isPersonal));
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

async function buildSession(svc, student, school, isPersonal) {
  const { token, expires_at } = await createSession(svc, "student", student.id, school.id);
  return {
    student_id: student.id,
    school_id: school.id,
    student_code: student.student_code,
    student_name: student.full_name || student.student_code,
    preferred_language: student.preferred_language || "ar",
    is_personal: isPersonal,
    login_at: new Date().toISOString(),
    token,
    expires_at,
  };
}