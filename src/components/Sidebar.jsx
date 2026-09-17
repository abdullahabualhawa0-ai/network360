import { Link, useLocation } from "react-router-dom";
import {
  BookOpen, Home, MonitorPlay, BarChart2, Users, FlaskConical,
  FileText, History, ClipboardList, FileCheck, Settings, School, GraduationCap,
  UserCog, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStudentSession } from "@/lib/studentSession";
import { useSchoolAdminSession } from "@/lib/schoolAdminSession";
import { clearSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang } from "@/lib/i18n";

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const { user } = useAuth();
  const session = useStudentSession();
  const schoolAdminSession = useSchoolAdminSession();
  useLang();
  const isSuperAdmin = user?.role === "admin";
  const isSchoolAdmin = user?.role === "school_admin" || !!schoolAdminSession;
  const isAdmin = isSuperAdmin || isSchoolAdmin;
  // الطالب الفردي (خطة شخصية بدون مدرسة فعلية) لا يرى الامتحانات
  const isPersonalStudent = !!session?.is_personal;
  const showExams = isAdmin || (session && !isPersonalStudent);

  const navItem = (to, icon, label) => {
    const isActive = location.pathname === to;
    return (
      <div className="px-3 pt-1">
        <Link
          to={to}
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group relative overflow-hidden ${
            isActive ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}`
          }
          style={isActive ? { background: "rgba(47,102,144,0.1)" } : {}}>
          {!isActive &&
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(47,102,144,0.06)" }} />
          }
          {icon}
          <span>{label}</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="w-80 h-full flex flex-col overflow-hidden"
      style={{ background: "hsl(var(--sidebar-background))", borderLeft: "1px solid hsl(var(--sidebar-border))" }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{ background: "#173F5F" }}>
            <BookOpen className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-black text-foreground text-base">{t("appName")}</h1>
            <p className="text-[11px] text-muted-foreground">{t("appTagline")}</p>
          </div>
        </Link>
      </div>

      {/* Nav links — الدروس متاحة من الصفحة الرئيسية فقط */}
      <div className="pt-2">
        {navItem("/", <Home size={16} />, t("navHome"))}
        {navItem("/network-simulator", <MonitorPlay size={16} />, t("navSimulator"))}
        {navItem("/dashboard", <BarChart2 size={16} />, t("navDashboard"))}
        {navItem("/scenario-lab", <FlaskConical size={16} />, t("navScenarioLab"))}
        {navItem("/lab-history", <History size={16} />, t("navLabHistory"))}
        {showExams && navItem("/exams", <ClipboardList size={16} />, t("navExams"))}
        {navItem("/settings", <Settings size={16} />, t("navSettings"))}
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
        <div className="p-3" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          <button onClick={() => { clearSchoolAdminSession(); window.location.href = "/login"; }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(201,76,76,0.06)", border: "1px solid rgba(201,76,76,0.2)", color: "#C94C4C" }}>
            <LogOut size={14} /> {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}