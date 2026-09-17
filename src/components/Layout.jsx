import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ContactUsButton from "./ContactUsButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useLang();

  return (
    <div className="min-h-screen bg-background font-main">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-3"
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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#173F5F" }}>
            <span className="text-white text-xs font-black">ش</span>
          </div>
          <span className="font-black text-sm text-primary">{t("appName")}</span>
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

      {/* Main content */}
      <div className="md:mr-80 pt-16 md:pt-0">
        <Outlet />
      </div>

      {/* حقوق النشر — السنة تتحدث تلقائياً */}
      <footer className="md:mr-80 py-4 text-center text-[11px] text-white" style={{ background: "#173F5F" }}>
        © {new Date().getFullYear()} {t("footerRights")}
      </footer>

      {/* تواصل معنا — زر عائم في كل الصفحات */}
      <ContactUsButton />
    </div>
  );
}