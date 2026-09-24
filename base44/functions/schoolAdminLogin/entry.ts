import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * schoolAdminLogin — التحقق من رمز المدرسة + رمز المشرف (admin_code) دون Base44 Authentication
 * يعيد جلسة مشرف مدرسة تحتوي على school_id, school_code, school_name, admin_code
 * مشرف المدرسة يرى ويدير فقط بيانات مدرسته.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { adminCode } = body;

    if (!adminCode) {
      return Response.json({ error: "أدخل رمز المشرف" }, { status: 400 });
    }

    // 1) البحث عن المدرسة برمز المشرف فقط (رمز فريد لكل مشرف)
    const schools = await svc.entities.School.filter({
      admin_code: adminCode.trim(),
      is_active: true,
    });
    if (!schools || schools.length === 0) {
      return Response.json({ error: "رمز المشرف غير صحيح." }, { status: 404 });
    }
    const school = schools[0];

    // 3) التحقق من حالة الاشتراك
    if (school.subscription_status === "expired") {
      return Response.json({ error: "اشتراك المدرسة منتهي — تواصل مع مالك المنصة." }, { status: 403 });
    }

    // 4) إنشاء جلسة مشرف المدرسة
    const session = {
      school_id: school.id,
      school_code: school.code,
      school_name: school.name,
      admin_name: school.admin_name || school.name,
      admin_code: school.admin_code,
      role: "school_admin",
      login_at: new Date().toISOString(),
    };

    return Response.json(session);
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}