import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, Inbox } from "lucide-react";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";

const STATUS_STYLE = {
  approved: { bg: "rgba(46,125,91,0.1)", border: "rgba(46,125,91,0.3)", color: "#2E7D5B", key: "teacherStudentsApproved" },
  pending: { bg: "rgba(214,158,46,0.1)", border: "rgba(214,158,46,0.3)", color: "#D69E2E", key: "teacherStudentsPending" },
  rejected: { bg: "rgba(201,76,76,0.1)", border: "rgba(201,76,76,0.3)", color: "#C94C4C", key: "teacherStudentsRejected" },
  disabled: { bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)", color: "#6b7280", key: "teacherStudentsDisabled" },
};

export default function TeacherStudents() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherApi("filter", "StudentProfile", { sort: "-created_date", limit: 200 })
      .then((rows) => setStudents(rows || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin" style={{ color: "#173F5F" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-4">
          <BackButton fallback="/teacher/dashboard" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-xl">{t("teacherStudentsTitle")}</h1>
            <p className="text-xs text-muted-foreground">{t("teacherStudentsPageDesc")}</p>
          </div>
        </div>

        {/* List */}
        {students.length === 0 ? (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <Inbox size={40} className="mx-auto mb-3 opacity-40" style={{ color: "#173F5F" }} />
            <h2 className="font-black text-base mb-1">{t("teacherStudentsNoStudents")}</h2>
            <p className="text-xs text-muted-foreground">{t("teacherStudentsNoStudentsDesc")}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {students.map((s, i) => {
              const st = STATUS_STYLE[s.status] || STATUS_STYLE.pending;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4 bg-card flex items-center justify-between gap-3 flex-wrap"
                  style={{ border: "1px solid hsl(var(--border))" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(47,102,144,0.08)" }}>
                      <Users size={16} style={{ color: "#2F6690" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{s.full_name || s.student_code}</div>
                      <div className="text-[10px] text-muted-foreground truncate" dir="ltr">{s.student_code}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold"
                    style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
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