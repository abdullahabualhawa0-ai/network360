import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * studentApi — طبقة وصول آمنة لبيانات الطالب مع عزل كامل (school_id + student_id)
 * تتحقق من الجلسة في كل استدعاء، وتفرض عزل البيانات برمجياً (asServiceRole + حقن الفلاتر).
 * لا تستخدم Base44 Authentication — الجلسة هي الشهادة الوحيدة.
 */

const ENTITY_CONFIG = {
  LabHistory: { ownerField: "student_id", schoolField: "school_id" },
  ScenarioTaskStatus: { ownerField: "student_id", schoolField: "school_id" },
  ExamResult: { ownerField: "student_id", schoolField: "school_id" },
  ExamAccessRequest: { ownerField: "student_id", schoolField: "school_id" },
  StudentProgress: { ownerField: "student_id", schoolField: null },
  Exam: { ownerField: null, schoolField: "school_id", readOnly: true, schoolOrGeneral: true },
  StudentProfile: {
    ownerField: "id",
    schoolField: "school_id",
    updatableFields: ["preferred_language"],
  },
  School: { ownerField: null, schoolField: "id", readOnly: true },
  SystemSetting: { ownerField: null, schoolField: null, readOnly: true },
};

async function validateSession(svc, session) {
  if (!session?.student_id || !session?.school_id || !session?.student_code) return null;
  try {
    const profiles = await svc.entities.StudentProfile.filter({
      id: session.student_id,
      school_id: session.school_id,
      student_code: session.student_code,
      status: "approved",
    });
    return profiles?.[0] || null;
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

    const profile = await validateSession(svc, session);
    if (!profile) return Response.json({ error: "Invalid session" }, { status: 401 });

    const sid = session.student_id;
    const schoolId = session.school_id;

    // حقن عزل البيانات في الاستعلامات
    const injectQuery = (q) => {
      const out = { ...q };
      if (config.ownerField) out[config.ownerField] = sid;
      if (config.schoolField && !config.schoolOrGeneral) out[config.schoolField] = schoolId;
      return out;
    };

    // حقن عزل البيانات في الإنشاء
    const injectData = (d) => {
      const out = { ...d };
      if (config.ownerField) out[config.ownerField] = sid;
      if (config.schoolField && !config.schoolOrGeneral) out[config.schoolField] = schoolId;
      return out;
    };

    // التحقق من ملكية سجل
    const verifyOwnership = (row) => {
      if (!row) return false;
      if (config.ownerField === "id") return row.id === sid;
      if (config.ownerField && row[config.ownerField] !== sid) return false;
      if (config.schoolField === "id") return row.id === schoolId;
      if (config.schoolField && !config.schoolOrGeneral && row[config.schoolField] !== schoolId) return false;
      return true;
    };

    switch (action) {
      case "filter": {
        if (entity === "Exam") {
          const q = { ...query, status: "published" };
          const rows = await svc.entities.Exam.filter(q, sort, limit);
          const visible = (rows || []).filter(
            (e) => !e.school_id || e.school_id === "general" || e.school_id === schoolId
          );
          return Response.json(visible);
        }
        const q = injectQuery(query);
        const rows = await svc.entities[entity].filter(q, sort, limit);
        return Response.json(rows || []);
      }

      case "get": {
        const row = await svc.entities[entity].get(id);
        if (!verifyOwnership(row)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        return Response.json(row);
      }

      case "create": {
        if (config.readOnly) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        const d = injectData(data);
        const row = await svc.entities[entity].create(d);
        return Response.json(row);
      }

      case "update": {
        if (config.readOnly) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        // التحقق من الملكية قبل التحديث
        if (config.ownerField === "id") {
          if (id !== sid) return Response.json({ error: "Forbidden" }, { status: 403 });
        } else if (config.ownerField) {
          const existing = await svc.entities[entity].get(id);
          if (!verifyOwnership(existing)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        // تقييد الحقول القابلة للتحديث إن وُجدت قائمة
        let updateData = data;
        if (config.updatableFields) {
          updateData = {};
          for (const f of config.updatableFields) {
            if (f in data) updateData[f] = data[f];
          }
        }
        const row = await svc.entities[entity].update(id, updateData);
        return Response.json(row);
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}