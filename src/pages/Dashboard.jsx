import { useState, useEffect } from "react";
import courseData from "../lib/courseData";
import quizData from "../lib/quizData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle2, Star, TrendingUp, Award,
  ChevronLeft, Lock, BarChart2, Target, Zap
} from "lucide-react";
import { t, useLang } from "@/lib/i18n";
import { sectionTitle, topicTitle } from "@/lib/courseI18n";

const PROGRESS_KEY = "topic-progress";
const QUIZ_KEY = "quiz-results";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); } catch { return {}; }
}
function loadQuizResults() {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY) || "{}"); } catch { return {}; }
}

const SECTION_ICONS = {
  "network-addresses": "🌐",
  "vlan": "🏷️",
  "routing": "🔀",
  "wireless": "📡",
  "security": "🛡️",
  "network-services": "⚙️",
  "iot": "💡",
};

export default function Dashboard() {
  useLang();
  const [progress, setProgress] = useState(loadProgress());
  const [quizResults, setQuizResults] = useState(loadQuizResults());

  useEffect(() => {
    const handleStorage = () => {
      setProgress(loadProgress());
      setQuizResults(loadQuizResults());
    };
    window.addEventListener("storage", handleStorage);
    // Also re-read on focus
    window.addEventListener("focus", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleStorage);
    };
  }, []);

  const totalTopics = courseData.reduce((s, sec) => s + sec.topics.length, 0);
  const visitedTopics = Object.keys(progress).filter(k => progress[k]?.visited).length;
  const completedQuizzes = Object.keys(quizResults).length;
  const totalQuizzes = Object.keys(quizData).length;

  const avgScore = completedQuizzes > 0
    ? Math.round(Object.values(quizResults).reduce((s, r) => s + (r.score || 0), 0) / completedQuizzes)
    : 0;

  // Strength per section
  const sectionStrengths = courseData.map(sec => {
    const topicsWithQuiz = sec.topics.filter(t => quizData[t.id]);
    const done = topicsWithQuiz.filter(t => quizResults[t.id]);
    const scores = done.map(t => quizResults[t.id]?.score || 0);
    const avgSec = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const visited = sec.topics.filter(t => progress[t.id]?.visited).length;
    return { ...sec, avgScore: avgSec, visited, total: sec.topics.length };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-indigo-300/70 text-sm mb-2">
              <Link to="/" className="hover:text-indigo-200 transition-colors">{t("backHome")}</Link>
              <ChevronLeft size={13} />
              <span className="text-indigo-200">{t("navDashboard")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{t("dashTitle")}</h1>
            <p className="text-slate-400 text-sm">{t("dashSubtitle")}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: t("dashLessonsDone"), val: `${visitedTopics}/${totalTopics}`, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
            { icon: CheckCircle2, label: t("dashQuizzesDone"), val: `${completedQuizzes}/${totalQuizzes}`, color: "text-green-500", bg: "bg-green-50 border-green-100" },
            { icon: Star, label: t("dashAvgScore"), val: completedQuizzes ? `${avgScore}%` : "—", color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
            { icon: TrendingUp, label: t("dashProgressPct"), val: `${totalTopics ? Math.round(visitedTopics / totalTopics * 100) : 0}%`, color: "text-purple-500", bg: "bg-purple-50 border-purple-100" },
          ].map(({ icon: Icon, label, val, color, bg }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border p-4 ${bg}`}
            >
              <Icon size={20} className={`${color} mb-2`} />
              <div className={`text-2xl font-black ${color}`}>{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Overall progress bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-primary" />
              <span className="font-bold text-sm text-foreground">{t("dashOverall")}</span>
            </div>
            <span className="text-xs font-bold text-primary">{visitedTopics}/{totalTopics} {t("lessonWord")}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalTopics ? (visitedTopics / totalTopics) * 100 : 0}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Section strengths */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
            <h2 className="font-bold text-foreground">{t("dashBySection")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionStrengths.map((sec, i) => (
              <motion.div key={sec.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{SECTION_ICONS[sec.id] || "📚"}</span>
                    <span className="font-semibold text-sm text-foreground">{sectionTitle(sec)}</span>
                  </div>
                  {sec.avgScore !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      sec.avgScore >= 80 ? "bg-green-100 text-green-700"
                      : sec.avgScore >= 60 ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                    }`}>
                      {sec.avgScore}%
                    </span>
                  )}
                </div>

                {/* Topic progress */}
                <div className="space-y-1.5 mb-3">
                  {sec.topics.map(topic => {
                    const visited = progress[topic.id]?.visited;
                    const qResult = quizResults[topic.id];
                    const hasQuiz = !!quizData[topic.id];
                    return (
                      <Link
                        key={topic.id}
                        to={`/topic/${sec.id}/${topic.id}`}
                        className="flex items-center gap-2 group"
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          qResult ? "bg-green-500" : visited ? "bg-primary/70" : "bg-muted"
                        }`}>
                          {qResult ? (
                            <CheckCircle2 size={10} className="text-white" />
                          ) : visited ? (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          ) : (
                            <Lock size={8} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className={`text-xs flex-1 truncate transition-colors ${
                          visited ? "text-foreground" : "text-muted-foreground"
                        } group-hover:text-primary`}>
                          {topicTitle(topic)}
                        </span>
                        {qResult && (
                          <span className="text-[10px] font-bold text-green-600">{qResult.score}%</span>
                        )}
                        {hasQuiz && !qResult && visited && (
                          <span className="text-[10px] text-amber-500">{t("dashTakeQuiz")}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Section bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${sec.total ? (sec.visited / sec.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{sec.visited}/{sec.total} {t("dashLessonsDoneShort")}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent quiz results */}
        {completedQuizzes > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
              <h2 className="font-bold text-foreground">{t("dashQuizResults")}</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {Object.entries(quizResults).map(([topicId, result]) => {
                const sec = courseData.find(s => s.topics.some(t => t.id === topicId));
                const topic = sec?.topics.find(t => t.id === topicId);
                if (!topic) return null;
                return (
                  <Link
                    key={topicId}
                    to={`/topic/${sec.id}/${topicId}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Award size={15} className={result.score >= 80 ? "text-amber-500" : "text-slate-400"} />
                      <span className="text-sm text-foreground">{topicTitle(topic)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-amber-400" : "bg-red-400"
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${
                        result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-600" : "text-red-500"
                      }`}>{result.score}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {visitedTopics === 0 && completedQuizzes === 0 && (
          <div className="text-center py-12">
            <Zap size={40} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t("dashEmptyMsg")}</p>
            <Link to="/" className="mt-4 inline-block text-primary text-sm hover:underline font-medium">
              {t("dashGoLessons")} ←
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}