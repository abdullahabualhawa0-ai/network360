import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadSession, schoolUsable, pick } from "../../shared/session.ts";

/**
 * schoolAdminApi — طبقة وصول آمنة لبيانات مشرف المدرسة مع عزل كامل (school_id)
 * الهوية تُستخرج من جلسة الخادم (token) — لا يُعتمد على admin_code المخزَّن في المتصفح.
 * يدعم: إدارة الطلاب (StudentProfile CRUD)، الامتحانات (Exam CRUD)،
 *       النتائج (ExamResult read)، طلبات الدخول (ExamAccessRequest read+update)،
 *       معلومات المدرسة (School get)، الأساتذة (Teacher read)، سجل المختبر (LabHistory read).
 *
 * حماية: قائمة بيضاء للحقول عند الكتابة (لا يمكن نقل سجل لمدرسة أخرى ولا تغيير حقول النظام).
 * حد الطلاب يُفرض في الخادم مع إعادة فحص بعد الإنشاء (حماية من التزامن).
 */

const ENTITY_CONFIG: Record<string, any> = {
  School: { mode: "own_school_only" },
  Exam: {
    schoolField: "school_id", writable: true, includeGeneral: true,
    fields: ["title", "topic_id", "topic_title", "section_title", "questions", "duration_minutes", "status"],
  },
  ExamResult: { schoolField: "school_id", updatable: true, fields: ["allow_retake", "retake_allowed_at", "retake_allowed_by"] },
  ExamAccessRequest: { schoolField: "school_id", readOnly: true, updatable: true, fields: ["status", "reviewed_by", "reviewed_at"] },
  StudentProfile: {
    schoolField: "school_id", writable: true,
    fields: ["full_name", "student_code", "email", "class_name", "status", "approved_by", "approved_at", "preferred_language", "phone", "country", "user_id"],
  },
  Teacher: {
    schoolField: "school_id", writable: true,
    fields: ["full_name", "teacher_code", "email", "phone", "subject", "school_id", "school_code", "status", "preferred_language"],
  },
  LabHistory: { schoolField: "school_id", readOnly: true },
  ScenarioTaskStatus: { schoolField: "school_id", readOnly: true },
};

const STUDENT_QUERY_LIMIT = 10000;

async function validateSession(svc: any, session: any) {
  const rec = await loadSession(svc, session, "school_admin");
  if (!rec) return null;
  try {
    const school = await svc.entities.School.get(rec.school_id);
    if (!schoolUsable(school)) return null;
    return school;
  } catch {
    return null;
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json();
    const { session, action, entity, query = {}, data = {}, id, sort, limit } = body;

    const config = ENTITY_CONFIG[entity];
    if (!config) return Response.json({ error: "Entity not allowed" }, { status: 403 });

    const school = await validateSession(svc, session);
    if (!school) return Response.json({ error: "Invalid session" }, { status: 401 });

    const schoolId = school.id;

    // بناء استعلام مع عزل المدرسة
    const injectSchool = (q: any) => ({ ...(q || {}), [config.schoolField]: schoolId });

    // للامتحانات: تضمين الامتحانات العامة أيضاً
    const injectSchoolOrGeneral = (q: any) => ({
      ...(q || {}),
      $or: [
        { [config.schoolField]: schoolId },
        { [config.schoolField]: "general" },
        { [config.schoolField]: { $exists: false } },
      ],
    });

    switch (action) {
      case "list": {
        if (entity === "School") {
          return Response.json(school);
        }
        if (config.includeGeneral) {
          const rows = await svc.entities[entity].filter(injectSchoolOrGeneral({}), sort, limit);
          return Response.json(rows || []);
        }
        const rows = await svc.entities[entity].filter(injectSchool({}), sort, limit);
        return Response.json(rows || []);
      }

      case "filter": {
        if (config.includeGeneral) {
          const rows = await svc.entities[entity].filter(injectSchoolOrGeneral(query), sort, limit);
          return Response.json(rows || []);
        }
        const rows = await svc.entities[entity].filter(injectSchool(query), sort, limit);
        return Response.json(rows || []);
      }

      case "get": {
        if (entity === "School") {
          return Response.json(school);
        }
        const row = await svc.entities[entity].get(id).catch(() => null);
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        if (config.schoolField && row[config.schoolField] !== schoolId && row[config.schoolField] !== "general") {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        return Response.json(row);
      }

      case "create": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const limitN = Number(school.student_limit) || 0;
        const countStudents = async () =>
          ((await svc.entities.StudentProfile.filter({ school_id: schoolId }, "-created_date", STUDENT_QUERY_LIMIT)) || []).length;

        // فرض حد الطلاب (student_limit) من الخادم — لا يُعتمد على فحص الواجهة
        if (entity === "StudentProfile" && limitN > 0 && (await countStudents()) >= limitN) {
          return Response.json({ error: "STUDENT_LIMIT_REACHED" }, { status: 403 });
        }

        // فحص تكرار رمز الطالب في المدرسة
        if (entity === "StudentProfile" && data?.student_code) {
          const sCode = String(data.student_code).trim().toLowerCase();
          const allSchoolStudents = await svc.entities.StudentProfile.filter({ school_id: schoolId }, "-created_date", STUDENT_QUERY_LIMIT);
          const isDup = (allSchoolStudents || []).some(
            (s: any) => String(s.student_code || "").trim().toLowerCase() === sCode
          );
          if (isDup) {
            return Response.json({ error: "DUPLICATE_CODE" }, { status: 400 });
          }
        }

        // فحص تكرار رمز الأستاذ في المدرسة
        if (entity === "Teacher" && data?.teacher_code) {
          const tCode = String(data.teacher_code).trim().toLowerCase();
          const allSchoolTeachers = await svc.entities.Teacher.filter({ school_id: schoolId }, "-created_date", 200);
          const isDup = (allSchoolTeachers || []).some(
            (t: any) => String(t.teacher_code || "").trim().toLowerCase() === tCode
          );
          if (isDup) {
            return Response.json({ error: "DUPLICATE_CODE" }, { status: 400 });
          }
        }

        const d = { ...pick(data, config.fields), [config.schoolField]: schoolId };
        const row = await svc.entities[entity].create(d);

        // إعادة فحص بعد الإنشاء: إذا تجاوزنا الحد بسبب طلبات متزامنة نتراجع
        if (entity === "StudentProfile" && limitN > 0 && (await countStudents()) > limitN) {
          await svc.entities.StudentProfile.delete(row.id).catch(() => {});
          return Response.json({ error: "STUDENT_LIMIT_REACHED" }, { status: 403 });
        }
        if (entity === "StudentProfile") {
          const newCount = await countStudents();
          await svc.entities.School.update(schoolId, { current_student_count: newCount }).catch(() => {});
        }
        return Response.json(row);
      }

      case "bulkCreate": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const items = Array.isArray(data?.items) ? data.items : [];
        if (items.length === 0) return Response.json([]);
        const limitN = Number(school.student_limit) || 0;
        const countStudents = async () =>
          ((await svc.entities.StudentProfile.filter({ school_id: schoolId }, "-created_date", STUDENT_QUERY_LIMIT)) || []).length;

        const currentCount = await countStudents();
        if (entity === "StudentProfile" && limitN > 0 && currentCount + items.length > limitN) {
          return Response.json({ error: "STUDENT_LIMIT_REACHED" }, { status: 403 });
        }
        const prepared = items.map((it: any) => ({
          ...pick(it, config.fields),
          [config.schoolField]: schoolId,
        }));
        const created = await svc.entities[entity].bulkCreate(prepared);
        if (entity === "StudentProfile") {
          const newCount = await countStudents();
          await svc.entities.School.update(schoolId, { current_student_count: newCount }).catch(() => {});
        }
        return Response.json(created || []);
      }

      case "update": {
        if (!config.writable && !config.updatable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id).catch(() => null);
        if (!existing || (config.schoolField && existing[config.schoolField] !== schoolId)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const row = await svc.entities[entity].update(id, pick(data, config.fields));
        return Response.json(row);
      }

      case "toggleRetake": {
        if (entity !== "ExamResult") return Response.json({ error: "Only ExamResult supports toggleRetake" }, { status: 400 });
        const resultId = id || data?.result_id;
        if (!resultId) return Response.json({ error: "result_id required" }, { status: 400 });
        const existing = await svc.entities.ExamResult.get(resultId).catch(() => null);
        if (!existing || existing.school_id !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const nextVal = !existing.allow_retake;
        const row = await svc.entities.ExamResult.update(resultId, {
          allow_retake: nextVal,
          retake_allowed_at: nextVal ? new Date().toISOString() : null,
          retake_allowed_by: nextVal ? (school.name || "School Admin") : null,
        });
        return Response.json(row);
      }

      case "delete": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id).catch(() => null);
        if (!existing || (config.schoolField && existing[config.schoolField] !== schoolId)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        await svc.entities[entity].delete(id);
        if (entity === "StudentProfile") {
          const countStudents = async () =>
            ((await svc.entities.StudentProfile.filter({ school_id: schoolId }, "-created_date", STUDENT_QUERY_LIMIT)) || []).length;
          const newCount = await countStudents();
          await svc.entities.School.update(schoolId, { current_student_count: newCount }).catch(() => {});
        }
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}