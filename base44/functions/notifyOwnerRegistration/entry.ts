import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { escapeHtml, cleanText, rateLimit, clientIp } from "../../shared/security.ts";

/**
 * notifyOwnerRegistration — يُرسل إشعاراً بريدياً إلى مالك المنصة (admin users)
 * عند تسجيل طلب جديد (فردي أو مدرسي).
 * الحماية: تحديد معدل الطلبات + تهريب كل الحقول القادمة من العميل قبل بنائها داخل HTML.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

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
    const expectedStudents = cleanText(body.expectedStudents, 10);
    const expectedTeachers = cleanText(body.expectedTeachers, 10);
    const expectedUsers = cleanText(body.expectedUsers, 10);

    // تحقق أساسي من المدخلات
    if (!fullName || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ADMIN_EMAILS = [
      "ismailshihadeh@gmail.com",
      "abdullahabualhawa0@gmail.com",
      "amerdraweesh@gmail.com",
    ];

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
    for (const emailAddr of ADMIN_EMAILS) {
      try {
        await base44.integrations.Core.SendEmail({ to: emailAddr, subject, html });
        sent++;
      } catch (e) {
        console.log("SendEmail failed for", emailAddr, e?.message);
      }
    }
    return Response.json({ sent });
  } catch (error) {
    console.log("notifyOwnerRegistration error:", error?.message);
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}