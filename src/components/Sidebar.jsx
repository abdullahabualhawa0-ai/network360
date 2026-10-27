import { Link, useLocation } from "react-router-dom";
import {
  BookOpen, Home, MonitorPlay, BarChart2, Users, FlaskConical,
  FileText, History, ClipboardList, FileCheck, Settings, School, GraduationCap,
  UserCog, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStudentSession } from "@/lib/studentSession";
import { useTeacherSession } from "@/lib/teacherSession";
import { useSchoolAdminSession } from "@/lib/schoolAdminSession";
import { clearSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang } from "@/lib/i18n";
import SidebarUserBadge from "@/components/SidebarUserBadge";

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const session = useStudentSession();
  const teacherSession = useTeacherSession();
  const schoolAdminSession = useSchoolAdminSession();
  useLang();
  const isSuperAdmin = user?.role === "admin";
  const isSchoolAdmin = user?.role === "school_admin" || !!schoolAdminSession;
  const isAdmin = isSuperAdmin || isSchoolAdmin;
  // الامتحانات (تأدية) للطلاب فقط — المشرفون لديهم إدارة الامتحانات ونتائجها
  const isPersonalStudent = !!session?.is_personal;
  const showExams = session && !isPersonalStudent && !isAdmin;
  // مسار الإعدادات حسب الدور النشط
  const isTeacher = !!teacherSession;
  const settingsPath = isTeacher ? "/teacher/settings"
    : schoolAdminSession ? "/admin/settings"
    : "/settings";
  // الوجهة الآمنة للشعار — لا تُحوّل الأستاذ إلى مسارات الطالب المحمية
  const homePath = isTeacher ? "/teacher/dashboard" : "/";

  const navItem = (to, icon, label) => {
    const isActive = location.pathname === to;
    return (
      <div className="px-3 pt-1">
        <Link
          to={to}
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] transition-all text-sm font-medium ${
            isActive
              ? "font-bold text-brand bg-sidebar-accent border-s-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          {icon}
          <span>{label}</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="w-80 h-full flex flex-col overflow-hidden bg-sidebar border-l border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <Link to={homePath} onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105 bg-primary">
            <BookOpen className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="font-black text-foreground text-base">{t("appName")}</h1>
            <p className="text-[11px] text-muted-foreground">{t("appTagline")}</p>
          </div>
        </Link>
        <SidebarUserBadge />
      </div>

      {/* Nav links — الدروس متاحة من الصفحة الرئيسية فقط */}
      <div className="pt-2">
        {/* الدروس والمحاكي ومختبر السيناريوهات — للطالب والأستاذ */}
        {navItem("/", <Home size={16} />, isTeacher ? t("navLessons") : t("navHome"))}
        {navItem("/network-simulator", <MonitorPlay size={16} />, t("navSimulator"))}
        {navItem("/scenario-lab", <FlaskConical size={16} />, t("navScenarioLab"))}

        {/* روابط الأستاذ — تبقى داخل مساراته المحمية */}
        {isTeacher && navItem("/teacher/dashboard", <BarChart2 size={16} />, t("teacherDashboardTitle"))}
        {isTeacher && navItem("/teacher/exams", <FileText size={16} />, t("teacherExams"))}
        {isTeacher && navItem("/teacher/students", <Users size={16} />, t("teacherStudents"))}

        {!isTeacher && navItem("/dashboard", <BarChart2 size={16} />, t("navDashboard"))}
        {!isTeacher && navItem("/lab-history", <History size={16} />, t("navLabHistory"))}
        {!isTeacher && showExams && navItem("/exams", <ClipboardList size={16} />, t("navExams"))}
        {navItem(settingsPath, <Settings size={16} />, t("navSettings"))}
        {isSuperAdmin && navItem("/admin/schools", <School size={16} />, t("navSchools"))}
        {isSuperAdmin && navItem("/admin/registration-requests", <ClipboardList size={16} />, t("navRegRequests"))}
        {isSchoolAdmin && navItem("/admin/school-students", <GraduationCap size={16} />, t("navMyStudents"))}
        {isSchoolAdmin && navItem("/admin/teachers", <UserCog size={16} />, t("navTeachers"))}
        {isSuperAdmin && navItem("/admin/students", <Users size={16} />, t("navStudentReports"))}
        {isAdmin && navItem("/admin/exams", <FileText size={16} />, t("navExamManage"))}
        {isAdmin && navItem("/admin/exam-results", <FileCheck size={16} />, t("navExamResults"))}
      </div>

      <div className="flex-1" />

      {/* تسجيل خروج المشرف (جلسة الرمز) */}
      {schoolAdminSession && (
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={() => { clearSchoolAdminSession(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all bg-destructive/10 border border-destructive/30 text-destructive">
            <LogOut size={14} /> {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}