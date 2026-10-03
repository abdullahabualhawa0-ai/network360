import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp } from "../../shared/security.ts";

/**
 * teacherLogin — التحقق من رمز المدرسة + رمز الأستاذ دون Base44 Authentication
 * يعيد جلسة أستاذ (teacher session) تحتوي على teacher_id, school_id, teacher_code, teacher_name, subject
 * الأستاذ يرى فقط بيانات مدرسته.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { schoolCode, teacherCode } = body;

    // تحديد معدل المحاولات — منع تخمين الرموز (brute-force)
    const ipCheck = rateLimit(`teacherLogin:ip:${clientIp(req)}`, 20, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    if (!schoolCode || !teacherCode) {
      return Response.json({ error: "أدخل رمز المدرسة ورمز الأستاذ" }, { status: 400 });
    }
    const codeCheck = rateLimit(`teacherLogin:code:${String(schoolCode).trim()}:${String(teacherCode).trim()}`, 10, 15 * 60 * 1000);
    if (!codeCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }

    // 1) التحقق من رمز المدرسة (موجودة ومفعّلة)
    const schools = await svc.entities.School.filter({
      code: schoolCode.trim(),
      is_active: true,
    });
    if (!schools || schools.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الأستاذ غير صحيح." }, { status: 404 });
    }
    const school = schools[0];

    // 2) التحقق من رمز الأستاذ داخل نفس المدرسة
    const teachers = await svc.entities.Teacher.filter({
      school_id: school.id,
      teacher_code: teacherCode.trim(),
    });
    if (!teachers || teachers.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الأستاذ غير صحيح." }, { status: 404 });
    }
    const teacher = teachers[0];

    // 3) فحص حالة الحساب
    if (teacher.status === "disabled") {
      return Response.json({ error: "حسابك معطّل. تواصل مع إدارة المدرسة." }, { status: 403 });
    }
    if (teacher.status !== "active") {
      return Response.json({ error: "رمز المدرسة أو رمز الأستاذ غير صحيح." }, { status: 403 });
    }

    // 4) إنشاء جلسة الأستاذ
    const session = {
      teacher_id: teacher.id,
      school_id: school.id,
      school_code: school.code,
      teacher_code: teacher.teacher_code,
      teacher_name: teacher.full_name || teacherCode.trim(),
      subject: teacher.subject || "",
      preferred_language: teacher.preferred_language || "ar",
      login_at: new Date().toISOString(),
    };

    return Response.json(session);
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}