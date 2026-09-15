/**
 * labTracking.js — تتبع تقدم الطالب في السيناريوهات
 * يستخدم نظام جلسة الطالب (studentApi) بدلاً من Base44 Authentication
 * LabHistory (محاولة واحدة لكل سيناريو) + ScenarioTaskStatus (سجل مستقل لكل مهمة)
 */
import { studentApi, getStudentSession } from "@/lib/studentSession";

export const GENERAL_SCHOOL = "general";

/** يجلب معرف مدرسة الطالب من الجلسة */
export function getSchoolId() {
  const session = getStudentSession();
  return session?.school_id || GENERAL_SCHOOL;
}

/** يجلب سجل المحاولة للسيناريو أو ينشئه عند أول استخدام */
export async function ensureLabRecord(scenario, tasksTotal) {
  const existing = await studentApi("filter", "LabHistory", {
    query: { scenario_id: scenario.id },
  });
  if (existing && existing.length > 0) {
    const lab = existing[0];
    // حدّث العدد الكلي إن تغيّر تعريف السيناريو
    if (tasksTotal && (lab.tasks_total || 0) !== tasksTotal) {
      await studentApi("update", "LabHistory", {
        id: lab.id,
        data: { tasks_total: tasksTotal },
      });
      lab.tasks_total = tasksTotal;
    }
    return lab;
  }
  const now = new Date().toISOString();
  return await studentApi("create", "LabHistory", {
    data: {
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
    },
  });
}

/** يجلب سجلات المهام المحفوظة لمحاولة معينة */
export async function loadTaskStatuses(labId) {
  const rows = await studentApi("filter", "ScenarioTaskStatus", {
    query: { lab_history_id: labId },
  });
  return rows || [];
}

/** يحدّث العدادات في سجل المحاولة لتطابق عدد المهام المنجزة فعلياً */
export async function syncLabCounters(lab, completedCount) {
  if ((lab.tasks_completed || 0) === completedCount) return;
  await studentApi("update", "LabHistory", {
    id: lab.id,
    data: { tasks_completed: completedCount },
  });
  lab.tasks_completed = completedCount;
}

/**
 * يحفظ إنجاز مهمة واحدة بشكل مستقل:
 * - يحدّث سجل المهمة (ScenarioTaskStatus) إلى completed
 * - يزيد عداد سجل المحاولة (LabHistory) ويحدّث حالتها ودرجتها
 * يعدّل كائن lab في مكانه ويعيده.
 */
export async function markTaskCompleted({ lab, scenario, taskIndex, taskLabel }) {
  const rows = await studentApi("filter", "ScenarioTaskStatus", {
    query: {
      lab_history_id: lab.id,
      scenario_id: scenario.id,
      task_index: taskIndex,
    },
  });
  const now = new Date().toISOString();

  if (rows && rows.length > 0) {
    if (rows[0].status === "completed") return lab;
    await studentApi("update", "ScenarioTaskStatus", {
      id: rows[0].id,
      data: {
        status: "completed",
        task_label: taskLabel,
        completed_at: now,
      },
    });
  } else {
    await studentApi("create", "ScenarioTaskStatus", {
      data: {
        lab_history_id: lab.id,
        scenario_id: scenario.id,
        task_index: taskIndex,
        task_label: taskLabel,
        status: "completed",
        completed_at: now,
      },
    });
  }

  const completed = (lab.tasks_completed || 0) + 1;
  const total = lab.tasks_total || 0;
  const allDone = total > 0 && completed >= total;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  await studentApi("update", "LabHistory", {
    id: lab.id,
    data: {
      tasks_completed: completed,
      score,
      status: allDone ? "completed" : "partially_completed",
      xp_earned: allDone ? (scenario.xp || lab.xp_earned || 0) : (lab.xp_earned || 0),
      completed_at: allDone ? now : (lab.completed_at || null),
      last_activity_at: now,
    },
  });

  lab.tasks_completed = completed;
  lab.score = score;
  lab.status = allDone ? "completed" : "partially_completed";
  lab.xp_earned = allDone ? (scenario.xp || lab.xp_earned || 0) : (lab.xp_earned || 0);
  if (allDone) lab.completed_at = now;
  return lab;
}