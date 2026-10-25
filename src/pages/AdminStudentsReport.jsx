import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, CheckCircle2, TrendingUp, Award,
  ChevronLeft, Search, RefreshCw, BarChart2, Clock, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import courseData from "../lib/courseData";
import { t, useLang, getLang } from "@/lib/i18n";
import { topicTitle, sectionTitle } from "@/lib/courseI18n";
import BackButton from "@/components/BackButton";

const totalTopics = courseData.reduce((acc, s) => acc + s.topics.length, 0);
const totalQuizzes = courseData.reduce((acc, s) => acc + s.topics.filter(t => t.quiz).length, 0);

export default function AdminStudentsReport() {
  useLang();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.StudentProgress.list("-updated_date", 100);
      setStudents(records || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const refresh = () => fetchStudents();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  const filtered = students.filter(s =>
    s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStudent = selected ? students.find(s => s.id === selected) : null;
  const locale = getLang() === "ar" ? "ar" : getLang() === "he" ? "he-IL" : "en";

  return (
    <div className="min-h-screen bg-background text-foreground font-main">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <Link to="/" className="hover:text-brand transition-colors">{t("navHome")}</Link>
              <ChevronLeft size={13} />
              <span className="text-brand font-bold">{t("srBreadcrumb")}</span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black text-foreground mb-1">{t("srTitle")}</h1>
                <p className="text-muted-foreground text-xs">{students.length} {t("srSubtitle")}</p>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-accent border border-border text-brand text-xs font-bold hover:bg-muted transition-all"
              >
                <RefreshCw size={14} />
                <span>{t("srRefresh")}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {students.length === 0 ? (
          <div className="text-center py-16 rounded-[16px] bg-card border border-border">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-xs">{t("srEmpty")}</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Students list */}
            <div className={`${selectedStudent ? "hidden sm:block sm:w-80" : "w-full"} flex-shrink-0`}>
              {/* Search */}
              <div className="relative mb-4">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("srSearchPlaceholder")}
                  className="w-full bg-card border border-border rounded-[10px] px-4 py-2.5 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                {filtered.map((student, i) => (
                  <motion.button
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(student.id)}
                    className={`w-full text-right p-4 rounded-[12px] border transition-all ${
                      selected === student.id
                        ? "bg-accent border-primary"
                        : "bg-card border-border hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        (student.avg_quiz_score || 0) >= 80 ? "bg-success/10 border-success/35 text-success"
                        : (student.avg_quiz_score || 0) >= 60 ? "bg-warning/10 border-warning/35 text-warning"
                        : "bg-muted border-border text-muted-foreground"
                      }`}>
                        {student.avg_quiz_score ? `${student.avg_quiz_score}%` : "—"}
                      </div>
                      <div className="font-semibold text-sm text-foreground">{student.student_name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">{student.student_email}</div>
                    <div className="flex items-center justify-end gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{student.total_quizzes_completed || 0}/{totalQuizzes} {t("srQuizWord")}</span>
                      <span>{student.total_topics_visited || 0}/{totalTopics} {t("srLessonWord")}</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${totalTopics ? ((student.total_topics_visited || 0) / totalTopics) * 100 : 0}%` }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Student detail panel */}
            {selectedStudent && (
              <motion.div
                key={selectedStudent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 min-w-0"
              >
                {/* Back on mobile */}
                <button
                  onClick={() => setSelected(null)}
                  className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground mb-4"
                >
                  <ChevronLeft size={14} /> {t("srBackToList")}
                </button>

                <div className="bg-card border border-border rounded-[16px] p-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-black text-foreground">{selectedStudent.student_name}</h2>
                      <p className="text-muted-foreground text-xs">{selectedStudent.student_email}</p>
                      {selectedStudent.last_synced_at && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          {t("srLastSync")}: {new Date(selectedStudent.last_synced_at).toLocaleString(locale)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: BookOpen, label: t("srLessonsLabel"), val: `${selectedStudent.total_topics_visited || 0}/${totalTopics}`, colorCls: "text-brand" },
                      { icon: CheckCircle2, label: t("srQuizzesLabel"), val: `${selectedStudent.total_quizzes_completed || 0}/${totalQuizzes}`, colorCls: "text-success" },
                      { icon: Award, label: t("srAvgScoreLabel"), val: selectedStudent.avg_quiz_score ? `${selectedStudent.avg_quiz_score}%` : "—", colorCls: "text-warning" },
                      { icon: TrendingUp, label: t("srProgressLabel"), val: `${totalTopics ? Math.round((selectedStudent.total_topics_visited || 0) / totalTopics * 100) : 0}%`, colorCls: "text-secondary" },
                    ].map(({ icon: Icon, label, val, colorCls }, i) => (
                      <div key={i} className="rounded-[10px] p-3 bg-muted border border-border">
                        <Icon size={16} className={`${colorCls} mb-1`} />
                        <div className="text-xl font-black text-foreground">{val}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiz results */}
                {selectedStudent.quiz_results && Object.keys(selectedStudent.quiz_results).length > 0 && (
                  <div className="bg-card border border-border rounded-[16px] overflow-hidden mb-4">
                    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                      <BarChart2 size={15} className="text-brand" />
                      <span className="font-semibold text-sm text-foreground">{t("srQuizResults")}</span>
                    </div>
                    <div className="divide-y divide-border">
                      {Object.entries(selectedStudent.quiz_results).map(([topicId, result]) => {
                        const sec = courseData.find(s => s.topics.some(t => t.id === topicId));
                        const topic = sec?.topics.find(t => t.id === topicId);
                        if (!topic) return null;
                        const score = result.score || 0;
                        return (
                          <div key={topicId} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Award size={14} className={score >= 80 ? "text-warning" : "text-muted-foreground"} />
                              <span className="text-sm text-foreground">{topicTitle(topic)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-9 text-right ${
                                score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive"
                              }`}>
                                {score}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visited topics summary per section */}
                {selectedStudent.topic_progress && (
                  <div className="bg-card border border-border rounded-[16px] overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                      <BookOpen size={15} className="text-secondary" />
                      <span className="font-semibold text-sm text-foreground">{t("srStudiedTopics")}</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {courseData.map(sec => {
                        const visitedInSec = sec.topics.filter(t => selectedStudent.topic_progress[t.id]?.visited).length;
                        return (
                          <div key={sec.id} className="text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-foreground">{sectionTitle(sec)}</span>
                              <span className="text-xs text-muted-foreground">{visitedInSec}/{sec.topics.length}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary rounded-full"
                                style={{ width: `${sec.topics.length ? (visitedInSec / sec.topics.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}