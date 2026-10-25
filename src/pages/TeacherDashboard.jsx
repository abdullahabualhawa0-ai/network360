import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Users, ClipboardList, FileCheck, LogOut, School, Settings } from "lucide-react";
import { useTeacherSession, clearTeacherSession } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";

/**
 * لوحة الأستاذ — نقطة الدخول بعد دخول الأستاذ (School Code + Teacher Code).
 * يرى الأستاذ فقط بيانات مدرسته.
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
    { icon: Settings, key: "navSettings", desc: "settingsSubtitle", to: "/teacher/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-4">
          <BackButton fallback="/student-login" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-primary text-primary-foreground">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="font-black text-xl text-foreground">{t("teacherDashboardTitle")}</h1>
              <p className="text-xs text-muted-foreground">
                {session?.teacher_name} • {session?.subject || t("teacherRole")}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold transition-all bg-destructive/10 border border-destructive/35 text-destructive hover:bg-destructive/20"
          >
            <LogOut size={13} /> {t("settingsLogout")}
          </button>
        </div>

        {/* School badge */}
        <div className="rounded-[16px] p-4 mb-6 bg-card border border-border flex items-center gap-3">
          <School size={18} className="text-brand" />
          <div>
            <div className="text-xs font-bold text-foreground">{t("teacherSchoolLabel")}</div>
            <div className="text-[10px] text-muted-foreground" dir="ltr">{session?.school_code} — {session?.teacher_code}</div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(c.to)}
              className="rounded-[16px] p-5 bg-card border border-border text-right transition-all hover:bg-accent"
            >
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 bg-accent text-brand">
                <c.icon size={18} />
              </div>
              <div className="font-bold text-sm mb-1 text-foreground">{t(c.key)}</div>
              <div className="text-[10px] text-muted-foreground">{t(c.desc)}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}