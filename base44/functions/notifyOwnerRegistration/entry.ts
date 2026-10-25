import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { escapeHtml, cleanText, rateLimit, clientIp, isLocked, recordHit } from "../../shared/security.ts";

/**
 * notifyOwnerRegistration — نقطة استقبال طلبات التسجيل (فردي أو مدرسي):
 *   1) يتحقق من المدخلات ويحدّ الإساءة (حدّ دائم لكل IP ولكل بريد + حقل فخ honeypot).
 *   2) ينشئ طلب RegistrationRequest عبر service role (الإنشاء المباشر من المتصفح مُغلق في RLS).
 *   3) يرسل إشعاراً بريدياً للمالك.
 *
 * المستلمون: إعداد النظام SystemSetting بمفتاح owner_notification_emails (قائمة مفصولة بفواصل)،
 * وإن لم يوجد فمستخدمو النظام بدور admin. لا توجد إيميلات ثابتة داخل الكود.
 * يعيد { created: true } حتى تعرف الواجهة أن هذا الإصدار نشط.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function resolveRecipients(svc: any): Promise<string[]> {
  try {
    const rows = await svc.entities.SystemSetting.filter({ key: "owner_notification_emails" });
    const raw = rows?.[0]?.value;
    if (typeof raw === "string" && raw.trim()) {
      const list = raw.split(/[,;\s]+/).map((e) => e.trim()).filter((e) => EMAIL_RE.test(e));
      if (list.length) return list;
    }
  } catch { /* تجاهل */ }
  try {
    const admins = await svc.entities.User.filter({ role: "admin" });
    return (admins || []).map((u: any) => u.email).filter((e: any) => typeof e === "string" && EMAIL_RE.test(e));
  } catch {
    return [];
  }
}
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    // منع إساءة استخدام نقطة النهاية المجهولة (mail-bombing)
    const ipCheck = rateLimit(`notifyOwnerRegistration:${clientIp(req)}`, 5, 10 * 60 * 1000);
    if (!ipCheck.ok) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const requestType = body.requestType === "school" ? "school" : "individual";
    const fullName = cleanText(body.fullName, 120);
    const email = cleanText(body.email, 160);
    const phone = cleanText(body.phone, 40);
    const country = cleanText(body.country, 80);
    const schoolName = cleanText(body.schoolName, 160);
    const adminName = cleanText(body.adminName, 120);
    const expectedStudents = cleanText(body.expectedStudents, 10);
    const expectedTeachers = cleanText(body.expectedTeachers, 10);
    const expectedUsers = cleanText(body.expectedUsers, 10);

    // حقل فخ (honeypot): الإنسان لا يراه ولا يملؤه — البوتات تملؤه. نُظهر نجاحاً وهمياً ولا نفعل شيئاً.
    if (cleanText(body.website, 200)) {
      return Response.json({ created: true, sent: 0 });
    }

    // تحقق أساسي من المدخلات
    if (!fullName || !email || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // حدّ دائم: 10 طلبات/ساعة لكل IP، و3 طلبات/يوم لكل بريد
    const ipKey = `reg:ip:${clientIp(req)}`;
    const mailKey = `reg:mail:${email.toLowerCase()}`;
    if (await isLocked(svc, ipKey, 10) || await isLocked(svc, mailKey, 3)) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
    await recordHit(svc, ipKey, 60 * 60 * 1000);
    await recordHit(svc, mailKey, 24 * 60 * 60 * 1000);

    // منع التكرار: طلب مفتوح بنفس البريد والنوع لا نُنشئه مرة ثانية ولا نزعج المالك
    try {
      const prev = (await svc.entities.RegistrationRequest.filter({ email, request_type: requestType })) || [];
      if (prev.some((r: any) => ["new", "contacted", "in_progress"].includes(r.status))) {
        return Response.json({ created: true, duplicate: true, sent: 0 });
      }
    } catch { /* تجاهل — نكمل الإنشاء */ }

    // إنشاء الطلب
    const num = (v: string) => Math.min(Math.max(Number(v) || 0, 0), 1000000);
    await svc.entities.RegistrationRequest.create(
      requestType === "school"
        ? {
            request_type: "school",
            full_name: fullName,
            email,
            phone,
            country,
            school_name: schoolName,
            admin_name: adminName,
            expected_students: num(expectedStudents),
            expected_teachers: num(expectedTeachers),
            status: "new",
          }
        : {
            request_type: "individual",
            full_name: fullName,
            email,
            phone,
            country,
            status: "new",
          }
    );

    const recipients = await resolveRecipients(svc);

    const isSchool = requestType === "school";
    const subject = isSchool
      ? "🔔 طلب تسجيل مدرسة جديدة"
      : "🔔 طلب تسجيل فردي جديد";

    const rows = isSchool
      ? `<tr><td style="padding:6px 0;font-weight:bold;">اسم المدرسة:</td><td>${escapeHtml(schoolName) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">اسم المسؤول:</td><td>${escapeHtml(fullName) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">البريد:</td><td dir="ltr">${escapeHtml(email) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الهاتف:</td><td dir="ltr">${escapeHtml(phone) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الدولة:</td><td>${escapeHtml(country) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد الطلاب المتوقع:</td><td>${escapeHtml(expectedStudents) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد الأساتذة المطلوب:</td><td>${escapeHtml(expectedTeachers) || "—"}</td></tr>`
      : `<tr><td style="padding:6px 0;font-weight:bold;">الاسم:</td><td>${escapeHtml(fullName) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">البريد:</td><td dir="ltr">${escapeHtml(email) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الهاتف:</td><td dir="ltr">${escapeHtml(phone) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الدولة:</td><td>${escapeHtml(country) || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد المستخدمين المتوقع:</td><td>${escapeHtml(expectedUsers) || "—"}</td></tr>`;

    const html = `
      <div dir="rtl" style="font-family: Tajawal, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #F7F9FC; border-radius: 16px;">
        <div style="background: #173F5F; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">${isSchool ? "طلب تسجيل مدرسة جديدة" : "طلب تسجيل فردي جديد"}</h2>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #1F2937;">تم استلام طلب تسجيل جديد:</p>
          <table style="width: 100%; font-size: 13px; color: #1F2937;">${rows}</table>
          <p style="margin: 16px 0 0; font-size: 12px; color: #64748B;">راجع الطلب من لوحة الإدارة → طلبات التسجيل.</p>
        </div>
      </div>
    `;

    let sent = 0;
    for (const emailAddr of recipients) {
      try {
        await svc.integrations.Core.SendEmail({ to: emailAddr, subject, html });
        sent++;
      } catch (e) {
        console.log("SendEmail failed for a recipient:", e?.message);
      }
    }
    return Response.json({ created: true, sent });
  } catch (error) {
    console.log("notifyOwnerRegistration error:", error?.message);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}