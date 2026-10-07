import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { rateLimit, clientIp } from "../../shared/security.ts";

/**
 * deleteMyAccount — حذف ذاتي (Self-service) لحساب مسجَّل بالبريد (Base44 Authentication).
 * مخصص للمالك (role=admin) ومشرف المدرسة بالبريد (role=school_admin).
 *
 * لماذا دالة Backend؟ المستخدم العادي في Base44 يستطيع قراءة وتعديل سجل User الخاص به فقط،
 * أما حذفه فيتطلب صلاحية service role. لذلك نتحقق من هوية المستدعي أولاً ثم نحذف سجله هو فقط.
 *
 * الأمان:
 *  - الهوية تُؤخذ من base44.auth.me() (توكن الطلب) — لا نقبل أي user id من العميل.
 *  - يُحذف سجل المستدعي نفسه فقط.
 *  - يلزم body.confirm === true كحماية من الاستدعاء بالخطأ.
 *  - الطلاب والأساتذة (دخول بالرموز) لهم مساراتهم الحالية ولا يمرون من هنا.
 */
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin" && user.role !== "school_admin") {
      return Response.json({ error: "Forbidden — email-registered admin accounts only" }, { status: 403 });
    }

    // تحديد معدل الطلبات لكل مستخدم/عنوان
    const rl = rateLimit(`deleteMyAccount:${user.id}:${clientIp(req)}`, 3, 10 * 60 * 1000);
    if (!rl.ok) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== true) {
      return Response.json({ error: "Confirmation required" }, { status: 400 });
    }

    // حذف سجل المستخدم نفسه فقط
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: (err as Error)?.message || "Unexpected error" }, { status: 500 });
  }
}
