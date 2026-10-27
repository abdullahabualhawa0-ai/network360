import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Users, FileCheck, Percent, Trophy, ArrowRight, ArrowLeft,
  Search, ChevronLeft, ChevronRight, Inbox,
} from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

const STATUS_STYLE = {
  approved: { cls: "bg-success/10 border-success/35 text-success", key: "teacherStudentsApproved" },
  pending: { cls: "bg-warning/10 border-warning/35 text-warning", key: "teacherStudentsPending" },
  rejected: { cls: "bg-destructive/10 border-destructive/35 text-destructive", key: "teacherStudentsRejected" },
  disabled: { cls: "bg-muted border-border text-muted-foreground", key: "teacherStudentsDisabled" },
};

export default function TeacherClassDetailView({
  className,
  students = [],
  results = [],
  onBack,
  onSelectStudent,
}) {
  useLang();
  const direction = useDir();
  const BackArrow = direction === "rtl" ? ArrowRight : ArrowLeft;
  const DetailChevron = direction === "rtl" ? ChevronLeft : ChevronRight;

  const [search, setSearch] = useState("");

  const isNoClass = className === "__none__";
  const displayName = isNoClass ? t("smNoClass") : className;

  // طلاب هذا الصف
  const classStudents = students.filter((s) => {
    if (isNoClass) return !s.class_name?.trim();
    return s.class_name?.trim() === className;
  });

  const studentIds = new Set(classStudents.map((s) => s.id));
  const studentCodes = new Set(classStudents.map((s) => s.student_code?.toLowerCase()).filter(Boolean));

  // نتائج هذا الصف
  const classResults = results.filter(
    (r) =>
      studentIds.has(r.student_id) ||
      (r.student_email && studentCodes.has(r.student_email.toLowerCase()))
  );

  // إحصائيات علامات وتقدم هذا الصف (زي اللي بالراس بصفحة العلامات)
  const totalAttempts = classResults.length;
  const participantIds = new Set(
    classResults.map((r) => r.student_id || r.student_email?.toLowerCase()).filter(Boolean)
  );
  const participantCount = participantIds.size;
  const avgScore = totalAttempts
    ? Math.round(classResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalAttempts)
    : 0;
  const passCount = classResults.filter((r) => (r.percentage || 0) >= 60).length;

  // تصفية الطلاب حسب البحث
  const filteredStudents = classStudents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.student_code || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* شريط العنوان والتنقل */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold bg-accent border border-border text-brand hover:bg-muted transition-colors"
          >
            <BackArrow size={14} />
            <span>{t("teacherBackToClassesList")}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center bg-secondary/15 text-secondary">
                <GraduationCap size={16} />
              </div>
              <h2 className="text-base font-black text-foreground">
                {t("smClassLabel")}: {displayName}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25">
                {classStudents.length} {t("smStudentWord")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("teacherClassProgressTitle")}
            </p>
          </div>
        </div>
      </div>

      {/* لوحة التقدم بشكل عام للشعبة — مطابقة تماماً لرأس صفحة العلامات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("examResultsTotalAttempts"),
            value: totalAttempts,
            icon: <FileCheck size={16} />,
            colorCls: "text-brand",
          },
          {
            label: t("examResultsParticipants"),
            value: `${participantCount} / ${classStudents.length}`,
            icon: <Users size={16} />,
            colorCls: "text-brand",
          },
          {
            label: t("examResultsAvgScore"),
            value: totalAttempts ? `${avgScore}%` : "—",
            icon: <Percent size={16} />,
            colorCls: "text-warning",
          },
          {
            label: t("examResultsPassCount"),
            value: passCount,
            icon: <Trophy size={16} />,
            colorCls: "text-success",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-[16px] p-4 bg-card border border-border shadow-card">
            <div className={`mb-1.5 ${s.colorCls}`}>{s.icon}</div>
            <div className="text-xl font-black text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* مربع البحث والتحكم في قائمة الطلاب */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <Users size={16} className="text-brand" />
          <span>طلاب هذا الصف ({filteredStudents.length})</span>
        </h3>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute top-2.5 start-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الرمز..."
            className="w-full ps-9 pe-3 py-1.5 rounded-[10px] text-xs bg-background border border-input focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* قائمة الطلاب داخل الصف المحدد */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-[16px] p-10 text-center bg-card border border-border">
          <Inbox size={36} className="mx-auto mb-2 opacity-40 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">لا يوجد طلاب يطابقون البحث في هذا الصف</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredStudents.map((student, i) => {
            const st = STATUS_STYLE[student.status] || STATUS_STYLE.pending;

            // حساب امتحانات هذا الطالب
            const studentResults = results.filter(
              (r) =>
                r.student_id === student.id ||
                r.student_id === student.user_id ||
                (r.student_email &&
                  student.student_code &&
                  r.student_email.toLowerCase() === student.student_code.toLowerCase())
            );

            const examsTaken = studentResults.length;
            const studentAvg = examsTaken
              ? Math.round(studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / examsTaken)
              : 0;

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelectStudent(student)}
                className="group rounded-[14px] p-3.5 bg-card border border-border hover:border-brand/60 transition-all hover:bg-accent/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-accent text-brand group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground group-hover:text-brand transition-colors truncate">
                        {student.full_name || student.student_code}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[6px] bg-background border border-border text-foreground">
                        {student.student_code}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.cls}`}>
                        {t(st.key)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{student.email || "بدون بريد"}</span>
                      <span>•</span>
                      <span>{examsTaken} {t("teacherStudentExamsCount")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                  {examsTaken > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="text-end">
                        <div className="text-[9px] text-muted-foreground">{t("teacherStudentAvgScore")}</div>
                        <div
                          className={`text-xs font-black ${
                            studentAvg >= 60 ? "text-success" : "text-destructive"
                          }`}
                        >
                          {studentAvg}%
                        </div>
                      </div>
                      <div
                        className={`w-2 h-8 rounded-full ${
                          studentAvg >= 60 ? "bg-success" : "bg-destructive"
                        }`}
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60 italic">
                      لم يقدّم امتحانات بعد
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-xs font-bold text-brand group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span className="hidden sm:inline">{t("teacherViewStudentDetails")}</span>
                    <DetailChevron size={15} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}