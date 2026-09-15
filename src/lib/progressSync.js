/**
 * progressSync.js
 * يزامن تقدم الطالب من localStorage إلى كيان StudentProgress (لرؤية الإدارة).
 * يستخدم نظام جلسة الطالب (studentApi) بدلاً من Base44 Authentication.
 */
import { studentApi, getStudentSession } from "@/lib/studentSession";
import courseData from "./courseData";
import quizData from "./quizData";

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

    const totalTopics = courseData.reduce((s, sec) => s + sec.topics.length, 0);
    const visitedTopics = Object.keys(topicProgress).filter(k => topicProgress[k]?.visited).length;
    const completedQuizzes = Object.keys(quizResults).length;
    const avgScore = completedQuizzes > 0
      ? Math.round(Object.values(quizResults).reduce((s, r) => s + (r.score || 0), 0) / completedQuizzes)
      : 0;

    const payload = {
      student_email: session.student_code, // معرّف بديل (الرمز فريد لكل طالب)
      student_name: session.student_name || session.student_code,
      topic_progress: topicProgress,
      quiz_results: quizResults,
      total_topics_visited: visitedTopics,
      total_quizzes_completed: completedQuizzes,
      avg_quiz_score: avgScore,
      last_synced_at: new Date().toISOString(),
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