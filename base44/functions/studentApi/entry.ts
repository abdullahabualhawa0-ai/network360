import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * studentApi — طبقة وصول آمنة لبيانات الطالب مع عزل كامل (school_id + student_id)
 * تتحقق من الجلسة في كل استدعاء، وتفرض عزل البيانات برمجياً (asServiceRole + حقن الفلاتر).
 * لا تستخدم Base44 Authentication — الجلسة هي الشهادة الوحيدة.
 *
 * حماية إضافية:
 *  - لا تُعاد مفاتيح الإجابات (answer) للطالب في أي استجابة لامتحان.
 *  - تصحيح الامتحان يتم على الخادم فقط عبر إجراء submitExam (لا تُقبل الدرجات من العميل).
 *  - نتائج الامتحانات للقراءة فقط من جهة الطالب.
 */

const ENTITY_CONFIG: Record<string, any> = {
  LabHistory: {
    ownerField: "student_id",
    schoolField: "school_id",
    numeric: { score: [0, 100], xp_earned: [0, 100000], tasks_completed: [0, 5000], tasks_total: [0, 5000] },
  },
  ScenarioTaskStatus: {
    ownerField: "student_id",
    schoolField: "school_id",
    numeric: { task_index: [0, 5000] },
  },
  ExamResult: { ownerField: "student_id", schoolField: "school_id", readOnly: true },
  ExamAccessRequest: { ownerField: "student_id", schoolField: "school_id", createOnly: true },
  StudentProgress: {
    ownerField: "student_id",
    schoolField: null,
    numeric: { total_topics_visited: [0, 100000], total_quizzes_completed: [0, 100000], avg_quiz_score: [0, 100] },
  },
  Exam: { ownerField: null, schoolField: "school_id", readOnly: true, schoolOrGeneral: true },
  StudentProfile: {
    ownerField: "id",
    schoolField: "school_id",
    updatableFields: ["preferred_language"],
  },
  School: { ownerField: null, schoolField: "id", readOnly: true },
  SystemSetting: { ownerField: null, schoolField: null, readOnly: true },
};

const norm = (s: any) => (s || "").toString().trim().replace(/\s+/g, " ").toLowerCase();

/** إزالة مفتاح الإجابة الصحيحة من أسئلة الامتحان قبل إعادتها للطالب */
function stripExamAnswers(exam: any) {
  if (!exam || !Array.isArray(exam.questions)) return exam;
  return {
    ...exam,
    questions: exam.questions.map((q: any) => {
      const { answer, ...rest } = q || {};
      return rest;
    }),
  };
}

/** حصر الحقول الرقمية ضمن نطاقات منطقية لمنع تزوير القيم المتطرفة */
function clampNumerics(data: any, config: any) {
  if (!config.numeric) return data;
  const out = { ...data };
  for (const field of Object.keys(config.numeric)) {
    if (out[field] === undefined || out[field] === null || out[field] === "") continue;
    const range = config.numeric[field];
    const n = Number(out[field]);
    out[field] = Number.isFinite(n) ? Math.min(Math.max(n, range[0]), range[1]) : range[0];
  }
  return out;
}

async function validateSession(svc: any, session: any) {
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

/** تصحيح الامتحان على الخادم وإنشاء النتيجة — يمنع تزوير الدرجات من المتصفح */
async function submitExam(svc: any, ctx: any) {
  const { profile, sid, schoolId, data } = ctx;
  const examId = data?.exam_id;
  if (!examId) return Response.json({ error: "exam_id required" }, { status: 400 });

  const exam = await svc.entities.Exam.get(examId).catch(() => null);
  if (!exam || exam.status !== "published") {
    return Response.json({ error: "Exam not available" }, { status: 404 });
  }
  const scoped = !exam.school_id || exam.school_id === "general" || exam.school_id === schoolId;
  if (!scoped) return Response.json({ error: "Forbidden" }, { status: 403 });

  // التحقق من وجود إذن دخول معتمد غير مستهلك
  const reqs = await svc.entities.ExamAccessRequest.filter({ student_id: sid, exam_id: examId });
  const approved = (reqs || [])
    .filter((r: any) => r.status === "approved")
    .sort((a: any, b: any) =>
      new Date(b.reviewed_at || b.created_date).getTime() - new Date(a.reviewed_at || a.created_date).getTime()
    )[0];
  if (!approved) return Response.json({ error: "No approved access" }, { status: 403 });

  const results = await svc.entities.ExamResult.filter({ student_id: sid, exam_id: examId }, "-submission_time", 100);
  const latest = (results || [])
    .sort((a: any, b: any) => new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime())[0];
  if (latest && new Date(approved.reviewed_at || approved.created_date).getTime() <= new Date(latest.submission_time).getTime()) {
    return Response.json({ error: "Access already used" }, { status: 403 });
  }

  const questions = exam.questions || [];
  const given = data?.answers || {};
  let correct = 0;
  const review: Record<string, any> = {};
  questions.forEach((q: any, i: number) => {
    const value = given[i] ?? given[String(i)] ?? "";
    const isCorrect = q.type === "short"
      ? !!norm(value) && norm(value) === norm(q.answer)
      : !!value && value === q.answer;
    if (isCorrect) correct++;
    review[String(i)] = {
      question: q.text,
      type: q.type,
      given: value || "—",
      model_answer: q.answer,
      is_correct: isCorrect,
    };
  });
  const total = questions.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const now = new Date().toISOString();

  const row = await svc.entities.ExamResult.create({
    student_id: sid,
    school_id: schoolId,
    student_name: profile.full_name || profile.student_code,
    student_email: profile.student_code,
    exam_id: exam.id,
    exam_title: exam.title,
    score: pct,
    percentage: pct,
    total_questions: total,
    correct_answers: correct,
    wrong_answers: total - correct,
    answers: review,
    start_time: data?.start_time || now,
    submission_time: now,
    status: "submitted",
  });

  return Response.json({ result: { pct, correct, total, review }, record: row });
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
    const injectQuery = (q: any) => {
      const out = { ...q };
      if (config.ownerField) out[config.ownerField] = sid;
      if (config.schoolField && !config.schoolOrGeneral) out[config.schoolField] = schoolId;
      return out;
    };

    // حقن عزل البيانات في الإنشاء
    const injectData = (d: any) => {
      const out = { ...d };
      if (config.ownerField) out[config.ownerField] = sid;
      if (config.schoolField && !config.schoolOrGeneral) out[config.schoolField] = schoolId;
      return out;
    };

    // التحقق من ملكية سجل
    const verifyOwnership = (row: any) => {
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
            (e: any) => !e.school_id || e.school_id === "general" || e.school_id === schoolId
          );
          return Response.json(visible.map(stripExamAnswers));
        }
        const q = injectQuery(query);
        const rows = await svc.entities[entity].filter(q, sort, limit);
        return Response.json(rows || []);
      }

      case "get": {
        if (entity === "Exam") {
          // لا يُسمح بقراءة الامتحانات غير المنشورة أو امتحانات مدرسة أخرى
          const exam = await svc.entities.Exam.get(id).catch(() => null);
          if (!exam || exam.status !== "published") {
            return Response.json({ error: "Not found" }, { status: 404 });
          }
          const scoped = !exam.school_id || exam.school_id === "general" || exam.school_id === schoolId;
          if (!scoped) return Response.json({ error: "Forbidden" }, { status: 403 });
          return Response.json(stripExamAnswers(exam));
        }
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
        const d = clampNumerics(injectData(data), config);
        const row = await svc.entities[entity].create(d);
        return Response.json(row);
      }

      case "update": {
        if (config.readOnly || config.createOnly) {
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
        updateData = clampNumerics(updateData, config);
        const row = await svc.entities[entity].update(id, updateData);
        return Response.json(row);
      }

      case "delete": {
        if (config.readOnly || config.createOnly) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        // التحقق من الملكية قبل الحذف — الطالب يحذف ملفه فقط
        if (config.ownerField === "id") {
          if (id !== sid) return Response.json({ error: "Forbidden" }, { status: 403 });
        } else if (config.ownerField) {
          const existing = await svc.entities[entity].get(id);
          if (!verifyOwnership(existing)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        await svc.entities[entity].delete(id);
        return Response.json({ ok: true });
      }

      case "submitExam": {
        return await submitExam(svc, { profile, sid, schoolId, data });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Server error" }, { status: 500 });
  }
}