import { motion } from "framer-motion";
import {
  GraduationCap, Plus, Users, UserPlus, Trash2, ArrowLeft, ArrowRight,
  Sparkles, Layers,
} from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * ClassesOverview — عرض شبكة صفوف المدرسة.
 * لا يتم عرض بيانات الطلاب هنا، بل يتم استعراض الصفوف وعدد طلاب كل صف،
 * والنقر على أي صف يدخل المشرف إلى طلاب هذا الصف تحديداً.
 */
export default function ClassesOverview({
  schoolClasses = [],
  students = [],
  onSelectClass,
  onCreateClassClick,
  onAddStudentToClass,
  onDeleteClass,
}) {
  useLang();
  const direction = useDir();
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const totalStudents = (students || []).length;
  const noClassStudents = (students || []).filter((s) => !s.class_name?.trim());

  return (
    <div className="space-y-4">
      {/* التوجيه التعريفي */}
      <div className="p-4 rounded-[14px] bg-secondary/10 border border-secondary/25 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/20 text-secondary flex-shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{t("classesTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("classesSubtitle")}</p>
          </div>
        </div>
        <button
          onClick={onCreateClassClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-sm"
        >
          <Plus size={14} /> {t("smCreateClass")}
        </button>
      </div>

      {/* في حال عدم وجود أي صفوف بعد */}
      {schoolClasses.length === 0 && noClassStudents.length === 0 ? (
        <div className="rounded-[16px] p-12 text-center bg-card border border-border">
          <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-secondary/15 text-secondary">
            <GraduationCap size={28} />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">لا توجد صفوف مضافة بعد</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
            أنشئ أول صف دراسي للمدرسة لتتمكن من إضافة الطلاب وتوزيعهم حسب الصفوف والشعب، أو قم باستيراد ملف Excel وسيتم إنشاء الصفوف تلقائياً.
          </p>
          <button
            onClick={onCreateClassClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus size={14} /> {t("smCreateClass")}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {schoolClasses.map((cls, idx) => {
            const count = (students || []).filter((s) => s.class_name?.trim() === cls).length;
            return (
              <motion.div
                key={cls}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group rounded-[14px] p-4 bg-card border border-border hover:border-secondary/50 hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-secondary/15 text-secondary flex-shrink-0 group-hover:scale-105 transition-transform">
                      <GraduationCap size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClass(cls);
                        }}
                        className="p-1.5 rounded-[8px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title={t("smDeleteClass")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-base text-foreground mb-1 group-hover:text-secondary transition-colors truncate">
                    {cls}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Users size={12} className="text-brand" />
                    <span className="font-bold text-foreground">{count}</span>
                    <span>{t("smStudentWord")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => onAddStudentToClass(cls)}
                    className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline px-1 py-1"
                  >
                    <UserPlus size={12} /> {t("smAddStudent")}
                  </button>
                  <button
                    onClick={() => onSelectClass(cls)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span>{t("enterClass")}</span>
                    <ArrowIcon size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* بطاقة خاصة للطلاب غير المرتبطين بصف (إن وجدوا) */}
          {noClassStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[14px] p-4 bg-muted/40 border border-dashed border-border hover:border-brand/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center bg-accent text-brand mb-3">
                  <Users size={18} />
                </div>
                <h4 className="font-bold text-base text-foreground mb-1">
                  {t("smNoClass")}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <span className="font-bold text-foreground">{noClassStudents.length}</span>
                  <span>{t("smStudentWord")} بدون تحديد صف</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end">
                <button
                  onClick={() => onSelectClass("__none__")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold border border-border text-foreground hover:bg-card transition-colors"
                >
                  <span>{t("enterClass")}</span>
                  <ArrowIcon size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}