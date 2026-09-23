import { Link, useLocation } from "react-router-dom";
import { Home, MonitorPlay, BarChart2, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStudentSession } from "@/lib/studentSession";
import { useTeacherSession } from "@/lib/teacherSession";
import { useSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t, useLang } from "@/lib/i18n";

/**
 * شريط تنقل سفلي ثابت — يظهر على شاشات الموبايل فقط.
 * يعرض الروابط الحرجة: الرئيسية، المحاكي، لوحة التقدم، الإعدادات.
 * يراعي الدور النشط لتحديد مسار الإعدادات الصحيح.
 */
// Module-level scroll position cache for tab preservation across navigation
const scrollCache = {};

export default function MobileTabBar() {
  const location = useLocation();
  useLang();
  const { user } = useAuth();
  const studentSession = useStudentSession();
  const teacherSession = useTeacherSession();
  const schoolAdminSession = useSchoolAdminSession();

  const isTeacher = !!teacherSession;
  const isSchoolAdmin = user?.role === "school_admin" || !!schoolAdminSession;
  const isOwner = user?.role === "admin";
  const isStudent = !!studentSession;

  // مسار الإعدادات حسب الدور
  const settingsPath = isTeacher ? "/teacher/settings"
    : (isSchoolAdmin || isOwner) ? "/admin/settings"
    : "/settings";

  // لوحة التقدم — للطلاب فقط
  const dashboardPath = isTeacher ? "/teacher/dashboard"
    : (isSchoolAdmin || isOwner) ? "/admin/schools"
    : "/dashboard";

  const tabs = [
    { to: "/", icon: Home, label: t("tabHome") },
    { to: "/network-simulator", icon: MonitorPlay, label: t("tabSimulator") },
    { to: dashboardPath, icon: BarChart2, label: t("tabDashboard") },
    { to: settingsPath, icon: Settings, label: t("tabSettings") },
  ];

  // حفظ واستعادة موضع التمرير عند التبديل بين التبويبات
  const handleTabClick = (path) => {
    scrollCache[location.pathname] = window.scrollY;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollCache[path] || 0, behavior: "instant" });
      });
    });
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 right-0 left-0 z-50 flex items-stretch justify-around safe-area-bottom"
      style={{
        background: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid #E2E8F0",
        boxShadow: "0 -2px 12px rgba(23,63,95,0.06)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            onClick={() => handleTabClick(tab.to)}
            className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-all"
            style={{ color: isActive ? "#173F5F" : "rgba(31,41,55,0.5)" }}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold" style={{ fontWeight: isActive ? 800 : 600 }}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-0.5 rounded-b-full" style={{ background: "#173F5F" }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}