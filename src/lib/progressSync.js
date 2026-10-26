/**
 * progressSync.js
 * يزامن تقدم الطالب من localStorage إلى كيان StudentProgress (لرؤية الإدارة).
 * يستخدم نظام جلسة الطالب (studentApi) بدلاً من Base44 Authentication.
 */
import { studentApi, getStudentSession } from "@/lib/studentSession";

const PROGRESS_KEY = "topic-progress";
const QUIZ_KEY = "quiz-results";

function loadLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

export async function syncProgressToServer() {
  try {
    const session = getStudentSession();
    if (!session) return; // ليس طالباً مسجلاً في جلسة

    const topicProgress = loadLocal(PROGRESS_KEY);
    const quizResults = loadLocal(QUIZ_KEY);

    // المؤشرات المجمّعة (عدد المواضيع/الاختبارات ومتوسط الدرجات) تُحسب على الخادم من هذه الخرائط
    const payload = {
      topic_progress: topicProgress,
      quiz_results: quizResults,
    };

    // البحث عن سجل موجود (studentApi يحقن student_id تلقائياً)
    const existing = await studentApi("filter", "StudentProgress", { query: {} });
    if (existing && existing.length > 0) {
      await studentApi("update", "StudentProgress", {
        id: existing[0].id,
        data: payload,
      });
    } else {
      await studentApi("create", "StudentProgress", { data: payload });
    }
  } catch (e) {
    // فشل المزامنة لا يعطل تجربة الطالب
    console.warn("Progress sync failed:", e);
  }
}