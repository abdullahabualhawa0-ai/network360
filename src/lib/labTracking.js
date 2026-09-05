/**
 * labTracking.js — تتبع تقدم الطالب في السيناريوهات
 * LabHistory (محاولة واحدة لكل سيناريو) + ScenarioTaskStatus (سجل مستقل لكل مهمة)
 */
import { base44 } from "@/api/base44Client";

export const GENERAL_SCHOOL = "general";

/** يجلب معرف مدرسة الطالب من ملفه، أو "general" إن لم يوجد */
export async function resolveSchoolId(user) {
  try {
    const profiles = await base44.entities.StudentProfile.filter({ user_id: user.id });
    return profiles?.[0]?.school_id || GENERAL_SCHOOL;
  } catch {
    return GENERAL_SCHOOL;
  }
}

/** يجلب سجل المحاولة للسيناريو أو ينشئه عند أول استخدام */
export async function ensureLabRecord(user, schoolId, scenario, tasksTotal) {
  const existing = await base44.entities.LabHistory.filter({
    student_id: user.id,
    scenario_id: scenario.id,
    school_id: schoolId,
  });
  if (existing && existing.length > 0) {
    const lab = existing[0];
    // حدّث العدد الكلي إن تغيّر تعريف السيناريو
    if (tasksTotal && (lab.tasks_total || 0) !== tasksTotal) {
      await base44.entities.LabHistory.update(lab.id, { tasks_total: tasksTotal });
      lab.tasks_total = tasksTotal;
    }
    return lab;
  }
  const now = new Date().toISOString();
  return await base44.entities.LabHistory.create({
    student_id: user.id,
    school_id: schoolId,
    scenario_id: scenario.id,
    scenario_title: scenario.title,
    scenario_difficulty: scenario.difficulty,
    status: "in_progress",
    tasks_total: tasksTotal || 0,
    tasks_completed: 0,
    score: 0,
    xp_earned: 0,
    started_at: now,
    last_activity_at: now,
  });
}

/** يجلب سجلات المهام المحفوظة لمحاولة معينة */
export async function loadTaskStatuses(labId) {
  const rows = await base44.entities.ScenarioTaskStatus.filter({ lab_history_id: labId });
  return rows || [];
}

/** يحدّث العدادات في سجل المحاولة لتطابق عدد المهام المنجزة فعلياً */
export async function syncLabCounters(lab, completedCount) {
  if ((lab.tasks_completed || 0) === completedCount) return;
  await base44.entities.LabHistory.update(lab.id, { tasks_completed: completedCount });
  lab.tasks_completed = completedCount;
}

/**
 * يحفظ إنجاز مهمة واحدة بشكل مستقل:
 * - يحدّث سجل المهمة (ScenarioTaskStatus) إلى completed
 * - يزيد عداد سجل المحاولة (LabHistory) ويحدّث حالتها ودرجتها
 * يعدّل كائن lab في مكانه ويعيده.
 */
export async function markTaskCompleted({ lab, user, schoolId, scenario, taskIndex, taskLabel }) {
  const rows = await base44.entities.ScenarioTaskStatus.filter({
    lab_history_id: lab.id,
    scenario_id: scenario.id,
    task_index: taskIndex,
  });
  const now = new Date().toISOString();

  if (rows && rows.length > 0) {
    if (rows[0].status === "completed") return lab;
    await base44.entities.ScenarioTaskStatus.update(rows[0].id, {
      status: "completed",
      task_label: taskLabel,
      completed_at: now,
    });
  } else {
    await base44.entities.ScenarioTaskStatus.create({
      lab_history_id: lab.id,
      student_id: user.id,
      school_id: schoolId,
      scenario_id: scenario.id,
      task_index: taskIndex,
      task_label: taskLabel,
      status: "completed",
      completed_at: now,
    });
  }

  const completed = (lab.tasks_completed || 0) + 1;
  const total = lab.tasks_total || 0;
  const allDone = total > 0 && completed >= total;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  await base44.entities.LabHistory.update(lab.id, {
    tasks_completed: completed,
    score,
    status: allDone ? "completed" : "partially_completed",
    xp_earned: allDone ? (scenario.xp || lab.xp_earned || 0) : (lab.xp_earned || 0),
    completed_at: allDone ? now : (lab.completed_at || null),
    last_activity_at: now,
  });

  lab.tasks_completed = completed;
  lab.score = score;
  lab.status = allDone ? "completed" : "partially_completed";
  lab.xp_earned = allDone ? (scenario.xp || lab.xp_earned || 0) : (lab.xp_earned || 0);
  if (allDone) lab.completed_at = now;
  return lab;
}