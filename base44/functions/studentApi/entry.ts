import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadSession, schoolUsable, deleteWhere, deleteSessions, pick, project } from "../../shared/session.ts";

/**
 * studentApi — طبقة وصول آمنة لبيانات الطالب مع عزل كامل (school_id + student_id)
 *
 * الهوية: تُستخرج من جلسة الخادم (AuthSession) عبر token — لا يُوثق بأي student_id/school_id قادم من العميل.
 * العزل: يُفرض برمجياً (asServiceRole + حقن الفلاتر).
 *
 * حماية إضافية:
 *  - قائمة بيضاء للحقول: عند الإنشاء/التحديث تُقبل حقول محددة فقط لكل كيان (لا Mass Assignment).
 *  - قائمة بيضاء للقراءة: كيان School لا يُرجَع منه إلا (id, name, code) — لا admin_code ولا أي بيانات حساسة.
 *  - طلب دخول الامتحان يُنشأ دائماً بحالة pending؛ الموافقة من الأستاذ/المشرف فقط.
 *  - تصحيح الامتحان ومدّته على الخادم: startExam يسجّل وقت البدء، وsubmitExam يرفض/يصفّر المتأخر.
 *  - حذف الطالب لنفسه يحذف كل بياناته المرتبطة (التقدم، النتائج، الطلبات، الجلسات).
 */

const EXAM_GRACE_SECONDS = 180;
const PUBLIC_SETTING_KEYS = ["contact_email"];

const ENTITY_CONFIG: Record<string, any> = {
  LabHistory: {
    ownerField: "student_id",
    schoolField: "school_id",
    writable: ["scenario_id", "scenario_title", "scenario_difficulty", "status", "tasks_total", "tasks_completed", "score", "xp_earned", "started_at", "last_activity_at", "completed_at"],
    numeric: { score: [0, 100], xp_earned: [0, 100000], tasks_completed: [0, 5000], tasks_total: [0, 5000] },
  },
  ScenarioTaskStatus: {
    ownerField: "student_id",
    schoolField: "school_id",
    writable: ["lab_history_id", "scenario_id", "task_index", "task_label", "status", "completed_at"],
    numeric: { task_index: [0, 5000] },
  },
  ExamResult: { ownerField: "student_id", schoolField: "school_id", readOnly: true },
  ExamAccessRequest: { ownerField: "student_id", schoolField: "school_id", createOnly: true, writable: ["student_name", "student_email", "exam_id", "exam_title"] },
  StudentProgress: {
    ownerField: "student_id",
    schoolField: null,
    writable: ["student_email", "student_name", "topic_progress", "quiz_results", "total_topics_visited", "total_quizzes_completed", "avg_quiz_score", "last_synced_at"],
    numeric: { total_topics_visited: [0, 100000], total_quizzes_completed: [0, 100000], avg_quiz_score: [0, 100] },
  },
  Exam: { ownerField: null, schoolField: "school_id", readOnly: true, schoolOrGeneral: true },
  StudentProfile: {
    ownerField: "id",
    schoolField: "school_id",
    noCreate: true,
    updatableFields: ["preferred_language"],
    // الطالب يرى ملفه فقط (بدون user_id وبيانات داخلية)
    readFields: ["id", "student_code", "full_name", "email", "school_id", "status", "preferred_language", "phone", "country", "created_date"],
  },
  School: { ownerField: null, schoolField: "id", readOnly: true, readFields: ["id", "name", "code"] },
  SystemSetting: { ownerField: null, schoolField: null, readOnly: true, readFields: ["key", "value"], publicKeys: PUBLIC_SETTING_KEYS },
};

const norm = (s: any) => (s || "").toString().trim().replace(/\s+/g, " ").toLowerCase();

/**
 * صح/خطأ: الإجابة المخزَّنة بلغة المعلّم (صح/True/נכון…) وأزرار الطالب بلغته.
 * لذلك نقارن بالمعنى (true/false) لا بالنص.
 */
const TRUE_WORDS = new Set(["صح", "صحيح", "نعم", "true", "t", "yes", "נכון", "אמת"]);
const FALSE_WORDS = new Set(["خطأ", "خطا", "غلط", "لا", "false", "f", "no", "לא נכון", "שקר"]);
function tfToken(v: any): "true" | "false" | null {
  const n = norm(v);
  if (TRUE_WORDS.has(n)) return "true";
  if (FALSE_WORDS.has(n)) return "false";
  return null;
}

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

/** يتحقق من الجلسة ويعيد الهوية الموثوقة (من الخادم) أو null */
async function validateSession(svc: any, session: any) {
  const rec = await loadSession(svc, session, "student");
  if (!rec) return null;
  try {
    const profile = await svc.entities.StudentProfile.get(rec.subject_id);
    if (!profile || profile.status !== "approved" || profile.school_id !== rec.school_id) return null;
    const school = await svc.entities.School.get(rec.school_id).catch(() => null);
    if (!schoolUsable(school)) return null;
    return { profile, sid: rec.subject_id as string, schoolId: rec.school_id as string };
  } catch {
    return null;
  }
}

/** حذف كل بيانات الطالب ثم ملفه وجلساته (حذف حقيقي للحساب) */
async function deleteStudentAccount(svc: any, sid: string) {
  for (const entity of ["LabHistory", "ScenarioTaskStatus", "StudentProgress", "ExamResult", "ExamAccessRequest"]) {
    await deleteWhere(svc, entity, { student_id: sid });
  }
  await svc.entities.StudentProfile.delete(sid);
  await deleteSessions(svc, sid);
}

/** الامتحان المنشور المتاح لهذا الطالب (مدرسته أو عام) */
async function loadExamForStudent(svc: any, examId: string, schoolId: string) {
  const exam = await svc.entities.Exam.get(examId).catch(() => null);
  if (!exam || exam.status !== "published") return { error: Response.json({ error: "Exam not available" }, { status: 404 }) };
  const scoped = !exam.school_id || exam.school_id === "general" || exam.school_id === schoolId;
  if (!scoped) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  return { exam };
}

/** إذن الدخول الفعّال: أحدث موافقة، وهل استُهلكت بتسليم أحدث منها؟ */
async function findActiveAccess(svc: any, sid: string, examId: string) {
  const reqs = await svc.entities.ExamAccessRequest.filter({ student_id: sid, exam_id: examId });
  const approved = (reqs || [])
    .filter((r: any) => r.status === "approved")
    .sort((a: any, b: any) =>
      new Date(b.reviewed_at || b.created_date).getTime() - new Date(a.reviewed_at || a.created_date).getTime()
    )[0];
  if (!approved) return { approved: null, consumed: false };
  const results = await svc.entities.ExamResult.filter({ student_id: sid, exam_id: examId }, "-submission_time", 100);
  const latest = (results || [])
    .sort((a: any, b: any) => new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime())[0];
  const consumed = !!latest &&
    new Date(approved.reviewed_at || approved.created_date).getTime() <= new Date(latest.submission_time).getTime();
  return { approved, consumed };
}

const examDurationSeconds = (exam: any) => (Number(exam?.duration_minutes) > 0 ? Number(exam.duration_minutes) : 30) * 60;

/** يسجّل وقت بدء الامتحان على الخادم (مرة واحدة لكل إذن) ويعيد الزمن المتبقي */
async function startExam(svc: any, ctx: any) {
  const { sid, schoolId, data } = ctx;
  const examId = data?.exam_id;
  if (!examId) return Response.json({ error: "exam_id required" }, { status: 400 });
  const { exam, error } = await loadExamForStudent(svc, examId, schoolId);
  if (error) return error;

  let { approved, consumed } = await findActiveAccess(svc, sid, examId);
  if (!approved) return Response.json({ error: "No approved access" }, { status: 403 });
  if (consumed) return Response.json({ error: "Access already used" }, { status: 403 });

  if (!approved.started_at) {
    const startedAt = new Date().toISOString();
    await svc.entities.ExamAccessRequest.update(approved.id, { started_at: startedAt });
    approved = { ...approved, started_at: startedAt };
  }
  const total = examDurationSeconds(exam);
  const elapsed = (Date.now() - new Date(approved.started_at).getTime()) / 1000;
  return Response.json({
    started_at: approved.started_at,
    duration_seconds: total,
    remaining_seconds: Math.max(0, Math.floor(total - elapsed)),
  });
}

/** تصحيح الامتحان على الخادم وإنشاء النتيجة — يمنع تزوير الدرجات والوقت من المتصفح */
async function submitExam(svc: any, ctx: any) {
  const { profile, sid, schoolId, data } = ctx;
  const examId = data?.exam_id;
  if (!examId) return Response.json({ error: "exam_id required" }, { status: 400 });

  const { exam, error } = await loadExamForStudent(svc, examId, schoolId);
  if (error) return error;

  const { approved, consumed } = await findActiveAccess(svc, sid, examId);
  if (!approved) return Response.json({ error: "No approved access" }, { status: 403 });
  if (consumed) return Response.json({ error: "Access already used" }, { status: 403 });

  // يجب أن يكون الامتحان قد بدأ عبر startExam (يفرض المدة من الخادم)
  const startedMs = approved.started_at ? new Date(approved.started_at).getTime() : NaN;
  if (!Number.isFinite(startedMs)) return Response.json({ error: "Exam not started" }, { status: 403 });

  const elapsedSec = (Date.now() - startedMs) / 1000;
  const late = elapsedSec > examDurationSeconds(exam) + EXAM_GRACE_SECONDS;

  const questions = exam.questions || [];
  // التسليم المتأخر بعد فترة السماح تُصفَّر إجاباته (يُستهلك الإذن ولا يمكن الاستفادة من الوقت الإضافي)
  const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v);
  const answers = late || !isObj(data?.answers) ? {} : data.answers;   // نصوص (إجابات قصيرة)
  const choices = late || !isObj(data?.choices) ? {} : data.choices;   // اختيارات: رقم الخيار (MCQ) أو "true"/"false"
  let correct = 0;
  const review: Record<string, any> = {};
  questions.forEach((q: any, i: number) => {
    const entry: Record<string, any> = { question: q.text, type: q.type, model_answer: q.answer };
    let isCorrect = false;
    let givenText = "";

    if (q.type === "mcq") {
      // التصحيح بفهرس الخيار: صحيح حتى لو ترجم الطالب الامتحان لغة أخرى (ترتيب الخيارات ثابت)
      const opts: string[] = Array.isArray(q.options) ? q.options : [];
      const idx = Number(choices[i] ?? choices[String(i)]);
      if (Number.isInteger(idx) && idx >= 0 && idx < opts.length) {
        givenText = String(opts[idx]);
        entry.given_index = idx;
      } else {
        givenText = String(answers[i] ?? answers[String(i)] ?? "").slice(0, 2000); // توافق مع الإصدار القديم
      }
      isCorrect = !!givenText && givenText === q.answer;
      const mi = opts.findIndex((o) => o === q.answer);
      if (mi >= 0) entry.model_index = mi;
    } else if (q.type === "truefalse") {
      const raw = choices[i] ?? choices[String(i)] ?? answers[i] ?? answers[String(i)];
      const picked = raw === "true" || raw === "false" ? raw : tfToken(raw);
      const key = tfToken(q.answer);
      givenText = picked ? String(raw) : "";
      isCorrect = !!picked && !!key && picked === key;
      if (picked) entry.given_token = picked;
      if (key) entry.model_token = key;
    } else {
      givenText = String(answers[i] ?? answers[String(i)] ?? "").slice(0, 2000);
      isCorrect = !!norm(givenText) && norm(givenText) === norm(q.answer);
    }

    if (isCorrect) correct++;
    entry.given = givenText || "—";
    entry.is_correct = isCorrect;
    review[String(i)] = entry;
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
    start_time: approved.started_at,
    end_time: now,
    submission_time: now,
    status: "submitted",
  });

  return Response.json({ result: { pct, correct, total, review, late }, record: row });
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
    const { profile, sid, schoolId } = ident;

    // حقن عزل البيانات في الاستعلامات
    const injectQuery = (q: any) => {
      const out = { ...(q || {}) };
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
          const q = { ...(query || {}), status: "published" };
          const rows = await svc.entities.Exam.filter(q, sort, limit);
          const visible = (rows || []).filter(
            (e: any) => !e.school_id || e.school_id === "general" || e.school_id === schoolId
          );
          return Response.json(visible.map(stripExamAnswers));
        }
        if (entity === "SystemSetting") {
          if (!config.publicKeys.includes(query?.key)) return Response.json([]);
        }
        const q = injectQuery(query);
        const rows = await svc.entities[entity].filter(q, sort, limit);
        return Response.json((rows || []).map((r: any) => project(r, config.readFields)));
      }

      case "get": {
        if (entity === "Exam") {
          // لا يُسمح بقراءة الامتحانات غير المنشورة أو امتحانات مدرسة أخرى
          const { exam, error } = await loadExamForStudent(svc, id, schoolId);
          if (error) return Response.json({ error: "Not found" }, { status: 404 });
          return Response.json(stripExamAnswers(exam));
        }
        const row = await svc.entities[entity].get(id).catch(() => null);
        if (entity === "SystemSetting") {
          if (!row || !config.publicKeys.includes(row.key)) return Response.json({ error: "Forbidden" }, { status: 403 });
          return Response.json(project(row, config.readFields));
        }
        if (!verifyOwnership(row)) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        return Response.json(project(row, config.readFields));
      }

      case "create": {
        if (config.readOnly || config.noCreate) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        let d = pick(data, config.writable || []);

        if (entity === "ExamAccessRequest") {
          // الطالب يطلب فقط — الموافقة من الأستاذ/المشرف. الحالة تُفرض هنا مهما أرسل العميل.
          if (!d.exam_id) return Response.json({ error: "exam_id required" }, { status: 400 });
          const { exam, error } = await loadExamForStudent(svc, d.exam_id, schoolId);
          if (error) return error;
          const mine = (await svc.entities.ExamAccessRequest.filter({ student_id: sid, exam_id: d.exam_id })) || [];
          const open = mine.find((r: any) => r.status === "pending");
          if (open) return Response.json(open); // لا تكرار للطلبات المعلّقة
          d = { ...d, exam_title: exam.title, status: "pending" };
        }

        d = clampNumerics(injectData(d), config);
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
          const existing = await svc.entities[entity].get(id).catch(() => null);
          if (!verifyOwnership(existing)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        const allowed = config.updatableFields || config.writable || [];
        const updateData = clampNumerics(pick(data, allowed), config);
        const row = await svc.entities[entity].update(id, updateData);
        return Response.json(project(row, config.readFields));
      }

      case "delete": {
        if (config.readOnly || config.createOnly) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        // الطالب يحذف حسابه فقط — وكل بياناته معه
        if (entity === "StudentProfile") {
          if (id !== sid) return Response.json({ error: "Forbidden" }, { status: 403 });
          await deleteStudentAccount(svc, sid);
          return Response.json({ ok: true });
        }
        if (config.ownerField === "id") {
          if (id !== sid) return Response.json({ error: "Forbidden" }, { status: 403 });
        } else if (config.ownerField) {
          const existing = await svc.entities[entity].get(id).catch(() => null);
          if (!verifyOwnership(existing)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        await svc.entities[entity].delete(id);
        return Response.json({ ok: true });
      }

      case "startExam": {
        return await startExam(svc, { sid, schoolId, data });
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
