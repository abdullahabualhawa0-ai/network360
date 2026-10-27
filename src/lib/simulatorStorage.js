/**
 * simulatorStorage.js — عزل كامل لبيانات محاكاة الشبكات والسيناريوهات ونظام XP
 * يعزل البيانات بين الطلاب والأساتذة ومشرفي المدارس ومديري النظام.
 * لا تتداخل بيانات أي حساب مع حساب آخر حتى لو فُتحت في نفس المتصفح أو في تبويبات متعددة.
 */
import { getStudentSession } from "./studentSession";
import { getTeacherSession } from "./teacherSession";
import { getSchoolAdminSession } from "./schoolAdminSession";

/** الحصول على معرف النطاق (Scope) للمستخدم الحالي */
export function getUserScope() {
  try {
    // 1. طالب
    const student = getStudentSession();
    if (student?.student_id) {
      return `student_${student.student_id}`;
    }

    // 2. أستاذ
    const teacher = getTeacherSession();
    if (teacher?.teacher_id) {
      return `teacher_${teacher.teacher_id}`;
    }

    // 3. مشرف مدرسة
    const schoolAdmin = getSchoolAdminSession();
    if (schoolAdmin?.school_id) {
      return `school_admin_${schoolAdmin.school_id}`;
    }

    // 4. مستخدم مصادق من لوحة التحكم / Base44 (مالك أو مدير)
    const base44AdminToken = sessionStorage.getItem("base44_session") || localStorage.getItem("base44_session");
    if (base44AdminToken) {
      return "platform_admin";
    }

    // 5. زائر غير مسجّل — معزول لكل تبويب عبر sessionStorage
    let tabGuest = sessionStorage.getItem("tab_guest_scope");
    if (!tabGuest) {
      tabGuest = `guest_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("tab_guest_scope", tabGuest);
    }
    return tabGuest;
  } catch {
    return "default_scope";
  }
}

/** مفتاح تخزين حالة المحاكي المعزول للمستخدم وسيناريو محدد */
export function getSimStorageKey(scenarioId) {
  const scope = getUserScope();
  const scKey = scenarioId ? `s_${scenarioId}` : "free";
  return `sim_state:${scope}:${scKey}`;
}

/** مفتاح السيناريو النشط للمستخدم الحالي */
export function getActiveScenarioKey() {
  const scope = getUserScope();
  return `active_scenario:${scope}`;
}

/** مفتاح التقدم وXP المعزول للمستخدم الحالي */
export function getGamificationStorageKey() {
  const scope = getUserScope();
  return `gamification:${scope}`;
}

/** قراءة حالة المحاكي للمستخدم الحالي والسيناريو المحدد */
export function loadSimNetwork(scenarioId) {
  const key = getSimStorageKey(scenarioId);
  try {
    // الأولوية لـ sessionStorage (عزل التبويب الحالي)، ثم localStorage (استرجاع عند التحديث)
    let raw = sessionStorage.getItem(key);
    if (!raw) {
      raw = localStorage.getItem(key);
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.nodes)) {
        return {
          nodes: parsed.nodes,
          connections: parsed.connections || [],
          nextId: parsed.nextId || (parsed.nodes.length + 1),
        };
      }
    }
  } catch {}
  return { nodes: [], connections: [], nextId: 1 };
}

/** حفظ حالة المحاكي للمستخدم الحالي والسيناريو المحدد */
export function saveSimNetwork(scenarioId, state) {
  const key = getSimStorageKey(scenarioId);
  try {
    const payload = JSON.stringify({
      nodes: state?.nodes || [],
      connections: state?.connections || [],
      nextId: state?.nextId || ((state?.nodes || []).length + 1),
      updatedAt: Date.now(),
    });
    sessionStorage.setItem(key, payload);
    localStorage.setItem(key, payload);
  } catch {}
}

/** مسح حالة المحاكي للمستخدم الحالي والسيناريو المحدد */
export function clearSimNetwork(scenarioId) {
  const key = getSimStorageKey(scenarioId);
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}
}

/** جلب معرف السيناريو النشط للمستخدم الحالي */
export function getActiveScenarioId() {
  const key = getActiveScenarioKey();
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key) || null;
  } catch {
    return null;
  }
}

/** تعيين السيناريو النشط للمستخدم الحالي */
export function setActiveScenarioId(scenarioId) {
  const key = getActiveScenarioKey();
  try {
    if (scenarioId) {
      sessionStorage.setItem(key, String(scenarioId));
      localStorage.setItem(key, String(scenarioId));
    } else {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
  } catch {}
}

/** مسح السيناريو النشط للمستخدم الحالي */
export function clearActiveScenarioId() {
  const key = getActiveScenarioKey();
  try {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  } catch {}
}

/** جلب بيانات الـ XP والشارات المعزولة للمستخدم الحالي */
export function loadUserGamification() {
  const key = getGamificationStorageKey();
  try {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.xp === "number") return parsed;
    }
  } catch {}
  return { xp: 0, badges: [] };
}

/** حفظ بيانات الـ XP والشارات المعزولة للمستخدم الحالي */
export function saveUserGamification(data) {
  const key = getGamificationStorageKey();
  try {
    const payload = JSON.stringify(data);
    sessionStorage.setItem(key, payload);
    localStorage.setItem(key, payload);
  } catch {}
}