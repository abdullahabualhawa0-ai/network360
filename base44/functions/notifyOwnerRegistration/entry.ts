import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * notifyOwnerRegistration — يُرسل إشعاراً بريدياً إلى مالك المنصة (admin users)
 * عند تسجيل طلب جديد (فردي أو مدرسي).
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { requestType, fullName, email, phone, country, schoolName, expectedStudents, expectedTeachers, expectedUsers } = body;

    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    if (!admins || admins.length === 0) return Response.json({ sent: 0 });

    const isSchool = requestType === "school";
    const subject = isSchool
      ? "🔔 طلب تسجيل مدرسة جديدة"
      : "🔔 طلب تسجيل فردي جديد";

    const rows = isSchool
      ? `<tr><td style="padding:6px 0;font-weight:bold;">اسم المدرسة:</td><td>${schoolName || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">اسم المسؤول:</td><td>${fullName || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">البريد:</td><td dir="ltr">${email || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الهاتف:</td><td dir="ltr">${phone || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الدولة:</td><td>${country || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد الطلاب المتوقع:</td><td>${expectedStudents || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد الأساتذة المطلوب:</td><td>${expectedTeachers || "—"}</td></tr>`
      : `<tr><td style="padding:6px 0;font-weight:bold;">الاسم:</td><td>${fullName || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">البريد:</td><td dir="ltr">${email || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الهاتف:</td><td dir="ltr">${phone || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">الدولة:</td><td>${country || "—"}</td></tr>
         <tr><td style="padding:6px 0;font-weight:bold;">عدد المستخدمين المتوقع:</td><td>${expectedUsers || "—"}</td></tr>`;

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
    for (const admin of admins) {
      if (admin.email) {
        try {
          await base44.integrations.Core.SendEmail({ to: admin.email, subject, html });
          sent++;
        } catch (e) {
          console.log("SendEmail failed for", admin.email, e?.message);
        }
      }
    }
    return Response.json({ sent });
  } catch (error) {
    console.log("notifyOwnerRegistration error:", error?.message);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}