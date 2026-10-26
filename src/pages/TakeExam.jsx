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
      // بدء الامتحان مباشرة (بدون طلب إذن): يسجّل وقت البدء على الخادم ويعيد الزمن المتبقي
      const started = await studentApi("startExam", "Exam", { data: { exam_id: examId } }).catch(() => null);
      setExam(ex);
      setAllowed(!!started);
      if (started) {
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
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">{t("takeExamLoading")}</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center">
          <AlertTriangle size={36} className="text-destructive mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">{t("takeExamNotFound")}</h2>
          <Link to="/exams" className="text-xs font-bold text-primary">{t("takeExamBackToExams")}</Link>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={direction}>
        <div className="text-center max-w-sm">
          <AlertTriangle size={36} className="text-warning mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">{t("takeExamNoAccess")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("takeExamNoAccessDesc")}</p>
          <Link to="/exams" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground inline-block">
            {t("takeExamBackToExams")}
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
            className={`rounded-2xl p-8 text-center mb-6 border ${
              passed ? "bg-success/[0.08] border-success/40" : "bg-destructive/[0.08] border-destructive/35"
            }`}>
            <div className={`text-5xl font-black mb-1 ${passed ? "text-success" : "text-destructive"}`}>
              {result.pct}%
            </div>
            <div className="font-black text-lg mb-1">{passed ? t("takeExamPassed") : t("takeExamFailed")}</div>
            <div className="text-xs text-muted-foreground">
              {result.correct} {t("takeExamResultSummary")} {result.total} — {t("takeExamResultSaved")}
            </div>
            {result.late && <div className="text-[11px] font-bold mt-2 text-destructive">{t("takeExamLate")}</div>}
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
                <div key={i} className={`rounded-xl p-3.5 bg-card border ${ok ? "border-success/30" : "border-destructive/30"}`}>
                  <div className="flex items-start gap-2">
                    {ok ? <CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" />
                        : <XCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold mb-1.5">{i + 1}. {q.text}</div>
                      <div className="text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-muted-foreground">{t("takeExamYourAnswer")}: <span className={ok ? "text-success" : "text-destructive"}>{given}</span></span>
                        {!ok && <span className="text-muted-foreground">{t("takeExamCorrectAnswer")}: <span className="text-success">{model}</span></span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Link to="/exams" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center border border-border text-primary">
              {t("takeExamAllExams")}
            </Link>
            <Link to="/dashboard" className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground text-center">
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
      <div className="sticky top-0 z-20 px-4 py-3 safe-area-top flex items-center justify-between gap-3 flex-wrap bg-primary border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-xs truncate text-primary-foreground">{displayExam.title}</span>
          <span className="text-[10px] text-primary-foreground/60">({answeredCount}/{qs.length} {t("takeExamAnsweredCount")})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black font-mono border ${
            timeDanger
              ? "bg-destructive/20 border-destructive/50 text-destructive-foreground"
              : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
          }`}>
            <Clock size={13} /> {fmtTime(secondsLeft ?? 0)}
          </span>
          <button onClick={confirmSubmit} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-success text-success-foreground disabled:opacity-60">
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {t("takeExamSubmit")}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {submitError && (
          <div role="alert" className="rounded-xl p-3 text-xs font-bold flex items-center justify-between gap-3 flex-wrap bg-destructive/10 text-destructive border border-destructive/30">
            <span>{submitError.message || t("takeExamSubmitFailed")}</span>
            {!submitError.fatal && (
              <button onClick={submit} className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground">
                {t("takeExamRetry")}
              </button>
            )}
          </div>
        )}
        {examTranslating && (
          <div className="rounded-xl p-3 text-center text-xs font-bold bg-secondary/[0.06] text-secondary dark:text-primary border border-secondary/20">
            {t("quizTranslating")}
          </div>
        )}
        {qs.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl p-5 bg-card border border-border">
            <div className="flex items-start gap-2 mb-4">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 bg-primary/10 text-primary">{i + 1}</span>
              <span className="text-sm font-bold leading-relaxed">{q.text}</span>
            </div>

            {/* MCQ */}
            {q.type === "mcq" && (
              <div className="space-y-2">
                {(q.options || []).map((opt, oi) => {
                  const selected = answers[i] === oi;
                  return (
                    <button key={oi} onClick={() => setAnswer(i, oi)}
                      className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        selected
                          ? "bg-secondary/10 border-secondary text-secondary dark:text-primary"
                          : "bg-muted/40 border-border text-foreground hover:border-primary/40"
                      }`}>
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0 ${
                        selected ? "bg-secondary text-secondary-foreground" : "bg-secondary/10 text-muted-foreground"
                      }`}>
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
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        selected
                          ? "bg-secondary/10 border-secondary text-secondary dark:text-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:border-primary/40"
                      }`}>
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
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-background border border-input focus:outline-none" />
            )}
          </motion.div>
        ))}

        <button onClick={confirmSubmit} disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-sm font-black bg-success text-success-foreground disabled:opacity-60">
          {submitting ? t("takeExamSubmitting") : t("takeExamSubmitFinal")}
        </button>
        <Link to="/exams" className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:opacity-80">
          {t("takeExamCancelExit")} <ChevronRight size={11} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}