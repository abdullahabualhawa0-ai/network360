import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp, isLocked, recordFailure, clearFailures, filterByCode } from "../../shared/security.ts";
import { createSession } from "../../shared/session.ts";

/**
 * schoolAdminLogin — التحقق من رمز المشرف (admin_code) دون Base44 Authentication
 * يعيد جلسة مشرف مدرسة (بيانات عرض + token + expires_at). مشرف المدرسة يدير بيانات مدرسته فقط.
 *
 * ملاحظة: الجلسة لم تعد تُستخدم فيها admin_code للتحقق؛ الرمز السري يبقى لحظة الدخول فقط.
 */
const WINDOW = 15 * 60 * 1000;
const MAX_FAIL_IP = 12;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const ip = clientIp(req);

    const ipCheck = rateLimit(`schoolAdminLogin:ip:${ip}`, 20, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }
    const adminCode = String(body.adminCode ?? "").trim().slice(0, 64);
    if (!adminCode) {
      return Response.json({ error: "أدخل رمز المشرف" }, { status: 400 });
    }

    const ipKey = `sal:ip:${ip}`;
    const codeKey = `sal:code:${adminCode.toUpperCase()}`;
    if (await isLocked(svc, ipKey, MAX_FAIL_IP) || await isLocked(svc, codeKey, 15)) {
      return Response.json({ error: "محاولات كثيرة — حاول لاحقاً." }, { status: 429 });
    }

    // البحث بالرمز فقط (رمز فريد لكل مشرف)
    const schools = await filterByCode(svc, "School", "admin_code", adminCode, { is_active: true });
    if (schools.length === 0) {
      await recordFailure(svc, ipKey, WINDOW);
      await recordFailure(svc, codeKey, WINDOW);
      return Response.json({ error: "رمز المشرف غير صحيح." }, { status: 404 });
    }
    const school = schools[0];

    if (school.subscription_status === "expired") {
      return Response.json({ error: "اشتراك المدرسة منتهي — تواصل مع مالك المنصة." }, { status: 403 });
    }
    await clearFailures(svc, ipKey);
    await clearFailures(svc, codeKey);
    const { token, expires_at } = await createSession(svc, "school_admin", school.id, school.id);
    return Response.json({
      school_id: school.id,
      school_code: school.code,
      school_name: school.name,
      admin_name: school.admin_name || school.name,
      admin_code: school.admin_code,
      role: "school_admin",
      login_at: new Date().toISOString(),
      token,
      expires_at,
    });
  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ غير متوقع" }, { status: 500 });
  }
}