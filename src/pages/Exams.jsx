import { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Loader2, Send, CheckCircle2, Trophy, Ban, FileQuestion } from "lucide-react";
import moment from "moment";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { GENERAL_SCHOOL } from "@/lib/schoolUtils";
import { t, useLang, useDir } from "@/lib/i18n";
import { useExamsListTranslation } from "@/lib/useExamTranslation";
import PullToRefresh from "@/components/PullToRefresh";

const REQ_STATUS = {
  pending: { key: "accessPending", color: "#D69E2E", bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.35)" },
  approved: { label: "", color: "#2E7D5B", bg: "rgba(46,125,91,0.1)", border: "rgba(46,125,91,0.35)" },
  rejected: { key: "accessRejected", color: "#C94C4C", bg: "rgba(201,76,76,0.1)", border: "rgba(201,76,76,0.35)" },
};

export default function Exams() {
  const session = useStudentSession();
  useLang();
  const direction = useDir();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);
  const [requesting, setRequesting] = useState(null);

  const loadData = useCallback(async () => {
    if (session?.is_personal) return; // الطالب الفردي لا يحتاج لتحميل الامتحانات
    try {
      const sid = session?.school_id || GENERAL_SCHOOL;
      setSchoolId(sid);
      const [ex, rq, rs] = await Promise.all([
        studentApi("filter", "Exam", { query: {}, sort: "-created_date", limit: 100 }),
        studentApi("filter", "ExamAccessRequest", { query: {} }),
        studentApi("filter", "ExamResult", { query: {}, sort: "-submission_time", limit: 100 }),
      ]);
      setExams(ex || []);
      setRequests(rq || []);
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

  const requestAccess = async (exam) => {
    setRequesting(exam.id);
    await studentApi("create", "ExamAccessRequest", {
      data: {
        student_name: session?.student_name || session?.student_code,
        student_email: session?.student_code,
        exam_id: exam.id,
        exam_title: exam.title,
        status: "pending",
      },
    });
    const rq = await studentApi("filter", "ExamAccessRequest", { query: {} });
    setRequests(rq || []);
    setRequesting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "#173F5F" }}>
            <ClipboardList className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("examsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("examsSubtitle")}</p>
          </div>
        </div>

        {/* Empty */}
        {visibleExams.length === 0 && (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <FileQuestion size={44} className="mx-auto mb-4 opacity-40" style={{ color: "hsl(var(--primary))" }} />
            <h2 className="font-black text-lg mb-1">{t("noExamsTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("noExamsDesc")}</p>
          </div>
        )}

        <div className="grid gap-3">
          {visibleExams.map((exam, i) => {
            const myRequests = requests
              .filter((r) => r.exam_id === exam.id)
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            const lastRequest = myRequests[0];
            const lastApproved = myRequests.find((r) => r.status === "approved");
            const myResults = results
              .filter((r) => r.exam_id === exam.id)
              .sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time));
            const latestResult = myResults[0];
            const bestResult = myResults.length
              ? myResults.reduce((a, b) => ((a.percentage || 0) >= (b.percentage || 0) ? a : b))
              : null;

            // إذن نشط لم يُستهلك بعد: أحدث موافقة بعد أحدث نتيجة
            const canTakeNow =
              lastApproved &&
              (!latestResult ||
                new Date(lastApproved.reviewed_at || lastApproved.created_date) >
                  new Date(latestResult.submission_time));

            return (
              <motion.div key={exam.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.2)" }}>
                  📋
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
                      <span className="flex items-center gap-1 font-bold" style={{ color: "#2E7D5B" }}>
                        <Trophy size={10} /> {t("bestResultLabel")}: {bestResult.percentage}%
                        <span className="text-muted-foreground font-normal">({moment(bestResult.submission_time).format("YYYY/MM/DD")})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {bestResult && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1"
                      style={{ background: "rgba(46,125,91,0.08)", border: "1px solid rgba(46,125,91,0.3)", color: "#2E7D5B" }}>
                      <CheckCircle2 size={11} /> {t("performedLabel")}
                    </span>
                  )}

                  {/* لا يوجد طلب بعد — طلب دخول أولي */}
                  {!lastRequest && (
                    <button onClick={() => requestAccess(exam)} disabled={requesting === exam.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap disabled:opacity-60"
                      style={{ background: "#173F5F" }}>
                      {requesting === exam.id ? t("sendingLabel") : <span className="flex items-center gap-1.5"><Send size={12} /> {t("requestAccess")}</span>}
                    </button>
                  )}

                  {/* الطلب الحالي معلّق — بانتظار الموافقة */}
                  {lastRequest?.status === "pending" && (
                    <span className="px-3 py-2 rounded-xl text-[10px] font-bold"
                      style={{ background: REQ_STATUS.pending.bg, border: `1px solid ${REQ_STATUS.pending.border}`, color: REQ_STATUS.pending.color }}>
                      {t("accessPending")} ⏳
                    </span>
                  )}

                  {/* آخر طلب مرفوض — يمكن إرسال طلب جديد */}
                  {lastRequest?.status === "rejected" && (
                    <button onClick={() => requestAccess(exam)} disabled={requesting === exam.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-60"
                      style={{ background: "rgba(201,76,76,0.08)", border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C" }}>
                      {requesting === exam.id ? t("sendingLabel") : <span className="flex items-center gap-1.5"><Send size={12} /> {t("requestAccess")}</span>}
                    </button>
                  )}

                  {/* إذن نشط لم يُستهلك — ابدأ التأدية */}
                  {canTakeNow && (
                    <Link to={`/exams/${exam.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap"
                      style={{ background: "#2E7D5B" }}>
                      {bestResult ? t("retakeLabel") : t("startExam")} 🚀
                    </Link>
                  )}

                  {/* تأدى الامتحان ولا يوجد إذن جديد — يجب طلب إذن لإعادة التأدية */}
                  {bestResult && !canTakeNow && lastRequest?.status !== "pending" && (
                    <button onClick={() => requestAccess(exam)} disabled={requesting === exam.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-60"
                      style={{ background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.3)", color: "#2F6690" }}>
                      {requesting === exam.id ? t("sendingLabel") : <span className="flex items-center gap-1.5"><Send size={12} /> {t("requestRetake")}</span>}
                    </button>
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