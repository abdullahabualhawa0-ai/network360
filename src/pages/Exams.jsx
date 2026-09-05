import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Clock, Loader2, Send, CheckCircle2, Trophy, Ban, FileQuestion } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { resolveStudentSchool, GENERAL_SCHOOL } from "@/lib/schoolUtils";

const REQ_STATUS = {
  pending: { label: "بانتظار الموافقة", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)" },
  approved: { label: "مسموح بالدخول", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.35)" },
  rejected: { label: "تم الرفض", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.35)" },
};

export default function Exams() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [results, setResults] = useState([]);
  const [schoolId, setSchoolId] = useState(GENERAL_SCHOOL);
  const [requesting, setRequesting] = useState(null); // exam id قيد الطلب

  useEffect(() => {
    if (!user) return;
    (async () => {
      const sid = await resolveStudentSchool(user);
      setSchoolId(sid);
      const [ex, rq, rs] = await Promise.all([
        base44.entities.Exam.filter({ status: "published" }, "-created_date", 100),
        base44.entities.ExamAccessRequest.filter({ student_id: user.id }),
        base44.entities.ExamResult.filter({ student_id: user.id }, "-submission_time", 100),
      ]);
      setExams(ex || []);
      setRequests(rq || []);
      setResults(rs || []);
      setLoading(false);
    })();
  }, [user?.id]);

  // عزل المدارس: الطالب يرى امتحانات مدرسته أو العامة فقط
  const visibleExams = exams.filter(
    (e) => !e.school_id || e.school_id === GENERAL_SCHOOL || e.school_id === schoolId
  );

  const requestAccess = async (exam) => {
    setRequesting(exam.id);
    await base44.entities.ExamAccessRequest.create({
      student_id: user.id,
      student_name: user.full_name,
      student_email: user.email,
      school_id: schoolId,
      exam_id: exam.id,
      exam_title: exam.title,
      status: "pending",
    });
    const rq = await base44.entities.ExamAccessRequest.filter({ student_id: user.id });
    setRequests(rq || []);
    setRequesting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        <p className="text-xs text-muted-foreground">جاري تحميل الامتحانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#be123c,#0891b2)" }}>
            <ClipboardList className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">الامتحانات</h1>
            <p className="text-xs text-muted-foreground">اطلب دخولاً للامتحان، وبعد موافقة المعلم ابدأ التأدية</p>
          </div>
        </div>

        {/* Empty */}
        {visibleExams.length === 0 && (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <FileQuestion size={44} className="mx-auto mb-4 opacity-40" style={{ color: "hsl(var(--primary))" }} />
            <h2 className="font-black text-lg mb-1">لا توجد امتحانات متاحة حالياً</h2>
            <p className="text-xs text-muted-foreground">سيتعين عليك الانتظار حتى ينشر المعلم امتحاناً جديد</p>
          </div>
        )}

        <div className="grid gap-3">
          {visibleExams.map((exam, i) => {
            const myRequests = requests.filter((r) => r.exam_id === exam.id);
            const lastRequest = myRequests[myRequests.length - 1];
            const myResults = results.filter((r) => r.exam_id === exam.id);
            const bestResult = myResults.length
              ? myResults.reduce((a, b) => ((a.percentage || 0) >= (b.percentage || 0) ? a : b))
              : null;

            return (
              <motion.div key={exam.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ border: "1px solid hsl(var(--border))" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  📋
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{exam.title}</span>
                    {exam.section_title && (
                      <span className="text-[10px] text-muted-foreground">{exam.section_title} › {exam.topic_title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><FileQuestion size={10} /> {exam.questions?.length || 0} سؤال</span>
                    {exam.duration_minutes && <span className="flex items-center gap-1"><Clock size={10} /> {exam.duration_minutes} دقيقة</span>}
                    {bestResult && (
                      <span className="flex items-center gap-1 font-bold" style={{ color: "#34d399" }}>
                        <Trophy size={10} /> أفضل نتيجة: {bestResult.percentage}%
                        <span className="text-muted-foreground font-normal">({moment(bestResult.submission_time).format("YYYY/MM/DD")})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {bestResult && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1"
                      style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                      <CheckCircle2 size={11} /> مؤدّى
                    </span>
                  )}

                  {!lastRequest && !bestResult && (
                    <button onClick={() => requestAccess(exam)} disabled={requesting === exam.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap disabled:opacity-60"
                      style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
                      {requesting === exam.id ? "جاري الإرسال..." : <span className="flex items-center gap-1.5"><Send size={12} /> طلب دخول</span>}
                    </button>
                  )}

                  {lastRequest?.status === "pending" && (
                    <span className="px-3 py-2 rounded-xl text-[10px] font-bold"
                      style={{ background: REQ_STATUS.pending.bg, border: `1px solid ${REQ_STATUS.pending.border}`, color: REQ_STATUS.pending.color }}>
                      {REQ_STATUS.pending.label} ⏳
                    </span>
                  )}

                  {lastRequest?.status === "rejected" && (
                    <span className="px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1"
                      style={{ background: REQ_STATUS.rejected.bg, border: `1px solid ${REQ_STATUS.rejected.border}`, color: REQ_STATUS.rejected.color }}>
                      <Ban size={11} /> تم الرفض
                    </span>
                  )}

                  {lastRequest?.status === "approved" && !bestResult && (
                    <Link to={`/exams/${exam.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap"
                      style={{ background: "linear-gradient(90deg,#059669,#0891b2)" }}>
                      ابدأ الامتحان 🚀
                    </Link>
                  )}

                  {lastRequest?.status === "approved" && bestResult && (
                    <Link to={`/exams/${exam.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                      style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
                      إعادة التأدية
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}