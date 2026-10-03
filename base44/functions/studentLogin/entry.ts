import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp } from "../../shared/security.ts";

/**
 * studentLogin — تسجيل دخول الطالب دون Base44 Authentication
 *
 * وضعان:
 *  1) طالب مدرسة: schoolCode + studentCode (الوضع التقليدي)
 *  2) طالب فردي (خطة شخصية): studentCode فقط — يُبحث عالمياً ويُتحقق أن مدرسته بخطة شخصية
 *
 * يعيد جلسة طالب (student session) تحتوي على student_id, school_id, student_code, student_name, is_personal
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { schoolCode, studentCode } = body;

    // تحديد معدل المحاولات — منع تخمين الرموز (brute-force)
    const ipCheck = rateLimit(`studentLogin:ip:${clientIp(req)}`, 20, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    if (!studentCode || !String(studentCode).trim()) {
      return Response.json({ error: "أدخل رمز الطالب" }, { status: 400 });
    }
    const codeCheck = rateLimit(`studentLogin:code:${String(schoolCode || "").trim()}:${String(studentCode).trim()}`, 10, 15 * 60 * 1000);
    if (!codeCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }

    const sCode = String(studentCode).trim();

    // ── الوضع الفردي: لا يوجد schoolCode → ابحث عالمياً برمز الطالب ──
    if (!schoolCode || !String(schoolCode).trim()) {
      const students = await svc.entities.StudentProfile.filter({ student_code: sCode });
      if (!students || students.length === 0) {
        return Response.json({ error: "رمز الطالب غير صحيح." }, { status: 404 });
      }
      const student = students[0];

      // تحقق أن المدرسة بخطة شخصية
      const school = await svc.entities.School.get(student.school_id).catch(() => null);
      if (!school) {
        return Response.json({ error: "رمز الطالب غير صحيح." }, { status: 404 });
      }
      const isPersonal = typeof school.subscription_plan === "string"
        && school.subscription_plan.startsWith("personal_");
      if (!isPersonal) {
        return Response.json({ error: "رمز الطالب غير صحيح." }, { status: 404 });
      }
      if (!school.is_active) {
        return Response.json({ error: "رمز الطالب غير صحيح." }, { status: 404 });
      }

      // فحص حالة الحساب
      const statusErr = checkStatus(student);
      if (statusErr) return Response.json({ error: statusErr.msg }, { status: statusErr.code });

      return Response.json(buildSession(student, school, true));
    }

    // ── الوضع المدرسي: schoolCode + studentCode ──
    const sc = String(schoolCode).trim();
    const schools = await svc.entities.School.filter({ code: sc, is_active: true });
    if (!schools || schools.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الطالب غير صحيح." }, { status: 404 });
    }
    const school = schools[0];

    const students = await svc.entities.StudentProfile.filter({
      school_id: school.id,
      student_code: sCode,
    });
    if (!students || students.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الطالب غير صحيح." }, { status: 404 });
    }
    const student = students[0];

    const statusErr = checkStatus(student);
    if (statusErr) return Response.json({ error: statusErr.msg }, { status: statusErr.code });

    const isPersonal = typeof school.subscription_plan === "string"
      && school.subscription_plan.startsWith("personal_");
    return Response.json(buildSession(student, school, isPersonal));
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

function buildSession(student, school, isPersonal) {
  return {
    student_id: student.id,
    school_id: school.id,
    student_code: student.student_code,
    student_name: student.full_name || student.student_code,
    preferred_language: student.preferred_language || "ar",
    is_personal: isPersonal,
    login_at: new Date().toISOString(),
  };
}