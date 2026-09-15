import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * studentLogin — التحقق من رمز المدرسة + رمز الطالب دون Base44 Authentication
 * يعيد جلسة طالب (student session) تحتوي على student_id, school_id, student_code, student_name
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { schoolCode, studentCode } = body;

    if (!schoolCode || !studentCode) {
      return Response.json({ error: "أدخل رمز المدرسة ورمز الطالب" }, { status: 400 });
    }

    // 1) التحقق من رمز المدرسة (موجودة ومفعّلة)
    const schools = await svc.entities.School.filter({
      code: schoolCode.trim(),
      is_active: true,
    });
    if (!schools || schools.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الطالب غير صحيح." }, { status: 404 });
    }
    const school = schools[0];

    // 2) التحقق من رمز الطالب داخل نفس المدرسة
    const students = await svc.entities.StudentProfile.filter({
      school_id: school.id,
      student_code: studentCode.trim(),
    });
    if (!students || students.length === 0) {
      return Response.json({ error: "رمز المدرسة أو رمز الطالب غير صحيح." }, { status: 404 });
    }
    const student = students[0];

    // 3) فحص حالة الحساب
    if (student.status === "pending") {
      return Response.json({ error: "حسابك بانتظار موافقة الإدارة. حاول لاحقاً." }, { status: 403 });
    }
    if (student.status === "rejected") {
      return Response.json({ error: "تم رفض حسابك من الإدارة." }, { status: 403 });
    }
    if (student.status === "disabled") {
      return Response.json({ error: "حسابك معطّل. تواصل مع إدارة المدرسة." }, { status: 403 });
    }
    if (student.status !== "approved") {
      return Response.json({ error: "رمز المدرسة أو رمز الطالب غير صحيح." }, { status: 403 });
    }

    // 4) إنشاء جلسة الطالب
    const session = {
      student_id: student.id,
      school_id: school.id,
      student_code: student.student_code,
      student_name: student.full_name || studentCode.trim(),
      preferred_language: student.preferred_language || "ar",
      login_at: new Date().toISOString(),
    };

    return Response.json(session);
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}