import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Loader2, CheckCircle2, Trophy, FileQuestion, Lock, RotateCcw, AlertCircle, GraduationCap } from "lucide-react";
import moment from "moment";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { GENERAL_SCHOOL } from "@/lib/schoolUtils";
import { t, useLang, useDir } from "@/lib/i18n";
import { useExamsListTranslation } from "@/lib/useExamTranslation";
import PullToRefresh from "@/components/PullToRefresh";

export default function Exams() {
  const session = useStudentSession();
  useLang();
  const direction = useDir();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);

  const loadData = useCallback(async () => {
    if (session?.is_personal) return; // الطالب الفردي لا يحتاج لتحميل الامتحانات
    try {
      const sid = session?.school_id || GENERAL_SCHOOL;
      setSchoolId(sid);
      const [ex, rs] = await Promise.all([
        studentApi("filter", "Exam", { query: {}, sort: "-created_date", limit: 100 }),
        studentApi("filter", "ExamResult", { query: {}, sort: "-submission_time", limit: 100 }),
      ]);
      setExams(ex || []);
      setResults(rs || []);
    } catch {
      setExams([]);
    }
    setLoading(false);
  }, [session?.student_id, session?.is_personal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // عزل المدارس والصفوف بدقة: الطالب لا يرى إلا امتحانات مدرسته والمخصصة لصفه
  const studentClass = (session?.class_name || "").trim();
  const visibleExams = exams.filter((e) => {
    // 1) عزل المدرسة:
    const isGeneralPlatform = e.school_id === GENERAL_SCHOOL && !e.teacher_id;
    const isMySchool = e.school_id === schoolId;
    if (!isGeneralPlatform && !isMySchool) return false;

    // 2) عزل الصف:
    const targets = Array.isArray(e.target_classes)
      ? e.target_classes.map((c) => String(c).trim()).filter(Boolean)
      : [];
    if (targets.length > 0) {
      return Boolean(studentClass && targets.includes(studentClass));
    }
    return isGeneralPlatform || !studentClass;
  });

  // ترجمة عناوين الامتحانات دفعة واحدة عند اختيار لغة غير العربية
  const { titles: trTitles } = useExamsListTranslation(visibleExams);

  // الطالب الفردي (خطة شخصية) لا يصل للامتحانات — إعادة توجيه للرئيسية
  if (session?.is_personal) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary">
            <ClipboardList className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("examsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("examsSubtitle")}</p>
          </div>
        </div>

        {/* Empty */}
        {visibleExams.length === 0 && (
          <div className="rounded-2xl p-10 text-center bg-card border border-border">
            <FileQuestion size={44} className="mx-auto mb-4 opacity-40 text-primary" />
            <h2 className="font-black text-lg mb-1">{t("noExamsTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("noExamsDesc")}</p>
          </div>
        )}

        <div className="grid gap-3">
          {visibleExams.map((exam, i) => {
            const myResults = results
              .filter((r) => r.exam_id === exam.id)
              .sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
            const latestResult = myResults[0] || null;
            const bestResult = myResults.length
              ? myResults.reduce((a, b) => ((a.percentage || 0) >= (b.percentage || 0) ? a : b))
              : null;
            const hasSubmitted = !!latestResult;
            const canRetake = hasSubmitted && latestResult.allow_retake === true;

            return (
              <motion.div key={exam.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4 border transition-all ${
                  hasSubmitted && !canRetake
                    ? "border-border/70 opacity-95"
                    : canRetake
                    ? "border-primary/40 shadow-sm"
                    : "border-border"
                }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  hasSubmitted && !canRetake
                    ? "bg-muted text-muted-foreground border border-border"
                    : canRetake
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-secondary/10 border border-secondary/20 text-primary"
                }`}>
                  {hasSubmitted && !canRetake ? <Lock size={18} /> : <ClipboardList size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{trTitles[exam.id] || exam.title}</span>
                    {exam.section_title && (
                      <span className="text-[10px] text-muted-foreground">{exam.section_title} › {exam.topic_title}</span>
                    )}
                    {Array.isArray(exam.target_classes) && exam.target_classes.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/35 flex items-center gap-1">
                        <GraduationCap size={10} />
                        {exam.target_classes.join("، ")}
                      </span>
                    )}
                    {hasSubmitted && !canRetake && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1">
                        <Lock size={10} /> {t("examLockedBadge")}
                      </span>
                    )}
                    {canRetake && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                        <RotateCcw size={10} /> {t("retakeAllowedBadge")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><FileQuestion size={10} /> {exam.questions?.length || 0} {t("questionsCount")}</span>
                    {exam.duration_minutes && <span className="flex items-center gap-1"><Clock size={10} /> {exam.duration_minutes} {t("minutesCount")}</span>}
                    {bestResult && (
                      <span className="flex items-center gap-1 font-bold text-success">
                        <Trophy size={10} /> {t("bestResultLabel")}: {bestResult.percentage}%
                        <span className="text-muted-foreground font-normal">({moment(bestResult.submission_time).format("YYYY/MM/DD")})</span>
                      </span>
                    )}
                  </div>

                  {/* تنبيه حالة الإعادة بانتظار الأستاذ أو عند منح الإذن */}
                  {hasSubmitted && !canRetake && (
                    <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                      <AlertCircle size={12} className="text-amber-500 flex-shrink-0" />
                      <span>{t("retakeNeedsTeacherPermission")}</span>
                    </div>
                  )}
                  {canRetake && (
                    <div className="mt-2 text-[11px] text-primary flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={12} className="flex-shrink-0" />
                      <span>{t("retakeGrantedByTeacher")}</span>
                    </div>
                  )}
                </div>

                {/* Actions — قفل عند التسليم، أو إعادة فور إذن الأستاذ، أو بدء أول مرة */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                  {bestResult && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 bg-success/10 border border-success/30 text-success">
                      <CheckCircle2 size={11} /> {t("performedLabel")}
                    </span>
                  )}
                  {hasSubmitted ? (
                    canRetake ? (
                      <Link to={`/exams/${exam.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm">
                        <RotateCcw size={12} />
                        {t("retakeLabel")}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title={t("examAlreadySubmittedNoRetake")}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-muted/60 text-muted-foreground border border-border cursor-not-allowed opacity-80 select-none">
                        <Lock size={12} />
                        <span>{t("retakeNeedsTeacherPermission")}</span>
                      </button>
                    )
                  ) : (
                    <Link to={`/exams/${exam.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-success text-success-foreground hover:opacity-90 transition-all flex items-center gap-1.5">
                      {t("startExam")}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}