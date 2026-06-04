import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ChevronLeft, FileText, Eye, Printer, Trash2,
  Pencil, Sparkles, CheckCircle2, AlertCircle, BookOpen,
  Clock, Save, X, ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import courseData from "../../lib/courseData";
import ExamEditor from "../../components/exams/ExamEditor";
import ExamPreview from "../../components/exams/ExamPreview";

export default function ExamManager() {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list | create | edit | preview
  const [selectedExam, setSelectedExam] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role !== "admin") {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        const data = await base44.entities.Exam.list("-created_date", 100);
        setExams(data);
      } catch {
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshExams = async () => {
    const data = await base44.entities.Exam.list("-created_date", 100);
    setExams(data);
  };

  const deleteExam = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;
    await base44.entities.Exam.delete(id);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020617" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
          <span className="text-slate-400 text-sm">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#020617" }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={36} className="text-red-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">وصول مقيّد</h2>
          <p className="text-slate-400 text-sm mb-6">هذه الصفحة للمعلمين والمديرين فقط.</p>
          <Link to="/" className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors">
            العودة للرئيسية
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
          await base44.entities.Exam.update(selectedExam.id, data);
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
          await base44.entities.Exam.create(data);
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
    <div className="min-h-screen" style={{ background: "#020617" }}>
      {/* Header */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d1117 0%,#0d1a2a 50%,#0d1117 100%)", borderBottom: "1px solid rgba(6,182,212,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative max-w-6xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: "rgba(6,182,212,0.65)" }}>
              <Link to="/" className="hover:text-cyan-300 transition-colors">الرئيسية</Link>
              <ChevronLeft size={13} />
              <span className="text-cyan-300">لوحة الامتحانات</span>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-black mb-1" style={{
                  background: "linear-gradient(135deg,#06b6d4,#a78bfa)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>
                  📋 إدارة الامتحانات
                </h1>
                <p className="text-slate-400 text-sm">إنشاء وإدارة امتحانات مواد الشبكات</p>
              </div>
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 hover:brightness-110 text-sm"
                style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}
              >
                <Plus size={16} /> إنشاء امتحان جديد
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي الامتحانات", value: exams.length, color: "#06b6d4" },
            { label: "منشورة", value: exams.filter(e => e.status === "published").length, color: "#34d399" },
            { label: "مسودة", value: exams.filter(e => e.status === "draft").length, color: "#fbbf24" },
            { label: "إجمالي الأسئلة", value: exams.reduce((s, e) => s + (e.questions?.length || 0), 0), color: "#a78bfa" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{ background: "rgba(12,20,40,0.9)", border: `1px solid rgba(${hexToRgb(stat.color)},0.2)` }}
            >
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Exams list */}
        {exams.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">لا توجد امتحانات بعد</h3>
            <p className="text-slate-500 text-sm mb-6">ابدأ بإنشاء أول امتحان لطلابك</p>
            <button
              onClick={() => setView("create")}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}
            >
              إنشاء امتحان جديد
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
                className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: "rgba(12,20,40,0.9)", border: "1px solid rgba(6,182,212,0.12)" }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    📋
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {exam.topic_title && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <BookOpen size={10} /> {exam.section_title} › {exam.topic_title}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <FileText size={10} /> {exam.questions?.length || 0} سؤال
                      </span>
                      {exam.duration_minutes && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {exam.duration_minutes} دقيقة
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        exam.status === "published"
                          ? "text-green-400 bg-green-400/10 border-green-400/30"
                          : "text-amber-400 bg-amber-400/10 border-amber-400/30"
                      }`}>
                        {exam.status === "published" ? "✓ منشور" : "مسودة"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedExam(exam); setView("preview"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }}
                  >
                    <Eye size={12} /> معاينة
                  </button>
                  <button
                    onClick={() => { setSelectedExam(exam); setView("edit"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
                  >
                    <Pencil size={12} /> تعديل
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="p-1.5 rounded-xl text-xs transition-all hover:scale-105"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
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

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}