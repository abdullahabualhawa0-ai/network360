/**
 * labTracking.js — تتبع تقدم الطالب في السيناريوهات
 * يستخدم نظام جلسة الطالب (studentApi) بدلاً من Base44 Authentication
 * LabHistory (محاولة واحدة لكل سيناريو) + ScenarioTaskStatus (سجل مستقل لكل مهمة)
 *
 * العدادات والدرجة والحالة وXP تُحسب على الخادم من سجلات المهام — لا تُرسل من المتصفح.
 */
import { studentApi, getStudentSession } from "@/lib/studentSession";

export const GENERAL_SCHOOL = "general";

/** يجلب معرف مدرسة الطالب من الجلسة */
export function getSchoolId() {
  const session = getStudentSession();
  return session?.school_id || GENERAL_SCHOOL;
}

/** يجلب أحدث نسخة من سجل المحاولة من الخادم */
async function fetchLab(scenarioId) {
  const rows = await studentApi("filter", "LabHistory", {
    query: { scenario_id: scenarioId },
  });
  return (rows || [])[0] || null;
}

/** يجلب سجل المحاولة للسيناريو أو ينشئه عند أول استخدام */
export async function ensureLabRecord(scenario, tasksTotal) {
  const total = Number(tasksTotal) || 0;
  const existing = await fetchLab(scenario.id);
  if (existing) {
    // حدّث العدد الكلي إن تغيّر تعريف السيناريو
    if (total && (existing.tasks_total || 0) !== total) {
      const updated = await studentApi("update", "LabHistory", {
        id: existing.id,
        data: { tasks_total: total },
      });
      return updated || { ...existing, tasks_total: total };
    }
    return existing;
  }
  return await studentApi("create", "LabHistory", {
    data: {
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      scenario_difficulty: scenario.difficulty,
      tasks_total: total,
      scenario_xp: Number(scenario.xp) || 0,
      started_at: new Date().toISOString(),
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

/** يزامن كائن المحاولة المحلي مع العدادات المشتقة على الخادم */
export async function syncLabCounters(lab) {
  if (!lab?.scenario_id) return lab;
  const fresh = await fetchLab(lab.scenario_id);
  if (fresh) Object.assign(lab, fresh);
  return lab;
}

/**
 * يسجّل إنجاز مهمة واحدة:
 * - ينشئ/يحدّث سجل المهمة (ScenarioTaskStatus) — الحالة يفرضها الخادم
 * - الخادم يعيد حساب عدادات المحاولة ودرجتها وXP ويُزامنها هنا
 */
export async function markTaskCompleted({ lab, scenario, taskIndex, taskLabel }) {
  const rows = await studentApi("filter", "ScenarioTaskStatus", {
    query: {
      lab_history_id: lab.id,
      scenario_id: scenario.id,
      task_index: taskIndex,
    },
  });

  if (rows && rows.length > 0) {
    if (rows[0].status !== "completed") {
      await studentApi("update", "ScenarioTaskStatus", {
        id: rows[0].id,
        data: { task_label: taskLabel },
      });
    }
  } else {
    await studentApi("create", "ScenarioTaskStatus", {
      data: {
        lab_history_id: lab.id,
        task_index: taskIndex,
        task_label: taskLabel,
      },
    });
  }

  const fresh = await fetchLab(scenario.id);
  if (fresh) Object.assign(lab, fresh);
  return lab;
}