import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, FileText, Eye, Trash2, Pencil, Clock, Loader2,
  ClipboardList, ChevronRight, BookOpen, Sparkles,
} from "lucide-react";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";
import ExamEditor from "@/components/exams/ExamEditor";

/**
 * امتحانات الأستاذ — إنشاء وإدارة امتحانات المدرسة مع توليد أسئلة بالـAI.
 * يستخدم teacherApi (عزل school_id من الخادم). لا Base44 Authentication.
 */
export default function TeacherExams() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedExam, setSelectedExam] = useState(null);

  const load = () =>
    teacherApi("filter", "Exam", { sort: "-created_date", limit: 100 })
      .then((rows) => setExams(rows || []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const deleteExam = async (id) => {
    if (!confirm(t("teacherConfirmDelete"))) return;
    await teacherApi("delete", "Exam", { id });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin" style={{ color: "#173F5F" }} />
      </div>
    );
  }

  // Edit
  if (view === "edit" && selectedExam) {
    return (
      <ExamEditor
        exam={selectedExam}
        onSave={async (data) => {
          await teacherApi("update", "Exam", { id: selectedExam.id, data });
          await load();
          setView("list");
          setSelectedExam(null);
        }}
        onCancel={() => { setView("list"); setSelectedExam(null); }}
      />
    );
  }

  // Create
  if (view === "create") {
    return (
      <ExamEditor
        exam={null}
        onSave={async (data) => {
          await teacherApi("create", "Exam", { data });
          await load();
          setView("list");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  // List
  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
              <ClipboardList className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("teacherExamsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("teacherExamsPageDesc")}</p>
            </div>
          </div>
          <button onClick={() => setView("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
            style={{ background: "#173F5F" }}>
            <Plus size={14} /> {t("teacherNewExam")}
          </button>
        </div>

        {/* AI badge */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
          <Sparkles size={18} style={{ color: "#2F6690" }} />
          <p className="text-xs text-muted-foreground">{t("teacherAiExamNote")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t("teacherTotalExams"), value: exams.length, color: "#173F5F" },
            { label: t("teacherPublished"), value: exams.filter((e) => e.status === "published").length, color: "#2E7D5B" },
            { label: t("teacherDrafts"), value: exams.filter((e) => e.status === "draft").length, color: "#D69E2E" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {exams.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" style={{ color: "#173F5F" }} />
            <h2 className="font-black text-base mb-1">{t("teacherNoExams")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t("teacherNoExamsDesc")}</p>
            <button onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white" style={{ background: "#173F5F" }}>
              {t("teacherNewExam")}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {exams.map((exam, i) => (
              <motion.div key={exam.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl p-4 bg-card flex items-center justify-between gap-3 flex-wrap"
                style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "rgba(47,102,144,0.08)" }}>📋</div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{exam.title}</div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                      {exam.topic_title && (
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {exam.topic_title}</span>
                      )}
                      <span className="flex items-center gap-1"><FileText size={10} /> {exam.questions?.length || 0} {t("questionsCount")}</span>
                      {exam.duration_minutes && <span className="flex items-center gap-1"><Clock size={10} /> {exam.duration_minutes} {t("minutesCount")}</span>}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={exam.status === "published"
                          ? { background: "rgba(46,125,91,0.1)", color: "#2E7D5B", border: "1px solid rgba(46,125,91,0.3)" }
                          : { background: "rgba(214,158,46,0.1)", color: "#D69E2E", border: "1px solid rgba(214,158,46,0.3)" }}>
                        {exam.status === "published" ? t("teacherPublishedBadge") : t("teacherDraftBadge")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setSelectedExam(exam); setView("edit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}>
                    <Pencil size={12} /> {t("teacherEdit")}
                  </button>
                  <button onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-xl" style={{ background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.2)", color: "#C94C4C" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to dashboard */}
        <button onClick={() => navigate("/teacher/dashboard")}
          className="mt-6 flex items-center gap-1.5 text-xs font-bold" style={{ color: "#2F6690" }}>
          <ChevronRight size={14} className="rotate-180" /> {t("back")}
        </button>
      </div>
    </div>
  );
}