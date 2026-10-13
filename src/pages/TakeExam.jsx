import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Loader2, AlertTriangle, Send, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { studentApi, useStudentSession } from "@/lib/studentSession";
import { t, useLang, useDir, getLang, LANG_DIR } from "@/lib/i18n";
import useExamTranslation from "@/lib/useExamTranslation";
import { useDialogs } from "@/components/DialogProvider";

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
  const [submitError, setSubmitError] = useState(null); // { fatal: boolean, message?: string }
  const [schoolId, setSchoolId] = useState("general");
  const { confirmDialog } = useDialogs();

  // ترجمة محتوى الامتحان آلياً عند اختيار لغة غير العربية
  const { exam: trExam, translating: examTranslating } = useExamTranslation(exam);
  const displayExam = trExam || exam;

  const answersRef = useRef({});
  const submittingRef = useRef(false);
  // الموعد النهائي (بتوقيت الجهاز) محسوب من الزمن المتبقي الذي يعيده الخادم — يصمد أمام تحديث الصفحة وتجميد التبويب
  const deadlineRef = useRef(null);

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
      let started = null;
      if (ok) {
        // بدء الامتحان على الخادم: يسجّل وقت البدء مرة واحدة ويعيد الزمن المتبقي الحقيقي
        started = await studentApi("startExam", "Exam", { data: { exam_id: examId } }).catch(() => null);
      }
      setExam(ex);
      setAllowed(!!(ok && started));
      if (ok && started) {
        deadlineRef.current = Date.now() + (started.remaining_seconds || 0) * 1000;
        setSecondsLeft(started.remaining_seconds || 0);
      }
      setLoading(false);
    })();
  }, [session?.student_id, examId]);

  // MCQ: رقم الخيار | صح/خطأ: "true"/"false" | إجابة قصيرة: نص.
  // الاختيارات تُرسل بالفهرس/الرمز (لا بالنص) كي يصح التصحيح حتى لو ترجم الطالب الامتحان للغة أخرى.
  const setAnswer = (i, val) => {
    const next = { ...answersRef.current };
    if (typeof val === "string" && val.trim() === "") delete next[i];
    else next[i] = val;
    answersRef.current = next;
    setAnswers(next);
  };

  const submit = useCallback(async () => {
    if (submittingRef.current || !exam) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // فصل الاختيارات (فهرس/رمز) عن النصوص الحرة
      const choices = {};
      const texts = {};
      (exam.questions || []).forEach((q, i) => {
        const v = answersRef.current[i];
        if (v === undefined) return;
        if (q.type === "short") texts[i] = v;
        else choices[i] = v;
      });
      // التصحيح يتم في الخادم — لا تُرسل الدرجات من المتصفح
      const res = await studentApi("submitExam", "Exam", {
        data: { exam_id: exam.id, choices, answers: texts },
      });
      if (res?.result) {
        setResult(res.result);
      } else {
        throw new Error("empty");
      }
    } catch (e) {
      submittingRef.current = false;
      setSubmitting(false);
      // أخطاء 4xx (إذن مستهلك/جلسة منتهية…) لا تفيد معها إعادة المحاولة
      const status = e?.status || e?.response?.status;
      const fatal = status >= 400 && status < 500 && status !== 429;
      setSubmitError({ fatal, message: fatal ? (e?.data?.error || e?.response?.data?.error) : null });
    }
  }, [exam]);

  // مؤقت تنازلي مع تسليم تلقائي (محسوب من الموعد النهائي لا من عدّاد تراكمي)
  useEffect(() => {
    if (loading || result || secondsLeft === null || !deadlineRef.current) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [loading, result, secondsLeft === null]);

  // انتهى الوقت → تسليم تلقائي
  useEffect(() => {
    if (loading || result || secondsLeft === null) return;
    if (secondsLeft <= 0) submit();
  }, [secondsLeft, loading, result, submit]);

  // فشل التسليم بعد انتهاء الوقت (مثلاً انقطاع الشبكة) → إعادة محاولة تلقائية كل 5 ثوانٍ
  useEffect(() => {
    if (!submitError || submitError.fatal || result || secondsLeft === null || secondsLeft > 0) return;
    const id = setTimeout(() => submit(), 5000);
    return () => clearTimeout(id);
  }, [submitError, result, secondsLeft, submit]);

  const confirmSubmit = async () => {
    const unanswered = (exam?.questions || []).length - Object.keys(answers).length;
    if (unanswered > 0 && !(await confirmDialog(`${unanswered} ${t("takeExamConfirmUnanswered")}`))) return;
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
            {result.late && <div className="text-[11px] font-bold mt-2" style={{ color: "#C94C4C" }}>{t("takeExamLate")}</div>}
          </motion.div>

          <h3 className="font-black text-sm mb-3">{t("takeExamReviewTitle")}</h3>
          <div className="space-y-2 mb-6">
            {(displayExam.questions || []).map((q, i) => {
              const r = result.review[String(i)];
              const ok = r?.is_correct;
              // عرض إجابة الطالب والإجابة الصحيحة بلغة العرض الحالية
              const tfLabel = (tok) => (tok === "true" ? t("takeExamTrue") : t("takeExamFalse"));
              const given = r?.given_index !== undefined ? (q.options?.[r.given_index] ?? r.given)
                : r?.given_token ? tfLabel(r.given_token) : r?.given;
              const model = r?.model_index !== undefined ? (q.options?.[r.model_index] ?? r.model_answer)
                : r?.model_token ? tfLabel(r.model_token) : r?.model_answer;
              return (
                <div key={i} className="rounded-xl p-3.5 bg-card"
                  style={{ border: `1px solid ${ok ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  <div className="flex items-start gap-2">
                    {ok ? <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        : <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold mb-1.5">{i + 1}. {q.text}</div>
                      <div className="text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-muted-foreground">{t("takeExamYourAnswer")}: <span className={ok ? "text-green-400" : "text-red-400"}>{given}</span></span>
                        {!ok && <span className="text-muted-foreground">{t("takeExamCorrectAnswer")}: <span className="text-green-400">{model}</span></span>}
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
        {submitError && (
          <div role="alert" className="rounded-xl p-3 text-xs font-bold flex items-center justify-between gap-3 flex-wrap"
            style={{ background: "rgba(201,76,76,0.08)", color: "#C94C4C", border: "1px solid rgba(201,76,76,0.3)" }}>
            <span>{submitError.message || t("takeExamSubmitFailed")}</span>
            {!submitError.fatal && (
              <button onClick={submit} className="px-3 py-1.5 rounded-lg text-white" style={{ background: "#C94C4C" }}>
                {t("takeExamRetry")}
              </button>
            )}
          </div>
        )}
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
                  const selected = answers[i] === oi;
                  return (
                    <button key={oi} onClick={() => setAnswer(i, oi)}
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
                {[["true", t("takeExamTrue")], ["false", t("takeExamFalse")]].map(([token, opt]) => {
                  const selected = answers[i] === token;
                  return (
                    <button key={token} onClick={() => setAnswer(i, token)}
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