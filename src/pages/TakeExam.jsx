import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Loader2, AlertTriangle, Send, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { t, useLang, useDir, getLang, LANG_DIR } from "@/lib/i18n";
import useExamTranslation from "@/lib/useExamTranslation";

const norm = (s) => (s || "").toString().trim().replace(/\s+/g, " ").toLowerCase();

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function TakeExam() {
  const { examId } = useParams();
  const session = useStudentSession();
  useLang();
  const direction = useDir();
  const [exam, setExam] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState("general");

  // ترجمة محتوى الامتحان آلياً عند اختيار لغة غير العربية
  const { exam: trExam, translating: examTranslating } = useExamTranslation(exam);
  const displayExam = trExam || exam;

  const answersRef = useRef({});
  const submittingRef = useRef(false);
  const startedAtRef = useRef(new Date());

  useEffect(() => {
    if (!examId) return;
    (async () => {
      const ex = await studentApi("get", "Exam", { id: examId }).catch(() => null);
      setSchoolId(session?.school_id || "general");
      if (!ex || ex.status !== "published") { setLoading(false); return; }
      const reqs = await studentApi("filter", "ExamAccessRequest", {
        query: { exam_id: examId },
      }).catch(() => []);
      const existingResults = await studentApi("filter", "ExamResult", {
        query: { exam_id: examId },
      }).catch(() => []);
      // إذن نشط = أحدث موافقة لم تُستهلك بتأدية أحدث منها
      const approvedReqs = (reqs || [])
        .filter((r) => r.status === "approved")
        .sort((a, b) => new Date(b.reviewed_at || b.created_date) - new Date(a.reviewed_at || a.created_date));
      const lastApproved = approvedReqs[0];
      const latestResult = (existingResults || [])
        .sort((a, b) => new Date(b.submission_time) - new Date(a.submission_time))[0];
      const ok =
        lastApproved &&
        (!latestResult ||
          new Date(lastApproved.reviewed_at || lastApproved.created_date) >
            new Date(latestResult.submission_time));
      setExam(ex);
      setAllowed(ok);
      if (ok) setSecondsLeft((ex.duration_minutes || 30) * 60);
      setLoading(false);
    })();
  }, [session?.student_id, examId]);

  const setAnswer = (i, val) => {
    answersRef.current = { ...answersRef.current, [i]: val };
    setAnswers(answersRef.current);
  };

  const submit = useCallback(async () => {
    if (submittingRef.current || !exam) return;
    submittingRef.current = true;
    setSubmitting(true);

    const qs = exam.questions || [];
    let correct = 0;
    const review = {};
    qs.forEach((q, i) => {
      const given = answersRef.current[i] ?? "";
      const isCorrect = q.type === "short"
        ? !!norm(given) && norm(given) === norm(q.answer)
        : !!given && given === q.answer;
      if (isCorrect) correct++;
      review[String(i)] = {
        question: q.text, type: q.type,
        given: given || "—", model_answer: q.answer,
        is_correct: isCorrect,
      };
    });
    const total = qs.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const now = new Date().toISOString();

    await studentApi("create", "ExamResult", {
      data: {
        student_name: session?.student_name || session?.student_code,
        student_email: session?.student_code,
        exam_id: exam.id, exam_title: exam.title,
        score: pct, percentage: pct, total_questions: total,
        correct_answers: correct, wrong_answers: total - correct,
        answers: review,
        start_time: startedAtRef.current.toISOString(),
        submission_time: now, status: "submitted",
      },
    });
    setResult({ pct, correct, total, review });
  }, [exam, session, schoolId]);

  // مؤقت تنازلي مع تسليم تلقائي
  useEffect(() => {
    if (loading || result || secondsLeft === null) return;
    if (secondsLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, loading, result, submit]);

  const confirmSubmit = () => {
    const unanswered = (exam?.questions || []).length - Object.keys(answers).length;
    if (unanswered > 0 && !confirm(`${unanswered} ${t("takeExamConfirmUnanswered")}`)) return;
    submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        <p className="text-xs text-muted-foreground">{t("takeExamLoading")}</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">{t("takeExamNotFound")}</h2>
          <Link to="/exams" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{t("takeExamBackToExams")}</Link>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center max-w-sm">
          <AlertTriangle size={36} className="text-amber-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">{t("takeExamNoAccess")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("takeExamNoAccessDesc")}</p>
          <Link to="/exams" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block"
            style={{ background: "#173F5F" }}>
            {t("takeExamRequestAccess")}
          </Link>
        </div>
      </div>
    );
  }

  // ─── شاشة النتيجة ───────────────────────────────
  if (result) {
    const passed = result.pct >= 60;
    return (
      <div className="min-h-screen bg-background text-foreground" dir={direction}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 text-center mb-6"
            style={{
              background: passed ? "linear-gradient(135deg,rgba(5,150,105,0.15),rgba(52,211,153,0.08))" : "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(245,158,11,0.06))",
              border: `1px solid ${passed ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.35)"}`,
            }}>
            <div className="text-5xl font-black mb-1" style={{ color: passed ? "#34d399" : "#f87171" }}>
              {result.pct}%
            </div>
            <div className="font-black text-lg mb-1">{passed ? t("takeExamPassed") : t("takeExamFailed")}</div>
            <div className="text-xs text-muted-foreground">
              {result.correct} {t("takeExamResultSummary")} {result.total} — {t("takeExamResultSaved")}
            </div>
          </motion.div>

          <h3 className="font-black text-sm mb-3">{t("takeExamReviewTitle")}</h3>
          <div className="space-y-2 mb-6">
            {(displayExam.questions || []).map((q, i) => {
              const r = result.review[String(i)];
              const ok = r?.is_correct;
              return (
                <div key={i} className="rounded-xl p-3.5 bg-card"
                  style={{ border: `1px solid ${ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  <div className="flex items-start gap-2">
                    {ok ? <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        : <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold mb-1.5">{i + 1}. {q.text}</div>
                      <div className="text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-muted-foreground">{t("takeExamYourAnswer")}: <span className={ok ? "text-green-400" : "text-red-400"}>{r?.given}</span></span>
                        {!ok && <span className="text-muted-foreground">{t("takeExamCorrectAnswer")}: <span className="text-green-400">{q.answer}</span></span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Link to="/exams" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--primary))" }}>
              {t("takeExamAllExams")}
            </Link>
            <Link to="/dashboard" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white text-center"
              style={{ background: "#173F5F" }}>
              {t("takeExamProgressBoard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── شاشة الامتحان ──────────────────────────────
  const qs = displayExam.questions || [];
  const answeredCount = Object.keys(answers).length;
  const timeDanger = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      {/* Sticky bar */}
      <div className="sticky top-0 z-20 px-4 py-3 safe-area-top flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "#173F5F", borderBottom: "1px solid rgba(47,102,144,0.3)", paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-xs truncate text-white">{displayExam.title}</span>
          <span className="text-[10px] text-white/60">({answeredCount}/{qs.length} {t("takeExamAnsweredCount")})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black font-mono"
            style={{
              background: timeDanger ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${timeDanger ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)"}`,
              color: timeDanger ? "#f87171" : "#fff",
            }}>
            <Clock size={13} /> {fmtTime(secondsLeft ?? 0)}
          </span>
          <button onClick={confirmSubmit} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
            style={{ background: "#2E7D5B" }}>
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {t("takeExamSubmit")}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {examTranslating && (
          <div className="rounded-xl p-3 text-center text-xs font-bold" style={{ background: "rgba(47,102,144,0.06)", color: "#2F6690", border: "1px solid rgba(47,102,144,0.2)" }}>
            {t("quizTranslating")}
          </div>
        )}
        {qs.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl p-5 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-start gap-2 mb-4">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
                style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4" }}>{i + 1}</span>
              <span className="text-sm font-bold leading-relaxed">{q.text}</span>
            </div>

            {/* MCQ */}
            {q.type === "mcq" && (
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => {
                  const selected = answers[i] === opt;
                  return (
                    <button key={oi} onClick={() => setAnswer(i, opt)}
                      className="w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                      style={{
                        background: selected ? "rgba(47,102,144,0.1)" : "rgba(47,102,144,0.03)",
                        border: `1px solid ${selected ? "#2F6690" : "hsl(var(--border))"}`,
                        color: selected ? "#2F6690" : "hsl(var(--foreground))",
                      }}>
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0"
                        style={{ background: selected ? "#2F6690" : "rgba(47,102,144,0.08)", color: selected ? "#fff" : "hsl(var(--muted-foreground))" }}>
                        {String.fromCharCode(0x0623 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {q.type === "truefalse" && (
              <div className="flex gap-3">
                {[t("takeExamTrue"), t("takeExamFalse")].map((opt) => {
                  const selected = answers[i] === opt;
                  return (
                    <button key={opt} onClick={() => setAnswer(i, opt)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: selected ? "rgba(47,102,144,0.1)" : "rgba(47,102,144,0.03)",
                        border: `1px solid ${selected ? "#2F6690" : "hsl(var(--border))"}`,
                        color: selected ? "#2F6690" : "hsl(var(--muted-foreground))",
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short answer */}
            {q.type === "short" && (
              <input value={answers[i] || ""} onChange={(e) => setAnswer(i, e.target.value)}
                placeholder={t("takeExamShortPh")}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                style={{ border: "1px solid hsl(var(--border))" }} />
            )}
          </motion.div>
        ))}

        <button onClick={confirmSubmit} disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-60"
          style={{ background: "#2E7D5B" }}>
          {submitting ? t("takeExamSubmitting") : t("takeExamSubmitFinal")}
        </button>
        <Link to="/exams" className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:opacity-80">
          {t("takeExamCancelExit")} <ChevronRight size={11} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}