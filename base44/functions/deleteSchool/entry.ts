import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { deleteWhere } from "../../shared/session.ts";

/**
 * deleteSchool — حذف مدرسة كاملة مع كل ما يرتبط بها (للمالك فقط، role=admin)
 *
 * يحذف: الطلاب (وتقدّمهم StudentProgress)، الأساتذة، امتحانات المدرسة (ليس العامة)،
 *       نتائج الامتحانات، طلبات الدخول، سجل المختبر وحالات المهام، وجلسات الدخول، ثم المدرسة نفسها.
 *
 * الأمان: التحقق من المستدعي عبر base44.auth.me() (دور admin فقط) + body.confirm === true.
 * لا يُحذف أي شيء يخص مدرسة أخرى؛ كل الحذف مقيّد بـ school_id.
 * إن بقيت سجلات بعد حدود الدفعة (مدرسة ضخمة) تُرجع partial:true ولا تُحذف المدرسة — أعد الاستدعاء.
 */
const BY_SCHOOL = ["LabHistory", "ScenarioTaskStatus", "ExamResult", "ExamAccessRequest", "Exam", "AuthSession", "StudentProfile", "Teacher"];

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — owner only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== true) return Response.json({ error: "Confirmation required" }, { status: 400 });
    const schoolId = body?.school_id;
    if (!schoolId || typeof schoolId !== "string") return Response.json({ error: "school_id required" }, { status: 400 });

    const svc = base44.asServiceRole;
    const school = await svc.entities.School.get(schoolId).catch(() => null);
    if (!school) return Response.json({ error: "School not found" }, { status: 404 });

    // تقدّم الطلاب (StudentProgress) مرتبط بـ student_id ولا يحمل school_id:
    // نحذفه لكل دفعة طلاب ثم نحذف الدفعة نفسها (كي لا نفقد المعرّفات).
    let studentsDeleted = 0;
    for (let round = 0; round < 40; round++) {
      const batch = (await svc.entities.StudentProfile.filter({ school_id: schoolId }, "-created_date", 200)) || [];
      if (batch.length === 0) break;
      for (const st of batch) {
        await deleteWhere(svc, "StudentProgress", { student_id: st.id });
        await svc.entities.StudentProfile.delete(st.id).catch(() => {});
        studentsDeleted++;
      }
    }

    for (const entity of BY_SCHOOL) {
      await deleteWhere(svc, entity, { school_id: schoolId });
    }

    // تحقق أن لا شيء تبقّى قبل حذف المدرسة
    for (const entity of BY_SCHOOL) {
      const left = (await svc.entities[entity].filter({ school_id: schoolId }, undefined, 1)) || [];
      if (left.length > 0) return Response.json({ ok: false, partial: true, remaining_in: entity });
    }

    await svc.entities.School.delete(schoolId);
    return Response.json({ ok: true, students_deleted: studentsDeleted });
  } catch (err) {
    return Response.json({ error: (err as Error)?.message || "Unexpected error" }, { status: 500 });
  }
}
