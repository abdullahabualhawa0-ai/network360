import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, Inbox, GraduationCap } from "lucide-react";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";

const STATUS_STYLE = {
  approved: { cls: "bg-success/10 border-success/35 text-success", key: "teacherStudentsApproved" },
  pending: { cls: "bg-warning/10 border-warning/35 text-warning", key: "teacherStudentsPending" },
  rejected: { cls: "bg-destructive/10 border-destructive/35 text-destructive", key: "teacherStudentsRejected" },
  disabled: { cls: "bg-muted border-border text-muted-foreground", key: "teacherStudentsDisabled" },
};

export default function TeacherStudents() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const [students, setStudents] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      teacherApi("filter", "StudentProfile", { sort: "-created_date", limit: 500 }).catch(() => []),
      teacherApi("filter", "Teacher", {}).catch(() => []),
    ])
      .then(([studentRows, teacherRows]) => {
        setStudents(studentRows || []);
        if (teacherRows?.[0]) setTeacherProfile(teacherRows[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const availableClasses = Array.from(
    new Set((students || []).map((s) => s.class_name?.trim()).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("teacherStudentsTitle")}</h1>
              <p className="text-xs text-muted-foreground">{t("teacherStudentsPageDesc")}</p>
            </div>
          </div>
          {teacherProfile?.assigned_classes && teacherProfile.assigned_classes.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold">
              <GraduationCap size={14} />
              <span>{t("teacherAssignedBadge")}:</span>
              <span className="font-semibold text-foreground">{teacherProfile.assigned_classes.join("، ")}</span>
            </div>
          )}
        </div>

        {/* Class Filter Tabs */}
        {availableClasses.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 flex-shrink-0">
              <GraduationCap size={13} /> {t("smFilterByClass")}:
            </span>
            <button
              onClick={() => setSelectedClass("all")}
              className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition-colors flex-shrink-0 ${
                selectedClass === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("smAllClasses")} ({(students || []).length})
            </button>
            {availableClasses.map((cls) => {
              const count = (students || []).filter((s) => s.class_name?.trim() === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition-colors flex-shrink-0 ${
                    selectedClass === cls
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cls} ({count})
                </button>
              );
            })}
            {(students || []).some((s) => !s.class_name?.trim()) && (
              <button
                onClick={() => setSelectedClass("__none__")}
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold border transition-colors flex-shrink-0 ${
                  selectedClass === "__none__"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("smNoClass")} ({(students || []).filter((s) => !s.class_name?.trim()).length})
              </button>
            )}
          </div>
        )}

        {/* List */}
        {students.length === 0 ? (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <Inbox size={40} className="mx-auto mb-3 opacity-40 text-brand" />
            <h2 className="font-black text-base mb-1 text-foreground">{t("teacherStudentsNoStudents")}</h2>
            <p className="text-xs text-muted-foreground">{t("teacherStudentsNoStudentsDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {students
              .filter((s) => {
                if (selectedClass === "all") return true;
                if (selectedClass === "__none__") return !s.class_name?.trim();
                return s.class_name?.trim() === selectedClass;
              })
              .map((s, i) => {
                const st = STATUS_STYLE[s.status] || STATUS_STYLE.pending;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-[16px] p-4 bg-card border border-border flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 bg-accent text-brand">
                        <Users size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate text-foreground">{s.full_name || s.student_code}</span>
                          {s.class_name && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-secondary/15 text-secondary border border-secondary/30 flex items-center gap-1">
                              <GraduationCap size={10} />
                              {s.class_name}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate" dir="ltr">{s.student_code}</div>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-[10px] text-[10px] font-bold border ${st.cls}`}>
                      {t(st.key)}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}