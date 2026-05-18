/**
 * progressSync.js
 * Syncs student progress from localStorage to the StudentProgress entity (for admin visibility).
 * Only syncs when the current user has role === "student".
 */
import { base44 } from "@/api/base44Client";
import courseData from "./courseData";
import quizData from "./quizData";

const PROGRESS_KEY = "topic-progress";
const QUIZ_KEY = "quiz-results";

function loadLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

export async function syncProgressToServer() {
  try {
    const user = await base44.auth.me();
    if (!user || user.role !== "student") return;

    const topicProgress = loadLocal(PROGRESS_KEY);
    const quizResults = loadLocal(QUIZ_KEY);

    const totalTopics = courseData.reduce((s, sec) => s + sec.topics.length, 0);
    const visitedTopics = Object.keys(topicProgress).filter(k => topicProgress[k]?.visited).length;
    const completedQuizzes = Object.keys(quizResults).length;
    const avgScore = completedQuizzes > 0
      ? Math.round(Object.values(quizResults).reduce((s, r) => s + (r.score || 0), 0) / completedQuizzes)
      : 0;

    const payload = {
      student_email: user.email,
      student_name: user.full_name || user.email,
      topic_progress: topicProgress,
      quiz_results: quizResults,
      total_topics_visited: visitedTopics,
      total_quizzes_completed: completedQuizzes,
      avg_quiz_score: avgScore,
      last_synced_at: new Date().toISOString(),
    };

    // Check if record already exists for this student
    const existing = await base44.entities.StudentProgress.filter({ student_email: user.email });
    if (existing && existing.length > 0) {
      await base44.entities.StudentProgress.update(existing[0].id, payload);
    } else {
      await base44.entities.StudentProgress.create(payload);
    }
  } catch (e) {
    // Silently fail — don't disrupt the student experience
    console.warn("Progress sync failed:", e);
  }
}