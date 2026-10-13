import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadSession, schoolUsable, deleteSessions, pick } from "../../shared/session.ts";

/**
 * teacherApi — طبقة وصول آمنة لبيانات الأستاذ مع عزل كامل (school_id)
 * الهوية تُستخرج من جلسة الخادم (token) — لا يُوثق بأي معرّف قادم من العميل.
 * يدعم: إدارة الامتحانات (CRUD)، عرض الطلاب والنتائج، وحذف الأستاذ لحسابه.
 *
 * حماية: قائمة بيضاء للحقول عند الكتابة (لا يمكن تغيير school_id أو أي حقل نظام).
 */

const EXAM_FIELDS = ["title", "topic_id", "topic_title", "section_title", "questions", "duration_minutes", "status"];

const ENTITY_CONFIG: Record<string, any> = {
  Exam: { schoolField: "school_id", writable: true, fields: EXAM_FIELDS },
  ExamResult: { schoolField: "school_id", readOnly: true },
  StudentProfile: { schoolField: "school_id", readOnly: true },
  // الأستاذ يقرأ سجله ويستطيع حذف نفسه فقط (حذف الحساب)
  Teacher: { ownerField: "id", schoolField: "school_id", readOnly: true, selfDeletable: true },
};

async function validateSession(svc: any, session: any) {
  const rec = await loadSession(svc, session, "teacher");
  if (!rec) return null;
  try {
    const teacher = await svc.entities.Teacher.get(rec.subject_id);
    if (!teacher || teacher.status !== "active" || teacher.school_id !== rec.school_id) return null;
    const school = await svc.entities.School.get(rec.school_id).catch(() => null);
    if (!schoolUsable(school)) return null;
    return { teacher, teacherId: rec.subject_id as string, schoolId: rec.school_id as string };
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

    const ident = await validateSession(svc, session);
    if (!ident) return Response.json({ error: "Invalid session" }, { status: 401 });
    const { teacherId, schoolId } = ident;

    const injectSchool = (q) => ({ ...(q || {}), [config.schoolField]: schoolId });

    switch (action) {
      case "filter": {
        const q = injectSchool(query);
        // الأستاذ يرى سجله فقط من كيان Teacher
        if (entity === "Teacher") q.id = teacherId;
        const rows = await svc.entities[entity].filter(q, sort, limit);
        return Response.json(rows || []);
      }

      case "get": {
        const row = await svc.entities[entity].get(id).catch(() => null);
        if (!row || row[config.schoolField] !== schoolId || (entity === "Teacher" && row.id !== teacherId)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        return Response.json(row);
      }

      case "create": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const d = { ...pick(data, config.fields), [config.schoolField]: schoolId };
        const row = await svc.entities[entity].create(d);
        return Response.json(row);
      }

      case "update": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id).catch(() => null);
        if (!existing || existing[config.schoolField] !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const row = await svc.entities[entity].update(id, pick(data, config.fields));
        return Response.json(row);
      }

      case "delete": {
        // حذف الأستاذ لحسابه: مسموح له وحده
        if (config.selfDeletable) {
          if (id !== teacherId) return Response.json({ error: "Forbidden" }, { status: 403 });
          await svc.entities.Teacher.delete(teacherId);
          await deleteSessions(svc, teacherId);
          return Response.json({ ok: true });
        }
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id).catch(() => null);
        if (!existing || existing[config.schoolField] !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        await svc.entities[entity].delete(id);
        return Response.json({ ok: true });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
