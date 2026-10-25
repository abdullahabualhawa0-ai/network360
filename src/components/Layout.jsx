import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import ContactUsButton from "./ContactUsButton";
import MobileTabBar from "./MobileTabBar";
import { useState, Suspense } from "react";
import { Menu, X } from "lucide-react";
import { t, useLang } from "@/lib/i18n";
import SidebarUserBadge from "@/components/SidebarUserBadge";
import BackButton from "@/components/BackButton";
import PageLoader from "@/components/PageLoader";

// الشاشات الفرعية (Nested) التي يظهر لها زر رجوع في هيدر الموبايل → وجهة الرجوع الاحتياطية.
function getNestedFallback(pathname) {
  if (pathname.startsWith("/topic/")) return "/";
  if (/^\/exams\/[^/]+/.test(pathname)) return "/exams";
  return null;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const nestedFallback = getNestedFallback(location.pathname);
  useLang();

  return (
    <div className="min-h-screen bg-background font-main text-foreground">
      {/* Mobile header — مع مساحات آمنة علوية */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-3 safe-area-top bg-card border-b border-border">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menu"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[10px] transition-all text-foreground bg-accent border border-border"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {nestedFallback && <BackButton compact fallback={nestedFallback} />}
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary">
            <span className="text-primary-foreground text-xs font-black">ش</span>
          </div>
          <span className="font-black text-sm text-brand flex-shrink-0">{t("appName")}</span>
          <div className="hidden sm:block flex-1 min-w-0 max-w-[200px]">
            <SidebarUserBadge compact />
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-terminal/70"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — padding سفلي لشريط التنقل على الموبايل */}
      <div className="md:mr-80 pt-16 md:pt-0 pb-16 md:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>

      {/* حقوق النشر */}
      <footer className="md:mr-80 py-4 text-center text-[11px] bg-muted text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} {t("footerRights")}
      </footer>

      {/* تواصل معنا — زر عائم في كل الصفحات */}
      <ContactUsButton />

      {/* شريط التنقل السفلي — موبايل فقط */}
      <MobileTabBar />
    </div>
  );
}