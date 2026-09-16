import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Loader2, AlertTriangle, Send, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { studentApi, useStudentSession } from "@/lib/studentSession";

const norm = (s) => (s || "").toString().trim().replace(/\s+/g, " ").toLowerCase();

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function TakeExam() {
  const { examId } = useParams();
  const session = useStudentSession();
  const [exam, setExam] = useState(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState("general");

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
      const ok = (reqs || []).some((r) => r.status === "approved");
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
    if (unanswered > 0 && !confirm(`لديك ${unanswered} سؤال بدون إجابة. هل تريد التسليم الآن؟`)) return;
    submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
        <p className="text-xs text-muted-foreground">جاري تحضير الامتحان...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">الامتحان غير موجود</h2>
          <Link to="/exams" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>العودة للامتحانات</Link>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center max-w-sm">
          <AlertTriangle size={36} className="text-amber-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">لا تملك موافقة دخول بعد</h2>
          <p className="text-xs text-muted-foreground mb-5">أرسل طلب دخول من صفحة الامتحانات وبعد موافقة المعلم يمكنك التأدية.</p>
          <Link to="/exams" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white inline-block"
            style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
            طلب دخول
          </Link>
        </div>
      </div>
    );
  }

  // ─── شاشة النتيجة ───────────────────────────────
  if (result) {
    const passed = result.pct >= 60;
    return (
      <div className="min-h-screen bg-background text-foreground" dir="rtl">
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
            <div className="font-black text-lg mb-1">{passed ? "🎉 ناجح — أحسنت!" : "لم تجتز — راجع الأخطاء"}</div>
            <div className="text-xs text-muted-foreground">
              {result.correct} إجابة صحيحة من {result.total} سؤال — النتيجة محفوظة في سجلك
            </div>
          </motion.div>

          <h3 className="font-black text-sm mb-3">مراجعة الإجابات</h3>
          <div className="space-y-2 mb-6">
            {(exam.questions || []).map((q, i) => {
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
                        <span className="text-muted-foreground">إجابتك: <span className={ok ? "text-green-400" : "text-red-400"}>{r?.given}</span></span>
                        {!ok && <span className="text-muted-foreground">الإجابة الصحيحة: <span className="text-green-400">{q.answer}</span></span>}
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
              جميع الامتحانات
            </Link>
            <Link to="/dashboard" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white text-center"
              style={{ background: "linear-gradient(90deg,#0891b2,#7c3aed)" }}>
              لوحة التقدم
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── شاشة الامتحان ──────────────────────────────
  const qs = exam.questions || [];
  const answeredCount = Object.keys(answers).length;
  const timeDanger = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Sticky bar */}
      <div className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-black text-xs truncate">{exam.title}</span>
          <span className="text-[10px] text-muted-foreground">({answeredCount}/{qs.length} تمت الإجابة)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black font-mono"
            style={{
              background: timeDanger ? "rgba(239,68,68,0.12)" : "rgba(6,182,212,0.1)",
              border: `1px solid ${timeDanger ? "rgba(239,68,68,0.4)" : "rgba(6,182,212,0.3)"}`,
              color: timeDanger ? "#f87171" : "#06b6d4",
            }}>
            <Clock size={13} /> {fmtTime(secondsLeft ?? 0)}
          </span>
          <button onClick={confirmSubmit} disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            تسليم
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
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
                        background: selected ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? "#06b6d4" : "rgba(255,255,255,0.08)"}`,
                        color: selected ? "#06b6d4" : "hsl(var(--foreground))",
                      }}>
                      <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] flex-shrink-0"
                        style={{ background: selected ? "#06b6d4" : "rgba(255,255,255,0.08)", color: selected ? "#fff" : "hsl(var(--muted-foreground))" }}>
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
                {["صح", "خطأ"].map((opt) => {
                  const selected = answers[i] === opt;
                  return (
                    <button key={opt} onClick={() => setAnswer(i, opt)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: selected ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${selected ? "#06b6d4" : "rgba(255,255,255,0.08)"}`,
                        color: selected ? "#06b6d4" : "hsl(var(--muted-foreground))",
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
                placeholder="اكتب إجابتك هنا..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent focus:outline-none"
                style={{ border: "1px solid rgba(6,182,212,0.3)" }} />
            )}
          </motion.div>
        ))}

        <button onClick={confirmSubmit} disabled={submitting}
          className="w-full py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-60"
          style={{ background: "linear-gradient(90deg,#059669,#10b981)" }}>
          {submitting ? "جاري التسليم..." : "تسليم الامتحان وعرض النتيجة"}
        </button>
        <Link to="/exams" className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:opacity-80">
          إلغاء والخروج <ChevronRight size={11} className="rotate-180" />
        </Link>
      </div>
    </div>
  );
}