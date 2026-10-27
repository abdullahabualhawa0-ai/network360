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

const LAB_MAX_TASKS = 200;
const LAB_MAX_XP = 500;
const LAB_PASS_SCORE = 80;
const MAX_MAP_KEYS = 2000;

const ENTITY_CONFIG: Record<string, any> = {
  // العدادات والدرجة والحالة وXP لا تُقبل من العميل — تُشتق من سجلات المهام أدناه
  LabHistory: {
    ownerField: "student_id",
    schoolField: "school_id",
    createFields: ["scenario_id", "scenario_title", "scenario_difficulty", "tasks_total", "scenario_xp", "started_at"],
    updatableFields: ["tasks_total"],
  },
  // الطالب يعلن إنجاز مهمة واحدة فقط؛ الحالة ووقت الإنجاز يفرضهما الخادم
  ScenarioTaskStatus: {
    ownerField: "student_id",
    schoolField: "school_id",
    createFields: ["lab_history_id", "task_index", "task_label"],
    updatableFields: ["task_label"],
  },
  ExamResult: { ownerField: "student_id", schoolField: "school_id", readOnly: true },
  ExamAccessRequest: { ownerField: "student_id", schoolField: "school_id", createOnly: true, writable: ["exam_id"] },
  // المؤشرات المجمّعة (عدد المواضيع/الاختبارات ومتوسط الدرجات) تُحسب على الخادم
  StudentProgress: {
    ownerField: "student_id",
    schoolField: null,
    writable: ["topic_progress", "quiz_results"],
  },
  Exam: { ownerField: null, schoolField: "school_id", readOnly: true, schoolOrGeneral: true },
  StudentProfile: {
    ownerField: "id",
    schoolField: "school_id",
    noCreate: true,
    updatableFields: ["preferred_language"],
    // الطالب يرى ملفه فقط (بدون user_id وبيانات داخلية)
    readFields: ["id", "student_code", "full_name", "email", "class_name", "school_id", "status", "preferred_language", "phone", "country", "created_date"],
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

const clampInt = (v: any, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.round(n), min), max);
};

/**
 * يتحقق أن المهمة تنتمي لمحاولة الطالب نفسه وأن فهرسها داخل نطاق المحاولة.
 * يمنع إنشاء مهام وهمية أو تجاوز عدد المهام المعلن.
 */
async function validateTaskTarget(svc: any, labId: any, sid: string, schoolId: string, taskIndex: any) {
  if (!labId) return null;
  const lab = await svc.entities.LabHistory.get(String(labId)).catch(() => null);
  if (!lab || lab.student_id !== sid || lab.school_id !== schoolId) return null;
  const total = clampInt(lab.tasks_total, 0, LAB_MAX_TASKS);
  const idx = Number(taskIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= total) return null;
  return { lab, scenario_id: lab.scenario_id, total };
}

/**
 * إعادة حساب عدادات المحاولة (المهام المنجزة، الدرجة، الحالة، XP) من سجلات المهام
 * الموثوقة في الخادم — لا تُقبل أي قيمة جاهزة من المتصفح.
 */
async function deriveLabCounters(svc: any, labId: string, sid: string) {
  const lab = await svc.entities.LabHistory.get(String(labId)).catch(() => null);
  if (!lab || lab.student_id !== sid) return null;

  const rows = (await svc.entities.ScenarioTaskStatus.filter(
    { lab_history_id: labId, student_id: sid }, "-created_date", 5000
  )) || [];
  const done = new Set<number>();
  for (const r of rows) {
    if (r?.status !== "completed") continue;
    const i = Number(r.task_index);
    if (Number.isInteger(i) && i >= 0) done.add(i);
  }

  const total = clampInt(lab.tasks_total, 0, LAB_MAX_TASKS);
  const completed = Math.min(done.size, total);
  const score = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  // نفس قاعدة السيناريو: النجاح عند بلوغ 80% من المهام
  const passed = total > 0 && completed > 0 && score >= LAB_PASS_SCORE;
  const xpHint = Math.max(Number(lab.scenario_xp) || 0, Number(lab.xp_earned) || 0);
  const now = new Date().toISOString();

  const patch: Record<string, any> = {
    tasks_completed: completed,
    score,
    xp_earned: passed ? Math.min(xpHint, LAB_MAX_XP) : 0,
    status: passed ? "completed" : completed > 0 ? "partially_completed" : "in_progress",
  };
  if (completed > 0) patch.last_activity_at = now;
  if (passed && !lab.completed_at) patch.completed_at = now;

  return await svc.entities.LabHistory.update(labId, patch).catch(() => null);
}

/** تنظيف خريطة المواضيع المقروءة (قيم منطقية فقط، بلا كائنات ضخمة) */
function sanitizeTopicProgress(raw: any) {
  const out: Record<string, any> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  let n = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (n++ >= MAX_MAP_KEYS) break;
    if (!v || typeof v !== "object") continue;
    out[String(k).slice(0, 120)] = {
      visited: (v as any).visited === true,
      visitedAt: typeof (v as any).visitedAt === "string" ? (v as any).visitedAt.slice(0, 40) : null,
    };
  }
  return out;
}

/** تنظيف نتائج الاختبارات: درجة كل اختبار محصورة 0-100 */
function sanitizeQuizResults(raw: any) {
  const out: Record<string, any> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  let n = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (n++ >= MAX_MAP_KEYS) break;
    const score = Number((v as any)?.score);
    out[String(k).slice(0, 120)] = {
      score: Number.isFinite(score) ? clampInt(score, 0, 100) : 0,
      completedAt: typeof (v as any)?.completedAt === "string" ? (v as any).completedAt.slice(0, 40) : null,
    };
  }
  return out;
}

/** يشتق مؤشرات التقدم المجمّعة من البيانات نفسها بدل قبولها من العميل */
function deriveProgress(d: any, current: any = {}) {
  const topicProgress = sanitizeTopicProgress(d?.topic_progress !== undefined ? d.topic_progress : current?.topic_progress);
  const quizResults = sanitizeQuizResults(d?.quiz_results !== undefined ? d.quiz_results : current?.quiz_results);
  const scores = Object.values(quizResults).map((v: any) => Number(v?.score) || 0);
  const avg = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
  return {
    topic_progress: topicProgress,
    quiz_results: quizResults,
    total_topics_visited: Object.values(topicProgress).filter((v: any) => v?.visited).length,
    total_quizzes_completed: scores.length,
    avg_quiz_score: Math.min(100, Math.max(0, avg)),
    last_synced_at: new Date().toISOString(),
  };
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

/** الامتحان المنشور المتاح لهذا الطالب (مدرسته أو عام) مع مطابقة الصف الصارمة */
async function loadExamForStudent(svc: any, examId: string, schoolId: string, studentClass?: string) {
  const exam = await svc.entities.Exam.get(examId).catch(() => null);
  if (!exam || exam.status !== "published") return { error: Response.json({ error: "Exam not available" }, { status: 404 }) };

  // عزل المدرسة:
  const isGeneralPlatform = exam.school_id === "general" && !exam.teacher_id;
  const isMySchool = exam.school_id === schoolId;
  if (!isGeneralPlatform && !isMySchool) {
    return { error: Response.json({ error: "Forbidden - Exam not for your school" }, { status: 403 }) };
  }

  // عزل الصف:
  let targets = Array.isArray(exam.target_classes)
    ? exam.target_classes.map((c: any) => String(c).trim()).filter(Boolean)
    : [];

  if (targets.length === 0 && exam.teacher_id) {
    const teacher = await svc.entities.Teacher.get(exam.teacher_id).catch(() => null);
    if (teacher && Array.isArray(teacher.assigned_classes) && teacher.assigned_classes.length > 0) {
      targets = teacher.assigned_classes.map((c: any) => String(c).trim()).filter(Boolean);
    }
  }

  if (targets.length > 0) {
    const sClass = (studentClass || "").trim();
    if (!sClass || !targets.includes(sClass)) {
      return { error: Response.json({ error: "Exam not available for your class" }, { status: 403 }) };
    }
  }
  return { exam };
}

/**
 * محاولة الامتحان الحالية — سجل داخلي يُنشأ تلقائياً عند البدء (لا يوجد طلب إذن من الطالب).
 * consumed = تم تسليم هذه المحاولة سابقاً.
 */
async function currentAttempt(svc: any, sid: string, examId: string) {
  const rows = await svc.entities.ExamAccessRequest.filter({ student_id: sid, exam_id: examId }, "-created_date", 50);
  const attempt = (rows || [])[0] || null;
  if (!attempt) return { attempt: null, consumed: false };
  const results = await svc.entities.ExamResult.filter({ student_id: sid, exam_id: examId }, "-submission_time", 100);
  const latest = (results || [])
    .sort((a: any, b: any) => new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime())[0];
  const consumed = !!latest &&
    new Date(attempt.reviewed_at || attempt.created_date).getTime() <= new Date(latest.submission_time).getTime();
  return { attempt, consumed };
}

const examDurationSeconds = (exam: any) => (Number(exam?.duration_minutes) > 0 ? Number(exam.duration_minutes) : 30) * 60;

/** يسجّل وقت بدء الامتحان على الخادم (مرة واحدة لكل إذن) ويعيد الزمن المتبقي */
async function startExam(svc: any, ctx: any) {
  const { profile, sid, schoolId, data } = ctx;
  const examId = data?.exam_id;
  if (!examId) return Response.json({ error: "exam_id required" }, { status: 400 });
  const { exam, error } = await loadExamForStudent(svc, examId, schoolId, profile?.class_name);
  if (error) return error;

  // فحص هل سلّم الطالب هذا الامتحان سابقاً وهل سَمح الأستاذ بإعادته:
  const pastResults = await svc.entities.ExamResult.filter({ student_id: sid, exam_id: examId }, "-submission_time", 100);
  const latestResult = (pastResults || []).sort(
    (a: any, b: any) => new Date(b.submission_time).getTime() - new Date(a.submission_time).getTime()
  )[0];

  if (latestResult && !latestResult.allow_retake) {
    return Response.json({
      error: "RETAKE_NOT_ALLOWED",
      message: "لا يمكنك إعادة الامتحان إلا بموافقة الأستاذ وتفعيل زر الإعادة",
    }, { status: 403 });
  }

  // المحاولة تُنشأ تلقائياً عند أول دخول، ومحاولة جديدة بعد كل تسليم (بدون طلب إذن)
  let current = await currentAttempt(svc, sid, examId);
  let attempt = current.attempt;
  if (!attempt || current.consumed) {
    const startedAt = new Date().toISOString();
    attempt = await svc.entities.ExamAccessRequest.create({
      student_id: sid,
      student_name: profile?.full_name || profile?.student_code || "طالب",
      student_email: profile?.student_code || sid,
      school_id: schoolId,
      exam_id: exam.id,
      exam_title: exam.title,
      status: "approved",
      reviewed_at: startedAt,
      started_at: startedAt,
    });
  }
  if (!attempt) return Response.json({ error: "Could not start exam" }, { status: 500 });

  if (!attempt.started_at) {
    const startedAt = new Date().toISOString();
    await svc.entities.ExamAccessRequest.update(attempt.id, { started_at: startedAt });
    attempt = { ...attempt, started_at: startedAt };
  }
  const total = examDurationSeconds(exam);
  const elapsed = (Date.now() - new Date(attempt.started_at).getTime()) / 1000;
  return Response.json({
    started_at: attempt.started_at,
    duration_seconds: total,
    remaining_seconds: Math.max(0, Math.floor(total - elapsed)),
  });
}

/** تصحيح الامتحان على الخادم وإنشاء النتيجة — يمنع تزوير الدرجات والوقت من المتصفح */
async function submitExam(svc: any, ctx: any) {
  const { profile, sid, schoolId, data } = ctx;
  const examId = data?.exam_id;
  if (!examId) return Response.json({ error: "exam_id required" }, { status: 400 });

  const { exam, error } = await loadExamForStudent(svc, examId, schoolId, profile?.class_name);
  if (error) return error;

  const { attempt, consumed } = await currentAttempt(svc, sid, examId);
  if (!attempt || !attempt.started_at) return Response.json({ error: "Exam not started" }, { status: 403 });
  if (consumed) return Response.json({ error: "Exam already submitted" }, { status: 409 });

  // يجب أن يكون الامتحان قد بدأ عبر startExam (يفرض المدة من الخادم)
  const startedMs = new Date(attempt.started_at).getTime();
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

  // فحص ما إذا كان هناك نتيجة سابقة لهذا الطالب في هذا الامتحان (حالة إعادة الامتحان):
  const existingResults = await svc.entities.ExamResult.filter({ student_id: sid, exam_id: exam.id }, "-submission_time", 20);
  let row;
  if (existingResults && existingResults.length > 0) {
    // تحديث النتيجة الحالية لتعديل العلامة مباشرة بدون تكرار الطالب
    const targetResult = existingResults[0];
    row = await svc.entities.ExamResult.update(targetResult.id, {
      score: pct,
      percentage: pct,
      total_questions: total,
      correct_answers: correct,
      wrong_answers: total - correct,
      answers: review,
      start_time: attempt.started_at,
      end_time: now,
      submission_time: now,
      status: "submitted",
      allow_retake: false,
      retake_allowed_at: null,
      retake_allowed_by: null,
    });
    // تنظيف أي سجلات مكررة إن وُجدت سابقاً
    for (let j = 1; j < existingResults.length; j++) {
      await svc.entities.ExamResult.delete(existingResults[j].id).catch(() => {});
    }
  } else {
    row = await svc.entities.ExamResult.create({
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
      start_time: attempt.started_at,
      end_time: now,
      submission_time: now,
      status: "submitted",
      allow_retake: false,
    });
  }

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
          const studentClass = (profile?.class_name || "").trim();

          const teachers = await svc.entities.Teacher.filter({ school_id: schoolId }).catch(() => []);
          const teacherAssignedMap = new Map();
          (teachers || []).forEach((t: any) => {
            if (t.id && Array.isArray(t.assigned_classes)) {
              teacherAssignedMap.set(t.id, t.assigned_classes.map((c: any) => String(c).trim()).filter(Boolean));
            }
          });

          const visible = (rows || []).filter((e: any) => {
            // 1. عزل المدرسة:
            const isGeneralPlatform = e.school_id === "general" && !e.teacher_id;
            const isMySchool = e.school_id === schoolId;
            if (!isGeneralPlatform && !isMySchool) return false;

            if (isGeneralPlatform && (!Array.isArray(e.target_classes) || e.target_classes.length === 0)) {
              return true;
            }

            // 2. عزل الصفوف التام:
            let targets = Array.isArray(e.target_classes)
              ? e.target_classes.map((c: any) => String(c).trim()).filter(Boolean)
              : [];

            if (targets.length === 0 && e.teacher_id && teacherAssignedMap.has(e.teacher_id)) {
              targets = teacherAssignedMap.get(e.teacher_id);
            }

            if (targets.length > 0) {
              return Boolean(studentClass && targets.includes(studentClass));
            }

            return !studentClass;
          });
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
          // لا يُسمح بقراءة الامتحانات غير المنشورة أو امتحانات مدرسة أخرى أو صف آخر
          const { exam, error } = await loadExamForStudent(svc, id, schoolId, profile?.class_name);
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
        let d = pick(data, config.createFields || config.writable || []);

        if (entity === "ExamAccessRequest") {
          // الطالب يطلب فقط — الموافقة من الأستاذ/المشرف. الحالة تُفرض هنا مهما أرسل العميل.
          if (!d.exam_id) return Response.json({ error: "exam_id required" }, { status: 400 });
          const { exam, error } = await loadExamForStudent(svc, d.exam_id, schoolId, profile?.class_name);
          if (error) return error;
          const mine = (await svc.entities.ExamAccessRequest.filter({ student_id: sid, exam_id: d.exam_id })) || [];
          const open = mine.find((r: any) => r.status === "pending");
          if (open) return Response.json(open); // لا تكرار للطلبات المعلّقة
          // الاسم والبريد المعروضان للمراجع يُشتقّان من ملف الطالب الموثوق
          d = {
            ...d,
            exam_title: exam.title,
            student_name: profile.full_name || profile.student_code,
            student_email: profile.student_code,
            status: "pending",
          };
        }

        if (entity === "LabHistory") {
          d.tasks_total = clampInt(d.tasks_total, 0, LAB_MAX_TASKS);
          d.scenario_xp = clampInt(d.scenario_xp, 0, LAB_MAX_XP);
        }

        if (entity === "ScenarioTaskStatus") {
          const target = await validateTaskTarget(svc, d.lab_history_id, sid, schoolId, d.task_index);
          if (!target) return Response.json({ error: "Invalid task" }, { status: 400 });
          d = {
            ...d,
            scenario_id: target.scenario_id,
            status: "completed",
            completed_at: new Date().toISOString(),
          };
        }

        if (entity === "StudentProgress") {
          d = {
            ...deriveProgress(d),
            student_email: profile.student_code,
            student_name: profile.full_name || profile.student_code,
          };
        }

        const row = await svc.entities[entity].create(injectData(d));
        if (entity === "LabHistory") {
          return Response.json((await deriveLabCounters(svc, row.id, sid)) || row);
        }
        if (entity === "ScenarioTaskStatus" && row?.lab_history_id) {
          await deriveLabCounters(svc, row.lab_history_id, sid);
        }
        return Response.json(row);
      }

      case "update": {
        if (config.readOnly || config.createOnly) {
          return Response.json({ error: "Read-only entity" }, { status: 403 });
        }
        // التحقق من الملكية قبل التحديث
        let existing: any = null;
        if (config.ownerField === "id") {
          if (id !== sid) return Response.json({ error: "Forbidden" }, { status: 403 });
        } else if (config.ownerField) {
          existing = await svc.entities[entity].get(id).catch(() => null);
          if (!verifyOwnership(existing)) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }
        const allowed = config.updatableFields || config.writable || [];
        let updateData = pick(data, allowed);

        if (entity === "LabHistory" && updateData.tasks_total !== undefined) {
          updateData.tasks_total = clampInt(updateData.tasks_total, 0, LAB_MAX_TASKS);
        }
        if (entity === "ScenarioTaskStatus") {
          // لا يمكن نقل المهمة أو تغيير محاولتها؛ الإنجاز يفرضه الخادم
          updateData = {
            ...updateData,
            status: "completed",
            completed_at: existing?.completed_at || new Date().toISOString(),
          };
        }
        if (entity === "StudentProgress") {
          updateData = deriveProgress(updateData, existing);
        }

        const row = await svc.entities[entity].update(id, updateData);
        if (entity === "LabHistory") {
          return Response.json((await deriveLabCounters(svc, id, sid)) || project(row, config.readFields));
        }
        if (entity === "ScenarioTaskStatus" && row?.lab_history_id) {
          await deriveLabCounters(svc, row.lab_history_id, sid);
        }
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
        return await startExam(svc, { profile, sid, schoolId, data });
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