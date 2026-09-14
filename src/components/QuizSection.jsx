import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { syncProgressToServer } from "@/lib/progressSync";
import { CheckCircle2, XCircle, RotateCcw, Trophy, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export default function QuizSection({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});

  if (!quiz) return null;

  const totalQuestions = quiz.questions.length;
  const correctAnswers = submitted
    ? quiz.questions.filter((q, i) => answers[i] === q.correct).length
    : 0;
  const score = submitted ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < totalQuestions) return;
    const finalScore = Math.round((quiz.questions.filter((q, i) => answers[i] === q.correct).length / totalQuestions) * 100);
    setSubmitted(true);

    // Save quiz result to localStorage for dashboard
    try {
      const quizId = quiz.id;
      if (quizId) {
        const existing = JSON.parse(localStorage.getItem("quiz-results") || "{}");
        existing[quizId] = { score: finalScore, completedAt: new Date().toISOString() };
        localStorage.setItem("quiz-results", JSON.stringify(existing));
      }
    } catch {}

    // Event tracking: log successful quiz completion
    base44.analytics.track({
      eventName: "quiz_completed",
      properties: {
        quiz_id: quiz.id || "unknown",
        quiz_title: quiz.title || "",
        score: finalScore,
        passed: finalScore >= 60,
      }
    });

    // Sync progress to server (for admin dashboard — students only)
    syncProgressToServer();

    window.scrollTo({ top: document.querySelector('#quiz-section')?.offsetTop - 100, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanations({});
  };

  const toggleExplanation = (index) => {
    setShowExplanations(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getScoreInfo = () => {
    if (score >= 80) return { label: "ممتاز! 🎉", color: "text-success", bg: "bg-success/10", border: "border-success/25", ring: "bg-success" };
    if (score >= 60) return { label: "جيد! استمر في التحسن", color: "text-warning", bg: "bg-warning/10", border: "border-warning/25", ring: "bg-warning" };
    return { label: "راجع الدرس مرة أخرى", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/25", ring: "bg-destructive" };
  };

  const scoreInfo = getScoreInfo();

  return (
    <div id="quiz-section" className="mt-10 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BookOpen className="text-white" size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{quiz.title}</h2>
          <p className="text-xs text-muted-foreground">{totalQuestions} أسئلة اختيار من متعدد</p>
        </div>
      </div>

      {/* Score Result */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`mb-6 p-5 rounded-2xl border ${scoreInfo.bg} ${scoreInfo.border}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${scoreInfo.ring} flex items-center justify-center shadow-md`}>
                <span className="text-white font-black text-xl">{score}%</span>
              </div>
              <div>
                <p className={`text-lg font-bold ${scoreInfo.color}`}>{scoreInfo.label}</p>
                <p className="text-sm text-muted-foreground">
                  أجبت بشكل صحيح على <strong>{correctAnswers}</strong> من <strong>{totalQuestions}</strong> سؤال
                </p>
              </div>
              <button
                onClick={handleReset}
                className="mr-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-white/70 px-3 py-2 rounded-lg border border-border"
              >
                <RotateCcw size={14} />
                <span>إعادة</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions */}
      <div className="space-y-5">
        {quiz.questions.map((question, qIndex) => {
          const userAnswer = answers[qIndex];
          const isCorrect = submitted && userAnswer === question.correct;
          const isWrong = submitted && userAnswer !== undefined && userAnswer !== question.correct;
          const isExpanded = showExplanations[qIndex];

          return (
            <div
              key={qIndex}
              className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                submitted
                  ? isCorrect ? "border-success/40 shadow-md" 
                  : isWrong ? "border-destructive/40 shadow-md" 
                  : "border-border opacity-70"
                  : "border-border"
              }`}
            >
              {/* Question */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    submitted
                      ? isCorrect ? "bg-success/10 text-success" 
                      : isWrong ? "bg-destructive/10 text-destructive" 
                      : "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {submitted ? (
                      isCorrect ? <CheckCircle2 size={14} /> : isWrong ? <XCircle size={14} /> : qIndex + 1
                    ) : qIndex + 1}
                  </span>
                  <p className="font-semibold text-foreground text-sm sm:text-base leading-relaxed">{question.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-2 mr-10">
                  {question.options.map((option, oIndex) => {
                    const isSelected = userAnswer === oIndex;
                    const isCorrectOption = submitted && oIndex === question.correct;
                    const isWrongSelected = submitted && isSelected && oIndex !== question.correct;

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, oIndex)}
                        disabled={submitted}
                        className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                          isCorrectOption
                            ? "bg-success/10 border-success text-success font-medium"
                            : isWrongSelected
                            ? "bg-destructive/10 border-destructive text-destructive"
                            : isSelected && !submitted
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : submitted
                            ? "bg-muted/30 border-border text-muted-foreground cursor-default"
                            : "bg-background border-border text-foreground hover:bg-muted hover:border-primary/50 cursor-pointer"
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          isCorrectOption ? "border-success bg-success text-white"
                          : isWrongSelected ? "border-destructive bg-destructive text-white"
                          : isSelected ? "border-primary bg-primary text-white"
                          : "border-border"
                        }`}>
                          {isCorrectOption ? <CheckCircle2 size={12} /> : isWrongSelected ? <XCircle size={12} /> : String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation toggle */}
                {submitted && (
                  <div className="mr-10 mt-3">
                    <button
                      onClick={() => toggleExplanation(qIndex)}
                      className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        isCorrect ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10"
                      }`}
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      <span>شرح الإجابة</span>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`mt-2 p-3 rounded-xl text-sm leading-relaxed ${
                            isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}>
                            💡 {question.explanation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length}/{totalQuestions} تم الإجابة عليها
          </span>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
              Object.keys(answers).length < totalQuestions
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-white hover:shadow-lg hover:scale-105"
            }`}
          >
            <Trophy size={16} />
            <span>تحقق من إجاباتي</span>
          </button>
        </div>
      )}
    </div>
  );
}