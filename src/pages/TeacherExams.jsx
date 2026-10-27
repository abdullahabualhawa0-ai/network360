import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, FileText, Eye, Trash2, Pencil, Clock, Loader2,
  ClipboardList, ChevronRight, BookOpen, Sparkles, GraduationCap,
} from "lucide-react";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";
import ExamEditor from "@/components/exams/ExamEditor";
import { useDialogs } from "@/components/DialogProvider";

/**
 * امتحانات الأستاذ — إنشاء وإدارة امتحانات المدرسة مع توليد أسئلة بالـAI.
 */
export default function TeacherExams() {
  const { confirmDialog } = useDialogs();
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedExam, setSelectedExam] = useState(null);

  const load = () =>
    teacherApi("filter", "Exam", { sort: "-created_date", limit: 100 })
      .then((rows) => setExams(rows || []))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const assigned = Array.isArray(session?.teacher?.assigned_classes)
      ? session.teacher.assigned_classes.map((c) => String(c).trim()).filter(Boolean)
      : [];
    if (assigned.length > 0) {
      setAssignedClasses(assigned);
    } else {
      teacherApi("filter", "StudentProfile", { limit: 500 })
        .then((students) => {
          const clsSet = new Set();
          (students || []).forEach((s) => {
            if (s.class_name && s.class_name.trim()) clsSet.add(s.class_name.trim());
          });
          setAssignedClasses(Array.from(clsSet));
        })
        .catch(() => setAssignedClasses([]));
    }
  }, [session?.teacher?.assigned_classes]);

  const deleteExam = async (id) => {
    if (!(await confirmDialog(t("examConfirmDelete")))) return;
    await teacherApi("delete", "Exam", { id });
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin text-brand" />
      </div>
    );
  }

  // Edit
  if (view === "edit" && selectedExam) {
    return (
      <ExamEditor
        exam={selectedExam}
        availableClasses={assignedClasses}
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
        availableClasses={assignedClasses}
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
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("teacherExamsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("teacherExamsPageDesc")}</p>
            </div>
          </div>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus size={14} /> {t("teacherNewExam")}
          </button>
        </div>

        {/* AI badge */}
        <div className="rounded-[16px] p-4 mb-5 flex items-center gap-3 bg-accent border border-border">
          <Sparkles size={18} className="text-brand flex-shrink-0" />
          <p className="text-xs text-muted-foreground">{t("teacherAiExamNote")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t("teacherTotalExams"), value: exams.length, colorCls: "text-brand" },
            { label: t("teacherPublished"), value: exams.filter((e) => e.status === "published").length, colorCls: "text-success" },
            { label: t("teacherDrafts"), value: exams.filter((e) => e.status === "draft").length, colorCls: "text-warning" },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] p-4 bg-card border border-border">
              <div className={`text-2xl font-black ${s.colorCls}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {exams.length === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40 text-brand" />
            <h2 className="font-black text-base mb-1 text-foreground">{t("teacherNoExams")}</h2>
            <p className="text-xs text-muted-foreground mb-4">{t("teacherNoExamsDesc")}</p>
            <button
              onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-[10px] text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("teacherNewExam")}
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {exams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-[16px] p-4 bg-card border border-border flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 bg-accent text-brand">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate text-foreground">{exam.title}</div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                      {exam.topic_title && (
                        <span className="flex items-center gap-1"><BookOpen size={10} /> {exam.topic_title}</span>
                      )}
                      <span className="flex items-center gap-1"><FileText size={10} /> {exam.questions?.length || 0} {t("questionsCount")}</span>
                      {exam.duration_minutes && <span className="flex items-center gap-1"><Clock size={10} /> {exam.duration_minutes} {t("minutesCount")}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        exam.status === "published"
                          ? "bg-success/10 border-success/35 text-success"
                          : "bg-warning/10 border-warning/35 text-warning"
                      }`}>
                        {exam.status === "published" ? t("teacherPublishedBadge") : t("teacherDraftBadge")}
                      </span>
                      {Array.isArray(exam.target_classes) && exam.target_classes.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 border border-secondary/35 text-secondary flex items-center gap-1">
                          <GraduationCap size={10} />
                          {exam.target_classes.length === 1 ? `${t("examTargetClassBadge")} ${exam.target_classes[0]}` : `${t("examTargetClassesBadge")}: ${exam.target_classes.join("، ")}`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted border border-border text-muted-foreground">
                          {t("examAllClassesBadge")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedExam(exam); setView("edit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted"
                  >
                    <Pencil size={12} /> {t("teacherEdit")}
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-[10px] bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back to dashboard */}
        <button
          onClick={() => navigate("/teacher/dashboard")}
          className="mt-6 flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
        >
          <ChevronRight size={14} className="rotate-180" /> {t("back")}
        </button>
      </div>
    </div>
  );
}