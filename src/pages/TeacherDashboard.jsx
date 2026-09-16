import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users, ClipboardList, FileCheck, LogOut, School } from "lucide-react";
import { useTeacherSession, clearTeacherSession } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * لوحة الأستاذ — نقطة الدخول بعد دخول الأستاذ (School Code + Teacher Code).
 * يرى الأستاثذ فقط بيانات مدرسته. واجهة مبدئية؛ تُوسّع في مراحل لاحقة
 * (إدارة الامتحانات، إنشاء امتحان AI، نتائج الطلاب).
 */
export default function TeacherDashboard() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();
  const navigate = useNavigate();

  const logout = () => {
    clearTeacherSession();
    navigate("/student-login", { replace: true });
  };

  const cards = [
    { icon: ClipboardList, key: "teacherExams", desc: "teacherExamsDesc", to: "/teacher/exams" },
    { icon: Users, key: "teacherStudents", desc: "teacherStudentsDesc", to: "/teacher/students" },
    { icon: FileCheck, key: "teacherResults", desc: "teacherResultsDesc", to: "/teacher/results" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#173F5F" }}>
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl">{t("teacherDashboardTitle")}</h1>
              <p className="text-xs text-muted-foreground">
                {session?.teacher_name} • {session?.subject || t("teacherRole")}
              </p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ border: "1px solid rgba(201,76,76,0.35)", color: "#C94C4C", background: "rgba(201,76,76,0.05)" }}>
            <LogOut size={13} /> {t("settingsLogout")}
          </button>
        </div>

        {/* School badge */}
        <div className="rounded-2xl p-4 mb-6 bg-card flex items-center gap-3"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <School size={18} style={{ color: "#2F6690" }} />
          <div>
            <div className="text-xs font-bold">{t("teacherSchoolLabel")}</div>
            <div className="text-[10px] text-muted-foreground" dir="ltr">{session?.school_code} — {session?.teacher_code}</div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <motion.button key={c.key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => navigate(c.to)}
              className="rounded-2xl p-5 bg-card text-right transition-all hover:shadow-md"
              style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(47,102,144,0.1)" }}>
                <c.icon size={18} style={{ color: "#2F6690" }} />
              </div>
              <div className="font-bold text-sm mb-1">{t(c.key)}</div>
              <div className="text-[10px] text-muted-foreground">{t(c.desc)}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}