import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * manageTeachers — إدارة الأساتذة لمشرف المدرسة (school_admin) عبر Base44 Authentication
 * يفرض حد عدد الأساتذة (teacher_limit) من الـBackend عند الإنشاء.
 * يدعم: list, create, update, toggleStatus
 * الأستاذ يُربط تلقائياً بنفس school_id الخاص بالـschool_admin.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { action, data = {}, id, session } = body;

    // تحديد school_id: عبر جلسة مشرف المدرسة (رمز) أو عبر Base44 auth
    let schoolId;
    if (session?.school_id && session?.admin_code) {
      // جلسة مشرف المدرسة بالرمز — تحقق من صحتها
      const schools = await svc.entities.School.filter({
        id: session.school_id,
        admin_code: session.admin_code,
        is_active: true,
      });
      if (!schools || schools.length === 0) {
        return Response.json({ error: "Invalid session" }, { status: 401 });
      }
      schoolId = session.school_id;
    } else {
      // مصادقة Base44 (المالك أو مشرف مدرسة قديم)
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      if (user.role !== "school_admin" && user.role !== "admin") {
        return Response.json({ error: "Forbidden — school admin only" }, { status: 403 });
      }
      if (user.role === "school_admin") {
        schoolId = user.data?.school_id || user.school_id;
        if (!schoolId) return Response.json({ error: "No school assigned" }, { status: 403 });
      } else {
        schoolId = data.school_id;
        if (!schoolId) return Response.json({ error: "school_id required" }, { status: 400 });
      }
    }

    // جلب المدرسة لقراءة teacher_limit
    const school = await svc.entities.School.get(schoolId).catch(() => null);
    if (!school) return Response.json({ error: "School not found" }, { status: 404 });

    switch (action) {
      case "list": {
        const teachers = await svc.entities.Teacher.filter({ school_id: schoolId }, "-created_date", 500);
        return Response.json({ teachers: teachers || [], teacher_limit: school.teacher_limit || 0 });
      }

      case "create": {
        // فحص حد الأساتذة
        const existing = await svc.entities.Teacher.filter({ school_id: schoolId }, "-created_date", 500);
        const limit = school.teacher_limit || 0;
        if (limit > 0 && (existing || []).length >= limit) {
          return Response.json({
            error: "لقد وصلت إلى الحد الأقصى لعدد الأساتذة المسموح به لهذه المدرسة.",
          }, { status: 403 });
        }

        // توليد Teacher Code فريد داخل المدرسة
        let teacherCode = data.teacher_code?.trim();
        if (!teacherCode) {
          teacherCode = await generateUniqueTeacherCode(svc, schoolId);
        } else {
          // التحقق من فرادة الرمز داخل المدرسة
          const dup = await svc.entities.Teacher.filter({ school_id: schoolId, teacher_code: teacherCode });
          if (dup && dup.length > 0) {
            return Response.json({ error: "Teacher Code مستخدم مسبقاً في هذه المدرسة" }, { status: 400 });
          }
        }

        const teacher = await svc.entities.Teacher.create({
          full_name: data.full_name?.trim(),
          teacher_code: teacherCode,
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          subject: data.subject?.trim() || null,
          school_id: schoolId,
          school_code: school.code,
          status: "active",
          preferred_language: data.preferred_language || "ar",
        });
        return Response.json(teacher);
      }

      case "update": {
        if (!id) return Response.json({ error: "id required" }, { status: 400 });
        const existing = await svc.entities.Teacher.get(id);
        if (!existing || existing.school_id !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const allowed = ["full_name", "email", "phone", "subject", "preferred_language", "status"];
        const updateData = {};
        for (const f of allowed) {
          if (f in data) updateData[f] = data[f];
        }
        const updated = await svc.entities.Teacher.update(id, updateData);
        return Response.json(updated);
      }

      case "toggleStatus": {
        if (!id) return Response.json({ error: "id required" }, { status: 400 });
        const existing = await svc.entities.Teacher.get(id);
        if (!existing || existing.school_id !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const newStatus = existing.status === "active" ? "disabled" : "active";
        const updated = await svc.entities.Teacher.update(id, { status: newStatus });
        return Response.json(updated);
      }

      case "delete": {
        if (!id) return Response.json({ error: "id required" }, { status: 400 });
        const existing = await svc.entities.Teacher.get(id);
        if (!existing || existing.school_id !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        await svc.entities.Teacher.delete(id);
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

async function generateUniqueTeacherCode(svc, schoolId) {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(1000 + Math.random() * 90000);
    const code = `TCH-${String(num).padStart(5, "0")}`;
    const dup = await svc.entities.Teacher.filter({ school_id: schoolId, teacher_code: code });
    if (!dup || dup.length === 0) return code;
  }
  return `TCH-${Date.now().toString().slice(-5)}`;
}