import { motion } from "framer-motion";
import { GraduationCap, Users, FileCheck, Percent, ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

export default function TeacherClassesList({
  classes = [],
  students = [],
  results = [],
  assignedClasses = [],
  onSelectClass,
}) {
  useLang();
  const direction = useDir();
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const studentsWithoutClass = students.filter((s) => !s.class_name?.trim());

  // إحصائيات عامة
  const totalStudents = students.length;
  const totalResults = results.length;
  const avgTotal = totalResults
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalResults)
    : 0;

  return (
    <div className="space-y-6">
      {/* بطاقة ملخص عام للمعلم */}
      <div className="rounded-[16px] p-5 bg-card border border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-base font-black text-foreground">{t("teacherClassesTitle")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("teacherClassesDesc")}</p>
          </div>
          {assignedClasses && assignedClasses.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold">
              <GraduationCap size={14} />
              <span>{t("teacherAssignedBadge")}:</span>
              <span className="font-semibold text-foreground">{assignedClasses.join("، ")}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          <div>
            <div className="text-[10px] text-muted-foreground">{t("smClassesCount")}</div>
            <div className="text-lg font-black text-foreground mt-0.5">{classes.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">{t("teacherStudents")}</div>
            <div className="text-lg font-black text-brand mt-0.5">{totalStudents}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">{t("examResultsTotalAttempts")}</div>
            <div className="text-lg font-black text-foreground mt-0.5">{totalResults}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">{t("examResultsAvgScore")}</div>
            <div className="text-lg font-black text-warning mt-0.5">{avgTotal}%</div>
          </div>
        </div>
      </div>

      {/* شبكة بطاقات الصفوف والشعب */}
      {classes.length === 0 && studentsWithoutClass.length === 0 ? (
        <div className="rounded-[16px] p-12 text-center bg-card border border-border">
          <GraduationCap size={44} className="mx-auto mb-3 opacity-40 text-brand" />
          <h3 className="font-black text-base text-foreground mb-1">{t("teacherStudentsNoStudents")}</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {t("teacherStudentsNoStudentsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => {
            const classStudents = students.filter((s) => s.class_name?.trim() === cls);
            const studentIds = new Set(classStudents.map((s) => s.id));
            const studentCodes = new Set(classStudents.map((s) => s.student_code?.toLowerCase()).filter(Boolean));

            const classResults = results.filter(
              (r) =>
                studentIds.has(r.student_id) ||
                (r.student_email && studentCodes.has(r.student_email.toLowerCase()))
            );

            const attempts = classResults.length;
            const avg = attempts
              ? Math.round(classResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / attempts)
              : 0;
            const passCount = classResults.filter((r) => (r.percentage || 0) >= 60).length;

            return (
              <motion.button
                key={cls}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelectClass(cls)}
                className="group rounded-[16px] p-5 bg-card border border-border text-start hover:border-brand/60 transition-all hover:bg-accent/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/15 text-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <GraduationCap size={20} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-[8px] bg-accent border border-border text-brand">
                      {classStudents.length} {t("smStudentWord")}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-foreground mb-1 group-hover:text-brand transition-colors">
                    {cls}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mb-4">
                    انقر لعرض لوحة تقدم الصف وقائمة الطلاب وعلاماتهم
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60">
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="p-2 rounded-[8px] bg-background border border-border/60">
                      <div className="text-[9px] text-muted-foreground">{t("examResultsTotalAttempts")}</div>
                      <div className="text-xs font-bold text-foreground mt-0.5">{attempts}</div>
                    </div>
                    <div className="p-2 rounded-[8px] bg-background border border-border/60">
                      <div className="text-[9px] text-muted-foreground">{t("examResultsAvgScore")}</div>
                      <div className="text-xs font-bold text-warning mt-0.5">{attempts ? `${avg}%` : "—"}</div>
                    </div>
                    <div className="p-2 rounded-[8px] bg-background border border-border/60">
                      <div className="text-[9px] text-muted-foreground">{t("examResultsPassCount")}</div>
                      <div className="text-xs font-bold text-success mt-0.5">{passCount}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-brand group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{t("enterClass")}</span>
                    <ArrowIcon size={14} />
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* بطاقة خاصة للطلاب غير المخصصين لصف */}
          {studentsWithoutClass.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectClass("__none__")}
              className="group rounded-[16px] p-5 bg-card border border-dashed border-border text-start hover:border-brand/60 transition-all hover:bg-accent/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Users size={18} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground border border-border">
                    {studentsWithoutClass.length} {t("smStudentWord")}
                  </span>
                </div>
                <h3 className="font-black text-base text-foreground mb-1 group-hover:text-brand transition-colors">
                  {t("smNoClass")}
                </h3>
                <p className="text-[11px] text-muted-foreground mb-4">
                  طلاب لم يتم إلحاقهم بأي شعبة أو صف بعد
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-brand group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{t("enterClass")}</span>
                <ArrowIcon size={14} />
              </div>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}