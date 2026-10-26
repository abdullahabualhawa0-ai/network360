import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Loader2, CheckCircle2, Trophy, FileQuestion } from "lucide-react";
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

  // عزل المدارس: الطالب يرى امتحانات مدرسته أو العامة فقط
  const visibleExams = exams.filter(
    (e) => !e.school_id || e.school_id === GENERAL_SCHOOL || e.school_id === schoolId
  );

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
            const bestResult = myResults.length
              ? myResults.reduce((a, b) => ((a.percentage || 0) >= (b.percentage || 0) ? a : b))
              : null;

            return (
              <motion.div key={exam.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4 border border-border">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/10 border border-secondary/20 text-primary">
                  <ClipboardList size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{trTitles[exam.id] || exam.title}</span>
                    {exam.section_title && (
                      <span className="text-[10px] text-muted-foreground">{exam.section_title} › {exam.topic_title}</span>
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
                </div>

                {/* Actions — يدخل الطالب الامتحان مباشرة بدون طلب إذن */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {bestResult && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 bg-success/10 border border-success/30 text-success">
                      <CheckCircle2 size={11} /> {t("performedLabel")}
                    </span>
                  )}
                  <Link to={`/exams/${exam.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                      bestResult
                        ? "bg-secondary/10 border border-secondary/30 text-secondary dark:text-primary"
                        : "bg-success text-success-foreground"
                    }`}>
                    {bestResult ? t("retakeLabel") : t("startExam")}
                  </Link>
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