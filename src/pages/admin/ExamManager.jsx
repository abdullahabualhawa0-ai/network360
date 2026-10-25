import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, ChevronLeft, FileText, Eye, Trash2,
  Pencil, AlertCircle, BookOpen, Clock, Loader2,
} from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminList, adminDelete, adminUpdate, adminCreate } from "@/lib/adminData";
import { t, useLang, useDir } from "@/lib/i18n";
import { sectionTitle, topicTitleById } from "@/lib/courseI18n";
import courseData from "../../lib/courseData";
import ExamEditor from "../../components/exams/ExamEditor";
import ExamPreview from "../../components/exams/ExamPreview";
import { useDialogs } from "@/components/DialogProvider";

export default function ExamManager() {
  const { confirmDialog } = useDialogs();
  const { isLoading, role, school_id } = useAdminAuth();
  useLang();
  const direction = useDir();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selectedExam, setSelectedExam] = useState(null);
  const [adminSchoolId, setAdminSchoolId] = useState("general");

  const isAdmin = role === "admin" || role === "school_admin";

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) { setLoading(false); return; }
    setAdminSchoolId(school_id || "general");
    adminList("Exam", "-created_date", 100)
      .then((rows) => setExams(rows || []))
      .finally(() => setLoading(false));
  }, [isAdmin, isLoading, school_id]);

  const refreshExams = () =>
    adminList("Exam", "-created_date", 100)
      .then((rows) => setExams(rows || []));

  const deleteExam = async (id) => {
    if (!(await confirmDialog(t("examConfirmDelete")))) return;
    await adminDelete("Exam", id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand" />
          <span className="text-muted-foreground text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-main" dir={direction}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-[16px] mx-auto mb-4 flex items-center justify-center bg-destructive/10 border border-destructive/30 text-destructive">
            <AlertCircle size={36} />
          </div>
          <h2 className="font-black text-lg mb-2 text-foreground">{t("examMgmtRestricted")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("examMgmtRestrictedDesc")}</p>
          <Link to="/" className="px-4 py-2 rounded-[10px] text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            {t("examMgmtBackHome")}
          </Link>
        </div>
      </div>
    );
  }

  // Edit view
  if (view === "edit" && selectedExam) {
    return (
      <ExamEditor
        exam={selectedExam}
        onSave={async (data) => {
          await adminUpdate("Exam", selectedExam.id, data);
          await refreshExams();
          setView("list");
          setSelectedExam(null);
        }}
        onCancel={() => { setView("list"); setSelectedExam(null); }}
      />
    );
  }

  // Create view
  if (view === "create") {
    return (
      <ExamEditor
        exam={null}
        onSave={async (data) => {
          await adminCreate("Exam", { ...data, school_id: adminSchoolId });
          await refreshExams();
          setView("list");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  // Preview view
  if (view === "preview" && selectedExam) {
    return (
      <ExamPreview
        exam={selectedExam}
        onBack={() => { setView("list"); setSelectedExam(null); }}
      />
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-brand transition-colors">{t("navHome")}</Link>
              <ChevronLeft size={13} />
              <span className="text-brand font-bold">{t("examMgmtBreadcrumb")}</span>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-black text-2xl mb-1 text-foreground">
                  {t("examMgmtTitle")}
                </h1>
                <p className="text-muted-foreground text-sm">{t("examMgmtDesc")}</p>
              </div>
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm"
              >
                <Plus size={16} /> {t("examMgmtNew")}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("examMgmtTotal"), value: exams.length, colorCls: "text-brand" },
            { label: t("examMgmtPublished"), value: exams.filter(e => e.status === "published").length, colorCls: "text-success" },
            { label: t("examMgmtDrafts"), value: exams.filter(e => e.status === "draft").length, colorCls: "text-warning" },
            { label: t("examMgmtTotalQ"), value: exams.reduce((s, e) => s + (e.questions?.length || 0), 0), colorCls: "text-brand" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[16px] p-4 bg-card border border-border"
            >
              <div className={`text-2xl font-black ${stat.colorCls}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Exams list */}
        {exams.length === 0 ? (
          <div className="text-center py-20 rounded-[16px] bg-card border border-border">
            <div className="w-16 h-16 rounded-[12px] mx-auto mb-4 flex items-center justify-center bg-accent text-brand">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-base mb-2 text-foreground">{t("examMgmtNoExams")}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t("examMgmtNoExamsDesc")}</p>
            <button
              onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-[10px] text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("examMgmtNew")}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-[16px] p-5 bg-card border border-border flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-accent text-brand">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-foreground">{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {exam.topic_id && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen size={10} /> {(() => {
                            const sec = courseData.find(s => s.topics.some(tp => tp.id === exam.topic_id));
                            return `${sec ? sectionTitle(sec) : (exam.section_title || "")} › ${topicTitleById(exam.topic_id, exam.topic_title || "")}`;
                          })()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText size={10} /> {exam.questions?.length || 0} {t("examMgmtQuestions")}
                      </span>
                      {exam.duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {exam.duration_minutes} {t("examMgmtMinutes")}
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        exam.status === "published"
                          ? "bg-success/10 border-success/35 text-success"
                          : "bg-warning/10 border-warning/35 text-warning"
                      }`}>
                        {exam.status === "published" ? t("examMgmtPublishedBadge") : t("examMgmtDraftBadge")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedExam(exam); setView("preview"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all bg-accent border border-border text-brand hover:bg-muted"
                  >
                    <Eye size={12} /> {t("examMgmtPreview")}
                  </button>
                  <button
                    onClick={() => { setSelectedExam(exam); setView("edit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all bg-accent border border-border text-brand hover:bg-muted"
                  >
                    <Pencil size={12} /> {t("examMgmtEdit")}
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-[10px] transition-all bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}