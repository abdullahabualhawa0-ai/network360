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
 *
 * - الألوان عبر متغيرات الثيم فتتكيف مع الوضع الداكن.
 * - إعادة الضغط على التبويب النشط:
 *     • إذا كنت داخل صفحة فرعية → يرجع لجذر التبويب ويبدأ من أعلى الصفحة.
 *     • إذا كنت أصلاً في الجذر → يمرّر لأعلى الصفحة بسلاسة (بدون إضافة سجل تنقل مكرر).
 */
// Module-level scroll position cache for tab preservation across navigation
const scrollCache = {};

// هل المسار الحالي يخص هذا التبويب (الجذر أو أي صفحة فرعية تابعة له)؟
const belongsTo = (pathname, base) =>
  pathname === base || (base !== "/" && pathname.startsWith(base + "/"));

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

  // also: مسارات فرعية إضافية تُحسب ضمن نفس التبويب (صفحات الدروس تتبع الرئيسية)
  const tabs = [
    { to: "/", icon: Home, label: t("tabHome"), also: ["/topic"] },
    { to: "/network-simulator", icon: MonitorPlay, label: t("tabSimulator") },
    { to: dashboardPath, icon: BarChart2, label: t("tabDashboard") },
    { to: settingsPath, icon: Settings, label: t("tabSettings") },
  ];

  const isTabActive = (tab) =>
    belongsTo(location.pathname, tab.to) || (tab.also || []).some((p) => belongsTo(location.pathname, p));

  // حفظ واستعادة موضع التمرير عند التبديل بين التبويبات + إعادة التبويب للجذر عند الضغط عليه وهو نشط
  const handleTabClick = (e, tab) => {
    scrollCache[location.pathname] = window.scrollY;

    if (isTabActive(tab)) {
      // إعادة اختيار التبويب النشط → تصفير موضعه المحفوظ
      delete scrollCache[tab.to];

      if (location.pathname === tab.to) {
        // أصلاً في الجذر: لا تنقّل ولا سجل جديد، فقط ارجع لأعلى الصفحة
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // داخل صفحة فرعية: الـ Link سينقل للجذر، ونبدأ من الأعلى
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        });
      });
      return;
    }

    // تبويب مختلف: استعادة موضع التمرير المحفوظ له (السلوك السابق)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollCache[tab.to] || 0, behavior: "instant" });
      });
    });
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 right-0 left-0 z-50 flex items-stretch justify-around safe-area-bottom bg-card/[0.98] backdrop-blur-[20px] border-t border-border shadow-[0_-2px_12px_rgba(23,63,95,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.4)]"
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            onClick={(e) => handleTabClick(e, tab)}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 flex-1 transition-all ${
              isActive ? "text-primary" : "text-foreground/50"
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold" style={{ fontWeight: isActive ? 800 : 600 }}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-8 h-0.5 rounded-b-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
