import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * teacherApi — طبقة وصول آمنة لبيانات الأستاذ مع عزل كامل (school_id)
 * تتحقق من جلسة الأستاذ في كل استدعاء، وتفرض عزل البيانات برمجياً.
 * يدعم: إدارة الامتحانات (CRUD)، عرض الطلاب، عرض النتائج.
 */

const ENTITY_CONFIG = {
  Exam: { schoolField: "school_id", writable: true },
  ExamResult: { schoolField: "school_id", readOnly: true },
  StudentProfile: { schoolField: "school_id", readOnly: true },
  Teacher: { ownerField: "id", schoolField: "school_id", readOnly: true, selfDeletable: true },
};

async function validateSession(svc, session) {
  if (!session?.teacher_id || !session?.school_id || !session?.teacher_code) return null;
  try {
    const teachers = await svc.entities.Teacher.filter({
      id: session.teacher_id,
      school_id: session.school_id,
      teacher_code: session.teacher_code,
      status: "active",
    });
    return teachers?.[0] || null;
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

    const teacher = await validateSession(svc, session);
    if (!teacher) return Response.json({ error: "Invalid session" }, { status: 401 });

    const schoolId = session.school_id;

    const injectSchool = (q) => ({ ...q, [config.schoolField]: schoolId });

    switch (action) {
      case "filter": {
        const q = injectSchool(query);
        const rows = await svc.entities[entity].filter(q, sort, limit);
        return Response.json(rows || []);
      }

      case "get": {
        const row = await svc.entities[entity].get(id);
        if (!row || (config.schoolField && row[config.schoolField] !== schoolId)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        return Response.json(row);
      }

      case "create": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const d = { ...data, [config.schoolField]: schoolId };
        const row = await svc.entities[entity].create(d);
        return Response.json(row);
      }

      case "update": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id);
        if (!existing || existing[config.schoolField] !== schoolId) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const row = await svc.entities[entity].update(id, data);
        return Response.json(row);
      }

      case "delete": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id);
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