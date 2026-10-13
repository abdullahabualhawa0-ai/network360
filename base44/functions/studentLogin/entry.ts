import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp, isLocked, recordFailure, clearFailures, filterByCode } from "../../shared/security.ts";
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
 *  - محدّد في الذاكرة (سريع) + عدّادات فشل دائمة: لكل مدرسة، ولكل IP.
 *  - البحث بالرمز غير حساس لحالة الأحرف (لوحات الجوال تغيّر الحرف الأول).
 */
const WINDOW = 15 * 60 * 1000;
const MAX_FAIL_SCHOOL = 40;
const MAX_FAIL_IP = 25;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { schoolCode, studentCode } = body;
    const ip = clientIp(req);

    const ipCheck = rateLimit(`studentLogin:ip:${ip}`, 20, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    if (!studentCode || !String(studentCode).trim()) {
      return Response.json({ error: "أدخل رمز الطالب" }, { status: 400 });
    }
    const sCode = String(studentCode).trim().slice(0, 64);
    const schoolKey = String(schoolCode || "").trim().slice(0, 64);

    const ipKey = `sl:ip:${ip}`;
    const schoolLockKey = `sl:school:${schoolKey.toUpperCase()}`;
    if (await isLocked(svc, ipKey, MAX_FAIL_IP) || (schoolKey && await isLocked(svc, schoolLockKey, MAX_FAIL_SCHOOL))) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }

    const fail = async (error: string, status = 404) => {
      await recordFailure(svc, ipKey, WINDOW);
      if (schoolKey) await recordFailure(svc, schoolLockKey, WINDOW);
      return Response.json({ error }, { status });
    };

    // ── الوضع الفردي: لا يوجد schoolCode → ابحث عالمياً برمز الطالب ──
    if (!schoolKey) {
      const students = await filterByCode(svc, "StudentProfile", "student_code", sCode);
      if (students.length === 0) return fail("رمز الطالب غير صحيح.");
      const student = students[0];

      const school = await svc.entities.School.get(student.school_id).catch(() => null);
      const isPersonal = !!school && typeof school.subscription_plan === "string"
        && school.subscription_plan.startsWith("personal_");
      if (!school || !isPersonal || school.is_active === false) return fail("رمز الطالب غير صحيح.");
      if (!schoolUsable(school)) {
        return Response.json({ error: "انتهى اشتراكك — تواصل مع إدارة المنصة." }, { status: 403 });
      }

      const statusErr = checkStatus(student);
      if (statusErr) return Response.json({ error: statusErr.msg }, { status: statusErr.code });

      await clearFailures(svc, ipKey);
      return Response.json(await buildSession(svc, student, school, true));
    }

    // ── الوضع المدرسي: schoolCode + studentCode ──
    const schools = await filterByCode(svc, "School", "code", schoolKey, { is_active: true });
    if (schools.length === 0) return fail("رمز المدرسة أو رمز الطالب غير صحيح.");
    const school = schools[0];

    const students = await filterByCode(svc, "StudentProfile", "student_code", sCode, { school_id: school.id });
    if (students.length === 0) return fail("رمز المدرسة أو رمز الطالب غير صحيح.");
    const student = students[0];

    if (!schoolUsable(school)) {
      return Response.json({ error: "اشتراك المدرسة منتهي — تواصل مع إدارة المدرسة." }, { status: 403 });
    }

    const statusErr = checkStatus(student);
    if (statusErr) return Response.json({ error: statusErr.msg }, { status: statusErr.code });

    await clearFailures(svc, ipKey);
    const isPersonal = typeof school.subscription_plan === "string"
      && school.subscription_plan.startsWith("personal_");
    return Response.json(await buildSession(svc, student, school, isPersonal));
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

function checkStatus(student) {
  if (student.status === "pending") return { msg: "حسابك بانتظار موافقة الإدارة. حاول لاحقاً.", code: 403 };
  if (student.status === "rejected") return { msg: "تم رفض حسابك من الإدارة.", code: 403 };
  if (student.status === "disabled") return { msg: "حسابك معطّل. تواصل مع إدارة المدرسة.", code: 403 };
  if (student.status !== "approved") return { msg: "رمز الطالب غير صحيح.", code: 403 };
  return null;
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
