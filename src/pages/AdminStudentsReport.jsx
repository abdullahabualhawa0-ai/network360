import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import courseData from "../lib/courseData";
import quizData from "../lib/quizData";
import {
  Users, ChevronLeft, Award, BookOpen, BarChart2,
  TrendingUp, CheckCircle2, Clock, RefreshCw, ShieldAlert, Search
} from "lucide-react";

const totalTopics = courseData.reduce((s, sec) => s + sec.topics.length, 0);
const totalQuizzes = Object.keys(quizData).length;

export default function AdminStudentsReport() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role !== "admin") {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(true);
        const data = await base44.entities.StudentProgress.list("-last_synced_at", 100);
        setStudents(data || []);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.StudentProgress.list("-last_synced_at", 100);
      setStudents(data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <ShieldAlert size={48} className="text-red-400" />
        <h2 className="text-xl font-bold text-foreground">غير مصرح لك بالوصول</h2>
        <p className="text-muted-foreground text-sm">هذه الصفحة للمشرفين فقط.</p>
        <Link to="/" className="text-primary hover:underline text-sm">العودة للرئيسية</Link>
      </div>
    );
  }

  const filtered = students.filter(s =>
    s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_email?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedStudent = selected ? students.find(s => s.id === selected) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-slate-900 via-purple-950 to-slate-900">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-purple-300/70 text-sm mb-2">
              <Link to="/" className="hover:text-purple-200 transition-colors">الرئيسية</Link>
              <ChevronLeft size={13} />
              <span className="text-purple-200">تقارير الطلاب</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white mb-1">تقارير الطلاب</h1>
                <p className="text-slate-400 text-sm">{students.length} طالب مسجل — يتحدث تلقائياً</p>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all"
              >
                <RefreshCw size={14} />
                <span>تحديث</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {students.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا يوجد طلاب قاموا بمزامنة تقدمهم بعد.</p>
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
                  placeholder="ابحث عن طالب..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                    className={`w-full text-right p-4 rounded-2xl border transition-all ${
                      selected === student.id
                        ? "bg-primary/10 border-primary shadow-md"
                        : "bg-card border-border hover:shadow-sm hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        (student.avg_quiz_score || 0) >= 80 ? "bg-green-100 text-green-700"
                        : (student.avg_quiz_score || 0) >= 60 ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                      }`}>
                        {student.avg_quiz_score ? `${student.avg_quiz_score}%` : "—"}
                      </div>
                      <div className="font-semibold text-sm text-foreground">{student.student_name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">{student.student_email}</div>
                    <div className="flex items-center justify-end gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{student.total_quizzes_completed || 0}/{totalQuizzes} اختبار</span>
                      <span>{student.total_topics_visited || 0}/{totalTopics} درس</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
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
                  className="sm:hidden flex items-center gap-1 text-sm text-muted-foreground mb-4"
                >
                  <ChevronLeft size={14} /> عودة للقائمة
                </button>

                <div className="bg-card border border-border rounded-2xl p-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-black text-foreground">{selectedStudent.student_name}</h2>
                      <p className="text-muted-foreground text-sm">{selectedStudent.student_email}</p>
                      {selectedStudent.last_synced_at && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          آخر تزامن: {new Date(selectedStudent.last_synced_at).toLocaleString("ar-SA")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: BookOpen, label: "الدروس", val: `${selectedStudent.total_topics_visited || 0}/${totalTopics}`, color: "text-blue-500", bg: "bg-blue-50" },
                      { icon: CheckCircle2, label: "الاختبارات", val: `${selectedStudent.total_quizzes_completed || 0}/${totalQuizzes}`, color: "text-green-500", bg: "bg-green-50" },
                      { icon: Award, label: "متوسط الدرجات", val: selectedStudent.avg_quiz_score ? `${selectedStudent.avg_quiz_score}%` : "—", color: "text-amber-500", bg: "bg-amber-50" },
                      { icon: TrendingUp, label: "نسبة التقدم", val: `${totalTopics ? Math.round((selectedStudent.total_topics_visited || 0) / totalTopics * 100) : 0}%`, color: "text-purple-500", bg: "bg-purple-50" },
                    ].map(({ icon: Icon, label, val, color, bg }, i) => (
                      <div key={i} className={`rounded-xl p-3 ${bg}`}>
                        <Icon size={16} className={`${color} mb-1`} />
                        <div className={`text-xl font-black ${color}`}>{val}</div>
                        <div className="text-xs text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiz results */}
                {selectedStudent.quiz_results && Object.keys(selectedStudent.quiz_results).length > 0 && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
                    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                      <BarChart2 size={15} className="text-primary" />
                      <span className="font-semibold text-sm text-foreground">نتائج الاختبارات</span>
                    </div>
                    <div className="divide-y divide-border">
                      {Object.entries(selectedStudent.quiz_results).map(([topicId, result]) => {
                        const sec = courseData.find(s => s.topics.some(t => t.id === topicId));
                        const topic = sec?.topics.find(t => t.id === topicId);
                        if (!topic) return null;
                        return (
                          <div key={topicId} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Award size={14} className={result.score >= 80 ? "text-amber-500" : "text-slate-300"} />
                              <span className="text-sm text-foreground">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-amber-400" : "bg-red-400"
                                }`} style={{ width: `${result.score}%` }} />
                              </div>
                              <span className={`text-xs font-bold w-9 text-right ${
                                result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-600" : "text-red-500"
                              }`}>{result.score}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Visited topics summary per section */}
                {selectedStudent.topic_progress && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                      <BookOpen size={15} className="text-secondary" />
                      <span className="font-semibold text-sm text-foreground">المواضيع المدروسة</span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {courseData.map(sec => {
                        const visitedInSec = sec.topics.filter(t => selectedStudent.topic_progress[t.id]?.visited).length;
                        return (
                          <div key={sec.id} className="text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-foreground">{sec.title}</span>
                              <span className="text-xs text-muted-foreground">{visitedInSec}/{sec.topics.length}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                style={{ width: `${sec.topics.length ? (visitedInSec / sec.topics.length) * 100 : 0}%` }} />
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