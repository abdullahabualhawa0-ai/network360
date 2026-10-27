import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Mail, KeyRound, Award, FileCheck, CheckCircle2,
  RotateCcw, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Loader2,
  Inbox, Percent, Trophy,
} from "lucide-react";
import moment from "moment";
import { t, useLang, useDir } from "@/lib/i18n";

const STATUS_STYLE = {
  approved: { cls: "bg-success/10 border-success/35 text-success", key: "teacherStudentsApproved" },
  pending: { cls: "bg-warning/10 border-warning/35 text-warning", key: "teacherStudentsPending" },
  rejected: { cls: "bg-destructive/10 border-destructive/35 text-destructive", key: "teacherStudentsRejected" },
  disabled: { cls: "bg-muted border-border text-muted-foreground", key: "teacherStudentsDisabled" },
};

export default function TeacherStudentProfileView({
  student,
  results = [],
  onBack,
  onToggleRetake,
  updatingRetakeId,
}) {
  useLang();
  const direction = useDir();
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;

  const [expandedExamId, setExpandedExamId] = useState(null);

  if (!student) return null;

  // نتائج هذا الطالب فقط — مع ضمان عرض أحدث علامة لكل امتحان دون تكرار
  const rawStudentResults = results.filter(
    (r) =>
      r.student_id === student.id ||
      r.student_id === student.user_id ||
      (r.student_email &&
        student.student_code &&
        r.student_email.toLowerCase() === student.student_code.toLowerCase())
  );

  const seenExamIds = new Set();
  const studentResults = [];
  for (const r of rawStudentResults) {
    const key = r.exam_id || r.id;
    if (!seenExamIds.has(key)) {
      seenExamIds.add(key);
      studentResults.push(r);
    }
  }

  const totalExams = studentResults.length;
  const avgScore = totalExams
    ? Math.round(studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalExams)
    : 0;
  const highestScore = totalExams
    ? Math.max(...studentResults.map((r) => r.percentage || 0))
    : 0;
  const passedExams = studentResults.filter((r) => (r.percentage || 0) >= 60).length;

  const st = STATUS_STYLE[student.status] || STATUS_STYLE.pending;

  return (
    <div className="space-y-6">
      {/* شريط التنقل العلوي */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted transition-colors"
        >
          <BackArrow size={14} />
          <span>{t("teacherBackToClass")}</span>
        </button>
        <div>
          <h2 className="text-base font-black text-foreground">{t("teacherStudentProfile")}</h2>
          <p className="text-xs text-muted-foreground">
            {student.full_name || student.student_code}
          </p>
        </div>
      </div>

      {/* بطاقة معلومات الطالب الشخصية */}
      <div className="rounded-[16px] p-5 bg-card border border-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] flex items-center justify-center bg-primary text-primary-foreground font-black text-xl flex-shrink-0 shadow-sm">
              {student.full_name ? student.full_name.charAt(0) : <User size={26} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-foreground">
                  {student.full_name || t("smNoName")}
                </h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${st.cls}`}>
                  {t(st.key)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <KeyRound size={13} className="text-brand" />
                  <strong className="text-foreground">{student.student_code}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <GraduationCap size={14} className="text-secondary" />
                  <span>{student.class_name || t("smNoClass")}</span>
                </span>
                {student.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail size={13} />
                      <span>{student.email}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* شريط الإحصائيات المختصرة للطالب */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
            <div className="p-2.5 rounded-[10px] bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground">{t("teacherStudentExamsCount")}</div>
              <div className="text-base font-black text-foreground mt-0.5">{totalExams}</div>
            </div>
            <div className="p-2.5 rounded-[10px] bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground">{t("teacherStudentAvgScore")}</div>
              <div className="text-base font-black text-warning mt-0.5">
                {totalExams ? `${avgScore}%` : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-[10px] bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground">{t("teacherStudentHighestScore")}</div>
              <div className="text-base font-black text-success mt-0.5">
                {totalExams ? `${highestScore}%` : "—"}
              </div>
            </div>
            <div className="p-2.5 rounded-[10px] bg-background border border-border/60 text-center">
              <div className="text-[10px] text-muted-foreground">{t("examResultsPassCount")}</div>
              <div className="text-base font-black text-foreground mt-0.5">{passedExams}</div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم علامات وامتحانات الطالب */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2">
            <FileCheck size={16} className="text-brand" />
            <span>علامات وامتحانات الطالب ({totalExams})</span>
          </h3>
        </div>

        {totalExams === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <Inbox size={38} className="mx-auto mb-2 opacity-40 text-brand" />
            <p className="text-sm font-bold text-foreground mb-1">{t("teacherNoExamsSubmitted")}</p>
            <p className="text-xs text-muted-foreground">
              عندما يقوم هذا الطالب بتقديم الامتحانات ستظهر نتائجه وعلاماته وتفاصيل إجاباته هنا مباشرة.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentResults.map((r, i) => {
              const passed = (r.percentage || 0) >= 60;
              const isExpanded = expandedExamId === r.id;
              const hasAnswersReview = r.answers && typeof r.answers === "object" && Object.keys(r.answers).length > 0;

              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-[16px] bg-card border border-border overflow-hidden shadow-card"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground">{r.exam_title}</h4>
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-[8px] border ${
                            passed
                              ? "bg-success/10 border-success/35 text-success"
                              : "bg-destructive/10 border-destructive/35 text-destructive"
                          }`}
                        >
                          {r.percentage}% {passed ? "(ناجح)" : "(راسب)"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        <span>{r.correct_answers}/{r.total_questions} {t("examResultsCorrectShort")}</span>
                        <span>•</span>
                        <span>{moment(r.submission_time).format("YYYY/MM/DD — HH:mm")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* زر السماح بإعادة الامتحان للأستاذ */}
                      <button
                        onClick={() => onToggleRetake(r)}
                        disabled={updatingRetakeId === r.id}
                        className={`px-3 py-1.5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          r.allow_retake
                            ? "bg-success/15 border-success/40 text-success hover:bg-success/25"
                            : "bg-secondary/10 border-secondary/30 text-secondary dark:text-primary hover:bg-secondary/20"
                        }`}
                        title={r.allow_retake ? t("retakeAllowedTooltip") : t("allowRetakeTooltip")}
                      >
                        {updatingRetakeId === r.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : r.allow_retake ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <RotateCcw size={13} />
                        )}
                        <span>{r.allow_retake ? t("retakeAllowed") : t("allowRetake")}</span>
                      </button>

                      {/* زر مراجعة إجابات الطالب */}
                      {hasAnswersReview && (
                        <button
                          onClick={() => setExpandedExamId(isExpanded ? null : r.id)}
                          className="px-3 py-1.5 rounded-[10px] text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? t("teacherHideAnswersReview") : t("teacherExamAnswersReview")}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accordion: استعراض إجابات الطالب التفصيلية */}
                  <AnimatePresence>
                    {isExpanded && hasAnswersReview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/70 bg-background/50 p-4 space-y-3"
                      >
                        <div className="text-xs font-bold text-foreground mb-2">
                          تفاصيل الأسئلة وإجابات الطالب:
                        </div>
                        {Object.entries(r.answers).map(([idx, qData]) => {
                          const isCorrect = qData.is_correct;
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-[10px] border text-xs ${
                                isCorrect
                                  ? "bg-success/5 border-success/30"
                                  : "bg-destructive/5 border-destructive/30"
                              }`}
                            >
                              <div className="font-bold text-foreground mb-1">
                                {Number(idx) + 1}. {qData.question}
                              </div>
                              <div className="grid sm:grid-cols-2 gap-1 text-[11px] mt-1.5">
                                <div>
                                  <span className="text-muted-foreground">إجابة الطالب: </span>
                                  <span className={isCorrect ? "font-bold text-success" : "font-bold text-destructive"}>
                                    {qData.given || "—"}
                                  </span>
                                </div>
                                {!isCorrect && (
                                  <div>
                                    <span className="text-muted-foreground">الإجابة الصحيحة: </span>
                                    <span className="font-bold text-success">
                                      {qData.model_answer || "—"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}