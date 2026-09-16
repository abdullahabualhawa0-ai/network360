import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * notifyOwnerRegistration — يُرسل إشعاراً بريدياً إلى مالك المنصة (admin users)
 * عند تسجيل مدرسة جديدة (بانتظار التفعيل).
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { schoolName, schoolCode, adminName, adminEmail, planLabel } = body;

    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    if (!admins || admins.length === 0) return Response.json({ sent: 0 });

    const subject = "🔔 تسجيل مدرسة جديدة بانتظار التفعيل";
    const html = `
      <div dir="rtl" style="font-family: Tajawal, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #F7F9FC; border-radius: 16px;">
        <div style="background: #173F5F; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">طلب تسجيل مدرسة جديدة</h2>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #1F2937;">تم تسجيل مدرسة جديدة في المنصة وتنتظر تفعيلك:</p>
          <table style="width: 100%; font-size: 13px; color: #1F2937;">
            <tr><td style="padding: 6px 0; font-weight: bold;">اسم المدرسة:</td><td>${schoolName || "—"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">رمز المدرسة:</td><td style="font-family: monospace;">${schoolCode || "—"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">اسم المسؤول:</td><td>${adminName || "—"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">بريد المسؤول:</td><td dir="ltr">${adminEmail || "—"}</td></tr>
            <tr><td style="padding: 6px 0; font-weight: bold;">الخطة:</td><td>${planLabel || "—"}</td></tr>
          </table>
          <p style="margin: 16px 0 0; font-size: 12px; color: #64748B;">ادخل إلى لوحة الإدارة لتفعيل المدرسة وتعيين المسؤول مشرفاً.</p>
        </div>
      </div>
    `;

    let sent = 0;
    for (const admin of admins) {
      if (admin.email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: admin.email,
            subject,
            html,
          });
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