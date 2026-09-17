import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * schoolAdminApi — طبقة وصول آمنة لبيانات مشرف المدرسة مع عزل كامل (school_id)
 * تتحقق من جلسة المشرف في كل استدعاء، وتفرض عزل البيانات برمجياً.
 * يدعم: إدارة الطلاب (StudentProfile CRUD)، الامتحانات (Exam CRUD)،
 *       النتائج (ExamResult read)، طلبات الدخول (ExamAccessRequest read+update)،
 *       معلومات المدرسة (School get)، الأساتذة (Teacher read)، سجل المختبر (LabHistory read).
 */

const ENTITY_CONFIG: Record<string, any> = {
  School: { mode: "own_school_only" },
  Exam: { schoolField: "school_id", writable: true, includeGeneral: true },
  ExamResult: { schoolField: "school_id", readOnly: true },
  ExamAccessRequest: { schoolField: "school_id", readOnly: true, updatable: true },
  StudentProfile: { schoolField: "school_id", writable: true },
  Teacher: { schoolField: "school_id", readOnly: true },
  LabHistory: { schoolField: "school_id", readOnly: true },
  ScenarioTaskStatus: { schoolField: "school_id", readOnly: true },
};

async function validateSession(svc: any, session: any) {
  if (!session?.school_id || !session?.school_code || !session?.admin_code) return null;
  try {
    const schools = await svc.entities.School.filter({
      id: session.school_id,
      code: session.school_code,
      admin_code: session.admin_code,
      is_active: true,
    });
    return schools?.[0] || null;
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

    const schoolId = session.school_id;

    // بناء استعلام مع عزل المدرسة
    const injectSchool = (q: any) => ({ ...q, [config.schoolField]: schoolId });

    // للامتحانات: تضمين الامتحانات العامة أيضاً
    const injectSchoolOrGeneral = (q: any) => ({
      ...q,
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
        const row = await svc.entities[entity].get(id);
        if (!row) return Response.json({ error: "Not found" }, { status: 404 });
        if (config.schoolField && row[config.schoolField] !== schoolId && row[config.schoolField] !== "general") {
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
        if (!config.writable && !config.updatable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id);
        if (!existing || (config.schoolField && existing[config.schoolField] !== schoolId)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const row = await svc.entities[entity].update(id, data);
        return Response.json(row);
      }

      case "delete": {
        if (!config.writable) return Response.json({ error: "Read-only entity" }, { status: 403 });
        const existing = await svc.entities[entity].get(id);
        if (!existing || (config.schoolField && existing[config.schoolField] !== schoolId)) {
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