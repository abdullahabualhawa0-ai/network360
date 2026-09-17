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
import ExamEditor from "../../components/exams/ExamEditor";
import ExamPreview from "../../components/exams/ExamPreview";

export default function ExamManager() {
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
    if (!confirm(t("teacherConfirmDelete"))) return;
    await adminDelete("Exam", id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: "#173F5F" }} />
          <span className="text-muted-foreground text-sm">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.3)" }}>
            <AlertCircle size={36} style={{ color: "#C94C4C" }} />
          </div>
          <h2 className="font-black text-lg mb-2">{t("examMgmtRestricted")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("examMgmtRestrictedDesc")}</p>
          <Link to="/" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "#173F5F" }}>
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
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      {/* Header */}
      <div className="bg-card" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">{t("navHome")}</Link>
              <ChevronLeft size={13} />
              <span style={{ color: "#173F5F" }}>{t("examMgmtBreadcrumb")}</span>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-black text-2xl mb-1" style={{ color: "#173F5F" }}>
                  {t("examMgmtTitle")}
                </h1>
                <p className="text-muted-foreground text-sm">{t("examMgmtDesc")}</p>
              </div>
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 text-sm"
                style={{ background: "#173F5F" }}
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
            { label: t("examMgmtTotal"), value: exams.length, color: "#2F6690" },
            { label: t("examMgmtPublished"), value: exams.filter(e => e.status === "published").length, color: "#2E7D5B" },
            { label: t("examMgmtDrafts"), value: exams.filter(e => e.status === "draft").length, color: "#D69E2E" },
            { label: t("examMgmtTotalQ"), value: exams.reduce((s, e) => s + (e.questions?.length || 0), 0), color: "#3A86A8" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-card"
              style={{ border: "1px solid hsl(var(--border))" }}
            >
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Exams list */}
        {exams.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)" }}>
              <FileText size={28} style={{ color: "#2F6690" }} />
            </div>
            <h3 className="font-bold text-base mb-2">{t("examMgmtNoExams")}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t("examMgmtNoExamsDesc")}</p>
            <button
              onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#173F5F" }}
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
                className="rounded-2xl p-5 bg-card flex items-center justify-between gap-4 flex-wrap"
                style={{ border: "1px solid hsl(var(--border))" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)" }}>
                    <FileText size={20} style={{ color: "#2F6690" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-base" style={{ color: "#173F5F" }}>{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {exam.topic_title && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen size={10} /> {exam.section_title} › {exam.topic_title}
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={exam.status === "published"
                          ? { background: "rgba(46,125,91,0.1)", border: "1px solid rgba(46,125,91,0.35)", color: "#2E7D5B" }
                          : { background: "rgba(214,158,46,0.1)", border: "1px solid rgba(214,158,46,0.35)", color: "#D69E2E" }}>
                        {exam.status === "published" ? t("examMgmtPublishedBadge") : t("examMgmtDraftBadge")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedExam(exam); setView("preview"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)", color: "#2F6690" }}
                  >
                    <Eye size={12} /> {t("examMgmtPreview")}
                  </button>
                  <button
                    onClick={() => { setSelectedExam(exam); setView("edit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(23,63,95,0.08)", border: "1px solid rgba(23,63,95,0.25)", color: "#173F5F" }}
                  >
                    <Pencil size={12} /> {t("examMgmtEdit")}
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-xl transition-all hover:scale-105"
                    style={{ background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.2)", color: "#C94C4C" }}
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