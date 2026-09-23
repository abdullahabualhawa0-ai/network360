import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ContactUsButton from "./ContactUsButton";
import MobileTabBar from "./MobileTabBar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { t, useLang } from "@/lib/i18n";
import SidebarUserBadge from "@/components/SidebarUserBadge";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLang();

  return (
    <div className="min-h-screen bg-background font-main">
      {/* Mobile header — مع مساحات آمنة علوية */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-3 safe-area-top"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #E2E8F0",
        }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg transition-all"
          style={{ color: "#173F5F", background: "rgba(47,102,144,0.08)", border: "1px solid rgba(47,102,144,0.25)" }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#173F5F" }}>
            <span className="text-white text-xs font-black">ش</span>
          </div>
          <span className="font-black text-sm text-primary flex-shrink-0">{t("appName")}</span>
          <div className="hidden sm:block flex-1 min-w-0 max-w-[200px]">
            <SidebarUserBadge compact />
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — padding سفلي لشريط التنقل على الموبايل */}
      <div className="md:mr-80 pt-16 md:pt-0 pb-16 md:pb-0">
        <Outlet />
      </div>

      {/* حقوق النشر — السنة تتحدث تلقائياً */}
      <footer className="md:mr-80 py-4 text-center text-[11px] text-white" style={{ background: "#173F5F" }}>
        © {new Date().getFullYear()} {t("footerRights")}
      </footer>

      {/* تواصل معنا — زر عائم في كل الصفحات */}
      <ContactUsButton />

      {/* شريط التنقل السفلي — موبايل فقط */}
      <MobileTabBar />
    </div>
  );
}